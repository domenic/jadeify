"use strict";

var template = require("./template.jade");
var pageTitle = require("./pageTitle");

document.body.innerHTML = template({ pageTitle: pageTitle, youAreUsingJade: true });
