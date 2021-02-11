<template>
  <div id="app-fileinfo">
    <h3 class="app-fileinfo__filename">
      {{ fileName }}
    </h3>
    <button class="button__round" @click.prevent="openXslxFile"><!--
      --><font-awesome-icon :icon="['far', 'folder-open']" /><!--
    --></button>
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
