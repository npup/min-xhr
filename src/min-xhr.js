var qs = require("qs");

var doc = this.document, xjs;

var statusTypes = {"2": "ok", "3": "ok", "4": "not-found", "5": "error"};
function handleResponse(transp) {
  if (4 == transp.readyState) {
    var instance = this
      , statusType = statusTypes[~~(transp.status/100)];
    switch (statusType) {
      case "ok":
        instance.elem && (instance.elem.innerHTML = instance.xhr.responseText);
        instance.evalJs && xjs(instance.xhr.responseText);
        if (instance.callback) {
          var data = void 0;
          if (2<instance.callback.length) { // parameter for json passed
            try {data = JSON.parse(instance.xhr.responseText); }
            catch(err) { data = null; }
          }
          instance.callback(null, transp, data);
        }
      break;
      case "not-found":
      case "error":
        instance.callback && instance.callback(transp, null);
      break;
      default:
        throw new Error("Unknown status type ("+statusType+"), from code "+instance.xhr.status);
    }
    instance.xhr = null; /* !memory leak */
  }
}

var getXhr = function () {
  var xhr;
  try {
    xhr = function () {return new window.ActiveXObject("Microsoft.XMLHTTP");};
    if (xhr()) {getXhr = xhr;}
  }
  catch(err) {
    if ("XMLHttpRequest" in window) {getXhr = function () {return new XMLHttpRequest;};}
    else {getXhr = function () {throw new Error("User agent cannot create XMLHttpRequest objects");};}
  }
  return getXhr();
};

function Xhr(method, url) {
  var self = this;
  self.evalJs = true;
  self.xhr = getXhr();
  self.httpMethod = method;
  self.url = url;
  self.parameters = {};
  self.body = null;
  self.asynchronous = true;
  self.callback = null;
  self.requestHeaders = {
    "X-Requested-With": "XMLHttpRequest"
    , "Content-Type": "application/x-www-form-urlencoded"
  };
}

Xhr.prototype = {
  "constructor": Xhr
  , "update": function (elem) {
      var instance = this;
      "string" == typeof elem && (elem = doc.getElementById(elem));
      if (1!=elem.nodeType) {throw new Error("Can not update element "+elem);}
      instance.elem = elem;
      instance.send();
    }
  , "send": function () {
      var instance = this, query = qs.to(instance.parameters);
      if (query) {
        switch (instance.httpMethod) {
          case "get":
            instance.url += /\/.*\?.*$/.exec(instance.url) ? "&" : "?";
            instance.url += query;
          break;
          case "post":
            instance.body = query;
          break;
          default:
            throw Error("Unsupported HTTP verb: "+instance.httpMethod);
        }
      }
      instance.xhr.open(instance.httpMethod, instance.url, instance.asynchronous);
      for (var header in instance.requestHeaders) {
        instance.xhr.setRequestHeader(header, instance.requestHeaders[header]);
      }
      instance.xhr.onreadystatechange = function () {handleResponse.call(instance, instance.xhr);};
      instance.xhr.send(instance.body);
    }
  , "params": function (params) {
      return this.parameters = params, this;
    }
  , "param": function (name, value) {
      return this.parameters[name] = value, this;
    }
  , "headers": function (headers) {
      for (var header in headers) { this.header(header, headers[header]); }
      return this;
    }
  , "header": function (name, value) {
      return this.requestHeaders[name] = value, this;
    }
  , "content": function (type) {
      return this.requestHeaders["Content-Type"] = type, this;
    }
  , "handler": function (handler) {
      return this.callback = handler, this;
    }
  , "async": function (async) {
      return this.asynchronous = !!async, this;
    }
};

function req(method, url) {return new Xhr(method, url);}

xjs = (function () {
  var win = window, doc = win.document;

  function handleSrces(srces) {
    var lastSrc, src, script;
    for (var idx=0, len=srces.length; idx<len; ++idx) {
      src = srces[idx];
      script = doc.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      doc.body.appendChild(script);
      lastSrc = script;
    }
    return lastSrc;
  }

  function handleInlines(inlines) {
    var inline;
    for (var idx=0, len=inlines.length; idx<len; ++idx) {
      inline = inlines[idx];
      try {eval(inline);}
      catch(e) {/*console.log("error: %s", e);console.log(inline);*/}
    }
  }

  // parses response, extract scripts and runs them
  return function (responseText) {
    var srcExtractor = /<script.+src="([\S]+)"[^>]*/g, result
      , srces = []
      , inlineExtractor = /<script[^>]*>((\n|.)*)<\/script>/gi
      , inlines = []
      , lastSrc;

    while (result = srcExtractor.exec(responseText)) {
      srces.push(result[1]);
    }

    while (result = inlineExtractor.exec(responseText)) {
      inlines.push(result[1]);
    }

    if (srces.length) {
      lastSrc = handleSrces(srces);
    }

    if (inlines.length) {
      if (lastSrc) {lastSrc.onload = function () {handleInlines(inlines);};}
      else {handleInlines(inlines);}
    }
  };

}());

module.exports = {
  "get": function (url) {return req("get", url);}
  , "post": function (url) {return req("post", url);}
};
