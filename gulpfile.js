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
gulp.task('default', function (){
  runSequence('clean', 'htmlAndPdf');
});

gulp.task('htmlAndPdf', ['html', 'pdf']);

// markdown to html
gulp.task('html', ['html-css', 'html-js', 'html-image'], function () {
  runSequence('beforeBodyHtml', 'markdownToHtml');
});

gulp.task('markdownToHtml', function () {
  return gulp.src('dist/markdown/html/*.md')
    .pipe(markdown())
    // js で、ファイルの末尾を指定した、replace のやり方がわからない...
    .pipe(
      tap(function (file) {

        var title = String(file.contents).match(/<h1.*>(.*)<\/h1>/)[1];

        file.contents = new Buffer(
'<!DOCTYPE html>' + "\n" +
'<html lang="en">' + "\n" +
'  <head>' + "\n" +
'    <meta charset="utf-8">' + "\n" +
'    <meta http-equiv="X-UA-Compatible" content="IE=edge">' + "\n" +
'    <meta name="viewport" content="width=device-width, initial-scale=1">' + "\n" +
'    <title>' + title + '</title>' + "\n" +
'    <link href="css/bootstrap.min.css" rel="stylesheet">' + "\n" +
'    <link href="css/style.css" rel="stylesheet">' + "\n" +
'      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>' + "\n" +
'      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>' + "\n" +
'    <![endif]-->' + "\n" +
'  </head><body><div class="main"">' + "\n" +
     String(file.contents) +
'  <div class="footer">' + "\n" +
'    <div>かせいさん @ ウソ日本ネタ紹介本</div>' + "\n" +
'    <div><a href="./01_maegaki.html">about</a><div>' + "\n" +
'  </div>' + "\n" +
'  </html>'
        );
      })
    )
    .pipe(gulp.dest('dist/html'));
});

// before markdown to pdf
gulp.task('beforeBodyHtml', function () {

  function replaceImgTag(file) {
    // replace img tag
    var filename = path.basename(file.path);
    var imgdir = "./image/" + filename.replace(".md", '').replace(/\d+_/, '');
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
    .pipe(gulp.dest('dist/markdown/html/'));
});

gulp.task('html-css', function () {
  return gulp.src('style_and_js/html/css/*.css')
    .pipe(gulp.dest('dist/html/css'));
});

gulp.task('html-js', function () {
  return gulp.src('style_and_js/html/js/*.js')
    .pipe(gulp.dest('dist/html/js'));
});

gulp.task('html-image', function () {
  return gulp.src('img/**/*.*')
    .pipe(gulp.dest('dist/html/image'));
});

// markdown to pdf
gulp.task('pdf', function () {
  runSequence('bookCoverPdf', 'beforeBodyPdf', 'bodyPdf');
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
