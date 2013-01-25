

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-domify/index.js", Function("exports, require, module",
"\n/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n  \n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) throw new Error('No elements were generated.');\n  var tag = m[1];\n  \n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return [el.removeChild(el.lastChild)];\n  }\n  \n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  return orphan(el.children);\n}\n\n/**\n * Orphan `els` and return an array.\n *\n * @param {NodeList} els\n * @return {Array}\n * @api private\n */\n\nfunction orphan(els) {\n  var ret = [];\n\n  while (els.length) {\n    ret.push(els[0].parentNode.removeChild(els[0]));\n  }\n\n  return ret;\n}\n//@ sourceURL=component-domify/index.js"
));
require.register("fake-box/index.js", Function("exports, require, module",
"/**\n * Module dependencies\n */\n\nvar domify   = require( 'domify' ),\n    template = require( './template' );\n\n/**\n * Expose `FakeBox`\n */\n\nmodule.exports = FakeBox;\n\n/**\n * Constants\n */\n\nROOT_TWO = 1.4142;\n\n/**\n * Initialize `FakeBox` with `.face` size, and maximum `spread`, it can extend.\n *\n * @param {Number} size Size of `.face`\n * @param {Number} spread How far it can extend\n *\n * @api public.\n */\n\nfunction FakeBox( size, spread ) {\n  if ( !( this instanceof FakeBox) ) return new FakeBox( size, spread );\n  this.size   = size || 100;\n  this.spread = spread || 300;\n  this.el     = domify( template )[0];\n  this.wrap   = this.el.querySelector( '.wrap' );\n  this.setupElements();\n  this.update( 0 );\n}\n\n/**\n * Setup elements, assining sizes.\n *\n * @api private\n */\n\nFakeBox.prototype.setupElements = function() {\n  \n  this.el.style.width   = this.el.style.height   = this.size + this.spread + 'px';\n  this.wrap.style.width = this.wrap.style.height = this.size + 'px';\n  this.translate( this.el, -this.spread, -this.spread );\n\n  this.panels = this.el.querySelectorAll( '.panel' );\n  for ( var i = 0, l = this.panels.length; i < l; i++ ){\n    var panel    = this.panels[i],\n        isBottom = /bottom/.test( panel.className );\n    panel.style.top    = Math.round( isBottom ? this.size : this.size / 2 ) + 'px';\n    panel.style.left   = Math.round( isBottom ? 0 : this.size / 2 ) + 'px';\n    panel.style.width  = Math.ceil( this.size / ROOT_TWO ) + 'px';\n    panel.style.height = Math.round( ( this.spread + this.size ) * ROOT_TWO ) + 'px';\n  }\n};\n\n/**\n * Updates it's *fake* height.\n *\n * @param {Number} percent Percentage value of height. [ 0 - 100 ]\n *\n * @api public\n */\n\nFakeBox.prototype.update = function( percent ) {\n  var shift = Math.round( this.spread * ( 100 - percent ) / 100 );\n  this.translate( this.wrap, shift, shift );\n};\n\n/**\n * Translates element using `translate3d`\n *\n * @param {Element} el Element to translate\n * @param {Number} x\n * @param {Number} y\n * @api private\n */\n\nFakeBox.prototype.translate = function( el, x, y ) {\n  el.style.webkitTransform =\n     el.style.mozTransform =\n      el.style.msTransform = \n        el.style.transform = 'translate3d( ' + x + 'px, ' + y + 'px, 0 )';\n};\n//@ sourceURL=fake-box/index.js"
));
require.register("fake-box/template.js", Function("exports, require, module",
"module.exports = '<div class=\"fake-box\">\\n  <div class=\"wrap\">\\n    <div class=\"face\"></div>\\n    <div class=\"panel right\"></div>\\n    <div class=\"panel bottom\"></div>\\n  </div>\\n</div>\\n';//@ sourceURL=fake-box/template.js"
));
require.alias("component-domify/index.js", "fake-box/deps/domify/index.js");

