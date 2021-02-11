<template>
  <div id="app-graphs">
    <div id="pie-chart" />
  </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import darkThemeArmCharts from '@/utils/amChartsTheme'
import Store from '@/Store'

am4core.useTheme(darkThemeArmCharts)

export default {
  name: 'Graphs',

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  mounted () {
    if (this.currentFile) {
      this.loadFileContent()
    }

    this.chart = am4core.create("pie-chart", am4charts.PieChart);

    this.setDataForPieChart()
  },

  data () {
    return {
      store: {},
      file: {
        content: {},
        columns: {}
      },
      chart: {},
      currentChart: {},
      chartData: {}
    }
  },

  methods: {
    loadFileContent () {
      this.store = new Store(`${this.currentFile}.json`)
      const file = this.store.get()
      this.file.columns = file.columns.filter(Boolean)
      this.file.content = file.content
    },
    setDataForPieChart () {
      const judges = this.file.content.reduce((object, value) => {
        object[value.Soudce] = object[value.Soudce] || []
        if (!object[value.Soudce][value.Trest]) {
          object[value.Soudce][value.Trest] = 1
        } else {
          object[value.Soudce][value.Trest]++
        }
        return object
      }, Object.create(null))

      const judge = []
      for (const item in judges['Knecht']) {
        judge.push({
          typ: item,
          count: judges['Knecht'][item]
        })
      }

      console.log(judge)

      this.chart.data = judge
      this.currentChart = this.chart.series.push(new am4charts.PieSeries())
      this.currentChart.dataFields.value = 'count'
      this.currentChart.dataFields.category = 'typ'
    }
  }
}
</script>
