"use strict";

const _ = require("underscore");
const s = require("underscore.string");
const fs = require("fs");
const path = require("path");

/**
 * Loads the data related to options and option groups defined in the metadata.
 *
 * @module services/optionDataLoader
 */
module.exports = optionDataLoader;

/**
 * Creates the loader using the passed configuration.
 *
 * @alias module:services/optionDataLoader
 * @param {OptionGroup[]} optionGroups  - All option groups
 * @param {string} imageDirectory       - Image directory to find resources for options
 * @param {string} imageExtension       - Image filename extension for option resources
 * @return {{createOptionGroupsMap: createOptionGroupsMap, createOptionsMap: createOptionsMap, createOptionImagesMap: createOptionImagesMap}}
 * @throws {Error} when there is a problem with passed parameters
 */
function optionDataLoader(optionGroups, imageDirectory, imageExtension) {

    if (_.isEmpty(optionGroups)) {
        throw new Error("No option groups provided");
    }

    if (s.isBlank(imageDirectory)) {
        throw new Error("No image directory provided");
    }

    if (!fs.existsSync(imageDirectory)) {
        throw new Error("Given image directory does not exist : " + imageDirectory);
    }

    if (s.isBlank(imageExtension)) {
        throw new Error("No image extension provided");
    }

    // prepend dot if passed extension doesn't start with that
    if (!s.startsWith(imageExtension, ".")) {
        imageExtension = "." + imageExtension;
    }

    return {
        /**
         * Creates a map to access option groups by id.
         *
         * Please note that keys of the returned map are string, not integers.
         *
         * @function
         * @instance
         * @return {Object.<string, OptionGroup>}
         */
        createOptionGroupsMap: createOptionGroupsMap,

        /**
         * Creates a map to access options by id.
         * @function
         * @instance
         * @return {Object.<string, Option>}
         */
        createOptionsMap: createOptionsMap,


        /**
         * Creates a map to access images of the options by id.
         *
         * If option doesn't have any color, then value in the map will be
         * the image. Otherwise, fetched value will be again a map. But this
         * time a map of <color, image>.
         *
         * Please note that reading the images into memory for all
         * options with their colors are quite a big thing. Don't call
         * this method more than once!
         *
         * @function
         * @instance
         * @return {Object.<string, OptionImageMapValueItem>}
         */
        createOptionImagesMap: createOptionImagesMap
    };


    function createOptionGroupsMap() {
        return _.indexBy(optionGroups, "id");
    }

    function createOptionsMap() {
        const optionsMap = {};

        for (let optionGroup of optionGroups) {
            for (let option of optionGroup.options) {
                optionsMap[option.id] = option;
            }
        }

        return optionsMap;
    }

    function createOptionImagesMap() {
        const optionImagesMap = {};

        for (let optionGroup of optionGroups) {
            for (let option of optionGroup.options) {

                if (option.colors) {
                    optionImagesMap[option.id] = {};
                    for (let color of option.colors) {
                        optionImagesMap[option.id][color] = fs.readFileSync(getFilePath(option, color));
                    }
                }
                else {
                    optionImagesMap[option.id] = fs.readFileSync(getFilePath(option, null));
                }
            }
        }

        return optionImagesMap;
    }

    /**
     * Get the file path for the option w/ given optional color.
     *
     * @private
     * @param option
     * @param color
     * @return {string} the file path
     *
     * @example
     * // returns "/some/path/skin.png"
     * getFilePath({resource:"skin"}, color:undefined)
     *
     * @example
     * // returns "/some/path/skin_FF00FF.png"
     * getFilePath({resource:"skin"}, color:"FF00FF")
     *
     */
    function getFilePath(option, color) {
        if (!color) {
            return path.join(imageDirectory, option.resource + imageExtension);
        }
        else {
            return path.join(imageDirectory, option.resource + "_" + colorName(color) + imageExtension);
        }
    }
}

function colorName(color) {
    return color.replace("#", "hash");
}
