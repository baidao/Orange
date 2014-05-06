# ----------------------------------
# * Orange's Gruntfile
# * Licensed under The MIT License
# * http://opensource.org/licenses/MIT
# * ----------------------------------

module.exports = (grunt) ->
  "use strict"

  # Force use of Unix newlines
  grunt.util.linefeed = "\n"
  RegExp.quote = (string) ->
    string.replace /[-\\^$*+?.()|[\]{}]/g, "\\$&"


  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    # Metadata.
    meta:
      distPath: "dist/"
      # docsPath: "docs/dist/"
      docsAssetsPath: "docs/assets/"

    clean:
      dist: [
        "dist"
        ".tmp"
        "docs/dist"
      ]

    coffee:
      dist:
        files: [
          expand: true
          cwd: "scripts"
          src: "{,*/}{,*/}*.coffee"
          dest: ".tmp/scripts/"
          extDot: "last"
          ext: ".js"
        ]

    requirejs:
      dist:
        options:
          name: "orange"
          baseUrl: ".tmp/scripts"
          out: "<%= meta.distPath %>js/orange.js"

    compass:
      options:
        sassDir: "scss"
        cssDir: "<%= meta.distPath %>css/"
        imagesDir: "images"
        relativeAssets: true
      server:
        options:
          debugInfo: false

    copy:
      fonts:
        expand: true
        src: "fonts/*"
        dest: "<%= meta.distPath %>/"


    cssmin:
      options:
        keepSpecialComments: "*" # set to '*' because we already add the banner in sass
        noAdvanced: true # disable advanced optimizations since it causes many issues
        report: "min"

      dist:
        src: "<%= meta.distPath %>css/<%= pkg.name %>.css"
        dest: "<%= meta.distPath %>css/<%= pkg.name %>.min.css"


  require("load-grunt-tasks") grunt,
    scope: "devDependencies"

  require("time-grunt") grunt

  grunt.registerTask "dist-css", [
    "compass"
    "cssmin"
  ]

  grunt.registerTask "dist-js", [
    "coffee"
    "requirejs"
  ]

  grunt.registerTask "dist", [
    "clean"
    "dist-css"
    "dist-js"
    "copy"
  ]

  grunt.registerTask "default", ["dist"]

