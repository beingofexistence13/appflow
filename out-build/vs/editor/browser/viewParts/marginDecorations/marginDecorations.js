/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/viewParts/glyphMargin/glyphMargin", "vs/css!./marginDecorations"], function (require, exports, glyphMargin_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AX = void 0;
    class $AX extends glyphMargin_1.$xX {
        constructor(context) {
            super();
            this.g = context;
            this.j = null;
            this.g.addEventHandler(this);
        }
        dispose() {
            this.g.removeEventHandler(this);
            this.j = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
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
        m(ctx) {
            const decorations = ctx.getDecorationsInViewport();
            const r = [];
            let rLen = 0;
            for (let i = 0, len = decorations.length; i < len; i++) {
                const d = decorations[i];
                const marginClassName = d.options.marginClassName;
                const zIndex = d.options.zIndex;
                if (marginClassName) {
                    r[rLen++] = new glyphMargin_1.$uX(d.range.startLineNumber, d.range.endLineNumber, marginClassName, zIndex);
                }
            }
            return r;
        }
        prepareRender(ctx) {
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const toRender = this.c(visibleStartLineNumber, visibleEndLineNumber, this.m(ctx));
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                const decorations = toRender[lineIndex].getDecorations();
                let lineOutput = '';
                for (const decoration of decorations) {
                    lineOutput += '<div class="cmdr ' + decoration.className + '" style=""></div>';
                }
                output[lineIndex] = lineOutput;
            }
            this.j = output;
        }
        render(startLineNumber, lineNumber) {
            if (!this.j) {
                return '';
            }
            return this.j[lineNumber - startLineNumber];
        }
    }
    exports.$AX = $AX;
});
//# sourceMappingURL=marginDecorations.js.map