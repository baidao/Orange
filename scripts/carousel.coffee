'use strict'

define [
  './zepto/data'
  './requestAnimationFrame'
], ->
  slidEvent = 'slid:carousel'
  innerClass = 'or-carousel-inner'
  controlsClass = 'or-carousel-controls'
  activeClass = 'active'
  draggingClass = 'dragging'

  pos = (e) ->
    x: e.targetTouches[0].clientX
    y: e.targetTouches[0].clientY

  delay = (func, wait=0) ->
    #from underscore.js
    #here used to make event fired not as user event such as touchstart touchend..
    args = Array.prototype.slice.call arguments, 2
    setTimeout ->
      func.apply null, args
    , wait

  class Carousel
    constructor: (element, options) ->
      @options = options
      @$element = $(element)
      @$inner = @$element.find(".#{innerClass}")
      @$items = @$inner.children()
      @$control = @$element.find(".#{controlsClass}")
      @$controlsItems = @$control.children()
      @$start = @$items.eq(0)
      @$current = @$items.eq(@index)
      @index = 0
      @length = @$items.length

      @offset = 0
      @offsetDrag = 0

      @animating = false
      @dragging = false
      @needsUpdate = false

      @enableAnimation()
      @bind()

    enableAnimation: ->
      return if @animating
      @$inner.removeClass draggingClass
      @animating = true

    disableAnimation: ->
      return unless @animating
      @$inner.addClass draggingClass
      @animating = false

    update: ->
      return if @needsUpdate
      @needsUpdate = true
      window.requestAnimationFrame =>
        return unless @needsUpdate
        x = Math.round(@offset + @offsetDrag)
        #transform
        transformProperty = $.support.cssProperty 'transform'
        if $.support.hasTransform3d
          @$inner[0].style[transformProperty] = "translate3d(#{x}px,0,0)"
        else
          @$inner[0].style[transformProperty] = "translate(#{x}px)"
        @needsUpdate = false

    bind: ->
      dragLimit = @$element.width()
      dragging = false
      canceled = false
      hold = false
      lockLeft = false
      lockRight = false
      xy = undefined
      dx = undefined
      dy = undefined

      @$inner.on 'touchstart', start = (e) =>
        delay =>
          dragging = true
          canceled = false
          xy = pos(e)
          dx = 0
          dy = 0
          hold = false
          lockLef = @index is 0
          lockRight = @index is @length - 1
          @disableAnimation()
        e.preventDefault()
        e.stopPropagation()
        false

      @$inner.on 'touchmove', drag = (e) =>
        if dragging and !canceled
          newXY = pos(e)
          dx = xy.x - newXY.x
          dy = xy.y - newXY.y
          if hold or Math.abs(dx) > Math.abs(dy) and (Math.abs(dx) > @options.dragRadius)
            hold = true
            e.preventDefault()
            if lockLeft and (dx < 0)
              dx = dx * (-dragLimit) / (dx - dragLimit)
            else if lockRight and (dx > 0)
              dx = dx * (dragLimit) / (dx + dragLimit)
            @offsetDrag = -dx
            @update()
          else if (Math.abs(dy) > Math.abs(dx)) and (Math.abs(dy) > @options.dragRadius)
            canceled = true
        e.preventDefault()
        e.stopPropagation()
        false

      @$inner.on 'touchend', end = (e) =>
        delay =>
          if dragging
            dragging = false
            @enableAnimation()
            if !canceled and (Math.abs(dx) > @options.moveRadius)
              if dx > 0
                @next()
              else
                @prev()
            else
              @offsetDrag = 0
              @update()
        e.preventDefault()
        e.stopPropagation()
        false

      @$element.on slidEvent, (e, prevIndex, nextIndex) =>
        @$items.eq(prevIndex).removeClass activeClass
        @$items.eq(nextIndex).addClass activeClass
        @$controlsItems.eq(prevIndex).removeClass activeClass
        @$controlsItems.eq(nextIndex).addClass activeClass

      ee = $.Event slidEvent, {}
      @$element.trigger ee, [0,0]
      @update()

    unbind: ->
      @$inner.off()

    # destroy: ->
    #   @unbind()
    #   @$element.trigger 'destroy'
    #   @$element.remove()
    #   @$element = null
    #   @$inner = null
    #   @$start = null
    #   @$current = null

    moveTo: (nextIndex) ->
      prevIndex = @index

      if nextIndex < 0
        nextIndex = 0
      else if nextIndex > @length - 1
        nextIndex = @length - 1
      # nextIndex = (nextIndex + @length) % @length

      @$current = $current = @$items.eq(nextIndex)
      currentOffset = @$current.prop('offsetLeft')
      startOffset = @$start.prop('offsetLeft')
      transitionOffset = -(currentOffset - startOffset)
      @offset = transitionOffset
      @offsetDrag = 0
      @index = nextIndex
      @update()
      @$element.trigger slidEvent, [prevIndex, nextIndex]

    next: ->
      @moveTo @index + 1

    prev: ->
      @moveTo @index - 1

  Carousel.DEFAULTS =
    dragRadius: 10
    moveRadius: 50

  $.Carousel = Carousel
  $.fn.carousel = (option) ->
    @each ->
      data = $(@).data('carousel')
      options = $.extend {}, Carousel.DEFAULTS, $(@).data(), typeof option is 'object' and option
      $(@).data 'carousel', (data = new Carousel(@, options)) unless data
      data[option]() if typeof option is 'string'

