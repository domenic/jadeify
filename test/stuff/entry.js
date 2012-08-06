"use strict";

var template = require("./template.jade");

document.body.innerHTML = template({ pageTitle: "Jade", youAreUsingJade: true });
