/**
 * Module dependencies
 */

var domify   = require( 'domify' ),
    template = require( './template' );

/**
 * Expose `FakeBox`
 */

module.exports = FakeBox;

/**
 * Constants
 */

ROOT_TWO = 1.4142;

/**
 * Initialize `FakeBox` with `.face` size, and maximum `spread`, it can extend.
 *
 * @param {Number} size Size of `.face`
 * @param {Number} spread How far it can extend
 *
 * @api public.
 */

function FakeBox( size, spread ) {
  if ( !( this instanceof FakeBox) ) return new FakeBox( size, spread );
  this.size   = size || 100;
  this.spread = spread || 300;
  this.el     = domify( template )[0];
  this.wrap   = this.el.querySelector( '.wrap' );
  this.setupElements();
  this.update( 0 );
}

/**
 * Setup elements, assining sizes.
 *
 * @api private
 */

FakeBox.prototype.setupElements = function() {
  
  this.el.style.width   = this.el.style.height   = this.size + this.spread + 'px';
  this.wrap.style.width = this.wrap.style.height = this.size + 'px';
  this.translate( this.el, -this.spread, -this.spread );

  this.panels = this.el.querySelectorAll( '.panel' );
  for ( var i = 0, l = this.panels.length; i < l; i++ ){
    var panel    = this.panels[i],
        isBottom = /bottom/.test( panel.className );
    panel.style.top    = Math.round( isBottom ? this.size : this.size / 2 ) + 'px';
    panel.style.left   = Math.round( isBottom ? 0 : this.size / 2 ) + 'px';
    panel.style.width  = Math.ceil( this.size / ROOT_TWO ) + 'px';
    panel.style.height = Math.round( ( this.spread + this.size ) * ROOT_TWO ) + 'px';
  }
};

/**
 * Updates it's *fake* height.
 *
 * @param {Number} percent Percentage value of height. [ 0 - 100 ]
 *
 * @api public
 */

FakeBox.prototype.update = function( percent ) {
  var shift = Math.round( this.spread * ( 100 - percent ) / 100 );
  this.translate( this.wrap, shift, shift );
};

/**
 * Translates element using `translate3d`
 *
 * @param {Element} el Element to translate
 * @param {Number} x
 * @param {Number} y
 * @api private
 */

FakeBox.prototype.translate = function( el, x, y ) {
  el.style.webkitTransform =
     el.style.mozTransform =
      el.style.msTransform = 
        el.style.transform = 'translate3d( ' + x + 'px, ' + y + 'px, 0 )';
};
