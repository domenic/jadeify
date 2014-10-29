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

function prepareBundle(jsEntryName, options) {
    return browserify()
        .transform(jadeify, options)
        .add(stuffPath(jsEntryName))
        .bundle();
}

specify("It gives the desired output", function (done) {
    testOutputMatches("test1", done);
});

specify("It emits stream error when Jade fails to process template", function (done) {
    testOutputErrors("test2", done);
});

specify("It uses options from the nearest package.json", function (done) {
    testOutputMatches("test3", done);
});

specify("It emits stream error when a non-object is used as the package.json config", function (done) {
    testOutputErrors("test4", done);
});

specify("It uses options from js", function (done) {
    testOutputMatches("test5", done, { self: true });
});

specify("It should emit all files in dependency tree", function (done) {
    testFileEmit("test6", done, { self: true });
});

function testOutputMatches(testDir, done, options) {
    process.chdir(stuffPath(testDir));

    var bundleStream = prepareBundle(testDir + "/entry.js", options);
    var pageHtml = fs.readFileSync(stuffPath(testDir + "/index.html"), "utf8");
    var desiredOutput = fs.readFileSync(stuffPath(testDir + "/desired-output.txt"), "utf8").trim();

    bundleStream.pipe(concatStream(function (bundleJs) {
        var window = jsdom(pageHtml).parentWindow;

        var scriptEl = window.document.createElement("script");
        scriptEl.textContent = bundleJs;
        window.document.head.appendChild(scriptEl);

        assert.equal(window.document.body.innerHTML, desiredOutput);

        done();
    }));
}

function testOutputErrors(testDir, done) {
    process.chdir(stuffPath(testDir));

    var bundleStream = prepareBundle(testDir + "/entry.js");

    bundleStream.on("error", function (error) {
        assert(error instanceof Error, "Must emit Error object.");
        done();
    })
    .pipe(concatStream(function (bundleJs) {
        assert(false, "Must emit \"error\".");
        done();
    }));
}

function testFileEmit(testDir, done) {
    process.chdir(stuffPath(testDir));

    var bundleStream = prepareBundle(testDir + "/entry.js");
    var dependencyList = [];

    bundleStream.on("transform", function (tr, file) {
        tr.on("file", function (file) {
            dependencyList.push(path.basename(file));
        });
    })
    .pipe(concatStream(function (bundleJs) {
        assert(bundleJs, "Must create bundle as expected.");
        assert.deepEqual(dependencyList, ["header.jade", "footer.jade"]);
        done();
    }));

}
