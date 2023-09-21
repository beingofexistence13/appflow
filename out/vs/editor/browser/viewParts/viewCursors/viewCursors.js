/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/async", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/viewCursors/viewCursor", "vs/editor/common/config/editorOptions", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/platform/theme/common/theme", "vs/css!./viewCursors"], function (require, exports, fastDomNode_1, async_1, viewPart_1, viewCursor_1, editorOptions_1, editorColorRegistry_1, themeService_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewCursors = void 0;
    class ViewCursors extends viewPart_1.ViewPart {
        static { this.BLINK_INTERVAL = 500; }
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            this._readOnly = options.get(90 /* EditorOption.readOnly */);
            this._cursorBlinking = options.get(26 /* EditorOption.cursorBlinking */);
            this._cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
            this._cursorSmoothCaretAnimation = options.get(27 /* EditorOption.cursorSmoothCaretAnimation */);
            this._selectionIsEmpty = true;
            this._isComposingInput = false;
            this._isVisible = false;
            this._primaryCursor = new viewCursor_1.ViewCursor(this._context);
            this._secondaryCursors = [];
            this._renderData = [];
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._updateDomClassName();
            this._domNode.appendChild(this._primaryCursor.getDomNode());
            this._startCursorBlinkAnimation = new async_1.TimeoutTimer();
            this._cursorFlatBlinkInterval = new async_1.IntervalTimer();
            this._blinkingEnabled = false;
            this._editorHasFocus = false;
            this._updateBlinking();
        }
        dispose() {
            super.dispose();
            this._startCursorBlinkAnimation.dispose();
            this._cursorFlatBlinkInterval.dispose();
        }
        getDomNode() {
            return this._domNode;
        }
        // --- begin event handlers
        onCompositionStart(e) {
            this._isComposingInput = true;
            this._updateBlinking();
            return true;
        }
        onCompositionEnd(e) {
            this._isComposingInput = false;
            this._updateBlinking();
            return true;
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this._readOnly = options.get(90 /* EditorOption.readOnly */);
            this._cursorBlinking = options.get(26 /* EditorOption.cursorBlinking */);
            this._cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
            this._cursorSmoothCaretAnimation = options.get(27 /* EditorOption.cursorSmoothCaretAnimation */);
            this._updateBlinking();
            this._updateDomClassName();
            this._primaryCursor.onConfigurationChanged(e);
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].onConfigurationChanged(e);
            }
            return true;
        }
        _onCursorPositionChanged(position, secondaryPositions, reason) {
            const pauseAnimation = (this._secondaryCursors.length !== secondaryPositions.length
                || (this._cursorSmoothCaretAnimation === 'explicit' && reason !== 3 /* CursorChangeReason.Explicit */));
            this._primaryCursor.onCursorPositionChanged(position, pauseAnimation);
            this._updateBlinking();
            if (this._secondaryCursors.length < secondaryPositions.length) {
                // Create new cursors
                const addCnt = secondaryPositions.length - this._secondaryCursors.length;
                for (let i = 0; i < addCnt; i++) {
                    const newCursor = new viewCursor_1.ViewCursor(this._context);
                    this._domNode.domNode.insertBefore(newCursor.getDomNode().domNode, this._primaryCursor.getDomNode().domNode.nextSibling);
                    this._secondaryCursors.push(newCursor);
                }
            }
            else if (this._secondaryCursors.length > secondaryPositions.length) {
                // Remove some cursors
                const removeCnt = this._secondaryCursors.length - secondaryPositions.length;
                for (let i = 0; i < removeCnt; i++) {
                    this._domNode.removeChild(this._secondaryCursors[0].getDomNode());
                    this._secondaryCursors.splice(0, 1);
                }
            }
            for (let i = 0; i < secondaryPositions.length; i++) {
                this._secondaryCursors[i].onCursorPositionChanged(secondaryPositions[i], pauseAnimation);
            }
        }
        onCursorStateChanged(e) {
            const positions = [];
            for (let i = 0, len = e.selections.length; i < len; i++) {
                positions[i] = e.selections[i].getPosition();
            }
            this._onCursorPositionChanged(positions[0], positions.slice(1), e.reason);
            const selectionIsEmpty = e.selections[0].isEmpty();
            if (this._selectionIsEmpty !== selectionIsEmpty) {
                this._selectionIsEmpty = selectionIsEmpty;
                this._updateDomClassName();
            }
            return true;
        }
        onDecorationsChanged(e) {
            // true for inline decorations that can end up relayouting text
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onFocusChanged(e) {
            this._editorHasFocus = e.isFocused;
            this._updateBlinking();
            return false;
        }
        onLinesChanged(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return true;
        }
        onTokensChanged(e) {
            const shouldRender = (position) => {
                for (let i = 0, len = e.ranges.length; i < len; i++) {
                    if (e.ranges[i].fromLineNumber <= position.lineNumber && position.lineNumber <= e.ranges[i].toLineNumber) {
                        return true;
                    }
                }
                return false;
            };
            if (shouldRender(this._primaryCursor.getPosition())) {
                return true;
            }
            for (const secondaryCursor of this._secondaryCursors) {
                if (shouldRender(secondaryCursor.getPosition())) {
                    return true;
                }
            }
            return false;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        // ---- blinking logic
        _getCursorBlinking() {
            if (this._isComposingInput) {
                // avoid double cursors
                return 0 /* TextEditorCursorBlinkingStyle.Hidden */;
            }
            if (!this._editorHasFocus) {
                return 0 /* TextEditorCursorBlinkingStyle.Hidden */;
            }
            if (this._readOnly) {
                return 5 /* TextEditorCursorBlinkingStyle.Solid */;
            }
            return this._cursorBlinking;
        }
        _updateBlinking() {
            this._startCursorBlinkAnimation.cancel();
            this._cursorFlatBlinkInterval.cancel();
            const blinkingStyle = this._getCursorBlinking();
            // hidden and solid are special as they involve no animations
            const isHidden = (blinkingStyle === 0 /* TextEditorCursorBlinkingStyle.Hidden */);
            const isSolid = (blinkingStyle === 5 /* TextEditorCursorBlinkingStyle.Solid */);
            if (isHidden) {
                this._hide();
            }
            else {
                this._show();
            }
            this._blinkingEnabled = false;
            this._updateDomClassName();
            if (!isHidden && !isSolid) {
                if (blinkingStyle === 1 /* TextEditorCursorBlinkingStyle.Blink */) {
                    // flat blinking is handled by JavaScript to save battery life due to Chromium step timing issue https://bugs.chromium.org/p/chromium/issues/detail?id=361587
                    this._cursorFlatBlinkInterval.cancelAndSet(() => {
                        if (this._isVisible) {
                            this._hide();
                        }
                        else {
                            this._show();
                        }
                    }, ViewCursors.BLINK_INTERVAL);
                }
                else {
                    this._startCursorBlinkAnimation.setIfNotSet(() => {
                        this._blinkingEnabled = true;
                        this._updateDomClassName();
                    }, ViewCursors.BLINK_INTERVAL);
                }
            }
        }
        // --- end blinking logic
        _updateDomClassName() {
            this._domNode.setClassName(this._getClassName());
        }
        _getClassName() {
            let result = 'cursors-layer';
            if (!this._selectionIsEmpty) {
                result += ' has-selection';
            }
            switch (this._cursorStyle) {
                case editorOptions_1.TextEditorCursorStyle.Line:
                    result += ' cursor-line-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.Block:
                    result += ' cursor-block-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.Underline:
                    result += ' cursor-underline-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.LineThin:
                    result += ' cursor-line-thin-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.BlockOutline:
                    result += ' cursor-block-outline-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.UnderlineThin:
                    result += ' cursor-underline-thin-style';
                    break;
                default:
                    result += ' cursor-line-style';
            }
            if (this._blinkingEnabled) {
                switch (this._getCursorBlinking()) {
                    case 1 /* TextEditorCursorBlinkingStyle.Blink */:
                        result += ' cursor-blink';
                        break;
                    case 2 /* TextEditorCursorBlinkingStyle.Smooth */:
                        result += ' cursor-smooth';
                        break;
                    case 3 /* TextEditorCursorBlinkingStyle.Phase */:
                        result += ' cursor-phase';
                        break;
                    case 4 /* TextEditorCursorBlinkingStyle.Expand */:
                        result += ' cursor-expand';
                        break;
                    case 5 /* TextEditorCursorBlinkingStyle.Solid */:
                        result += ' cursor-solid';
                        break;
                    default:
                        result += ' cursor-solid';
                }
            }
            else {
                result += ' cursor-solid';
            }
            if (this._cursorSmoothCaretAnimation === 'on' || this._cursorSmoothCaretAnimation === 'explicit') {
                result += ' cursor-smooth-caret-animation';
            }
            return result;
        }
        _show() {
            this._primaryCursor.show();
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].show();
            }
            this._isVisible = true;
        }
        _hide() {
            this._primaryCursor.hide();
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].hide();
            }
            this._isVisible = false;
        }
        // ---- IViewPart implementation
        prepareRender(ctx) {
            this._primaryCursor.prepareRender(ctx);
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].prepareRender(ctx);
            }
        }
        render(ctx) {
            const renderData = [];
            let renderDataLen = 0;
            const primaryRenderData = this._primaryCursor.render(ctx);
            if (primaryRenderData) {
                renderData[renderDataLen++] = primaryRenderData;
            }
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                const secondaryRenderData = this._secondaryCursors[i].render(ctx);
                if (secondaryRenderData) {
                    renderData[renderDataLen++] = secondaryRenderData;
                }
            }
            this._renderData = renderData;
        }
        getLastRenderData() {
            return this._renderData;
        }
    }
    exports.ViewCursors = ViewCursors;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const caret = theme.getColor(editorColorRegistry_1.editorCursorForeground);
        if (caret) {
            let caretBackground = theme.getColor(editorColorRegistry_1.editorCursorBackground);
            if (!caretBackground) {
                caretBackground = caret.opposite();
            }
            collector.addRule(`.monaco-editor .cursors-layer .cursor { background-color: ${caret}; border-color: ${caret}; color: ${caretBackground}; }`);
            if ((0, theme_1.isHighContrast)(theme.type)) {
                collector.addRule(`.monaco-editor .cursors-layer.has-selection .cursor { border-left: 1px solid ${caretBackground}; border-right: 1px solid ${caretBackground}; }`);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0N1cnNvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvdmlld0N1cnNvcnMvdmlld0N1cnNvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFhLFdBQVksU0FBUSxtQkFBUTtpQkFFeEIsbUJBQWMsR0FBRyxHQUFHLENBQUM7UUF1QnJDLFlBQVksT0FBb0I7WUFDL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsZ0NBQXVCLENBQUM7WUFDcEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxzQ0FBNkIsQ0FBQztZQUNoRSxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUEwQixDQUFDO1lBQzFELElBQUksQ0FBQywyQkFBMkIsR0FBRyxPQUFPLENBQUMsR0FBRyxrREFBeUMsQ0FBQztZQUN4RixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBQzlCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFFL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFFeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLHVCQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFFdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLCtCQUFpQixFQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENB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