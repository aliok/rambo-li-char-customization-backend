"use strict";

const winston = require("winston");

/**
 * Provides Express related functions that are used common.
 *
 * @module utils/expressUtils
 */
const expressUtils = module.exports = {
    /**
     * Responds with `{"OK": 1}`;
     * @param {Response} res    - response
     */
    responseOK: function (res) {
        return res.json({"OK": 1});
    },

    /**
     * Returns a higher order function to pass promise chains.
     * Calls {@link module:utils/expressUtils.responseOK}
     *
     * @param {Response} res    - response
     * @return {Function} higher order function
     */
    responseOKHandler: function (res) {
        return function () {
            expressUtils.responseOK(res);
        };
    },

    /**
     * Responds with HTTP 400 with the given message.
     * @param {Response} res    - response
     * @param {string} message  - message to send
     */
    responseInvalidRequestError: function (res, message) {
        return returnWithStatus(res, 400, message);
    },

    /**
     * Responds with HTTP 401 with the given message.
     * @param {Response} res    - response
     * @param {string} message  - message to send
     */
    responseAuthError: function (res, message) {
        return returnWithStatus(res, 401, message);
    },

    /**
     * Returns a higher order function to pass promise chains.
     * Returned function responds with HTTP 500 with a generic message.
     * We don't want to tell user too much in case of some server error.
     * @param {Response} res    - response
     * @return {Function} higher order function
     */
    responseServerErrorHandler: function (res) {
        return function (err) {
            winston.error(err);
            return returnWithStatus(res, 500, "Oops something went wrong");
        };
    }
};


function returnWithStatus(res, status, message) {
    res.status(status);
    return res.json({
        "status": status,
        "message": message
    });
}
