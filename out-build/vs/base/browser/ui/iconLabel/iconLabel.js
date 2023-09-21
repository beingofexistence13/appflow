/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/range", "vs/css!./iconlabel"], function (require, exports, dom, highlightedLabel_1, iconLabelHover_1, lifecycle_1, objects_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KR = void 0;
    class FastLabelNode {
        constructor(e) {
            this.e = e;
        }
        get element() {
            return this.e;
        }
        set textContent(content) {
            if (this.a || content === this.b) {
                return;
            }
            this.b = content;
            this.e.textContent = content;
        }
        set className(className) {
            if (this.a || className === this.c) {
                return;
            }
            this.c = className;
            this.e.className = className;
        }
        set empty(empty) {
            if (this.a || empty === this.d) {
                return;
            }
            this.d = empty;
            this.e.style.marginLeft = empty ? '0' : '';
        }
        dispose() {
            this.a = true;
        }
    }
    class $KR extends lifecycle_1.$kc {
        constructor(container, options) {
            super();
            this.j = new Map();
            this.a = options;
            this.b = this.B(new FastLabelNode(dom.$0O(container, dom.$('.monaco-icon-label'))));
            this.g = dom.$0O(this.b.element, dom.$('.monaco-icon-label-container'));
            const nameContainer = dom.$0O(this.g, dom.$('span.monaco-icon-name-container'));
            if (options?.supportHighlights || options?.supportIcons) {
                this.c = new LabelWithHighlights(nameContainer, !!options.supportIcons);
            }
            else {
                this.c = new Label(nameContainer);
            }
            this.h = options?.hoverDelegate;
        }
        get element() {
            return this.b.element;
        }
        setLabel(label, description, options) {
            const labelClasses = ['monaco-icon-label'];
            const containerClasses = ['monaco-icon-label-container'];
            let ariaLabel = '';
            if (options) {
                if (options.extraClasses) {
                    labelClasses.push(...options.extraClasses);
                }
                if (options.italic) {
                    labelClasses.push('italic');
                }
                if (options.strikethrough) {
                    labelClasses.push('strikethrough');
                }
                if (options.disabledCommand) {
                    containerClasses.push('disabled');
                }
                if (options.title) {
                    ariaLabel += options.title;
                }
            }
            this.b.className = labelClasses.join(' ');
            this.b.element.setAttribute('aria-label', ariaLabel);
            this.g.className = containerClasses.join(' ');
            this.n(options?.descriptionTitle ? this.g : this.element, options?.title);
            this.c.setLabel(label, options);
            if (description || this.f) {
                const descriptionNode = this.r();
                if (descriptionNode instanceof highlightedLabel_1.$JR) {
                    descriptionNode.set(description || '', options ? options.descriptionMatches : undefined, undefined, options?.labelEscapeNewLines);
                    this.n(descriptionNode.element, options?.descriptionTitle);
                }
                else {
                    descriptionNode.textContent = description && options?.labelEscapeNewLines ? highlightedLabel_1.$JR.escapeNewLines(description, []) : (description || '');
                    this.n(descriptionNode.element, options?.descriptionTitle || '');
                    descriptionNode.empty = !description;
                }
            }
        }
        n(htmlElement, tooltip) {
            const previousCustomHover = this.j.get(htmlElement);
            if (previousCustomHover) {
                previousCustomHover.dispose();
                this.j.delete(htmlElement);
            }
            if (!tooltip) {
                htmlElement.removeAttribute('title');
                return;
            }
            if (!this.h) {
                (0, iconLabelHover_1.$YP)(htmlElement, tooltip);
            }
            else {
                const hoverDisposable = (0, iconLabelHover_1.$ZP)(this.h, htmlElement, tooltip);
                if (hoverDisposable) {
                    this.j.set(htmlElement, hoverDisposable);
                }
            }
        }
        dispose() {
            super.dispose();
            for (const disposable of this.j.values()) {
                disposable.dispose();
            }
            this.j.clear();
        }
        r() {
            if (!this.f) {
                const descriptionContainer = this.B(new FastLabelNode(dom.$0O(this.g, dom.$('span.monaco-icon-description-container'))));
                if (this.a?.supportDescriptionHighlights) {
                    this.f = new highlightedLabel_1.$JR(dom.$0O(descriptionContainer.element, dom.$('span.label-description')), { supportIcons: !!this.a.supportIcons });
                }
                else {
                    this.f = this.B(new FastLabelNode(dom.$0O(descriptionContainer.element, dom.$('span.label-description'))));
                }
            }
            return this.f;
        }
    }
    exports.$KR = $KR;
    class Label {
        constructor(d) {
            this.d = d;
            this.a = undefined;
            this.b = undefined;
        }
        setLabel(label, options) {
            if (this.a === label && (0, objects_1.$Zm)(this.c, options)) {
                return;
            }
            this.a = label;
            this.c = options;
            if (typeof label === 'string') {
                if (!this.b) {
                    this.d.innerText = '';
                    this.d.classList.remove('multiple');
                    this.b = dom.$0O(this.d, dom.$('a.label-name', { id: options?.domId }));
                }
                this.b.textContent = label;
            }
            else {
                this.d.innerText = '';
                this.d.classList.add('multiple');
                this.b = undefined;
                for (let i = 0; i < label.length; i++) {
                    const l = label[i];
                    const id = options?.domId && `${options?.domId}_${i}`;
                    dom.$0O(this.d, dom.$('a.label-name', { id, 'data-icon-label-count': label.length, 'data-icon-label-index': i, 'role': 'treeitem' }, l));
                    if (i < label.length - 1) {
                        dom.$0O(this.d, dom.$('span.label-separator', undefined, options?.separator || '/'));
                    }
                }
            }
        }
    }
    function splitMatches(labels, separator, matches) {
        if (!matches) {
            return undefined;
        }
        let labelStart = 0;
        return labels.map(label => {
            const labelRange = { start: labelStart, end: labelStart + label.length };
            const result = matches
                .map(match => range_1.Range.intersect(labelRange, match))
                .filter(range => !range_1.Range.isEmpty(range))
                .map(({ start, end }) => ({ start: start - labelStart, end: end - labelStart }));
            labelStart = labelRange.end + separator.length;
            return result;
        });
    }
    class LabelWithHighlights {
        constructor(d, e) {
            this.d = d;
            this.e = e;
            this.a = undefined;
            this.b = undefined;
        }
        setLabel(label, options) {
            if (this.a === label && (0, objects_1.$Zm)(this.c, options)) {
                return;
            }
            this.a = label;
            this.c = options;
            if (typeof label === 'string') {
                if (!this.b) {
                    this.d.innerText = '';
                    this.d.classList.remove('multiple');
                    this.b = new highlightedLabel_1.$JR(dom.$0O(this.d, dom.$('a.label-name', { id: options?.domId })), { supportIcons: this.e });
                }
                this.b.set(label, options?.matches, undefined, options?.labelEscapeNewLines);
            }
            else {
                this.d.innerText = '';
                this.d.classList.add('multiple');
                this.b = undefined;
                const separator = options?.separator || '/';
                const matches = splitMatches(label, separator, options?.matches);
                for (let i = 0; i < label.length; i++) {
                    const l = label[i];
                    const m = matches ? matches[i] : undefined;
                    const id = options?.domId && `${options?.domId}_${i}`;
                    const name = dom.$('a.label-name', { id, 'data-icon-label-count': label.length, 'data-icon-label-index': i, 'role': 'treeitem' });
                    const highlightedLabel = new highlightedLabel_1.$JR(dom.$0O(this.d, name), { supportIcons: this.e });
                    highlightedLabel.set(l, m, undefined, options?.labelEscapeNewLines);
                    if (i < label.length - 1) {
                        dom.$0O(name, dom.$('span.label-separator', undefined, separator));
                    }
                }
            }
        }
    }
});
//# sourceMappingURL=iconLabel.js.map