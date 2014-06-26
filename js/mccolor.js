(function($) {
  function formatColor(src, color) {
    var colors = ['000', '00A', '0A0', '0AA', 'A00',
        'A0A', 'FA0', 'AAA', '555', '55F',
        '5F5', '5FF', 'F55', 'F5F', 'FF5', 'FFF'
      ],
      shadowColors = ['00000', '002A', '002A00', '002A2A', '2A0000',
        '2A002A', '2A2A00', '2A2A2A', '151515', '15153F',
        '153F15', '153F3F', '3F1515', '3F153F', '3F3F15', '3F3F3F'
      ],
      isBold = false,
      isUnderline = false,
      isStrike = false,
      isItalic = false,
      isCode = false,
      isStyleChanged = false,
      ret = '<span style="text-shadow:0px 0px 2px #'+shadowColors[color]+';color:#'+colors[color]+'">';
    src = src.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').
      replace('\"', '&quot;').replace(/\s/, "&nbsp;");
    for (var i = 0; i < src.length; i++) {
      if (src[i] == '\u00A7')
        isCode = true;
      else if (isCode) {
        switch (src[i].toLowerCase()) {
          case '0': case '1': case '2': case '3':
          case '4': case '5': case '6': case '7':
          case '8': case '9': case 'a': case 'b':
          case 'c': case 'd': case 'e': case 'f':
            color = parseInt(src[i], 16);
            break;
          case 'l':
            isBold = true;
            break;
          case 'm':
            isStrike = true;
            break;
          case 'n':
            isUnderline = true;
            break;
          case 'o':
            isItalic = true;
            break;
        }
        if ('0123456789abcdefr'.indexOf(src[i].toLowerCase()) != -1)
          isBold = isUnderline = isStrike = isItalic = false;
        isCode = false;
        isStyleChanged = true;
      } else {
        ret += (isStyleChanged ?
          '</span><span style="color:#' + colors[color] + ';text-shadow:0px 0px 2px #' +
          shadowColors[color] + ';' +
          (isBold ? 'font-weight:bold;' : '') +
          'text-decoration:' + (isUnderline ? 'underline' : '') +
          (!isUnderline && !isStrike ? 'none' : (isUnderline && isStrike ? ' ' : '')) +
          (isStrike ? 'line-through' : '') + ';' +
          (isItalic ? 'font-weight:italic' : '') + '">' : '') + src[i];
        isStyleChanged = false;
      }
    }
    return ret + '</span>';
  }
  $.fn.minecraftFormat = function(color) {
    return this.html(formatColor(this.text(), color ? color : 0));
  };
})(jQuery);