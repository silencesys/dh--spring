import Store from '@/Store'

export default {
  mounted () {
    if (this.currentFile) {
      this.loadFileContent()
    }
  },

  watch: {
    'currentFile': function (current) {
      if (current) {
        console.log(current)
        this.loadFileContent()
      }
    }
  },

  data () {
    return {
      file: {
        content: [],
        columns: [],
        setDataTypes: [],
        arrayableColumns: []
      },
      copy: {
        content: [],
        columns: []
      },
      store: {}
    }
  },

  methods: {
    loadFileContent () {
      this.store = new Store(`${this.currentFile}.json`)
      const store = this.store.get()
      this.file.columns = store.columns.filter(Boolean)
      this.file.content = store.content
      this.file.setDataTypes = store.setDataTypes || []
      this.file.arrayableColumns = store.arrayableColumns || []
      this.file.filters = store.filters || []
      this.copy = store.copy

      if (this.loadAfterFile && typeof this.loadAfterFile === 'function') {
        this.loadAfterFile()
      } else {
        console.info('If you want to load any content after file has been loaded, please use loadAfterFile() method.')
      }
    },
  }
}