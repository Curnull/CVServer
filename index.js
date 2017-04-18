var path =  require('path');
var express =  require('express');
var cors = require('cors');
var cvProvider = require('./cvProvider');
var os = require('os');

var port = 3000;
var server_url = 'http://' + os.hostname() + ':' + port;
cvProvider.init(server_url);


var app = express();
app.use(cors());
app.get('/cv/:name/:lang', function (req, res) {
  cvProvider.getCV(req.params.name, req.params.lang || 'en').then(function(cv){
    res.send(cv);
  });

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