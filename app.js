"use strict";

const cluster = require("cluster");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const winston = require("winston");
const bluebird = require("bluebird");

/**
 * This is the application module.
 *
 * @module app
 */

/**
 * Starts the application and returns it.
 *
 * Please note that this module is designed to be a singleton. Any subsequent loading
 * (require("app")) will return the already started application if any.
 *
 * If `environment.debug === true` it doesn't create any workers, thus a single process.
 * Otherwise, it creates a worker for each CPU.
 *
 * Dead workers will be replaced with new ones.
 *
 * Please note that `startedCallback` is called for each worker.
 *
 * @alias module:app
 * @param {module:environment} environment  - environment to use
 * @param {Function} startedCallback        - callback to call once application is started. Receives the `app` instance.
 * @return {module:app} the app that is created
 */
module.exports = function startApp(environment, startedCallback) {
// IMPL note: about `startedCallback is called for each worker`:
//            it was very hard to cluster master to get notified.
//            when workers started and then calling this callback.
//            it doesn't make sense sense anyway since workers die
//            and get replaced.


    // this definition must come before require('./routes')
    const app = express();

    // let's export the Express app as the module exports.
    // that might be useful if something here needs to be accessible by another module
    // see http://stackoverflow.com/questions/14822584/express-accessing-app-set-settings-in-routes
    // we override the export so that any subsequent loading of this module
    // returns the same app. this approached is used in so many places.
    module.exports = app;

    // Bring Mongoose into the app.
    // see http://theholmesoffice.com/mongoose-connection-best-practice/
    // Bluebird suggests that it is better to promisify Mongoose
    // than using Mongoose's
    // see http://bluebirdjs.com/docs/working-with-callbacks.html#mongoose
    const mongoose = bluebird.promisifyAll(require("mongoose"));

    /**
     * Promisified Mongoose instance is exported so that we don't need to
     * do it in submodules as well.
     * @member mongoose
     * @instance mongoose
     */
    app.mongoose = mongoose;

    const constants = require("./constants");
    const numCPUs = require("os").cpus().length;

    // clustering
    // we create a worker for each CPU if no debug env
    if (!environment.debug && cluster.isMaster) {
        // fork based on number of CPUs
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        // Listen for dying workers
        cluster.on("exit", function (worker) {
            winston.info(`worker ${worker.process.pid} died`);
            // Replace the dead worker, we're not sentimental
            cluster.fork();
        });
    }
    else {
        // if we're in a worker: start the application
        // if we're in master but we have env.debug===true: start the application
        startApplication(startedCallback);
    }

    let server;

    /**
     * Stops the application for current worker.
     * @method shutdown
     * @instance shutdown
     * @param {Function} callback - Called when application is shut down.
     */
    app.shutdown = function (callback) {
        winston.info("Shutting down...");
        mongoose.connection.close(function () {
            server.close(function () {
                module.exports = startApp;
                callback();
            });
        });
    };

    return app;

    /////////////////////////////////////////////////////

    function startApplication(startedCallback) {
        // Workers can share any TCP connection
        // In this case it is an HTTP server

        // When successfully connected to DB
        mongoose.connection.on("connected", function () {
            winston.info("Mongoose default connection open to %s", environment.databaseUrl);

            enableCORS();
            addMiddlewares();
            enableRoutes();
            registerErrorHandlers();

            // start server when DB connection is successful
            server = app.listen(constants.listenPort, constants.listenHost, function () {
                const host = server.address().address;
                const port = server.address().port;

                winston.info("App listening at http://%s:%s", host, port);
                if (startedCallback) {
                    startedCallback(app);
                }
            });
        });

        // If the DB connection throws an error
        mongoose.connection.on("error", function (err) {
            winston.error("Mongoose default connection error", err);
        });

        // When the DB connection is disconnected
        mongoose.connection.on("disconnected", function () {
            winston.info("Mongoose default connection disconnected");
        });

        // If the Node process ends, close the Mongoose connection
        //noinspection ES6ModulesDependencies
        process
            .on("SIGINT", gracefulExit)
            .on("SIGTERM", gracefulExit);

        try {
            // register models
            require("./models");
            mongoose.connect(environment.databaseUrl);
            winston.info("Trying to connect to DB : %s", environment.databaseUrl);
        } catch (err) {
            winston.error("Sever initialization failed ", err.message);
        }
    }

    function gracefulExit() {
        mongoose.disconnect(function () {
            winston.info("Mongoose default connection disconnected through app termination");
            //noinspection ES6ModulesDependencies
            process.exit(0);
        });
    }

    function enableCORS() {
        // enable CORS and enable CORS preflight
        app.use(cors());
        app.options("*", cors()); // this must be included before other routes
    }

    function addMiddlewares() {
        app.use(morgan("dev"));
        app.use(bodyParser.json());

        // auth middleware: this will check if the passed access token is valid
        // only the requests that start with /api/v1/auth/* will be checked for the token.
        const authenticateV1 = require("./middlewares/v1/authenticate");
        app.all("/api/v1/auth/*", [authenticateV1]);
    }

    function enableRoutes() {
        // ok, time to enable all routes
        const routes = require("./routes");
        app.use("/", routes);
    }

    function registerErrorHandlers() {
        // register a 404 handler
        app.use(function (req, res) {
            res.status(404).json("Sorry cant find that!");
        });

        // register a 500 handler
        app.use(function (err, req, res) {
            winston.error(err.stack);
            res.status(500).json("Something broke!");
        });
    }
};
