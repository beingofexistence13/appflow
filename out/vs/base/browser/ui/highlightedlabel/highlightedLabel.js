/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/objects"], function (require, exports, dom, iconLabels_1, objects) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HighlightedLabel = void 0;
    /**
     * A widget which can render a label with substring highlights, often
     * originating from a filter function like the fuzzy matcher.
     */
    class HighlightedLabel {
        /**
         * Create a new {@link HighlightedLabel}.
         *
         * @param container The parent container to append to.
         */
        constructor(container, options) {
            this.text = '';
            this.title = '';
            this.highlights = [];
            this.didEverRender = false;
            this.supportIcons = options?.supportIcons ?? false;
            this.domNode = dom.append(container, dom.$('span.monaco-highlighted-label'));
        }
        /**
         * The label's DOM node.
         */
        get element() {
            return this.domNode;
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
                text = HighlightedLabel.escapeNewLines(text, highlights);
            }
            if (this.didEverRender && this.text === text && this.title === title && objects.equals(this.highlights, highlights)) {
                return;
            }
            this.text = text;
            this.title = title;
            this.highlights = highlights;
            this.render();
        }
        render() {
            const children = [];
            let pos = 0;
            for (const highlight of this.highlights) {
                if (highlight.end === highlight.start) {
                    continue;
                }
                if (pos < highlight.start) {
                    const substring = this.text.substring(pos, highlight.start);
                    if (this.supportIcons) {
                        children.push(...(0, iconLabels_1.renderLabelWithIcons)(substring));
                    }
                    else {
                        children.push(substring);
                    }
                    pos = highlight.start;
                }
                const substring = this.text.substring(pos, highlight.end);
                const element = dom.$('span.highlight', undefined, ...this.supportIcons ? (0, iconLabels_1.renderLabelWithIcons)(substring) : [substring]);
                if (highlight.extraClasses) {
                    element.classList.add(...highlight.extraClasses);
                }
                children.push(element);
                pos = highlight.end;
            }
            if (pos < this.text.length) {
                const substring = this.text.substring(pos);
                if (this.supportIcons) {
                    children.push(...(0, iconLabels_1.renderLabelWithIcons)(substring));
                }
                else {
                    children.push(substring);
                }
            }
            dom.reset(this.domNode, ...children);
            if (this.title) {
                this.domNode.title = this.title;
            }
            else {
                this.domNode.removeAttribute('title');
            }
            this.didEverRender = true;
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
    exports.HighlightedLabel = HighlightedLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaGxpZ2h0ZWRMYWJlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9oaWdobGlnaHRlZGxhYmVsL2hpZ2hsaWdodGVkTGFiZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRzs7O09BR0c7SUFDSCxNQUFhLGdCQUFnQjtRQVM1Qjs7OztXQUlHO1FBQ0gsWUFBWSxTQUFzQixFQUFFLE9BQWtDO1lBWDlELFNBQUksR0FBVyxFQUFFLENBQUM7WUFDbEIsVUFBSyxHQUFXLEVBQUUsQ0FBQztZQUNuQixlQUFVLEdBQTBCLEVBQUUsQ0FBQztZQUV2QyxrQkFBYSxHQUFZLEtBQUssQ0FBQztZQVF0QyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sRUFBRSxZQUFZLElBQUksS0FBSyxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVEOztXQUVHO1FBQ0gsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFRDs7Ozs7Ozs7V0FRRztRQUNILEdBQUcsQ0FBQyxJQUF3QixFQUFFLGFBQW9DLEVBQUUsRUFBRSxRQUFnQixFQUFFLEVBQUUsY0FBd0I7WUFDakgsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixJQUFJLEdBQUcsRUFBRSxDQUFDO2FBQ1Y7WUFFRCxJQUFJLGNBQWMsRUFBRTtnQkFDbkIsNkJBQTZCO2dCQUM3QixJQUFJLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN6RDtZQUVELElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFL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