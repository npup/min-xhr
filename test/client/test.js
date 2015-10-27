var assert = require("proclaim");

var minXhr = require("../../src/min-xhr.js");


describe("calls", function () {

  it("should fetch plain text", function (done) {
    var expectedResponse = "very foo";
    minXhr.get("/foo")
      .handler(function (err, res) {
        assert.isNull(err);
        assert.equal(res.responseText, expectedResponse);
        done();
      })
      .send();
  });

  it("should fetch and parse json", function (done) {
    var expectedResponse = {"foo": "bar", "goo": "cart"};
    minXhr.get("/bar")
      .handler(function (err, res, json) {
        assert.isNull(err);
        assert.deepEqual(json, expectedResponse);
        done();
      })
      .send();
  });

  it("should be abortable", function (done) {
    minXhr.get("/foo")
      .handler(function (err, res) {
        assert.equal(err.status, 0); //aborted
        done();
      })
      .send()
      .abort();
  });

  it("should timeout and abort after a set period of time", function (done) {
    this.timeout(2500);
    var requestTimeout = 1500, grace = 100
      , t0 = +new Date;
    minXhr.get("/slow/2000")
      .timeout(requestTimeout)
      .handler(function (err, res) {
        var elapsed = (+new Date) - t0;
        assert.isNull(res);
        assert.equal(err.status, 0, "request should error and have a status of 0 (aborted)"); // aborted
        assert.greaterThanOrEqual(elapsed, requestTimeout, "expected timeout was >= "+requestTimeout);
        assert.lessThanOrEqual(elapsed, requestTimeout+grace, "expected timeout was >= "+requestTimeout+grace);
        done();
      })
      .send();
  });


  it("should not trigger timeout prematurely", function (done) {
    this.timeout(2500);
    var requestTimeout = 1500
      , requestDelay = 1400
      , t0 = +new Date;
    minXhr.get("/slow/"+requestDelay)
      .timeout(requestTimeout)
      .handler(function (err, res) {
        var elapsed = (+new Date) - t0;
        assert.isNull(err, "err should be null");
        assert.greaterThanOrEqual(elapsed, requestDelay);
        assert.lessThanOrEqual(elapsed, requestDelay+100);
        assert.equal(res.status, 200);
        return done();
      })
      .send();
  });


});


