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
