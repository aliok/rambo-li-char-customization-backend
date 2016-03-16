"use strict";

/*
 * Integration tests for reading the masks.
 */

const chai = require("chai");
const request = require("request-promise");
const expect = chai.expect;
chai.use(require("chai-as-promised"));
chai.use(require("chai-string"));

const commonHelpers = require("./app-integration-test-helper-commons");
const userHelpers = require("./app-integration-test-helper-user");
const customizationHelpers = require("./app-integration-test-helper-customization");

const maskRequest = function (userId) {
    const url = commonHelpers.baseUrl + "/api/v1/public/masks/" + userId;
    const options = {
        method: "GET",
        uri: url,
        json: true
    };

    return request(options);
};

describe("/api/v1/public/masks/:id", function () {
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

    it("should respond with error when no user id passed", function (done) {
        const promise = maskRequest("");
        expect(promise).to.be.rejected
            .then(function (err) {
                expect(err).to.have.property("statusCode", 404);
            })
            .then(done);
    });

    context("when user with given id doesn't exist", function () {
    
        it("should respond with error", function (done) {
            const promise = maskRequest("ABC");
            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("statusCode", 500);
                })
                .then(done);
        });
    });

    context("when user with given id exists", function () {
    
        it("should respond with error user hasn't saved a char customization yet", function (done) {
            const promise = Promise.resolve()
                .then(userHelpers.getUserId)
                .then(maskRequest);
    
            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("statusCode", 400);
                })
                .then(done);
        });
    
        it("should respond with masks if user saved a char customization", function (done) {
            let userId;
            let token;
            Promise.resolve()
                .then(userHelpers.getAccessTokenAndUserId)
                .then(function (obj) {
                    userId = obj.userId;
                    token = obj.token;
                    return token;
                })
                .then(customizationHelpers.saveValidCustomizationForUserWithToken)
                .then(function () {
                    return maskRequest(userId);
                })
                .then(function (response) {
                    expect(response.mask0).to.exist
                        .and.to.startsWith("data:image/png;base64");
                    expect(response.mask1).to.exist
                        .and.to.startsWith("data:image/png;base64");
    
                    done();
                })
                .catch(commonHelpers.failUponHttpError(done));
        });
    
    });

});
