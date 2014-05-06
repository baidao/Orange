(function() {
  'use strict';
  define(function() {
    return (function() {
      var index, lastTime, vendors;
      lastTime = 0;
      vendors = ['ms', 'moz', 'webkit', 'o'];
      index = 0;
      while (index < vendors.length && !window.requestAnimationFrame) {
        window.requestAnimationFrame = window[vendors[index] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[index] + 'CancelAnimationFrame'] || window[vendors[index] + 'CancelRequestAnimationFrame'];
        ++index;
      }
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
          var currTime, timeToCall, timerId;
          currTime = new Date().getTime();
          timeToCall = Math.max(0, 16 - (currTime - lastTime));
          timerId = window.setTimeout(function() {
            return callback(currTime + timeToCall);
          }, timeToCall);
          lastTime = currTime + timeToCall;
          return timerId;
        };
      }
      if (!window.cancelAnimationFrame) {
        return window.cancelAnimationFrame = function(timerId) {
          return clearTimeout(timerId);
        };
      }
    })();
  });

}).call(this);
