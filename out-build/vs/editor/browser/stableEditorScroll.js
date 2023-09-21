/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TZ = void 0;
    class $TZ {
        static capture(editor) {
            if (editor.getScrollTop() === 0 || editor.hasPendingScrollAnimation()) {
                // Never mess with the scroll top if the editor is at the top of the file or if there is a pending scroll animation
                return new $TZ(editor.getScrollTop(), editor.getContentHeight(), null, 0, null);
            }
            let visiblePosition = null;
            let visiblePositionScrollDelta = 0;
            const visibleRanges = editor.getVisibleRanges();
            if (visibleRanges.length > 0) {
                visiblePosition = visibleRanges[0].getStartPosition();
                const visiblePositionScrollTop = editor.getTopForPosition(visiblePosition.lineNumber, visiblePosition.column);
                visiblePositionScrollDelta = editor.getScrollTop() - visiblePositionScrollTop;
            }
            return new $TZ(editor.getScrollTop(), editor.getContentHeight(), visiblePosition, visiblePositionScrollDelta, editor.getPosition());
        }
        constructor(a, b, c, d, e) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
        }
        restore(editor) {
            if (this.b === editor.getContentHeight() && this.a === editor.getScrollTop()) {
                // The editor's content height and scroll top haven't changed, so we don't need to do anything
                return;
            }
            if (this.c) {
                const visiblePositionScrollTop = editor.getTopForPosition(this.c.lineNumber, this.c.column);
                editor.setScrollTop(visiblePositionScrollTop + this.d);
            }
        }
        restoreRelativeVerticalPositionOfCursor(editor) {
            if (this.b === editor.getContentHeight() && this.a === editor.getScrollTop()) {
                // The editor's content height and scroll top haven't changed, so we don't need to do anything
                return;
            }
            const currentCursorPosition = editor.getPosition();
            if (!this.e || !currentCursorPosition) {
                return;
            }
            const offset = editor.getTopForLineNumber(currentCursorPosition.lineNumber) - editor.getTopForLineNumber(this.e.lineNumber);
            editor.setScrollTop(editor.getScrollTop() + offset);
        }
    }
    exports.$TZ = $TZ;
});
//# sourceMappingURL=stableEditorScroll.js.map