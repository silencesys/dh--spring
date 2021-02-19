import applicationSettings from '@/mixins/applicationSettings'

export default {
  emits: ['data-are-filtered'],
  mixins: [applicationSettings],
  computed: {
    shareFilterSettings () {
      return this.appStore.get('sharedDocumentFilters') || false
    },
    chartData () {
      if (this.shareFilterSettings && this.copy.content.length > 0) {
        return {
          content: this.copy.content,
          // Charts should always have all columns available
          columns: this.file.columns
        }
      }

      return this.file
    },
  },
  methods: {
    emitDocumentFiltersSharingStatus () {
      this.$emit('data-are-filtered', {
        active: this.shareFilterSettings, filters: this.file.filters
      })
    },
    prepareRowsForChart ({ content }, arrayableColumns) {
      const rows = []

      content.forEach((row) => {
        // New rows that are generated from already existing rows
        const newRows = {}
        // Columns that should be shared between newly generated rows
        const sharedColumns = {}

        for (const column of arrayableColumns) {
          // Loop through the array of fields that might contain additional
          // array of values that in some cases should stay as single values
          let columnContent = row[column.name]

          if (columnContent?.includes(':') || columnContent?.includes(';')) {
            // Check whether column content contains any of the known separators
            // if so, split it
            columnContent = row[column.name]?.split(';')
          } else if (columnContent?.includes(', ')) {
            columnContent = row[column.name]?.split(', ')
          } else {
            // Otherwise store the column value in the sharedColumns, so it
            // can be used later, if some other field conatins array of values
            if (!column.shared) {
              newRows[1] = newRows[1] || arrayableColumns.reduce((a, key) => Object.assign(a, { [key.name]: '' }), {})
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
              newRows[id] = newRows[id] || arrayableColumns.reduce((a, key) => Object.assign(a, { [key.name]: '' }), {})
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

      return rows
    },
    keyIsNotUndefined (key) {
      return !(key === 'undefined' || key === undefined || key === '' || key.length === 0)
    },
    countFrequencyBasedOnColumn (column, rows) {
        return rows.reduce((previous, current) => {
          if (this.keyIsNotUndefined(current[column])) {
            previous[current[column]] = previous[current[column]] || []
            if (!previous[current[column]]) {
              previous[current[column]] = 1
            } else {
              previous[current[column]]++
            }
          }
          return previous
        }, {})
    },
    /**
     * Filter chart rows by date. In future can be extended with support for
     * other data types.
     *
     * @param {Array<Object>} rows
     * @param {string} column
     * @param {string} dataType
     * @param {Object<mixed>} range
     * @returns
     */
    filterRows (rows, column, dataType, range) {
      if (dataType === 'date') {
        return rows.filter((row) => {
          const date = this.convertCzechDateString(row[column])
          // Check whether range is instance of Date, if not, return true
          // because range is not set.
          const bottomRange = range.from instanceof Date ? date.getTime() >= range.from.getTime() : true
          const topRange = range.to instanceof Date ? date.getTime() <= range.to.getTime() : true

          return bottomRange && topRange
        })
      }

      return rows
    },
    getOnlyUniqueValues (rows, ignoredValues, { category, value, subCategory }, isDateDataType) {
      const ignoredColumn = value !== 'Četnost' ? category : subCategory
      const values = rows.map((item) => {
        if (!ignoredValues.includes(`${'' + item[ignoredColumn]}`)) {
          return this.convertCzechDateString(item[category], isDateDataType, true)
        }
        return null
      })
      return values.filter((item, position) => {
        return values.indexOf(item) === position
      })
    },
    countFrequency (rows, ignoredValues, { category, value, subCategory }, isDateDataType) {
      const ignoredColumn = value !== 'Četnost' ? category : subCategory
      return rows.reduce((current, previous) => {
        if (!ignoredValues.includes(`${'' + previous[ignoredColumn]}`)) {
          const key = this.convertCzechDateString(previous[category], isDateDataType, true)
          return {...current, [key]: (current[key] || 0) + 1}
        }
        return {...current}
      }, {})
    },
    countSplitFrequency(rows, ignoredValues, { category, subCategory, value }, isDateDataType) {
      const ignoredColumn = value !== 'Četnost' ? category : subCategory
      return rows.reduce((current, previous) => {
        if (!ignoredValues.includes(`${'' + previous[ignoredColumn]}`)) {
          const key = this.convertCzechDateString(previous[category], isDateDataType, true)
          const valueKey = previous[subCategory]
          const object = { [valueKey]: (current[valueKey] || {}) }
          object[valueKey][key] = (object[valueKey][key] || 0) + 1
          return { ...current, ...object }
        }
        return { ...current }
      }, {})
    },
    convertKeyValueToChartData (keyValuePairs, sortCallback = null, customValue = 'value', missingCatName = 'Chybí') {
      const chartData = Object.entries(keyValuePairs).map(([category, frequency]) => {
        if (category !== 'undefined' && category.length > 0) {
          return { category, [customValue]: frequency }
        } else if (category.length !== 0) {
          return { category: missingCatName, [customValue]: frequency }
        }
        return null
      }).filter(Boolean)

      if (sortCallback && typeof sortCallback === 'function') {
        chartData.sort(sortCallback)
      }

      return chartData
    },
    convertRowsToChartData ({ rows, filters, ignoredValues, categoryDataType }) {
      const availableRows = rows.map((row) => {
        if ('' + row[filters.category] === '' + filters.subCategory) {
          return row
        }
        return null
      }).filter(Boolean)


      const frequency = this.countFrequency(availableRows, ignoredValues, { ...filters, category: filters.value })

      return {
        values: frequency,
        data: this.convertKeyValueToChartData(frequency, this.getSortMethod(categoryDataType))
      }
    },
    getFrequency ({ categoryDataType, categoryRange, ignoredValues, rows, filters }, split = false) {

      const availableRows = this.filterRows(rows, filters.category, categoryDataType, categoryRange)

      const isDateDataType = categoryDataType === 'date'

      let frequency = []
      if (split) {
        const splitFrequency = this.countSplitFrequency(availableRows, ignoredValues, filters, isDateDataType)
        for (const item in splitFrequency) {
          frequency.push(...this.convertKeyValueToChartData(splitFrequency[item], null, item))
        }
        frequency.sort(this.getSortMethod(categoryDataType))
      } else {
        frequency = this.countFrequency(availableRows, ignoredValues, filters, isDateDataType)
        frequency = this.convertKeyValueToChartData(frequency, this.getSortMethod(categoryDataType))
      }

      return frequency
    },
    getSortMethod (dataType) {
      const sortMethod = {
        date: this.sortByDate
      }

      return sortMethod[dataType] || null
    },
    sortByDate (a, b) {
      const aDate = this.convertCzechDateString(a.category || a)
      const bDate = this.convertCzechDateString(b.category || b)

      return aDate - bDate
    },
    convertCzechDateString (date, format = false, hasNonDateValues = false) {
      let convertedDate = '' + date

      if (date instanceof Date) {
        return date
      }

      if (!format && hasNonDateValues) {
        return date
      }

      if (convertedDate.includes('.')) {
        convertedDate = convertedDate.split('.')
        convertedDate = `${convertedDate[2]}-${convertedDate[1]}-${convertedDate[0]}`
      }

      if (convertedDate.includes(' ') && convertedDate.includes(':')) {
        convertedDate = convertedDate.split(' ')[0]
      }

      convertedDate = new Date(convertedDate)
      convertedDate = !isNaN(convertedDate) ? convertedDate : date

      if (format && !isNaN(convertedDate)) {
        convertedDate = convertedDate.toLocaleString('cs-CZ', { year: 'numeric', month: 'short', day: 'numeric' })
      }

      return convertedDate
    },
  }
}