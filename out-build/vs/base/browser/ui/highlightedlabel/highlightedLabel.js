/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/objects"], function (require, exports, dom, iconLabels_1, objects) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JR = void 0;
    /**
     * A widget which can render a label with substring highlights, often
     * originating from a filter function like the fuzzy matcher.
     */
    class $JR {
        /**
         * Create a new {@link $JR}.
         *
         * @param container The parent container to append to.
         */
        constructor(container, options) {
            this.b = '';
            this.c = '';
            this.d = [];
            this.f = false;
            this.e = options?.supportIcons ?? false;
            this.a = dom.$0O(container, dom.$('span.monaco-highlighted-label'));
        }
        /**
         * The label's DOM node.
         */
        get element() {
            return this.a;
        }
        /**
         * Set the label and highlights.
         *
         * @param text The label to display.
         * @param highlights The ranges to highlight.
         * @param title An optional title for the hover tooltip.
         * @param escapeNewLines Whether to escape new lines.
         * @returns
         */
        set(text, highlights = [], title = '', escapeNewLines) {
            if (!text) {
                text = '';
            }
            if (escapeNewLines) {
                // adjusts highlights inplace
                text = $JR.escapeNewLines(text, highlights);
            }
            if (this.f && this.b === text && this.c === title && objects.$Zm(this.d, highlights)) {
                return;
            }
            this.b = text;
            this.c = title;
            this.d = highlights;
            this.g();
        }
        g() {
            const children = [];
            let pos = 0;
            for (const highlight of this.d) {
                if (highlight.end === highlight.start) {
                    continue;
                }
                if (pos < highlight.start) {
                    const substring = this.b.substring(pos, highlight.start);
                    if (this.e) {
                        children.push(...(0, iconLabels_1.$xQ)(substring));
                    }
                    else {
                        children.push(substring);
                    }
                    pos = highlight.start;
                }
                const substring = this.b.substring(pos, highlight.end);
                const element = dom.$('span.highlight', undefined, ...this.e ? (0, iconLabels_1.$xQ)(substring) : [substring]);
                if (highlight.extraClasses) {
                    element.classList.add(...highlight.extraClasses);
                }
                children.push(element);
                pos = highlight.end;
            }
            if (pos < this.b.length) {
                const substring = this.b.substring(pos);
                if (this.e) {
                    children.push(...(0, iconLabels_1.$xQ)(substring));
                }
                else {
                    children.push(substring);
                }
            }
            dom.$_O(this.a, ...children);
            if (this.c) {
                this.a.title = this.c;
            }
            else {
                this.a.removeAttribute('title');
            }
            this.f = true;
        }
        static escapeNewLines(text, highlights) {
            let total = 0;
            let extra = 0;
            return text.replace(/\r\n|\r|\n/g, (match, offset) => {
                extra = match === '\r\n' ? -1 : 0;
                offset += total;
                for (const highlight of highlights) {
                    if (highlight.end <= offset) {
                        continue;
                    }
                    if (highlight.start >= offset) {
                        highlight.start += extra;
                    }
                    if (highlight.end >= offset) {
                        highlight.end += extra;
                    }
                }
                total += extra;
                return '\u23CE';
            });
        }
    }
    exports.$JR = $JR;
});
//# sourceMappingURL=highlightedLabel.js.map