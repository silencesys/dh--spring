<template>
  <div id="app-fileinfo">
    <h3 class="app-fileinfo__filename">
      {{ fileName  || 'žádný soubor nebyl vybrán' }}
    </h3>
    <div>
      <button v-if="$route.meta.exportable" class="button__round" style="margin-right: 1rem;" @click.prevent="exportChart"><!--
        --><font-awesome-icon :icon="['far', 'file-export']" /><!--
      --></button>
      <button class="button__round" @click.prevent="openXslxFile"><!--
        --><font-awesome-icon :icon="['far', 'folder-open']" /><!--
      --></button>
    </div>
  </div>
</template>

<script>
import { remote, ipcRenderer } from 'electron'

export default {
  name: 'FileInformation',

  props: {
    fileName: {
      type: String,
      default: 'Filename.xslx'
    }
  },

  methods: {
    async exportChart () {
      ipcRenderer.invoke('export-chart')
    },
    async openXslxFile () {
      const picker = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Documents', extensions: ['xlsx'] }
        ]
      })

      if (!picker.canceled) {
        ipcRenderer.invoke('open-xslx-file',  picker.filePaths[0])
      }
    }
  }
}
</script>
