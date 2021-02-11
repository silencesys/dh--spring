<template>
  <div id="app-layout">
    <h2 id="app-title">
      Spring
    </h2>
    <FileInformation :file-name="fileName" />
    <AppNavigation />
    <div id="app-content">
      <router-view :current-file="fileName" />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import AppNavigation from '@/components/Menu.vue'
import FileInformation from '@/components/FileInformation.vue'

export default {
  name: 'AppView',

  components: {
    AppNavigation,
    FileInformation
  },

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
  }
}
</script>
