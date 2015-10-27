var assert = require("proclaim");

var minXhr = require("../src/min-xhr.js");

describe("minXhr", function () {

  it("should be an object", function () {
    assert.isObject(minXhr);
  });

  it("should have a method `get`, taking one parameter", function () {
    assert.isFunction(minXhr.get);
    assert.equal(minXhr.get.length, 1);
  });

  it("should have a method `post`, taking one parameter", function () {
    assert.isFunction(minXhr.post);
    assert.equal(minXhr.post.length, 1);
  });

});


describe("instance obtained via `get`", function () {

  before(function () {
    this.req = minXhr.get("/foo");
  });

  it("should be an object", function () {
    assert.isObject(this.req);
  });

  describe("instance methods", function () {

    it("should have a method `param`, taking two parameters", function () {
      assert.isFunction(this.req.param);
      assert.equal(this.req.param.length, 2);
    });

    it("should have a method `params`, taking one parameter", function () {
      assert.isFunction(this.req.params);
      assert.equal(this.req.params.length, 1);
    });

    it("should have a method `header`, taking two parameters", function () {
      assert.isFunction(this.req.header);
      assert.equal(this.req.header.length, 2);
    });

    it("should have a method `headers`, taking one parameter", function () {
      assert.isFunction(this.req.headers);
      assert.equal(this.req.headers.length, 1);
    });

    it("should have a method `async`, taking one parameter", function () {
      assert.isFunction(this.req.async);
      assert.equal(this.req.async.length, 1);
    });

    it("should have a method `content`, taking one parameter", function () {
      assert.isFunction(this.req.content);
      assert.equal(this.req.content.length, 1);
    });

    it("should have a method `abort`, taking zero parameters", function () {
      assert.isFunction(this.req.abort);
      assert.equal(this.req.abort.length, 0);
    });

    it("should have a method `timeout`, taking one parameter", function () {
      assert.isFunction(this.req.timeout);
      assert.equal(this.req.timeout.length, 1);
    });

    it("should have a method `abort`, taking zero parameters", function () {
      assert.isFunction(this.req.abort);
      assert.equal(this.req.abort.length, 0);
    });

  });

});
