let gulp = require('gulp');
let less = require('gulp-less');
let cleanCSS = require('gulp-clean-css');
let concat = require('gulp-concat');

//
// watcher for general less files
//
gulp.task("CssWatcher", gulp.series(function () {

    // define scope here:
    let lLessFolder = "wwwroot/less";
    let lCssFolder = "wwwroot/css";
    let lTargetFilename = "all.min.css";

    // run Task
    gulp.task("CompileLessAndClean", gulp.series(
        function () {

            return gulp.src(lLessFolder + "/**/*.less")
                .pipe(less({})).on('error', GlobalErrorHandler)
                .pipe(cleanCSS()) // minify css files
                .pipe(concat(lTargetFilename)) // concatenate all files
                .pipe(gulp.dest(lCssFolder)
                );

        }));

    // Start watcher
    return gulp.watch(lLessFolder + "/**/*.less", gulp.series("CompileLessAndClean"));
}));

// start watcher
gulp.task("default", gulp.parallel("CssWatcher"));

//
// global Error handler for tasks
// 
function GlobalErrorHandler(error) {

    // If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}
