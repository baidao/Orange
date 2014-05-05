'use strict'

define [
  './zepto/data'
  './requestAnimationFrame'
], ->
  class Counter
    constructor: (element, options) ->
      @element = $(element)
      @options = options
      @frameVal = @from = Number(options.from)
      @to = Number(options.to)
      @duration = options.duration
      @decimals = Math.max(0, options.decimals)
      @dec = Math.pow(10, options.decimals)
      @startTime = null

    count: (timestamp) =>
      countDown = @from > @to
      @startTime = timestamp if @startTime is null
      progress = timestamp - @startTime

      # to ease or not to ease
      if countDown
        i = @easeOutExpo(progress, 0, @from - @to, @duration)
        @frameVal = @from - i
      else
        @frameVal = @easeOutExpo(progress, @from, @to - @from, @duration)

      # decimal
      @frameVal = Math.round(@frameVal * @dec) / @dec

      if countDown
        @frameVal = (if (@frameVal < @to) then @to else @frameVal)
      else
        @frameVal = (if (@frameVal > @to) then @to else @frameVal)

      # format and print value
      val = @frameVal.toFixed(@decimals)
      val = @addCommas(val)  if @options.commas
      @element.html val

      if progress < @duration
        requestAnimationFrame @count
      else
        @onComplete()  if @onComplete?

    start: (callback) ->
      @onComplete = callback

      if not isNaN(@to) and not isNaN(@from)
        requestAnimationFrame @count
      else
        @element.html '--'
      false


    ################# Robert Penner's easeOutExpo
    easeOutExpo: (t, b, c, d) ->
      c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b

    reset: ->
      @element.html 0

    addCommas: (nStr) ->
      nStr += ''
      x = undefined
      x1 = undefined
      x2 = undefined
      rgx = undefined
      x = nStr.split '.'
      x1 = x[0]
      x2 = if x.length > 1 then '.' + x[1] else ''
      rgx = /(\d+)(\d{3})/
      x1 = x1.replace(rgx, '$1' + ',' + '$2')  while rgx.test(x1)
      x1 + x2

    Counter.DEFAULTS =
      commas: false
      decimals: 0
      duration: 1000 #duration in ms

  $.Counter = Counter
  $.fn.counter = (option) ->
    $(@).each ->
      data = $(@).data('counter')
      options = $.extend {}, Counter.DEFAULTS, $(@).data(), typeof option is 'object' and option
      unless data
        data = new Counter(@, options)
        $(@).data 'counter', data
      if typeof option is 'string'
        data[option]()
      else data.show() if options.show


