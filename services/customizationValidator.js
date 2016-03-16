"use strict";

const _ = require("underscore");
const winston = require("winston");

const optionData = require("./optionData");
const optionGroups = optionData.optionGroups;
const optionsMap = optionData.optionsMap;


/**
 * Validates given character customization.
 *
 * A character customization given by user is like following:
 *
 * ```
 * [{"optionId": 1000, "color": "#DDDDDD"},
 *  {"optionId": 2000, "color": "#DDDDDD"},
 *  {"optionId": 7002}]
 * ```
 *
 * Option group rules:
 * - There must be a selection for each group with forceSelect=true
 * - Number of selected options for a group must be less than allowed maximum for the group
 *
 * Option rules:
 * - Selected options must exist
 * - If color is not received for a selected option, color must not have color selection required
 * - If color is received, colors must be allowed for that option and received one is in the allowed colors list
 *
 *
 * @module services/customizationValidator
 * @param {UserCharPart[]} charParts  - character customization
 * @return {string|undefined} A meaningful message in case of problems; `undefined` otherwise
 */

module.exports = function (charParts) {
    // --------- OPTION VALIDATION PROCEDURE ---------------
    // - check if all selected parts exist
    //    - if color is not received, check if a color is required
    //    - if color is received, check if colors are allowed and received one is in the list

    // --------- OPTION GROUP VALIDATION PROCEDURE ---------------
    // - create a map of <groupId, charPart[]>
    // - validate groups
    //    - check if there is a selection for each group with forceSelect=true
    //    - check if number of selected options for a group is < allowMax
    //    -

    if (_.isEmpty(charParts)) {
        return "No character customization is provided";
    }

    if (!_.isArray(charParts)) {
        return "Character customization provided is not an array";
    }

    // --------- OPTION VALIDATION PROCEDURE ---------------
    for (let charPart of charParts) {
        const validationError = validateSingleCharPart(charPart);
        if (validationError) {
            return validationError;
        }
    }

    // --------- OPTION GROUP VALIDATION PROCEDURE ---------------
    // - create a map of <groupId, charPart[]>
    const groupCharPartsMap = _.groupBy(charParts, function (charPart) {
        return optionsMap[charPart.optionId].groupId;
    });
    for (let optionGroup of optionGroups) {
        const userSelectedPartsForGroup = groupCharPartsMap[optionGroup.id];
        const validationError = validateSelectedCharPartsForGroup(optionGroup, userSelectedPartsForGroup);
        if (validationError) {
            return validationError;
        }
    }

    return undefined;
};

function validateSingleCharPart(charPart) {
    if (!charPart) {
        return "Falsy char part : " + JSON.stringify(charPart);
    }
    const optionId = charPart.optionId;
    const color = charPart.color;

    if (!optionId || !_.isFinite(optionId)) {
        winston.debug("Invalid option id : %s", charPart);
        return "Invalid option id : " + charPart.optionId;
    }

    // - check if all selected parts exist
    if (!_.has(optionsMap, optionId)) {
        winston.debug("Option doesn't exist: %s", charPart);
        return "Option doesn't exist: " + charPart.optionId;
    }

    const option = optionsMap[optionId];
    if (color) {
        const optionColors = option.colors;

        //    - if color is not selected, do not allow color selection
        if (!optionColors) {
            winston.debug("Option doesn't have colors, but a color is received: %s", charPart);
            return "Option doesn't have colors, but a color is received: " + option.name;
        }

        //    - if color is selected, check if colors are allowed and selected one is in the list
        const indexOfSelectedColor = _.indexOf(optionColors, color);
        if (indexOfSelectedColor < 0) {
            winston.debug("Given color is not allowed for the option: %s ", charPart);
            return "Given color is not allowed for the option: " + option.name;
        }
    }

    return undefined;
}

function validateSelectedCharPartsForGroup(optionGroup, userSelectedPartsForGroup) {
    //    - check if there is a selection for each group with forceSelect=true
    if (optionGroup.forceSelect) {
        if (_.isEmpty(userSelectedPartsForGroup)) {
            winston.debug("Selection is required for the group: %s" + optionGroup);
            return "Selection is required for the group: " + JSON.stringify(_.pick(optionGroup, "id", "name"));
        }
    }

    if (_.isEmpty(userSelectedPartsForGroup)) {
        // no force select, nothing selected.. just skip it
        return undefined;
    }

    //    - check if number of selected options for a group is < allowMax
    if (optionGroup.allowMax) {
        if (userSelectedPartsForGroup.length > optionGroup.allowMax) {
            winston.debug("Too many options selected for group: %s" + userSelectedPartsForGroup);
            return "Too many options selected for group: " + JSON.stringify(userSelectedPartsForGroup);
        }
    }
}
