(function() {
  'use strict';
  define([], function() {
    var transitionEnd;
    transitionEnd = function() {
      var el, name, transEndEventNames;
      el = document.createElement('div');
      transEndEventNames = {
        WebkitTransition: 'webkitTransitionEnd',
        transition: 'transitionend',
        MSTransition: 'mSTransitionEnd',
        oTransition: 'oTransitionEnd'
      };
      for (name in transEndEventNames) {
        if (el.style[name] !== void 0) {
          return {
            end: transEndEventNames[name]
          };
        }
      }
    };
    $.fn.emulateTransitionEnd = function(duration) {
      var callback, called;
      called = false;
      $(this).one($.support.transition.end, function() {
        return called = true;
      });
      callback = function() {
        if (!called) {
          return $(this).trigger($.support.transition.end);
        }
      };
      setTimeout(callback, duration);
      return this;
    };
    return $.support.transition = transitionEnd();
  });

}).call(this);
