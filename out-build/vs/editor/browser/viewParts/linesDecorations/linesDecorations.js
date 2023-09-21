/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/viewParts/glyphMargin/glyphMargin", "vs/css!./linesDecorations"], function (require, exports, glyphMargin_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zX = void 0;
    class $zX extends glyphMargin_1.$xX {
        constructor(context) {
            super();
            this.g = context;
            const options = this.g.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.j = layoutInfo.decorationsLeft;
            this.m = layoutInfo.decorationsWidth;
            this.n = null;
            this.g.addEventHandler(this);
        }
        dispose() {
            this.g.removeEventHandler(this);
            this.n = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this.g.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.j = layoutInfo.decorationsLeft;
            this.m = layoutInfo.decorationsWidth;
            return true;
        }
        onDecorationsChanged(e) {
            return true;
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
        s(ctx) {
            const decorations = ctx.getDecorationsInViewport();
            const r = [];
            let rLen = 0;
            for (let i = 0, len = decorations.length; i < len; i++) {
                const d = decorations[i];
                const linesDecorationsClassName = d.options.linesDecorationsClassName;
                const zIndex = d.options.zIndex;
                if (linesDecorationsClassName) {
                    r[rLen++] = new glyphMargin_1.$uX(d.range.startLineNumber, d.range.endLineNumber, linesDecorationsClassName, zIndex);
                }
                const firstLineDecorationClassName = d.options.firstLineDecorationClassName;
                if (firstLineDecorationClassName) {
                    r[rLen++] = new glyphMargin_1.$uX(d.range.startLineNumber, d.range.startLineNumber, firstLineDecorationClassName, zIndex);
                }
            }
            return r;
        }
        prepareRender(ctx) {
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const toRender = this.c(visibleStartLineNumber, visibleEndLineNumber, this.s(ctx));
            const left = this.j.toString();
            const width = this.m.toString();
            const common = '" style="left:' + left + 'px;width:' + width + 'px;"></div>';
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                const decorations = toRender[lineIndex].getDecorations();
                let lineOutput = '';
                for (const decoration of decorations) {
                    lineOutput += '<div class="cldr ' + decoration.className + common;
                }
                output[lineIndex] = lineOutput;
            }
            this.n = output;
        }
        render(startLineNumber, lineNumber) {
            if (!this.n) {
                return '';
            }
            return this.n[lineNumber - startLineNumber];
        }
    }
    exports.$zX = $zX;
});
//# sourceMappingURL=linesDecorations.js.map