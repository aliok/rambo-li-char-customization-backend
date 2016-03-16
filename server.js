"use strict";

const winston = require("winston");

const environment = require("./environment");

require("./app")(environment, function () {
    winston.info("App started");
});

