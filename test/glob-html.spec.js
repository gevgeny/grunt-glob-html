'use strict';

var assert = require("assert"),
    grunt = require('grunt');

describe('glob-html', function(){
    it('should expand glob sources', function() {
        var actual = grunt.file.read('test/tmp/one-src/content.html'),
            expected = grunt.file.read('test/expected//content.html');
        assert.equal(actual, expected);
    });
    it('should expand glob sources with custom base drectory', function() {
        var actual = grunt.file.read('test/tmp/custom-base/content.html'),
            expected = grunt.file.read('test/expected/content.html');
        assert.equal(actual, expected);
    });
    it('should not change file without glob sources', function() {
        var actual = grunt.file.read('test/tmp/multiple-src/empty-content.html'),
            expected = grunt.file.read('test/examples/empty-content.html');
        assert.equal(actual, expected);
    });
});

