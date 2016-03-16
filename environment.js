"use strict";

const constants = require("./constants");

/**
 * Environment variables passed are stored here.
 * All of these are required except stated otherwise.
 *
 * @module environment
 */
module.exports = {
    /**
     * Set to true if we're in debug mode.
     *
     * In debug mode, we don't create workers since that makes the Node debugger very very slow.
     *
     * Defaults to false.
     */
    debug: getEnvVar(constants.envVarKeys.debug, false),

    /**
     * URL of the MongoDB instance. Actually, a connection string.
     */
    databaseUrl: getEnvVar(constants.envVarKeys.databaseUrl),

    /**
     * Secret to generate and sign custom access tokens.
     */
    accessTokenSecret: getEnvVar(constants.envVarKeys.accessTokenSecret),

    /**
     * Secret to generate and sign custom game tokens.
     */
    gameTokenSecret: getEnvVar(constants.envVarKeys.gameTokenSecret),

    /**
     * Facebook related parameters.
     * @property {string} clientId      - Id of the Facebook application
     * @property {string} token         - Token to pass when we're doing Facebook API calls on the backend
     * @property {string} clientSecret  - Token to pass when we're doing Facebook API calls on the backend. In some calls, token is not enough.
     */
    facebook: {
        token: getEnvVar(constants.envVarKeys.facebook.token),
        clientSecret: getEnvVar(constants.envVarKeys.facebook.clientSecret),
        clientId: getEnvVar(constants.envVarKeys.facebook.clientId)
    }
};

function getEnvVar(name, defaultValue) {
    // `process` cannot be used from a module or something...
    // IntelliJ complains otherwise. anyway, let's suppress the warning.
    //noinspection ES6ModulesDependencies
    const value = process.env[name];

    if (value) {
        return value;
    }
    else if (typeof defaultValue !== "undefined") {
        return defaultValue;
    }
    else {
        throw new Error(`A required env var is not defined! Set ${name} environment variable.`);
    }
}
