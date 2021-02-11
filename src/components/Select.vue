<template>
  <div class="select">
    <div class="select__choice" @click="toggleSelect">
      <slot></slot>
      {{ selected }}
      <font-awesome-icon :icon="['far', 'caret-down']" />
    </div>
    <ul v-if="visible" class="select__list">
      <li v-for="column in columns" :key="column" @click="select(column)">
        {{ column }}
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
    }
  },

  data () {
    return {
      selected: 'Sloupec',
      visible: false
    }
  },

  methods: {
    toggleSelect () {
      this.visible = !this.visible
    },
    select (column) {
      this.selected = column
      this.$emit('new-value', { column })
      this.toggleSelect()
    }
  }
}
</script>