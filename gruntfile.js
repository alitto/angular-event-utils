'use strict';

var srcFiles = [
    'src/**/module.js',
    'src/**/*.js'
];

module.exports = function(grunt) {

    // Project Configuration
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: pkg,
        
        srcFiles: srcFiles,
        build_dir: 'dist',
        components_dir: 'examples/bower_components',

        jshint: {
            all: {
                src: srcFiles,
                options: {
                    jshintrc: true
                }
            }
        },
        uglify: {
            options: {
                mangle: true,
            },
            js: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: '<%=  build_dir %>/*.js',
                    dest: '.',
                    ext: '.min.js'
                }]
            }
        },
        concat: {
            js: {
                src: srcFiles,
                dest: '<%=  build_dir %>/angular-event-utils.js'
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        clean: {
            dist: '<%=  build_dir %>'
        },
        jasmine: {
            all: {
                src: [
                    // Vendor libraries
                    '<%= components_dir %>/jquery/dist/jquery.min.js',
                    '<%= components_dir %>/angular/angular.js',
                    '<%= components_dir %>/angular-mocks/angular-mocks.js',

                    // Library
                    '<%=  build_dir %>/angular-event-utils.min.js'
                ],
                options: {
                    specs: 'test/*Spec.js',
                    helpers: 'test/*Helper.js'
                }
            }
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // Build task
    grunt.registerTask('build', [ 'clean', 'jshint', 'concat', 'uglify' ]);

    // Test task
    grunt.registerTask('test', [ 'build', 'jasmine' ]);

    // Define default task
    grunt.registerTask('default', [ 'test' ]);
};