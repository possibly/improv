'use strict';

const path = require('path');
const gulp = require('gulp');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const del = require('del');
const isparta = require('isparta');

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
require('babel-core/register');

gulp.task('nsp', function (cb) {
  nsp({ package: path.resolve('package.json') }, cb);
});

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {
  let mochaErr;

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', function (err) {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', function () {
      cb(mochaErr);
    });
});

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**'], ['test']);
});

gulp.task('babel', ['clean'], function () {
  return gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return del(['dist', 'demo_build']);
});

gulp.task('build-demo', function () {
  return gulp.src('demo/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('demo_build'));
});

gulp.task('lib-demo', function () {
  return gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('demo_build/lib'));
});

gulp.task('json-demo', function () {
  return gulp.src('demo/**/*.json')
    .pipe(gulp.dest('demo_build'));
});

gulp.task('watch-demo', function () {
  gulp.watch(['demo/**/*.json'], ['json-demo']);
});

gulp.task('demo', ['build-demo', 'lib-demo', 'json-demo']);
gulp.task('prepublish', ['nsp', 'babel']);
gulp.task('default', ['test']);
