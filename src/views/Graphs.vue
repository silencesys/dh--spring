<template>
  <div id="app-graphs">
    <div class="graph-selectors">
      <Select :columns="file.columns" :current-value="graph.type" v-on:new-value="({column}) => setGraph('type', column)"></Select>
      <Select :columns="file.columns" :current-value="graph.category" v-on:new-value="({column}) => setGraph('category', column)"></Select>
      <Select :columns="Object.keys(graph.keys)"  :current-value="graph.key" v-on:new-value="({column}) => setGraph('key', column)"></Select>
    </div>
    <div style="height: 100%;">
      <div id="pie-chart" style="height: 100%;" />
    </div>
  </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import darkThemeArmCharts from '@/utils/amChartsTheme'
import Store from '@/Store'
import Select from '@/components/Select'

am4core.useTheme(darkThemeArmCharts)

export default {
  name: 'Graphs',

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  components: {
    // eslint-disable-next-line vue/no-unused-components
    Select
  },

  mounted () {
    if (this.currentFile) {
      this.loadFileContent()
    }
    this.prepareFileContent()
    this.prepareKeys()
    this.setDataForPieChart(this.graph.key)
  },

  beforeUnmount () {
    this.chart.dispose()
  },

  data () {
    return {
      store: {},
      file: {
        content: [],
        columns: []
      },
      chart: null,
      currentChart: {},
      chartData: {},
      graphRows: [],
      graph: {
        type: 'Čin',
        category: 'Trest',
        key: 'usmrcení',
        keys: []
      }
    }
  },

  methods: {
    loadFileContent () {
      this.store = new Store(`${this.currentFile}.json`)
      const file = this.store.get()
      this.file.columns = file.columns.filter(Boolean)
      this.file.content = file.content
    },
    prepareFileContent () {
      // const fields = ['Jména', 'Trest']
      const fields = [
        { name: 'Jména', shared: false },
        { name: 'Trest', shared: true }
      ]
      const rows = []

      this.file.content.forEach((row) => {
        // New rows that are generated from already existing rows
        const newRows = {}
        // Columns that should be shared between newly generated rows
        const sharedColumns = {}

        for (const column of fields) {
          // Loop through the array of fields that might contain additional
          // array of values that in some cases should stay as single values
          let columnContent = row[column.name]

          if (columnContent.includes(':') || columnContent.includes(';')) {
            // Check whether column content contains any of the known separators
            // if so, split it
            columnContent = row[column.name]?.split(';')
          } else if (columnContent.includes(', ')) {
            columnContent = row[column.name]?.split(', ')
          } else {
            // Otherwise store the column value in the sharedColumns, so it
            // can be used later, if some other field conatins array of values
            if (!column.shared) {
              newRows[1] = newRows[1] || fields.reduce((a, key) => Object.assign(a, { [key.name]: '' }), {})
              newRows[1][column.name] = row[column.name]
            } else {
              sharedColumns[column.name] = row[column.name]
            }
          }

          if (Array.isArray(columnContent)) {
            // In case column value is array, loop through it and look for
            // it's ids that connects them with other fields
            for (const value of columnContent) {
              const trimmedValue = value.trim()
              // find index of : as characters before should be ID
              // @note: actually this can fail as : can be used anytime
              const separatorIndex = trimmedValue.indexOf(':')
              // get the id from the beginning of the column value
              const id = trimmedValue.slice(0, separatorIndex)
              // get the value without ID, : and trim it again for any left spaces
              const newValue = trimmedValue.slice(separatorIndex + 1).trim()

              // Assign new values to the newRows object, in case the object the
              // object does not have given key, create new one with all fields
              // but set them to empty strings. We can filter them out if some
              // values aren't filled. This should prevent agains value duplication
              // when there are two values in one field, but one value in the other
              // and the value from the other field is specificialy linked to one
              // of the values from the first field.
              newRows[id] = newRows[id] || fields.reduce((a, key) => Object.assign(a, { [key.name]: '' }), {})
              newRows[id][column.name] = newValue
            }
          }
        }

        if (Object.keys(newRows).length > 0) {
          // In case the newRows contains values, we will loop through
          // the object and assign new rows to the rows array
          for (const key in newRows) {
            // First, copy the content of the row, then replace it with
            // new values and then replace it with shared content
            // that way we should be sure, that all values are on the
            // right place
            rows.push({ ...row, ...newRows[key], ...sharedColumns })
          }
        } else {
          // Otherwise copy the row as it is
          rows.push(row)
        }
      })

      this.graphRows = rows
    },
    setGraph (field, value) {
      this.graph[field] = value
      this.prepareKeys()
      if (this.chart !== null) {
        // this.chart.dispose()
      }
      this.setDataForPieChart(this.graph.key)
    },
    prepareKeys () {
      const { type, category } = this.graph
      this.graph.keys = this.graphRows.reduce((object, value) => {
        if (value[type] !== undefined) {
          object[value[type]] = object[value[type]] || []
          if (!object[value[type]][value[category]]) {
            object[value[type]][value[category]] = 1
          } else {
            object[value[type]][value[category]]++
          }
        }
        return object
      }, Object.create(null))
    },
    setDataForPieChart (key) {
      const values = []
      // if (this.chart) this.chart.dispose()
      for (const item in this.graph.keys[key]) {
        if (item) {
          values.push({
            category: item,
            value: this.graph.keys[key][item]
          })
        }
      }

      console.log(values)

      this.chart = am4core.create("pie-chart", am4charts.PieChart);
      this.chart.data = values
      this.currentChart = this.chart.series.push(new am4charts.PieSeries())
      this.currentChart.dataFields.value = 'value'
      this.currentChart.dataFields.category = 'category'
      this.currentChart.labels.template.disabled = true;
      this.currentChart.ticks.template.disabled = true;
      this.currentChart.ticks.template.fontSize = 1;
      this.currentChart.ticks.template.text = '{category}';
      this.chart.radius = am4core.percent(70);
      this.chart.innerRadius = am4core.percent(40);
      this.chart.legend = new am4charts.Legend();
      this.chart.startAngle = 180;
      this.chart.endAngle = 360;
    }
  }
}
</script>
