"use strict";

/**
 * This is where the we keep constants. Do not add minor things in here.
 *
 * @module constants
 */
module.exports = {
    /**
     * Host to bind to.
     * It is ok to listen this ip always because using 0.0.0.0 means binding
     * to all IPs. We're gonna have a firewall anyway to filter access.
     */
    listenHost: "0.0.0.0",

    /**
     * Port to listen to.
     * Let's use a hardcoded port value. Target environment should be fine with it.
     */
    listenPort: 4100,

    /**
     * Access token is the token that allows doing character customization.
     * This token expires after 60 DAYS; not very soon.
     */
    accessTokenExpireDays: 60,

    /**
     * Game token is the token that allows verification of identity.
     * This token expires after 30 SECONDS; it should be used immediately.
     */
    gameTokenExpireSeconds: 30,

    /**
     * Algorithm to use when signing JWT tokens.
     * We use a complex signing algorithm.
     */
    jwtAlgorithm: "HS512",

    /**
     * What version of Facebook API do we use?
     */
    facebookAPIVersion: "v2.5",

    /**
     * These are the names of the environment variables that are used.
     * @see {@link module:environment} for their details.
     */
    envVarKeys: {
        debug: "CATALLI_DEBUG",

        databaseUrl: "CATALLI_DATABASE_URL",
        accessTokenSecret: "CATALLI_ACCESS_TOKEN_SECRET",
        gameTokenSecret: "CATALLI_GAME_TOKEN_SECRET",

        // following stuff is taken using
        // https://graph.facebook.com/oauth/access_token?client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&grant_type=client_credentials
        facebook: {
            // something like '1......692992|0gqPnK........-.........'
            token: "CATALLI_FACEBOOK_TOKEN",
            // something like '1......692992'
            clientId: "CATALLI_FACEBOOK_CLIENT_ID",
            // something like '615ddc280...........'
            clientSecret: "CATALLI_FACEBOOK_SECRET"
        }
    },


    /**
     * Width of character customization masks (generated PNG images).
     */
    maskWidth: 200,
    /**
     * Height of character customization masks (generated PNG images).
     */
    maskHeight: 200,

    /**
     * Z-index of the animation layer. We need this since we would like to show
     * some things over the animation layer.
     * To elaborate:
     * - layer#0: has things like eyes, mouth
     * - animation layer: has things like moving foot, moving weapon
     * - layer#1: has things like hat
     *
     * Reason is, we want to show things in layer#1 on top of the weapons.
     *
     * This z-index is used to determine whether objects are in layer#0 or layer#1.
     * e.g. mouth has a z-index of 200 and hat has a z-index of 20000.
     */
    animationLayer_Z_Index: 10000
};
