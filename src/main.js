import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFile, faSearch, faColumns, faChartPie, faCog, faFolderOpen, faCaretDown,
  faTimesCircle, faPlusCircle, faSquare, faCheckSquare, faFilter, faCompressAlt,
  faExpandAlt, faFileExport, faBrowser, faExclamationTriangle
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Quasar, QVirtualScroll } from 'quasar'
import clickOutside from './directives/click-outside'
import '@vueform/slider/themes/default.css'
import './assets/settings.css'
import './assets/main.css'
import './assets/responsive.css'

library.add(
  faFile, faSearch, faColumns, faChartPie, faCog, faFolderOpen, faCaretDown,
  faTimesCircle, faPlusCircle, faSquare, faCheckSquare, faFilter, faCompressAlt,
  faExpandAlt, faFileExport, faBrowser, faExclamationTriangle
)

const app = createApp(App)
app.use(router)
app.use(Quasar, {
  components: { QVirtualScroll }
})
app.directive('click-outside', clickOutside)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
