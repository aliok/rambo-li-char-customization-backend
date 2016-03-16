"use strict";

const winston = require("winston");

const utils = require("./utils");

const expressUtils = require("../../utils/expressUtils");
const facebook = require("../../services/facebook");

const userManager = require("../../services/userManager")();

/**
 * Provides functions to log in clients.
 *
 * @module routes/v1/login
 */
module.exports = {

    /**
     * Logs in the user over Facebook. Clients should send a Facebook short living token in
     * the request payload as JSON. ie. `{"fb_access_token":"XYZ"}`
     *
     * Returns a custom token. Clients should store that and send it along in future requests.
     *
     * If user exists already, logs in the user.
     * If user doesn't exist, creates a user.
     *
     * In both cases, a Facebook long living token is requested from Facebook
     * and stored. Likewise, user profile is requested and saved.
     *
     * @param req
     * @param res
     */
    loginWithFacebook: function (req, res) {
        const shortLivingAccessToken = req.body.fb_access_token || "";

        if (!shortLivingAccessToken) {
            return expressUtils.responseAuthError(res, "Missing Facebook short living access token");
        }

        // see http://stackoverflow.com/questions/28714298/how-to-chain-and-share-prior-results-with-promises?lq=1
        // for the complex promise chain here!

        let longLivedAccessToken, longLivedAccessTokenExpires;
        /** @type FacebookUserData */
        let userFacebookData;

        return facebook.getLongLivedAccessToken(shortLivingAccessToken)
            .then(function (longLivingAccessTokenContainer) {
                longLivedAccessToken = longLivingAccessTokenContainer.longLivedAccessToken;
                longLivedAccessTokenExpires = longLivingAccessTokenContainer.expires;
            })
            .then(function () {
                return facebook.getUserInformation(longLivedAccessToken);
            })
            .then(function (fetchedUserFacebookInformation) {
                userFacebookData = {
                    facebookUserId: fetchedUserFacebookInformation.id,
                    longLivedToken: longLivedAccessToken,
                    longLivedTokenExpire: longLivedAccessTokenExpires,
                    data: fetchedUserFacebookInformation
                };
                return userManager.findUserByFacebookUserId(userFacebookData.facebookUserId);
            })
            .then(function (user) {
                if (user) {
                    return userManager.updateUser(user, userFacebookData);
                }
                else {
                    return userManager.createUser(userFacebookData);
                }
            })
            .then(function (user) {
                // no need to store the token as JWT is stateless
                const obj = utils.generateAccessToken(user);
                const token = obj.token;
                const expires = obj.expires;

                return res.json({
                    token: token,
                    expires: expires,
                    userId: user.id
                });
            })
            .catch(function (err) {
                winston.error("Error while logging user in w/ Facebook. Token is valid, but something else is wrong...", err);
                expressUtils.responseAuthError(res, "Unable to login with Facebook");
            });
    }
};
