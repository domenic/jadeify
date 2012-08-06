"use strict";

var fs = require("fs");
var jadePlugin = require("./plugin");

var jadeRuntime = fs.readFileSync(require.resolve("jade/runtime"), "utf8");

module.exports = function (bundle) {
    bundle.prepend(jadeRuntime);
    bundle.register(".jade", jadePlugin);
};
