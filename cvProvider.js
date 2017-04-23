var rimraf = require('rimraf');
var babel = require("babel-core");
var glob = require("glob");
var fs = require('fs');
var path =  require('path');

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

var transformedFilesModifyDates = {};
function transfromFile(input, output){
  return new Promise(function(resolve, reject) {
    fs.stat(input, function(err, stats) {
      if(err){
        reject(err);
        return;
      }
      var mtime = stats.mtime.getTime();
      if(mtime === transformedFilesModifyDates[input]){
        console.log("file " + input + "is already compiled");
        resolve(false);
        return;
      }
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
          transformedFilesModifyDates[input] = mtime;
          console.log("file " + output + " was saved!");
          resolve(true);
        });
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
          transfromFile(path, out).catch(function(err) {
            throw new Error(err);
          });
        }
      });
    });
  },
  getCV: function(name, lang) {
    return new Promise(function(resolve, reject) {
      var out = "./data/" + name + ".js";

      transfromFile('./data_src/' + name + '.js', out).then(function (isTransformed) {
        if(isTransformed){
          delete require.cache[require.resolve(out)];
        }
        resolve(require(out).default(lang));
      }).catch(function(err){
        reject(err);
      });
    });
  }
};