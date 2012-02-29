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

A [reference implementation](/devcaps/connect-devcaps) of this early version of the process has been written for the [Node.js](http://nodejs.org/) [Connect](http://senchalabs.github.com/connect/) framework.

<a id="cookie-format"></a>
## Cookie Format

The devcaps cookie is a string that contains data on the device capabilities that have been detected (based on what has been requested). 

The following are true with regards to the cookie:

- A capability is defined using a [three-letter __alpha-only__ code](/devcaps/devcaps/wiki/Capability-Codes) (i.e., `SCR` for device screen details) followed by a value.

- Values are represented by integer values where possible:
	- Available (1)
	- Not Supported (0)

- Multiple capabilities can be defined in the cookie.  Capabilities are delimited with a underscore (`_`) character.

<a id="detection-routine"></a>
## Detection Routine

![](/DamonOehlman/devcaps/raw/master/assets/devcaps-process.png)

To be completed.
