<template>
  <div id="app-layout">
    <h2 id="app-title">
      Spring
    </h2>
    <FileInformation :file-name="fileName" />
    <AppNavigation />
    <div id="app-content">
      <router-view :current-file="fileName" @theme-change="updateTheme" />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import AppNavigation from '@/components/Menu.vue'
import FileInformation from '@/components/FileInformation.vue'
import appSettingsMixin from '@/mixins/applicationSettings'

export default {
  name: 'AppView',

  components: {
    AppNavigation,
    FileInformation
  },

  mixins: [appSettingsMixin],

  data () {
    return {
      fileName: '',
      content: [],
      columns: [],
      loading: false
    }
  },

  async mounted () {
    ipcRenderer.on('opened-file', (event, { fileName }) => {
      this.fileName = fileName
    });

    const result = await ipcRenderer.invoke('last-opened-file')
    if (result) {
      this.fileName = result.split('.json')[0]
    }
  },

  methods: {
    loadAfterAppSettings () {
      this.loadTheme()
    },
    updateTheme(theme) {
      const newTheme = `theme-${theme.key}`
      const currentTheme = this.appStore.get('theme')

      if (currentTheme) {
        const previousTheme = `theme-${currentTheme.key}`
        document.body.classList.remove(previousTheme)
      }

      document.body.classList.add(newTheme)
      this.appStore.set({ key: 'theme', value: theme })
    },
    loadTheme () {
      const currentTheme = this.appStore.get('theme')
      if (currentTheme) {
        const theme = `theme-${currentTheme.key}`
        document.body.classList.add(theme)
      }
    }
  }
}
</script>
