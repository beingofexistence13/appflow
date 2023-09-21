/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/cursorColumns"], function (require, exports, cursorColumns_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AtomicTabMoveOperations = exports.Direction = void 0;
    var Direction;
    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
        Direction[Direction["Nearest"] = 2] = "Nearest";
    })(Direction || (exports.Direction = Direction = {}));
    class AtomicTabMoveOperations {
        /**
         * Get the visible column at the position. If we get to a non-whitespace character first
         * or past the end of string then return -1.
         *
         * **Note** `position` and the return value are 0-based.
         */
        static whitespaceVisibleColumn(lineContent, position, tabSize) {
            const lineLength = lineContent.length;
            let visibleColumn = 0;
            let prevTabStopPosition = -1;
            let prevTabStopVisibleColumn = -1;
            for (let i = 0; i < lineLength; i++) {
                if (i === position) {
                    return [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn];
                }
                if (visibleColumn % tabSize === 0) {
                    prevTabStopPosition = i;
                    prevTabStopVisibleColumn = visibleColumn;
                }
                const chCode = lineContent.charCodeAt(i);
                switch (chCode) {
                    case 32 /* CharCode.Space */:
                        visibleColumn += 1;
                        break;
                    case 9 /* CharCode.Tab */:
                        // Skip to the next multiple of tabSize.
                        visibleColumn = cursorColumns_1.CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
                        break;
                    default:
                        return [-1, -1, -1];
                }
            }
            if (position === lineLength) {
                return [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn];
            }
            return [-1, -1, -1];
        }
        /**
         * Return the position that should result from a move left, right or to the
         * nearest tab, if atomic tabs are enabled. Left and right are used for the
         * arrow key movements, nearest is used for mouse selection. It returns
         * -1 if atomic tabs are not relevant and you should fall back to normal
         * behaviour.
         *
         * **Note**: `position` and the return value are 0-based.
         */
        static atomicPosition(lineContent, position, tabSize, direction) {
            const lineLength = lineContent.length;
            // Get the 0-based visible column corresponding to the position, or return
            // -1 if it is not in the initial whitespace.
            const [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn] = AtomicTabMoveOperations.whitespaceVisibleColumn(lineContent, position, tabSize);
            if (visibleColumn === -1) {
                return -1;
            }
            // Is the output left or right of the current position. The case for nearest
            // where it is the same as the current position is handled in the switch.
            let left;
            switch (direction) {
                case 0 /* Direction.Left */:
                    left = true;
                    break;
                case 1 /* Direction.Right */:
                    left = false;
                    break;
                case 2 /* Direction.Nearest */:
                    // The code below assumes the output position is either left or right
                    // of the input position. If it is the same, return immediately.
                    if (visibleColumn % tabSize === 0) {
                        return position;
                    }
                    // Go to the nearest indentation.
                    left = visibleColumn % tabSize <= (tabSize / 2);
                    break;
            }
            // If going left, we can just use the info about the last tab stop position and
            // last tab stop visible column that we computed in the first walk over the whitespace.
            if (left) {
                if (prevTabStopPosition === -1) {
                    return -1;
                }
                // If the direction is left, we need to keep scanning right to ensure
                // that targetVisibleColumn + tabSize is before non-whitespace.
                // This is so that when we press left at the end of a partial
                // indentation it only goes one character. For example '      foo' with
                // tabSize 4, should jump from position 6 to position 5, not 4.
                let currentVisibleColumn = prevTabStopVisibleColumn;
                for (let i = prevTabStopPosition; i < lineLength; ++i) {
                    if (currentVisibleColumn === prevTabStopVisibleColumn + tabSize) {
                        // It is a full indentation.
                        return prevTabStopPosition;
                    }
                    const chCode = lineContent.charCodeAt(i);
                    switch (chCode) {
                        case 32 /* CharCode.Space */:
                            currentVisibleColumn += 1;
                            break;
                        case 9 /* CharCode.Tab */:
                            currentVisibleColumn = cursorColumns_1.CursorColumns.nextRenderTabStop(currentVisibleColumn, tabSize);
                            break;
                        default:
                            return -1;
                    }
                }
                if (currentVisibleColumn === prevTabStopVisibleColumn + tabSize) {
                    return prevTabStopPosition;
                }
                // It must have been a partial indentation.
                return -1;
            }
            // We are going right.
            const targetVisibleColumn = cursorColumns_1.CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
            // We can just continue from where whitespaceVisibleColumn got to.
            let currentVisibleColumn = visibleColumn;
            for (let i = position; i < lineLength; i++) {
                if (currentVisibleColumn === targetVisibleColumn) {
                    return i;
                }
                const chCode = lineContent.charCodeAt(i);
                switch (chCode) {
                    case 32 /* CharCode.Space */:
                        currentVisibleColumn += 1;
                        break;
                    case 9 /* CharCode.Tab */:
                        currentVisibleColumn = cursorColumns_1.CursorColumns.nextRenderTabStop(currentVisibleColumn, tabSize);
                        break;
                    default:
                        return -1;
                }
            }
            // This condition handles when the target column is at the end of the line.
            if (currentVisibleColumn === targetVisibleColumn) {
                return lineLength;
            }
            return -1;
        }
    }
    exports.AtomicTabMoveOperations = AtomicTabMoveOperations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yQXRvbWljTW92ZU9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2N1cnNvci9jdXJzb3JBdG9taWNNb3ZlT3BlcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsSUFBa0IsU0FJakI7SUFKRCxXQUFrQixTQUFTO1FBQzFCLHlDQUFJLENBQUE7UUFDSiwyQ0FBSyxDQUFBO1FBQ0wsK0NBQU8sQ0FBQTtJQUNSLENBQUMsRUFKaUIsU0FBUyx5QkFBVCxTQUFTLFFBSTFCO0lBRUQsTUFBYSx1QkFBdUI7UUFDbkM7Ozs7O1dBS0c7UUFDSSxNQUFNLENBQUMsdUJBQXVCLENBQUMsV0FBbUIsRUFBRSxRQUFnQixFQUFFLE9BQWU7WUFDM0YsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztZQUN0QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLHdCQUF3QixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDbkIsT0FBTyxDQUFDLG1CQUFtQixFQUFFLHdCQUF3QixFQUFFLGFBQWEsQ0FBQyxDQUFDO2lCQUN0RTtnQkFDRCxJQUFJLGFBQWEsR0FBRyxPQUFPLEtBQUssQ0FBQyxFQUFFO29CQUNsQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7b0JBQ3hCLHdCQUF3QixHQUFHLGFBQWEsQ0FBQztpQkFDekM7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekMsUUFBUSxNQUFNLEVBQUU7b0JBQ2Y7d0JBQ0MsYUFBYSxJQUFJLENBQUMsQ0FBQzt3QkFDbkIsTUFBTTtvQkFDUDt3QkFDQyx3Q0FBd0M7d0JBQ3hDLGFBQWEsR0FBRyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDeEUsTUFBTTtvQkFDUDt3QkFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDckI7YUFDRDtZQUNELElBQUksUUFBUSxLQUFLLFVBQVUsRUFBRTtnQkFDNUIsT0FBTyxDQUFDLG1CQUFtQixFQUFFLHdCQUF3QixFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQ3RFO1lBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUVEOzs7Ozs7OztXQVFHO1FBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFtQixFQUFFLFFBQWdCLEVBQUUsT0FBZSxFQUFFLFNBQW9CO1lBQ3hHLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7WUFFdEMsMEVBQTBFO1lBQzFFLDZDQUE2QztZQUM3QyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsd0JBQXdCLEVBQUUsYUFBYSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV2SixJQUFJLGFBQWEsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDekIsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUNWO1lBRUQsNEVBQTRFO1lBQzVFLHlFQUF5RTtZQUN6RSxJQUFJLElBQWEsQ0FBQztZQUNsQixRQUFRLFNBQVMsRUFBRTtnQkFDbEI7b0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDWixNQUFNO2dCQUNQO29CQUNDLElBQUksR0FBRyxLQUFLLENBQUM7b0JBQ2IsTUFBTTtnQkFDUDtvQkFDQyxxRUFBcUU7b0JBQ3JFLGdFQUFnRTtvQkFDaEUsSUFBSSxhQUFhLEdBQUcsT0FBTyxLQUFLLENBQUMsRUFBRTt3QkFDbEMsT0FBTyxRQUFRLENBQUM7cUJBQ2hCO29CQUNELGlDQUFpQztvQkFDakMsSUFBSSxHQUFHLGFBQWEsR0FBRyxPQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2hELE1BQU07YUFDUDtZQUVELCtFQUErRTtZQUMvRSx1RkFBdUY7WUFDdkYsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsSUFBSSxtQkFBbUIsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDL0IsT0FBTyxDQUFDLENBQUMsQ0FBQztpQkFDVjtnQkFDRCxxRUFBcUU7Z0JBQ3JFLCtEQUErRDtnQkFDL0QsNkRBQTZEO2dCQUM3RCx1RUFBdUU7Z0JBQ3ZFLCtEQUErRDtnQkFDL0QsSUFBSSxvQkFBb0IsR0FBRyx3QkFBd0IsQ0FBQztnQkFDcEQsS0FBSyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFO29CQUN0RCxJQUFJLG9CQUFvQixLQUFLLHdCQUF3QixHQUFHLE9BQU8sRUFBRTt3QkFDaEUsNEJBQTRCO3dCQUM1QixPQUFPLG1CQUFtQixDQUFDO3FCQUMzQjtvQkFFRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxRQUFRLE1BQU0sRUFBRTt3QkFDZjs0QkFDQyxvQkFBb0IsSUFBSSxDQUFDLENBQUM7NEJBQzFCLE1BQU07d0JBQ1A7NEJBQ0Msb0JBQW9CLEdBQUcsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQzs0QkFDdEYsTUFBTTt3QkFDUDs0QkFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUNYO2lCQUNEO2dCQUNELElBQUksb0JBQW9CLEtBQUssd0JBQXdCLEdBQUcsT0FBTyxFQUFFO29CQUNoRSxPQUFPLG1CQUFtQixDQUFDO2lCQUMzQjtnQkFDRCwyQ0FBMkM7Z0JBQzNDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDVjtZQUVELHNCQUFzQjtZQUN0QixNQUFNLG1CQUFtQixHQUFHLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXBGLGtFQUFrRTtZQUNsRSxJQUFJLG9CQUFvQixHQUFHLGFBQWEsQ0FBQztZQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQyxJQUFJLG9CQUFvQixLQUFLLG1CQUFtQixFQUFFO29CQUNqRCxPQUFPLENBQUMsQ0FBQztpQkFDVDtnQkFFRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxRQUFRLE1BQU0sRUFBRTtvQkFDZjt3QkFDQyxvQkFBb0IsSUFBSSxDQUFDLENBQUM7d0JBQzFCLE1BQU07b0JBQ1A7d0JBQ0Msb0JBQW9CLEdBQUcsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDdEYsTUFBTTtvQkFDUDt3QkFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2lCQUNYO2FBQ0Q7WUFDRCwyRUFBMkU7WUFDM0UsSUFBSSxvQkFBb0IsS0FBSyxtQkFBbUIsRUFBRTtnQkFDakQsT0FBTyxVQUFVLENBQUM7YUFDbEI7WUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztLQUNEO0lBakpELDBEQWlKQyJ9