$ ->
  html_encode = (str) ->
    s = ""
    return "" if str.length is 0
    s = str.replace(/&/g, "&gt;")
    s = s.replace(/</g, "&lt;")
    s = s.replace(/>/g, "&gt;")
    s = s.replace(/\'/g, "&#39;")
    s = s.replace(/\"/g, "&quot;")
    s = s.replace(/\n/g, "<br>")
    return s

  $('pre').each (index, item) ->
    source = $(item).html()
    $(item).parent('.source').siblings('.perform').html("<div class='iphone'>#{source}</div>")
    $(item).html html_encode(source)

  prettyPrint()