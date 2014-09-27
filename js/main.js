/* Minecraft Server Status Checker V2.4

Copyright (c) 2014 Jeremy Lam (JLChnToZ)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
$(function() {
  var allmodes = [
    ["legacy_ping", "ping"],
    ["full_query", "basic_query"]
  ],
    done = 0,
    haveResponse = false,
    lang = new Lang('en'),
    searchquery = location.search;
    
  var supports_storage = (function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  })();

  function set_theme(theme) {
    $('link#themecss').attr('href', theme);
  }
  
  function onSubmit(form, newstate) {
    if (history.pushState && newstate) {
      var host = $("#id_host").val(),
        port = $("#id_port").val();
      var _state = {
        host: host,
        port: port
      };
      if(!_.isEqual(history.state, _state))
        history.pushState(_state, 'request: ' + host + ':' + port, '?' + host + ':' + port);
    }
    $("#querybutton").button('loading');
    var called = false;
    haveResponse = false;
    $(".info, #noresponse").fadeOut("slow", function() {
      if (!called) called = true;
      else return;
      $(".val, #players, #pluginscontent").empty();
      $("#servericon, .nfo, #infoplayers, #pluginscontent").hide();
      $("#noplugins, #noplayers").show();
      done = 0;
      tryRequest(form.serialize(), 0, 0);
      setTimeout(function() {
        tryRequest(form.serialize(), 1, 0);
      }, 2500);
    });
  }
  
  function $create(elm) {
    return $(document.createElement(elm));
  }

  function tryRequest(form, mode, trial) {
    $.getJSON("json.php", form + "&mode=" + allmodes[mode][trial], function(x, h, r) {
      if (x.err || x == false) return;
      $(".info").each(function(i) {
        $(this).delay(i * 250).fadeIn("slow");
      });
      $("#infotitle").text((x.ip ? x.ip : $("#id_host").val()) + ":" + $("#id_port").val());
      showcontent("#motd", x.motd, 0);
      showcontent("#sversion", x.server_version, -1);
      showcontent("#latency", x.latency, -1);
      showcontent("#map", x.map, -1);
      showcontent("#gametype", x.gametype, -1);
      if (x.plugins && x.plugins.length > 0) {
        $("#noplugins").hide();
        $("#pluginscontent").show();
        var arr = x.plugins.split(";");
        for (var i = 0; i < arr.length; i++)
          $("#pluginscontent").append($create('li').addClass("col-xs-12 col-sm-6 col-lg-4").text(arr[i])
            .hide().delay(i * 100).fadeIn("slow"));
      }
      if (x.icon && x.icon.length > 0) $("#servericon").attr("src", x.icon).fadeIn("slow");
      if (x.player_count || x.player_max || x.player_count === 0 || x.player_max === 0) {
        $("#infoplayers").show();
        $("#pmax").toggle(x.player_count >= x.player_max);
        $("#pcount").toggle(x.player_count < x.player_max).text(x.player_count ? x.player_count : '?');
        $("#pcountmax").text(x.player_max ? x.player_max : '?');
      }
      if (x.players && x.players.length > 0) {
        $("#noplayers").hide();
        $("#players").fadeOut("fast").empty().fadeIn("fast", function() {
          var isPlayerData = true, i;
          for (i = 0; i < x.players.length; i++) // Check if those are really player data
            if(!/^\w{1,16}$/.test(x.players[i])) {
              isPlayerData = false;
              break;
            }
          if(isPlayerData) {
            for (i = 0; i < x.players.length; i++)
              $("#players").append(
                $create('div').addClass("player").append(
                  $create('div').addClass("mc-skin").data("minecraft-username", x.players[i])
                ).append(
                  $create('span').addClass("label label-default").text(x.players[i]).minecraftFormat()
                ).hide().delay(i * 100).fadeIn("slow")
              );
            $(".mc-skin").minecraftSkin({
              scale: 2,
              hat: true
            });
          } else // Non-player data is shown
            for (i = 0; i < x.players.length; i++)
              $("#players").append(
                $create('span').addClass("moreinfo").text(x.players[i]).minecraftFormat()
                .hide().delay(i * 100).fadeIn("slow")
              );
        });
      }
      haveResponse = true;
    }).complete(function(x, s) {
      if (trial + 1 < allmodes[mode].length) setTimeout(function() {
        tryRequest(form, mode, trial + 1);
      }, 5000);
      else callDone();
    });
  }

  function callDone() {
    done++;
    if (done >= allmodes.length) {
      $("#querybutton").button('reset');
      if(!haveResponse)
        $("#noresponse").fadeIn("slow");
    }
  }

  function showcontent(id, content, formatColor) {
    var $target = $(id);
    var $child = $target.children(".val");
    if (content && content.toString().length > 0) {
      $target.show();
      $child.text(content);
      if (formatColor >= 0) $child.minecraftFormat(formatColor);
    }
    return $child;
  }

  function autoload(query) {
    if (typeof(query) == "string" && query.length > 0) {
      var q = query.split(":");
      query = {
        host: q[0],
        port: q[1] ? q[1] : 25565
      };
    } else if (!query) return;
    $("#id_host").val(query['host']);
    $("#id_port").val(query['port']);
    onSubmit($("#requestform"), false);
    return query;
  }
  
  $("#requestform").submit(function(e) {
    e.preventDefault();
    onSubmit($(this), true);
  });
  
  $(".changelang").each(function() {
    var $this = $(this), langcode = $this.attr("href").substring(1);
    if(lang.defaultLang != langcode)
      lang.dynamic(langcode, $this.data("lang-path"));
  });
  
  $('body')
  .on('click', '.change-style-menu-item a', function(e) {
    e.preventDefault();
    set_theme($(this).data("css"));
    if(supports_storage)
      window.localStorage.theme = $(this).data("css");
  })
  .on('click', '.changelang', function(e){
    e.preventDefault();
    lang.change($(this).attr("href").substring(1));
  })
  .tooltip({
    selector: ".change-style-menu-item",
    placement: "left"
  });
  
  $.get("http://api.bootswatch.com/3/", function (data) {
    var themes = data.themes;
    $.each(themes, function() {
      $("#theme-select").append(
        $("<li></li>")
        .addClass("change-style-menu-item")
        .attr({
          title: this.description
        })
        .append(
          $("<a></a>")
          .data("css", this.cssMin)
          .append(this.name)
          .attr({
            href: "###"
          })
        )
      );
    });
  }, "json");

  if(supports_storage) {
    var t = window.localStorage.theme;
    if(t) set_theme(t);
  }
  
  window.onpopstate = function(e) {
    autoload(e.state);
  };

  if (searchquery && searchquery.length > 1) {
    var q = autoload(searchquery.substring(1));
    if(history.replaceState)
      history.replaceState(q, 'request: ' + q.host + ':' + q.port, '?' + q.host + ':' + q.port);
  }
});
