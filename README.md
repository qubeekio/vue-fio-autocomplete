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

methods: {
  async fetch(data) {
    return await axios
      .request({
        method: 'POST',
        url: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio',
        headers: {
          Authorization: 'Token ' + 'Your token'
        },
        data
      })
      .then(({ data }) => {
        return data.suggestions
      })
  }
}

...

<fio-autocomplete-field
  v-model="fio" 
  :load-using="fetch"
/>

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

You can find [list of SCSS variables here](https://github.com/qubeekio/vue-fio-autocomplete/blob/master/styles/main.scss).

```scss
@import "@qubeekio/vue-fio-autocomplete/styles/main.scss";
```

## Estimated response from the server
--
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
