"use strict";

/*
 * Integration tests for reading the masks.
 */

const chai = require("chai");
const request = require("request-promise");
const expect = chai.expect;
chai.use(require("chai-as-promised"));
chai.use(require("chai-string"));

const constants = require("../constants");

const commonHelpers = require("./app-integration-test-helper-commons");
const userHelpers = require("./app-integration-test-helper-user");

const gameTokenRequest = function (token) {
    const url = commonHelpers.baseUrl + "/api/v1/auth/gameToken";
    const options = {
        method: "GET",
        uri: url,
        headers: {
            "x-access-token": token
        },
        json: true
    };

    return request(options);
};

describe("/api/v1/auth/gameToken", function () {
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

    it("should return a game token which expires in N seconds", function (done) {
        Promise.resolve()
            .then(userHelpers.getAccessToken)
            .then(gameTokenRequest)
            .then(function (response) {
                expect(response.token).to.exist.and.is.a("string");
                expect(response.expires).to.exist.and.is.a("number");
                return response;
            })
            .then(function (response) {
                const expiresIn = response.expires - new Date().getTime();
                const secondInMillis = 1000;
                // because of test execution time
                // let's say it is ok to have token get expired in [N-1,N+1] seconds
                expect(expiresIn).to.be.within(
                    (constants.gameTokenExpireSeconds - 1) * secondInMillis, (constants.gameTokenExpireSeconds + 1) * secondInMillis
                );

                done();
            })
            .catch(commonHelpers.failUponHttpError(done));
    });

});
