/*
 * grunt-glob-html
 * https://github.com/gevgeny/grunt-glob-html
 *
 * Copyright (c) 2014 Eugene Gluhotorenko
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js', 'tasks/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['test/tmp']
        },

        // Configuration to be run (and then tested).
        globhtml: {
            oneSrc: {
                src: 'test/examples/content.html',
                dest: 'test/tmp/one-src/content.html'
            },
            multipleSrc: {
                src: 'test/examples/*.html',
                dest: 'test/tmp/multiple-src/'
            },
            customBase: {
                src: 'test/examples-custom-base/content.html',
                dest: 'test/tmp/custom-base/content.html',
                base: 'test/examples'
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/*.spec.js']
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jshint', 'clean', 'globhtml', 'mochaTest']);

};
