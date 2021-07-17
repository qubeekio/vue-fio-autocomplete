// Import vue component
import component from '@/FioAutocompleteField.vue'

export default (() => {
  // Get component instance
  const installable = component

  // Attach install function executed by Vue.use()
  installable.install = (Vue) => {
    Vue.component('FioAutocompleteField', installable)
  }
  return installable
})()
