<template>
  <div class="select">
    <div class="select__choice" @click="toggleSelect">
      <slot></slot>
      {{ selected }}
      <font-awesome-icon :icon="['far', 'caret-down']" />
    </div>
    <ul v-if="visible" class="select__list">
      <li v-for="column in columns" :key="column.key || column" @click="select(column)">
        {{ column.value || column }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Select',

  props: {
    columns: {
      type: Array,
      required: true,
      default () {
        return [
          'A', 'B', 'C'
        ]
      }
    },
    currentValue: {
      type: [String, Number, Boolean],
      default: null
    },
  },

  data () {
    return {
      selected: 'Sloupec',
      visible: false
    }
  },

  mounted () {
    if (this.currentValue) {
      if (this.isObject(this.columns[0])) {
        const index = this.columns.findIndex(item => item.key === this.currentValue)
        if (index > -1) {
          this.selected = this.columns[index].value
        }
      } else {
        this.selected = this.currentValue
      }
    }
  },

  methods: {
    toggleSelect () {
      this.visible = !this.visible
    },
    select (column) {
      this.selected = column.value || column
      this.$emit('new-value', { column })
      this.toggleSelect()
    },
    isObject (item) {
      return item && typeof item === 'object' && item.constructor === Object
    }
  }
}
</script>