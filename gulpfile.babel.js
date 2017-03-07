import gulp from 'gulp';
import gulpPlumber from 'gulp-plumber';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config.main.babel';

gulp.task('script:background', (() => {
  const src = 'src/scripts/background.js';
  const dest = 'app/scripts/';
  return () => {
    gulp.src(src)
      .pipe(gulpPlumber())
      .pipe(webpack(Object.assign(webpackConfig, {
        output: {
          filename: 'background.js',
        },
      })))
      .pipe(gulp.dest(dest));
  }
})());

gulp.task('script:popup', (() => {
  const src = 'src/scripts/popup.js';
  const dest = 'app/popup/scripts/';

  return () => {
    gulp.src(src)
      .pipe(gulpPlumber())
      .pipe(webpack(Object.assign(webpackConfig, {
        output: {
          filename: 'popup.js',
        },
      })))
      .pipe(gulp.dest(dest));
  }
})());

{
  const src = 'src/**/*.js';
  const tasks = ["script:background", "script:popup"];

  gulp.task('scripts', tasks, () => {
    gulp.watch(src, tasks);
  });
}
