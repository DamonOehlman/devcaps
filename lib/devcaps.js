var debug = require('debug')('devcaps'),
    reCookieDelim = /\;\s*/;

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

function renderDetector(req, res) {
}

function devcaps(opts) {
    // initialise the opts
    opts = opts || {};
    
    // ensure the caps have been defined
    opts.caps = opts.caps || [];
    
    return function(req, res, next) {
        // get the cookie value
        var cookies = (req.headers.cookie || '').split(reCookieDelim),
            caps = parseDevCaps(cookies);
            
        // if we have no capabilities, then render the capability detector
        if (! caps) {
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