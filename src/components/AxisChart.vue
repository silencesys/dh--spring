<template>
    <div class="graph-selectors">
      <Select :columns="file.columns" :current-value="graph.type" v-on:new-value="({column}) => setGraph('type', column)"></Select>
      <Select :columns="categoryColumns" :current-value="graph.category" v-on:new-value="({column}) => setGraph('category', column)"></Select>
      <Select v-if="graph.category !== 'Četnost'" :columns="Object.keys(graph.keys)" :current-value="graph.key" v-on:new-value="({column}) => setGraph('key', column)"></Select>
      <Select v-if="graph.category === 'Četnost'" :columns="file.columns" :current-value="graph.ignore_column" v-on:new-value="({column}) => setGraph('ignore_column', column)"></Select>
      <div class="chart-range-sliders" v-if="this.graph.dataType === 'date'">
        <input type="range" min="0" :max="Math.round(fieldRange.length / 2)" v-model="graph.range.from" step="1" class="range range--reverse">
        <input type="range" :min="Math.round(fieldRange.length / 2)" :max="fieldRange.length - 1" v-model="graph.range.to" step="1" class="range">
      </div>
      <div class="chart-tag-filter__wrapper">
        <ul class="chart-tag-filter">
          <li v-for="column in Object.keys(graph.ignore_columns)" :key="column + chartFilterTags[column].icon" :class="chartFilterTags[column].elementClass">
            {{ column }}
            <span @click.stop="toggleValue(column)"><font-awesome-icon :icon="['far', chartFilterTags[column].icon]" :class="chartFilterTags[column].class" /></span>
          </li>
        </ul>
      </div>
    </div>
    <div style="height: 100%;">
      <div id="axis-chart" style="height: 100%;" />
    </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import darkThemeArmCharts from '@/utils/amChartsTheme'
import fileOperations from '@/mixins/fileOperations'
import chartOperations from '@/mixins/chartOperations'
import Select from '@/components/Select'

am4core.useTheme(am4themes_animated)
am4core.useTheme(darkThemeArmCharts)

