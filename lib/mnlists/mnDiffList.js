'use strict';

/**
 * Instantiate a MnDiffList from a Buffer, JSON object, or Object with
 * the properties of the Block
 *
 * @param {*} - A Buffer, JSON string, or Object representing a MnDiffList
 * @returns {MnDiffList}
 * @constructor
 */
function MnDiffList(arg) {
  /* jshint maxstatements: 18 */

  if (!(this instanceof MnDiffList)) {
    return new MnDiffList(arg);
  }
}
/**
 * @param {Object} - A plain JavaScript object
 * @returns {MnDiffList} - An instance of mndifflist
 */
MnDiffList.fromObject = function fromObject(obj) {
  return new MnDiffList(obj);
};

module.exports = MnDiffList;
