(function() {
  'use strict';
  define(['./zepto/data', './requestAnimationFrame'], function() {
    var Carousel, activeClass, controlsClass, delay, draggingClass, innerClass, pos, slidEvent;
    slidEvent = 'slid:carousel';
    innerClass = 'or-carousel-inner';
    controlsClass = 'or-carousel-controls';
    activeClass = 'active';
    draggingClass = 'dragging';
    pos = function(e) {
      if (e.targetTouches && (e.targetTouches.length >= 1)) {
        return {
          x: e.targetTouches[0].clientX,
          y: e.targetTouches[0].clientY
        };
      }
    };
    delay = function(func, wait) {
      var args;
      if (wait == null) {
        wait = 0;
      }
      args = Array.prototype.slice.call(arguments, 2);
      return setTimeout(function() {
        return func.apply(null, args);
      }, wait);
    };
    Carousel = (function() {
      function Carousel(element, options) {
        this.options = options;
        this.$element = $(element);
        this.$inner = this.$element.find("." + innerClass);
        this.$items = this.$inner.children();
        this.$control = this.$element.find("." + controlsClass);
        this.$controlsItems = this.$control.children();
        this.$start = this.$items.eq(0);
        this.$current = this.$items.eq(this.index);
        this.index = 0;
        this.length = this.$items.length;
        this.offset = 0;
        this.offsetDrag = 0;
        this.animating = false;
        this.dragging = false;
        this.needsUpdate = false;
        this.enableAnimation();
        this.bind();
      }

      Carousel.prototype.enableAnimation = function() {
        if (this.animating) {
          return;
        }
        this.$inner.removeClass(draggingClass);
        return this.animating = true;
      };

      Carousel.prototype.disableAnimation = function() {
        if (!this.animating) {
          return;
        }
        this.$inner.addClass(draggingClass);
        return this.animating = false;
      };

      Carousel.prototype.update = function() {
        var _this = this;
        if (this.needsUpdate) {
          return;
        }
        this.needsUpdate = true;
        return window.requestAnimationFrame(function() {
          var x;
          if (!_this.needsUpdate) {
            return;
          }
          x = Math.round(_this.offset + _this.offsetDrag);
          _this.$inner.css('-webkit-transform', "translate3d(" + x + "px,0,0)");
          return _this.needsUpdate = false;
        });
      };

      Carousel.prototype.bind = function() {
        var canceled, drag, dragLimit, dragging, dx, dy, ee, end, hold, lockLeft, lockRight, start, xy,
          _this = this;
        dragLimit = this.$element.width();
        dragging = false;
        canceled = false;
        hold = false;
        lockLeft = false;
        lockRight = false;
        xy = void 0;
        dx = void 0;
        dy = void 0;
        this.$inner.on('touchstart', start = function(e) {
          return delay(function() {
            var lockLef;
            dragging = true;
            canceled = false;
            xy = pos(e);
            dx = 0;
            dy = 0;
            hold = false;
            lockLef = _this.index === 0;
            lockRight = _this.index === _this.length - 1;
            _this.disableAnimation();
            e.preventDefault();
            e.stopPropagation();
            return false;
          });
        });
        this.$inner.on('touchmove', drag = function(e) {
          var newXY;
          if (dragging && !canceled) {
            newXY = pos(e);
            dx = xy.x - newXY.x;
            dy = xy.y - newXY.y;
            if (hold || Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > _this.options.dragRadius)) {
              hold = tue;
              e.preventDefault();
              if (lockLeft && (dx < 0)) {
                dx = dx * (-dragLimit) / (dx - dragLimit);
              } else if (lockRight && (dx > 0)) {
                dx = dx * dragLimit / (dx + dragLimit);
              }
              _this.offsetDrag = -dx;
              _this.update();
            } else if ((Math.abs(dy) > Math.abs(dx)) && (Math.abs(dy) > _this.options.dragRadius)) {
              canceled = true;
            }
          }
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
        this.$inner.on('touchend', end = function(e) {
          return delay(function() {
            if (dragging) {
              dragging = false;
              _this.enableAnimation();
              if (!canceled && (Math.abs(dx) > _this.options.moveRadius)) {
                if (dx > 0) {
                  _this.next();
                } else {
                  _this.prev();
                }
              } else {
                _this.offsetDrag = 0;
                _this.update();
              }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
          });
        });
        this.$element.on(slidEvent, function(e, prevIndex, nextIndex) {
          _this.$items.eq(prevIndex).removeClass(activeClass);
          _this.$items.eq(nextIndex).addClass(activeClass);
          _this.$controlsItems.eq(prevIndex).removeClass(activeClass);
          return _this.$controlsItems.eq(nextIndex).addClass(activeClass);
        });
        ee = $.Event(slidEvent, {});
        this.$element.trigger(ee, [0, 0]);
        return this.update();
      };

      Carousel.prototype.unbind = function() {
        return this.$inner.off();
      };

      Carousel.prototype.moveTo = function(nextIndex) {
        var $current, currentOffset, prevIndex, startOffset, transitionOffset;
        prevIndex = this.index;
        if (nextIndex < 0) {
          nextIndex = 0;
        } else if (nextIndex > this.length - 1) {
          nextIndex = this.length - 1;
        }
        this.$current = $current = this.$items.eq(nextIndex);
        currentOffset = this.$current.prop('offsetLeft');
        startOffset = this.$start.prop('offsetLeft');
        transitionOffset = -(currentOffset - startOffset);
        this.offset = transitionOffset;
        this.offsetDrag = 0;
        this.index = nextIndex;
        this.update();
        return this.$element.trigger(slidEvent, [prevIndex, nextIndex]);
      };

      Carousel.prototype.next = function() {
        return this.moveTo(this.index + 1);
      };

      Carousel.prototype.prev = function() {
        return this.moveTo(this.index - 1);
      };

      return Carousel;

    })();
    Carousel.DEFAULTS = {
      dragRadius: 10,
      moveRadius: 50
    };
    $.Carousel = Carousel;
    return $.fn.carousel = function(option) {
      return this.each(function() {
        var data, options;
        data = $(this).data('carousel');
        options = $.extend({}, Carousel.DEFAULTS, $(this).data(), typeof option === 'object' && option);
        if (!data) {
          $(this).data('carousel', (data = new Carousel(this, options)));
        }
        if (typeof option === 'string') {
          return data[option]();
        }
      });
    };
  });

}).call(this);
