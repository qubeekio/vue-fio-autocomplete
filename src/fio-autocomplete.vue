<template>
  <div class="fio-autocomplete">
    <div class="fio-autocomplete--wrapper" @click="$refs.input.focus()">
      <div class="fio-autocomplete--sugg">
        <span
          v-if="mask"
          class="fio-autocomplete--placeholder"
          v-text="prefixValue"
        />
        <span class="fio-autocomplete--mask" v-text="' ' + mask" />
      </div>
      <input
        ref="input"
        :autocomplete="context.autocomplete ? context.autocomplete : 'off'"
        :autocorrect="context.autocorrect ? context.autocorrect : 'off'"
        :value="inputValue"
        autocapitalize="words"
        class="fio-autocomplete--input"
        type="text"
        @click="predictStep($event)"
        @focus="onFocus"
        @focusout="afterFocus"
        @input="setInputValue"
        @keydown.left="predictStep($event, -1)"
        @keydown.right="predictStep($event, 1)"
        @keydown.down.prevent="increment"
        @keydown.up.prevent="decrement"
        @keydown.space="setNextStep"
        @keydown.enter.prevent="setValueBySelection"
      />
    </div>
    <div class="fio-autocomplete--dropdown-wrapper">
      <ul
        v-if="(suggestions.length && focused) || selectedIndex !== null"
        ref="scroll"
        class="fio-autocomplete--dropdown"
      >
        <li
          v-for="(option, index) in suggestions"
          :key="option.value"
          ref="scrollItems"
          :class="{ selected: selectedIndex === index }"
          class="fio-autocomplete--dropdown--item"
          @mouseleave="restoreOriginalValue"
          @mousemove="selectedIndex = index"
          @click.prevent="setValueBySelection"
          v-text="[prefixValue, option.value, suffixValue].join(' ').trim()"
        />
      </ul>
    </div>
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
    },
    placeholder: {
      type: String,
      default: "Иванов Сергей Михайлович"
    },
    context: {
      type: Object,
      default: () => ({})
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
        gender: null
      },
      canceller: axios.CancelToken.source(),
      disableSearch: false,
      selectedIndex: null,
      suggestions: [],
      predictedStep: null,
      caretPosition: 0,
      focused: false
    }
  },
  computed: {
    fio() {
      let { surname, name, patronymic } = this.data
      return [surname, name, patronymic].join(" ").trim()
    },
    fioParts() {
      return this.toCapitalize(this.inputValue).split(" ")
    },
    prefixValue() {
      return this.fioParts
        .slice(0, this.step - 1)
        .join(" ")
        .trim()
    },
    suffixValue() {
      return this.fioParts.slice(this.step).join(" ").trim()
    },
    stepValue() {
      return this.toCapitalize(
        this.step <= 2
          ? this.fioParts[this.step - 1]
          : this.fioParts.slice(2).join(" ")
      )
    },
    stepName() {
      const step = this.step >= 3 ? 3 : this.step
      return ["surname", "name", "patronymic"][step - 1]
    },
    editingParts() {
      return !(this.step === this.inputValue.split(" ", 3).length)
    },
    step() {
      return !this.predictedStep
        ? this.inputValue.split(" ", 3).length
        : this.predictedStep
    },
    hasData() {
      return !!(this.data.surname || this.data.name || this.data.patronymic)
    },
    selection() {
      if (this.suggestions[this.selectedIndex]) {
        return this.suggestions[this.selectedIndex]
      }
      return null
    },
    mask() {
      if (this.editingParts && this.stepValue.length > 0) {
        return ""
      }

      if (this.focused && this.inputValue) {
        if (
          this.suggestions.length > 0 &&
          this.suggestions[0].value.startsWith(this.stepValue.trim()) &&
          this.inputValue.endsWith(this.stepValue.toLowerCase().trim())
        ) {
          return this.suggestions[0].value
        }

        if (!this.stepValue) {
          switch (this.stepName) {
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

      return this.placeholder
    }
  },
  watch: {
    selectedIndex() {
      if (this.selection) {
        if (!this.originalValue) {
          this.originalValue = this.inputValue
        }
        this.inputValue = [
          this.prefixValue,
          this.selection.value,
          this.suffixValue
        ]
          .join(" ")
          .trim()
      }
    },
    step() {
      this.suggestions = []
    },
    fioParts() {
      if (this.fioParts.length <= 1) {
        this.data.gender = null
      }
      let filtered = this.fioParts.filter(Boolean)

      if (filtered.length !== this.fioParts.length)
        this.inputValue = this.inputValue.trimStart()
    },
    inputValue() {
      this.inputValue = this.inputValue.replace("  ", " ")
      this.inputValue = this.inputValue.replace(".", "")

      let [surname, name, patronymic, ...parts] = this.toCapitalize(
        this.inputValue
      ).split(" ")

      // When user cleared whole input value.
      if (this.inputValue === "") {
        this.predictedStep = null
        this.data = {
          name: null,
          surname: null,
          patronymic: null,
          gender: null
        }

        return
      }

      this.data = {
        ...this.data,
        surname,
        name,
        patronymic: [patronymic, ...parts].join(" ")
      }
    }
  },
  mounted() {
    this.data = { ...this.data, ...this.value }
    this.disableSearch = true
    this.inputValue = this.fio.toLowerCase()
  },
  methods: {
    toCapitalize(str = "") {
      return str.replace(/[А-Яа-яЁёA-Za-z]\S*/g, (w) =>
        w.replace(/^[A-Za-zА-Яа-яЁё]/, (c) => c.toUpperCase())
      )
    },
    setNextStep(e) {
      if (this.stepValue.length === 0) {
        e.preventDefault()
      }

      if (
        this.editingParts &&
        this.prefixValue.length + this.stepValue.length ===
          this.caretPosition - 1
      ) {
        this.$refs.input.setSelectionRange(
          this.caretPosition + 1,
          this.caretPosition + 1
        )
        this.predictStep(e, 1)
        e.preventDefault()
      }

      if (this.stepValue) {
        // Trim spaces if user decide to use more that one.
        this.inputValue = this.inputValue.trim()
        // Clear selections.
        this.selectedIndex = null
        this.originalValue = null
        // If suggestion is the same as value - add gender.
        if (
          this.suggestions.length > 0 &&
          this.suggestions[0].value === this.stepValue
        ) {
          this.setGender(this.suggestions[0].data.gender)
        }
        // Clean suggestions.
        this.suggestions = []
        // Predict new step.
        this.predictStep(e, 1)
        // Load only if we have only one part in patronymic.
        if (
          this.stepName !== "patronymic" &&
          this.stepValue &&
          !this.stepValue.endsWith(" ")
        )
          this.loadSuggestions()
      }
    },
    onFocus() {
      this.focused = true
    },
    afterFocus() {
      this.focused = false
      this.$nextTick(() => {
        this.$emit("input", this.data)
      })
    },
    predictStep({ target }, offset = 0) {
      // When user pressed right arrow with empty space
      if (offset === 1 && !this.stepValue) return

      if (offset === 1 && this.inputValue === this.prefixValue)
        this.inputValue += " "

      if (target.selectionStart === target.selectionEnd)
        this.caretPosition = target.selectionStart + offset

      const [surname, name] = target.value.split(" ", 2)

      const surnameLength = surname ? surname.length : 0
      const nameLength = name ? name.length : 0

      if (this.caretPosition >= 0 && this.caretPosition <= surnameLength)
        this.predictedStep = 1
      else if (
        this.caretPosition >= surnameLength &&
        this.caretPosition <= surnameLength + nameLength + 1
      )
        this.predictedStep = 2
      else this.predictedStep = 3
    },

    restoreOriginalValue() {
      if (this.originalValue) {
        this.inputValue = this.originalValue
        this.selectedIndex = null
        this.originalValue = null
      }
    },

    setInputValue({ target, data, key }) {
      console.log([key])
      if (key !== " ") {
        this.predictStep({ target })
      }

      this.inputValue = target.value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "")
        .replace(/-[А-Яа-яЁёA-Za-z]\S*/g, (w) =>
          w.replace(/^-[A-Za-zА-Яа-яЁё]/, (c) => c.toUpperCase())
        )

      this.disableSearch = !/[А-Яа-яЁё_-]/.test(data) && data !== null

      if (!/[A-Za-zА-Яа-яЁё_-]/.test(data) && data !== null && data !== " ") {
        this.inputValue = this.inputValue.slice(0, -1)
      } else {
        this.loadSuggestions()
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
      const length = this.suggestions.length
      if (length) {
        this.selectedIndex =
          this.selectedIndex + 1 < length && this.selectedIndex !== null
            ? this.selectedIndex + 1
            : 0
        console.log(this.selectedIndex)
        this.moveScrollBar()
      }
    },

    decrement() {
      const length = this.suggestions.length
      if (length) {
        this.selectedIndex =
          this.selectedIndex - 1 >= 0 ? this.selectedIndex - 1 : length - 1
        this.moveScrollBar()
      }
    },

    setGender(gender) {
      if (gender === "UNKNOWN" && this.data.gender !== "UNKNOWN") return

      this.data.gender = gender
    },

    setValueBySelection() {
      this.$refs.input.focus()
      let parts = this.fioParts
      parts.splice(this.step - 1, 1, this.selection.value)
      this.setGender(this.selection.data.gender)

      this.inputValue = parts.join(" ").trim()
      this.caretPosition = this.inputValue.length + 1

      // Clear selections.
      this.selectedIndex = null
      this.originalValue = null

      if (this.stepName === "patronymic") this.$refs.input.blur()

      // Clean suggestions.
      this.suggestions = []
      // Insert dummy space.
      this.inputValue += " "

      // Predict new step.
      this.predictStep({ target: this.$refs.input }, 1)

      this.$nextTick(() => {
        // Load only if we have only one part in patronymic.
        if (this.stepName !== "patronymic" && !this.stepValue.endsWith(" "))
          this.loadSuggestions()
      })
    },

    loadSuggestions() {
      // Check if there are any previous pending requests
      if (typeof this.canceller !== typeof undefined) {
        this.canceller.cancel("Operation canceled due to new request.")
      }

      // Save the cancel token for the current request
      this.canceller = axios.CancelToken.source()
      const step = this.stepName

      !this.disableSearch
        ? axios
            .request({
              method: "POST",
              cancelToken: this.canceller.token,
              url: this.api,
              data: {
                query: this.stepValue.trim(),
                gender: this.data.gender,
                parts: [
                  step
                    ? step.toUpperCase()
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
