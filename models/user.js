"use strict";

// import the promisified Mongoose from our app
const app = require("../app");
const mongoose = app.mongoose;
const Schema = mongoose.Schema;

const userCharPartsSchema = mongoose.Schema({
    optionId: {type: Number, required: true},
    color: String
});

const userSchemaDef = {
    mask0: {type: String},
    mask1: {type: String},
    charParts: [userCharPartsSchema],
    facebook: {
        facebookUserId: {type: Number, index: {unique: true}, required: true},
        longLivedToken: {type: String},
        longLivedTokenExpire: {type: Number},
        data: mongoose.Schema.Types.Mixed
    }
};

const userSchema = new Schema(userSchemaDef);
const User = mongoose.model("User", userSchema);

/**
 * @typedef {Object} UserCharPart
 * @property {number}   optionId        - id of the option
 * @property {string|undefined}   color - color of the option. not set at all if option doesn't have colors but this option is in selection.
 * @example
 * // no colors defined for option
 * {"optionId":1001}
 *
 * @example
 * // colors are defined for option and a color is selected
 * {"optionId":1001, color":"#FF00FF"}
 */

/**
 * A composition of user Facebook profile data and Facebook token data.
 * @typedef {Object} FacebookUserData
 * @property {number}           facebookUserId         - Facebook user id of the user
 * @property {string}           longLivedToken         - Facebook long lived token to access user information later
 * @property {number}           longLivedTokenExpire   - Expire time of the Facebook long lived token
 * @property {object}           data                   - Fetched Facebook profile data
 */

/**
 * Promisified Mongoose model for user document.
 * That means, you need to call `findByIdAsync` instead of `findById`
 * to use a function that returns a promise.
 *
 * @class User
 * @property {string}           id                              - id of the user
 * @property {string}           mask0                           - Base64 encoded PNG mask layer 0
 * @property {string}           mask1                           - Base64 encoded PNG mask layer 1
 * @property {UserCharPart[]}   charParts                       - Char parts customized for the user
 * @property {FacebookUserData} facebook                        - Facebook information of the user
 */
module.exports = User;

