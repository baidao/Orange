(function() {
  'use strict';
  define([], function() {
    return $.os = {
      ios: (function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      })(),
      android: (function() {
        return navigator.userAgent.match(/Android/i);
      })()
    };
  });

}).call(this);
