/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls!vs/base/browser/ui/icons/iconSelectBox", "vs/css!./iconSelectBox"], function (require, exports, dom, inputBox_1, scrollableElement_1, event_1, lifecycle_1, themables_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MR = void 0;
    class $MR extends lifecycle_1.$kc {
        constructor(n) {
            super();
            this.n = n;
            this.a = this.B(new event_1.$fd());
            this.onDidSelect = this.a.event;
            this.b = [];
            this.c = 0;
            this.f = 1;
            this.j = 36;
            this.m = 32;
            this.domNode = dom.$('.icon-select-box');
            this.B(this.r());
        }
        r() {
            const disposables = new lifecycle_1.$jc();
            const iconSelectBoxContainer = dom.$0O(this.domNode, dom.$('.icon-select-box-container'));
            iconSelectBoxContainer.style.margin = '10px 15px';
            const iconSelectInputContainer = dom.$0O(iconSelectBoxContainer, dom.$('.icon-select-input-container'));
            iconSelectInputContainer.style.paddingBottom = '10px';
            this.g = disposables.add(new inputBox_1.$sR(iconSelectInputContainer, undefined, {
                placeholder: (0, nls_1.localize)(0, null),
                inputBoxStyles: this.n.inputBoxStyles,
            }));
            const iconsContainer = dom.$('.icon-select-icons-container');
            iconsContainer.style.paddingRight = '10px';
            this.h = disposables.add(new scrollableElement_1.$UP(iconsContainer, { useShadows: false }));
            dom.$0O(iconSelectBoxContainer, this.h.getDomNode());
            const iconsDisposables = disposables.add(new lifecycle_1.$lc());
            iconsDisposables.value = this.s(this.n.icons, iconsContainer);
            this.h.scanDomNode();
            disposables.add(this.g.onDidChange(value => {
                const icons = this.n.icons.filter(icon => {
                    return this.w(value, icon.id);
                });
                iconsDisposables.value = this.s(icons, iconsContainer);
                this.h?.scanDomNode();
            }));
            return disposables;
        }
        s(icons, container) {
            const disposables = new lifecycle_1.$jc();
            dom.$lO(container);
            const focusedIcon = this.b[this.c]?.[0];
            let focusedIconIndex = 0;
            const renderedIcons = [];
            for (let index = 0; index < icons.length; index++) {
                const icon = icons[index];
                const iconContainer = dom.$0O(container, dom.$('.icon-container'));
                iconContainer.style.width = `${this.j}px`;
                iconContainer.style.height = `${this.m}px`;
                iconContainer.tabIndex = -1;
                iconContainer.role = 'button';
                iconContainer.title = icon.id;
                dom.$0O(iconContainer, dom.$(themables_1.ThemeIcon.asCSSSelector(icon)));
                renderedIcons.push([icon, iconContainer]);
                disposables.add(dom.$nO(iconContainer, dom.$3O.CLICK, (e) => {
                    e.stopPropagation();
                    this.setSelection(index);
                }));
                disposables.add(dom.$nO(iconContainer, dom.$3O.MOUSE_OVER, (e) => {
                    this.t(index);
                }));
                if (icon === focusedIcon) {
                    focusedIconIndex = index;
                }
            }
            this.b.splice(0, this.b.length, ...renderedIcons);
            this.t(focusedIconIndex);
            return disposables;
        }
        t(index) {
            const existing = this.b[this.c];
            if (existing) {
                existing[1].classList.remove('focused');
            }
            this.c = index;
            const icon = this.b[index]?.[1];
            if (icon) {
                icon.classList.add('focused');
            }
            this.u(index);
        }
        u(index) {
            if (!this.h) {
                return;
            }
            if (index < 0 || index >= this.b.length) {
                return;
            }
            const icon = this.b[index][1];
            if (!icon) {
                return;
            }
            const { height } = this.h.getScrollDimensions();
            const { scrollTop } = this.h.getScrollPosition();
            if (icon.offsetTop + this.m > scrollTop + height) {
                this.h.setScrollPosition({ scrollTop: icon.offsetTop + this.m - height });
            }
            else if (icon.offsetTop < scrollTop) {
                this.h.setScrollPosition({ scrollTop: icon.offsetTop });
            }
        }
        w(word, wordToMatchAgainst) {
            const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
            if (matchIndex !== -1) {
                return [{ start: matchIndex, end: matchIndex + word.length }];
            }
            return null;
        }
        layout(dimension) {
            this.domNode.style.width = `${dimension.width}px`;
            this.domNode.style.height = `${dimension.height}px`;
            if (this.h) {
                this.h.getDomNode().style.height = `${dimension.height - 46}px`;
                this.h.scanDomNode();
            }
            const iconsContainerWidth = dimension.width - 40;
            this.f = Math.floor(iconsContainerWidth / this.j);
            if (this.f === 0) {
                throw new Error('Insufficient width');
            }
            const extraSpace = iconsContainerWidth % this.j;
            const margin = Math.floor(extraSpace / this.f);
            for (const [, icon] of this.b) {
                icon.style.marginRight = `${margin}px`;
            }
        }
        getFocus() {
            return [this.c];
        }
        setSelection(index) {
            if (index < 0 || index >= this.b.length) {
                throw new Error(`Invalid index ${index}`);
            }
            this.t(index);
            this.a.fire(this.b[index][0]);
        }
        focus() {
            this.g?.focus();
            this.t(0);
        }
        focusNext() {
            this.t((this.c + 1) % this.b.length);
        }
        focusPrevious() {
            this.t((this.c - 1 + this.b.length) % this.b.length);
        }
        focusNextRow() {
            this.t((this.c + this.f) % this.b.length);
        }
        focusPreviousRow() {
            this.t((this.c - this.f + this.b.length) % this.b.length);
        }
        getFocusedIcon() {
            return this.b[this.c][0];
        }
    }
    exports.$MR = $MR;
});
//# sourceMappingURL=iconSelectBox.js.map