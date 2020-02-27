let gulp = require('gulp'),
    sass = require('gulp-sass'),
    del = require('del'),
    newer = require('gulp-newer'),
    browserSync = require('browser-sync'),
    cleanCSS = require('gulp-clean-css'),
    nunjucksRender = require('gulp-nunjucks-render'),
    reload = browserSync.reload;


// TASKS
gulp.task('clean', function(done){
  // Deletes all files from dist/
  del.sync('dist/', {force: true});
  done()
});

gulp.task('nunjucks', function() {
  // Gets all .html files in pages
  return gulp.src('app/**/*.html')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
    path: ['app/templates/']
  }))
  // Outputs files in dist folder
  .pipe(gulp.dest('dist'))
});

gulp.task('sass', function(){
  return gulp.src('scss/style.scss')
    .pipe(sass()) // Compiles styles.scss to css
    .pipe(cleanCSS({compatibility: 'ie9'})) // Minifies CSS
    .pipe(gulp.dest('app/static/css'))
    .pipe(reload({
      stream: true
    }))
});

// Copy html files to dist
gulp.task('html', function(){
  return gulp.src(['app/**/*.html', 'app/CNAME'])
    .pipe(newer('dist/')) // Only get the modified files
    .pipe(gulp.dest('dist/'))
});

// Copy all static files
gulp.task('copy-static', function(){
  return gulp.src('app/static/**/*.*', {base: './app/static/'})
    .pipe(gulp.dest('dist/static/'));
});

gulp.task('browserSync', function(){
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});

gulp.task('reload', function(done){
  reload();
  done();
});

// Watch for changes
gulp.task('watch', function(done){
  // Watch HTML pages
  gulp.watch('app/**/*.html', gulp.series('html', 'nunjucks', 'copy-static',
    'reload'));
  // Watch Nunjucks templates
  gulp.watch('app/templates/', gulp.series('html', 'nunjucks', 'copy-static',
    'reload'));
  // Watch SCSS files
  gulp.watch('scss/**/*.scss', gulp.series('sass'));
  // Watch static files
  gulp.watch('app/static/**/*.*', gulp.series('copy-static', 'reload'));
  done();
});

// Starts browserSync
gulp.task('serve', function(done){
  browserSync({
    server: {
      baseDir: './dist',
      index: "index.html"
    }
  });
  done();
});


// Default task
gulp.task('default', gulp.series('clean', 'nunjucks', 'sass', 'html',
  'copy-static', 'serve', 'watch'));

// Deployment task
gulp.task('build', gulp.series('clean', 'nunjucks', 'sass', 'html',
  'copy-static'));