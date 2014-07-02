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

function prepareBundle(jsEntryName) {
    return browserify()
        .transform(jadeify)
        .add(stuffPath(jsEntryName))
        .bundle();
}

specify("It gives the desired output", function (done) {
    var bundleStream = prepareBundle("test1/entry.js");
    var pageHtml = fs.readFileSync(stuffPath("test1/index.html"), "utf8");
    var desiredOutput = fs.readFileSync(stuffPath("test1/desired-output.txt"), "utf8").trim();

    bundleStream.pipe(concatStream(function (bundleJs) {
        var window = jsdom(pageHtml).parentWindow;

        var scriptEl = window.document.createElement("script");
        scriptEl.textContent = bundleJs;
        window.document.head.appendChild(scriptEl);

        assert.equal(window.document.body.innerHTML, desiredOutput);

        done();
    }));
});

specify("It emits stream error when Jade fails to process template", function (done) {
    var bundleStream = prepareBundle("test2/entry.js");

    bundleStream.on("error", function (error) {
        assert(error instanceof Error, "Must emit Error object.");
        done();
    })
    .pipe(concatStream(function (bundleJs) {
        assert(false, "Must emit \"error\".");
        done();
    }));
});
