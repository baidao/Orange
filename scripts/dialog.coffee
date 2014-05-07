'use strict'

require './zepto/data'
require './transition'

showClass = 'active'

class Dialog
  constructor: (element, options) ->
    @options = options
    @$element = $(element)
    @$backdrop = null
    @isShown = false

  toggle: ->
    @[(if not @isShown then 'show' else 'hide')]()

  show: ->
    return if @isShown
    $(document).on 'touchmove.dialog', -> return e.preventDefault()
    @$element.on 'tap', '[data-dismiss="dialog"]', @hide.bind @
    @backdrop =>
      @$element.show()
      @$element[0].offsetWidth if $.support.transition and @options.effect #reflow
      @$element.addClass showClass
      @isShown = true

    if @options.expires > 0
      setTimeout =>
        @hide()
      , @options.expires

  hide: ->
    return unless @isShown
    $(document).off 'touchmove.dialog'
    @$element
      .removeClass(showClass)
      .off('tap')

    callback = =>
      @backdrop =>
        @isShown = false
        @$backdrop?.remove()
        @$backdrop = null

    if $.support.transition and @options.effect
      @$element
        .one($.support.transition.end, callback)
        .emulateTransitionEnd(200)
    else
      callback()

  backdrop: (callback=->) ->
    if !@isShown and @options.backdrop #show
      @$backdrop = $("<div class='back-drop disable-user-behavior'/>").appendTo(@$element.parent())
      @$backdrop.on 'tap', @hide.bind @
      if $.support.transition and @options.effect
        @$backdrop[0].offsetWidth
        @$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(200)
      else
        callback()
      @$backdrop.addClass showClass
    else if @isShown and @$backdrop #hide
      @$backdrop.removeClass showClass
      if $.support.transition and @options.effect
        @$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(200)
      else
        callback()
    else
      callback()

Dialog.DEFAULTS =
  backdrop: true
  show: true
  expires: 0

$.Dialog = Dialog
$.fn.dialog = (toption) ->
  @each ->
    data = $(@).data('dialog')
    options = $.extend {}, Dialog.DEFAULTS, $(@).data(), typeof option is 'object' and option
    data = new Dialog(@, options) unless data

    $(@).data 'dialog', data if options.cache
    if typeof option is 'string'
      data[option]()
    else
      data.show() if options.show

$(document).on 'tap.dialog.data-api', '[data-role="dialog"]', (e) ->
  $target = $($(@).attr('data-target'))
  option = (if $target.data('dialog') then 'toggle' else $.extend({}, $target.data(), $this.data()))
  e.preventDefault() if $(@).is('a')
  $target.dialog option, @


