<template>
    <div class="graph-selectors">
      <Select :columns="file.columns" :current-value="graph.type" v-on:new-value="({column}) => setGraph('type', column)"></Select>
      <Select :columns="categoryColumns" :current-value="graph.category" v-on:new-value="({column}) => setGraph('category', column)"></Select>
      <Select v-if="graph.category !== 'Četnost'" :columns="Object.keys(graph.keys)" :current-value="graph.key" v-on:new-value="({column}) => setGraph('key', column)"></Select>
    </div>
    <div style="height: 100%;">
      <div id="axis-chart" style="height: 100%;" />
    </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import fileOperations from '@/mixins/fileOperations'
import chartOperations from '@/mixins/chartOperations'
import Select from '@/components/Select'

am4core.useTheme(am4themes_animated)

export default {

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  mixins: [fileOperations, chartOperations],

  components: {
    Select
  },

  beforeUnmount () {
    this.chart.dispose()
  },

  data () {
    return {
      file: {
        columns: [],
        content: []
      },
      chart: null,
      currentChart: {},
      chartData: {},
      graphRows: [],
      graph: {
        type: null,
        category: null,
        keys: []
      }
    }
  },

  computed: {
    categoryColumns () {
      const columns = [...this.file.columns]
      columns.push('Četnost')

      return columns
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

      this.createAxisChart()
    },
    createAxisChart () {
      let data = {
        data: []
      }
      if (this.graph.category === 'Četnost') {
        data = this.countDuplicity(this.graph.type)
      } else {
        this.prepareKeys()
        for (const item in this.graph.keys[this.graph.key]) {
          if (item) {
            data.data.push({
              category: item,
              value: this.graph.keys[this.graph.key][item]
            })
          }
        }
      }

      const chart = am4core.create("axis-chart", am4charts.XYChart)
      chart.hiddenState.properties.opacity = 0
      chart.data = data.data

      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
      categoryAxis.renderer.grid.template.location = 0
      categoryAxis.dataFields.category = "category"

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
      valueAxis.min = 0
      valueAxis.max = data.max_value + (data.max_value / 5)
      valueAxis.strictMinMax = true
      valueAxis.renderer.minGridDistance = 30

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

      const series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.categoryX = "category"
      series.dataFields.valueY = "value"
      series.columns.template.tooltipText = "{categoryX}: {valueY.value}"
      series.columns.template.tooltipY = 0
      series.columns.template.strokeOpacity = 0

      series.columns.template.adapter.add("fill", (fill, target) => {
        return chart.colors.getIndex(target.dataItem.index)
      });

      this.chart = chart
    }
  }

}
</script>