<template>
  <div id="app-graphs">
    <div class="graph__tabs">
      <router-link :to="{ name: 'PieChart' }">Koláčový</router-link>
      <router-link :to="{ name: 'AxisChart' }">Sloupcový</router-link>
    </div>
    <router-view :current-file="currentFile"></router-view>
  </div>
</template>

<script>
export default {
  props: {
    currentFile: {
      type: String,
      default: null
    },
  }
}
</script>
