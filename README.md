# devcaps - Device capabilities discovery

## Why devcaps?

The devcaps project has been started for a couple of reasons:

1. Server-side customization of mobile web applications is [currently necessary](http://www.cloudfour.com/css-media-query-for-mobile-is-fools-gold/) if you are going to build effective and efficient mobile web apps.

2. Current device detection techniques tend to use either [WURFL](http://www.scientiamobile.com/) or naive `User-Agent` detection to determine the device that is accessing the site.

3. We can do better. For clientside development we have progressed beyond the dark ages of [User-Agent Sniffing](https://secure.wikimedia.org/wikipedia/en/wiki/Browser_sniffing) to much more reliable (and useful) [Feature Detection](http://www.html5rocks.com/en/tutorials/detection/index.html) techniques. It's time that did something to bring these techniques to the server side.