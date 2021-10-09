const appVersion = "1.0.0"; // app version required for cache buster
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
    let lTargetFilename = "all-" + getAppVersion() + ".min.css";

    // Copy css-file to debug folder to style css during debug-mode.
    // let lCssFolderDebugBlazor = "bin/Debug/net5.0/wwwroot/css";
    // let lCssFolderDebugAspNetMvc = "bin/Debug/net5.0/wwwroot/css";

    // run Task
    gulp.task("CompileLessAndClean", gulp.series(
        function () {

            return gulp.src(lLessFolder + "/**/*.less")
                .pipe(less({})).on('error', GlobalErrorHandler)
                .pipe(cleanCSS()) // minify css files
                .pipe(concat(lTargetFilename)) // concatenate all files
                .pipe(gulp.dest(lCssFolder)
                // .pipe(gulp.dest(lCssFolderDebugAspNetMvc)) // copy to debug folder
                );

        }));

    // Start watcher
    return gulp.watch(lLessFolder + "/**/*.less", gulp.series("CompileLessAndClean"));
}));

// start watcher
gulp.task("default", gulp.parallel("CssWatcher"));

// -------------------------------------------------
// Helper functions --------------------------------
// -------------------------------------------------

//
// provide version number of the app for cache buster
// 
function getAppVersion() {
    return appVersion;
}

//
// global Error handler for tasks
// 
function GlobalErrorHandler(error) {

    // If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}
