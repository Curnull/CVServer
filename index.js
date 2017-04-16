var path =  require('path');
var express =  require('express');
var cors = require('cors');
var rimraf = require('rimraf');
var babel = require("babel-core");
var glob = require("glob");
var fs = require('fs');

function transfromFile(input, output){
  console.log("compiling " + input);
  babel.transformFile(input, {}, function(err, result){
    if(err){
      throw err;
    }
    fs.writeFile(output, result.code, function(err) {
      if(err) {
        throw err;
      }
      console.log("The " + output + " was saved!");
    });
  });
}


//build CV's
rimraf('./data', function () {
  console.log('"data" folder was removed');
  fs.mkdirSync("./data");
  glob("./data_src/*.js", null, function(err, filenames){
    if (err) {
      throw err;
    }
    for(var index in filenames){
      var path = filenames[index];
      transfromFile(path, path.replace("_src", ""));
    }
  });
});


var port = 3000;
var app = express();
app.use(cors());
app.get('/cv/:name', function (req, res) {
  res.send(require("./data/" + req.params.name + ".js").default);
});

app.get('/img/:filename', function(req, res){
  res.sendFile(path.join(__dirname, "/img", req.params.filename));
});

app.use(express.static(path.join(__dirname, "/img")));
app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});