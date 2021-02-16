import Store from '@/Store'

export default {
  mounted () {
    if (this.currentFile) {
      this.loadFileContent()
    }
  },

  data () {
    return {
      file: {
        content: [],
        columns: []
      }
    }
  },

  methods: {
    loadFileContent () {
      this.store = new Store(`${this.currentFile}.json`)
      const file = this.store.get()
      this.file.columns = file.columns.filter(Boolean)
      this.file.content = file.content
      if (this.loadInMounted && typeof this.loadInMounted === 'function') {
        this.loadInMounted()
      }
    },
  }
}