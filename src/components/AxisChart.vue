<template>
    <div class="graph-selectors">
      <Select :columns="file.columns" v-model="chart.filters.category" @update:modelValue="(value) => setChartFilterCategory(value)" />
      <Select :columns="valueColumns" v-model="chart.filters.value" @update:modelValue="(value) => setChartFilterValue(value)" />
      <Select :columns="subCategories" v-model="chart.filters.subCategory" @update:modelValue="(value) => setChartFilterSubCategory(value)" />
      <!-- <Select :columns="valueColumns" :current-value="graph.category" v-on:new-value="({column}) => drawChart('value', column)"></Select>
      <Select v-if="chart.filters.category !== 'Četnost'" :columns="Object.keys(graph.keys)" :current-value="graph.key" v-on:new-value="({column}) => drawChart('subCategory', column)"></Select>
      <Select v-if="graph.category === 'Četnost'" :columns="file.columns" :current-value="graph.ignore_column" v-on:new-value="({column}) => drawChart('ignoredColumn', column)"></Select>
      <div class="chart-range-sliders" v-if="this.graph.dataType === 'date'">
        <input type="range" min="0" :max="Math.round(fieldRange.length / 2)" v-model="graph.range.from" step="1" class="range range--reverse">
        <input type="range" :min="Math.round(fieldRange.length / 2)" :max="fieldRange.length - 1" v-model="graph.range.to" step="1" class="range">
      </div>
       -->
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
    this.disposeExistingChartInstance()
  },

  watch: {
    currentFile: 'loadFileContent',
  },

  data () {
    return {
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
      // New variables
      drawChartTimeout: 0,
      file: {
        columns: [],
        content: []
      },
      chart: {
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
    valueColumns () {
      const columns = [...this.file.columns]
      columns.unshift('Četnost')

      return columns
    },
    subCategories () {
      if (this.chart.filters.value === 'Četnost') {
        return this.file.columns
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
      return []
      // let items = []
      // const allocatedDates = []

      // if (this.graph.dataType === 'date') {
      //   items = this.graphRows.map(item => {
      //     if (item[this.graph.type]) {
      //       const date = this.convertCzechDateStringToUniversal(item[this.graph.type])
      //       if (allocatedDates.indexOf(item[this.graph.type]) < 0) {
      //         allocatedDates.push(item[this.graph.type])
      //         return date
      //       }
      //     }
      //     return ''
      //   })
      //   items = items.filter(Boolean)
      //   items = items.sort((a, b) => {
      //     return a - b
      //   })
      // }

      // return items
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
      this.chart.rows = this.prepareRowsForChart(this.file)

      // Set default choices for every select
      this.setChartFilterCategory(this.file.columns[3])
      this.setChartFilterValue('Četnost')
      this.setChartFilterSubCategory(this.subCategories[0])

      // this.graph.range.to = this.fieldRange.length - 1
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

      if (this.chart.filters.value === 'Četnost') {
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
        } catch (error) {
          console.error('Chart instance could not be disposed!')
          console.error(error)
        }
      }
    },
    drawAxisChart () {
      this.disposeExistingChartInstance()

      let data = []
      if (this.chart.filters.value === 'Četnost') {
        data = this.getFrequency(this.chart)
      } else {
        data = this.convertRowsToChartData(this.chart).data
      }



      const chart = am4core.create("axis-chart", am4charts.XYChart)
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

      // Define methods that can be used to draw the chart based on the data type.
      const chartConstructor = {
        date: 'drawDateChart',
        text: 'drawBarChart'
      }

      // Store the chart instance in the data object, so we can manipulate with
      // it later on.
      this.chart.instance = this[chartConstructor[this.chart.categoryDataType]](chart)
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