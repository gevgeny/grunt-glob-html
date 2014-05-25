# grunt-glob-html

> Add globbing to your HTML

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-glob-html --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-glob-html');
```

## The "globhtml" task

### Overview

This grunt task allows to use [glob][https://github.com/isaacs/node-glob] syntax when you specify `src` in script tag.

####Initial HTML

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>glob-html example</title>
    <script src="scripts/*"></script>
</head>
<body>
    <p>glob-html example</p>
</body>
</html>
```

#### HTML after "globhtml"

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>glob-html example</title>
    <script src="scripts/script1.js"></script>
    <script src="scripts/script2.js"></script>
    <script src="scripts/script3.js"></script>
</head>
<body>
    <p>glob-html example</p>
</body>
</html>
```

See [tests][https://github.com/gevgeny/grunt-glob-html/tree/master/test/examples] for more detailed HTML examples.

### Options

Currently no options provided.

### Usage Examples

#### Single HTML content

```js
grunt.initConfig({
  globhtml: {
    content: {
      src: 'www/content.html',
      dest: 'www/content.result.html'
    }
});
```

#### Multiple HTML content

```js
grunt.initConfig({
  globhtml: {
    content: {
      src: 'www/*.html',
      dest: 'www/result/'
    }
});
```
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_