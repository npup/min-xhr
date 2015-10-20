var assert = require("proclaim");

var minXhr = require("../../src/min-xhr.js");


describe("calls", function () {

  it("should fetch plain text", function (done) {
    var expectedResponse = "very foo";
    minXhr.get("/foo")
      .handler(function (err, res) {
        if (err) {
          return done(new Error(err.status));
        }
        var actual = res.responseText;
        if (expectedResponse==actual) {
          done();
        }
        else {
          done(new Error("expected "+expectedResponse+", got "+actual));
        }
      })
      .send();
  });

  it("should fetch and parse json", function (done) {
    var expectedResponse = {"foo": "bar", "goo": "cart"};
    minXhr.get("/bar")
      .handler(function (err, res, json) {
        if (err) {
          return done(new Error(err.status));
        }
        return done(assert.deepEqual(json, expectedResponse));
      })
      .send();
  });

});


