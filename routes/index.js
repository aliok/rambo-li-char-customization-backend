"use strict";

const express = require("express");
const router = express.Router();

const loginv1 = require("./v1/login.js");
const apiv1 = require("./v1/api.js");

/*
 * Routes that can be accessed by any one
 */
router.post("/api/v1/public/loginWithFacebook", loginv1.loginWithFacebook);
router.get ("/api/v1/public/masks/:id", apiv1.getMask);

/*
 * Routes that can be accessed only by authenticated users
 */
router.get ("/api/v1/auth/charCustomization", apiv1.getUserCharacterCustomization);
router.post("/api/v1/auth/charCustomization", apiv1.saveUserCharacterCustomization);
router.get ("/api/v1/auth/charCustomization/random", apiv1.getRandomCharacterCustomization);
router.get ("/api/v1/auth/gameToken", apiv1.getGameToken);

module.exports = router;
