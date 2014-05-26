'use strict'

require './zepto/data'
require './transition'

showClass = 'active'
dismssEvent = 'click.dismiss.dialog' #i dont` know why tap fuck in ios7...

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
    @$element.on dismssEvent, (e) => @hide.call @ if e.target is e.currentTarget
    @backdrop =>
      # @$element[0].offsetWidth
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
      .off(dismssEvent)
    @backdrop =>
      @isShown = false
      @$backdrop?.remove()
      @$backdrop = null

  backdrop: (callback=->) ->
    if !@isShown and @options.backdrop #show
      @$backdrop = $("<div class='or-backdrop'/>").appendTo(@$element.parent())
      @$backdrop
        .one($.support.transition.end, callback)
        .emulateTransitionEnd(150)
      @$backdrop[0].offsetWidth
      @$backdrop.addClass showClassgi
    else if @isShown and @$backdrop #hide
      @$backdrop
        .one($.support.transition.end, callback)
        .emulateTransitionEnd(150)
        .removeClass(showClass)
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
  option = (if $target.data('dialog') then 'toggle' else $.extend({}, $target.data(), $(@).data()))
  e.preventDefault() if $(@).is('a')
  $target.dialog option, @


