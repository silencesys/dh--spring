<template>
  <div class="tooltip__wrapper" ref="tooltipWrapper" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <slot ref="item"></slot>
    <div v-if="tooltip.visible" :class="['tooltip', tooltipPositionClassList]" ref="tooltip">
      <p>
        <slot name="text" />
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tooltip: {
        element: null,
        visible: false
      },
      timeout: 0
    }
  },

  updated () {
    if (this.tooltip.visible && this.tooltip.element === null) {
      this.tooltip.element = this.$refs.tooltip?.getBoundingClientRect()
    }
  },

  computed: {
    isTooCloseToRightWindowBorder () {
      return this.tooltip.element?.right + this.tooltip.element?.width >= window.innerWidth - 10
    },
    isTooCloseToLeftWindowBorder () {
      return this.tooltip.element?.left - 10 <= 0
    },
    isTooCloseToBottomWindowBorder () {
      return this.tooltip.element?.bottom - 10 <= 0
    },
    tooltipPositionClassList () {
      let classList = ''
      classList += this.isTooCloseToRightWindowBorder ? 'tooltip--left ' : ''
      classList += this.isTooCloseToLeftWindowBorder ? 'tooltip--right ' : ''
      classList += this.isTooCloseToBottomWindowBorder ? 'tooltip--top ' : ''

      return classList
    }
  },

  methods: {
    resetTimeout () {
      clearTimeout(this.timeout)
    },
    showTooltip () {
      this.resetTimeout()
      this.timeout = setTimeout(() => {
        this.tooltip.visible = true
      }, 1000)
    },
    hideTooltip () {
      this.resetTimeout()
      this.tooltip.visible = false
    }
  }
}
</script>