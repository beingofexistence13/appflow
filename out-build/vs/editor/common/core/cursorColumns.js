/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mt = void 0;
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
    class $mt {
        static a(codePoint, visibleColumn, tabSize) {
            if (codePoint === 9 /* CharCode.Tab */) {
                return $mt.nextRenderTabStop(visibleColumn, tabSize);
            }
            if (strings.$5e(codePoint) || strings.$6e(codePoint)) {
                return visibleColumn + 2;
            }
            return visibleColumn + 1;
        }
        /**
         * Returns a visible column from a column.
         * @see {@link $mt}
         */
        static visibleColumnFromColumn(lineContent, column, tabSize) {
            const textLen = Math.min(column - 1, lineContent.length);
            const text = lineContent.substring(0, textLen);
            const iterator = new strings.$Ve(text);
            let result = 0;
            while (!iterator.eol()) {
                const codePoint = strings.$Te(text, textLen, iterator.offset);
                iterator.nextGraphemeLength();
                result = this.a(codePoint, result, tabSize);
            }
            return result;
        }
        /**
         * Returns the value to display as "Col" in the status bar.
         * @see {@link $mt}
         */
        static toStatusbarColumn(lineContent, column, tabSize) {
            const text = lineContent.substring(0, Math.min(column - 1, lineContent.length));
            const iterator = new strings.$Ue(text);
            let result = 0;
            while (!iterator.eol()) {
                const codePoint = iterator.nextCodePoint();
                if (codePoint === 9 /* CharCode.Tab */) {
                    result = $mt.nextRenderTabStop(result, tabSize);
                }
                else {
                    result = result + 1;
                }
            }
            return result + 1;
        }
        /**
         * Returns a column from a visible column.
         * @see {@link $mt}
         */
        static columnFromVisibleColumn(lineContent, visibleColumn, tabSize) {
            if (visibleColumn <= 0) {
                return 1;
            }
            const lineContentLength = lineContent.length;
            const iterator = new strings.$Ve(lineContent);
            let beforeVisibleColumn = 0;
            let beforeColumn = 1;
            while (!iterator.eol()) {
                const codePoint = strings.$Te(lineContent, lineContentLength, iterator.offset);
                iterator.nextGraphemeLength();
                const afterVisibleColumn = this.a(codePoint, beforeVisibleColumn, tabSize);
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
         * @see {@link $mt}
         */
        static nextRenderTabStop(visibleColumn, tabSize) {
            return visibleColumn + tabSize - visibleColumn % tabSize;
        }
        /**
         * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
         * @see {@link $mt}
         */
        static nextIndentTabStop(visibleColumn, indentSize) {
            return visibleColumn + indentSize - visibleColumn % indentSize;
        }
        /**
         * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
         * @see {@link $mt}
         */
        static prevRenderTabStop(column, tabSize) {
            return Math.max(0, column - 1 - (column - 1) % tabSize);
        }
        /**
         * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
         * @see {@link $mt}
         */
        static prevIndentTabStop(column, indentSize) {
            return Math.max(0, column - 1 - (column - 1) % indentSize);
        }
    }
    exports.$mt = $mt;
});
//# sourceMappingURL=cursorColumns.js.map