<template>
  <div class="content-grid">
    <div>
      <div id="data-search">
        <label for="search" class="data-search__search">
          <font-awesome-icon :icon="['far', 'search']" />
          <input id="search" type="text" placeholder="Vyhledávat" v-model="filter.search">
        </label>
        <Select :columns="file.columns" v-on:new-value="setFilterField">
          <font-awesome-icon :icon="['far', 'columns']" />
        </Select>
        <button class="button__secondary" @click.prevent="createFilter">
          Přidat filtr
        </button>
      </div>
    </div>
    <div>
      <ul class="data-search__filters">
        <li v-for="key in Object.keys(this.filters)" :key="key">
          {{ key }}: {{ this.filters[key].join(', ') }}
          <span @click.stop="removeFilter(key)"><font-awesome-icon :icon="['far', 'times-circle']" class="remove" /></span>
        </li>
      </ul>
      <div class="field-settings">
        <button class="button__secondary" @click="toggleModal">zobrazit sloupce</button>
      </div>
    </div>
    <div class="content-can-overflow">
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
    </div>
  </div>
  <Modal v-if="modalOpen">
    <div class="modal-body w-400">
      <h3>Zobrazit sloupce</h3>
      <ul class="modal-body__option-list">
        <li v-for="column in filterColumns" :key="column.name+column.icon">
          <button @click.prevent="addOrRemoveColumn(column)">
            <font-awesome-icon :icon="['far', column.icon]" />
            {{ column.name }}
          </button>
        </li>
      </ul>
      <button class="button__primary" @click.prevent="toggleModal">Zavřít</button>
      <button class="button__secondary" @click.prevent="resetColumns">Reset</button>
    </div>
  </Modal>
</template>

<script>
import Store from '@/Store'
import Select from '@/components/Select.vue'
import Modal from '@/components/Modal.vue'

export default {
  name: 'Home',

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
    Modal
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
      sliceStart: 0,
      store: {},
      filtered: false,
      filters: {},
      filter: {
        search: '',
        field: ''
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
      return this.copy.content || this.file.content
    },
    tableColumns () {
      return this.copy.columns || this.file.columns
    },
    visibleRows () {
      return this.tableContent.slice(this.sliceStart, 500)
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
    }
  },

  methods: {
    setFilterField ({ column }) {
      this.filter.field = column
    },
    createFilter () {
      if (this.filter.field) {
        if (!this.filters[this.filter.field]) {
          this.filters[this.filter.field] = []
        }
        this.filters[this.filter.field].push(this.filter.search.toString())
      }
    },
    filterData () {
      this.setCopyContent()
      for (const key in this.filters) {
        this.copy.content = this.file.content.filter((row) => {
          const rowKeyToString = row[key]?.toString().toUpperCase().split(' ')
          if (this.filters[key].some((item) => rowKeyToString.includes(item.toUpperCase()))) {
            return row
          }
          return false
        })
      }

      this.saveFile()
    },
    removeFilter (key) {
      delete this.filters[key]
      this.copy.content = this.file.content
      this.filterData()
    },
    loadFileContent () {
      this.store = new Store(`${this.currentFile}.json`)
      const file = this.store.get()
      this.file.columns = file.columns.filter(Boolean)
      this.file.content = file.content
      this.copy.columns = file.copy?.columns || null
      this.copy.content = file.copy?.content || null
      this.filters = file.filters || {}
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
    saveFile () {
      this.store.set({ key: 'copy', value: this.copy })
      this.store.set({ key: 'filters', value: this.filters })
    }

  }

}
</script>
