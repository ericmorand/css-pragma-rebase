const fs = require('fs');
const path = require('path');
const unquote = require('unquote');
const Transform = require('stream').Transform;
const Url = require('url');

class CSSRegionRebase extends Transform {
  constructor(options) {
    options = options || {};

    super(options);

    let format = options.format || 'cssRebase:';

    let getRegex = function (region) {
      return new RegExp('^(?:\\s*)' + region + '(?:\\s+)' + format + '(?:\\s*)(\\S*)(?:\\s*)$');
    };

    this.regionRegex = getRegex('region');
    this.endRegionRegex = getRegex('endregion');
  }

  /**
   *
   * @param {{content: String, start: {line: Number}}} node
   */
  processCommentNode(node) {
    let regionResult = this.regionRegex.exec(node.content);

    if (regionResult) {
      let path = regionResult[1];

      return {
        path: path,
        start: node.start.line,
        end: null
      };
    }

    let endRegionResult = this.endRegionRegex.exec(node.content);

    if (endRegionResult) {
      let path = endRegionResult[1];

      return {
        path: path,
        start: null,
        end: node.start.line
      };
    }

    return null;
  }

  _transform(chunk, encoding, callback) {
    try {
      let self = this;

      let parseTree = require('gonzales-pe').parse(chunk.toString(), {
        syntax: 'css'
      });

      let regions = [];
      let stack = [];

      parseTree.traverseByType('multilineComment', function (node) {
        let nodeRegion = self.processCommentNode(node);

        if (nodeRegion) {
          if (nodeRegion.start) {
            stack.push(nodeRegion);
          }
          else {
            let region = stack.pop();

            if (region) {
              region.end = nodeRegion.end;

              regions.push(region);
            }
          }
        }
      });

      parseTree.traverseByType('uri', function (node) {
        let nodeRegion = regions.find(function (region) {
          return ((region.start <= node.start.line) && (region.end >= node.start.line));
        });

        if (nodeRegion) {
          let contentNode = node.first('string');

          if (!contentNode) {
            contentNode = node.first('raw');
          }

          let contentNodeContent = unquote(contentNode.content);

          let url = Url.parse(contentNodeContent);

          if (!url.host && !path.isAbsolute(contentNodeContent)) {
            contentNode.content = path.join(nodeRegion.path, unquote(contentNode.content));

            self.emit('rebase', contentNode.content);
          }
        }
      });

      self.push(parseTree.toString());

      callback();
    }
    catch (err) {
      callback(err);
    }
  }
}

module.exports = CSSRegionRebase;