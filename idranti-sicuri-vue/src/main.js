// Bootstrapping dell'app Vue: qui registriamo i componenti globali, il router e lo store Vuex.
// Nota: lo store viene registrato con `app.use(store)` per assicurare che `this.$store` sia
// disponibile in tutti i componenti (fix per errori tipo "Cannot read properties of undefined (reading 'state')").
import { createApp } from 'vue'
import App from './App.vue'
import TheNavBar from './components/layouts/TheNavBar.vue'
import Map from './pages/Map.vue'
import store from './store/index.js'
import BaseButton from './components/bases/BaseButton.vue'
import BaseDialog from './components/bases/BaseDialog.vue'
import TheHeader from './components/layouts/TheHeader.vue'
import BaseInput from './components/bases/BaseInput.vue'
import BaseCard from './components/bases/BaseCard.vue'
import router from './router'
const app = createApp(App)
app.use(store)
app.component('TheNavBar', TheNavBar)
app.component('Map', Map)
app.component('BaseButton', BaseButton)
app.component('BaseDialog', BaseDialog)
app.component('TheHeader', TheHeader)
app.component('BaseInput', BaseInput)
app.component('BaseCard', BaseCard)
app.use(router)
app.mount('#app')
