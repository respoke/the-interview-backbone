var gulp = require('gulp');
var server = require('gulp-develop-server');
var jasmine = require('gulp-jasmine');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var karma = require('karma').server;
//var runSequence = require('run-sequence');

// run server
gulp.task('server:start', function() {
	server.listen( { path: './server.js' } );
});

// restart server if server.js changed
gulp.task('server:restart', function() {
	gulp.watch( [ './server.js' ], server.restart );
});

// start test server suite
gulp.task('karma', function (done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: false
	}, done);
});

// concat js and css
gulp.task('css', function() {
	return gulp.src([
		'./bower_components/bootstrap/dist/css/bootstrap.css',
		'./bower_components/font-awesome/css/font-awesome.css',
		'./app/css/style.css'
    ])
	.pipe(concat('interview.css'))
	.pipe(minifyCSS())
	.pipe(gulp.dest('./app/css/'));
});

gulp.task('copy', function(){
	gulp.src('./bower_components/font-awesome/fonts/*.*')
	.pipe(gulp.dest('./app/fonts/'));
});

gulp.task('scripts', function() {
	return gulp.src([
		'./bower_components/jquery/dist/jquery.js',
		'./bower_components/jquery-migrate/jquery-migrate.js',
		'./bower_components/underscore/underscore.js',
		'./bower_components/backbone/backbone.js',
		'./bower_components/json2/json2.js',
		'./bower_components/bootstrap/dist/js/bootstrap.js',
		'./bower_components/gravatarjs/gravatar.js',
		'./bower_components/moment/moment.js',
		'./bower_components/store-js/store.js',
		'./bower_components/jrumble/jquery.jrumble.js',
		'./bower_components/respoke/respoke.min.js',
		'./bower_components/raphael/raphael.js',
		'./app/js/vendors/raphael.sketchpad.js',

		'./app/js/config.js',
		'./app/js/models/*.js',
		'./app/js/collections/*.js',
		'./app/js/views/*.js'
    ])
	.pipe(concat('interview.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./app/js/'));
});

gulp.task('watch', function() {
    gulp.watch(['./app/css/*.css', '!./app/css/interview.css', 
				'./app/js/**/*.js', '!./app/js/**/interview.js'], ['css', 'copy', 'scripts']);
});


// Build Production Files, the Default Task
gulp.task('default', ['server:start', 'server:restart', 'watch']);

gulp.task('concat', ['css', 'copy', 'scripts']);

gulp.task('tests', ['karma']);