<template>
  <div id="app-graphs">
    <div class="graph__tabs">
      <div>
        <router-link :to="{ name: 'PieChart' }">{{ $t('chart.tab_pie') }}</router-link>
        <router-link :to="{ name: 'AxisChart' }">{{ $t('chart.tab_column') }}</router-link>
      </div>
      <div>
        <span v-if="documentFilters.active" class="chart-filter-warning" @click.stop="toggleModal">
          <font-awesome-icon :icon="['far', 'exclamation-triangle']" />
          {{ $t('chart.document_filters_active') }}
        </span>
      </div>
    </div>
    <router-view :current-file="currentFile" @data-are-filtered="documentFilterActive"></router-view>
    <Modal v-if="modalVisible">
      <div class="modal-body w-400">
        <h3>{{ $t('chart.document_filters_title') }}</h3>
        <ul class="modal-body__option-list">
          <li v-for="filter in Object.keys(documentFilters.filters)" :key="filter">
              {{ filter }}: {{ documentFilters.filters[filter].values.join(', ') }}
          </li>
        </ul>
        <button class="button__primary" @click.prevent="toggleModal">
          {{ $t('button.close') }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from '@/components/Modal'

export default {
  name: 'Charts',

  components: {
    Modal
  },

  props: {
    currentFile: {
      type: String,
      default: null
    },
  },

  data () {
    return {
      documentFilters: {
        active: false,
        filters: {}
      },
      modalVisible: false
    }
  },

  methods: {
    documentFilterActive ({ active, filters }) {
      console.log(Object.keys(filters).length)
      if (Object.keys(filters).length > 0) {
        this.documentFilters.active = active
        this.documentFilters.filters = filters
      }
    },
    toggleModal () {
      this.modalVisible = !this.modalVisible
    }
  }
}
</script>
