<template>
  <div id="app-fileinfo">
    <h3 class="app-fileinfo__filename">
      {{ fileName  || $t('general.no_file_selected') }}
    </h3>
    <div>
      <Tooltip v-if="$route.meta.exportable">
      <button class="button__round" style="margin-right: 1rem;" @click.prevent="exportChart"><!--
        --><font-awesome-icon :icon="['far', 'file-export']" /><!--
      --></button>
        <template v-slot:text>
          {{ $t('general.tooltip_export') }}
        </template>
      </Tooltip>
      <Tooltip>
      <button class="button__round" @click.prevent="openXslxFile"><!--
        --><font-awesome-icon :icon="['far', 'folder-open']" /><!--
      --></button>
        <template v-slot:text>
          {{ $t('general.tooltip_open_file') }}
        </template>
      </Tooltip>
    </div>
  </div>
</template>

<script>
import { remote, ipcRenderer } from 'electron'
import Tooltip from '@/components/Tooltip'

export default {
  name: 'FileInformation',

  components: { Tooltip },

  props: {
    fileName: {
      type: String,
      default: null
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
