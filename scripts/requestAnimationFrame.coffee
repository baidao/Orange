'use strict'

#http://paulirish.com/2011/requestanimationframe-for-smart-animating/
#http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
#requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
lastTime = 0
vendors = [
  'ms'
  'moz'
  'webkit'
  'o'
]
index = 0

while index < vendors.length and not window.requestAnimationFrame
  window.requestAnimationFrame = window[vendors[index] + 'RequestAnimationFrame']
  window.cancelAnimationFrame = window[vendors[index] + 'CancelAnimationFrame'] or window[vendors[index] + 'CancelRequestAnimationFrame']
  ++index

unless window.requestAnimationFrame
  window.requestAnimationFrame = (callback, element) ->
    currTime = new Date().getTime()
    timeToCall = Math.max(0, 16 - (currTime - lastTime))
    timerId = window.setTimeout ->
      callback currTime + timeToCall
    , timeToCall
    lastTime = currTime + timeToCall
    timerId

unless window.cancelAnimationFrame
  window.cancelAnimationFrame = (timerId) ->
    clearTimeout timerId

