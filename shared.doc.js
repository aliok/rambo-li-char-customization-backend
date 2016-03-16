/**
 * Represents a character customization option.
 * @typedef {Object} Option
 * @property {number} id            - Id of the option
 * @property {number} groupId       - Group id of the option
 * @property {string} name          - Name of the option
 * @property {string} resource      - Image base file name of the option (without extension)
 * @property {string} [thumbColor]    - Color to use in thumbnails. This is reserved for future.
 * @property {string[]} [colors]    - Colors that this option supports. Optional.
 *
 * @example
 * <pre>
 *     {
        "name": "Anime",
        "resource": "eye_anime",
        "colors": [
          "#000000",
          "#FF0000",
          "#FFFFFF"
        ],
        "thumbColor": "#000000",
        "id": 2001,
        "groupId": 2
      }
 * </pre>
 */


/**
 * Represents a character customization option group.
 *
 * @typedef {Object} OptionGroup
 * @property {number} id            - Id of the group
 * @property {string} name          - Name of the group
 * @property {number} allowMax      - Max N items are allowed from this group to have in the character customization
 * @property {boolean} forceSelect  - Character customization must have an option from this group
 * @property {number} zIndex        - Z-index of the group options. See {@link module:constants.animationLayer_Z_Index}
 * @property {Option[]} options     - Options of the group
 *
 * @example
 * <pre>
 * {
    "id": 1,
    "name": "Skin",
    "allowMax": 1,
    "forceSelect": true,
    "zIndex": 100,
    "options": [
      {
        "name": "Skin",
        "resource": "skin",
        "colors": [
          "#27160E",
          "#935837"
        ],
        "id": 1000,
        "groupId": 1
      }
    ]
  }
 </pre>
 *
 *
 */



/**
 * @typedef {Object.<string, Buffer>} ColorImageMap
 */


/**
 * @typedef {Object.<string, ColorImageMap>} OptionImageMapValueItem
 */