export default {

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  emits: {
    click: null
  },

  mixins: [fileOperations, chartOperations],

  components: {
    Select
  },

  beforeUnmount () {
    if (this.chart !== null) {
      this.chart.dispose()
    }
  },

  watch: {
    currentFile: 'loadFileContent',
    'graph.range': {
      deep: true,
      handler: 'createAxisChart'
    }
  },

  data () {
    return {
      file: {
        columns: [],
        content: []
      },
      chart: null,
      chartCursor: null,
      currentChart: {},
      chartData: {},
      graphRows: [],
      totalInCategory: {},
      graph: {
        type: null,
        category: null,
        keys: [],
        ignore_column: null,
        ignore_columns: [],
        ignore: [],
        dataType: 'text',
        range: {
          from: 0,
          to: 0,
        }
      },
      timeout: 0
    }
  },

  computed: {
    categoryColumns () {
      const columns = [...this.file.columns]
      columns.unshift('Četnost')

      return columns
    },
    chartFilterTags () {
      if (this.graph.ignore_columns) {
        return Object.keys(this.graph.ignore_columns).reduce((previous, current) => {
          const ignored = this.graph.ignore.includes(current)
          return Object.assign(previous, { [current]: {
            icon: ignored ? 'plus-circle' : 'times-circle',
            class: ignored ? 'add' : 'remove',
            elementClass: ignored ? 'chart-tag-filter--hidden' : 'chart-tag-filter--visible'
          } })
        }, {})
      }
      return []
    },
    fieldRange () {
      let items = []
      const allocatedDates = []

      if (this.graph.dataType === 'date') {
        items = this.graphRows.map(item => {
          if (item[this.graph.type]) {
            const date = this.convertCzechDateStringToUniversal(item[this.graph.type])
            if (allocatedDates.indexOf(item[this.graph.type]) < 0) {
              allocatedDates.push(item[this.graph.type])
              return date
            }
          }
          return ''
        })
        items = items.filter(Boolean)
        items = items.sort((a, b) => {
          return a - b
        })
      }

      return items
    }
  },

  methods: {
    loadAfterFile () {
      this.prepareFileContent()
      this.setGraph('type', this.file.columns[0])
      this.setGraph('category', 'Četnost')
      this.setGraph('ignore_column', this.file.columns[1])
      this.graph.range.to = this.fieldRange.length - 1
    },
    toggleValue (value) {
      const index = this.graph.ignore.findIndex(item => item === value)
      if (index > -1) {
        this.graph.ignore.splice(index, 1)
      } else {
        this.graph.ignore.push(value)
      }

      this.createAxisChart()
    },
    setGraph (field, value) {
      clearTimeout(this.timeout)
      this.graph[field] = value
      if (field === 'ignore_column' || field === 'category') {
        this.prepareIgnoredKeys(value)
      } else {
        this.prepareKeys()
      }

      if (field === 'type') {
        // this.totalInCategory = this.countPercents(value)
        this.graph.key = Object.keys(this.graph.keys)[0]
        this.checkDataType(value)
        return this.setGraph('key', Object.keys(this.graph.keys)[0])
      }

      this.timeout = setTimeout(() => {
        this.createAxisChart()
      }, 100)
    },
    checkDataType (field) {
      const index = this.file.setDataTypes.findIndex(item => item.name === field)
      if (index > -1) {
        this.graph.dataType = this.file.setDataTypes[index].type.key
      } else {
        this.graph.dataType = 'text'
      }
    },
    createAxisChart () {
      if (this.chart !== null) {
        this.chart.dispose()
      }

      let data = {
        data: []
      }
      if (this.graph.category === 'Četnost') {
        data = this.countDuplicity(this.graph.type)
      } else {
        this.prepareKeys()
        for (const item in this.graph.keys[this.graph.key]) {
          if (item) {
            if (!this.graph.ignore.includes(item)) {
              console.log(item, this.graph.keys[this.graph.key][item])
              data.data.push({
                category: item,
                value: this.graph.keys[this.graph.key][item] // / this.totalInCategory[this.graph.key]) * 100
              })
            }
          }
        }
      }

      const chart = am4core.create("axis-chart", am4charts.XYChart)
      chart.hiddenState.properties.opacity = 0
      chart.data = data.data
      chart.allowDecimals = false

      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
      categoryAxis.renderer.grid.template.location = 0
      categoryAxis.dataFields.category = "category"

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
      valueAxis.min = 0
      valueAxis.max = data.max_value
      valueAxis.extraMax = 0.1;
      valueAxis.renderer.minGridDistance = 50
      valueAxis.adjustLabelPrecision = false
      valueAxis.maxPrecision = 0

      if (data.max_value > 100 && data.difference <= 0.5) {
        // axis break
        const axisBreak = valueAxis.axisBreaks.create()
        axisBreak.startValue = data.min_value * 2
        axisBreak.endValue = data.max_value / 1.1
        axisBreak.breakSize = data.difference / 2

        chart.yAxes.push(new am4charts.ValueAxis())

        const hoverState = axisBreak.states.create("hover")
        hoverState.properties.breakSize = 1
        hoverState.properties.opacity = 0.1
        hoverState.transitionDuration = 1500

        axisBreak.defaultState.transitionDuration = 1000
      }

      const chartConstructor = {
        date: 'drawDateChart',
        text: 'drawBarChart'
      }

      this[chartConstructor[this.graph.dataType]](chart)
    },
    drawDateChart (chart) {
      const series = chart.series.push(new am4charts.LineSeries())
      series.dataFields.categoryX = "category"
      series.dataFields.valueY = "value"
      series.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.percent.formatNumber('#.00')}%[/] ({valueY})"
      series.legendSettings.itemValueText = "{valueY.percent}%"
      series.calculatePercent = true
      series.smoothing = "monotoneX"

      const bullet = series.bullets.push(new am4charts.CircleBullet())
      bullet.circle.stroke = am4core.color("#fff")
      bullet.circle.strokeWidth = 2
      bullet.circle.radius = 7;
      bullet.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.percent.formatNumber('#.00')}%[/] ({valueY})"

      this.chart = chart
    },
    drawBarChart (chart) {
      const series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.categoryX = "category"
      series.dataFields.valueY = "value"
      // series.columns.template.tooltipText = "{categoryX}: {valueY.value}"
      series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.percent.formatNumber('#.00')}%[/] ({valueY})"
      series.columns.template.tooltipY = 0
      series.columns.template.strokeOpacity = 0
      series.legendSettings.itemValueText = "{valueY.percent}%"
      series.calculatePercent = true


      series.columns.template.adapter.add("fill", (fill, target) => {
        return chart.colors.getIndex(target.dataItem.index)
      });

      this.chart = chart
    }
  }

}
</script>