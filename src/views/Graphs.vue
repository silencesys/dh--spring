<template>
  <div id="app-graphs">
    <div class="graph__tabs">
      <div>
        <router-link :to="{ name: 'PieChart' }">Koláčový</router-link>
        <router-link :to="{ name: 'AxisChart' }">Sloupcový</router-link>
      </div>
      <div>
        <span v-if="documentFilters.active" class="chart-filter-warning" @click.stop="toggleModal">
          <font-awesome-icon :icon="['far', 'exclamation-triangle']" />
          filtry z dokumentu jsou aktivní
        </span>
      </div>
    </div>
    <router-view :current-file="currentFile" @data-are-filtered="documentFilterActive"></router-view>
    <Modal v-if="modalVisible">
      <div class="modal-body w-400">
        <h3>Aktivní filtry</h3>
        <ul class="modal-body__option-list">
          <li v-for="filter in Object.keys(documentFilters.filters)" :key="filter">
              {{ filter }}: {{ documentFilters.filters[filter].values.join(', ') }}
          </li>
        </ul>
        <button class="button__primary" @click.prevent="toggleModal">Zavřít</button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from '@/components/Modal'

export default {
  name: 'chart-page',

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
