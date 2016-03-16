"use strict";

const constants = require("../constants");

const optionGroups = require("../resources/metadata.json");
const imageDirectory = __dirname + "/../resources/charParts/img" + constants.maskWidth + "x" + constants.maskHeight;
const imageExtension = ".png";

const optionDataLoader = require("./optionDataLoader")(optionGroups, imageDirectory, imageExtension);

/**
 * Holds the maps and data for options, option groups and images.
 *
 * @module services/optionData
 */
module.exports = {
    /**
     * Character customization option groups.
     * @type {OptionGroup[]}
     */
    optionGroups: optionGroups,

    /**
     * A map to access option groups by id.
     * @type {Object.<string, OptionGroup>}
     * @see {@link module:services/optionDataLoader#createOptionGroupsMap}
     */
    optionGroupsMap: optionDataLoader.createOptionGroupsMap(),

    /**
     * A map to access options by id.
     * @see {@link module:services/optionDataLoader#createOptionsMap}
     * @type {Object.<string, Option>}
     */
    optionsMap: optionDataLoader.createOptionsMap(),

    /**
     * A map to access images of the options by id and color.
     * @type {Object.<string, OptionImageMapValueItem>}
     * @see {@link module:services/optionDataLoader#createOptionImagesMap}
     */
    optionImagesMap: optionDataLoader.createOptionImagesMap()
};
