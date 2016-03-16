"use strict";

const _ = require("underscore");

const utils = require("./utils");

const expressUtils = require("../../utils/expressUtils");

const userManager = require("../../services/userManager")();
const customizationValidator = require("../../services/customizationValidator");
const randomCustomizations = require("../../resources/predefinedRandomCustomizations");
const maskCreator = require("../../services/maskCreator");

/**
 * Provides functions to customize the character.
 *
 * @module routes/v1/api
 */
const api = module.exports = {

    /**
     * Responds with character customization of the authenticated user.
     * @param req - request
     * @param res - response
     */
    getUserCharacterCustomization: function (req, res) {
        const user = getUser(req);
        if (_.isEmpty(user.charParts)) {
            return api.getRandomCharacterCustomization(req, res);
        }
        else {
            return res.json(user.charParts);
        }
    },

    /**
     * Saves posted character customization of the authenticated user.
     * Does some validation before saving.
     * Masks (images) are created and saved as well.
     * If all good, returns `{"OK":1}`
     * @param req - request
     * @param res - response
     */
    saveUserCharacterCustomization: function (req, res) {
        const user = getUser(req);

        /**
         * @type {UserCharPart[]}
         */
        const charParts = req.body || [];

        if (!charParts || !_.isArray(charParts) || _.isEmpty(charParts)) {
            return expressUtils.responseInvalidRequestError(res, "Missing charParts");
        }

        const error = customizationValidator(charParts);
        if (error) {
            expressUtils.responseInvalidRequestError(error);
            return;
        }

        // get Base64 encoded images for the masks
        const masks = maskCreator(charParts);
        const mask0 = masks[0];
        const mask1 = masks[1];

        // save them to database
        user.charParts = charParts;
        user.mask0 = mask0;
        user.mask1 = mask1;

        return user
            .save()
            .then(expressUtils.responseOKHandler(res))
            .catch(expressUtils.responseServerErrorHandler(res));
    },

    /**
     * Responds with one of the predefined customizations randomly.
     * Requires authentication even though it would be ok otherwise.
     * Doesn't save that customization to user automatically.
     * Clients should send a separate request for that.
     * @param req - request
     * @param res - response
     */
    getRandomCharacterCustomization: function (req, res) {
        const randomCustomization = randomCustomizations[_.random(0, randomCustomizations.length - 1)];
        return res.json(randomCustomization);
    },

    /**
     * Generates a new game token for the authenticated user and responds with it.
     *
     * Clients will push this to game backend to claim they're some particular user.
     * The reason that game tokens exist:
     *
     * - Clients have to send some kind of identity, saying they're some particular user.
     * - We could use the character customization access token directly,
     *   but it is not a good idea to send it over non-encrypted WS since CC token is powerful
     * - And we don't wanna convert WS to WSS because of shitty performance
     * - Anyway... clients ask for a token that is not that powerful and that expires very soon and push it to game backend.
     *
     * @param req - request
     * @param res - response
     */
    getGameToken: function (req, res) {
        const user = getUser(req);

        // no need to store the token as JWT is stateless
        const tokenObj = utils.generateGameToken(user);

        return res.json(tokenObj);
    },

    /**
     * Responds with the masks of the user with given id.
     * Returns HTTP 500 if user with given id is not found or user hasn't saved
     * any character customization yet.
     * @param req - request
     * @param res - response
     */
    getMask: function (req, res) {
        const userId = req.params.id;
        if (!userId) {
            return expressUtils.responseInvalidRequestError(res, "Missing user id");
        }

        return userManager
            .findUserById(userId)
            .then(function (user) {
                if (!user) {
                    return expressUtils.responseInvalidRequestError(res, "User not found");
                }

                if (!user.mask0 || !user.mask1) {
                    // just return an error. clients should handle it by showing a random predefined char
                    return expressUtils.responseInvalidRequestError(res, "Missing masks");
                }

                return res.json({
                    mask0: user.mask0,
                    mask1: user.mask1
                });
            })
            .catch(expressUtils.responseServerErrorHandler(res));
    }
};

/**
 * Gets the current logged user. It is set on the request object by the `authenticate` middleware.
 * @private
 * @param req
 * @return {User}
 */
function getUser(req) {
    return req.user;
}
