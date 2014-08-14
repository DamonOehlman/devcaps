# devcaps - Device capabilities discovery

It's like [Modernizr](http://modernizr.com) for the server-side.  In actual
fact, the devcaps approach is simply a technique for invoking client-side
detection as required and passing that information to the server side.


[![NPM](https://nodei.co/npm/devcaps.png)](https://nodei.co/npm/devcaps/)

[![Build Status](https://img.shields.io/travis/DamonOehlman/devcaps.svg?branch=master)](https://travis-ci.org/DamonOehlman/devcaps) 

## Why devcaps?

The devcaps experiment was started for a couple of reasons:

1. Server-side customization of mobile web applications is
   [currently necessary](http://www.cloudfour.com/css-media-query-for-mobile-is-fools-gold/)
   if you are going to build effective and efficient mobile web apps.

2. Current device detection techniques tend to use either
   [WURFL](http://www.scientiamobile.com/) or naive `User-Agent` detection
   to determine the device that is accessing the site.

3. We can do better. For clientside development we have progressed beyond the
   dark ages of [User-Agent Sniffing](https://secure.wikimedia.org/wikipedia/en/wiki/Browser_sniffing)
   to much more reliable (and useful)
   [Feature Detection](http://www.html5rocks.com/en/tutorials/detection/index.html)
   techniques. It's time that did something to bring these techniques to the server side.

## Handshake Process

The devcaps handshake process is similar in execution to the way authentication is
implemented in most web applications:

1. Check for a [devcaps cookie](#cookie-format).
2. If the devcaps cookie does not exist, then run the
   [detection routine](#detection-routine).

This repository includes a reference implementation for NodeJS for the
devcaps implementation which _should_ be compatible with
[connect](https://github.com/senchalabs/connect) middleware, although it has
been tested primarily with [union](https://github.com/flatiron/union).

## Cookie Format

The devcaps cookie format has been revised and is now even more compact. The
following is a good example of a valid `devcaps` cookie:

```
+2d+sk
```

The above cookie (which indicates that both canvas and websockets are supported)
is an example of Modernizr properties that have a
[shortcode](https://github.com/DamonOehlman/devcaps/blob/master/codes.js)
associated with it. If a Modernizr capability is tested for that does not have a
corresponding shortcode, this will be included in the cookie in it's full form.

For example, `+2d+sk+canvastext` would be a valid cookie value if a test for
`Modernizr.canvastext` had been requested and passed.  Of course, if a short code
is eventually included canvastext then the shortcode would be used here instead.

## Detection Routine

![](https://raw.githubusercontent.com/DamonOehlman/devcaps/master/design/devcaps-process.png)

## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@sidelab.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
