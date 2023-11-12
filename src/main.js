import './assets/main.css'
import 'primevue/resources/themes/saga-blue/theme.css'       //theme
import 'primevue/resources/primevue.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Tooltip from 'primevue/tooltip'
import Dialog from 'primevue/dialog'
import ContextMenu from 'primevue/contextmenu'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.directive('tooltip', Tooltip)

app.component('DataTable', DataTable)
app.component('InputText', InputText)
app.component('Button', Button)
app.component('Column', Column)
app.component('ColumnGroup', ColumnGroup)
app.component('ContextMenu', ContextMenu)
app.component('Dialog', Dialog)

export const toastAdd = app.config.globalProperties.$toast

app.mount('#app')
