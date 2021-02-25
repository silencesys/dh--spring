<template>
    <div class="graph-selectors chart-filters">
      <Select :columns="file.columns" v-model="chart.filters.category" @update:modelValue="(value) => setChartFilterCategory(value)" />
      <Select :columns="valueColumns" v-model="chart.filters.value" @update:modelValue="(value) => setChartFilterValue(value)" />
      <Select :columns="subCategories" v-model="chart.filters.subCategory" @update:modelValue="(value) => setChartFilterSubCategory(value)" />
      <div class="chart-range-sliders" v-if="this.chart.categoryDataType === 'date'">
        <span>{{ fieldRange[0] }}</span>
        <Slider :min="0" :max="fieldRange.length - 1" v-model="range" :step="1" style="width: 100%" :tooltips="false" />
        <span>{{ fieldRange[fieldRange.length - 1] }}</span>
      </div>
      <Toggle v-if="this.chart.categoryDataType === 'date'" el-id="split-values" v-model="this.chart.split" style="justify-self: end;">
        {{ $t('chart.split_values') }}
      </Toggle>
    <div class="chart-tag-filter__wrapper">
      <ul class="chart-tag-filter">
        <li v-for="value in values" :key="value + ignoredValuesStates[value].icon" :class="ignoredValuesStates[value].elementClass">
          {{ value }}
          <span @click.stop="toggleValue(value)">
            <font-awesome-icon :icon="['far', ignoredValuesStates[value].icon]" :class="ignoredValuesStates[value].class" />
          </span>
        </li>
      </ul>
    </div>
    </div>
    <div style="height: 100%;">
      <div id="axis-chart" style="height: 100%;" />
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import darkThemeArmCharts from '@/utils/amChartsTheme'
import fileOperations from '@/mixins/fileOperations'
import chartOperations from '@/mixins/chartOperations'
import Select from '@/components/Select'
import Toggle from '@/components/Toggle'
import Slider from '@vueform/slider'

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
    Select, Toggle, Slider
  },

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

  watch: {
    currentFile: 'loadFileContent',
    range: {
      deep: true,
      handler: 'updateChartRange'
    },
    'chart.split': 'prepareChartFilters'
  },

  data () {
    return {
      drawChartTimeout: 0,
      rangeUpdateTimer: 0,
      range: [0],
      file: {
        columns: [],
        content: []
      },
      chart: {
        split: false,
        instance: null,
        filters: {
          category: null,
          value: null,
          subCategory: null,
          ignoredolumn: null
        },
        rows: [],
        subCategories: [],
        values: [],
        ignoredValues: [],
        categoryDataType: 'text',
        categoryRange: {
          from: 0,
          to: 0
        }
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
      if (this.chart.filters.value === this.frequencyColumn) {
        return this.file.columns.filter(column => column !== this.chart.filters.category)
      }
      return Object.keys(this.chart.subCategories)
    },
    values () {
      return Object.keys(this.chart.values)
    },
    ignoredValuesStates () {
      if (this.values) {
        return this.values.reduce((previous, current) => {
          const ignored = this.chart.ignoredValues.includes(current)
          return Object.assign(previous, { [current]: {
            icon: ignored ? 'plus-circle' : 'times-circle',
            class: ignored ? 'add' : 'remove',
            elementClass: ignored ? 'chart-tag-filter--hidden' : 'chart-tag-filter--visible'
          }})
        }, {})
      }
      return []
    },
    fieldRange () {
      let range = []
      if (this.chart.categoryDataType === 'date') {
        range = this.getOnlyUniqueValues(
          this.chart.rows,
          this.chart.ignoredValues,
          this.chart.filters
        ).filter(Boolean)
        range.sort(this.sortByDate)
      }
      return range
    }
  },

  methods: {
    /**
     * This method is called after successfull loading of the file in
     * fileOperations mixin. This way we can be sure that the file is already
     * laoded in the memory and we can work with it.
     */
    loadAfterFile () {
      // Prepare rows for chart rendering
      this.chart.rows = this.prepareRowsForChart(this.chartData, this.file.arrayableColumns)

      // Set default choices for every select
      this.setChartFilterCategory(this.file.columns[0])
      this.setChartFilterValue(this.frequencyColumn)
      this.setChartFilterSubCategory(this.subCategories[0])

      this.emitDocumentFiltersSharingStatus()
    },
    updateChartRange () {
      clearTimeout(this.rangeUpdateTimer)

      const previousTo = this.chart.categoryRange.to

      this.chart.categoryRange.from = this.convertCzechDateString(this.fieldRange[this.range[0]])
      this.chart.categoryRange.to = this.convertCzechDateString(this.fieldRange[this.range[1]])

      if (previousTo !== 0) {
        this.rangeUpdateTimer = setTimeout(() => {
          this.prepareChartFilters()
        }, 500)
      }
    },
    /**
     * Set chart category filter, validate data type and call chart render.
     *
     * @param {string} value
     */
    setChartFilterCategory (value) {
      this.chart.filters.category = value
      this.chart.subCategories = this.countFrequencyBasedOnColumn(this.chart.filters.category, this.chart.rows)
      this.setChartFilterSubCategory(this.subCategories[0], false)

      this.validateCategoryDataType()

      if (this.fieldRange.length > 0 && this.range[1] === undefined) {
        this.range.push(this.fieldRange.length - 1)
      }

      this.prepareChartFilters()
    },
    /**
     * Set chart value filter, set sub-category to the first value and render chart.
     *
     * @param {string} value
     */
    setChartFilterValue (value) {
      this.chart.filters.value = value
      this.chart.values = this.countFrequencyBasedOnColumn(this.chart.filters.value, this.chart.rows)
      this.setChartFilterSubCategory(this.subCategories[0], false)

      this.prepareChartFilters()
    },
    /**
     * Set chart sub-category filter and render chart.
     *
     * @param {string} value
     */
    setChartFilterSubCategory (value, drawChart = true) {
      this.chart.filters.subCategory = value

      if (this.chart.filters.value === this.frequencyColumn) {
        this.chart.values = this.countFrequencyBasedOnColumn(this.chart.filters.subCategory, this.chart.rows)
      }

      if (drawChart) {
        this.prepareChartFilters()
      }
    },
    /**
     * Prepare chart for rendering.
     */
    prepareChartFilters () {
      // Clear timeout that holds chart drawing
      clearTimeout(this.drawChartTimeout)

      this.drawChartTimeout = setTimeout(() => {
        this.drawAxisChart()
      }, 100)
    },
    /**
     * Search for category data type in defined data types, so later on we can
     * render the right chart.
     */
    validateCategoryDataType () {
      const index = this.file.setDataTypes.findIndex(column => column.name === this.chart.filters.category)

      if (index > -1) {
        this.chart.categoryDataType = this.file.setDataTypes[index].type.key
      } else {
        // In case category was not defined in data types, always fallback to text.
        this.chart.categoryDataType = 'text'
      }
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
    drawAxisChart () {
      this.disposeExistingChartInstance()

      let data = []
      if (this.chart.filters.value === this.frequencyColumn) {
        data = this.getFrequency(this.chart, this.chart.split)
      } else {
        data = this.convertRowsToChartData(this.chart).data
      }

      const chart = am4core.create('axis-chart', am4charts.XYChart)
      chart.hiddenState.properties.opacity = 0
      chart.data = data
      chart.allowDecimals = false

      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
      categoryAxis.renderer.grid.template.location = 0
      categoryAxis.dataFields.category = 'category'

      const max = Math.max.apply(Math, data.map(o => o.value))

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
      valueAxis.min = 0
      valueAxis.max = max
      valueAxis.extraMax = 0.1;
      valueAxis.renderer.minGridDistance = 50
      valueAxis.adjustLabelPrecision = false
      valueAxis.maxPrecision = 0

      const options = chart.exporting.getFormatOptions('png')
      options.scale = 3
      options.quality = 1
      chart.exporting.setFormatOptions('png', options)
      chart.exporting.backgroundColor = am4core.color("#f00", 0)
      chart.exporting.filePrefix = 'spring'

      // Define methods that can be used to draw the chart based on the data type.
      const chartConstructor = {
        date: 'drawDateChart',
        text: 'drawBarChart'
      }

      // Store the chart instance in the data object, so we can manipulate with
      // it later on.
      this.chart.instance = this[chartConstructor[this.chart.categoryDataType]](chart, data)
    },
    createSerires(chart, field, name) {
      const series = chart.series.push(new am4charts.LineSeries())
      series.name = name
      series.dataFields.categoryX = "category"
      series.dataFields.valueY = field
      series.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.percent.formatNumber('#.00')}%[/] ({valueY})"
      series.legendSettings.itemValueText = "{valueY.percent}%"
      series.calculatePercent = true
      series.smoothing = "monotoneX"

      const bullet = series.bullets.push(new am4charts.CircleBullet())
      bullet.circle.stroke = am4core.color("#fff")
      bullet.circle.strokeWidth = 2
      bullet.circle.radius = 7;
      bullet.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.percent.formatNumber('#.00')}%[/] ({valueY})"
    },
    drawDateChart (chart) {
      if (this.chart.split) {
        for (const column of Object.keys(this.chart.values)) {
            this.createSerires(chart, column, column)
        }
      } else {
        this.createSerires(chart, 'value', this.chart.filters.subCategory)
      }

      return chart
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

      return chart
    },
    toggleValue (value) {
      const index = this.chart.ignoredValues.findIndex(item => item === value)
      if (index > -1) {
        this.chart.ignoredValues.splice(index, 1)
      } else {
        this.chart.ignoredValues.push(value)
      }

      this.prepareChartFilters()
    },
  }

}
</script>