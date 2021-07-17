# Fio suggestion field 
![](https://github.styleci.io/repos/371502967/shield?branch=master)
![MIT License](https://img.shields.io/github/license/qubeekio/vue-fio-autocomplete.svg?style=flat-square)

> **Simple and lightweight package, that helps with russian fio**

An input field that helps users fill in their full name faster and more correctly. 
Fully customizable and ready for production, just change styles, and let's rock. 
It works with [dadata.ru](https://dadata.ru) or your own custom service.

## Usage

### Install

```bash
$ npm install @qubeekio/vue-fio-autocomplete
```

### Init

```js

import FioAutocomplete from "@qubeekio/vue-fio-autocomplete"

...

<fio-autocomplete
      v-model="fio"
      :request-options="options"
      api="https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio"
    />
})

```

### Output value
Field returns user input and splits it into the right parts of fio.

```js
fio: {
  surname: "Иванов",
  name: "Иван",
  patronymic: "Иванович",
  gender: "MALE"
}
```

### Styles

The component includes SCSS. 

You can find [list of SCSS variables here](https://github.com/qubeekio/vue-fio-autocomplete/blob/master/src/styles/main.scss).

```scss
@import "@qubeekio/vue-fio-autocomplete/styles/main.scss";
```

## Estimated response from the server

Currently, this package does not support specifying the key by which the list of suggestions will be selected.

```json
{
  "suggestions": [
    {
      "value": "Виктор",
      "unrestricted_value": "Виктор",
      "data": {
        "surname": null,
        "name": "Виктор",
        "patronymic": null,
        "gender": "MALE",
        "source": null,
        "qc": "0"
      }
    },
  ]
}
```


## License

[MIT](https://github.com/qubeekio/vue-fio-autocomplete/blob/master/LICENSE)
