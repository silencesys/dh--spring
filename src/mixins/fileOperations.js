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
        columns: []
      },
      store: {}
    }
  },

  methods: {
    loadFileContent () {
      this.store = new Store(`${this.currentFile}.json`)
      const file = this.store.get()
      this.file.columns = file.columns.filter(Boolean)
      this.file.content = file.content
      if (this.loadAfterFile && typeof this.loadAfterFile === 'function') {
        this.loadAfterFile()
      } else {
        console.info('If you want to load any content after file has been loaded, please use loadAfterFile() method.')
      }
    },
  }
}