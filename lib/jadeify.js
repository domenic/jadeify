"use strict";

var path = require("path");
var through = require("through");
var jade = require("jade");
var findParent = require("find-parent-dir");

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
            var self = this;
            readPackage(process.cwd(), function (err, pkg) {
                if (err) {
                    self.emit("error", err);
                    return;
                }

                var opts = pkg && pkg.jadeify || {};
                opts.filename = fileName;
                opts.compileDebug = false;

                var templateFunction;

                try {
                    if (jade.compileClient) {
                        templateFunction = jade.compileClient(inputString, opts);
                    } else {
                        opts.client = true;
                        templateFunction = jade.compile(inputString, opts);
                    }
                } catch (e) {
                    self.emit("error", e);
                    return;
                }

                var moduleBody = "var jade = require(\"jade/runtime\");\n\n" +
                                 "module.exports = " + templateFunction.toString() + ";";

                self.queue(moduleBody);
                self.queue(null);
            });
        }
    );
};

function readPackage(pathName, cb) {
    findParent(pathName, "package.json", function (err, dir) {
        if (err) {
            return cb(err);
        }
        if (!dir) {
            return cb(null, null);
        }
        var fileName = path.resolve(dir, "package.json");
        var pkg = null;
        try {
            pkg = require(fileName);
        } catch (e) {
            return cb(e);
        }
        cb(null, pkg);
    });
}
