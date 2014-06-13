var gulp        = require('gulp');
var tap         = require('gulp-tap');
var path        = require('path');
var markdown    = require('gulp-markdown');
var markdownpdf = require('gulp-markdown-pdf');
var clean       = require('gulp-clean');
var runSequence = require('run-sequence');

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
    console.log(imgdir);
    file.contents = new Buffer(
      String(file.contents).replace(/\w+\.jpg/g, imgdir + "/$&")
    );
  }

  function addYoutubeImage(file) {
    //http://i.ytimg.com/vi/764gmzb8ac0/hqdefault.jpg
    file.contents = new Buffer(
      String(file.contents).replace(/https:\/\/www\.youtube\.com\/watch\?v=(.*)/g, "![](http://i.ytimg.com/vi/$1/0.jpg)\n$&")
    );
  }

  return gulp.src('markdown/*.md')
    .pipe(
      tap(function (file) {
        replaceImgTag(file);
        addYoutubeImage(file);
      })
    )
    .pipe(gulp.dest('dist/markdown/pdf/'));
});

gulp.task('bodyPdf', function () {
  var options = {};
  options.cssPath = path.join(cd(), "css", "pdf", "body.css");

  return gulp.src('dist/markdown/pdf/*.md')
    .pipe(markdownpdf(options))
    .pipe(gulp.dest('dist/pdf'));
});
