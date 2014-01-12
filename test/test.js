"use strict";

var fs = require("fs");
var path = require("path")
var assert = require("assert");
var concatStream = require("concat-stream");
var browserify = require("browserify");
var jsdom = require("jsdom").jsdom;
var jadeify = require("..");

function stuffPath(fileName) {
    return path.resolve(__dirname, "stuff", fileName);
}

var bundleStream = browserify().transform(jadeify).add(stuffPath("entry.js")).bundle();
var pageHtml = fs.readFileSync(stuffPath("index.html"), "utf8");
var desiredOutput = fs.readFileSync(stuffPath("desired-output.txt"), "utf8").trim();

specify("It gives the desired output", function (done) {
    bundleStream.pipe(concatStream(function (bundleJs) {
        var window = jsdom(pageHtml).parentWindow;

        var scriptEl = window.document.createElement("script");
        scriptEl.textContent = bundleJs;
        window.document.head.appendChild(scriptEl);

        assert.equal(window.document.body.innerHTML, desiredOutput);

        done();
    }));
});
