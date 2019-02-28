## aframe-visdata-component

[![Version](http://img.shields.io/npm/v/aframe-visdata-component.svg?style=flat-square)](https://npmjs.org/package/aframe-visdata-component)
[![License](http://img.shields.io/npm/l/aframe-visdata-component.svg?style=flat-square)](https://npmjs.org/package/aframe-visdata-component)

A Data visualization component for A-Frame.

For [A-Frame](https://aframe.io).

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|          |             |               |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.8.2/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-visdata-component/dist/aframe-visdata-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity visdata="foo: bar"></a-entity>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-visdata-component
```

Then require and use.

```js
require('aframe');
require('aframe-visdata-component');
```
