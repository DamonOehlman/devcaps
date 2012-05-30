var server = require('./helpers/server'),
    request = require('request'),
    j = request.jar(),
    expect = require('expect.js'),
    testUrl = 'http://localhost:3000/test';
    
function post(caps, callback) {
    var avail = caps.map(function() { return 1; });

    request.post({
        jar: j,
        url: testUrl,
        form: {
            devcaps: caps.join(','),
            devcaps_avail: avail.join(',')
        }
    }, callback);
}
    
describe('devcaps capability tests', function() {
    before(function(done) {
        server('canvas,webgl,websockets', done);
    });

    it('should display a caps detection page when cookies have not been detected', function(done) {
        request(testUrl, { jar: j }, function(err, res) {
            expect(res.body).to.contain('action="/test"');
            done(err);
        });
    });

    it('should set a cookie when it receives devcaps data in a post', function(done) {
        post(['canvas', 'websockets'], function(err, res) {
            var setCookieHeader = res.headers['set-cookie'];
            
            expect(setCookieHeader).to.be.ok();
            expect(setCookieHeader).to.contain('devcaps=+2d+sk; path=/; httponly');
            done(err);
        });
    });
    
    it('should display the detection page as our cookie doesn\'t contain all the required detection information', function(done) {
        request(testUrl, { jar: j }, function(err, res) {
            expect(res.body).to.contain('action="/test"');
            done(err);
        });
    });
    
    it('should set a cookie (for all the required rules) when it receives devcaps data in a post', function(done) {
        post(['canvas', 'websockets', 'webgl'], function(err, res) {
            var setCookieHeader = res.headers['set-cookie'];
            
            expect(setCookieHeader).to.be.ok();
            expect(setCookieHeader).to.contain('devcaps=+2d+sk+3d; path=/; httponly');
            done(err);
        });
    });
    
    it('should now display the actual page now that all we have sufficient caps data', function(done) {
        request(testUrl, { jar: j }, function(err, res) {
            expect(res.body).to.equal('caps data found');
            done(err);
        });
    });
});