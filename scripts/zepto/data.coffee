'use strict'

(($) ->
  # Get value from node:
  # 1. first try key as given,
  # 2. then try camelized key,
  # 3. fall back to reading "data-*" attribute.
  getData = (node, name) ->
    id = node[exp]
    store = id and data[id]
    unless name is `undefined`
      if store
        return store[name]  if name of store
        camelName = camelize(name)
        return store[camelName]  if camelName of store
      dataAttr.call $(node), name
    else
      return store or setData node

  # Store value under camelized key on node
  setData = (node, name, value) ->
    id = node[exp] or (node[exp] = ++$.uuid)
    store = data[id] or (data[id] = attributeData(node))
    store[camelize(name)] = value  if name isnt `undefined`
    store

  # Read all "data-*" attributes from a node
  attributeData = (node) ->
    store = {}
    $.each node.attributes or emptyArray, (i, attr) ->
      store[camelize(attr.name.replace("data-", ""))] = $.zepto.deserializeValue(attr.value)  if attr.name.indexOf("data-") is 0

    store
  data = {}
  dataAttr = $.fn.data
  camelize = $.camelCase
  exp = $.expando = "Zepto" + (+new Date())
  emptyArray = []
  $.fn.data = (name, value) ->

    # set multiple values via object
    (if value is `undefined` then (if $.isPlainObject(name) then @each((i, node) ->
      $.each name, (key, value) ->
        setData node, key, value


    # get value from first element

    # set value on all elements
    ) else (if @length is 0 then `undefined` else getData(this[0], name))) else @each(->
      setData this, name, value
    ))

  $.fn.removeData = (names) ->
    names = names.split(/\s+/)  if typeof names is "string"
    @each ->
      id = this[exp]
      store = id and data[id]
      if store
        $.each names or store, (key) ->
          delete store[(if names then camelize(this) else key)]


  # Generate extended `remove` and `empty` functions
  [
    "remove"
    "empty"
  ].forEach (methodName) ->
    origFn = $.fn[methodName]
    $.fn[methodName] = ->
      elements = @find("*")
      elements = elements.add(this)  if methodName is "remove"
      elements.removeData()
      origFn.call this

) Zepto

