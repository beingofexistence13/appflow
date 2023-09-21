/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/css!./iconSelectBox"], function (require, exports, dom, inputBox_1, scrollableElement_1, event_1, lifecycle_1, themables_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IconSelectBox = void 0;
    class IconSelectBox extends lifecycle_1.Disposable {
        constructor(options) {
            super();
            this.options = options;
            this._onDidSelect = this._register(new event_1.Emitter());
            this.onDidSelect = this._onDidSelect.event;
            this.renderedIcons = [];
            this.focusedItemIndex = 0;
            this.numberOfElementsPerRow = 1;
            this.iconContainerWidth = 36;
            this.iconContainerHeight = 32;
            this.domNode = dom.$('.icon-select-box');
            this._register(this.create());
        }
        create() {
            const disposables = new lifecycle_1.DisposableStore();
            const iconSelectBoxContainer = dom.append(this.domNode, dom.$('.icon-select-box-container'));
            iconSelectBoxContainer.style.margin = '10px 15px';
            const iconSelectInputContainer = dom.append(iconSelectBoxContainer, dom.$('.icon-select-input-container'));
            iconSelectInputContainer.style.paddingBottom = '10px';
            this.inputBox = disposables.add(new inputBox_1.InputBox(iconSelectInputContainer, undefined, {
                placeholder: (0, nls_1.localize)('iconSelect.placeholder', "Search icons"),
                inputBoxStyles: this.options.inputBoxStyles,
            }));
            const iconsContainer = dom.$('.icon-select-icons-container');
            iconsContainer.style.paddingRight = '10px';
            this.scrollableElement = disposables.add(new scrollableElement_1.DomScrollableElement(iconsContainer, { useShadows: false }));
            dom.append(iconSelectBoxContainer, this.scrollableElement.getDomNode());
            const iconsDisposables = disposables.add(new lifecycle_1.MutableDisposable());
            iconsDisposables.value = this.renderIcons(this.options.icons, iconsContainer);
            this.scrollableElement.scanDomNode();
            disposables.add(this.inputBox.onDidChange(value => {
                const icons = this.options.icons.filter(icon => {
                    return this.matchesContiguous(value, icon.id);
                });
                iconsDisposables.value = this.renderIcons(icons, iconsContainer);
                this.scrollableElement?.scanDomNode();
            }));
            return disposables;
        }
        renderIcons(icons, container) {
            const disposables = new lifecycle_1.DisposableStore();
            dom.clearNode(container);
            const focusedIcon = this.renderedIcons[this.focusedItemIndex]?.[0];
            let focusedIconIndex = 0;
            const renderedIcons = [];
            for (let index = 0; index < icons.length; index++) {
                const icon = icons[index];
                const iconContainer = dom.append(container, dom.$('.icon-container'));
                iconContainer.style.width = `${this.iconContainerWidth}px`;
                iconContainer.style.height = `${this.iconContainerHeight}px`;
                iconContainer.tabIndex = -1;
                iconContainer.role = 'button';
                iconContainer.title = icon.id;
                dom.append(iconContainer, dom.$(themables_1.ThemeIcon.asCSSSelector(icon)));
                renderedIcons.push([icon, iconContainer]);
                disposables.add(dom.addDisposableListener(iconContainer, dom.EventType.CLICK, (e) => {
                    e.stopPropagation();
                    this.setSelection(index);
                }));
                disposables.add(dom.addDisposableListener(iconContainer, dom.EventType.MOUSE_OVER, (e) => {
                    this.focusIcon(index);
                }));
                if (icon === focusedIcon) {
                    focusedIconIndex = index;
                }
            }
            this.renderedIcons.splice(0, this.renderedIcons.length, ...renderedIcons);
            this.focusIcon(focusedIconIndex);
            return disposables;
        }
        focusIcon(index) {
            const existing = this.renderedIcons[this.focusedItemIndex];
            if (existing) {
                existing[1].classList.remove('focused');
            }
            this.focusedItemIndex = index;
            const icon = this.renderedIcons[index]?.[1];
            if (icon) {
                icon.classList.add('focused');
            }
            this.reveal(index);
        }
        reveal(index) {
            if (!this.scrollableElement) {
                return;
            }
            if (index < 0 || index >= this.renderedIcons.length) {
                return;
            }
            const icon = this.renderedIcons[index][1];
            if (!icon) {
                return;
            }
            const { height } = this.scrollableElement.getScrollDimensions();
            const { scrollTop } = this.scrollableElement.getScrollPosition();
            if (icon.offsetTop + this.iconContainerHeight > scrollTop + height) {
                this.scrollableElement.setScrollPosition({ scrollTop: icon.offsetTop + this.iconContainerHeight - height });
            }
            else if (icon.offsetTop < scrollTop) {
                this.scrollableElement.setScrollPosition({ scrollTop: icon.offsetTop });
            }
        }
        matchesContiguous(word, wordToMatchAgainst) {
            const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
            if (matchIndex !== -1) {
                return [{ start: matchIndex, end: matchIndex + word.length }];
            }
            return null;
        }
        layout(dimension) {
            this.domNode.style.width = `${dimension.width}px`;
            this.domNode.style.height = `${dimension.height}px`;
            if (this.scrollableElement) {
                this.scrollableElement.getDomNode().style.height = `${dimension.height - 46}px`;
                this.scrollableElement.scanDomNode();
            }
            const iconsContainerWidth = dimension.width - 40;
            this.numberOfElementsPerRow = Math.floor(iconsContainerWidth / this.iconContainerWidth);
            if (this.numberOfElementsPerRow === 0) {
                throw new Error('Insufficient width');
            }
            const extraSpace = iconsContainerWidth % this.iconContainerWidth;
            const margin = Math.floor(extraSpace / this.numberOfElementsPerRow);
            for (const [, icon] of this.renderedIcons) {
                icon.style.marginRight = `${margin}px`;
            }
        }
        getFocus() {
            return [this.focusedItemIndex];
        }
        setSelection(index) {
            if (index < 0 || index >= this.renderedIcons.length) {
                throw new Error(`Invalid index ${index}`);
            }
            this.focusIcon(index);
            this._onDidSelect.fire(this.renderedIcons[index][0]);
        }
        focus() {
            this.inputBox?.focus();
            this.focusIcon(0);
        }
        focusNext() {
            this.focusIcon((this.focusedItemIndex + 1) % this.renderedIcons.length);
        }
        focusPrevious() {
            this.focusIcon((this.focusedItemIndex - 1 + this.renderedIcons.length) % this.renderedIcons.length);
        }
        focusNextRow() {
            this.focusIcon((this.focusedItemIndex + this.numberOfElementsPerRow) % this.renderedIcons.length);
        }
        focusPreviousRow() {
            this.focusIcon((this.focusedItemIndex - this.numberOfElementsPerRow + this.renderedIcons.length) % this.renderedIcons.length);
        }
        getFocusedIcon() {
            return this.renderedIcons[this.focusedItemIndex][0];
        }
    }
    exports.IconSelectBox = IconSelectBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvblNlbGVjdEJveC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9pY29ucy9pY29uU2VsZWN0Qm94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBYSxhQUFjLFNBQVEsc0JBQVU7UUFpQjVDLFlBQ2tCLE9BQThCO1lBRS9DLEtBQUssRUFBRSxDQUFDO1lBRlMsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7WUFkeEMsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFhLENBQUMsQ0FBQztZQUN2RCxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRXZDLGtCQUFhLEdBQStCLEVBQUUsQ0FBQztZQUUvQyxxQkFBZ0IsR0FBVyxDQUFDLENBQUM7WUFDN0IsMkJBQXNCLEdBQVcsQ0FBQyxDQUFDO1lBSTFCLHVCQUFrQixHQUFHLEVBQUUsQ0FBQztZQUN4Qix3QkFBbUIsR0FBRyxFQUFFLENBQUM7WUFNekMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU8sTUFBTTtZQUNiLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRTFDLE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQzdGLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDO1lBRWxELE1BQU0sd0JBQXdCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FB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