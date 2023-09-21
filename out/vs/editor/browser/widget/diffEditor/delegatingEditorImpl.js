/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DelegatingEditor = void 0;
    class DelegatingEditor extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._id = ++DelegatingEditor.idCounter;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            // #endregion
        }
        static { this.idCounter = 0; }
        getId() { return this.getEditorType() + ':v2:' + this._id; }
        // #region editorBrowser.IDiffEditor: Delegating to modified Editor
        getVisibleColumnFromPosition(position) {
            return this._targetEditor.getVisibleColumnFromPosition(position);
        }
        getStatusbarColumn(position) {
            return this._targetEditor.getStatusbarColumn(position);
        }
        getPosition() {
            return this._targetEditor.getPosition();
        }
        setPosition(position, source = 'api') {
            this._targetEditor.setPosition(position, source);
        }
        revealLine(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLine(lineNumber, scrollType);
        }
        revealLineInCenter(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLineInCenter(lineNumber, scrollType);
        }
        revealLineInCenterIfOutsideViewport(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLineInCenterIfOutsideViewport(lineNumber, scrollType);
        }
        revealLineNearTop(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLineNearTop(lineNumber, scrollType);
        }
        revealPosition(position, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealPosition(position, scrollType);
        }
        revealPositionInCenter(position, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealPositionInCenter(position, scrollType);
        }
        revealPositionInCenterIfOutsideViewport(position, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealPositionInCenterIfOutsideViewport(position, scrollType);
        }
        revealPositionNearTop(position, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealPositionNearTop(position, scrollType);
        }
        getSelection() {
            return this._targetEditor.getSelection();
        }
        getSelections() {
            return this._targetEditor.getSelections();
        }
        setSelection(something, source = 'api') {
            this._targetEditor.setSelection(something, source);
        }
        setSelections(ranges, source = 'api') {
            this._targetEditor.setSelections(ranges, source);
        }
        revealLines(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLines(startLineNumber, endLineNumber, scrollType);
        }
        revealLinesInCenter(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLinesInCenter(startLineNumber, endLineNumber, scrollType);
        }
        revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType);
        }
        revealLinesNearTop(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealLinesNearTop(startLineNumber, endLineNumber, scrollType);
        }
        revealRange(range, scrollType = 0 /* ScrollType.Smooth */, revealVerticalInCenter = false, revealHorizontal = true) {
            this._targetEditor.revealRange(range, scrollType, revealVerticalInCenter, revealHorizontal);
        }
        revealRangeInCenter(range, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealRangeInCenter(range, scrollType);
        }
        revealRangeInCenterIfOutsideViewport(range, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealRangeInCenterIfOutsideViewport(range, scrollType);
        }
        revealRangeNearTop(range, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealRangeNearTop(range, scrollType);
        }
        revealRangeNearTopIfOutsideViewport(range, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealRangeNearTopIfOutsideViewport(range, scrollType);
        }
        revealRangeAtTop(range, scrollType = 0 /* ScrollType.Smooth */) {
            this._targetEditor.revealRangeAtTop(range, scrollType);
        }
        getSupportedActions() {
            return this._targetEditor.getSupportedActions();
        }
        focus() {
            this._targetEditor.focus();
        }
        trigger(source, handlerId, payload) {
            this._targetEditor.trigger(source, handlerId, payload);
        }
        createDecorationsCollection(decorations) {
            return this._targetEditor.createDecorationsCollection(decorations);
        }
        changeDecorations(callback) {
            return this._targetEditor.changeDecorations(callback);
        }
    }
    exports.DelegatingEditor = DelegatingEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZWdhdGluZ0VkaXRvckltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9kZWxlZ2F0aW5nRWRpdG9ySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBc0IsZ0JBQWlCLFNBQVEsc0JBQVU7UUFBekQ7O1lBRWtCLFFBQUcsR0FBRyxFQUFFLGdCQUFnQixDQUFDLFNBQVMsQ0FBQztZQUVuQyxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3JELGlCQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFtSnhELGFBQWE7UUFDZCxDQUFDO2lCQXhKZSxjQUFTLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFRN0IsS0FBSyxLQUFhLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQWFwRSxtRUFBbUU7UUFFNUQsNEJBQTRCLENBQUMsUUFBbUI7WUFDdEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxRQUFtQjtZQUM1QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxXQUFXLENBQUMsUUFBbUIsRUFBRSxTQUFpQixLQUFLO1lBQzdELElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztR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