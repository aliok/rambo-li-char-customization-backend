"use strict";

/*
 * Integration tests for login.
 */

const chai = require("chai");
const request = require("request-promise");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

const constants = require("../constants");

const commonHelpers = require("./app-integration-test-helper-commons");

const facebookLoginRequest = function (payload) {
    const loginWithFacebookUrl = commonHelpers.baseUrl + "/api/v1/public/loginWithFacebook";
    const options = {
        method: "POST",
        uri: loginWithFacebookUrl,
        body: payload,
        json: true
    };

    return request(options);
};

describe("/api/v1/public/loginWithFacebook", function () {
    before(function (done) {
        Promise.resolve()
            .then(commonHelpers.mockNecessaryThings)
            .then(commonHelpers.startServerWithCleanDatabase)
            .then(done)
            .catch(done);
    });

    after(function (done) {
        Promise.resolve()
            .then(commonHelpers.disableMocksAndShutdownServer)
            .then(done)
            .catch(done);
    });

    afterEach(function (done) {
        // before each test drop the database
        Promise.resolve()
            .then(commonHelpers.dropDatabase)
            .then(done)
            .catch(done);
    });

    context("when logging in for the first time", function () {

        it("should login to facebook", function (done) {
            // 1ST STYLE. No chai-as-promised
            facebookLoginRequest({"fb_access_token": "SHORT_LIVING_TOKEN"})
                .then(function (response) {
                    expect(response.token).to.exist.and.to.be.a("string");
                    expect(response.expires).to.exist.and.to.be.a("number");
                    expect(response.userId).to.exist.and.to.be.a("string");
                    done();
                })
                .catch(commonHelpers.failUponHttpError(done));

            // 2ND STYLE. Using chai-as-promised chains
            // chai-as-promised chained assertions don't work here
            // see https://github.com/domenic/chai-as-promised/issues/85
            // const promise = facebookLoginRequest({"fb_access_token": "SHORT_LIVING_TOKEN"});
            // expect(promise)
            //     .to.eventually
            //     .have.property("token")
            //     .and.have.property("expires")
            //     .and.have.property("userId")
            //     .notify(done);

            // 3ND STYLE. No chai-as-promised
            // facebookLoginRequest({"fb_access_token": "SHORT_LIVING_TOKEN"})
            //     .then(function (response) {
            //         return Promise.all([
            //             expect(response.token).to.exist,
            //             expect(response.expires).to.exist,
            //             expect(response.userId).to.exist
            //         ]).then(function () {
            //             done();
            //         });
            //     })
            //     .catch(failUponHttpError(done));
        });

        it("should not login to facebook because of missing short living access token", function (done) {
            const promise = facebookLoginRequest({"foo": "bar"});
            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("statusCode", 401);
                })
                .then(done);
        });
    });

    context("when logging in for the second time", function () {

        it("should login to facebook and get the same userId", function (done) {
            let userId;
            facebookLoginRequest({"fb_access_token": "SHORT_LIVING_TOKEN"})
                .then(function (response1) {
                    userId = response1.userId;
                    return expect(response1.userId).to.exist;
                })
                .then(function () {
                    facebookLoginRequest({"fb_access_token": "SHORT_LIVING_TOKEN"})
                        .then(function (response2) {
                            expect(response2.userId).to.be.equal(userId);
                            done();
                        });
                })
                .catch(commonHelpers.failUponHttpError(done));
        });

    });

    it("should login to facebook and token should expire in N days", function (done) {
        facebookLoginRequest({"fb_access_token": "SHORT_LIVING_TOKEN"})
            .then(function (response) {
                const expiresIn = response.expires - new Date().getTime();
                const dayInMillis = 24 * 60 * 60 * 1000;
                // because of test execution time and also daylight saving time changes,
                // let's say it is ok to have token get expired in [N-1,N+1] days
                expect(expiresIn).to.be.within(
                    (constants.accessTokenExpireDays - 1) * dayInMillis, (constants.accessTokenExpireDays + 1) * dayInMillis
                );
                done();
            })
            .catch(commonHelpers.failUponHttpError(done));
    });

});
