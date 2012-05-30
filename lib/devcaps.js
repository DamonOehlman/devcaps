var async = require('async'),
    Cookies = require('cookies'),
    debug = require('debug')('devcaps'),
    fs = require('fs'),
    formatter = require('formatter'),
    getit = require('getit'),
    path = require('path'),
    qs = require('qs'),
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

function parseCaps(captext) {
    var caps = (captext || '').split(':');
    
    debug('received capdata :', caps);
    return caps;
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

function devcaps(detect) {
    return function(req, res, next) {
        // devcaps requires the session middleware to operate
        // get the cookie value
        var cookies = new Cookies(req, res),
            captext = cookies.get('devcaps'),
            caps = parseCaps(captext);
            
        // if the request method is POST, then parse caps
        if (req.method === 'POST') {
            debug('received POST');
            
            req.on('end', function() {
                var body = req.chunks.map(function(buffer) {
                        return buffer.toString('utf8');
                    }).join(''),
                    data = qs.parse(body);
                
                debug('request ended', data);

                // create the devcaps cookie
                cookies.set('devcaps', data.devcaps);
                
                // write the location redirect and end the request
                res.writeHead(303, { 'Location' : req.url });
                res.end();
            });
        }
        // if we have no capabilities, then render the capability detector
        else if (! captext) {
            debug('no device capabilities detected, rendering detector page');
            renderDetector(detect || '', req, res);
        }
        else {
            next();
        }
    };
}

module.exports = devcaps;