/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Z = void 0;
    class $5Z extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.b = ++$5Z.a;
            this.f = this.B(new event_1.$fd());
            this.onDidDispose = this.f.event;
            // #endregion
        }
        static { this.a = 0; }
        getId() { return this.getEditorType() + ':v2:' + this.b; }
        // #region editorBrowser.IDiffEditor: Delegating to modified Editor
        getVisibleColumnFromPosition(position) {
            return this.g.getVisibleColumnFromPosition(position);
        }
        getStatusbarColumn(position) {
            return this.g.getStatusbarColumn(position);
        }
        getPosition() {
            return this.g.getPosition();
        }
        setPosition(position, source = 'api') {
            this.g.setPosition(position, source);
        }
        revealLine(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLine(lineNumber, scrollType);
        }
        revealLineInCenter(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLineInCenter(lineNumber, scrollType);
        }
        revealLineInCenterIfOutsideViewport(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLineInCenterIfOutsideViewport(lineNumber, scrollType);
        }
        revealLineNearTop(lineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLineNearTop(lineNumber, scrollType);
        }
        revealPosition(position, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealPosition(position, scrollType);
        }
        revealPositionInCenter(position, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealPositionInCenter(position, scrollType);
        }
        revealPositionInCenterIfOutsideViewport(position, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealPositionInCenterIfOutsideViewport(position, scrollType);
        }
        revealPositionNearTop(position, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealPositionNearTop(position, scrollType);
        }
        getSelection() {
            return this.g.getSelection();
        }
        getSelections() {
            return this.g.getSelections();
        }
        setSelection(something, source = 'api') {
            this.g.setSelection(something, source);
        }
        setSelections(ranges, source = 'api') {
            this.g.setSelections(ranges, source);
        }
        revealLines(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLines(startLineNumber, endLineNumber, scrollType);
        }
        revealLinesInCenter(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLinesInCenter(startLineNumber, endLineNumber, scrollType);
        }
        revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLinesInCenterIfOutsideViewport(startLineNumber, endLineNumber, scrollType);
        }
        revealLinesNearTop(startLineNumber, endLineNumber, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealLinesNearTop(startLineNumber, endLineNumber, scrollType);
        }
        revealRange(range, scrollType = 0 /* ScrollType.Smooth */, revealVerticalInCenter = false, revealHorizontal = true) {
            this.g.revealRange(range, scrollType, revealVerticalInCenter, revealHorizontal);
        }
        revealRangeInCenter(range, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealRangeInCenter(range, scrollType);
        }
        revealRangeInCenterIfOutsideViewport(range, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealRangeInCenterIfOutsideViewport(range, scrollType);
        }
        revealRangeNearTop(range, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealRangeNearTop(range, scrollType);
        }
        revealRangeNearTopIfOutsideViewport(range, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealRangeNearTopIfOutsideViewport(range, scrollType);
        }
        revealRangeAtTop(range, scrollType = 0 /* ScrollType.Smooth */) {
            this.g.revealRangeAtTop(range, scrollType);
        }
        getSupportedActions() {
            return this.g.getSupportedActions();
        }
        focus() {
            this.g.focus();
        }
        trigger(source, handlerId, payload) {
            this.g.trigger(source, handlerId, payload);
        }
        createDecorationsCollection(decorations) {
            return this.g.createDecorationsCollection(decorations);
        }
        changeDecorations(callback) {
            return this.g.changeDecorations(callback);
        }
    }
    exports.$5Z = $5Z;
});
//# sourceMappingURL=delegatingEditorImpl.js.map