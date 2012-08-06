"use strict";

var jade = require("jade");

module.exports = function simpleJadeifyPlugin(body, fileName) {
    var templateFunction = jade.compile(body, { filename: fileName, compileDebug: false, client: true });

    return "module.exports = " + templateFunction.toString() + ";";
};
