"use strict";

const request = require("request-promise");

const commonHelpers = require("./app-integration-test-helper-commons");

/**
 * Provides user utilities used in integration tests.
 * @module test/app-integration-helper-user
 */
const helper = module.exports = {
    /**
     * Returns a promise which resolves to an access token and a user id.
     * A new user is saved during the process. Upon subsequent calls, same user will be used.
     * @return {Promise}
     */
    getAccessTokenAndUserId: function () {
        const loginWithFacebookUrl = commonHelpers.baseUrl + "/api/v1/public/loginWithFacebook";
        const options = {
            method: "POST",
            uri: loginWithFacebookUrl,
            body: {"fb_access_token": "SOMETHING"},
            json: true
        };

        return request(options)
            .then(function (response) {
                return {
                    token: response.token,
                    userId: response.userId
                };
            });
    },

    /**
     * Returns a promise which resolves to an access token.
     * A new user is saved during the process. Upon subsequent calls, same user will be used.
     * @return {Promise<string>}
     */
    getAccessToken: function () {
        return helper.getAccessTokenAndUserId()
            .then(function (obj) {
                return obj.token;
            });
    },

    /**
     * Returns a promise which resolves to a user id.
     * A new user is saved during the process. Upon subsequent calls, same user will be used.
     * @return {Promise<string>}
     */
    getUserId: function () {
        return helper.getAccessTokenAndUserId()
            .then(function (obj) {
                return obj.userId;
            });
    }
};
