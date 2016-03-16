"use strict";

const _ = require("underscore");
const request = require("request-promise");

const commonHelpers = require("./app-integration-test-helper-commons");

/**
 * Provides character customization utilities used in integration tests.
 * @module test/app-integration-helper-customization
 */
const helper = module.exports = {

    validCustomization: [
        {"optionId": 1000, "color": "#D99958"},
        {"optionId": 2014, "color": "#000000"},
        {"optionId": 3004, "color": "#515158"},
        {"optionId": 4001},
        {"optionId": 7007}
    ],

    validCustomizationAlternative: [
        {"optionId": 1000, "color": "#C0C0C0"},
        {"optionId": 2019},
        {"optionId": 3002, "color": "#DDDD22"},
        {"optionId": 4004},
        {"optionId": 5006, "color": "#FF0000"},
        {"optionId": 7011, "color": "#00A2C2"}
    ],

    invalidCustomization: [],

    /**
     * Posts a request to save a valid sample customization for user with given token.
     * @return {Promise<Response>}
     */
    saveValidCustomizationForUserWithToken: function (token) {
        const url = commonHelpers.baseUrl + "/api/v1/auth/charCustomization";
        const options = {
            method: "POST",
            uri: url,
            body: helper.validCustomization,
            headers: {
                "x-access-token": token
            },
            json: true
        };

        return request(options);
    },

    /**
     * Posts a request to save a valid sample customization for user with given token.
     * @return {Promise<Response>}
     */
    saveValidAlternativeCustomizationForUserWithToken: function (token) {
        const url = commonHelpers.baseUrl + "/api/v1/auth/charCustomization";
        const options = {
            method: "POST",
            uri: url,
            body: helper.validCustomizationAlternative,
            headers: {
                "x-access-token": token
            },
            json: true
        };

        return request(options);
    },

    /**
     * Posts a request to save an invalid sample customization for user with given token.
     * @return {Promise<Response>}
     */
    saveInvalidCustomizationForUserWithToken: function (token) {
        const url = commonHelpers.baseUrl + "/api/v1/auth/charCustomization";
        const options = {
            method: "POST",
            uri: url,
            body: helper.invalidCustomization,
            headers: {
                "x-access-token": token
            },
            json: true
        };

        return request(options);
    },

    /**
     * Posts a request to get the customization for user with given token.
     * @return {Promise<Response>}
     */
    getCustomizationForUserWithToken: function (token) {
        const url = commonHelpers.baseUrl + "/api/v1/auth/charCustomization";
        const options = {
            method: "GET",
            uri: url,
            headers: {
                "x-access-token": token
            },
            json: true
        };

        return request(options);
    },

    /**
     * Posts a request to get a random customization for user with given token.
     * @return {Promise<Response>}
     */
    getRandomCustomizationForUserWithToken: function (token) {
        const url = commonHelpers.baseUrl + "/api/v1/auth/charCustomization/random";
        const options = {
            method: "GET",
            uri: url,
            headers: {
                "x-access-token": token
            },
            json: true
        };

        return request(options);
    },


    /**
     * Customization data received from server might include metadata.
     * This makes testing harder since deep equals from Chai won't work.
     * Let's omit everything except the real stuff.
     * @param customization
     */
    stripCustomization(customization){
        return _.map(customization, function (item) {
            return _.pick(item, ["optionId", "color"]);
        });
    }
};
