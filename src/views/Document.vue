<template>
  <div class="content-grid">
    <div>
      <div id="data-search" class="document-filter">
        <label for="search" class="data-search__search">
          <input id="search" type="text" :placeholder="$t('document.search_placeholder')" v-model="filter.search">
          <font-awesome-icon :icon="['far', 'search']" />
        </label>
        <Select :columns="file.columns" v-on:new-value="setFilterField">
          <font-awesome-icon :icon="['far', 'columns']" />
        </Select>
        <Select :columns="filterTypes" :current-value="filter.type" v-on:new-value="setFilterType">
          <font-awesome-icon :icon="['far', 'filter']" fixed-width />
        </Select>
        <button class="button__secondary add_filter" @click.prevent="createFilter">
          {{ $t('document.create_filter') }}
        </button>
      </div>
    </div>

    <div>
      <ul class="data-search__filters">
        <li v-for="key in Object.keys(this.filters)" :key="key">
          <font-awesome-icon :icon="['far', filterTypeName[this.filters[key].type]]" fixed-width />
          {{ key }}: {{ this.filters[key].values.join(', ') }}
          <span @click.stop="removeFilter(key)"><font-awesome-icon :icon="['far', 'times-circle']" class="remove" /></span>
        </li>
      </ul>
      <div v-if="file.columns.length > 0" class="field-settings">
        <button class="button__secondary" @click="toggleModal">
          {{ $t('document.show_columns') }}
        </button>
      </div>
    </div>

    <div v-if="currentFile" class="content-can-overflow">
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th v-for="(cell, index) in tableColumns" :key="`${index}-${cell}`">
                <span @click.stop="sortColumn(cell)">{{ cell }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in visibleRows" :key="index" >
              <td v-for="cell in tableColumns" :key="`${index}---${cell}`">
                {{ row[cell] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="document__navigation">
        <li>
          <span v-if="!isOnFirstPage" class="document__navigation__previous" @click.prevent="navigateToPreviousPage">
            <font-awesome-icon :icon="['far', 'chevron-left']" />
            {{ $t('general.previous_page') }}
          </span>
        </li>
        <li class="document__navigation__current">
          {{ $t('general.current_page', { current: this.page.currentPage, total: this.totalNumberOfPages }) }}
        </li>
        <li>
          <span v-if="!isOnLastPage" class="document__navigation__next" @click.prevent="navigateToNextPage">
            {{ $t('general.next_page') }}
            <font-awesome-icon :icon="['far', 'chevron-right']" />
          </span>
        </li>
      </ul>
    </div>
    <ChooseFile v-else />
  </div>

  <Modal v-if="modalOpen">
    <div class="modal-body w-400">
      <h3>
        {{ $t('document.modal.show_columns') }}
      </h3>
      <ul class="modal-body__option-list">
        <li v-for="column in filterColumns" :key="column.name+column.icon">
          <button @click.prevent="addOrRemoveColumn(column)">
            <font-awesome-icon :icon="['far', column.icon]" />
            {{ column.name }}
          </button>
        </li>
      </ul>
      <button class="button__primary" @click.prevent="toggleModal">
        {{ $t('button.close_save') }}
      </button>
      <button class="button__secondary" @click.prevent="resetColumns">
        {{ $t('button.reset') }}
      </button>
    </div>
  </Modal>
</template>

<script>
import Store from '@/Store'
import Select from '@/components/Select.vue'
import Modal from '@/components/Modal.vue'
import ChooseFile from '@/components/ChooseFile.vue'

export default {
  name: 'Document',

  emits: {
    click: null
  },

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  components: {
    Select,
    Modal,
    ChooseFile
  },

  data () {
    return {
      file: {
        columns: [],
        content: []
      },
      copy: {
        columns: null,
        content: null
      },
      page: {
        offset: 0,
        limit: 500,
        currentPage: 1
      },
      store: {},
      filtered: false,
      filterTypes: [
        { key: 'file', value: this.$t('document.filter-type.extending'), icon: 'expand-alt' },
        { key: 'copy', value: this.$t('document.filter-type.specifying'), icon: 'compress-alt' }
      ],
      filters: {},
      filter: {
        search: '',
        field: '',
        type: 'file'
      },
      modalOpen: false
    }
  },

  watch: {
    currentFile: 'loadFileContent',
    filters: {
      deep: true,
      handler: 'filterData'
    }
  },

  mounted () {
    if (this.currentFile) {
      this.loadFileContent()
    }
  },

  computed: {
    tableContent () {
      if (this.copy.content === null) {
        return this.file.content
      }
      return this.copy.content
    },
    tableColumns () {
      if (this.copy.content && this.copy.content.length > 0) {
        return this.copy.columns
      }
      return this.file.columns
    },
    visibleRows () {
      const limitPlusOffset = this.page.offset + this.page.limit
      return this.tableContent.slice(this.page.offset, limitPlusOffset)
    },
    filterTypeName () {
      return this.filterTypes.reduce(
        (prev, curr) => Object.assign(prev, { [curr.key]: curr.icon }),
        {}
      )
    },
    filterColumns () {
      const columns = []

      for (const column of this.file.columns) {
        if (this.tableColumns.indexOf(column) >= 0) {
          columns.push({ name: column, icon: 'check-square'})
        } else {
          columns.push({ name: column, icon: 'square' })
        }
      }

      return columns
    },
    totalNumberOfPages () {
      const numberOfPages = Math.ceil(this.tableContent.length / this.page.limit)

      if (numberOfPages === 0) {
        return 1
      }

      return numberOfPages
    },
    isOnLastPage () {
      return this.page.currentPage === this.totalNumberOfPages
    },
    isOnFirstPage () {
      return this.page.currentPage === 1
    }
  },

  methods: {
    navigateToNextPage () {
      this.page.offset = this.page.offset + this.page.limit
      this.page.currentPage++
    },
    navigateToPreviousPage () {
      this.page.offset = this.page.offset - this.page.limit
      this.page.currentPage--
    },
    setFilterField ({ column }) {
      this.filter.field = column
    },
    createFilter () {
      if (this.filter.field) {
        if (!this.filters[this.filter.field]) {
          this.filters[this.filter.field] = {
            values: [],
            type: this.filter.type
          }
        }

        if (this.filter.search.includes(',')) {
          const filterArray = this.filter.search.split(',')
          this.filters[this.filter.field].values.push(...filterArray)
        } else {
          this.filters[this.filter.field].values.push(this.filter.search.toString())
        }

        this.filter.search = ''
      }
    },
    filterData () {
      if (Object.keys(this.filters).length === 0) {
        this.copy.content = null
        this.saveFile()
        return
      }

      let data = this.file.content.map((row) => {
        return {...row}
      })

      const copyFilters = []

      for (const rowIndex in data) {
        const row = data[rowIndex]
        const passedFilters = []
        for (const filterKey in this.filters) {
          if (this.filters[filterKey].type === 'file') {
            const columnToString = row[filterKey]?.toString().toUpperCase()
            if (columnToString && this.filters[filterKey].values.some(item => this.checkFilterValues(item, columnToString))) {
              passedFilters.push(true)
            } else {
              passedFilters.push(false)
            }
          } else {
            if (copyFilters.indexOf(filterKey) === -1) {
              copyFilters.push(filterKey)
            }
          }
        }

        if (!passedFilters.includes(true)) {
          delete data[rowIndex]
        }
      }

      data.filter(Boolean)

      if (copyFilters.length > 0) {
        for (const rowIndex in data) {
          const row = data[rowIndex]
          let copy = true
          for (const filter of copyFilters) {
            const columnToString = row[filter]?.toString().toUpperCase()
            if (copy && columnToString && this.filters[filter].values.some(item => this.checkFilterValues(item, columnToString))) {
              // continue
            } else {
              copy = false
            }
          }

          if (!copy) {
            delete data[rowIndex]
          }
        }
      }

      this.copy.content = data.filter(Boolean)

      this.saveFile()
    },
    checkFilterValues (item, columnValue) {
      const query = columnValue
      if (item.includes('"')) {
        return query.includes(item.trim().replaceAll('"', '').toUpperCase())
      } else {
        return query.split(' ').find(a => a.includes(item.trim().toUpperCase()))
      }
    },
    removeFilter (key) {
      delete this.filters[key]
      this.copy.content = null
      this.filterData()
    },
    loadFileContent () {
      this.store = new Store(`${this.currentFile}.json`)
      const file = this.store.get()
      this.file.columns = file.columns.filter(Boolean)
      this.file.content = file.content
      this.copy.columns = file.copy?.columns || null
      this.copy.content = file.copy?.content || null
      if (file) {
        this.filters = file.filters || {}
      }
    },
    addOrRemoveColumn (column) {
      this.setCopyColumns()

      const copyIndex = this.copy.columns.indexOf(column.name)
      const fileIndex = this.file.columns.indexOf(column.name)
      if (copyIndex >= 0) {
        this.copy.columns.splice(copyIndex, 1)
      } else {
        this.copy.columns.splice(fileIndex, 0, column.name)
      }

      this.saveFile()
    },
    toggleModal () {
      this.modalOpen = !this.modalOpen
    },
    sortColumn (column) {
      this.setCopyContent()

      this.copy.content = this.copy.content.sort((a, b) => {
        if (typeof a[column] === 'number') {
          return a[column] - b[column]
        } else if (typeof a[column] === 'string') {
          const stringA = a[column]?.toUpperCase()
          const stringB = b[column]?.toUpperCase()

          if (stringA < stringB) return -1
          if (stringA > stringB) return 1
          return 0
        }
        return 0
      })
      this.saveFile()
    },
    resetColumns () {
      this.copy.columns = [...this.file.columns]
    },
    setCopyContent () {
      if (!this.copy.content) {
        this.copy.content = [...this.file.content]
      }
    },
    setCopyColumns () {
      if (!this.copy.columns) {
        this.copy.columns = [...this.file.columns]
      }
    },
    setFilterType ({ column }) {
      this.filter.type = column.key
    },
    saveFile () {
      this.store.set({ key: 'copy', value: this.copy })
      this.store.set({ key: 'filters', value: this.filters })
    }
  }
}
</script>
