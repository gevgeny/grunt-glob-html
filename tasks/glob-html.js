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
     * Get the appropriate attr to handle in accordance with element type:
     * link - href, script - src.
     * @param {object} $element element to handle.
     * @return {string} attr to handle. ('src', 'href')
     * */
    var getAttrToHandle = function ($element) {
        if ($element.is('script')) {
            return 'src';
        }

        return 'href';
    };

    /**
     * Checks whether element should be handled.
     * @param {object} $element element to handle.
     * @return {boolean}
     * */
    var isElementHandled = function ($element) {
        var attr = getAttrToHandle($element);
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
            elementsToProcess = [],
            alreadySetAttrs = [];

        $elements.each(function (i, element) {
            var $element = $(element), indent,
                attr = getAttrToHandle($element);

            var attrVal = $element.attr(attr);
            if(attrVal) {
                if (isElementHandled($element)) {
                    elementsToProcess.push(element);
                }
                else {
                    alreadySetAttrs.push(attrVal);
                }
            }
        });

        if (elementsToProcess.length === 0) {
            grunt.log.writeln('No scripts with wildcard found');
            return content;
        }

        elementsToProcess.forEach(function (element, i) {
            var $element = $(element), indent, attr = getAttrToHandle($element);

            indent = fetchIndent($element);

            // Expand initial script to matched ones.
            expandElement($element, attr).forEach(function (newElement, i) {
                var $newElement = $(newElement);
                var attrVal = $newElement.attr(attr);
                if(alreadySetAttrs.indexOf(attrVal) < 0) {
                    if (i === 0) {
                        $element.before(newElement);
                    } else {
                        $element.before(indent + newElement);
                    }
                    alreadySetAttrs.push(attrVal);
                }
            });

            // Remove the handled element with its indent.
//            if (indent) {
//                $element[0].prev.data = '';
//            }
            $element.remove();
        });

        return $.html();
    };


    grunt.registerMultiTask('globhtml', 'Add globbing to your HTML', function () {
        var gruntDir = process.cwd(),
            data = this.data,
            dest = data.dest,
            baseDir = function(filePath) {
                return data.base ? data.base : path.dirname(filePath)
            };

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
            grunt.file.setBase(baseDir(filePath));
            
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
