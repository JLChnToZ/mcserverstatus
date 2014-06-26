/* Minecraft Server Status Checker V2.0

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
    lang = new Lang('en'),
    searchquery = location.search;

  function onSubmit(form, newstate) {
    if (history.pushState && newstate) {
      var host = $("#id_host").val(),
        port = $("#id_port").val();
      history.pushState({
        host: host,
        port: port
      }, 'request: ' + host + ':' + port, '?' + host + ':' + port);
    }
    $("#querybutton").button('loading');
    var called = false;
    $(".info").fadeOut("slow", function() {
      if (!called) called = true;
      else return;
      $(".val, #players, #pluginscontent0, #pluginscontent1, #pluginscontent2").empty();
      $("#servericon, .nfo, #infoplayers, #pluginscontent0, #pluginscontent1, #pluginscontent2").hide();
      $("#noplugins, #noplayers").show();
      done = 0;
      tryRequest(form.serialize(), 0, 0);
      setTimeout(function() {
        tryRequest(form.serialize(), 1, 0);
      }, 2500);
    });
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
        $("#pluginscontent0, #pluginscontent1, #pluginscontent2").show();
        var arr = x.plugins.split(";");
        for (var i = 0; i < arr.length; i++)
        $("#pluginscontent" + (i % 3)).append($("<li></li>").text(arr[i]).hide().delay(i * 100).fadeIn("slow"));
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
          for (var i = 0; i < x.players.length; i++) {
            var skin = $("<div></div>").addClass("mc-skin").attr("data-minecraft-username", x.players[i]),
              name = $("<span></span>").addClass("label label-default").text(x.players[i]).minecraftFormat(15),
              playerdiv = $("<div></div>").addClass("player").append(skin).append(name).hide().delay(i * 100).fadeIn("slow");
            $("#players").append(playerdiv);
          }
          $(".mc-skin").minecraftSkin({
            scale: 2,
            hat: true
          });
        });
      }
    }).complete(function(x, s) {
      if (trial + 1 < allmodes[mode].length) setTimeout(function() {
        tryRequest(form, mode, trial + 1);
      }, 5000);
      else callDone();
    });
  }

  function callDone() {
    done++;
    if (done >= allmodes.length) $("#querybutton").button('reset');
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
  
  $(".changelang").click(function(e) {
    e.preventDefault();
    lang.change($(this).attr("href").substring(1));
  });

  window.onpopstate = function(e) {
    autoload(e.state);
  };

  if (searchquery && searchquery.length > 1) {
    var q = autoload(searchquery.substring(1));
    if(history.replaceState) history.replaceState({
      host: q.host,
      port: q.port ? q.port : 25565
    }, 'request: ' + q.host + ':' + q.port, '?' + q.host + ':' + q.port);
  }
  
  lang.dynamic('zh-Hant', 'js/lang/zh-tw.json');
  lang.dynamic('zh-Hans', 'js/lang/zh-cn.json');
  lang.dynamic('ja', 'js/lang/jp.json');
  lang.dynamic('ko', 'js/lang/ko.json');
});