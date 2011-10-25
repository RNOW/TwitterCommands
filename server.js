// add the vendored express to the require path
require.paths.unshift("vendor/ejs/lib")
require.paths.unshift("vendor/connect/lib")
require.paths.unshift("vendor/express/lib")

var app = require("./lib/app")

try {
  app.run()
  app.stream();
} catch(e) {
  console.log(e.stack)
}

process.on('uncaughtException', function (err) {
  console.log(err);
});
