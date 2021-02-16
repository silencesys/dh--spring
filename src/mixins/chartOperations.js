export default {
  methods: {
    prepareFileContent () {
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
    countDuplicity (field = 'Soudce') {
      const counts = this.graphRows.reduce(
        (current, previous) => {
          if (!this.graph.ignore.includes('' + previous[this.graph.ignore_column])) {
            return Object.assign(current, {[previous[field]]: (current[previous[field]] || 0) + 1})
          }
          return Object.assign(current)
        }
        , {}
      )

      const data = Object.entries(counts).map(([name, count]) => {
        if (name !== 'undefined' && name.length !== 0) {
          return { category: name, value: count }
        } else if (name.length !== 0) {
          return { category: 'Chybí', value: count }
        }
        return null
      }).filter(Boolean)

      const max = Math.max.apply(Math, data.map(o => o.value))
      const min = Math.min.apply(Math, data.map(o => o.value))
      const diff = (min / max)

      return {
        max_value: max,
        min_value: min,
        difference: diff,
        data
      }
    },
    keyIsUndefined (key) {
      return key === 'undefined' || key === undefined || key === '' || key.length === 0
    },
    prepareIgnoredKeys () {
      const { ignore_column } = this.graph
      this.graph.ignore_columns = this.graphRows.reduce((object, value) => {
        if (!this.keyIsUndefined(value[ignore_column])) {
          object[value[ignore_column]] = object[value[ignore_column]] || []
          if (!object[value[ignore_column]]) {
            object[value[ignore_column]] = 1
          } else {
            object[value[ignore_column]]++
          }
        }
        return object
      }, Object.create(null))
    },
    prepareKeys () {
      const { type, category } = this.graph
      this.graph.keys = this.graphRows.reduce((object, value) => {
        if (!this.keyIsUndefined(value[type])) {
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
  }
}