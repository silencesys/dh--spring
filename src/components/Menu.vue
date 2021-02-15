<template>
  <nav id="app-navigation">
    <ul>
      <li>
        <router-link to="/">
          <font-awesome-icon :icon="['far', 'file']" fixed-width />
          Dokument
        </router-link>
      </li>
      <li>
        <router-link to="/graphs">
          <font-awesome-icon :icon="['far', 'chart-pie']" fixed-width />
          Grafy
        </router-link>
      </li>
      <li>
        <router-link to="/settings">
          <font-awesome-icon :icon="['far', 'cog']" fixed-width />
          Nastavení
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {

}
</script>