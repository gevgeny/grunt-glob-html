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
     * Expand element with glob to matched values.
     * @param {object} $element Element with glob.
     * @param {string} attr Resource attr. (src, href).
     * @return {Array<object>} matched values.
     * */
    var expandElement = function ($element, attr) {
        var path = $element.attr(attr),
            expandedPaths = grunt.file.expand(path);

        grunt.log.writeln('Expand ' + path.cyan + ' to ' + expandedPaths.length.toString().cyan + ' files');

        return expandedPaths.map(function (path) {
            return $element.clone().attr(attr, path).toString();
        });
    };

    /**
     * Checks whether element should be handled and return appropriate attr in accordance with element type:
     * link - href, script - src.
     * @param {object} $element element to handle.
     * @return {string} attr to handle. ('src', 'href', undefined)
     * */
    var getAttrToHandle = function ($element) {
        var attr;

        if ($element.is('script')) {
            attr = 'src';
        } else if ($element.is('link')) {
            attr = 'href';
        }

        if (($element.attr(attr) || '').indexOf('*') !== -1) {
            return attr;
        }
    };

    /**
     * Fetches element's indent.
     * @param {object} $element element to handle.
     * @return {string} indent;
     * */
    var fetchIndent = function ($element) {
        var indent = '';

        // Check whether prev element is whitespace.
        if (/^\s+$/.test($element[0].prev.data)) {
            indent = $element[0].prev.data;

            // Cut line break.
            indent = grunt.util._.last(indent.split(/\n|\r/));
        }

        return '\n' + indent;
    };

    /**
     * */
    var processFile = function (content) {
        var $ = cheerio.load(content),
            $elements = $('script,link'),
            noElementsFound = true;

        $elements.each(function (i, element) {
            var $element = $(element), indent,
                attr = getAttrToHandle($element);

            if (!attr) {
                return;
            }
            noElementsFound = false;
            indent = fetchIndent($element);

            // Expand initial script to matched ones.
            expandElement($element, attr).forEach(function (element, i) {
                if (i === 0) {
                    $element.before(element);
                } else {
                    $element.before(indent + element);
                }
            });

            // Remove the handled element with its indent.
//            if (indent) {
//                $element[0].prev.data = '';
//            }
            $element.remove();
        });

        if (noElementsFound) {
            grunt.log.writeln('No scripts with wildcard found');
            return content;
        }

        return $.html();
    };


    grunt.registerMultiTask('globhtml', 'Add globbing to your HTML', function () {
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
