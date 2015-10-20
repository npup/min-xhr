var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

var app = express();

app.use(function(req, res, next) {
  res.set("Cache-Control", "no-cache, no-store");
  next();
});

app.all("/echo", function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.use(bodyParser.urlencoded({ "extended": true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/*', function(req, res, next){
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', req.get('Origin'));
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});


app.get("/foo", function (req, res) {
  res.status(200).send("very foo");
});
app.get("/bar", function (req, res) {
  res.status(200).json({ "foo": "bar", "goo": "cart" });
});

app.listen(process.env.ZUUL_PORT);
