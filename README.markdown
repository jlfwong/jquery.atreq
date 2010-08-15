jquery.atreq
============

jquery.atreq loads your javascript dependencies asynchronously.

How to use
----------

First, include your main application file with `$.atreq`

    <script type='text/javascript' src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
    <script type='text/javascript' src="jquery.atreq.js"></script>
    <script type='text/javascript'>
    $.atreq('application.js');
    </script>
 
Then inside your application.js and any other required files, place a require statement in the comments. 

    // application.js
    // @require 'lib/lib1.js'
    // @require 'lib/lib2.js'

    Library1Function();
    Library2Function();

**NOTE**: While `//@require` "blocks", `$.atreq` does not. This means the following will not work:

    $.atreq('lib/lib1.js');
    Library1Function();

Relative Require Paths
----------------------

Unless the require paths begin with a `/`, they're assumed to be relative to the location of the file they're in. 

This means, since `lib1.js` is in `lib/`, the require statement below will load `lib/deb/lib1dep.js`. This makes your code portable across locations.

Each of the library files can also have their own dependencies, and `$.atreq` will make sure they're run in the correct order.

    // lib/lib1.js
    // @require `dep/libdep.js`

    function Library1Function() {
        alert('Awesome!");
    }

Redundant or Duplicate Requires
-------------------------------

Duplicate requires of the same file will neither request nor run the same file twice.
This is true even if the relative path is different from files. This means that:

    // lib/lib2.js
    // @require '../shared/shared.js'

and

    // lib/lib3.js
    // @require '../shared/shared.js'

will only make one request out to `shared/shared.js`.


Alternatives and How They're Different
--------------------------------------

### $.include

A jQuery plugin by Tobiasz Cudnik, this does load external files asynchronously, but these dependencies are non-blocking. He dodges this issue by delaying the document.ready event

It even has the ability to load dependencies for included scripts like so (taken from his blog post):

    $.include(
        // URL
        'js/my-script.js',
        // will be loaded after this script
        $.include(baseURL+'js/my-other-script.js')
    );
    $.include('js/src/behaviors.js',
        // dependencies can also be an array
        [
            $.include('js/src/jquery-metadata.js'),
            $.include('js/src/jquery.form.js')
        ]
    );

This is great, except that it requires all the dependencies to be loaded from the same file.
This means you won't get useful behaviour if one of the files you're including has internal dependencies.

See: [$.include() @ tobiasz123.wordpress.com](http://tobiasz123.wordpress.com/2007/08/01/include-script-inclusion-jquery-plugin/)

### $.require

Another jQuery plugin, `$.require` doesn't have the problem of `$.include`: required files can require files of their own and scripts will still be parsed in the correct order. 

The way it does this is it forces the scripts to be included synchronously. Functionality wise, this has no effect. However, it will result in slower load times for complex dependency trees.

The require paths in this script are relative to the inclusion point (the HTML file), not the script itself.

Comparison of load times for the following dependency tree:

    application.js
    |--- 1.js
    |    |--- 1a.js
    |    |--- 1b.js
    |    \--- shared.js
    \--- 2.js
         |--- 2a.js
         |--- 2b.js
         \--- shared.js

Inside each file is the required include statements, a loop iterating 10000 times, and ~4kb of lorem ipsum in comments to bloat the file size.

$.atreq:

![$.atreq firebug](http://phleet.github.com/images/atreq/atreqfirebug.png)

$.require:

![$.require firebug](http://phleet.github.com/images/atreq/dotreqfirebug.png)

Note the difference in the load order - there's no reason why 1.js and 2.js shouldn't load at the same time.


See: [$.require @ plugins.jquery.com](http://plugins.jquery.com/project/require)

**WARNING**: At time of writing, the script provided on that page does not work and makes some strange assumptions about the location of your javascript files on the server. Use with caution.
