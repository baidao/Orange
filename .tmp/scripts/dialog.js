(function() {
  'use strict';
  define(['./zepto/data', './transition'], function() {
    var Dialog, showClass;
    showClass = 'active';
    Dialog = (function() {
      function Dialog(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$backdrop = null;
        this.isShown = false;
      }

      Dialog.prototype.toggle = function() {
        return this[(!this.isShown ? 'show' : 'hide')]();
      };

      Dialog.prototype.show = function() {
        var _this = this;
        if (this.isShown) {
          return;
        }
        $(document).on('touchmove.dialog', function() {
          return e.preventDefault();
        });
        this.$element.on('tap', '[data-dismiss="dialog"]', this.hide.bind(this));
        this.backdrop(function() {
          _this.$element.show();
          if ($.support.transition && _this.options.effect) {
            _this.$element[0].offsetWidth;
          }
          _this.$element.addClass(showClass);
          return _this.isShown = true;
        });
        if (this.options.expires > 0) {
          return setTimeout(function() {
            return _this.hide();
          }, this.options.expires);
        }
      };

      Dialog.prototype.hide = function() {
        var callback,
          _this = this;
        if (!this.isShown) {
          return;
        }
        $(document).off('touchmove.dialog');
        this.$element.removeClass(showClass).off('tap');
        callback = function() {
          return _this.backdrop(function() {
            var _ref;
            _this.isShown = false;
            if ((_ref = _this.$backdrop) != null) {
              _ref.remove();
            }
            return _this.$backdrop = null;
          });
        };
        if ($.support.transition && this.options.effect) {
          return this.$element.one($.support.transition.end, callback).emulateTransitionEnd(200);
        } else {
          return callback();
        }
      };

      Dialog.prototype.backdrop = function(callback) {
        if (callback == null) {
          callback = function() {};
        }
        if (!this.isShown && this.options.backdrop) {
          this.$backdrop = $("<div class='back-drop disable-user-behavior'/>").appendTo(this.$element.parent());
          this.$backdrop.on('tap', this.hide.bind(this));
          if ($.support.transition && this.options.effect) {
            this.$backdrop[0].offsetWidth;
            this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(200);
          } else {
            callback();
          }
          return this.$backdrop.addClass(showClass);
        } else if (this.isShown && this.$backdrop) {
          this.$backdrop.removeClass(showClass);
          if ($.support.transition && this.options.effect) {
            return this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(200);
          } else {
            return callback();
          }
        } else {
          return callback();
        }
      };

      return Dialog;

    })();
    Dialog.DEFAULTS = {
      backdrop: true,
      show: true,
      expires: 0
    };
    $.Dialog = Dialog;
    $.fn.dialog = function(option) {
      return this.each(function() {
        var data, options;
        data = $(this).data('dialog');
        options = $.extend({}, Dialog.DEFAULTS, $(this).data(), typeof option === 'object' && option);
        if (!data) {
          data = new Dialog(this, options);
        }
        if (options.cache) {
          $(this).data('dialog', data);
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
    return $(document).on('tap', '[data-role="dialog"]', function(e) {
      var $target, option;
      $target = $($(this).attr('data-target'));
      option = ($target.data('dialog') ? 'toggle' : $.extend({}, $target.data(), $this.data()));
      if ($(this).is('a')) {
        e.preventDefault();
      }
      return $target.dialog(option, this);
    });
  });

}).call(this);
