<template>
  <div id="app-modal">
    <slot></slot>
  </div>
</template>

<script>
export default {
  mounted () {
    this.disableScrolling()
  },

  methods: {
    disableScrolling () {
      document.body.classList.add('disable-scrolling')
    },
    enableScrolling () {
      document.body.classList.remove('disable-scrolling')
    }
  },

  beforeUnmount () {
    this.enableScrolling()
  }
}
</script>