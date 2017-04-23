var path =  require('path');
var express =  require('express');
var cors = require('cors');
var cvProvider = require('./cvProvider');

var config = require("./config/" + (process.env.NODE_ENV || "development") + ".json");
cvProvider.init(config.server_url);

var port = config.port;

var app = express();
app.use(cors());
app.get('/cv/:name/:lang*?', function (req, res) {
  cvProvider.getCV(req.params.name, req.params.lang || 'en').then(function(cv){
    res.send(cv);
  }).catch(function(err){
    res.send({
      success: false,
      error: err
    })
  });

});

app.get('/img/:filename', function(req, res){
  res.sendFile(path.join(__dirname, "/img", req.params.filename));
});

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.log(process.env);
  console.info('==> Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});