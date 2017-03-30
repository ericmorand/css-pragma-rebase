const Rebaser = require('../src');
const tap = require('tap');
const fs = require('fs');
const path = require('path');
const through = require('through2');
const cleanCSS = require('./lib/clean-css');

tap.test('cssRebase', function (test) {
  test.plan(13);

  test.test('should handle valid region syntax', function (test) {
    let rebaser = new Rebaser();

    let regionfixtures = [
      'region cssRebase:foo',
      ' region cssRebase:foo',
      ' region cssRebase:foo ',
      ' region cssRebase: foo ',
      ' region  cssRebase: foo '
    ];

    regionfixtures.forEach(function (fixture) {
      test.test('"' + fixture + '"', function (test) {
        let result = rebaser.processCommentNode({
          content: fixture,
          start: {
            line: 99
          }
        });

        test.same(result, {
          path: 'foo',
          start: 99,
          end: null
        });

        test.end();
      });
    });

    let endRegionfixtures = [
      'endregion cssRebase:foo',
      ' endregion cssRebase:foo',
      ' endregion cssRebase:foo ',
      ' endregion cssRebase: foo ',
      ' endregion  cssRebase: foo '
    ];

    endRegionfixtures.forEach(function (fixture) {
      test.test('"' + fixture + '"', function (test) {
        let result = rebaser.processCommentNode({
          content: fixture,
          start: {
            line: 99
          }
        });

        test.same(result, {
          path: 'foo',
          start: null,
          end: 99
        });

        test.end();
      });
    });

    test.end();
  });

  test.test('should handle invalid region syntax', function (test) {
    let rebaser = new Rebaser();

    let regionfixtures = [
      'regioncssRebase:foo',
      'region cssRebase foo',
      'region cssRebase:f oo'
    ];

    regionfixtures.forEach(function (fixture) {
      test.test('"' + fixture + '"', function (test) {
        let result = rebaser.processCommentNode({
          content: fixture,
          start: {
            line: 99
          }
        });

        test.equal(result, null);

        test.end();
      });
    });

    let endRegionfixtures = [
      'endregioncssRebase:foo',
      'endregion cssRebase foo',
      'endregion cssRebase:f oo'
    ];

    endRegionfixtures.forEach(function (fixture) {
      test.test('"' + fixture + '"', function (test) {
        let result = rebaser.processCommentNode({
          content: fixture,
          start: {
            line: 99
          }
        });

        test.equal(result, null);

        test.end();
      });
    });

    test.end();
  });

  test.test('should support custom format', function (test) {
    let rebaser = new Rebaser({
      format: 'foo'
    });

    let result = rebaser.processCommentNode({
      content: 'region foo bar',
      start: {
        line: 99
      }
    });

    test.same(result, {
      path: 'bar',
      start: 99,
      end: null
    });

    test.end();
  });

  test.test('should handle single-quote uri', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/single-quote.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should handle double-quote uri', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/double-quote.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should handle no-quote uri', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/no-quote.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should handle nested regions', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/nested-regions/index.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/nested-regions/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should handle overlapping regions', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/overlapping-regions/index.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/overlapping-regions/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should handle unknown region', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/unknown-region.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/unknown-region.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should handle mismatched region', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/mismatched-region/index.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/mismatched-region/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should handle duplicate regions', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/duplicate-regions/index.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/duplicate-regions/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });

  test.test('should emit "error" event', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/error.css');
    let error = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .on('finish', function () {
        test.fail();

        test.end();
      })
      .on('error', function (err) {
          test.ok(err);

          test.end();
        }
      );
  });

  test.test('should handle remote and absolute paths', function (test) {
    let rebaser = new Rebaser();

    let file = path.resolve('test/fixtures/remote-and-absolute/index.css');
    let data = null;

    fs.createReadStream(file)
      .pipe(rebaser)
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/remote-and-absolute/wanted.css'), function (err, readData) {
          test.equal(cleanCSS(data), cleanCSS(readData.toString()));

          test.end();
        });
      })
      .on('error', function (err) {
          test.fail(err);

          test.end();
        }
      );
  });
});