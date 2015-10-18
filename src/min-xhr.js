var qs = require("qs");

var doc = this.document;


function req(method, url) {return new Xhr(method, url);}

function Xhr(method, url) {
  var self = this;
  self.evalJs = true;
  self.xhr = getXhr();
  self.httpMethod = method;
  self.url = url;
  self.parameters = {};
  self.body = null;
  self.asynchronous = true;
  self.callbacks = {};
  self.requestHeaders = {
    "X-Requested-With": "XMLHttpRequest"
    , "Content-Type": "application/x-www-form-urlencoded"
  };
}

var getXhr = function () {
  var xhr;
  try {
    xhr = function () {return new ActiveXObject("Microsoft.XMLHTTP");};
    if (xhr()) {getXhr = xhr;}
  }
  catch(err) {
    if ("XMLHttpRequest" in window) {getXhr = function () {return new XMLHttpRequest;};}
    else {getXhr = function () {throw new Error("User agent cannot create XMLHttpRequest objects");};}
  }
  return getXhr();
};

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
    var self = this, query = qs.stringify(self.parameters);
    if (query) {
      switch (self.httpMethod) {
        case "get":
          self.url += /\/.*\?.*$/.exec(self.url) ? "&" : "?";
          self.url += query;
        break;
        case "post":
          self.body = query;
        break;
        default:
          throw Error("Unsupported HTTP verb: "+self.httpMethod);
        break;
      }
    }
    self.xhr.open(self.httpMethod, self.url, self.asynchronous);
    for (var header in self.requestHeaders) {
      self.xhr.setRequestHeader(header, self.requestHeaders[header]);
    }
    self.xhr.onreadystatechange = function () {handleResponse.call(self, self.xhr);};
    self.xhr.send(self.body);
  }
  , "params": function (params) {
    return (this.parameters = params, this);
  }
  , "param": function (name, value) {
    return (this.parameters[name] = value, this);
  }
  , "headers": function (headers) {
    for (var header in headers) {this.header(header, headers[header]);}
    return this;
  }
  , "header": function (name, value) {
    return (this.requestHeaders[name] = value, this);
  }
  , "content": function (type) {
    return (this.requestHeaders["Content-Type"] = type, this);
  }
  , "ok": function (callback) {
    return (this.callbacks.ok = callback, this);
  }
  , "err": function (callback) {
    return (this.callbacks.err = callback, this);
  }
  , "async": function (async) {
    return (this.asynchronous = !!async, this);
  }
};

var statusTypes = {2: "ok", 3: "ok", 4: "not-found", 5: "error"};
function handleResponse(transp) {
  if (transp.readyState == 4) {
    var statusType = statusTypes[~~(transp.status/100)];
    switch (statusType) {
      case "ok":
        this.elem && (this.elem.innerHTML = this.xhr.responseText);
        this.evalJs && xjs(this.xhr.responseText);
        this.callbacks.ok && this.callbacks.ok(transp);
      break;
      case "not-found":
      case "error":
        this.callbacks.err && this.callbacks.err(transp);
      break;
      default:
        throw new Error("Unknown status type ("+statusType+"), from code "+this.xhr.status);
      break;
    }
    this.xhr = null; /* !memory leak */
  }
}

var xjs = (function () {
  var win = window, doc = win.document, body = doc.body;

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

})();

module.exports = {
  "get": function (url) {return req("get", url);}
  , "post": function (url) {return req("post", url);}
};
