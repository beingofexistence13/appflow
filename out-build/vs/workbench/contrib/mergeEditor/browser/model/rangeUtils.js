/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, position_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$njb = exports.$mjb = exports.$ljb = exports.$kjb = exports.$jjb = void 0;
    function $jjb(range, position) {
        if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
            return false;
        }
        if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
            return false;
        }
        if (position.lineNumber === range.endLineNumber && position.column >= range.endColumn) {
            return false;
        }
        return true;
    }
    exports.$jjb = $jjb;
    function $kjb(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new length_1.$nt(0, range.endColumn - range.startColumn);
        }
        else {
            return new length_1.$nt(range.endLineNumber - range.startLineNumber, range.endColumn - 1);
        }
    }
    exports.$kjb = $kjb;
    function $ljb(position1, position2) {
        if (position1.lineNumber === position2.lineNumber) {
            return new length_1.$nt(0, position2.column - position1.column);
        }
        else {
            return new length_1.$nt(position2.lineNumber - position1.lineNumber, position2.column - 1);
        }
    }
    exports.$ljb = $ljb;
    function $mjb(position, length) {
        if (length.lineCount === 0) {
            return new position_1.$js(position.lineNumber, position.column + length.columnCount);
        }
        else {
            return new position_1.$js(position.lineNumber + length.lineCount, length.columnCount + 1);
        }
    }
    exports.$mjb = $mjb;
    function $njb(range, other) {
        return (range.endLineNumber < other.startLineNumber ||
            (range.endLineNumber === other.startLineNumber &&
                range.endColumn <= other.startColumn));
    }
    exports.$njb = $njb;
});
//# sourceMappingURL=rangeUtils.js.map