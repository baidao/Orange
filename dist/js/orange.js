(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var Carousel, activeClass, controlsClass, delay, draggingClass, innerClass, pos, slidEvent;

require('./zepto/data');

require('./requestAnimationFrame');

slidEvent = 'slid:carousel';

innerClass = 'or-carousel-inner';

controlsClass = 'or-carousel-controls';

activeClass = 'active';

draggingClass = 'dragging';

pos = function(e) {
  return {
    x: e.targetTouches[0].clientX,
    y: e.targetTouches[0].clientY
  };
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
    if (this.needsUpdate) {
      return;
    }
    this.needsUpdate = true;
    return window.requestAnimationFrame((function(_this) {
      return function() {
        var transformProperty, x;
        if (!_this.needsUpdate) {
          return;
        }
        x = Math.round(_this.offset + _this.offsetDrag);
        transformProperty = $.support.cssProperty('transform');
        if ($.support.hasTransform3d) {
          _this.$inner[0].style[transformProperty] = "translate3d(" + x + "px,0,0)";
        } else {
          _this.$inner[0].style[transformProperty] = "translate(" + x + "px)";
        }
        return _this.needsUpdate = false;
      };
    })(this));
  };

  Carousel.prototype.bind = function() {
    var canceled, drag, dragLimit, dragging, dx, dy, ee, end, hold, lockLeft, lockRight, start, xy;
    dragLimit = this.$element.width();
    dragging = false;
    canceled = false;
    hold = false;
    lockLeft = false;
    lockRight = false;
    xy = void 0;
    dx = void 0;
    dy = void 0;
    this.$inner.on('touchstart', start = (function(_this) {
      return function(e) {
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
      };
    })(this));
    this.$inner.on('touchmove', drag = (function(_this) {
      return function(e) {
        var newXY;
        if (dragging && !canceled) {
          newXY = pos(e);
          dx = xy.x - newXY.x;
          dy = xy.y - newXY.y;
          if (hold || Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > _this.options.dragRadius)) {
            hold = true;
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
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
    })(this));
    this.$inner.on('touchend', end = (function(_this) {
      return function(e) {
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
      };
    })(this));
    this.$element.on(slidEvent, (function(_this) {
      return function(e, prevIndex, nextIndex) {
        _this.$items.eq(prevIndex).removeClass(activeClass);
        _this.$items.eq(nextIndex).addClass(activeClass);
        _this.$controlsItems.eq(prevIndex).removeClass(activeClass);
        return _this.$controlsItems.eq(nextIndex).addClass(activeClass);
      };
    })(this));
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

$.fn.carousel = function(option) {
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

},{"./requestAnimationFrame":6,"./zepto/data":10}],2:[function(require,module,exports){
'use strict';
var Counter,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('./zepto/data');

require('./requestAnimationFrame');

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

$.fn.counter = function(option) {
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

},{"./requestAnimationFrame":6,"./zepto/data":10}],3:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
'use strict';
var Dialog, dismssEvent, showClass;

require('./zepto/data');

require('./transition');

showClass = 'active';

dismssEvent = 'tap.dismiss.dialog';

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
    this.$element.removeClass(showClass).off(dismssEvent);
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
    var _this = this;
    if (callback == null) {
      callback = function() {};
    }
    if (!this.isShown && this.options.backdrop) {
      this.$backdrop = $("<div class='back-drop disable-user-behavior'/>").appendTo(this.$element.parent());
      this.$element.on(dismssEvent, function(e) {
        if (e.target !== e.currentTarget) {
          return;
        }
        return _this.hide.call(_this);
      });
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

$.fn.dialog = function(toption) {
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

$(document).on('tap.dialog.data-api', '[data-role="dialog"]', function(e) {
  var $target, option;
  $target = $($(this).attr('data-target'));
  option = ($target.data('dialog') ? 'toggle' : $.extend({}, $target.data(), $(this).data()));
  if ($(this).is('a')) {
    e.preventDefault();
  }
  return $target.dialog(option, this);
});

},{"./transition":9,"./zepto/data":10}],4:[function(require,module,exports){
'use strict';
require('./os');

require('./transition');

require('./requestAnimationFrame');

require('./segmentControl');

require('./carousel');

require('./counter');

require('./spinner');

require('./dialog');


},{"./carousel":1,"./counter":2,"./dialog":3,"./os":5,"./requestAnimationFrame":6,"./segmentControl":7,"./spinner":8,"./transition":9}],5:[function(require,module,exports){
'use strict';
$.os = {
  ios: (function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  })(),
  android: (function() {
    return navigator.userAgent.match(/Android/i);
  })()
};

},{}],6:[function(require,module,exports){
'use strict';
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
  window.cancelAnimationFrame = function(timerId) {
    return clearTimeout(timerId);
  };
}

},{}],7:[function(require,module,exports){
'use strict';
var Segmentcontrol, activeClass, showEvent, shownEvent;

require('./zepto/data');

activeClass = 'active';

showEvent = 'show:segmentcontrol';

shownEvent = 'shown:segmentcontrol';

Segmentcontrol = (function() {
  function Segmentcontrol(element) {
    this.element = $(element);
  }

  Segmentcontrol.prototype.show = function() {
    var $parent, $target, e, previous, selector;
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
    return this.activate($target, $target.parent(), (function(_this) {
      return function() {
        var ee;
        ee = $.Event(shownEvent, {
          relatedTarget: previous
        });
        return _this.element.trigger(ee);
      };
    })(this));
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

$(document).on('tap.segmentcontrol.data-api', '[data-role="segmentcontrol"]', function(e) {
  e.preventDefault();
  return $(this).segmentcontrol('show');
});

},{"./zepto/data":10}],8:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
'use strict';
var Spinner, activeClass;

require('./zepto/data');

activeClass = 'active';

Spinner = (function() {
  function Spinner(element, options) {
    this.element = $(element);
    this.spinner = $('<div class="or-spinner"/>');
    this.isShown = false;
  }

  Spinner.prototype.toggle = function() {
    return this[!!this.isShown ? 'hide' : 'show']();
  };

  Spinner.prototype.show = function() {
    this.spinner.appendTo(this.element).addClass(activeClass);
    return this.isShown = true;
  };

  Spinner.prototype.hide = function() {
    this.spinner.removeClass(activeClass);
    return this.isShown = false;
  };

  return Spinner;

})();

Spinner.DEFAULTS = {
  show: true
};

$.Spinner = Spinner;

$.fn.spinner = function(option) {
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

},{"./zepto/data":10}],9:[function(require,module,exports){
'use strict';
$.support.cssProperty = function(prop, rprop) {
  var pre, prefixes, style, _i, _len;
  if (rprop == null) {
    rprop = true;
  }
  prop = prop.charAt(0).toUpperCase() + prop.substr(1);
  style = document.createElement('div').style;
  prefixes = ['Webkit', 'Moz', 'o', 'MS', ''];
  for (_i = 0, _len = prefixes.length; _i < _len; _i++) {
    pre = prefixes[_i];
    if ((style != null ? style[pre + prop] : void 0) !== void 0) {
      if (!!rprop) {
        return pre + prop;
      } else {
        return true;
      }
    }
  }
  return false;
};

$.support.hasTransform3d = (function() {
  return $.support.cssProperty('perspective');
})();

$.support.transition = (function() {
  var events, property;
  events = {
    WebkitTransition: {
      start: 'webkitTransitionStart',
      end: 'webkitTransitionEnd'
    },
    transition: {
      start: 'transitionstart',
      end: 'transitionend'
    },
    MSTransition: {
      start: 'mSTransitionStart',
      end: 'mSTransitionEnd'
    },
    oTransition: {
      start: 'oTransitionStart',
      end: 'oTransitionEnd'
    }
  };
  property = $.support.cssProperty('transition');
  if (property) {
    return events[property];
  }
})();

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

},{}],10:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  'use strict';
  (function($) {
    var attributeData, camelize, data, dataAttr, emptyArray, exp, getData, setData;
    getData = function(node, name) {
      var camelName, id, store;
      id = node[exp];
      store = id && data[id];
      if (name !== undefined) {
        if (store) {
          if (name in store) {
            return store[name];
          }
          camelName = camelize(name);
          if (camelName in store) {
            return store[camelName];
          }
        }
        return dataAttr.call($(node), name);
      } else {
        return store || setData(node);
      }
    };
    setData = function(node, name, value) {
      var id, store;
      id = node[exp] || (node[exp] = ++$.uuid);
      store = data[id] || (data[id] = attributeData(node));
      if (name !== undefined) {
        store[camelize(name)] = value;
      }
      return store;
    };
    attributeData = function(node) {
      var store;
      store = {};
      $.each(node.attributes || emptyArray, function(i, attr) {
        if (attr.name.indexOf("data-") === 0) {
          return store[camelize(attr.name.replace("data-", ""))] = $.zepto.deserializeValue(attr.value);
        }
      });
      return store;
    };
    data = {};
    dataAttr = $.fn.data;
    camelize = $.camelCase;
    exp = $.expando = "Zepto" + (+new Date());
    emptyArray = [];
    $.fn.data = function(name, value) {
      if (value === undefined) {
        if ($.isPlainObject(name)) {
          return this.each(function(i, node) {
            return $.each(name, function(key, value) {
              return setData(node, key, value);
            });
          });
        } else {
          if (this.length === 0) {
            return undefined;
          } else {
            return getData(this[0], name);
          }
        }
      } else {
        return this.each(function() {
          return setData(this, name, value);
        });
      }
    };
    $.fn.removeData = function(names) {
      if (typeof names === "string") {
        names = names.split(/\s+/);
      }
      return this.each(function() {
        var id, store;
        id = this[exp];
        store = id && data[id];
        if (store) {
          return $.each(names || store, function(key) {
            return delete store[(names ? camelize(this) : key)];
          });
        }
      });
    };
    return ["remove", "empty"].forEach(function(methodName) {
      var origFn;
      origFn = $.fn[methodName];
      return $.fn[methodName] = function() {
        var elements;
        elements = this.find("*");
        if (methodName === "remove") {
          elements = elements.add(this);
        }
        elements.removeData();
        return origFn.call(this);
      };
    });
  })(Zepto);

}).call(this);

},{}]},{},[4])