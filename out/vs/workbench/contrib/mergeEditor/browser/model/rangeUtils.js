/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, position_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rangeIsBeforeOrTouching = exports.addLength = exports.lengthBetweenPositions = exports.lengthOfRange = exports.rangeContainsPosition = void 0;
    function rangeContainsPosition(range, position) {
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
    exports.rangeContainsPosition = rangeContainsPosition;
    function lengthOfRange(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new length_1.LengthObj(0, range.endColumn - range.startColumn);
        }
        else {
            return new length_1.LengthObj(range.endLineNumber - range.startLineNumber, range.endColumn - 1);
        }
    }
    exports.lengthOfRange = lengthOfRange;
    function lengthBetweenPositions(position1, position2) {
        if (position1.lineNumber === position2.lineNumber) {
            return new length_1.LengthObj(0, position2.column - position1.column);
        }
        else {
            return new length_1.LengthObj(position2.lineNumber - position1.lineNumber, position2.column - 1);
        }
    }
    exports.lengthBetweenPositions = lengthBetweenPositions;
    function addLength(position, length) {
        if (length.lineCount === 0) {
            return new position_1.Position(position.lineNumber, position.column + length.columnCount);
        }
        else {
            return new position_1.Position(position.lineNumber + length.lineCount, length.columnCount + 1);
        }
    }
    exports.addLength = addLength;
    function rangeIsBeforeOrTouching(range, other) {
        return (range.endLineNumber < other.startLineNumber ||
            (range.endLineNumber === other.startLineNumber &&
                range.endColumn <= other.startColumn));
    }
    exports.rangeIsBeforeOrTouching = rangeIsBeforeOrTouching;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VVdGlscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvbW9kZWwvcmFuZ2VVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBZ0IscUJBQXFCLENBQUMsS0FBWSxFQUFFLFFBQWtCO1FBQ3JFLElBQUksUUFBUSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRTtZQUM3RixPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxlQUFlLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFO1lBQ3pGLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLGFBQWEsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDdEYsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQVhELHNEQVdDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLEtBQVk7UUFDekMsSUFBSSxLQUFLLENBQUMsZUFBZSxLQUFLLEtBQUssQ0FBQyxhQUFhLEVBQUU7WUFDbEQsT0FBTyxJQUFJLGtCQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzdEO2FBQU07WUFDTixPQUFPLElBQUksa0JBQVMsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN2RjtJQUNGLENBQUM7SUFORCxzQ0FNQztJQUVELFNBQWdCLHNCQUFzQixDQUFDLFNBQW1CLEVBQUUsU0FBbUI7UUFDOUUsSUFBSSxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxVQUFVLEVBQUU7WUFDbEQsT0FBTyxJQUFJLGtCQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzdEO2FBQU07WUFDTixPQUFPLElBQUksa0JBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN4RjtJQUNGLENBQUM7SUFORCx3REFNQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxRQUFrQixFQUFFLE1BQWlCO1FBQzlELElBQUksTUFBTSxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUU7WUFDM0IsT0FBTyxJQUFJLG1CQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUMvRTthQUFNO1lBQ04sT0FBTyxJQUFJLG1CQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDcEY7SUFDRixDQUFDO0lBTkQsOEJBTUM7SUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxLQUFZLEVBQUUsS0FBWTtRQUNqRSxPQUFPLENBQ04sS0FBSyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsZUFBZTtZQUMzQyxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssS0FBSyxDQUFDLGVBQWU7Z0JBQzdDLEtBQUssQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUN0QyxDQUFDO0lBQ0gsQ0FBQztJQU5ELDBEQU1DIn0=