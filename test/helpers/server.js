var union = require('union'),
    director = require('director'),
    router = new director.http.Router(),
    devcaps = require('../../');

module.exports = function(detect, callback) {
    var server = union.createServer({
            before: [
                devcaps(detect),
                function (req, res) {
                    var found = router.dispatch(req, res);
                    
                    if (! found) {
                        res.emit('next');
                    }
                }
            ]
        });
        
    router.get('/test', function() {
        this.res.writeHead(200, { 'Content-Type': 'text/plain' });
        this.res.end('caps data found');
    });
        
    server.listen(3000, callback);
};