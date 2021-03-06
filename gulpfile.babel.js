import gulp from 'gulp';

import babel from 'gulp-babel';
import browserify from 'gulp-browserify';
import clean from 'gulp-clean-css';
import concat from 'gulp-concat';
import envify from 'gulp-envify';
import fs from 'fs';
import less from 'gulp-less';
import md5 from 'md5';
import path from 'path';
import uglify from 'gulp-uglify';

gulp.task('transpile-server', () =>
    gulp.src('./src/server/**/*.js')
      .pipe(babel())
      .on('error', console.error.bind(console))
      .pipe(gulp.dest('./build/server'))
);

gulp.task('transpile-public', () =>
  gulp.src('./src/public/**/*.js')
    .pipe(babel())
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('./tmp'))
);

gulp.task('browserify-public', ['transpile-public'], () =>
  gulp.src('./tmp/js/index.js')
    .pipe(browserify())
    .pipe(gulp.dest('./build/public/js'))
);

gulp.task('less', () =>
  gulp.src('./src/public/**/*.less')
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./build/public/css'))
);

gulp.task('html', () =>
  gulp.src('./src/public/**/*.html')
    .pipe(gulp.dest('./build/public'))
);

gulp.task('minify-js', () =>
  gulp.src('./build/public/js/index.js')
    .pipe(envify({ NODE_ENV: 'production' }))
    .pipe(uglify())
    .pipe(gulp.dest('./build/public/js'))
);

gulp.task('minify-css', () =>
  gulp.src('./build/public/css/main.css')
    .pipe(clean())
    .pipe(gulp.dest('./build/public/css'))
);

gulp.task('minify', ['minify-js', 'minify-css'], () => {
  const publicPath = path.resolve(__dirname, 'build', 'public');
  const jsContent = fs.readFileSync(path.resolve(publicPath, 'js', 'index.js'), 'utf8');
  fs.renameSync(path.resolve(publicPath, 'js', 'index.js'), path.resolve(publicPath, 'js', `index.${md5(jsContent)}.js`));

  const cssContent = fs.readFileSync(path.resolve(publicPath, 'css', 'main.css'), 'utf8');
  fs.renameSync(path.resolve(publicPath, 'css', 'main.css'), path.resolve(publicPath, 'css', `main.${md5(cssContent)}.css`));

  const htmlContent = fs.readFileSync(path.resolve(publicPath, 'index.html'), 'utf8');
  fs.writeFileSync(path.resolve(publicPath, 'index.html'), htmlContent.replace('index.js', `index.${md5(jsContent)}.js`).replace('main.css', `main.${md5(cssContent)}.css`));
});

gulp.task('public', ['browserify-public', 'less', 'html']);
gulp.task('server', ['transpile-server']);
gulp.task('build-prod', ['build'], () =>
  gulp.run('minify')
);

gulp.task('build', ['public', 'server']);
gulp.task('watch', ['build'], () => {
  gulp.watch('./src/public/**/*.js', ['browserify-public']);
  gulp.watch('./src/public/**/*.less', ['less']);
  gulp.watch('./src/public/**/*.html', ['html']);
  gulp.watch('./src/server/**/*.js', ['transpile-server']);
});
