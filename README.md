# A Simple Browserify Middleware for Jade Templates

**Simple Jadeify** lets you use [Jade][] with [browserify][] in the simplest way possible:

```js
var template = require("./template.jade");

document.getElementById("my-thing").innerHTML = template({ localVar: "value", anotherOne: "another value" });
```

## Setup

Dead simple. When creating your browserify bundle, just add this line:

```js
bundle.use(require("simple-jadeify"));
```

This will add the Jade runtime to your bundle, so that your templates work without needing to bundle Jade itself. And it
will register the `.jade` extension with Browserify such that `require`ing any Jade files will give you back a template
function.

[Jade]: http://jade-lang.com/
[browserify]: https://github.com/substack/node-browserify
