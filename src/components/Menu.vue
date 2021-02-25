<template>
  <nav id="app-navigation">
    <ul>
      <li>
        <router-link to="/">
          <font-awesome-icon :icon="['far', 'file']" fixed-width />
          {{ $t('menu.document') }}
        </router-link>
      </li>
      <li>
        <router-link to="/graphs">
          <font-awesome-icon :icon="['far', 'chart-pie']" fixed-width />
          {{ $t('menu.charts') }}
        </router-link>
      </li>
      <li>
        <router-link to="/settings">
          <font-awesome-icon :icon="['far', 'cog']" fixed-width />
          {{ $t('menu.settings') }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>
