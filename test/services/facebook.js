"use strict";

const mockery = require("mockery-next");
const expect = require("chai").expect;
/* jshint ignore:start */
const Promise = require("bluebird");
/* jshint ignore:end */

const MOCK_ENVIRONMENT = {
    debug: false,
    databaseUrl: "n/a",
    accessTokenSecret: "n/a",
    gameTokenSecret: "n/a",
    facebook: {
        token: "FACEBOOK_TOKEN",
        clientSecret: "FACEBOOK_CLIENT_SECRET",
        clientId: "FACEBOOK_CLIENT_ID"
    }
};

describe("facebook", function () {

    beforeEach(function (done) {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        // we need to mock the environment.
        // this is the way since it is loaded by the facebook module.
        // it is not injected from the caller. ...because it's caller also don't
        // have it injected from its caller. ...and so on.
        mockery.registerMock("../../environment", MOCK_ENVIRONMENT);

        done();
    });

    afterEach(function (done) {
        mockery.disable();
        mockery.deregisterAll();
        done();
    });


    describe("getLongLivedAccessToken", function () {
        it("should get the token", function (done) {
            // we cannot just intercept and mock the HTTP requests sent to Facebook
            // we need to mock the `request-promise` module to do that.
            // see https://github.com/request/request-promise/issues/55
            mockery.registerMock("request-promise", function () {
                return Promise.resolve({
                    "access_token": "THE_TOKEN",
                    "token_type": "bearer",
                    "expires_in": 1234
                });
            });

            const facebook = require("../../services/facebook");
            facebook.getLongLivedAccessToken("theShortLivingToken")
                .then(function (data) {
                    expect(data).to.deep.equal({
                        "longLivedAccessToken": "THE_TOKEN",
                        "expires": 1234
                    });
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe("getUserInformation", function () {
        after(function (done) {
            mockery.disable();
            mockery.deregisterAll();
            done();
        });

        it("should get the user information", function (done) {
            // we cannot just intercept and mock the HTTP requests sent to Facebook
            // we need to mock the `request-promise` module to do that.
            // see https://github.com/request/request-promise/issues/55
            mockery.registerMock("request-promise", function () {
                return Promise.resolve({
                    "id": "12345",
                    "name": "John Doe",
                    "picture": {
                        "data": {
                            "is_silhouette": false,
                            "url": "https://...."
                        }
                    }
                });
            });

            const facebook = require("../../services/facebook");
            facebook.getUserInformation("theShortLivingToken")
                .then(function (data) {
                    expect(data.id).to.equal("12345");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});
