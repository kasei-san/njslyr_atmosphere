var gulp        = require('gulp');
var markdown    = require('gulp-markdown');
var markdownpdf = require('gulp-markdown-pdf');
var clean       = require('gulp-clean');

// default task do clean, html and pdf task
gulp.task('default', ['clean', 'html', 'pdf']);

// markdown to html
gulp.task('html', function () {
  return gulp.src('markdown/*.md')
    .pipe(markdown())
    .pipe(gulp.dest('dist/html'));
});

// markdown to pdf
gulp.task('pdf', function () {
  return gulp.src('markdown/*.md')
    .pipe(markdownpdf())
    .pipe(gulp.dest('dist/pdf'));
});

// cleanup dist dir
gulp.task('clean', function () {
  return gulp.src('dist')
    .pipe(clean());
});
