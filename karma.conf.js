// Karma configuration
// Generated on Wed Mar 18 2015 21:50:06 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
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
		'./bower_components/Autolinker.js/dist/Autolinker.js',
		'./bower_components/jquery.maskedinput/dist/jquery.maskedinput.js',
		'./bower_components/libphonenumber/dist/libphonenumber.js',
		'./app/js/vendors/raphael.sketchpad.js',

		'./app/js/config.js',
		'./app/js/models/*.js',
		'./app/js/collections/*.js',
		'./app/js/views/*.js',
		
		'./node_modules/chai/chai.js',
		'./node_modules/sinon/pkg/sinon.js',
		'./spec/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],
	
	
    hostname: 'localhost',
	
    proxyValidateSSL: false,
	
    proxies: {
        '/': 'https://localhost/'
    },
	
	//urlRoot: '__karma__',

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    //browsers: ['PhantomJS'],
    // Start these browsers, currently available:
    browsers: ['ChromeAutoaccept'],
	
    customLaunchers: {
        ChromeAutoaccept: {
            base: 'Chrome',
            flags: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
        }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
