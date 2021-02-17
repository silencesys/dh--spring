<template>
  <div id="app-settings">
    <div v-if="currentFile" class="settings-section">
      <h2 class="settings-section__title">
        <font-awesome-icon :icon="['far', 'file']" />
        Nastavení souboru
      </h2>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          Více-hodnotové sloupce
        </h3>
        <p class="settings-section__description">
          V této části nastavení lze zvolit, které sloupce mohou obsahovat více
          než jednu hodnotu. Ve zdrojovém souboru by měly být označeny prefixem
          #:, tedy například <span class="do-not-break is-example">1: hodnota.</span> Nastavení
          sdílení hodnoty ovlivňuje chování v případě, že se hodnota vyskytuje pouze
          u jednoho případu. Tedy například <span class="do-not-break is-example">1: jméno; 2: jméno</span> ale
          <span class="do-not-break is-example">1: předmět</span>.
        </p>
        <Select :columns="file.columns" v-model="arrayableColumn.name" />
        <div class="settings__arrayable-columns__inline-elements">
          <Toggle el-id="is-shared" v-model="arrayableColumn.shared">Sdílí hodnotu napříč řádky</Toggle>
          <button @click.stop="markAsArrayable" class="button__primary">Označit sloupec jako pole</button>
        </div>
        <h3 class="settings-section__sub-title">
          Označené sloupce
        </h3>
        <ul class="tag-list">
          <li v-for="column in arrayableColumns" :key="column.name" class="tag-list__tag">
            {{ column.name }}, sdílený: {{ column.shared ? 'ano' : 'ne' }}
            <span class="tag-list__button tag-list__buton--remove" @click.stop="removeFromArrayable(column)">
              <font-awesome-icon :icon="['far', 'times-circle']" />
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="settings-section">
      <h2 class="settings-section__title">
        <font-awesome-icon :icon="['far', 'cog']" />
        Nastavení aplikace
      </h2>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          Barevné schéma aplikace
        </h3>
        <p class="settings-section__description">
          Nastavuje barevné schéma aplikace, a to na světlé, tmavé nebo řízené systémem.
        </p>
        <Select :columns="theme.options" v-model="theme.chosen" @update:modelValue="updateApplicationTheme" />
      </div>
    </div>
  </div>
</template>

<script>
import Select from '@/components/Select'
import Toggle from '@/components/Toggle'
import fileOperations from '@/mixins/fileOperations'
import applicationSettings from '@/mixins/applicationSettings'

export default {
  name: 'application-settings',

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  emits: ['theme-change'],

  components: {
    Select, Toggle
  },

  mixins: [fileOperations, applicationSettings],

  data () {
    return {
      arrayableColumns: [
        // { name: <String>, shared: <Boolean> }
      ],
      arrayableColumn: {
        name: '',
        shared: true
      },
      theme: {
        options: [
          { key: 'system', value: 'Systémové'},
          { key: 'light', value: 'Světlé' },
          { key: 'dark', value: 'Tmavé' }
        ],
        chosen: { key: 'system', value: 'Systémové' }
      }
    }
  },

  methods: {
    loadAfterFile () {
      this.arrayableColumns = this.store.get('arrayableColumns') || []
    },
    loadAfterAppSettings () {
      const theme = this.appStore.get('theme')
      if (theme) {
        this.theme.chosen = theme
      } else {
        this.theme.chosen = this.theme.options[0]
      }
    },
    saveFileSettings () {
      this.store.set({ key: 'arrayableColumns', value: this.arrayableColumns })
    },
    markAsArrayable () {
      this.arrayableColumns.push({...this.arrayableColumn})
      this.saveFileSettings()
    },
    removeFromArrayable (column) {
      const index = this.arrayableColumns.findIndex(item => item.name === column.name)

      if (index > -1) {
        this.arrayableColumns.splice(index, 1)
        this.saveFileSettings()
      }
    },
    updateApplicationTheme () {
      this.$emit('theme-change', this.theme.chosen)
    }
  }
}
</script>