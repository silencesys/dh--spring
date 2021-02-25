<template>
  <div id="app-settings">
    <div v-if="currentFile" class="settings-section">
      <h2 class="settings-section__title">
        <font-awesome-icon :icon="['far', 'file']" />
        {{ $t('settings.file.title') }}
      </h2>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          {{ $t('settings.file.multi-value_columns') }}
        </h3>
        <p class="settings-section__description" v-html="$t('settings.file.multi-value_columns_description')"></p>
        <Select :columns="file.columns" v-model="arrayableColumn.name" />
        <div class="settings__arrayable-columns__inline-elements">
          <Toggle el-id="is-shared" v-model="arrayableColumn.shared">
            {{ $t('settings.file.multi-value_columns_toggle') }}
          </Toggle>
          <button @click.stop="markAsArrayable" class="button__primary">
            {{ $t('settings.file.multi-value_columns_button') }}
          </button>
        </div>
        <h3 class="settings-section__sub-title">
          {{ $t('settings.file.multi-value_columns_marked_columns')  }}
        </h3>
        <ul class="tag-list">
          <li v-for="column in arrayableColumns" :key="column.name" class="tag-list__tag">
            {{ column.name + $t('settings.file.multi-value_columns_shared') }} {{ column.shared ? $t('general.yes') : $t('general.no') }}
            <span class="tag-list__button tag-list__buton--remove" @click.stop="removeFromArrayable(column)">
              <font-awesome-icon :icon="['far', 'times-circle']" />
            </span>
          </li>
        </ul>
      </div>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          {{ $t('settings.file.data_type')  }}
        </h3>
        <p class="settings-section__description">
          {{ $t('settings.file.data_type_description') }}
        </p>
        <Select :columns="file.columns" v-model="dataTypes.selected.name" />
        <div class="settings__arrayable-columns__inline-elements">
          <Select :columns="dataTypes.available" v-model="dataTypes.selected.type" style="max-width: 50%;" />
          <button @click.stop="markAsDataType" class="button__primary">
            {{ $t('settings.file.data_type_button') }}
          </button>
        </div>
        <h3 class="settings-section__sub-title">
          {{ $t('settings.file.data_type_marked_columns') }}
        </h3>
        <ul class="tag-list">
          <li v-for="column in dataTypes.set" :key="column.name" class="tag-list__tag">
            {{ $t('settings.file.data_type_tag', { column: column.name, type: column.type.value}) }}
            <span class="tag-list__button tag-list__buton--remove" @click.stop="removeFromDataTypes(column)">
              <font-awesome-icon :icon="['far', 'times-circle']" />
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="settings-section">
      <h2 class="settings-section__title">
        <font-awesome-icon :icon="['far', 'cog']" />
        {{ $t('settings.app.title') }}
      </h2>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          {{ $t('settings.app.shared_filters') }}
        </h3>
        <p class="settings-section__description">
          {{ $t('settings.app.shared_filters_desc') }}
        </p>
        <Toggle el-id="filters-shared" v-model="sharedDocumentFilters" @update:modelValue="updateFilterSharingStatus">
          {{ $t('settings.app.shared_filters_toggle') }}
        </Toggle>
      </div>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          {{ $t('settings.app.language') }}
        </h3>
        <p class="settings-section__description">
          {{ $t('settings.app.language_desc') }}
        </p>
        <Select :columns="language.options" v-model="language.chosen" @update:modelValue="updateApplicationLanguage" />
      </div>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          {{ $t('settings.app.theme') }}
        </h3>
        <p class="settings-section__description">
          {{ $t('settings.app.theme_desc') }}
        </p>
        <Select :columns="theme.options" v-model="theme.chosen" @update:modelValue="updateApplicationTheme" />
      </div>
    </div>
    <div class="settings-section">
      <h2 class="settings-section__title">
        <font-awesome-icon :icon="['far', 'browser']" />
        {{ $t('settings.app.about') }}
      </h2>
      <div class="settings__arrayable-columns__form">
        <h3 class="settings-section__sub-title">
          Spring
        </h3>
        <p class="settings-section__description">
          {{ $t('settings.app.version', { version: remote.app.getVersion() }) }}<br>
          {{ $t('settings.app.author') }} Martin Roček <br>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import electron from 'electron'
import Select from '@/components/Select'
import Toggle from '@/components/Toggle'
import fileOperations from '@/mixins/fileOperations'
import applicationSettings from '@/mixins/applicationSettings'
import { languages } from '../plugins/i18n'

export default {
  name: 'application-settings',

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  emits: ['theme-change', 'settings-update'],

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
      sharedDocumentFilters: false,
      dataTypes: {
        available: [
          { key: 'string', value: this.$t('settings.file.data_types.text') },
          { key: 'date', value: this.$t('settings.file.data_types.date') }
        ],
        selected: {
          name: '',
          type: { key: 'string', value: this.$t('settings.file.data_types.text') }
        },
        set: []
      },
      remote: null,
      language: {
        options: [],
        chosen: {}
      },
      theme: {
        options: [
          { key: 'system', value: this.$t('settings.app.themes.system')},
          { key: 'light', value: this.$t('settings.app.themes.light') },
          { key: 'dark', value: this.$t('settings.app.themes.dark') }
        ],
        chosen: { key: 'system', value: this.$t('settings.app.themes.system') }
      }
    }
  },

  mounted () {
    for (const locale of languages) {
      this.language.options.push({
        key: locale,
        value: this.$t('language', locale)
      })
    }
    this.setCurrentLocale()
  },

  methods: {
    loadAfterFile () {
      this.arrayableColumns = this.store.get('arrayableColumns') || []
      this.dataTypes.set = this.store.get('setDataTypes') || []
    },
    setCurrentLocale () {
      const index = this.language.options.findIndex(l => l.key === this.$i18n.locale)
      this.language.chosen = this.language.options[index]
    },
    loadAfterAppSettings () {
      const theme = this.appStore.get('theme')
      if (theme) {
        this.theme.chosen = theme
      } else {
        this.theme.chosen = this.theme.options[0]
      }
      this.sharedDocumentFilters = this.appStore.get('sharedDocumentFilters') || false

      this.remote = electron.remote
    },
    saveFileSettings () {
      this.store.set({ key: 'arrayableColumns', value: this.arrayableColumns })
      this.store.set({ key: 'setDataTypes', value: this.dataTypes.set })
    },
    saveAppSettings () {
      this.appStore.set({ key: 'sharedDocumentFilters', value: this.sharedDocumentFilters })
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
    },
    updateApplicationLanguage (locale) {
      this.$i18n.locale = locale.key
      this.appStore.set({ key: 'language', value: locale.key })
    },
    updateFilterSharingStatus () {
      this.saveAppSettings()
    },
    markAsDataType () {
      this.dataTypes.set.push({...this.dataTypes.selected})
      this.saveFileSettings()
    },
    removeFromDataTypes (column) {
      const index = this.dataTypes.set.findIndex(item => item.name === column.name)

      if (index > -1) {
        this.dataTypes.set.splice(index, 1)
        this.saveFileSettings()
      }
    }
  }
}
</script>