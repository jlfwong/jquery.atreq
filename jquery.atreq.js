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



  $.atreq = function(urls) {
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
          $.atreq(reqs);

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
              $.atreq.loaded[url] = true;
              console.dir({
                message  : "Ran: " + url,
                requires : reqs
              });
              eval(jsfile);
            } else {
              setTimeout(arguments.callee, 10);
            }
          },10);
        },
        error     : function() {
          var err = {
            name:     'File Not Found Error',
            message:  'Could not find file \"' + url + '\"'
          };
          console.error('[$.atreq] ' +  err.name + ': ' +err.message);
        }
      });
    });
  }
  $.atreq.loaded = {};
})(jQuery);
