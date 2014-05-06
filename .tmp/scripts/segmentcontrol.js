(function() {
  'use strict';
  define(['./zepto/data'], function() {
    var Segmentcontrol, activeClass, showEvent, shownEvent;
    activeClass = 'active';
    showEvent = 'show:segmentcontrol';
    shownEvent = 'shown:segmentcontrol';
    Segmentcontrol = (function() {
      function Segmentcontrol(element) {
        this.element = $(element);
      }

      Segmentcontrol.prototype.show = function() {
        var $parent, $target, e, previous, selector,
          _this = this;
        if (this.element.hasClass(activeClass)) {
          return;
        }
        $parent = this.element.parent();
        selector = this.element.data('target');
        previous = $parent.find('.' + activeClass)[0];
        e = $.Event(showEvent, {
          relatedTarget: previous
        });
        this.element.trigger(e);
        if (e.isDefaultPrevented()) {
          return;
        }
        $target = $(selector);
        this.activate(this.element, $parent);
        return this.activate($target, $target.parent(), function() {
          var ee;
          ee = $.Event(shownEvent, {
            relatedTarget: previous
          });
          return _this.element.trigger(ee);
        });
      };

      Segmentcontrol.prototype.activate = function($element, $container, callback) {
        var $active;
        $active = $container.find("." + activeClass);
        $active.removeClass(activeClass);
        $element.addClass(activeClass);
        return callback && callback();
      };

      return Segmentcontrol;

    })();
    $.Segmentcontrol = Segmentcontrol;
    $.fn.segmentcontrol = function(option) {
      return this.each(function() {
        var data;
        data = $(this).data('segmentcontrol');
        if (!data) {
          $(this).data('segmentcontrol', (data = new Segmentcontrol(this)));
        }
        if (typeof option === 'string') {
          return data[option]();
        }
      });
    };
    return $(document).on('tap', '[data-role="segmentcontrol"]', function(e) {
      e.preventDefault();
      return $(this).segmentcontrol('show');
    });
  });

}).call(this);
