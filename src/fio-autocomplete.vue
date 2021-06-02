<template>
  <div class="fio-autocomplete">
    <div class="fio-autocomplete--wrapper" @click="$refs.input.focus()">
      <div class="fio-autocomplete--sugg">
        <span
          v-if="placeholder"
          class="fio-autocomplete--placeholder"
          v-text="fio"
        />
        <span class="fio-autocomplete--mask" v-text="' ' + placeholder" />
      </div>
      <input
        ref="input"
        :value="inputValue"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        class="fio-autocomplete--input"
        type="text"
        @blur="afterFocus"
        @focusin="onFocus"
        @input="setInputValue"
        @keydown.enter.prevent="setValue(selection)"
        @keydown.down.prevent="increment"
        @keydown.up.prevent="decrement"
        @keyup.space.prevent="setNextStep"
      />
    </div>
    <ul
      v-if="suggestions.length && focused"
      ref="scroll"
      class="fio-autocomplete--dropdown"
      @mouseleave="restoreOriginalValue"
    >
      <li
        v-for="(option, index) in suggestions"
        :key="option.value"
        ref="scrollItems"
        :class="{ selected: selectedIndex === index }"
        class="fio-autocomplete--dropdown--item"
        @click="setValueBySelection"
        @mousemove="selectedIndex = index"
        v-text="prefix + option.value"
      />
    </ul>
  </div>
</template>

<script>
import "./styles/main.scss"
import axios from "axios"

