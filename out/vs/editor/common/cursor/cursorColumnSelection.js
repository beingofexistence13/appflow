/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/cursorCommon", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, cursorCommon_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColumnSelection = void 0;
    class ColumnSelection {
        static columnSelect(config, model, fromLineNumber, fromVisibleColumn, toLineNumber, toVisibleColumn) {
            const lineCount = Math.abs(toLineNumber - fromLineNumber) + 1;
            const reversed = (fromLineNumber > toLineNumber);
            const isRTL = (fromVisibleColumn > toVisibleColumn);
            const isLTR = (fromVisibleColumn < toVisibleColumn);
            const result = [];
            // console.log(`fromVisibleColumn: ${fromVisibleColumn}, toVisibleColumn: ${toVisibleColumn}`);
            for (let i = 0; i < lineCount; i++) {
                const lineNumber = fromLineNumber + (reversed ? -i : i);
                const startColumn = config.columnFromVisibleColumn(model, lineNumber, fromVisibleColumn);
                const endColumn = config.columnFromVisibleColumn(model, lineNumber, toVisibleColumn);
                const visibleStartColumn = config.visibleColumnFromColumn(model, new position_1.Position(lineNumber, startColumn));
                const visibleEndColumn = config.visibleColumnFromColumn(model, new position_1.Position(lineNumber, endColumn));
                // console.log(`lineNumber: ${lineNumber}: visibleStartColumn: ${visibleStartColumn}, visibleEndColumn: ${visibleEndColumn}`);
                if (isLTR) {
                    if (visibleStartColumn > toVisibleColumn) {
                        continue;
                    }
                    if (visibleEndColumn < fromVisibleColumn) {
                        continue;
                    }
                }
                if (isRTL) {
                    if (visibleEndColumn > fromVisibleColumn) {
                        continue;
                    }
                    if (visibleStartColumn < toVisibleColumn) {
                        continue;
                    }
                }
                result.push(new cursorCommon_1.SingleCursorState(new range_1.Range(lineNumber, startColumn, lineNumber, startColumn), 0 /* SelectionStartKind.Simple */, 0, new position_1.Position(lineNumber, endColumn), 0));
            }
            if (result.length === 0) {
                // We are after all the lines, so add cursor at the end of each line
                for (let i = 0; i < lineCount; i++) {
                    const lineNumber = fromLineNumber + (reversed ? -i : i);
                    const maxColumn = model.getLineMaxColumn(lineNumber);
                    result.push(new cursorCommon_1.SingleCursorState(new range_1.Range(lineNumber, maxColumn, lineNumber, maxColumn), 0 /* SelectionStartKind.Simple */, 0, new position_1.Position(lineNumber, maxColumn), 0));
                }
            }
            return {
                viewStates: result,
                reversed: reversed,
                fromLineNumber: fromLineNumber,
                fromVisualColumn: fromVisibleColumn,
                toLineNumber: toLineNumber,
                toVisualColumn: toVisibleColumn
            };
        }
        static columnSelectLeft(config, model, prevColumnSelectData) {
            let toViewVisualColumn = prevColumnSelectData.toViewVisualColumn;
            if (toViewVisualColumn > 0) {
                toViewVisualColumn--;
            }
            return ColumnSelection.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, prevColumnSelectData.toViewLineNumber, toViewVisualColumn);
        }
        static columnSelectRight(config, model, prevColumnSelectData) {
            let maxVisualViewColumn = 0;
            const minViewLineNumber = Math.min(prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.toViewLineNumber);
            const maxViewLineNumber = Math.max(prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.toViewLineNumber);
            for (let lineNumber = minViewLineNumber; lineNumber <= maxViewLineNumber; lineNumber++) {
                const lineMaxViewColumn = model.getLineMaxColumn(lineNumber);
                const lineMaxVisualViewColumn = config.visibleColumnFromColumn(model, new position_1.Position(lineNumber, lineMaxViewColumn));
                maxVisualViewColumn = Math.max(maxVisualViewColumn, lineMaxVisualViewColumn);
            }
            let toViewVisualColumn = prevColumnSelectData.toViewVisualColumn;
            if (toViewVisualColumn < maxVisualViewColumn) {
                toViewVisualColumn++;
            }
            return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, prevColumnSelectData.toViewLineNumber, toViewVisualColumn);
        }
        static columnSelectUp(config, model, prevColumnSelectData, isPaged) {
            const linesCount = isPaged ? config.pageSize : 1;
            const toViewLineNumber = Math.max(1, prevColumnSelectData.toViewLineNumber - linesCount);
            return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, toViewLineNumber, prevColumnSelectData.toViewVisualColumn);
        }
        static columnSelectDown(config, model, prevColumnSelectData, isPaged) {
            const linesCount = isPaged ? config.pageSize : 1;
            const toViewLineNumber = Math.min(model.getLineCount(), prevColumnSelectData.toViewLineNumber + linesCount);
            return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, toViewLineNumber, prevColumnSelectData.toViewVisualColumn);
        }
    }
    exports.ColumnSelection = ColumnSelection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yQ29sdW1uU2VsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jdXJzb3IvY3Vyc29yQ29sdW1uU2VsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLGVBQWU7UUFFcEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUEyQixFQUFFLEtBQXlCLEVBQUUsY0FBc0IsRUFBRSxpQkFBeUIsRUFBRSxZQUFvQixFQUFFLGVBQXVCO1lBQ2xMLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5RCxNQUFNLFFBQVEsR0FBRyxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUNqRCxNQUFNLEtBQUssR0FBRyxDQUFDLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sS0FBSyxHQUFHLENBQUMsaUJBQWlCLEdBQUcsZUFBZSxDQUFDLENBQUM7WUFFcEQsTUFBTSxNQUFNLEdBQXdCLEVBQUUsQ0FBQztZQUV2QywrRkFBK0Y7WUFFL0YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSxVQUFVLEdBQUcsY0FBYyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXhELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3pGLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FB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