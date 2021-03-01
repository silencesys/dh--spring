import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFile, faSearch, faColumns, faChartPie, faCog, faFolderOpen, faCaretDown,
  faTimesCircle, faPlusCircle, faSquare, faCheckSquare, faFilter, faCompressAlt,
  faExpandAlt, faFileExport, faBrowser, faExclamationTriangle, faChevronRight,
  faChevronLeft
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Quasar, QVirtualScroll } from 'quasar'
import clickOutside from './directives/click-outside'
import '@vueform/slider/themes/default.css'
import './assets/settings.css'
import './assets/main.css'
import './assets/responsive.css'
import { selectedLocale, loadLocaleMessages } from './plugins/i18n'

library.add(
  faFile, faSearch, faColumns, faChartPie, faCog, faFolderOpen, faCaretDown,
  faTimesCircle, faPlusCircle, faSquare, faCheckSquare, faFilter, faCompressAlt,
  faExpandAlt, faFileExport, faBrowser, faExclamationTriangle, faChevronRight,
  faChevronLeft
)

const i18n = createI18n({
  locale: selectedLocale, // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: loadLocaleMessages()
})

const app = createApp(App)
app.use(router)
app.use(Quasar, {
  components: { QVirtualScroll }
})
app.use(i18n)
app.directive('click-outside', clickOutside)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
