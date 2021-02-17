import Store from '@/Store'
import storeConfig from '@/config/store'

export default {
  beforeMount () {
    this.loadApplicationSettings()
  },

  data () {
    return {
      appStore: {}
    }
  },

  methods: {
    loadApplicationSettings () {
      this.appStore = new Store(storeConfig.fileName)
      if (this.loadAfterAppSettings && typeof this.loadAfterAppSettings === 'function') {
        this.loadAfterAppSettings()
      } else {
        console.info('Method loadAfterAppSettings() can be used to do additional operations after loading the settings.')
      }
    }
  }
}