"use strict";

/*
 * Integration tests for doing operations with character customizations.
 */

const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));
chai.use(require("chai-string"));

const commonHelpers = require("./app-integration-test-helper-commons");
const userHelpers = require("./app-integration-test-helper-user");
const customizationHelpers = require("./app-integration-test-helper-customization");

describe("/api/v1/auth/charCustomization", function () {
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

    describe("GET /api/v1/auth/charCustomization", function () {
        it("should return a random predefined customization when user doesn't have a customization saved yet", function (done) {
            Promise.resolve()
                .then(userHelpers.getAccessToken)
                .then(customizationHelpers.getCustomizationForUserWithToken)
                .then(function (customization) {
                    expect(customization).to.be.an("array");
                    expect(customization[0]).to.have.property("optionId");
                    done();
                })
                .catch(commonHelpers.failUponHttpError(done));
        });

        it("should return the saved customization when user saved a customization already", function (done) {
            Promise.resolve()
                .then(userHelpers.getAccessToken)
                .then(customizationHelpers.saveValidCustomizationForUserWithToken)
                .then(userHelpers.getAccessToken)
                .then(customizationHelpers.getCustomizationForUserWithToken)
                .then(function (customization) {
                    expect(customization).to.be.an("array");

                    customization = customizationHelpers.stripCustomization(customization);

                    expect(customization).to.deep.equal(customizationHelpers.validCustomization);
                    done();
                })
                .catch(commonHelpers.failUponHttpError(done));
        });
    });

    describe("POST /api/v1/auth/charCustomization", function () {
        it("should not allow invalid customizations", function (done) {
            // first we save a valid one
            // then we try to save an invalid one
            // then we read the customization again to compare with the first one we saved

            const promise = Promise.resolve()
                .then(userHelpers.getAccessToken)
                .then(customizationHelpers.saveValidCustomizationForUserWithToken)
                .then(userHelpers.getAccessToken)
                .then(customizationHelpers.saveInvalidCustomizationForUserWithToken);

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("statusCode", 400);

                    return Promise.resolve()
                        .then(userHelpers.getAccessToken)
                        .then(customizationHelpers.getCustomizationForUserWithToken)
                        .then(function (customization) {
                            expect(customization).to.be.an("array");

                            customization = customizationHelpers.stripCustomization(customization);

                            expect(customization).to.deep.equal(customizationHelpers.validCustomization);
                            done();
                        });
                })
                .catch(commonHelpers.failUponHttpError(done));


        });

        context("user doesn't have a customization saved yet", function () {
            it("should insert", function (done) {
                Promise.resolve()
                    .then(userHelpers.getAccessToken)
                    .then(customizationHelpers.saveValidCustomizationForUserWithToken)
                    .then(userHelpers.getAccessToken)
                    .then(customizationHelpers.getCustomizationForUserWithToken)
                    .then(function (customization) {
                        expect(customization).to.be.an("array");

                        customization = customizationHelpers.stripCustomization(customization);

                        expect(customization).to.deep.equal(customizationHelpers.validCustomization);
                        done();
                    })
                    .catch(commonHelpers.failUponHttpError(done));
            });
        });

        context("user has a customization saved already", function () {
            it("should overwrite", function (done) {
                // save a valid customization
                // then save another one
                // then read
                // what we read should be the second one

                Promise.resolve()
                    .then(userHelpers.getAccessToken)
                    .then(customizationHelpers.saveValidCustomizationForUserWithToken)
                    .then(userHelpers.getAccessToken)
                    .then(customizationHelpers.saveValidAlternativeCustomizationForUserWithToken)
                    .then(userHelpers.getAccessToken)
                    .then(customizationHelpers.getCustomizationForUserWithToken)
                    .then(function (customization) {
                        expect(customization).to.be.an("array");

                        customization = customizationHelpers.stripCustomization(customization);

                        expect(customization).to.deep.equal(customizationHelpers.validCustomizationAlternative);
                        done();
                    })
                    .catch(commonHelpers.failUponHttpError(done));
            });
        });
    });

    describe("GET /api/v1/auth/charCustomization/random", function () {
        it("should return a random predefined customization", function (done) {
            Promise.resolve()
                .then(userHelpers.getAccessToken)
                .then(customizationHelpers.getRandomCustomizationForUserWithToken)
                .then(function (customization) {
                    expect(customization).to.be.an("array");
                    expect(customization[0]).to.have.property("optionId");
                    done();
                })
                .catch(commonHelpers.failUponHttpError(done));
        });
    });


});
