'use strict'

# from bootstrap transition.js
# https://github.com/twbs/bootstrap/blob/master/js/transition.js

define [], ->
  transitionEnd = ->
    el = document.createElement 'div'
    transEndEventNames =
      WebkitTransition: 'webkitTransitionEnd'
      transition: 'transitionend'
      MSTransition: 'mSTransitionEnd'
      oTransition: 'oTransitionEnd'

    for name of transEndEventNames
      return end: transEndEventNames[name]  if el.style[name] isnt undefined

  $.fn.emulateTransitionEnd = (duration) ->
    called = false
    $(@).one $.support.transition.end, ->
      called = true

    callback = ->
      $(@).trigger $.support.transition.end  unless called

    setTimeout callback, duration
    @

  $.support.transition = transitionEnd()

