/*
 * grunt-glob-html
 * https://github.com/gevgeny/grunt-glob-html
 *
 * Copyright (c) 2014 Eugene Gluhotorenko
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var cheerio = require('cheerio'),
        path = require('path');

    var isDir = function (path) {
        return grunt.util._.endsWith(path, '/');
    };

    /**
     * Expand script with wildcard src to matched ones.
     * @param {object} $script script with wildcard.
     * @return {Array<object>} matched scripts.
     * */
    var expandScript = function ($script) {
        var path = $script.attr('src'),
            expandedPaths = grunt.file.expand(path);

        grunt.log.writeln('Expand ' + path.cyan + ' to ' + expandedPaths.length.toString().cyan + ' scripts');

        return expandedPaths.map(function (path) {
            return $script.clone().attr('src', path).toString();
        });
    };

    /**
     * Replaces all the <script> tags with wildcard with expanded values.
     * @param {string} content HTML content with <script> tags.
     * */
    var processFile = function (content) {
        var $ = cheerio.load(content),
            $scripts = $('script'),
            noScriptsFound = true;

        $scripts.each(function (i, script) {
            var $script = $(script), indent = '';

            // Just skip entries without wildcard.
            if (($script.attr('src') || '').indexOf('*') === -1) {
                return;
            }
            noScriptsFound = false;

            // Save initial script indent to have beauty code. :)
            if (/^\s+$/.test($script[0].prev.data)) {
                indent = $script[0].prev.data;
            }

            // Expand initial script to matched ones.
            expandScript($script).forEach(function (script) {
                // Add expanded script.
                $script.before(script + indent);
            });

            // Remove the script with its indent.
            if (indent) {
                $script[0].prev.data = '';
            }
            $script.remove();
        });

        if (noScriptsFound) {
            grunt.log.writeln('No scripts with wildcard found');
            return content;
        }

        return $.html();
    };


    grunt.registerMultiTask('globhtml', 'Add globbing to your HTML', function () {
        debugger;
        var gruntDir = process.cwd(),
            dest = this.data.dest;

        if (!this.filesSrc.length) {
            grunt.log.error('No sources found');
            return;
        }
        if (!dest) {
            grunt.log.error('Destination is not specified');
            return;
        }
        this.filesSrc.forEach(function (filePath) {
            var content = grunt.file.read(filePath), processedContent, resultDest;

            grunt.log.writeln('Processing ' + filePath.cyan);

            // Set processing file dir as cwd because script tag source related to the HTML and not to the Grunt file.
            grunt.file.setBase(path.dirname(filePath));
            
            // Expand scripts with wildcards.
            processedContent = processFile(content);

            // Reset base dir to default.
            grunt.file.setBase(gruntDir);

            // Save processed content.
            resultDest = isDir(dest) ? path.join(dest, path.basename(filePath)) : dest;
            grunt.file.write(resultDest, processedContent);
            grunt.log.writeln('Created ' + resultDest.cyan + '\n');
        });
    });
};
