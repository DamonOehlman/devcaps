var server = require('./helpers/server'),
    request = require('request'),
    expect = require('expect.js'),
    testUrl = 'http://localhost:3000/test';
    
describe('devcaps capability tests', function() {
    before(function(done) {
        server('canvas,webgl,websockets', done);
    });

    it('should display a caps detection page when cookies have not been detected', function(done) {
        request(testUrl, function(err, res) {
            expect(res.body).to.contain('action="/test"');
            done(err);
        });
    });

    it('should set a cookie when it receives devcaps data in a post', function(done) {
        var requestData = {
                url: testUrl,
                form: {
                    devcaps: 'canvas,websockets',
                    devcaps_avail: '1,0'
                }
            };
        
        request.post(requestData, function(err, res) {
            var setCookieHeader = res.headers['set-cookie'];
            
            expect(setCookieHeader).to.be.ok();
            expect(setCookieHeader).to.contain('devcaps=+2d-sk; path=/; httponly');
            done(err);
        });
    });
});