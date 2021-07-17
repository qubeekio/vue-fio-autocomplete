import Vue from 'vue'
import Dev from './serve.vue'
import installer from '../src/entry'

Vue.use(installer)

Vue.config.productionTip = false

new Vue({
  render: (h) => h(Dev)
}).$mount('#app')
