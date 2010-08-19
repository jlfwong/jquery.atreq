/*
    jQuery.atreq - asynchronous runtime dependency loading

    Copyright (C) 2010 Jamie Wong

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

(function($) {
  function absPath(relPath) {
    var stack = [];   
    $.each(relPath.split('/'),function(i,dir) {
      if (dir == '..' && stack.length > 0 && stack[stack.length-1] != '..') {
        stack.pop()
      } else {
        stack.push(dir);
      }
    });

    return stack.join('/');
  }

  function getReqs(jsfile, basepath) {
    var pattern = new RegExp("^\/\/ *@require +['\"]([^'\"]+)['\"]$",'gim');
    var reqs = [];

    while (true) {
      match = pattern.exec(jsfile);
      if (match == null) break;
      
      if (match[1].charAt(0) == '/') {
        var path = match[1];
      } else {
        var path = basepath + match[1];
      }
      reqs.push(absPath(path));
    }

    return reqs;
  }

  function absUrl(relPath) {
    return (window.location + '').replace(/[^\/]*$/,'') + '/' + relPath;
  }

  $.atreq = function(urls, source) {
    if (! $.isArray(urls)) urls = [urls];

    $.each(urls,function(i,url) {
      url = absPath(url);
      if (url in $.atreq.loaded) return;
      $.atreq.loaded[url] = false;
      var basepath = url.replace(/[^\/]*$/,'')
      
      $.ajax({
        url       : url,
        dataType  : 'text',
        type      : 'GET',
        success   : function(jsfile) {
          var reqs = getReqs(jsfile,basepath);
          $.atreq(reqs, url);

          setTimeout(function() {
            var complete = true;

            for (i in reqs) {
              var req = reqs[i];
              if (! $.atreq.loaded[req]) {
                complete = false;
                break;
              }
            }

            if (complete) {
              try {
                console.dir({
                  message  : "Running: " + url,
                  requires : reqs
                });
                eval(jsfile);
                $.atreq.loaded[url] = true;
              } catch(e) {
                var err = new Error();
                err.message = '[$.atreq] Error: ' + e.message
                err.fileName = absUrl(url);
                err.lineNumber = 1; // TODO
                throw err;
              }
            } else {
              setTimeout(arguments.callee, 10);
            }
          },10);
        },
        error     : function() {
          var err = new Error();
          err.message = '[$.atreq] File Not Found Error: ' + url;
          if (source) {
            err.fileName = absUrl(source);
          } else {
            err.fileName = window.location;
          }
          err.lineNumber = 1; // TODO
          throw err;
        }
      });
    });
  }
  $.atreq.loaded = {};
})(jQuery);
