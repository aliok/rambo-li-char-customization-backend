"use strict";

/**
 * Provides common utility functions to use all over the project.
 *
 * @module utils/commonUtils
 */
module.exports = {
    /**
     * Returns now + N days in milliseconds.
     * @function
     * @param numDays {number}
     * @return {number}
     */
    expiresInDays: expiresInDays,

    /**
     * Returns now + N seconds in milliseconds
     * @function
     * @param numSeconds {number}
     * @return {number}
     */
    expiresInSeconds: expiresInSeconds
};


function expiresInDays(numDays) {
    const dateObj = new Date();
    // how brilliant! Date#setDate returns the millis!
    //noinspection UnnecessaryLocalVariableJS
    const dateInMillis = dateObj.setDate(dateObj.getDate() + numDays);
    return dateInMillis;
}


function expiresInSeconds(numSeconds) {
    return new Date().getTime() + numSeconds * 1000;
}
