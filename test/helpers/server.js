var union = require('union'),
    devcaps = require('../../');

module.exports = function(opts, callback) {
    var server = union.createServer({
            before: [
                devcaps(opts)
            ]
        });
        
    server.listen(3000, callback);
};