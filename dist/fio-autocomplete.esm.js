//
var script = {
  name: 'FioAutocomplete',
  // vue component name
  props: {
    loadUsing: {
      type: Function,
      required: true
    },
    value: {
      type: Object,
      default: () => {}
    },
    placeholder: {
      type: String,
      default: 'Иванов Сергей Михайлович'
    },
    context: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      inputValue: '',
      originalValue: null,
      data: {
        name: null,
        surname: null,
        patronymic: null,
        gender: null
      },
      disableSearch: false,
      selectedIndex: null,
      suggestions: [],
      predictedStep: null,
      caretPosition: 0,
      focused: false
    };
  },

  computed: {
    fio() {
      let {
        surname,
        name,
        patronymic
      } = this.data;
      return [surname, name, patronymic].join(' ').trim();
    },

    fioParts() {
      return this.toCapitalize(this.inputValue).split(' ');
    },

    prefixValue() {
      return this.fioParts.slice(0, this.step - 1).join(' ').trim();
    },

    suffixValue() {
      return this.fioParts.slice(this.step).join(' ').trim();
    },

    stepValue() {
      return this.toCapitalize(this.step <= 2 ? this.fioParts[this.step - 1] : this.fioParts.slice(2).join(' '));
    },

    stepName() {
      const step = this.step >= 3 ? 3 : this.step;
      return ['surname', 'name', 'patronymic'][step - 1];
    },

    editingParts() {
      return !(this.step === this.inputValue.split(' ', 3).length);
    },

    step() {
      return !this.predictedStep ? this.inputValue.split(' ', 3).length : this.predictedStep;
    },

    hasData() {
      return !!(this.data.surname || this.data.name || this.data.patronymic);
    },

    selection() {
      if (this.suggestions[this.selectedIndex]) {
        return this.suggestions[this.selectedIndex];
      }

      return null;
    },

    mask() {
      if (this.editingParts && this.stepValue.length > 0) {
        return '';
      }

      if (this.focused && this.inputValue) {
        if (this.suggestions.length > 0 && this.suggestions[0].value.startsWith(this.stepValue.trim()) && this.inputValue.endsWith(this.stepValue.toLowerCase().trim())) {
          return this.suggestions[0].value;
        }

        if (!this.stepValue) {
          switch (this.stepName) {
            case 'name':
              return 'Имя Отчество';

            case 'patronymic':
              return 'Отчество';

            case undefined:
              return '';
          }
        }

        return '';
      }

      if (this.hasData) {
        return '';
      }

      return this.placeholder;
    }

  },
  watch: {
    selectedIndex() {
      if (this.selection) {
        if (!this.originalValue) {
          this.originalValue = this.inputValue;
        }

        this.inputValue = [this.prefixValue, this.selection.value, this.suffixValue].join(' ').trim();
      }
    },

    step() {
      this.suggestions = [];
    },

    fioParts() {
      if (this.fioParts.length <= 1) {
        this.data.gender = null;
      }

      let filtered = this.fioParts.filter(Boolean);
      if (filtered.length !== this.fioParts.length) this.inputValue = this.inputValue.trimStart();
    },

    inputValue() {
      this.inputValue = this.inputValue.replace('  ', ' ');
      this.inputValue = this.inputValue.replace('.', '');
      let [surname, name, patronymic, ...parts] = this.toCapitalize(this.inputValue).split(' '); // When user cleared whole input value.

      if (this.inputValue === '') {
        this.predictedStep = null;
        this.data = {
          name: null,
          surname: null,
          patronymic: null,
          gender: null
        };
        return;
      }

      this.data = { ...this.data,
        surname,
        name,
        patronymic: [patronymic, ...parts].join(' ')
      };
    }

  },

  mounted() {
    this.data = { ...this.data,
      ...this.value
    };
    this.disableSearch = true;
    this.inputValue = this.fio.toLowerCase();
  },

  methods: {
    toCapitalize(str = '') {
      return str.replace(/[А-Яа-яЁёA-Za-z]\S*/g, w => w.replace(/^[A-Za-zА-Яа-яЁё]/, c => c.toUpperCase()));
    },

    setNextStep(e) {
      if (this.stepValue.length === 0) {
        e.preventDefault();
      }

      if (this.editingParts && this.prefixValue.length + this.stepValue.length === this.caretPosition - 1) {
        this.$refs.input.setSelectionRange(this.caretPosition + 1, this.caretPosition + 1);
        this.predictStep(e, 1);
        e.preventDefault();
      }

      if (this.stepValue) {
        // Trim spaces if user decide to use more that one.
        this.inputValue = this.inputValue.trim(); // Clear selections.

        this.selectedIndex = null;
        this.originalValue = null; // If suggestion is the same as value - add gender.

        if (this.suggestions.length > 0 && this.suggestions[0].value === this.stepValue) {
          this.setGender(this.suggestions[0].data.gender);
        } // Clean suggestions.


        this.suggestions = []; // Predict new step.

        this.predictStep(e, 1); // Load only if we have only one part in patronymic.

        if (this.stepName !== 'patronymic' && this.stepValue && !this.stepValue.endsWith(' ')) this.loadSuggestions();
      }
    },

    onFocus() {
      this.focused = true;
    },

    afterFocus() {
      this.focused = false;
      this.$nextTick(() => {
        this.$emit('input', this.data);
      });
    },

    predictStep({
      target
    }, offset = 0) {
      // When user pressed right arrow with empty space
      if (offset === 1 && !this.stepValue) return;
      if (offset === 1 && this.inputValue === this.prefixValue) this.inputValue += ' ';
      if (target.selectionStart === target.selectionEnd) this.caretPosition = target.selectionStart + offset;
      const [surname, name] = target.value.split(' ', 2);
      const surnameLength = surname ? surname.length : 0;
      const nameLength = name ? name.length : 0;
      if (this.caretPosition >= 0 && this.caretPosition <= surnameLength) this.predictedStep = 1;else if (this.caretPosition >= surnameLength && this.caretPosition <= surnameLength + nameLength + 1) this.predictedStep = 2;else this.predictedStep = 3;
    },

    restoreOriginalValue() {
      if (this.originalValue) {
        this.inputValue = this.originalValue;
        this.selectedIndex = null;
        this.originalValue = null;
      }
    },

    setInputValue({
      target,
      data,
      key
    }) {
      if (key !== ' ') {
        this.predictStep({
          target
        });
      }

      this.inputValue = target.value.toLowerCase().replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '').replace(/-[А-Яа-яЁёA-Za-z]\S*/g, w => w.replace(/^-[A-Za-zА-Яа-яЁё]/, c => c.toUpperCase()));
      this.disableSearch = !/[А-Яа-яЁё_-]/.test(data) && data !== null;

      if (!/[A-Za-zА-Яа-яЁё_-]/.test(data) && data !== null && data !== ' ') {
        this.inputValue = this.inputValue.slice(0, -1);
      } else {
        this.loadSuggestions();
      }
    },

    moveScrollBar() {
      if (this.selectedIndex > 3) {
        this.$refs.scroll.scrollTop = (this.selectedIndex - 3) * this.$refs.scrollItems[0].clientHeight;
      }

      if (this.selectedIndex === 0) {
        this.$refs.scroll.scrollTop = 0;
      }
    },

    increment() {
      const length = this.suggestions.length;

      if (length) {
        this.selectedIndex = this.selectedIndex + 1 < length && this.selectedIndex !== null ? this.selectedIndex + 1 : 0;
        this.moveScrollBar();
      }
    },

    decrement() {
      const length = this.suggestions.length;

      if (length) {
        this.selectedIndex = this.selectedIndex - 1 >= 0 ? this.selectedIndex - 1 : length - 1;
        this.moveScrollBar();
      }
    },

    setGender(gender) {
      if (gender === 'UNKNOWN' && this.data.gender !== 'UNKNOWN') return;
      this.data.gender = gender;
    },

    setValueBySelection() {
      this.$refs.input.focus();
      let parts = this.fioParts;

      if (this.selection) {
        parts.splice(this.step - 1, 1, this.selection.value);
        this.setGender(this.selection.data.gender);
      }

      this.inputValue = parts.join(' ').trim();
      this.caretPosition = this.inputValue.length + 1; // Clear selections.

      this.selectedIndex = null;
      this.originalValue = null;
      if (this.stepName === 'patronymic') this.$refs.input.blur(); // Clean suggestions.

      this.suggestions = []; // Insert dummy space.

      this.inputValue += ' '; // Predict new step.

      this.predictStep({
        target: this.$refs.input
      }, 1);
      this.$nextTick(() => {
        // Load only if we have only one part in patronymic.
        if (this.stepName !== 'patronymic' && !this.stepValue.endsWith(' ')) this.loadSuggestions();
      });
    },

    loadSuggestions() {
      // Save the cancel token for the current request
      const step = this.stepName;
      !this.disableSearch ? this.loadUsing({
        query: this.stepValue.trim(),
        gender: this.data.gender,
        parts: [step ? step.toUpperCase() : this.hasData ? 'PATRONYMIC' : 'SURNAME']
      }).then(data => {
        this.selectedIndex = null;
        this.suggestions = data;
        this.$forceUpdate();
      }) : null;
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "fio-autocomplete"
  }, [_c('div', {
    staticClass: "fio-autocomplete--wrapper",
    on: {
      "click": function ($event) {
        return _vm.$refs.input.focus();
      }
    }
  }, [_c('div', {
    staticClass: "fio-autocomplete--sugg"
  }, [_vm.mask ? _c('span', {
    staticClass: "fio-autocomplete--placeholder",
    domProps: {
      "textContent": _vm._s(_vm.prefixValue)
    }
  }) : _vm._e(), _vm._v(" "), _c('span', {
    staticClass: "fio-autocomplete--mask",
    domProps: {
      "textContent": _vm._s(' ' + _vm.mask)
    }
  })]), _vm._v(" "), _c('input', {
    ref: "input",
    staticClass: "fio-autocomplete--input",
    attrs: {
      "autocomplete": _vm.context.autocomplete ? _vm.context.autocomplete : 'off',
      "autocorrect": _vm.context.autocorrect ? _vm.context.autocorrect : 'off',
      "autocapitalize": "words",
      "type": "text"
    },
    domProps: {
      "value": _vm.inputValue
    },
    on: {
      "click": function ($event) {
        return _vm.predictStep($event);
      },
      "focus": _vm.onFocus,
      "focusout": _vm.afterFocus,
      "input": _vm.setInputValue,
      "keydown": [function ($event) {
        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "left", 37, $event.key, ["Left", "ArrowLeft"])) {
          return null;
        }

        if ('button' in $event && $event.button !== 0) {
          return null;
        }

        return _vm.predictStep($event, -1);
      }, function ($event) {
        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "right", 39, $event.key, ["Right", "ArrowRight"])) {
          return null;
        }

        if ('button' in $event && $event.button !== 2) {
          return null;
        }

        return _vm.predictStep($event, 1);
      }, function ($event) {
        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "down", 40, $event.key, ["Down", "ArrowDown"])) {
          return null;
        }

        $event.preventDefault();
        return _vm.increment($event);
      }, function ($event) {
        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "up", 38, $event.key, ["Up", "ArrowUp"])) {
          return null;
        }

        $event.preventDefault();
        return _vm.decrement($event);
      }, function ($event) {
        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "space", 32, $event.key, [" ", "Spacebar"])) {
          return null;
        }

        return _vm.setNextStep($event);
      }, function ($event) {
        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
          return null;
        }

        $event.preventDefault();
        return _vm.setValueBySelection($event);
      }]
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "fio-autocomplete--dropdown-wrapper"
  }, [_c('transition', {
    attrs: {
      "name": "fio-dropdown-animation"
    }
  }, [_vm.suggestions.length && _vm.focused || _vm.selectedIndex !== null ? _c('ul', {
    ref: "scroll",
    staticClass: "fio-autocomplete--dropdown"
  }, _vm._l(_vm.suggestions, function (option, index) {
    return _c('li', {
      key: option.value,
      ref: "scrollItems",
      refInFor: true,
      staticClass: "fio-autocomplete--dropdown--item",
      class: {
        selected: _vm.selectedIndex === index
      },
      domProps: {
        "textContent": _vm._s([_vm.prefixValue, option.value, _vm.suffixValue].join(' ').trim())
      },
      on: {
        "mouseleave": _vm.restoreOriginalValue,
        "mousemove": function ($event) {
          _vm.suggestions.length ? _vm.selectedIndex = index : false;
        },
        "click": function ($event) {
          $event.preventDefault();
          return _vm.setValueBySelection($event);
        }
      }
    });
  }), 0) : _vm._e()])], 1)]);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

// Import vue component
var entry_esm = (() => {
  // Get component instance
  const installable = __vue_component__; // Attach install function executed by Vue.use()

  installable.install = Vue => {
    Vue.component('FioAutocompleteField', installable);
  };

  return installable;
})();

export default entry_esm;
