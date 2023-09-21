/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/position", "vs/platform/theme/common/themeService", "vs/editor/common/core/editorColorRegistry", "vs/css!./lineNumbers"], function (require, exports, platform, dynamicViewOverlay_1, position_1, themeService_1, editorColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fX = void 0;
    class $fX extends dynamicViewOverlay_1.$eX {
        static { this.CLASS_NAME = 'line-numbers'; }
        constructor(context) {
            super();
            this.a = context;
            this.u();
            this.r = new position_1.$js(1, 1);
            this.s = null;
            this.t = 1;
            this.a.addEventHandler(this);
        }
        u() {
            const options = this.a.configuration.options;
            this.b = options.get(66 /* EditorOption.lineHeight */);
            const lineNumbers = options.get(67 /* EditorOption.lineNumbers */);
            this.c = lineNumbers.renderType;
            this.g = lineNumbers.renderFn;
            this.j = options.get(94 /* EditorOption.renderFinalNewline */);
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.m = layoutInfo.lineNumbersLeft;
            this.n = layoutInfo.lineNumbersWidth;
        }
        dispose() {
            this.a.removeEventHandler(this);
            this.s = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            this.u();
            return true;
        }
        onCursorStateChanged(e) {
            const primaryViewPosition = e.selections[0].getPosition();
            this.r = this.a.viewModel.coordinatesConverter.convertViewPositionToModelPosition(primaryViewPosition);
            let shouldRender = false;
            if (this.t !== primaryViewPosition.lineNumber) {
                this.t = primaryViewPosition.lineNumber;
                shouldRender = true;
            }
            if (this.c === 2 /* RenderLineNumbersType.Relative */ || this.c === 3 /* RenderLineNumbersType.Interval */) {
                shouldRender = true;
            }
            return shouldRender;
        }
        onFlushed(e) {
            return true;
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
            return e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        w(viewLineNumber) {
            const modelPosition = this.a.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.$js(viewLineNumber, 1));
            if (modelPosition.column !== 1) {
                return '';
            }
            const modelLineNumber = modelPosition.lineNumber;
            if (this.g) {
                return this.g(modelLineNumber);
            }
            if (this.c === 2 /* RenderLineNumbersType.Relative */) {
                const diff = Math.abs(this.r.lineNumber - modelLineNumber);
                if (diff === 0) {
                    return '<span class="relative-current-line-number">' + modelLineNumber + '</span>';
                }
                return String(diff);
            }
            if (this.c === 3 /* RenderLineNumbersType.Interval */) {
                if (this.r.lineNumber === modelLineNumber) {
                    return String(modelLineNumber);
                }
                if (modelLineNumber % 10 === 0) {
                    return String(modelLineNumber);
                }
                return '';
            }
            return String(modelLineNumber);
        }
        prepareRender(ctx) {
            if (this.c === 0 /* RenderLineNumbersType.Off */) {
                this.s = null;
                return;
            }
            const lineHeightClassName = (platform.$k ? (this.b % 2 === 0 ? ' lh-even' : ' lh-odd') : '');
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const lineCount = this.a.viewModel.getLineCount();
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                const renderLineNumber = this.w(lineNumber);
                if (!renderLineNumber) {
                    output[lineIndex] = '';
                    continue;
                }
                let extraClassName = '';
                if (lineNumber === lineCount && this.a.viewModel.getLineLength(lineNumber) === 0) {
                    // this is the last line
                    if (this.j === 'off') {
                        output[lineIndex] = '';
                        continue;
                    }
                    if (this.j === 'dimmed') {
                        extraClassName = ' dimmed-line-number';
                    }
                }
                if (lineNumber === this.t) {
                    extraClassName = ' active-line-number';
                }
                output[lineIndex] = (`<div class="${$fX.CLASS_NAME}${lineHeightClassName}${extraClassName}" style="left:${this.m}px;width:${this.n}px;">${renderLineNumber}</div>`);
            }
            this.s = output;
        }
        render(startLineNumber, lineNumber) {
            if (!this.s) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this.s.length) {
                return '';
            }
            return this.s[lineIndex];
        }
    }
    exports.$fX = $fX;
    (0, themeService_1.$mv)((theme, collector) => {
        const editorLineNumbersColor = theme.getColor(editorColorRegistry_1.$1A);
        const editorDimmedLineNumberColor = theme.getColor(editorColorRegistry_1.$eB);
        if (editorDimmedLineNumberColor) {
            collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorDimmedLineNumberColor}; }`);
        }
        else if (editorLineNumbersColor) {
            collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorLineNumbersColor.transparent(0.4)}; }`);
        }
    });
});
//# sourceMappingURL=lineNumbers.js.map