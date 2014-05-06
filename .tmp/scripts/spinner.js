(function() {
  'use strict';
  define(['./zepto/data'], function() {
    var Spinner;
    Spinner = (function() {
      function Spinner(element, options) {
        this.element = $(element);
        this.spinner = $('<div class="icon-loading spinner"/>');
        this.isShown = false;
      }

      Spinner.prototype.toggle = function() {
        return this[!!this.isShown ? 'hide' : 'show']();
      };

      Spinner.prototype.show = function() {
        this.spinner.appendTo(this.element).addClass('active');
        return this.isShown = true;
      };

      Spinner.prototype.hide = function() {
        this.spinner.removeClass('active');
        return this.isShown = false;
      };

      return Spinner;

    })();
    Spinner.DEFAULTS = {
      show: true
    };
    $.Spinner = Spinner;
    return $.fn.spinner = function(option) {
      return this.each(function() {
        var data, options;
        data = $(this).data('spinner');
        options = $.extend({}, Spinner.DEFAULTS, $(this).data(), typeof option === 'object' && option);
        if (!data) {
          data = new Spinner(this, options);
          $(this).data('spinner', data);
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
