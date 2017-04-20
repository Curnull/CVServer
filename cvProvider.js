var rimraf = require('rimraf');
var babel = require("babel-core");
var glob = require("glob");
var fs = require('fs');
var path =  require('path');

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function transfromFile(input, output){
  return new Promise(function(resolve, reject) {
    console.log("compiling " + input);
    babel.transformFile(input, {}, function(err, result){
      if(err){
        reject(err);
        return;
      }
      var fileName = path.basename(output);
      var cvName = fileName.substring(0, fileName.lastIndexOf('.'));
      var codeToSave = result.code.replaceAll("{server_url}", server_url).replaceAll('{cv_name}', cvName);
      fs.writeFile(output, codeToSave, function(err) {
        if(err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

var server_url = '';

module.exports = {
  init: function(_server_url) {
    server_url = _server_url;
    rimraf('./data', function () {
      console.log('"data" folder was removed');
      fs.mkdirSync("./data");
      glob("./data_src/*.js", null, function(err, filenames){
        if (err) {
          throw err;
        }
        for(var index in filenames){
          var path = filenames[index];
          var out = path.replace("_src", "");
          transfromFile(path, out).then(function(){
            console.log("The " + out + " was saved!");
          }).catch(function(err) {
            throw new Error(err);
          });
        }
      });
    });
  },
  getCV: function(name, lang) {
    return new Promise(function(resolve, reject) {
      var out = "./data/" + name + ".js";
      transfromFile('./data_src/' + name + '.js', out).then(function(){
        delete require.cache[require.resolve(out)]
        resolve(require(out).default(lang));
      });
    });
  }
};