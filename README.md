# devcaps - Device capabilities discovery

It's like [Modernizr](http://modernizr.com) for the server-side.  In actual fact, the devcaps approach is simply a technique for invoking client-side detection as required and passing that information to the server side.

## Why devcaps?

The devcaps project has been started for a couple of reasons:

1. Server-side customization of mobile web applications is [currently necessary](http://www.cloudfour.com/css-media-query-for-mobile-is-fools-gold/) if you are going to build effective and efficient mobile web apps.

2. Current device detection techniques tend to use either [WURFL](http://www.scientiamobile.com/) or naive `User-Agent` detection to determine the device that is accessing the site.

3. We can do better. For clientside development we have progressed beyond the dark ages of [User-Agent Sniffing](https://secure.wikimedia.org/wikipedia/en/wiki/Browser_sniffing) to much more reliable (and useful) [Feature Detection](http://www.html5rocks.com/en/tutorials/detection/index.html) techniques. It's time that did something to bring these techniques to the server side.

## Handshake Process

The devcaps handshake process is similar in execution to the way authentication is implemented in most web applications:

1. Check for a [devcaps cookie](#cookie-format).
2. If the devcaps cookie does not exist, then run the [detection routine](#detection-routine).

This repository includes a reference implementation for NodeJS for the devcaps implementation which _should_ be compatible with [connect](https://github.com/senchalabs/connect) middleware, although it has been tested primarily with [union](https://github.com/flatiron/union).

## Cookie Format

The devcaps cookie format has been revised and is now even more compact. The following is a good example of a valid `devcaps` cookie:

```
+2d+sk
```

The above cookie (which indicates that both canvas and websockets are supported) is an example of Modernizr properties that have a [shortcode](/DamonOehlman/devcaps/blob/master/lib/codes.js) associated with it. If a Modernizr capability is tested for that does not have a corresponding shortcode, this will be included in the cookie in it's full form. 

For example, `+2d+sk+canvastext` would be a valid cookie value if a test for `Modernizr.canvastext` had been requested and passed.  Of course, if a short code is eventually included canvastext then the shortcode would be used here instead.

<a id="detection-routine"></a>
## Detection Routine

![](/DamonOehlman/devcaps/raw/master/design/devcaps-process.png)

To be completed.
