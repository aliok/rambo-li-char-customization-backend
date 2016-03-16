"use strict";

/* jshint ignore:start */
const Promise = require("bluebird");
/* jshint ignore:end */

const request = require("request-promise");

const constants = require("../constants");
const environment = require("../environment");


const fbGraphApiBaseUrl = "https://graph.facebook.com/" + constants.facebookAPIVersion;

/**
 * Provides functions to verify and get user information.
 *
 * @module services/facebook
 */
module.exports = {

    /**
     * @typedef {Object} LongLivingAccessTokenContainer
     * @memberOf module:services/facebook
     * @property {string} longLivedAccessToken
     * @property {number} expires
     *
     */

    /**
     * Fetches a long lived access token for the given short living token.
     *
     * @function
     * @param {string} fbAccessToken    - Short living access token provided by the client
     * @return {Promise<module:services/facebook.LongLivingAccessTokenContainer,Error>}
     *
     */
    getLongLivedAccessToken: getLongLivedAccessToken,

    /**
     * @typedef {Object} FetchedFacebookUserInformation
     * @memberOf module:services/facebook
     * @property {string} id
     * @property {string} name
     * @property {Object} picture
     *
     *
     * @example
     * {
     *       "id": "154116123456789",
     *       "name": "John Doe",
     *       "picture": {
     *           "data": {
     *               "is_silhouette": false,
     *                   "url": "https://...."
     *           }
     *       }
     *   }
     */

    /**
     * Fetches the user information from Facebook.
     * @function
     * @param {string} longLivedToken - long lived token for the user
     * @return {Promise<module:services/facebook.FetchedFacebookUserInformation,Error>}
     */
    getUserInformation: getUserInformation
};


function getLongLivedAccessToken(fbAccessToken) {
    const params = {
        "client_id": environment.facebook.clientId,
        "client_secret": environment.facebook.clientSecret,
        "grant_type": "fb_exchange_token",
        "fb_exchange_token": fbAccessToken
    };

    const url = fbGraphApiBaseUrl + "/oauth/access_token";

    // for this call, FB returns 400 in case of a problem
    return request({url: url, qs: params, json: true})
        .then(function (response) {
            // result is sth like following:
            // {
            //    "access_token": "CAAVHiNqSNsABAK1............AEZD",
            //    "token_type": "bearer",
            //    "expires_in": 5174059
            // }

            if (response && response.access_token && response.expires_in) {
                return {
                    "longLivedAccessToken": response.access_token,
                    "expires": response.expires_in
                };
            }
            else {
                return Promise.reject(new Error(response.error));
            }
        })
        .catch(function (err) {
            return Promise.reject(err);
        });
}


function getUserInformation(longLivedToken) {
    //https://graph.facebook.com/v2.5/me?fields=id,name,picture&access_token=CAAVHiNqSNsABAL2V...7ShldcK4u8IGMZD
    const params = {
        // see https://developers.facebook.com/docs/facebook-login/permissions/v2.5#reference-public_profile
        "fields": "id,first_name,last_name,age_range,link,gender,locale,timezone,updated_time,verified,email,picture",
        "access_token": longLivedToken
    };

    const url = fbGraphApiBaseUrl + "/me";

    // for this call, FB returns 400 in case of any problem
    // so, it is fine... we don't need to check if there is an error
    // message in the body or something
    return request({url: url, qs: params, json: true})
        .then(function (response) {
            return response;
        })
        .catch(function (err) {
            return Promise.reject(err.response.body);
        });

}
