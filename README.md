

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="128" height="128"
      src="https://github.com/webpack/media/raw/master/logo/icon.png" alt="Webpack">
  </a>
  <a href="https://github.com/kamsar/Rainbow">
    <img width="128" height="128"
      src="http://kamsar.net/nuget/rainbow/logo.png" alt="Unicorn">
  </a>
  <h1>Rainbow Plugin</h1>
  <p>Output files in Unicorn's Rainbow format. Works well with transparent sync.<p>
</div>


<h2 align="center">Install</h2>

```bash
npm i -D rainbow-webpack-plugin
```

<h2 align="center">Usage</h2>

**webpack.config.js**
```js
const RainbowPlugin = require("rainbow-webpack-plugin")

module.exports = {
  plugins: [
    new RainbowPlugin(...options)
  ]
}
```
