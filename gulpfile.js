var gulp        = require('gulp');
var tap         = require('gulp-tap');
var path        = require('path');
var markdown    = require('gulp-markdown');
var markdownpdf = require('gulp-markdown-pdf');
var clean       = require('gulp-clean');
var runSequence = require('run-sequence');
var replace     = require('gulp-replace');

function cd(){
  var fs = require('fs');
  return fs.realpathSync('./');
}

// default task do clean, html and pdf task
gulp.task('default', ['clean', 'html', 'pdf']);

// markdown to html
gulp.task('html', function () {
  return gulp.src('dist/markdown/*.md')
    .pipe(markdown())
    .pipe(gulp.dest('dist/html'));
});

// markdown to pdf
gulp.task('pdf', function () {
  runSequence('clean', 'bookCoverPdf', 'beforeBodyPdf', 'bodyPdf');
});

// cleanup dist dir
gulp.task('clean', function () {
  return gulp.src('dist')
    .pipe(clean());
});

gulp.task('bookCoverPdf', function () {
  var options = {};
  options.cssPath = path.join(cd(), "css", "pdf", "cover.css");

  return gulp.src('markdown/cover/*')
    .pipe(markdownpdf(options))
    .pipe(gulp.dest('dist/pdf/'));
});

// before markdown to pdf
gulp.task('beforeBodyPdf', function () {

  function replaceImgTag(file) {
    // replace img tag
    var filename = path.basename(file.path);
    var imgdir = path.join(cd(), "img", filename.replace(".md", '').replace(/\d+_/, ''));
    file.contents = new Buffer(
      String(file.contents).replace(/\w+\.(png|jpg)/g, imgdir + "/$&")
    );
  }

  return gulp.src('markdown/*.md')
    .pipe(
      tap(function (file) {
        replaceImgTag(file);
      })
    )
    // add YouTube image
    .pipe(replace(/https:\/\/www\.youtube\.com\/watch\?v=(.*)/g, "![](http://i.ytimg.com/vi/$1/0.jpg)\n$&"))
    // add QR code on link tag
    //.pipe(replace(/[^!]\[.*\]\((.*)\)/g, '$&\n![](http://chart.apis.google.com/chart?chs=150x150&cht=qr&chl=$1)'))
    .pipe(gulp.dest('dist/markdown/pdf/'));
});

gulp.task('bodyPdf', function () {
  var options = {};
  options.cssPath = path.join(cd(), "css", "pdf", "body.css");

  return gulp.src('dist/markdown/pdf/*.md')
    .pipe(markdownpdf(options))
    .pipe(gulp.dest('dist/pdf'));
});
