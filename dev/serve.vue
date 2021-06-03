<script>
import Vue from "vue"
import FioAutocomplete from "@/fio-autocomplete.vue"

export default Vue.extend({
  name: "ServeDev",
  components: {
    FioAutocomplete
  },
  data() {
    return {
      options: {
        headers: {
          Authorization: "Token " + process.env.TOKEN
        }
      },
      fio: {
        surname: "Иванов",
        name: "Иван",
        patronymic: "Иванович",
        gender: "MALE"
      }
    }
  }
})
</script>

<template>
  <div id="app">
    <fio-autocomplete
      v-model="fio"
      :request-options="options"
      api="https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio"
    />
  </div>
</template>
