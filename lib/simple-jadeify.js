"use strict";

var through = require("through");
var jade = require("jade");

module.exports = function (fileName) {
    if (!/\.jade$/i.test(fileName)) {
        return through();
    }

    var inputString = "";

    return through(
        function (chunk) {
            inputString += chunk;
        },
        function () {
            var templateFunction = jade.compile(inputString, { filename: fileName, compileDebug: false, client: true });
            var moduleBody = "var jade = require(\"jade/runtime\");\n\n" +
                             "module.exports = " + templateFunction.toString() + ";";

            this.queue(moduleBody);
            this.queue(null);
        }
    );
};
