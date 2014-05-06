(function() {
  'use strict';
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(['./zepto/data', './requestAnimationFrame'], function() {
    var Counter;
    Counter = (function() {
      function Counter(element, options) {
        this.count = __bind(this.count, this);
        this.element = $(element);
        this.options = options;
        this.frameVal = this.from = Number(options.from);
        this.to = Number(options.to);
        this.duration = options.duration;
        this.decimals = Math.max(0, options.decimals);
        this.dec = Math.pow(10, options.decimals);
        this.startTime = null;
      }

      Counter.prototype.count = function(timestamp) {
        var countDown, i, progress, val;
        countDown = this.from > this.to;
        if (this.startTime === null) {
          this.startTime = timestamp;
        }
        progress = timestamp - this.startTime;
        if (countDown) {
          i = this.easeOutExpo(progress, 0, this.from - this.to, this.duration);
          this.frameVal = this.from - i;
        } else {
          this.frameVal = this.easeOutExpo(progress, this.from, this.to - this.from, this.duration);
        }
        this.frameVal = Math.round(this.frameVal * this.dec) / this.dec;
        if (countDown) {
          this.frameVal = (this.frameVal < this.to ? this.to : this.frameVal);
        } else {
          this.frameVal = (this.frameVal > this.to ? this.to : this.frameVal);
        }
        val = this.frameVal.toFixed(this.decimals);
        if (this.options.commas) {
          val = this.addCommas(val);
        }
        this.element.html(val);
        if (progress < this.duration) {
          return requestAnimationFrame(this.count);
        } else {
          if (this.onComplete != null) {
            return this.onComplete();
          }
        }
      };

      Counter.prototype.start = function(callback) {
        this.onComplete = callback;
        if (!isNaN(this.to) && !isNaN(this.from)) {
          requestAnimationFrame(this.count);
        } else {
          this.element.html('--');
        }
        return false;
      };

      Counter.prototype.easeOutExpo = function(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
      };

      Counter.prototype.reset = function() {
        return this.element.html(0);
      };

      Counter.prototype.addCommas = function(nStr) {
        var rgx, x, x1, x2;
        nStr += '';
        x = void 0;
        x1 = void 0;
        x2 = void 0;
        rgx = void 0;
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
      };

      Counter.DEFAULTS = {
        commas: false,
        decimals: 0,
        duration: 1000
      };

      return Counter;

    })();
    $.Counter = Counter;
    return $.fn.counter = function(option) {
      return $(this).each(function() {
        var data, options;
        data = $(this).data('counter');
        options = $.extend({}, Counter.DEFAULTS, $(this).data(), typeof option === 'object' && option);
        if (!data) {
          data = new Counter(this, options);
          $(this).data('counter', data);
        }
        if (typeof option === 'string') {
          return data[option]();
        } else {
          if (options.show) {
            return data.show();
          }
        }
      });
    };
  });

}).call(this);