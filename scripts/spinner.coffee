'use strict'

define [
  './zepto/data'
], ->
  class Spinner
    constructor: (element, options)->
      @element = $(element)
      @spinner = $('<div class="icon-loading spinner"/>')
      @isShown = false

    toggle: ->
      return @[if !!@isShown then 'hide' else 'show']()

    show: ->
      @spinner.appendTo(@element).addClass 'active'
      @isShown = true

    hide: ->
      @spinner.removeClass 'active'
      @isShown = false

  Spinner.DEFAULTS =
    show: true

  $.Spinner = Spinner
  $.fn.spinner = (option) ->
    @each ->
      data = $(@).data 'spinner'
      options = $.extend {}, Spinner.DEFAULTS, $(@).data(), typeof option is 'object' and option
      unless data
        data = new Spinner @, options
        $(@).data 'spinner', data
      if typeof option is 'string'
        data[option]()
      else data.show() if options.show


