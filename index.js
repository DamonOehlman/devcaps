var async = require('async');
var codes = require('./codes');
var Cookies = require('cookies');
var debug = require('debug')('devcaps');
var fs = require('fs');
var formatter = require('formatter');
var getit = require('getit');
var path = require('path');
var qs = require('qs');
var pathDetector = path.resolve(__dirname, 'template/detector.html');
var reCookieDelim = /\;\s*/;
var reCommaDelim = /\,\s*/;
var urlModernizr = 'github://Modernizr/Modernizr/';
var urlModernizrMain = urlModernizr + 'modernizr.js';
var urlFeatureDetects = urlModernizr + 'feature-detects/';
var reCapabilityFlag = /([\+\-])(\w+)/;
var tmpl;

/**
  # devcaps - Device capabilities discovery

  It's like [Modernizr](http://modernizr.com) for the server-side.  In actual
  fact, the devcaps approach is simply a technique for invoking client-side
  detection as required and passing that information to the server side.

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
**/

function getModernizr(caps) {
  var getitOpts = {
    cachePath: path.resolve(__dirname, '_cache'),
    preferLocal: true
  };

  return function(callback) {
    // get modernizr with the appropriate feature detects
    getit(urlModernizrMain, getitOpts, function(err, data) {
      callback(err, data);
    });
  };
}

function deserializeCaps(captext) {
  var match;
  var caps = {};

  // ensure the captext has been defined
  caps.text = captext = captext || '';

  match = reCapabilityFlag.exec(captext);
  while (match) {
    // determine the key name (check the reverse lookup codes first)
    var key = codes.reverse[match[2]] || match[2];

    // flag whether the capability is available or not
    caps[key] = match[1] === '+';

    // update the captext and rerun the regex
    captext = captext.slice(match.index + match[0].length);
    match = reCapabilityFlag.exec(captext);
  }

  return caps;
}

function insufficientCapsData(caps, detect) {
  var rules = (detect || '').split(reCommaDelim);
  var haveData = true;

  // check that we have data for all the required rules
  for (var ii = rules.length; haveData && ii--; ) {
    haveData = typeof caps[rules[ii]] != 'undefined';
  }

  return !haveData;
}

function loadTemplate(callback) {
  if (tmpl) {
    callback();
  }
  else {
    fs.readFile(pathDetector, 'utf8', function(err, data) {
      if (! err) {
        tmpl = formatter(data);
      }

      callback(err);
    });
  }
}

function renderDetector(detect, req, res) {
  debug('rendering the detector');

  async.parallel([ loadTemplate, getModernizr(detect) ], function(err, results) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(tmpl({
      // pass back the url
      url: req.url,

      // get the detector script from the results array (item 2, index 1)
      modernizr: results[1],

      // include the items we are detecting
      detect: detect
    }));
  });
}

function serializeFormData(data) {
  var fields = (data.devcaps || '').split(reCommaDelim);
  var fieldsOK = (data.devcaps_avail || '').split(reCommaDelim);
  var output = [];

  // iterate through the fields
  fields.forEach(function(field, index) {
    output[index] = (parseInt(fieldsOK[index], 10) ? '+' : '-') + (codes[field] || field);
  });

  return output.join('');
}

function devcaps(detect) {
  return function(req, res, next) {
    var cookies = new Cookies(req, res);

    // if the request method is POST, then parse caps and update
    if (req.method === 'POST') {
      debug('received POST');

      req.on('end', function() {
        var body = req.chunks.map(function(buffer) {
          return buffer.toString('utf8');
        }).join('');

        var data = qs.parse(body);

        // if we have devcaps data, then process
        if (data.devcaps) {
          var cookieVal = serializeFormData(data);

          // create the devcaps cookie
          cookies.set('devcaps', cookieVal);
          debug('received devcaps update, writing cookie: ' + cookieVal);

          // write the location redirect and end the request
          res.writeHead(303, { 'Location' : req.url });
          res.end();
        }
      });
    }
    // otherwise check for capabilities and
    else {
      var caps = deserializeCaps(cookies.get('devcaps'));

      // if we have no caps text (empty cookie) or the caps data does not contain
      // data for the checks we need, rerun the checks
      if ((! caps.text) || insufficientCapsData(caps, detect)) {
        debug('no device capabilities detected, rendering detector page');
        renderDetector(detect || '', req, res);
      }
      else {
        // inject the caps into the request object
        req.devcaps = caps;

        // invoke the next handler
        next();
      }
    }
  };
}

module.exports = devcaps;
