<script>
import Vue from 'vue'
import '../styles/main.scss'
import axios from 'axios'

export default Vue.extend({
  name: 'ServeDev',
  data() {
    return {
      fio: {
        surname: 'Иванов',
        name: 'Иван',
        patronymic: 'Иванович',
        gender: 'MALE'
      }
    }
  },
  methods: {
    async fetch(data) {
      return await axios.request({
        method: 'POST',
        url: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio',
        headers: {
          Authorization: 'Token ' + 'Your token'
        },
        data
      })
    }
  }
})
</script>

<template>
  <div id="app">
    <fio-autocomplete-field v-model="fio" :load-using="fetch" />
  </div>
</template>
