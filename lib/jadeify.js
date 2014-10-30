"use strict";

var path = require("path");
var through = require("through");
var jade = require("jade");
var findParent = require("find-parent-dir");

module.exports = function (fileName, options) {
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
            getOptions(options, function (err, options) {
                if (err) {
                    self.emit("error", err);
                    return;
                }

                options.filename = fileName;

                var templateFunction;

                try {
                    templateFunction = jade.compileClient(inputString, options);
                } catch (e) {
                    self.emit("error", e);
                    return;
                }

                getJadeDependencies(inputString, options).forEach(function (dep) {
                    self.emit("file", dep);
                });

                var moduleBody = "var jade = require(\"jade/runtime\");\n\n" +
                                 "module.exports = " + templateFunction.toString() + ";";

                self.queue(moduleBody);
                self.queue(null);
            });
        }
    );
};

function getJadeDependencies(inputString, options) {
  var parser = new jade.Parser(inputString, options.filename, options);
  parser.parse();
  return parser.dependencies;
}

function getOptions(passedOptions, cb) {
    if (passedOptions && Object.keys(passedOptions).length > 0) {
        process.nextTick(function () {
            cb(null, passedOptions);
        });
        return;
    }

    readJadeifyConfigFromPackage(process.cwd(), cb);
}

function readJadeifyConfigFromPackage(pathName, cb) {
    findParent(pathName, "package.json", function (err, dir) {
        if (err) {
            return cb(err);
        }
        if (!dir) {
            return cb(null, {});
        }
        var fileName = path.resolve(dir, "package.json");
        var pkg = null;
        try {
            pkg = require(fileName);
        } catch (e) {
            return cb(e);
        }

        if (pkg && pkg.jadeify) {
            if (typeof pkg.jadeify !== "object") {
                cb(new TypeError("The jadeify config must be an object."), null);
                return;
            }
            cb(null, pkg.jadeify);
        } else {
            cb(null, {});
        }
    });
}
