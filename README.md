# css-region-rebase

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

Rebase your CSS assets based on comment regions.

Think about what you can do when combining this with [node-sass importer](https://github.com/sass/node-sass#importer--v200---experimental) feature...^^

## Installation

```bash
npm install css-region-rebase
```

## Example

From:
``` css
/* region cssRebase: /path/to/rebase/your/assets/to */
.foo {
    background: url(./foo.png);
}
/* endregion cssRebase: /path/to/rebase/your/assets/to */
```

To:
``` css
/* region cssRebase: /path/to/rebase/your/assets/to */
.foo {
    background: url(/path/to/rebase/your/assets/to/foo.png);
}
/* endregion cssRebase: /path/to/rebase/your/assets/to */
```

## API

`let Rebaser = require('css-region-rebase')`

### rebaser = new Rebaser(opts={})

Return an object transform stream `rebaser` that expects entry filenames.

Optionally pass in some opts:

* opts.format - the format used by your region. Defaults to `cssRebase:`.

## Events

In addition to the usual events emitted by node.js streams, css-region-rebase emits the following events:

### rebaser.on('rebase', function(file) {})

Every time an asset is rebased, this event fires with the rebased path.

## Contributing

* Fork the main repository
* Code
* Implement tests using [node-tap](https://github.com/tapjs/node-tap)
* Issue a pull request keeping in mind that all pull requests must reference an issue in the issue queue

## License

Apache-2.0 © [Eric MORAND]()

[npm-image]: https://badge.fury.io/js/css-region-rebase.svg
[npm-url]: https://npmjs.org/package/css-region-rebase
[travis-image]: https://travis-ci.org/ericmorand/css-region-rebase.svg?branch=master
[travis-url]: https://travis-ci.org/ericmorand/css-region-rebase
[daviddm-image]: https://david-dm.org/ericmorand/css-region-rebase.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ericmorand/css-region-rebase
[coveralls-image]: https://coveralls.io/repos/github/ericmorand/css-region-rebase/badge.svg
[coveralls-url]: https://coveralls.io/github/ericmorand/css-region-rebase