export default {
  name: "FioAutocomplete", // vue component name
  props: {
    api: {
      type: String,
      required: true
    },
    requestOptions: {
      type: Object,
      default: () => {}
    },
    value: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      inputValue: "",
      originalValue: null,
      data: {
        name: null,
        surname: null,
        patronymic: null,
        gender: null,
        qc: null
      },
      canceller: axios.CancelToken.source(),
      ignoreMissedValues: false,
      disableSearch: false,
      selectedIndex: 0,
      step: "surname",
      suggestions: [],
      focused: false
    }
  },
  computed: {
    hasData() {
      return !!(this.data.surname || this.data.name || this.data.patronymic)
    },
    prefix() {
      if (this.step === "name") {
        return [this.data.surname].join(" ") + " "
      }

      if (this.step === "patronymic") {
        return [this.data.surname, this.data.name].join(" ") + " "
      }

      return ""
    },
    fio() {
      return [this.data.surname, this.data.name, this.data.patronymic]
        .join(" ")
        .trim()
    },
    selection() {
      if (this.suggestions[this.selectedIndex]) {
        return this.suggestions[this.selectedIndex]
      }
      return null
    },
    stepValue() {
      let value = this.inputValue

      if (this.step === "name" || this.step === "patronymic") {
        value = value.replace(this.data.surname, "")

        if (this.step === "patronymic") {
          value = value.trimStart().replace(this.data.name, "")
        }
      }

      return value
    },
    placeholder() {
      if (this.focused && this.inputValue) {
        if (
          this.suggestions.length > 0 &&
          this.suggestions[0].value.startsWith(this.stepValue.trim())
        ) {
          return this.suggestions[0].value
        }

        if (this.stepValue.endsWith(" ") && this.stepValue.length <= 1) {
          switch (this.step) {
            case "name":
              return "Имя Отчество"
            case "patronymic":
              return "Отчество"
            case undefined:
              return ""
          }
        }

        return ""
      }
      if (this.hasData) {
        return ""
      }

      return "Иванов Сергей Михайлович"
    }
  },
  watch: {
    inputValue(newVal, oldVal) {
      this.inputValue = this.inputValue.replaceAll("  ", " ")

      // When user cleared whole input value.
      if (this.inputValue === "") {
        this.step = "surname"
        this.data = {
          name: null,
          surname: null,
          patronymic: null,
          gender: null,
          qc: null
        }

        return
      }

      if (!this.originalValue) {
        // Calculate difference between new and old values.
        let diff = Math.abs(oldVal.length - (newVal ? newVal.length : 0))

        if (diff !== 0) {
          // When user decided to delete something more than 1 char.
          let oldChunks = oldVal.split(" ").filter((i) => i.length > 0)
          let newChunks = newVal.split(" ").filter((i) => i.length > 0)

          if (diff > 1 || oldChunks.length !== newChunks.length) {
            this.inputValue = this.inputValue.trim()
            let steps = ["surname", "name", "patronymic"]

            steps.forEach((step, i) => {
              if (newChunks[i]) {
                this.data[step] =
                  typeof newChunks[i + 1] !== "undefined" ||
                  this.ignoreMissedValues
                    ? newChunks[i]
                    : null
                this.step = step
              } else {
                this.data[step] = null
              }
            })

            this.$nextTick(async () => {
              await this.loadSuggestions()
            })
          } else {
            // If user delete only one char it's not a problem for us.
            this.unsetValue()
          }
        }
      }

      this.$emit("input", this.data)
    },
    selectedIndex() {
      if (this.selection) {
        if (!this.originalValue) {
          this.originalValue = this.inputValue
        }
        this.inputValue = (this.prefix + this.selection.value).trim()
      }
    }
  },
  mounted() {
    this.data = { ...this.data, ...this.value }
    this.ignoreMissedValues = true
    this.disableSearch = true

    this.inputValue = this.fio

    this.$nextTick(() => {
      this.ignoreMissedValues = false
    })
  },
  methods: {
    restoreOriginalValue() {
      if (this.originalValue) {
        this.inputValue = this.originalValue
        this.selectedIndex = null
        this.originalValue = null
      }
    },
    setInputValue({ target, data }) {
      this.inputValue = target.value
      this.inputValue = this.inputValue
        .toLowerCase()
        .replace(/[А-Яа-яЁёA-Za-z]\S*/g, (w) =>
          w.replace(/^[A-Za-zА-Яа-яЁё]/, (c) => c.toUpperCase())
        )

      this.disableSearch = !/[А-Яа-яЁё_-]/.test(data) && data !== null

      if (!/[A-Za-zА-Яа-яЁё_-]/.test(data) && data !== null && data !== " ") {
        this.inputValue = this.inputValue.slice(0, -1)
      } else {
        this.loadSuggestions()
      }
    },
    setNextStep() {
      if (this.stepValue.trim().length === 0) {
        return
      }

      this.originalValue = null
      this.setValue()

      if (this.step === "patronymic") {
        this.inputValue += " "
      }
    },
    moveScrollBar() {
      if (this.selectedIndex > 3) {
        this.$refs.scroll.scrollTop =
          (this.selectedIndex - 3) * this.$refs.scrollItems[0].clientHeight
      }
      if (this.selectedIndex === 0) {
        this.$refs.scroll.scrollTop = 0
      }
    },
    increment() {
      if(this.suggestions.length) {
        const length = this.suggestions.length
        if (this.selectedIndex + 1 < length) {
          this.selectedIndex++
        } else {
          this.selectedIndex = 0
        }
        this.moveScrollBar()
      }
    },
    decrement() {
      if(this.suggestions.length) {
        const length = this.suggestions.length
        if (this.selectedIndex - 1 >= 0) {
          this.selectedIndex--
        } else {
          this.selectedIndex = length - 1
        }
        this.moveScrollBar()
      }
    },
    setValueBySelection() {
      this.$refs.input.focus()
      this.setValue(this.selection)
    },
    onFocus() {
      if (!this.selection) {
        this.data[this.step] = null
        this.focused = true
        this.loadSuggestions()
      }
    },
    afterFocus() {
      if (!this.selectedIndex) {
        this.focused = false
        this.setValue(null, false)
      }
    },
    chooseNextStep() {
      if (this.step === "surname") return "name"
      if (this.step === "name") return "patronymic"
      if (this.step === undefined) return "surname"
    },
    choosePreviousStep() {
      if (this.step === "name") return "surname"
      if (this.step === "patronymic") return "name"
      if (this.step === undefined) return "patronymic"
      return "surname"
    },
    setValue(selection = null, setNextStep = true) {
      this.originalValue = null
      this.selectedIndex = null
      if (selection) {
        this.data[this.step] = selection.value
        this.data.gender = selection.data.gender
        this.data.qc = selection.data.qc
      } else {
        if (
          this.suggestions.length > 0 &&
          this.suggestions[0].value === this.stepValue.trim()
        ) {
          this.setValue(this.suggestions[0])
          return
        }

        this.data[this.step] = this.stepValue.trim()
      }

      this.suggestions = []
      if (setNextStep) {
        this.inputValue = this.fio
        if (this.step !== "patronymic") {
          this.step = this.chooseNextStep()
          this.inputValue += " "
          this.$refs.input.focus()
          this.focused = true
        }
      }
    },
    unsetValue() {
      this.data[this.step] = null

      if (!this.stepValue) {
        this.step = this.choosePreviousStep()
        this.data[this.step] = null
        if (this.step === "name") {
          this.data.gender = null
        }
      }
    },
    loadSuggestions() {
      // Check if there are any previous pending requests
      if (typeof this.canceller !== typeof undefined) {
        this.canceller.cancel("Operation canceled due to new request.")
      }

      // Save the cancel token for the current request
      this.canceller = axios.CancelToken.source()

      !this.disableSearch
        ? axios
            .request({
              method: "POST",
              cancelToken: this.canceller.token,
              url: this.api,
              data: {
                query: this.stepValue,
                gender: this.data.gender,
                parts: [
                  this.step
                    ? this.step.toUpperCase()
                    : this.hasData
                    ? "PATRONYMIC"
                    : "SURNAME"
                ]
              },
              ...this.requestOptions
            })
            .then(({ data }) => {
              this.selectedIndex = null
              this.suggestions = data.suggestions
              this.$forceUpdate()
            })
        : null
    }
  }
}
</script>
