/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/hover/browser/hoverOperation", "vs/base/browser/ui/hover/hoverWidget"], function (require, exports, dom, arrays_1, htmlContent_1, lifecycle_1, markdownRenderer_1, hoverOperation_1, hoverWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$54 = void 0;
    const $ = dom.$;
    class $54 extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.modesGlyphHoverWidget'; }
        constructor(editor, languageService, openerService) {
            super();
            this.m = this.B(new lifecycle_1.$jc());
            this.a = editor;
            this.c = false;
            this.f = [];
            this.b = this.B(new hoverWidget_1.$VP());
            this.b.containerDomNode.classList.toggle('hidden', !this.c);
            this.g = this.B(new markdownRenderer_1.$K2({ editor: this.a }, languageService, openerService));
            this.h = new MarginHoverComputer(this.a);
            this.j = this.B(new hoverOperation_1.$Z4(this.a, this.h));
            this.B(this.j.onResult((result) => {
                this.s(result.value);
            }));
            this.B(this.a.onDidChangeModelDecorations(() => this.r()));
            this.B(this.a.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.n();
                }
            }));
            this.a.addOverlayWidget(this);
        }
        dispose() {
            this.a.removeOverlayWidget(this);
            super.dispose();
        }
        getId() {
            return $54.ID;
        }
        getDomNode() {
            return this.b.containerDomNode;
        }
        getPosition() {
            return null;
        }
        n() {
            const codeClasses = Array.prototype.slice.call(this.b.contentsDomNode.getElementsByClassName('code'));
            codeClasses.forEach(node => this.a.applyFontInfo(node));
        }
        r() {
            if (this.c) {
                // The decorations have changed and the hover is visible,
                // we need to recompute the displayed text
                this.j.cancel();
                this.j.start(0 /* HoverStartMode.Delayed */);
            }
        }
        startShowingAt(lineNumber) {
            if (this.h.lineNumber === lineNumber) {
                // We have to show the widget at the exact same line number as before, so no work is needed
                return;
            }
            this.j.cancel();
            this.hide();
            this.h.lineNumber = lineNumber;
            this.j.start(0 /* HoverStartMode.Delayed */);
        }
        hide() {
            this.h.lineNumber = -1;
            this.j.cancel();
            if (!this.c) {
                return;
            }
            this.c = false;
            this.b.containerDomNode.classList.toggle('hidden', !this.c);
        }
        s(result) {
            this.f = result;
            if (this.f.length > 0) {
                this.t(this.h.lineNumber, this.f);
            }
            else {
                this.hide();
            }
        }
        t(lineNumber, messages) {
            this.m.clear();
            const fragment = document.createDocumentFragment();
            for (const msg of messages) {
                const markdownHoverElement = $('div.hover-row.markdown-hover');
                const hoverContentsElement = dom.$0O(markdownHoverElement, $('div.hover-contents'));
                const renderedContents = this.m.add(this.g.render(msg.value));
                hoverContentsElement.appendChild(renderedContents.element);
                fragment.appendChild(markdownHoverElement);
            }
            this.u(fragment);
            this.w(lineNumber);
        }
        u(node) {
            this.b.contentsDomNode.textContent = '';
            this.b.contentsDomNode.appendChild(node);
            this.n();
        }
        w(lineNumber) {
            if (!this.c) {
                this.c = true;
                this.b.containerDomNode.classList.toggle('hidden', !this.c);
            }
            const editorLayout = this.a.getLayoutInfo();
            const topForLineNumber = this.a.getTopForLineNumber(lineNumber);
            const editorScrollTop = this.a.getScrollTop();
            const lineHeight = this.a.getOption(66 /* EditorOption.lineHeight */);
            const nodeHeight = this.b.containerDomNode.clientHeight;
            const top = topForLineNumber - editorScrollTop - ((nodeHeight - lineHeight) / 2);
            this.b.containerDomNode.style.left = `${editorLayout.glyphMarginLeft + editorLayout.glyphMarginWidth}px`;
            this.b.containerDomNode.style.top = `${Math.max(Math.round(top), 0)}px`;
        }
    }
    exports.$54 = $54;
    class MarginHoverComputer {
        get lineNumber() {
            return this.a;
        }
        set lineNumber(value) {
            this.a = value;
        }
        constructor(b) {
            this.b = b;
            this.a = -1;
        }
        computeSync() {
            const toHoverMessage = (contents) => {
                return {
                    value: contents
                };
            };
            const lineDecorations = this.b.getLineDecorations(this.a);
            const result = [];
            if (!lineDecorations) {
                return result;
            }
            for (const d of lineDecorations) {
                if (!d.options.glyphMarginClassName) {
                    continue;
                }
                const hoverMessage = d.options.glyphMarginHoverMessage;
                if (!hoverMessage || (0, htmlContent_1.$Yj)(hoverMessage)) {
                    continue;
                }
                result.push(...(0, arrays_1.$1b)(hoverMessage).map(toHoverMessage));
            }
            return result;
        }
    }
});
//# sourceMappingURL=marginHover.js.map