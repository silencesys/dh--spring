<template>
    <div class="graph-selectors">
      <Select :columns="file.columns" :current-value="graph.type" v-on:new-value="({column}) => setGraph('type', column)"></Select>
      <Select :columns="file.columns" :current-value="graph.category" v-on:new-value="({column}) => setGraph('category', column)"></Select>
      <Select :columns="Object.keys(graph.keys)"  :current-value="graph.key" v-on:new-value="({column}) => setGraph('key', column)"></Select>
    </div>
    <div style="height: 100%;">
      <div id="pie-chart" style="height: 100%;" />
    </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import darkThemeArmCharts from '@/utils/amChartsTheme'
import Select from '@/components/Select'
import fileOperations from '@/mixins/fileOperations'
import chartOperations from '@/mixins/chartOperations'

am4core.useTheme(am4themes_animated)
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
    Select
  },

  mixins: [fileOperations, chartOperations],

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
        type: null,
        category: null,
        key: null,
        keys: []
      }
    }
  },

  methods: {
    loadInMounted () {
      this.prepareFileContent()
      this.setGraph('type', this.file.columns[0])
      this.setGraph('category', this.file.columns[1])
    },
    setGraph (field, value) {
      this.graph[field] = value
      this.prepareKeys()

      if (field === 'type') {
        this.graph.key = Object.keys(this.graph.keys)[0]
        this.setGraph('key', Object.keys(this.graph.keys)[0])
      }

      if (this.chart !== null) {
        this.chart.dispose()
      }

      this.setDataForPieChart(this.graph.key)
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

      this.chart = am4core.create("pie-chart", am4charts.PieChart)
      this.chart.data = values
      this.currentChart = this.chart.series.push(new am4charts.PieSeries())
      this.currentChart.dataFields.value = 'value'
      this.currentChart.dataFields.category = 'category'
      this.currentChart.labels.template.disabled = true
      this.currentChart.ticks.template.disabled = true
      this.currentChart.ticks.template.fontSize = 1
      this.currentChart.ticks.template.text = '{category}'
      this.chart.radius = am4core.percent(70)
      this.chart.innerRadius = am4core.percent(40)
      this.chart.legend = new am4charts.Legend()
      this.chart.startAngle = 180
      this.chart.endAngle = 360
    }
  }
}
</script>