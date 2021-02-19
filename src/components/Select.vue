<template>
  <div :class="['select', { 'select--active': visible}]" v-click-outside="hideSelect">
    <div class="select__choice" @click="toggleSelect">
      <slot></slot>
      {{ selected }}
      <font-awesome-icon :icon="['far', 'caret-down']" />
    </div>
    <ul v-if="visible" class="select__list">
      <li v-for="column in columns" :key="column.key || column" @click="select(column)">
        <font-awesome-icon v-if="column.icon" :icon="['far', column.icon]" fixed-width />
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
    modelValue: {
      type: [ String, Boolean, Object ],
      default: false
    },
  },

  data () {
    return {
      selected: 'Sloupec',
      visible: false
    }
  },

  computed: {
    scopedValue () {
      if (this.modelValue && this.modelValue.key) {
        return this.modelValue.key
      }
      return this.modelValue || this.currentValue
    }
  },

  mounted () {
    if (this.scopedValue) {
      if (this.isObject(this.columns[0])) {
        const index = this.columns.findIndex(item => item.key === this.scopedValue)
        if (index > -1) {
          this.selected = this.columns[index].value
        }
      } else {
        this.selected = this.scopedValue
      }
    }
  },

  updated () {
    if (this.scopedValue) {
      if (this.isObject(this.columns[0])) {
        const index = this.columns.findIndex(item => item.key === this.scopedValue)
        if (index > -1) {
          this.selected = this.columns[index].value
        }
      } else {
        this.selected = this.scopedValue
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
      this.$emit('update:modelValue', column)
      this.toggleSelect()
    },
    isObject (item) {
      return item && typeof item === 'object' && item.constructor === Object
    },
    hideSelect () {
      this.visible = false
    }
  }
}
</script>