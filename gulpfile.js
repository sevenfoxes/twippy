'use strict';

const path = require('path');

//gulp
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const rename = require('gulp-util');

//less
const less = require('gulp-less');
const autoprefixer = require('autoprefixer');

//browserify
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const watchify = require('watchify');

//utils
const bSync = require('browser-sync');
const chalk = require('chalk');
const del = require('del');
const rewrite = require('connect-rewrite');
const merge = require('utils-merge');

gulp.task('style', () => {
  let processors = [
    autoprefixer({browsers: ['last 3 version']}),
  ]

  gulp.src('./src/*.less')
    .pipe(less({
      paths: ['./src/components/**/*.less']
    }))
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest'));
});

gulp.task('browserify', () => {
  let args = merge(browserify.args, { debug: true });
  let bundler = watchify(browserify('./src/app.js', args)).transform(babelify, { /* opts */ });

  bundler.bundle()
    .on('error', map_error)
    .pipe(source('./src/app.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.dist))
    .pipe(sourcemaps.init({ loadMaps: true }))
      // capture sourcemaps from transforms
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.dist))
    .pipe(sync.stream());

});

gulp.task('sync', ['metal', 'scss', 'images', 'third-party-scripts'] , () => {
  sync.init({
    server: {
      baseDir: './dist',
      middleware: [
        rewrite([
          '^.([^\\.]+)$ /$1.html [L]'
        ])
      ]
    },
    open: false,
    browser: 'default',
    reloadOnRestart: true,
    notify: false
  });

  gulp.watch('./layouts/**/*.jade', ['metal']);
  gulp.watch('./scss/**/*.scss', ['scss']);
  gulp.watch('./js/**/*.js', ['third-party-scripts']);
  gulp.watch('./server.js', ['server']);
  gulp.watch('./img/**/*.*', ['images']);
});

gulp.task('default', ['sync', 'server']);
