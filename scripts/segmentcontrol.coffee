'use strict'

define [
  './zepto/data'
], ->
  activeClass = 'active'
  showEvent = 'show:segmentcontrol'
  shownEvent = 'shown:segmentcontrol'

  class Segmentcontrol
    constructor:(element) ->
      @element = $(element)

    show: ->
      return if @element.hasClass activeClass
      $parent = @element.parent()
      selector = @element.data('target')
      previous = $parent.find('.' + activeClass)[0]
      e = $.Event showEvent, relatedTarget: previous
      @element.trigger e
      return if e.isDefaultPrevented()
      $target = $(selector)
      @activate @element, $parent
      @activate $target, $target.parent(), =>
        ee = $.Event shownEvent, relatedTarget: previous
        @element.trigger ee

    activate: ($element, $container, callback) ->
      $active = $container.find ".#{activeClass}"
      $active.removeClass activeClass
      $element.addClass activeClass
      callback and callback()

  $.Segmentcontrol = Segmentcontrol
  $.fn.segmentcontrol = (option) ->
    @each ->
      data = $(@).data('segmentcontrol')
      $(@).data 'segmentcontrol', (data = new Segmentcontrol(@)) unless data
      data[option]() if typeof option is 'string'

  #delegate all data-role is segmentcontrol
  $(document).on 'tap', '[data-role="segmentcontrol"]', (e) ->
    e.preventDefault()
    $(@).segmentcontrol 'show'


