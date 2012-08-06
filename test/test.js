"use strict";

var fs = require("fs");
var path = require("path")
var assert = require("assert");
var browserify = require("browserify");
var jsdom = require("jsdom").jsdom;
var simpleJadeify = require("..");

function stuffPath(fileName) {
    return path.resolve(__dirname, "stuff", fileName);
}

var bundleJs = browserify().use(simpleJadeify).addEntry(stuffPath("entry.js")).bundle();
var pageHtml = fs.readFileSync(stuffPath("index.html"), "utf8");
var desiredOutput = fs.readFileSync(stuffPath("desired-output.txt"), "utf8").trim();

specify("It gives the desired output", function () {
    var window = jsdom(pageHtml).createWindow();

    var scriptEl = window.document.createElement("script");
    scriptEl.textContent = bundleJs;
    window.document.head.appendChild(scriptEl);

    assert.equal(window.document.body.innerHTML, desiredOutput);
});
