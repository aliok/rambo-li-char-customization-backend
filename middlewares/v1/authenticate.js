"use strict";

const jwt = require("jwt-simple");
const winston = require("winston");

const expressUtils = require("../../utils/expressUtils");
const userManager = require("../../services/userManager")();
const environment = require("../../environment");

/**
 * Express middleware to authenticate users.
 *
 * Checks the custom `x-access-token` header. If that is not found
 * or the token in it is not valid, returns a 401.
 *
 * If token is valid, {@link User} is fetched from the database
 * and attached to request as `req.user`.
 *
 * A token is valid when:
 *
 * - Signature verification is successful
 * - It has not expired
 * - It is a token with type *access*
 *
 * @module middlewares/v1/authenticate
 */
module.exports = function (req, res, next) {
    const token = req.headers["x-access-token"];
    if (!token) {
        return expressUtils.responseAuthError(res, "Missing token");
    }

    /**
     * @private
     * @type {TokenPayload}
     */
    let decoded;
    try {
        // decoded key can be trusted completely.
        // I mean, following call will throw an exception if signature verification fails.
        decoded = jwt.decode(token, environment.accessTokenSecret);
    }
    catch (err) {
        return expressUtils.responseAuthError(res, "Invalid token");
    }

    if (!decoded || !decoded.expires || !decoded.userId || !decoded.type) {
        winston.error("Token decoded, but has missing information. Decoded token: %s", decoded);
        return expressUtils.responseAuthError(res, "Invalid token");
    }

    if (decoded.type !== "access") {
        return expressUtils.responseAuthError(res, "Token is not an 'access' token");
    }

    if (decoded.expires <= Date.now()) {
        return expressUtils.responseAuthError(res, "Token expired");
    }

    userManager
        .findUserById(decoded.userId)
        .then(function (dbUser) {
            if (!dbUser) {
                winston.error("No user found for userId information in token %s", decoded.userId);
                return expressUtils.responseInvalidRequestError(res, "Invalid user");
            }

            // set db user on request
            req.user = dbUser;

            next(); // move to next middleware
        })
        .catch(expressUtils.responseServerErrorHandler(res));
};
