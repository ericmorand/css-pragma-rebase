const fs = require('fs');
const path = require('path');
const unquote = require('unquote');
const Transform = require('stream').Transform;
const Url = require('url');
const css = require('css');
const addIterations = require('css-ast-iterations');

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
   * @param {{comment: String, position: {start: {line: Number}}}} node
   */
  processCommentNode(node) {
    let regionResult = this.regionRegex.exec(node.comment);

    if (regionResult) {
      let path = regionResult[1];

      return {
        path: path,
        start: node.position.start.line,
        end: null
      };
    }

    let endRegionResult = this.endRegionRegex.exec(node.comment);

    if (endRegionResult) {
      let path = endRegionResult[1];

      return {
        path: path,
        start: null,
        end: node.position.start.line
      };
    }

    return null;
  }

  _transform(chunk, encoding, callback) {
    try {
      let self = this;
      let urlRegex = /url\(([^,)]+)\)/ig;
      let parseTree = css.parse(chunk.toString());

      addIterations(parseTree);

      let candidateRegions = new Map();

      parseTree.findAllRulesByType('comment', function (node) {
        let region = self.processCommentNode(node);

        if (region) {
          if (region.start) {
            if (!candidateRegions.has(region.path)) {
              candidateRegions.set(region.path, region);
            }
          }
          else {
            if (candidateRegions.has(region.path)) {
              candidateRegions.get(region.path).end = region.end;
            }
          }
        }
      });

      // clean regions
      let regions = [];

      candidateRegions.forEach(function (region) {
        if (region.start && region.end) {
          regions.push(region);
        }
      });

      let processNode = function (node) {
        let value = node.value;
        let nodeRegion = null;

        regions.forEach(function (region) {
          if ((region.start <= node.position.start.line) && (region.end >= node.position.start.line)) {
            if (!nodeRegion || ((region.start > nodeRegion.start) && (region.end < nodeRegion.end))) {
              nodeRegion = region;
            }
          }
        });

        if (nodeRegion) {
          node.value = value.replace(urlRegex, function (match, url, index, string) {
            url = unquote(url.trim());

            let urlUrl = Url.parse(url);

            if (!urlUrl.host && !path.isAbsolute(url)) {
              url = path.join(nodeRegion.path, url);
            }

            return 'url(' + url + ')';
          });
        }
      };

      let nodes = [];

      parseTree.findAllRulesByType('font-face', function (rule) {
        rule.declarations.forEach(function(node) {
          nodes.push(node);
        });
      });

      parseTree.findAllDeclarations(function (node) {
        nodes.push(node);
      });

      nodes.forEach(function(node) {
        processNode(node);
      });

      self.push(css.stringify(parseTree));

      callback();
    }
    catch (err) {
      callback(err);
    }
  }
}

module.exports = CSSRegionRebase;