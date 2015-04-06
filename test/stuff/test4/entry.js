"use strict";

var template = require("./template.jade");

document.body.innerHTML = template({
    foo: function () { return "FOO!"; }
});
