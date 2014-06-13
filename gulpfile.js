var gulp        = require('gulp');
var tap         = require('gulp-tap');
var path        = require('path');
var markdown    = require('gulp-markdown');
var markdownpdf = require('gulp-markdown-pdf');
var clean       = require('gulp-clean');

// default task do clean, html and pdf task
gulp.task('default', ['clean', 'html', 'pdf']);

// markdown to html
gulp.task('html', function () {
  return gulp.src('dist/markdown/*.md')
    .pipe(markdown())
    .pipe(gulp.dest('dist/html'));
});

// before markdown to pdf
gulp.task('beforePdf', function () {

  function cd(){
    var fs = require('fs');
    return fs.realpathSync('./');
  }

  function replaceImgTag(file) {
    // replace img tag
    var filename = path.basename(file.path);
    var imgdir = path.join(cd(), "img", filename.replace(".md", ''))
    file.contents = new Buffer(
      String(file.contents).replace(/\b.*jpg/, imgdir + "/$&")
    );
  }

  return gulp.src('markdown/*.md')
    .pipe(
      tap(function (file) {
        replaceImgTag(file);
      })
    )
    .pipe(gulp.dest('dist/markdown/pdf/'));
});

// markdown to pdf
gulp.task('pdf', function () {
  return gulp.src('dist/markdown/pdf/*.md')
    .pipe(markdownpdf())
    .pipe(gulp.dest('dist/pdf'));
});

// cleanup dist dir
gulp.task('clean', function () {
  return gulp.src('dist')
    .pipe(clean());
});
