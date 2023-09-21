/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CursorColumns = void 0;
    /**
     * A column in a position is the gap between two adjacent characters. The methods here
     * work with a concept called "visible column". A visible column is a very rough approximation
     * of the horizontal screen position of a column. For example, using a tab size of 4:
     * ```txt
     * |<TAB>|<TAB>|T|ext
     * |     |     | \---- column = 4, visible column = 9
     * |     |     \------ column = 3, visible column = 8
     * |     \------------ column = 2, visible column = 4
     * \------------------ column = 1, visible column = 0
     * ```
     *
     * **NOTE**: Visual columns do not work well for RTL text or variable-width fonts or characters.
     *
     * **NOTE**: These methods work and make sense both on the model and on the view model.
     */
    class CursorColumns {
        static _nextVisibleColumn(codePoint, visibleColumn, tabSize) {
            if (codePoint === 9 /* CharCode.Tab */) {
                return CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
            }
            if (strings.isFullWidthCharacter(codePoint) || strings.isEmojiImprecise(codePoint)) {
                return visibleColumn + 2;
            }
            return visibleColumn + 1;
        }
        /**
         * Returns a visible column from a column.
         * @see {@link CursorColumns}
         */
        static visibleColumnFromColumn(lineContent, column, tabSize) {
            const textLen = Math.min(column - 1, lineContent.length);
            const text = lineContent.substring(0, textLen);
            const iterator = new strings.GraphemeIterator(text);
            let result = 0;
            while (!iterator.eol()) {
                const codePoint = strings.getNextCodePoint(text, textLen, iterator.offset);
                iterator.nextGraphemeLength();
                result = this._nextVisibleColumn(codePoint, result, tabSize);
            }
            return result;
        }
        /**
         * Returns the value to display as "Col" in the status bar.
         * @see {@link CursorColumns}
         */
        static toStatusbarColumn(lineContent, column, tabSize) {
            const text = lineContent.substring(0, Math.min(column - 1, lineContent.length));
            const iterator = new strings.CodePointIterator(text);
            let result = 0;
            while (!iterator.eol()) {
                const codePoint = iterator.nextCodePoint();
                if (codePoint === 9 /* CharCode.Tab */) {
                    result = CursorColumns.nextRenderTabStop(result, tabSize);
                }
                else {
                    result = result + 1;
                }
            }
            return result + 1;
        }
        /**
         * Returns a column from a visible column.
         * @see {@link CursorColumns}
         */
        static columnFromVisibleColumn(lineContent, visibleColumn, tabSize) {
            if (visibleColumn <= 0) {
                return 1;
            }
            const lineContentLength = lineContent.length;
            const iterator = new strings.GraphemeIterator(lineContent);
            let beforeVisibleColumn = 0;
            let beforeColumn = 1;
            while (!iterator.eol()) {
                const codePoint = strings.getNextCodePoint(lineContent, lineContentLength, iterator.offset);
                iterator.nextGraphemeLength();
                const afterVisibleColumn = this._nextVisibleColumn(codePoint, beforeVisibleColumn, tabSize);
                const afterColumn = iterator.offset + 1;
                if (afterVisibleColumn >= visibleColumn) {
                    const beforeDelta = visibleColumn - beforeVisibleColumn;
                    const afterDelta = afterVisibleColumn - visibleColumn;
                    if (afterDelta < beforeDelta) {
                        return afterColumn;
                    }
                    else {
                        return beforeColumn;
                    }
                }
                beforeVisibleColumn = afterVisibleColumn;
                beforeColumn = afterColumn;
            }
            // walked the entire string
            return lineContentLength + 1;
        }
        /**
         * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
         * @see {@link CursorColumns}
         */
        static nextRenderTabStop(visibleColumn, tabSize) {
            return visibleColumn + tabSize - visibleColumn % tabSize;
        }
        /**
         * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
         * @see {@link CursorColumns}
         */
        static nextIndentTabStop(visibleColumn, indentSize) {
            return visibleColumn + indentSize - visibleColumn % indentSize;
        }
        /**
         * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
         * @see {@link CursorColumns}
         */
        static prevRenderTabStop(column, tabSize) {
            return Math.max(0, column - 1 - (column - 1) % tabSize);
        }
        /**
         * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
         * @see {@link CursorColumns}
         */
        static prevIndentTabStop(column, indentSize) {
            return Math.max(0, column - 1 - (column - 1) % indentSize);
        }
    }
    exports.CursorColumns = CursorColumns;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yQ29sdW1ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29yZS9jdXJzb3JDb2x1bW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRzs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCxNQUFhLGFBQWE7UUFFakIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFNBQWlCLEVBQUUsYUFBcUIsRUFBRSxPQUFlO1lBQzFGLElBQUksU0FBUyx5QkFBaUIsRUFBRTtnQkFDL0IsT0FBTyxhQUFhLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQy9EO1lBQ0QsSUFBSSxPQUFPLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNuRixPQUFPLGFBQWEsR0FBRyxDQUFDLENBQUM7YUFDekI7WUFDRCxPQUFPLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxXQUFtQixFQUFFLE1BQWMsRUFBRSxPQUFlO1lBQ3pGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekQsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDdkIsTUFBTSxTQUFTLEdB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