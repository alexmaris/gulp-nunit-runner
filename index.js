
"use strict";
var
	gutil = require('gulp-util'),
	exec = require('child_process').exec,
	_ = require('lodash'),
	PluginError = gutil.PluginError,
	through = require('through2')
	;

var PLUGIN_NAME = 'gulp-nunit-runner';

var assemblies = [],
	switches = [],
	options;

function gulpNunitRunner(opts) {
	options = opts;
	if (!opts || !opts.command) {
		throw new PluginError(PLUGIN_NAME, "Path to NUnit executable is required in options.command");
	}

	if (opts.options) {
		parseSwitches(opts.options);
	}

	// Creating and return a stream through which each file will pass
	return through.obj(transform, flush);
}

function parseSwitches(options) {
	_.forEach(options, function (val, key) {
		if (typeof val === 'boolean') {
			if (val) {
				switches.push('/' + key);
			}
			return;
		}
		if (typeof val === 'string') {
			switches.push('/' + key + ':"' + val + '"');
		}
	});
}

function transform(file, enc, callback) {
	assemblies.push(file.path);
	this.push(file);
	return callback();
}

function flush(callback) {
	var execute = [];
	execute.push(options.command);
	execute.push(switches.join(' '));
	execute.push('"' + assemblies.join('" "') + '"');
	execute = execute.join(' ');

	var cp = exec(execute, function (err, stdout, stderr) {
		if (err) {
			return callback(err);
		}
		return callback();
	});

	cp.stdout.pipe(process.stdout);
	cp.stderr.pipe(process.stderr);
}

module.exports = gulpNunitRunner;
