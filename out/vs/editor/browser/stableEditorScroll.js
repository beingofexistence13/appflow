/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StableEditorScrollState = void 0;
    class StableEditorScrollState {
        static capture(editor) {
            if (editor.getScrollTop() === 0 || editor.hasPendingScrollAnimation()) {
                // Never mess with the scroll top if the editor is at the top of the file or if there is a pending scroll animation
                return new StableEditorScrollState(editor.getScrollTop(), editor.getContentHeight(), null, 0, null);
            }
            let visiblePosition = null;
            let visiblePositionScrollDelta = 0;
            const visibleRanges = editor.getVisibleRanges();
            if (visibleRanges.length > 0) {
                visiblePosition = visibleRanges[0].getStartPosition();
                const visiblePositionScrollTop = editor.getTopForPosition(visiblePosition.lineNumber, visiblePosition.column);
                visiblePositionScrollDelta = editor.getScrollTop() - visiblePositionScrollTop;
            }
            return new StableEditorScrollState(editor.getScrollTop(), editor.getContentHeight(), visiblePosition, visiblePositionScrollDelta, editor.getPosition());
        }
        constructor(_initialScrollTop, _initialContentHeight, _visiblePosition, _visiblePositionScrollDelta, _cursorPosition) {
            this._initialScrollTop = _initialScrollTop;
            this._initialContentHeight = _initialContentHeight;
            this._visiblePosition = _visiblePosition;
            this._visiblePositionScrollDelta = _visiblePositionScrollDelta;
            this._cursorPosition = _cursorPosition;
        }
        restore(editor) {
            if (this._initialContentHeight === editor.getContentHeight() && this._initialScrollTop === editor.getScrollTop()) {
                // The editor's content height and scroll top haven't changed, so we don't need to do anything
                return;
            }
            if (this._visiblePosition) {
                const visiblePositionScrollTop = editor.getTopForPosition(this._visiblePosition.lineNumber, this._visiblePosition.column);
                editor.setScrollTop(visiblePositionScrollTop + this._visiblePositionScrollDelta);
            }
        }
        restoreRelativeVerticalPositionOfCursor(editor) {
            if (this._initialContentHeight === editor.getContentHeight() && this._initialScrollTop === editor.getScrollTop()) {
                // The editor's content height and scroll top haven't changed, so we don't need to do anything
                return;
            }
            const currentCursorPosition = editor.getPosition();
            if (!this._cursorPosition || !currentCursorPosition) {
                return;
            }
            const offset = editor.getTopForLineNumber(currentCursorPosition.lineNumber) - editor.getTopForLineNumber(this._cursorPosition.lineNumber);
            editor.setScrollTop(editor.getScrollTop() + offset);
        }
    }
    exports.StableEditorScrollState = StableEditorScrollState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhYmxlRWRpdG9yU2Nyb2xsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvc3RhYmxlRWRpdG9yU2Nyb2xsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFhLHVCQUF1QjtRQUU1QixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQW1CO1lBQ3hDLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMseUJBQXlCLEVBQUUsRUFBRTtnQkFDdEUsbUhBQW1IO2dCQUNuSCxPQUFPLElBQUksdUJBQXVCLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDcEc7WUFFRCxJQUFJLGVBQWUsR0FBb0IsSUFBSSxDQUFDO1lBQzVDLElBQUksMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hELElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLGVBQWUsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDdEQsTUFBTSx3QkFBd0IsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlHLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsR0FBRyx3QkFBd0IsQ0FBQzthQUM5RTtZQUNELE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsZUFBZSxFQUFFLDBCQUEwQixFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3pKLENBQUM7UUFFRCxZQUNrQixpQkFBeUIsRUFDekIscUJBQTZCLEVBQzdCLGdCQUFpQyxFQUNqQywyQkFBbUMsRUFDbkMsZUFBZ0M7WUFKaEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFRO1lBQ3pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBUTtZQUM3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1lBQ2pDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBUTtZQUNuQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFFbEQsQ0FBQztRQUVNLE9BQU8sQ0FBQyxNQUFtQjtZQUNqQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUNqSCw4RkFBOEY7Z0JBQzlGLE9BQU87YUFDUDtZQUVELElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUMxQixNQUFNLHdCQUF3QixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUgsTUFBTSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQzthQUNqRjtRQUNGLENBQUM7UUFFTSx1Q0FBdUMsQ0FBQyxNQUFtQjtZQUNqRSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUNqSCw4RkFBOEY7Z0JBQzlGLE9BQU87YUFDUDtZQUVELE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRW5ELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3BELE9BQU87YUFDUDtZQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxSSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQ0Q7SUF2REQsMERBdURDIn0=