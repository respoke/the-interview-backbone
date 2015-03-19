var gulp = require('gulp');
var server = require('gulp-develop-server');
var jasmine = require('gulp-jasmine');
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

// Build Production Files, the Default Task
/*gulp.task('default', function (cb) {
	runSequence(['server:start', 'server:restart'], cb);
});*/

/*gulp.task('jasmine', function () {
    return gulp.src('./spec/*.spec.js')
        .pipe(jasmine());
});*/

gulp.task('karma', function (done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: false
	}, done);
});


gulp.task('default', ['server:start', 'server:restart']);

gulp.task('tests', ['karma']);