<template>
  <label :for="elId" class="toggle__wrapper" ref="toggle-label">
    <div class="toggle">
      <input :id="elId" type="checkbox" ref="toggle" v-model="state" @input="updateInputValue" class="toggle__input">
      <div :class="['toggle__slider', { 'toggle__slider--active': state }]"></div>
    </div>
    <span class="toggle__description">
      <slot></slot>
    </span>
  </label>
</template>

<script>
export default {
  name: 'toggle',

  props: {
    elId: {
      type: String,
      required: true
    },
    modelValue: {
      type: [ String, Boolean ],
      default: false
    }
  },

  data () {
    return {
      state: this.modelValue
    }
  },

  methods: {
    updateInputValue () {
      this.$emit('update:modelValue', this.$refs.toggle.checked)
    }
  }
}
</script>