"use strict";

var template = require("./template.jade");
var pageTitle = require("./pageTitle");

document.body.innerHTML = template({
    name: 'Name Test',
    address: '123 Test St',
    phone: '111-111-1111',
    details: 'Test Details'
});
