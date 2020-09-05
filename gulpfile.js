var gulp = require('gulp'),
sass = require('gulp-sass'),
del = require('del');

gulp.task('del', () => {
    return del([
        'styles/css/main.css'
    ]);
});

gulp.task('sass', () => {
    return gulp.src('styles/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('styles/css'));
});

gulp.task('default', gulp.series(['del','sass']));