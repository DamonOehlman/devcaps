var async = require('async'),
    debug = require('debug')('devcaps'),
    fs = require('fs'),
    formatter = require('formatter'),
    getit = require('getit'),
    path = require('path'),
    pathDetector = path.resolve(__dirname, 'detector.html'),
    reCookieDelim = /\;\s*/,
    urlModernizr = 'github://Modernizr/Modernizr/',
    urlModernizrMain = urlModernizr + 'modernizr.js',
    urlFeatureDetects = urlModernizr + 'feature-detects/',
    tmpl;
    
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

function parseDevCaps(cookies) {
    var captext = '';
    
    for (var ii = cookies.length; ii--; ) {
        var values = cookies[ii].split('=');

        // if the cookie name is devcaps, then return the value
        if (values[0].toLowerCase() === 'devcaps') {
            captext = values[1];
            break;
        }
    }
    
    if (captext) {
        var caps = captext.split('_');
        
        debug('received captext "' + captext + '" parsing into caps object');
        return caps;
    }
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

function renderDetector(caps, req, res) {
    async.parallel([ loadTemplate, getModernizr(caps) ], function(err, results) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(tmpl({
            // get the detector script from the results array (item 2, index 1)
            modernizr: results[1],
            
            caps: caps.join(':')
        }));
    });
}

function devcaps(opts) {
    // initialise the opts
    opts = opts || {};
    
    // ensure the caps have been defined
    opts.caps = opts.caps || [];
    
    // TODO: 
    
    return function(req, res, next) {
        // get the cookie value
        var cookies = (req.headers.cookie || '').split(reCookieDelim),
            caps = parseDevCaps(cookies);
            
        // if the request method is POST, then parse caps
        if (req.method === 'POST') {
            // update the caps
        }
            
        // if we have no capabilities, then render the capability detector
        if (true) { // }! caps) {
            debug('no device capabilities detected, rendering detector page');
            renderDetector(opts.caps, req, res);
        }
        else {
            // inject some detection headers
        }
        
        // iterate through the cookies and look for the devcaps cookie
    };
}

module.exports = devcaps;