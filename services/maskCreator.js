"use strict";

const _ = require("underscore");
const constants = require("../constants");
const optionData = require("./optionData");
const Canvas = require("canvas");

const optionGroupsMap = optionData.optionGroupsMap;
const optionsMap = optionData.optionsMap;
const optionImagesMap = optionData.optionImagesMap;

/**
 * Creates masks (PNG images) for the given character customization.
 *
 * Creates 2 masks for layer#0 and layer#1. Animation layer should be
 * rendered in between by the client.
 *
 * See {@link module:constants.animationLayer_Z_Index} for more.
 *
 * Image creation is done via a headless canvas. Selected options are first sorted by
 * their z-index and drawn on the canvas one by one. Then canvases are converted to Base64
 * encoded PNG images.
 *
 * @module services/facebook
 * @see {@link module:constants.animationLayer_Z_Index}
 * @param {UserCharPart[]} charParts  - character customization
 * @return {Buffer[]} Node buffers containing the binary data of the mask images
 */
module.exports = function createMasks(charParts) {
    const width = constants.maskWidth;
    const height = constants.maskHeight;

    const canvas0 = new Canvas(width, height);
    const canvas1 = new Canvas(width, height);

    // let's create some temporary data structure to
    // access everything we need in one iteration
    let charPartsWithOptionsAndGroups = [];
    for (let charPart of charParts) {
        const option = optionsMap[charPart.optionId];
        const group = optionGroupsMap[option.groupId];
        charPartsWithOptionsAndGroups.push({
            optionId: charPart.optionId,
            color: charPart.color,
            option: option,
            optionGroup: group
        });
    }

    // sort options by z index
    charPartsWithOptionsAndGroups = _.sortBy(charPartsWithOptionsAndGroups, "optionGroup.zIndex");

    // create 2 canvases and draw images on them
    // anything has a higher z-index than the animation layer goes to second canvas.
    for (let charPartWithOptionAndGroup of charPartsWithOptionsAndGroups) {
        const color = charPartWithOptionAndGroup.color;
        const option = charPartWithOptionAndGroup.option;
        const group = charPartWithOptionAndGroup.optionGroup;

        let imgData;
        if (color) {
            imgData = optionImagesMap[option.id][color];
        }
        else {
            imgData = optionImagesMap[option.id];
        }

        if (group.zIndex < constants.animationLayer_Z_Index) {
            drawImageDataOnCanvas(canvas0, imgData);
        }
        else {
            drawImageDataOnCanvas(canvas1, imgData);
        }
    }

    return [
        canvas0.toDataURL(),
        canvas1.toDataURL()
    ];
};

function drawImageDataOnCanvas(canvas, imgData) {
    const width = constants.maskWidth;
    const height = constants.maskHeight;

    const img = new Canvas.Image();
    img.src = imgData;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
}
