/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/async", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/viewCursors/viewCursor", "vs/editor/common/config/editorOptions", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/platform/theme/common/theme", "vs/css!./viewCursors"], function (require, exports, fastDomNode_1, async_1, viewPart_1, viewCursor_1, editorOptions_1, editorColorRegistry_1, themeService_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PX = void 0;
    class $PX extends viewPart_1.$FW {
        static { this.BLINK_INTERVAL = 500; }
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            this.a = options.get(90 /* EditorOption.readOnly */);
            this.b = options.get(26 /* EditorOption.cursorBlinking */);
            this.c = options.get(28 /* EditorOption.cursorStyle */);
            this.g = options.get(27 /* EditorOption.cursorSmoothCaretAnimation */);
            this.j = true;
            this.m = false;
            this.n = false;
            this.z = new viewCursor_1.$1W(this._context);
            this.C = [];
            this.D = [];
            this.s = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.s.setAttribute('role', 'presentation');
            this.s.setAttribute('aria-hidden', 'true');
            this.I();
            this.s.appendChild(this.z.getDomNode());
            this.t = new async_1.$Qg();
            this.u = new async_1.$Rg();
            this.w = false;
            this.y = false;
            this.H();
        }
        dispose() {
            super.dispose();
            this.t.dispose();
            this.u.dispose();
        }
        getDomNode() {
            return this.s;
        }
        // --- begin event handlers
        onCompositionStart(e) {
            this.m = true;
            this.H();
            return true;
        }
        onCompositionEnd(e) {
            this.m = false;
            this.H();
            return true;
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this.a = options.get(90 /* EditorOption.readOnly */);
            this.b = options.get(26 /* EditorOption.cursorBlinking */);
            this.c = options.get(28 /* EditorOption.cursorStyle */);
            this.g = options.get(27 /* EditorOption.cursorSmoothCaretAnimation */);
            this.H();
            this.I();
            this.z.onConfigurationChanged(e);
            for (let i = 0, len = this.C.length; i < len; i++) {
                this.C[i].onConfigurationChanged(e);
            }
            return true;
        }
        F(position, secondaryPositions, reason) {
            const pauseAnimation = (this.C.length !== secondaryPositions.length
                || (this.g === 'explicit' && reason !== 3 /* CursorChangeReason.Explicit */));
            this.z.onCursorPositionChanged(position, pauseAnimation);
            this.H();
            if (this.C.length < secondaryPositions.length) {
                // Create new cursors
                const addCnt = secondaryPositions.length - this.C.length;
                for (let i = 0; i < addCnt; i++) {
                    const newCursor = new viewCursor_1.$1W(this._context);
                    this.s.domNode.insertBefore(newCursor.getDomNode().domNode, this.z.getDomNode().domNode.nextSibling);
                    this.C.push(newCursor);
                }
            }
            else if (this.C.length > secondaryPositions.length) {
                // Remove some cursors
                const removeCnt = this.C.length - secondaryPositions.length;
                for (let i = 0; i < removeCnt; i++) {
                    this.s.removeChild(this.C[0].getDomNode());
                    this.C.splice(0, 1);
                }
            }
            for (let i = 0; i < secondaryPositions.length; i++) {
                this.C[i].onCursorPositionChanged(secondaryPositions[i], pauseAnimation);
            }
        }
        onCursorStateChanged(e) {
            const positions = [];
            for (let i = 0, len = e.selections.length; i < len; i++) {
                positions[i] = e.selections[i].getPosition();
            }
            this.F(positions[0], positions.slice(1), e.reason);
            const selectionIsEmpty = e.selections[0].isEmpty();
            if (this.j !== selectionIsEmpty) {
                this.j = selectionIsEmpty;
                this.I();
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
            this.y = e.isFocused;
            this.H();
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
            if (shouldRender(this.z.getPosition())) {
                return true;
            }
            for (const secondaryCursor of this.C) {
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
        G() {
            if (this.m) {
                // avoid double cursors
                return 0 /* TextEditorCursorBlinkingStyle.Hidden */;
            }
            if (!this.y) {
                return 0 /* TextEditorCursorBlinkingStyle.Hidden */;
            }
            if (this.a) {
                return 5 /* TextEditorCursorBlinkingStyle.Solid */;
            }
            return this.b;
        }
        H() {
            this.t.cancel();
            this.u.cancel();
            const blinkingStyle = this.G();
            // hidden and solid are special as they involve no animations
            const isHidden = (blinkingStyle === 0 /* TextEditorCursorBlinkingStyle.Hidden */);
            const isSolid = (blinkingStyle === 5 /* TextEditorCursorBlinkingStyle.Solid */);
            if (isHidden) {
                this.M();
            }
            else {
                this.L();
            }
            this.w = false;
            this.I();
            if (!isHidden && !isSolid) {
                if (blinkingStyle === 1 /* TextEditorCursorBlinkingStyle.Blink */) {
                    // flat blinking is handled by JavaScript to save battery life due to Chromium step timing issue https://bugs.chromium.org/p/chromium/issues/detail?id=361587
                    this.u.cancelAndSet(() => {
                        if (this.n) {
                            this.M();
                        }
                        else {
                            this.L();
                        }
                    }, $PX.BLINK_INTERVAL);
                }
                else {
                    this.t.setIfNotSet(() => {
                        this.w = true;
                        this.I();
                    }, $PX.BLINK_INTERVAL);
                }
            }
        }
        // --- end blinking logic
        I() {
            this.s.setClassName(this.J());
        }
        J() {
            let result = 'cursors-layer';
            if (!this.j) {
                result += ' has-selection';
            }
            switch (this.c) {
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
            if (this.w) {
                switch (this.G()) {
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
            if (this.g === 'on' || this.g === 'explicit') {
                result += ' cursor-smooth-caret-animation';
            }
            return result;
        }
        L() {
            this.z.show();
            for (let i = 0, len = this.C.length; i < len; i++) {
                this.C[i].show();
            }
            this.n = true;
        }
        M() {
            this.z.hide();
            for (let i = 0, len = this.C.length; i < len; i++) {
                this.C[i].hide();
            }
            this.n = false;
        }
        // ---- IViewPart implementation
        prepareRender(ctx) {
            this.z.prepareRender(ctx);
            for (let i = 0, len = this.C.length; i < len; i++) {
                this.C[i].prepareRender(ctx);
            }
        }
        render(ctx) {
            const renderData = [];
            let renderDataLen = 0;
            const primaryRenderData = this.z.render(ctx);
            if (primaryRenderData) {
                renderData[renderDataLen++] = primaryRenderData;
            }
            for (let i = 0, len = this.C.length; i < len; i++) {
                const secondaryRenderData = this.C[i].render(ctx);
                if (secondaryRenderData) {
                    renderData[renderDataLen++] = secondaryRenderData;
                }
            }
            this.D = renderData;
        }
        getLastRenderData() {
            return this.D;
        }
    }
    exports.$PX = $PX;
    (0, themeService_1.$mv)((theme, collector) => {
        const caret = theme.getColor(editorColorRegistry_1.$XA);
        if (caret) {
            let caretBackground = theme.getColor(editorColorRegistry_1.$YA);
            if (!caretBackground) {
                caretBackground = caret.opposite();
            }
            collector.addRule(`.monaco-editor .cursors-layer .cursor { background-color: ${caret}; border-color: ${caret}; color: ${caretBackground}; }`);
            if ((0, theme_1.$ev)(theme.type)) {
                collector.addRule(`.monaco-editor .cursors-layer.has-selection .cursor { border-left: 1px solid ${caretBackground}; border-right: 1px solid ${caretBackground}; }`);
            }
        }
    });
});
//# sourceMappingURL=viewCursors.js.map