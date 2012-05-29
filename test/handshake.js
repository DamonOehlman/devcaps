var server = require('./helpers/server'),
    request = require('request');

describe('devcaps capability tests', function() {
    before(function(done) {
        server({}, done);
    });

    it('should display a caps detection page when cookies have not been detected', function(done) {
        request('http://localhost:3000/test', function(err, res) {
            console.log(res);
            done();
        });
    });
});