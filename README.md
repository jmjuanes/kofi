<h1 align="center">kofi.js</h1>

<div align="center">
<b>kofi</b> is a micro browser utility library for building modern <b>frontend applications</b>. 
</div>
<br>
<div align="center">
<img src="https://david-dm.org/jmjuanes/kofi/dev-status.svg?style=flat-square">
<img src="https://img.shields.io/badge/status-on_development-orange.svg?style=flat-square">
<img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square">
<img src="https://img.shields.io/npm/v/kofi.svg?style=flat-square">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
</div>

## Installation

You can add **kofi** to your project using NPM:

```
$ npm install --save kofi
```

## Getting started

**kofi** is written using **ES2015 Modules**. You can import **kofi** into your ES2015 application as a namespace or importing specific methods from **kofi**:

```javascript
//Import the whole kofi package as a namespace
import * as kofi from "kofi";

//Import only specific methods
import {request, dispatch} from "kofi";
```

Or in Node.js:

```javascript
let kofi = require("kofi");
```

**kofi** can be also imported directly in your browser:

```html
<script type="text/javascript" src="./node_modules/kofi/dist/kofi.umd.js"></script>
```


## Documentation

Documentation is available in the [`docs` folder of the GitHub repository](./docs/readme.md).


## License

**kofi** is released under the [MIT LICENSE](./LICENSE).

