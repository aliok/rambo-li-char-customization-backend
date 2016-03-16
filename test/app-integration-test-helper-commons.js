"use strict";

const mockery = require("mockery-next");
const winston = require("winston");

const constants = require("../constants");

const MOCK_ENVIRONMENT = {
    debug: true,
    databaseUrl: "mongodb://localhost/catalli-cc-test",
    accessTokenSecret: "ACCESS_TOKEN_SECRET",
    gameTokenSecret: "GAME_TOKEN_SECRET",
    facebook: {
        token: "n/a",
        clientSecret: "n/a",
        clientId: "n/a"
    }
};

/**
 * Provides utilities used in integration tests.
 * @module test/app-integration-helper-commons
 */
const commons = module.exports = {
    /**
     * Base URL for the HTTP requests.
     */
    baseUrl: "http://" + constants.listenHost + ":" + constants.listenPort,

    /**
     * Integration tests doesn't make sense for somethings.
     * For example, Facebook integration.
     * Unfortunately, Facebook doesn't provide debug tokes.
     * So, any token hardcoded in here will be expired very soon.
     * Thus, we mock the Facebook integration by returning a
     * mock token to all long lived access token requests.
     * Same goes to user profile information.
     *
     * @return {Promise}
     */
    mockNecessaryThings: function () {
        return new Promise(function (fulfill) {
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });

            mockery.registerMock("../environment", MOCK_ENVIRONMENT);

            mockery.registerMock("../services/facebook", {
                getLongLivedAccessToken: function () {
                    return Promise.resolve({
                        "access_token": "THE_LONG_LIVING_TOKEN",
                        "token_type": "bearer",
                        "expires_in": 9478000000000     // in year 2270
                    });
                },

                getUserInformation: function () {
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
                }
            });

            fulfill();
        });
    },

    /**
     * Drops the database and starts the application (as in, listening on port N).
     * @return {Promise}
     */
    startServerWithCleanDatabase: function () {
        return new Promise(function (fulfill, reject) {
            require("../app")(MOCK_ENVIRONMENT, function () {
                Promise.resolve()
                    .then(commons.dropDatabase)
                    .then(function () {
                        fulfill();
                    })
                    .catch(reject);
            });
        });
    },

    /**
     * Disables all of the mocking done previously and
     * stops the server if it is running.
     * @return {Promise}
     */
    disableMocksAndShutdownServer: function () {
        return new Promise(function (fulfill) {
            if (require("../app").shutdown) {
                require("../app").shutdown(function () {
                    mockery.disable();
                    mockery.deregisterAll();

                    fulfill();
                });
            }
        });
    },

    /**
     * Drops the MongoDB database.
     * @return {Promise}
     */
    dropDatabase: function () {
        return new Promise(function (fulfill, reject) {
            // we have to get this fresh
            // otherwise connection is already closed
            const mongoose = require("mongoose");
            mongoose.connection.db.dropDatabase(function (err, result) {
                if (err) {
                    reject(err);
                }
                else if (!result) {
                    reject(new Error("Drop database call returned " + result));
                }
                else {
                    fulfill();
                }
            });

        });
    },

    /**
     * A nice handler to use in Promise.catch.
     * Pass this one to HTTP request promises.
     * @param done - Mocha's `done` callback
     * @param log  - If true, error will be logged
     * @return {Function}
     */
    failUponHttpError: function (done, log) {
        const shouldLog = log || false;
        return function (err) {
            if (shouldLog) {
                if (err.response) {
                    winston.error(err.response.body);
                }
                else {
                    winston.error(err);
                }
            }
            done(err);
        };
    }
};
