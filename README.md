# Block Project

This project is based on Jacob Seidelin efforts as Mario Experiment v0.1.


# To do list

  * add spawn coordinates to level properties
  * add background_color to level properties
  * fix the rest of update/collision detection
  * add font support
  * if speed is needed add tiles extra info by pre-calculating tileset_index, tileset_coords
  * get rid of evals
 

# done list

  * make game logic time dependant and use requestAnimationFrame


# Performance tips

from `http://www.html5rocks.com/en/tutorials/canvas/performance/`

  * pre-render to off-screen canvas.
  * batch canvas calls together.
  * avoid unnecessary state changes, check if changed before changing, also render by change state.
  * dont clear all and re-draw all, clear partial re-draw partial.
  * use multiple layer for complex scenes.
  * avoid flaoting point coordinates
  * dont use Math.floor use below instead
        // With a bitwise or.
        rounded = (0.5 + somenum) | 0;
        // A double bitwise not.
        rounded = ~~ (0.5 + somenum);
        // Finally, a left bitwise shift.
        rounded = (0.5 + somenum) << 0;
  * implement requestAnimationFrame

from `O'Reilly - High Performance JavaScript` book

  * copy global variables into local ones.
  * dont use for in
  * create objects and arrays using literals.
  * minimize in loop operations, check array length out of loop, use decrease index trick (maybe)...
  * use lookup table, switch, if else in that order
  * string concat 
        str += "one";
        str += "two";
        or that 
        str = str + "one" + "two";
        instead off that
        str += "one" + "two";
  * avoid double evaluation 1) they're evil 2) they're slow.


# Bitbucket Stuff

There are a couple of things you should do first, before you can use all of Git's power:

  * Add a remote to this project: in the Cloud9 IDE command line, you can execute the following commands
    `git remote add [remote name] [remote url (eg. 'git@github.com:/ajaxorg/node_chat')]` [Enter]
  * Create new files inside your project
  * Add them to to Git by executing the following command
    `git add [file1, file2, file3, ...]` [Enter]
  * Create a commit which can be pushed to the remote you just added
    `git commit -m 'added new files'` [Enter]
  * Push the commit the remote
    `git push [remote name] master` [Enter]

That's it! If this doesn't work for you, please visit the excellent resources from [Github.com](http://help.github.com) and the [Pro Git](http://http://progit.org/book/) book.
If you can't find your answers there, feel free to ask us via Twitter (@cloud9ide), [mailing list](groups.google.com/group/cloud9-ide) or IRC (#cloud9ide on freenode).

Happy coding!