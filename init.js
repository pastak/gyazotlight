var path = require('path')
var argv = require('yargs')
  .default('test', false)
  .default('environment', 'production')
  .argv
if (argv.environment == 'production') {
  require('electron-compile').initForProduction(path.join(__dirname, 'compile-cache'))
}
else {
  console.log('In development mode')
  require('electron-compile').init()
}
require('./app/app')
