var gulp = require('gulp');
var config = require('../config').markup;

gulp.task('flexboxgrid', function() {
  return gulp.src('node_modules/flexboxgrid/dist/flexboxgrid.css')
    .pipe(gulp.dest('build/'));
});

gulp.task('markup', ['flexboxgrid'], function() {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest));
});
