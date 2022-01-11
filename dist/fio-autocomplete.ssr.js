'use strict';function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}var script = {
  name: 'FioAutocomplete',
  // vue component name
  props: {
    loadUsing: {
      type: Function,
      required: true
    },
    value: {
      type: Object,
      default: function _default() {}
    },
    placeholder: {
      type: String,
      default: 'Иванов Сергей Михайлович'
    },
    context: {
      type: Object,
      default: function _default() {
        return {};
      }
    }
  },
  data: function data() {
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
    fio: function fio() {
      var _this$data = this.data,
          surname = _this$data.surname,
          name = _this$data.name,
          patronymic = _this$data.patronymic;
      return [surname, name, patronymic].join(' ').trim();
    },
    fioParts: function fioParts() {
      return this.toCapitalize(this.inputValue).split(' ');
    },
    prefixValue: function prefixValue() {
      return this.fioParts.slice(0, this.step - 1).join(' ').trim();
    },
    suffixValue: function suffixValue() {
      return this.fioParts.slice(this.step).join(' ').trim();
    },
    stepValue: function stepValue() {
      return this.toCapitalize(this.step <= 2 ? this.fioParts[this.step - 1] : this.fioParts.slice(2).join(' '));
    },
    stepName: function stepName() {
      var step = this.step >= 3 ? 3 : this.step;
      return ['surname', 'name', 'patronymic'][step - 1];
    },
    editingParts: function editingParts() {
      return !(this.step === this.inputValue.split(' ', 3).length);
    },
    step: function step() {
      return !this.predictedStep ? this.inputValue.split(' ', 3).length : this.predictedStep;
    },
    hasData: function hasData() {
      return !!(this.data.surname || this.data.name || this.data.patronymic);
    },
    selection: function selection() {
      if (this.suggestions[this.selectedIndex]) {
        return this.suggestions[this.selectedIndex];
      }

      return null;
    },
    mask: function mask() {
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
    selectedIndex: function selectedIndex() {
      if (this.selection) {
        if (!this.originalValue) {
          this.originalValue = this.inputValue;
        }

        this.inputValue = [this.prefixValue, this.selection.value, this.suffixValue].join(' ').trim();
      }
    },
    step: function step() {
      this.suggestions = [];
    },
    fioParts: function fioParts() {
      if (this.fioParts.length <= 1) {
        this.data.gender = null;
      }

      var filtered = this.fioParts.filter(Boolean);
      if (filtered.length !== this.fioParts.length) this.inputValue = this.inputValue.trimStart();
    },
    inputValue: function inputValue() {
      this.inputValue = this.inputValue.replace('  ', ' ');
      this.inputValue = this.inputValue.replace('.', '');

      var _this$toCapitalize$sp = this.toCapitalize(this.inputValue).split(' '),
          _this$toCapitalize$sp2 = _toArray(_this$toCapitalize$sp),
          surname = _this$toCapitalize$sp2[0],
          name = _this$toCapitalize$sp2[1],
          patronymic = _this$toCapitalize$sp2[2],
          parts = _this$toCapitalize$sp2.slice(3); // When user cleared whole input value.


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

      this.data = _objectSpread2(_objectSpread2({}, this.data), {}, {
        surname: surname,
        name: name,
        patronymic: [patronymic].concat(_toConsumableArray(parts)).join(' ')
      });
    }
  },
  mounted: function mounted() {
    this.data = _objectSpread2(_objectSpread2({}, this.data), this.value);
    this.disableSearch = true;
    this.inputValue = this.fio.toLowerCase();
  },
  methods: {
    toCapitalize: function toCapitalize() {
      var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return str.replace(/[А-Яа-яЁёA-Za-z]\S*/g, function (w) {
        return w.replace(/^[A-Za-zА-Яа-яЁё]/, function (c) {
          return c.toUpperCase();
        });
      });
    },
    setNextStep: function setNextStep(e) {
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

        this.predictStep(e, 2); // Load only if we have only one part in patronymic.

        if (this.stepName !== 'patronymic' && this.stepValue && !this.stepValue.endsWith(' ')) this.loadSuggestions();
      }
    },
    onFocus: function onFocus() {
      this.focused = true;
    },
    afterFocus: function afterFocus() {
      var _this = this;

      this.focused = false;
      this.$nextTick(function () {
        _this.$emit('input', _this.data);
      });
    },
    predictStep: function predictStep(_ref) {
      var target = _ref.target;
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      // When user pressed right arrow with empty space.
      if (offset === 1) {
        this.inputValue += ' ';
        this.selectedIndex = null;
      }

      if (target.selectionStart === target.selectionEnd) this.caretPosition = target.selectionStart + offset;

      var _target$value$split = target.value.split(' ', 2),
          _target$value$split2 = _slicedToArray(_target$value$split, 2),
          surname = _target$value$split2[0],
          name = _target$value$split2[1];

      var surnameLength = surname ? surname.length : 0;
      var nameLength = name ? name.length : 0;

      if (this.caretPosition >= 0 && this.caretPosition <= surnameLength) {
        this.predictedStep = 1;
        return;
      }

      if (this.caretPosition >= surnameLength && this.caretPosition <= surnameLength + nameLength + 1) {
        this.predictedStep = 2;
        return;
      }

      this.predictedStep = 3;
    },
    restoreOriginalValue: function restoreOriginalValue() {
      if (this.originalValue) {
        this.inputValue = this.originalValue;
        this.selectedIndex = null;
        this.originalValue = null;
      }
    },
    setInputValue: function setInputValue(_ref2) {
      var target = _ref2.target,
          data = _ref2.data,
          key = _ref2.key;

      if (key !== ' ') {
        this.predictStep({
          target: target
        });
      }

      this.inputValue = target.value.toLowerCase().replace(/(?:(?![ -#%-\*,-;\?-\]_a-\{\}\xA0\xA1\xA7\xAA\xAB\xB2\xB3\xB5-\xB7\xB9-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559-\u058A\u05BE\u05C0\u05C3\u05C6\u05D0-\u05EA\u05EF-\u05F4\u0609\u060A\u060C\u060D\u061B\u061E-\u064A\u0660-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF-\u070D\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07F7-\u07FA\u0800-\u0815\u081A\u0824\u0828\u0830-\u083E\u0840-\u0858\u085E\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0964-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u09FD\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A76\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AF0\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C66-\u0C6F\u0C77-\u0C7E\u0C80\u0C84-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0DF4\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E4F-\u0E5B\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F04-\u0F12\u0F14\u0F20-\u0F33\u0F3A-\u0F3D\u0F40-\u0F47\u0F49-\u0F6C\u0F85\u0F88-\u0F8C\u0FD0-\u0FD4\u0FD9\u0FDA\u1000-\u102A\u103F-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1360-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1400-\u166C\u166E-\u169C\u16A0-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1735\u1736\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D4-\u17DA\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1800-\u180A\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1944-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A1E-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA0-\u1AAD\u1B05-\u1B33\u1B45-\u1B4B\u1B50-\u1B60\u1B83-\u1BA0\u1BAE-\u1BE5\u1BFC-\u1C23\u1C3B-\u1C49\u1C4D-\u1C88\u1C90-\u1CBA\u1CBD-\u1CC7\u1CD3\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2000-\u200A\u2010-\u2029\u202F-\u2043\u2045-\u2051\u2053-\u205F\u2070\u2071\u2074-\u2079\u207D-\u2089\u208D\u208E\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2308-\u230B\u2329\u232A\u2460-\u249B\u24EA-\u24FF\u2768-\u2793\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CF9-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D70\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E00-\u2E4F\u2E52\u3000-\u3003\u3005-\u3011\u3014-\u301F\u3021-\u3029\u3030-\u3035\u3038-\u303D\u3041-\u3096\u309D-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA62B\uA640-\uA66E\uA673\uA67E-\uA69D\uA6A0-\uA6EF\uA6F2-\uA6F7\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA877\uA882-\uA8B3\uA8CE-\uA8D9\uA8F2-\uA8FE\uA900-\uA925\uA92E-\uA946\uA95F-\uA97C\uA984-\uA9B2\uA9C1-\uA9CD\uA9CF-\uA9D9\uA9DE-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA5C-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAAEA\uAAF0-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABEB\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3F\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFE70-\uFE74\uFE76-\uFEFC\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF1B\uFF1F-\uFF3D\uFF3F\uFF41-\uFF5B\uFF5D\uFF5F-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD00-\uDD02\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDF9F-\uDFC3\uDFC8-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD6F\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC57-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD1F-\uDD39\uDD3F\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE50-\uDE58\uDE60-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEF6\uDF00-\uDF35\uDF39-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDF99-\uDF9C\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEAD\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF59\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC47-\uDC4D\uDC52-\uDC6F\uDC83-\uDCAF\uDCBB\uDCBC\uDCBE-\uDCC1\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD44\uDD47\uDD50-\uDD72\uDD74-\uDD76\uDD83-\uDDB2\uDDC1-\uDDC8\uDDCD\uDDD0-\uDDDF\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE38-\uDE3D\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA9\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC5B\uDC5D\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4-\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDC1-\uDDDB\uDE00-\uDE2F\uDE41-\uDE44\uDE50-\uDE59\uDE60-\uDE6C\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3E]|\uD806[\uDC00-\uDC2B\uDC3B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD44-\uDD46\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1-\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE3F-\uDE46\uDE50\uDE5C-\uDE89\uDE9A-\uDEA2\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40-\uDC45\uDC50-\uDC6C\uDC70-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDEF7\uDEF8\uDFB0\uDFC0-\uDFD4\uDFFF]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC70-\uDC74\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE6E\uDE6F\uDED0-\uDEED\uDEF5\uDF00-\uDF2F\uDF37-\uDF3B\uDF40-\uDF44\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE9A\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0-\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9F]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE87-\uDE8B]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59\uDD5E\uDD5F]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])[\s\S])/g, '').replace(/-[А-Яа-яЁёA-Za-z]\S*/g, function (w) {
        return w.replace(/^-[A-Za-zА-Яа-яЁё]/, function (c) {
          return c.toUpperCase();
        });
      });
      this.disableSearch = !/[А-Яа-яЁё_-]/.test(data) && data !== null;

      if (!/[A-Za-zА-Яа-яЁё_-]/.test(data) && data !== null && data !== ' ') {
        this.inputValue = this.inputValue.slice(0, -1);
      } else {
        this.loadSuggestions();
      }
    },
    moveScrollBar: function moveScrollBar() {
      if (this.selectedIndex > 3) {
        this.$refs.scroll.scrollTop = (this.selectedIndex - 3) * this.$refs.scrollItems[0].clientHeight;
      }

      if (this.selectedIndex === 0) {
        this.$refs.scroll.scrollTop = 0;
      }
    },
    increment: function increment() {
      var length = this.suggestions.length;

      if (length) {
        this.selectedIndex = this.selectedIndex + 1 < length && this.selectedIndex !== null ? this.selectedIndex + 1 : 0;
        this.moveScrollBar();
      }
    },
    decrement: function decrement() {
      var length = this.suggestions.length;

      if (length) {
        this.selectedIndex = this.selectedIndex - 1 >= 0 ? this.selectedIndex - 1 : length - 1;
        this.moveScrollBar();
      }
    },
    setGender: function setGender(gender) {
      if (gender === 'UNKNOWN' && this.data.gender !== 'UNKNOWN') return;
      this.data.gender = gender;
    },
    setValueBySelection: function setValueBySelection() {
      var _this2 = this;

      this.$refs.input.focus();
      var parts = this.fioParts;

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

      this.inputValue = this.inputValue.toLowerCase() + ' '; // Predict new step.

      this.predictStep({
        target: this.$refs.input
      }, 1);
      this.$nextTick(function () {
        // Load only if we have only one part in patronymic.
        if (_this2.stepName !== 'patronymic' && !_this2.stepValue.endsWith(' ')) _this2.loadSuggestions();
      });
    },
    loadSuggestions: function loadSuggestions() {
      var _this3 = this;

      // Save the cancel token for the current request
      var step = this.stepName;
      !this.disableSearch ? this.loadUsing({
        query: this.stepValue.trim(),
        gender: this.data.gender,
        parts: [step ? step.toUpperCase() : this.hasData ? 'PATRONYMIC' : 'SURNAME']
      }).then(function (data) {
        _this3.selectedIndex = null;
        _this3.suggestions = data;

        _this3.$forceUpdate();
      }) : null;
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "fio-autocomplete"
  }, [_vm._ssrNode("<div class=\"fio-autocomplete--wrapper\"><div class=\"fio-autocomplete--sugg\">" + (_vm.mask ? "<span class=\"fio-autocomplete--placeholder\">" + _vm._ssrEscape(_vm._s(_vm.prefixValue)) + "</span>" : "<!---->") + " <span class=\"fio-autocomplete--mask\">" + _vm._ssrEscape(_vm._s(' ' + _vm.mask)) + "</span></div> <input" + _vm._ssrAttr("autocomplete", _vm.context.autocomplete ? _vm.context.autocomplete : 'off') + _vm._ssrAttr("autocorrect", _vm.context.autocorrect ? _vm.context.autocorrect : 'off') + " autocapitalize=\"words\" type=\"text\"" + _vm._ssrAttr("value", _vm.inputValue) + " class=\"fio-autocomplete--input\"></div> "), _vm._ssrNode("<div class=\"fio-autocomplete--dropdown-wrapper\">", "</div>", [_c('transition', {
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
        "mousemove": function mousemove($event) {
          _vm.suggestions.length ? _vm.selectedIndex = index : false;
        },
        "click": function click($event) {
          $event.preventDefault();
          return _vm.setValueBySelection($event);
        }
      }
    });
  }), 0) : _vm._e()])], 1)], 2);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = "data-v-40cc15d2";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);// Import vue component
var component = (function () {
  // Get component instance
  var installable = __vue_component__; // Attach install function executed by Vue.use()

  installable.install = function (Vue) {
    Vue.component('FioAutocompleteField', installable);
  };

  return installable;
})();var namedExports=/*#__PURE__*/Object.freeze({__proto__:null,'default': component});Object.entries(namedExports).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      exportName = _ref2[0],
      exported = _ref2[1];

  if (exportName !== 'default') component[exportName] = exported;
});module.exports=component;