<template>
    <div class="graph-selectors">
      <Select
        :columns="file.columns"
        v-model="chart.filters.category"
        @update:modelValue="(value) => setChartFilterCategory(value)"
      />
      <Select
        :columns="valueColumns"
        v-model="chart.filters.value"
        @update:modelValue="(value) => setChartFilterValue(value)"
      />
      <Select
        v-if="chart.filters.value !== frequencyColumn"
        :columns="subCategories"
        v-model="chart.filters.subCategory"
        @update:modelValue="(value) => setChartFilterSubCategory(value)"
      />
    </div>
    <div style="height: 100%;">
      <div id="pie-chart" style="height: 100%;" />
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
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
  name: 'PieChart',

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  components: {
    Select
  },

  watch: {
    currentFile: 'loadFileContent',
  },

  mixins: [fileOperations, chartOperations],

  mounted () {
    ipcRenderer.on('export-chart', () => {
      if (this.chart.instance) {
        this.chart.instance.exporting.export('png')
      }
    });
  },

  beforeUnmount () {
    this.disposeExistingChartInstance()
  },

  data () {
    return {
      store: {},
      file: {
        content: [],
        columns: []
      },
      chart: {
        instance: null,
        rows: [],
        values: [],
        filters: {
          category: null,
          value: null,
          subCategory: null
        },
        subCategories: [],
        ignoredValues: []
      },
      chartTimeout: 0,
      graphRows: [],
      graph: {
        type: null,
        category: null,
        key: null,
        keys: []
      }
    }
  },

  computed: {
    frequencyColumn () {
      return this.$t('chart.column.frequency')
    },
    valueColumns () {
      const columns = [...this.file.columns]
      columns.unshift(this.frequencyColumn)

      return columns
    },
    subCategories () {
      return Object.keys(this.chart.subCategories)
    }
  },

  methods: {
    loadAfterFile () {
      this.chart.rows = this.prepareRowsForChart(this.chartData, this.file.arrayableColumns)

      // Set default choices for every select
      this.setChartFilterCategory(this.file.columns[0])
      this.setChartFilterValue(this.file.columns[1])
      this.setChartFilterSubCategory(this.subCategories[0])

      this.emitDocumentFiltersSharingStatus()
    },
    setChartFilterCategory (value) {
      this.chart.filters.category = value
      this.chart.subCategories = this.countFrequencyBasedOnColumn(this.chart.filters.category, this.chart.rows)
      this.setChartFilterSubCategory(this.subCategories[0], false)

      this.renderChart()
    },
    setChartFilterValue (value) {
      this.chart.filters.value = value
      this.chart.values = this.countFrequencyBasedOnColumn(this.chart.filters.value, this.chart.rows)
      this.setChartFilterSubCategory(this.subCategories[0], false)

      this.renderChart()
    },
    setChartFilterSubCategory (value, drawChart = true) {
      this.chart.filters.subCategory = value

      if (this.chart.filters.value === this.frequencyColumn) {
        this.chart.values = this.countFrequencyBasedOnColumn(this.chart.filters.subCategory, this.chart.rows)
      }

      if (drawChart) {
        this.renderChart()
      }
    },
    renderChart () {
      clearTimeout(this.chartTimeout)

      this.chartTimeout = setTimeout(() => {
        this.drawPieChart()
      }, 100)
    },
    /**
     * Dispose any existing chart instance.
     */
    disposeExistingChartInstance () {
      if (this.chart.instance !== null) {
        try {
          this.chart.instance.dispose()
          this.chart.instance = null
        } catch (error) {
          console.error('Chart instance could not be disposed!')
          console.error(error)
        }
      }
    },
    drawPieChart () {
      this.disposeExistingChartInstance()

      let values = []
      const chart = am4core.create("pie-chart", am4charts.PieChart)

      if (this.chart.filters.value === this.frequencyColumn) {
        values = this.getFrequency(this.chart, this.chart.split)
        chart.legend = Object.keys(this.subCategories).length < 28 ? new am4charts.Legend() : false
      } else {
        values = this.convertRowsToChartData(this.chart).data
        chart.legend = Object.keys(this.chart.values).length < 28 ? new am4charts.Legend() : false
      }

      chart.data = values
      chart.radius = am4core.percent(70)
      chart.innerRadius = am4core.percent(40)
      chart.startAngle = 180
      chart.endAngle = 360

      const pieChart = chart.series.push(new am4charts.PieSeries())
      pieChart.dataFields.value = 'value'
      pieChart.dataFields.category = 'category'
      pieChart.labels.template.disabled = true
      pieChart.ticks.template.disabled = true
      pieChart.ticks.template.fontSize = 1
      pieChart.ticks.template.text = '{category}'

      const options = chart.exporting.getFormatOptions('png')
      options.scale = 3
      options.quality = 1
      chart.exporting.setFormatOptions('png', options)
      chart.exporting.backgroundColor = am4core.color("#f00", 0)
      chart.exporting.filePrefix = 'spring'

      this.chart.instance = chart
    }
  }
}
</script>