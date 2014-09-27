# Minecraft Color Formatting JQuery Plugin
# (c) JLChnToZ 2014
(($) ->
  MCColors = [
    0, 10, 160, 170
    2560, 2570, 4000, 2730
    1365, 1375, 1525, 1535
    3925, 3935, 4085, 4095
  ]
  rndstr = (len, chars) ->
    chars ?= String.fromCharCode.apply null, [33..126]
    ret = ""
    for i in [0...len]
      rnd = Math.floor Math.random() * chars.length
      ret += chars.substring rnd, rnd + 1
    ret
  $create = (elm) ->
    $(document.createElement elm)
  $.event.special.destroyed = remove: (o) -> o.handler?()
  $.fn.minecraftFormat = (options) ->
    escaper = "\u00A7"
    outputNonEscapedChar = yes
    outputEscaper = no
    cleanUp = no
    if typeof options is "string"
      content = options
    else if typeof options is "object"
      content = options.content
      escaper = options.escaper ? escaper
      outputNonEscapedChar = options.outputNonEscapedChar ? outputNonEscapedChar
      outputEscaper = options.outputEscaper ? outputEscaper
    $(@).each ->
      $(@).empty() if content?
      textNodes = []
      findTextNodes = (node) ->
        if node
          node = node.firstChild
          while node?
            switch node.nodeType
              when 1
                findTextNodes node
              when 3
                textNodes.push node
            node = node.nextSibling
        node
      findTextNodes @
      if textNodes.length is 0
        dummy = document.createTextNode ""
        textNodes.push dummy
        $(@).append dummy
      $.each textNodes, ->
        return yes if $(@).parent().data "mcformatted"
        logOutput = [""]
        $this = $create "span"
        bold = italic = underline = strike = no
        obfuscate = obfuscated = escaped = styleChanged = no
        color = 15
        buffer = []
        _create = ->
          style = {}
          deco = []
          style.color = "#" + "000#{MCColors[color].toString 16}".substr -3
          style.fontWeight = "bold" if bold
          style.fontStyle = "italic" if italic
          deco.push "underline" if underline
          deco.push "line-through" if strike
          style.textDecoration = deco.join " " if deco.length > 0
          $create("span").css(style).data "mcformatted", yes
        _pop = ->
          buffer.splice buffer.length - 1, 1 if buffer[buffer.length - 1] is escaper and styleChanged
          if buffer.length > 0
            buf = buffer.join ""
            logOutput[0] += "%c#{buf}"
            logOutput.push "background:#000;" + styleContainer.attr "style"
            $this.append styleContainer.text buf
            if obfuscated
              obfuscatedContainer = styleContainer.data "text-length", styleContainer.text().length
              interval = setInterval ->
                obfuscatedContainer.text rndstr obfuscatedContainer.data "text-length"
                return
              , 25
              obfuscatedContainer.bind "destroyed", -> clearInterval interval
            buffer = []
          obfuscated = obfuscate
          return
        styleContainer = _create()
        src = content ? @.nodeValue
        $this.empty()
        for char in src
          pushing = yes
          if char is escaper
            escaped = yes
          else if escaped
            styleChanged = yes
            pushing = no
            lower = char.toLowerCase()
            switch lower
              when "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"
                color = parseInt char, 16
              when "k"
                obfuscate = yes
              when "l"
                bold = yes
              when "m"
                strike = yes
              when "n"
                underline = yes
              when "o"
                italic = yes
              when "r"
              else
                styleChanged = no
                buffer.push escaper if outputEscaper
                buffer.push char if outputNonEscapedChar
            bold = underline = strike = italic = obfuscate = no unless "0123456789abcdefr".indexOf(lower) is -1
            escaped = no
          if styleChanged
            _pop()
            styleContainer = _create()
            styleChanged = no
          buffer.push char if pushing
        _pop()
        console.log.apply console, logOutput if logOutput[0].length > 0
        $(@).after($this.children()).parent()[0].removeChild @
  return
) jQuery