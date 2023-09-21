/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/editorColorRegistry", "vs/base/common/arrays", "vs/platform/theme/common/themeService", "vs/editor/common/core/selection", "vs/platform/theme/common/theme", "vs/css!./currentLineHighlight"], function (require, exports, dynamicViewOverlay_1, editorColorRegistry_1, arrays, themeService_1, selection_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pX = exports.$oX = exports.$nX = void 0;
    class $nX extends dynamicViewOverlay_1.$eX {
        constructor(context) {
            super();
            this.c = context;
            const options = this.c.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.g = options.get(66 /* EditorOption.lineHeight */);
            this.j = options.get(95 /* EditorOption.renderLineHighlight */);
            this.t = options.get(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */);
            this.m = layoutInfo.contentLeft;
            this.n = layoutInfo.contentWidth;
            this.r = true;
            this.u = false;
            this.w = [1];
            this.y = [new selection_1.$ms(1, 1, 1, 1)];
            this.z = null;
            this.c.addEventHandler(this);
        }
        dispose() {
            this.c.removeEventHandler(this);
            super.dispose();
        }
        C() {
            let hasChanged = false;
            const cursorsLineNumbers = this.y.map(s => s.positionLineNumber);
            cursorsLineNumbers.sort((a, b) => a - b);
            if (!arrays.$sb(this.w, cursorsLineNumbers)) {
                this.w = cursorsLineNumbers;
                hasChanged = true;
            }
            const selectionIsEmpty = this.y.every(s => s.isEmpty());
            if (this.r !== selectionIsEmpty) {
                this.r = selectionIsEmpty;
                hasChanged = true;
            }
            return hasChanged;
        }
        // --- begin event handlers
        onThemeChanged(e) {
            return this.C();
        }
        onConfigurationChanged(e) {
            const options = this.c.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.g = options.get(66 /* EditorOption.lineHeight */);
            this.j = options.get(95 /* EditorOption.renderLineHighlight */);
            this.t = options.get(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */);
            this.m = layoutInfo.contentLeft;
            this.n = layoutInfo.contentWidth;
            return true;
        }
        onCursorStateChanged(e) {
            this.y = e.selections;
            return this.C();
        }
        onFlushed(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollWidthChanged || e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        onFocusChanged(e) {
            if (!this.t) {
                return false;
            }
            this.u = e.isFocused;
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (!this.G()) {
                this.z = null;
                return;
            }
            const renderedLine = this.I(ctx);
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const len = this.w.length;
            let index = 0;
            const renderData = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                while (index < len && this.w[index] < lineNumber) {
                    index++;
                }
                if (index < len && this.w[index] === lineNumber) {
                    renderData[lineIndex] = renderedLine;
                }
                else {
                    renderData[lineIndex] = '';
                }
            }
            this.z = renderData;
        }
        render(startLineNumber, lineNumber) {
            if (!this.z) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex >= this.z.length) {
                return '';
            }
            return this.z[lineIndex];
        }
        D() {
            return ((this.j === 'gutter' || this.j === 'all')
                && (!this.t || this.u));
        }
        F() {
            return ((this.j === 'line' || this.j === 'all')
                && this.r
                && (!this.t || this.u));
        }
    }
    exports.$nX = $nX;
    class $oX extends $nX {
        I(ctx) {
            const className = 'current-line' + (this.H() ? ' current-line-both' : '');
            return `<div class="${className}" style="width:${Math.max(ctx.scrollWidth, this.n)}px; height:${this.g}px;"></div>`;
        }
        G() {
            return this.F();
        }
        H() {
            return this.D();
        }
    }
    exports.$oX = $oX;
    class $pX extends $nX {
        I(ctx) {
            const className = 'current-line' + (this.D() ? ' current-line-margin' : '') + (this.H() ? ' current-line-margin-both' : '');
            return `<div class="${className}" style="width:${this.m}px; height:${this.g}px;"></div>`;
        }
        G() {
            return true;
        }
        H() {
            return this.F();
        }
    }
    exports.$pX = $pX;
    (0, themeService_1.$mv)((theme, collector) => {
        const lineHighlight = theme.getColor(editorColorRegistry_1.$RA);
        if (lineHighlight) {
            collector.addRule(`.monaco-editor .view-overlays .current-line { background-color: ${lineHighlight}; }`);
            collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { background-color: ${lineHighlight}; border: none; }`);
        }
        if (!lineHighlight || lineHighlight.isTransparent() || theme.defines(editorColorRegistry_1.$SA)) {
            const lineHighlightBorder = theme.getColor(editorColorRegistry_1.$SA);
            if (lineHighlightBorder) {
                collector.addRule(`.monaco-editor .view-overlays .current-line { border: 2px solid ${lineHighlightBorder}; }`);
                collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { border: 2px solid ${lineHighlightBorder}; }`);
                if ((0, theme_1.$ev)(theme.type)) {
                    collector.addRule(`.monaco-editor .view-overlays .current-line { border-width: 1px; }`);
                    collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { border-width: 1px; }`);
                }
            }
        }
    });
});
//# sourceMappingURL=currentLineHighlight.js.map