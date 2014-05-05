$(function() {
  var html_encode;
  html_encode = function(str) {
    var s;
    s = "";
    if (str.length === 0) {
      return "";
    }
    s = str.replace(/&/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    s = s.replace(/\n/g, "<br>");
    return s;
  };
  $('pre').each(function(index, item) {
    var source;
    source = $(item).html();
    $(item).parent('.source').siblings('.perform').html("<div class='iphone'>" + source + "</div>");
    return $(item).html(html_encode(source));
  });
  return prettyPrint();
});