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
            expect(err).to.not.be.ok();
            expect(res.body).to.contain('action="/test"');
            done();
        });
    });

    it('should set a cookie when it receives devcaps data in a post', function(done) {
        var requestData = {
                url: testUrl,
                form: {
                    devcaps: 'canvas,websockets'
                }
            };
        
        request.post(requestData, function(err, res) {
            // console.log(res);
        });
    });
});