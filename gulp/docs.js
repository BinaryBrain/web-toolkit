/**
 * @file The Metalsmith workflow that builds our docs.
 */

module.exports = exports = function (options) {
  var path = require('path');
  var options = options || {};

  options.cwd = options.cwd || './';
  options.src = options.src || './src';
  options.dest = options.dest || './dest';

  return function (cb) {
    var Metalsmith = require('metalsmith');
    var collections = require('metalsmith-collections');
    var templates = require('metalsmith-templates');
    var jade = require('metalsmith-jade');
    var ignore = require('metalsmith-ignore');
    var branch = require('metalsmith-branch');
    var sass = require('metalsmith-sass');

    var metalsmith = new Metalsmith(options.cwd);
    metalsmith.source(options.src);

    // put the visuals to metadata
    metalsmith.use(branch('visuals/*.jade')
      .use(jade({ locals: metalsmith.metadata() }))
      .use(collections({ visuals: 'visuals/*' }))
      .use(ignore('visuals/*')));

    // do the static pages
    metalsmith.use(branch('*.jade')
      .use(jade({ locals: metalsmith.metadata() }))
      .use(templates({
        engine: 'jade',
        directory: path.join(options.src, 'layouts')
      })));

    // do the styles
    metalsmith.use(branch('scss/*')
      .use(sass({
        outputDir: 'css/',
        includePaths: [
          './scss'
        ]
      })));

    // we no need the layouts
    metalsmith.use(ignore('layouts/*'));

    metalsmith.destination(options.dest);

    return metalsmith.build(function (err) {
      if (err) return cb(err);
      cb();
    });
  };
};
