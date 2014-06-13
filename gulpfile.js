var gulp        = require('gulp');
var tap         = require('gulp-tap');
var path        = require('path');
var markdown    = require('gulp-markdown');
var markdownpdf = require('gulp-markdown-pdf');
var clean       = require('gulp-clean');
var runSequence = require('run-sequence');
var replace     = require('gulp-replace');
var deploy      = require("gulp-gh-pages");

function cd(){
  var fs = require('fs');
  return fs.realpathSync('./');
}

// default task do clean, html and pdf task
gulp.task('default', function (){
  runSequence('clean', 'htmlAndPdf');
});

gulp.task('deploy', function () {
    return gulp.src(["./dist/html/**/*", "./dist/pdf/02_busido_coffee.pdf"])
        .pipe(deploy());
});

gulp.task('htmlAndPdf', ['html', 'pdf']);

//-------------------------------------------------------------------------
// markdown to html
//-------------------------------------------------------------------------
gulp.task('html', ['html-css', 'html-image'], function () {
  runSequence('beforeBodyHtml', 'markdownToHtml');
});

gulp.task('markdownToHtml', function () {
  return gulp.src('dist/markdown/html/*.md')
    // add YouTube player
    .pipe(markdown())
    .pipe(
      replace(
        /<p><a href="https:\/\/www\.youtube\.com\/watch\?v=(.*)">.*<\/a><\/p>/g,
        '<iframe width="560" height="315" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>'
      )
    )
    .pipe(
      tap(function (file) {

        var title = String(file.contents).match(/<h1.*>(.*)<\/h1>/)[1];

        file.contents = new Buffer(
'<!DOCTYPE html>' + "\n" +
'<html lang="en">' + "\n" +
'  <head>' + "\n" +
'    <meta charset="utf-8">' + "\n" +
'    <meta name="viewport" content="width=device-width, initial-scale=1">' + "\n" +
'    <title>' + title + ' | かせいさん @ ウソ日本ネタ紹介本</title>' + "\n" +
'    <link href="css/style.css" rel="stylesheet">' + "\n" +
'      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>' + "\n" +
'      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>' + "\n" +
'    <![endif]-->' + "\n" +
'  </head><body><div class="main"">' + "\n" +

' <div class="about"> ' + "\n" +
'このページは、<a href="https://twitter.com/kasei_san">かせいさん</a>が、<a href="http://nin89.webcrow.jp/">ニンジャ万博</a>の為に作った、忍殺的アトモスフィア紹介本の HTML バージョンです' + "\n" +
' </div> ' + "\n" +

     String(file.contents) +

'<div class="ninja_onebutton">' + "\n" +
'<script type="text/javascript">' + "\n" +
'//<![CDATA[' + "\n" +
'(function(d){' + "\n" +
'if(typeof(window.NINJA_CO_JP_ONETAG_BUTTON_a0f0ac6773e1222899f6490749415969)==\'undefined\'){' + "\n" +
'    document.write("<sc"+"ript type=\'text\/javascript\' src=\'http:\/\/omt.shinobi.jp\/b\/a0f0ac6773e1222899f6490749415969\'><\/sc"+"ript>");' + "\n" +
'}else{ ' + "\n" +
'    window.NINJA_CO_JP_ONETAG_BUTTON_a0f0ac6773e1222899f6490749415969.ONETAGButton_Load();}' + "\n" +
'})(document);' + "\n" +
'//]]>' + "\n" +
'</script><span class="ninja_onebutton_hidden" style="display:none;"></span><span style="display:none;" class="ninja_onebutton_hidden"></span>' + "\n" +
'</div>' + "\n" +

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

gulp.task('html-image', function () {
  return gulp.src('img/**/*.*')
    .pipe(gulp.dest('dist/html/image'));
});

//-------------------------------------------------------------------------
// markdown to pdf
//-------------------------------------------------------------------------
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
  options.cssPath = path.join(cd(), "style_and_js", "pdf", "css", "cover.css");

  return gulp.src('markdown/cover/*')
    .pipe(markdownpdf(options))
    .pipe(gulp.dest('dist/pdf/'));
});

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

    // QRcode to HTML ver
    .pipe(
      tap(function (file) {
         file.contents = new Buffer(
           String(file.contents) +
             "\n\n![](http://chart.apis.google.com/chart?chs=100x100&cht=qr&chl=http://kasei-san.github.io/njslyr_atmosphere/" + path.basename(file.path).replace(".md", ".html") + ")" +
             " <- このページのHTML版へ!"
         );
      })
    )

    .pipe(gulp.dest('dist/markdown/pdf/'));
});

gulp.task('bodyPdf', function () {
  var options = {};
  options.cssPath = path.join(cd(), "style_and_js", "pdf", "css", "body.css");
  options.runningsPath = path.resolve('markdown-pdf/runnings.js')

  return gulp.src('dist/markdown/pdf/*.md')
    .pipe(markdownpdf(options))
    .pipe(gulp.dest('dist/pdf'));
});
