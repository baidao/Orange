'use strict'

$.os =
  ios: (->
    navigator.userAgent.match /iPhone|iPad|iPod/i
  )()
  android: (->
    navigator.userAgent.match /Android/i
  )()