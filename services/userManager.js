"use strict";

// import the promisified Mongoose from our app
const app = require("../app");
const mongoose = app.mongoose;

/* jshint ignore:start */
const Promise = require("bluebird");
/* jshint ignore:end */
const winston = require("winston");

const User = mongoose.model("User");

/**
 * Provides basic functionality for user persistence operations.
 *
 * @module services/userManager
 */
module.exports = UserManager;

/**
 * Creates a new user manager.
 *
 * @alias module:services/userManager
 * @throws {Error} when there is a problem with passed parameters
 */

function UserManager() {

    return {
        /**
         * Finds user by id.
         *
         * @function
         * @instance
         * @param {string} id - id of the user to find
         * @return {Promise<User,Error>}
         */
        findUserById: findUserById,

        /**
         * Finds user by Facebook user id.
         *
         * @function
         * @instance
         * @param {string} facebookUserId - Facebook id of the user to find
         * @return {Promise<User,Error>}
         */
        findUserByFacebookUserId: findUserByFacebookUserId,

        /**
         * Creates a new user and returns a promise resolves to the created user.
         *
         * @function
         * @instance
         * @param {FacebookUserData} facebookUserData - User data
         * @return {Promise<User,Error>}
         */
        createUser: createUser,

        /**
         * Updates given user in the database and returns a promise resolves to that user.
         *
         * @function
         * @instance
         * @param {FacebookUserData} facebookUserData - User data
         * @return {Promise<User,Error>}
         */
        updateUser: updateUser
    };

    function findUserById(id) {
        return User
            .findByIdAsync(id)
            .catch(logErrorAndReject);
    }


    function findUserByFacebookUserId(facebookUserId) {
        return User
            .findOneAsync({"facebook.facebookUserId": facebookUserId})
            .catch(logErrorAndReject);
    }

    function createUser(facebookUserData) {
        const user = new User({
            mask0: null,
            mask1: null,
            charParts: [],
            facebook: facebookUserData
        });

        return user
            .saveAsync()
            .catch(logErrorAndReject);
    }

    function updateUser(user, userFacebookData) {
        // do not use findOneAndUpdate as validations are not applied!
        user.facebook = userFacebookData;

        return user
            .saveAsync()
            .catch(logErrorAndReject);
    }
}

function logErrorAndReject(err) {
    winston.error("Error during DB operation");
    winston.error(err);
    //following makes sure another `catch` (reject handler) is called
    return Promise.reject(err);
}

