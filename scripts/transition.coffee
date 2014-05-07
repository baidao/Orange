'use strict'

define [], ->
  $.support.cssProperty = (prop, rprop=true) ->
    prop = prop.charAt(0).toUpperCase() + prop.substr(1)
    style = document.createElement('div').style
    prefixes = ['Webkit', 'Moz', 'o', 'MS', '']
    for pre in prefixes
      if style?[pre + prop] isnt undefined
        return if !!rprop then pre + prop else true
    return false

  $.support.hasTransform3d = ( ->
    $.support.cssProperty 'perspective'
  )()

  $.support.transition = ( ->
    events =
      WebkitTransition:
        start: 'webkitTransitionStart'
        end:'webkitTransitionEnd'
      transition:
        start: 'transitionstart'
        end: 'transitionend'
      MSTransition:
        start:  'mSTransitionStart'
        end: 'mSTransitionEnd'
      oTransition:
        start: 'oTransitionStart'
        end: 'oTransitionEnd'
    property = $.support.cssProperty 'transition'
    events[property] if property
  )()

  # from bootstrap transition.js
  # https://github.com/twbs/bootstrap/blob/master/js/transition.js
  $.fn.emulateTransitionEnd = (duration) ->
    called = false
    $(@).one $.support.transition.end, ->
      called = true

    callback = ->
      $(@).trigger $.support.transition.end  unless called

    setTimeout callback, duration
    @

