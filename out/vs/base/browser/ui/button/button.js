/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/css!./button"], function (require, exports, dom_1, dompurify_1, keyboardEvent_1, markdownRenderer_1, touch_1, iconLabels_1, actions_1, codicons_1, color_1, event_1, htmlContent_1, lifecycle_1, themables_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ButtonBar = exports.ButtonWithDescription = exports.ButtonWithDropdown = exports.Button = exports.unthemedButtonStyles = void 0;
    exports.unthemedButtonStyles = {
        buttonBackground: '#0E639C',
        buttonHoverBackground: '#006BB3',
        buttonSeparator: color_1.Color.white.toString(),
        buttonForeground: color_1.Color.white.toString(),
        buttonBorder: undefined,
        buttonSecondaryBackground: undefined,
        buttonSecondaryForeground: undefined,
        buttonSecondaryHoverBackground: undefined
    };
    class Button extends lifecycle_1.Disposable {
        get onDidClick() { return this._onDidClick.event; }
        constructor(container, options) {
            super();
            this._label = '';
            this._onDidClick = this._register(new event_1.Emitter());
            this.options = options;
            this._element = document.createElement('a');
            this._element.classList.add('monaco-button');
            this._element.tabIndex = 0;
            this._element.setAttribute('role', 'button');
            this._element.classList.toggle('secondary', !!options.secondary);
            const background = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
            const foreground = options.secondary ? options.buttonSecondaryForeground : options.buttonForeground;
            this._element.style.color = foreground || '';
            this._element.style.backgroundColor = background || '';
            if (options.supportShortLabel) {
                this._labelShortElement = document.createElement('div');
                this._labelShortElement.classList.add('monaco-button-label-short');
                this._element.appendChild(this._labelShortElement);
                this._labelElement = document.createElement('div');
                this._labelElement.classList.add('monaco-button-label');
                this._element.appendChild(this._labelElement);
                this._element.classList.add('monaco-text-button-with-short-label');
            }
            container.appendChild(this._element);
            this._register(touch_1.Gesture.addTarget(this._element));
            [dom_1.EventType.CLICK, touch_1.EventType.Tap].forEach(eventType => {
                this._register((0, dom_1.addDisposableListener)(this._element, eventType, e => {
                    if (!this.enabled) {
                        dom_1.EventHelper.stop(e);
                        return;
                    }
                    this._onDidClick.fire(e);
                }));
            });
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = false;
                if (this.enabled && (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */))) {
                    this._onDidClick.fire(e);
                    eventHandled = true;
                }
                else if (event.equals(9 /* KeyCode.Escape */)) {
                    this._element.blur();
                    eventHandled = true;
                }
                if (eventHandled) {
                    dom_1.EventHelper.stop(event, true);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OVER, e => {
                if (!this._element.classList.contains('disabled')) {
                    this.updateBackground(true);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OUT, e => {
                this.updateBackground(false); // restore standard styles
            }));
            // Also set hover background when button is focused for feedback
            this.focusTracker = this._register((0, dom_1.trackFocus)(this._element));
            this._register(this.focusTracker.onDidFocus(() => { if (this.enabled) {
                this.updateBackground(true);
            } }));
            this._register(this.focusTracker.onDidBlur(() => { if (this.enabled) {
                this.updateBackground(false);
            } }));
        }
        dispose() {
            super.dispose();
            this._element.remove();
        }
        getContentElements(content) {
            const elements = [];
            for (let segment of (0, iconLabels_1.renderLabelWithIcons)(content)) {
                if (typeof (segment) === 'string') {
                    segment = segment.trim();
                    // Ignore empty segment
                    if (segment === '') {
                        continue;
                    }
                    // Convert string segments to <span> nodes
                    const node = document.createElement('span');
                    node.textContent = segment;
                    elements.push(node);
                }
                else {
                    elements.push(segment);
                }
            }
            return elements;
        }
        updateBackground(hover) {
            let background;
            if (this.options.secondary) {
                background = hover ? this.options.buttonSecondaryHoverBackground : this.options.buttonSecondaryBackground;
            }
            else {
                background = hover ? this.options.buttonHoverBackground : this.options.buttonBackground;
            }
            if (background) {
                this._element.style.backgroundColor = background;
            }
        }
        get element() {
            return this._element;
        }
        set label(value) {
            if (this._label === value) {
                return;
            }
            if ((0, htmlContent_1.isMarkdownString)(this._label) && (0, htmlContent_1.isMarkdownString)(value) && (0, htmlContent_1.markdownStringEqual)(this._label, value)) {
                return;
            }
            this._element.classList.add('monaco-text-button');
            const labelElement = this.options.supportShortLabel ? this._labelElement : this._element;
            if ((0, htmlContent_1.isMarkdownString)(value)) {
                const rendered = (0, markdownRenderer_1.renderMarkdown)(value, { inline: true });
                rendered.dispose();
                // Don't include outer `<p>`
                const root = rendered.element.querySelector('p')?.innerHTML;
                if (root) {
                    // Only allow a very limited set of inline html tags
                    const sanitized = (0, dompurify_1.sanitize)(root, { ADD_TAGS: ['b', 'i', 'u', 'code', 'span'], ALLOWED_ATTR: ['class'], RETURN_TRUSTED_TYPE: true });
                    labelElement.innerHTML = sanitized;
                }
                else {
                    (0, dom_1.reset)(labelElement);
                }
            }
            else {
                if (this.options.supportIcons) {
                    (0, dom_1.reset)(labelElement, ...this.getContentElements(value));
                }
                else {
                    labelElement.textContent = value;
                }
            }
            if (typeof this.options.title === 'string') {
                this._element.title = this.options.title;
            }
            else if (this.options.title) {
                this._element.title = (0, markdownRenderer_1.renderStringAsPlaintext)(value);
            }
            this._label = value;
        }
        get label() {
            return this._label;
        }
        set labelShort(value) {
            if (!this.options.supportShortLabel || !this._labelShortElement) {
                return;
            }
            if (this.options.supportIcons) {
                (0, dom_1.reset)(this._labelShortElement, ...this.getContentElements(value));
            }
            else {
                this._labelShortElement.textContent = value;
            }
        }
        set icon(icon) {
            this._element.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
        }
        set enabled(value) {
            if (value) {
                this._element.classList.remove('disabled');
                this._element.setAttribute('aria-disabled', String(false));
                this._element.tabIndex = 0;
            }
            else {
                this._element.classList.add('disabled');
                this._element.setAttribute('aria-disabled', String(true));
            }
        }
        get enabled() {
            return !this._element.classList.contains('disabled');
        }
        focus() {
            this._element.focus();
        }
        hasFocus() {
            return this._element === document.activeElement;
        }
    }
    exports.Button = Button;
    class ButtonWithDropdown extends lifecycle_1.Disposable {
        constructor(container, options) {
            super();
            this._onDidClick = this._register(new event_1.Emitter());
            this.onDidClick = this._onDidClick.event;
            this.element = document.createElement('div');
            this.element.classList.add('monaco-button-dropdown');
            container.appendChild(this.element);
            this.button = this._register(new Button(this.element, options));
            this._register(this.button.onDidClick(e => this._onDidClick.fire(e)));
            this.action = this._register(new actions_1.Action('primaryAction', (0, markdownRenderer_1.renderStringAsPlaintext)(this.button.label), undefined, true, async () => this._onDidClick.fire(undefined)));
            this.separatorContainer = document.createElement('div');
            this.separatorContainer.classList.add('monaco-button-dropdown-separator');
            this.separator = document.createElement('div');
            this.separatorContainer.appendChild(this.separator);
            this.element.appendChild(this.separatorContainer);
            // Separator styles
            const border = options.buttonBorder;
            if (border) {
                this.separatorContainer.style.borderTop = '1px solid ' + border;
                this.separatorContainer.style.borderBottom = '1px solid ' + border;
            }
            const buttonBackground = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
            this.separatorContainer.style.backgroundColor = buttonBackground ?? '';
            this.separator.style.backgroundColor = options.buttonSeparator ?? '';
            this.dropdownButton = this._register(new Button(this.element, { ...options, title: false, supportIcons: true }));
            this.dropdownButton.element.title = (0, nls_1.localize)("button dropdown more actions", 'More Actions...');
            this.dropdownButton.element.setAttribute('aria-haspopup', 'true');
            this.dropdownButton.element.setAttribute('aria-expanded', 'false');
            this.dropdownButton.element.classList.add('monaco-dropdown-button');
            this.dropdownButton.icon = codicons_1.Codicon.dropDownButton;
            this._register(this.dropdownButton.onDidClick(e => {
                options.contextMenuProvider.showContextMenu({
                    getAnchor: () => this.dropdownButton.element,
                    getActions: () => options.addPrimaryActionToDropdown === false ? [...options.actions] : [this.action, ...options.actions],
                    actionRunner: options.actionRunner,
                    onHide: () => this.dropdownButton.element.setAttribute('aria-expanded', 'false')
                });
                this.dropdownButton.element.setAttribute('aria-expanded', 'true');
            }));
        }
        dispose() {
            super.dispose();
            this.element.remove();
        }
        set label(value) {
            this.button.label = value;
            this.action.label = value;
        }
        set icon(icon) {
            this.button.icon = icon;
        }
        set enabled(enabled) {
            this.button.enabled = enabled;
            this.dropdownButton.enabled = enabled;
            this.element.classList.toggle('disabled', !enabled);
        }
        get enabled() {
            return this.button.enabled;
        }
        focus() {
            this.button.focus();
        }
        hasFocus() {
            return this.button.hasFocus() || this.dropdownButton.hasFocus();
        }
    }
    exports.ButtonWithDropdown = ButtonWithDropdown;
    class ButtonWithDescription {
        constructor(container, options) {
            this.options = options;
            this._element = document.createElement('div');
            this._element.classList.add('monaco-description-button');
            this._button = new Button(this._element, options);
            this._descriptionElement = document.createElement('div');
            this._descriptionElement.classList.add('monaco-button-description');
            this._element.appendChild(this._descriptionElement);
            container.appendChild(this._element);
        }
        get onDidClick() {
            return this._button.onDidClick;
        }
        get element() {
            return this._element;
        }
        set label(value) {
            this._button.label = value;
        }
        set icon(icon) {
            this._button.icon = icon;
        }
        get enabled() {
            return this._button.enabled;
        }
        set enabled(enabled) {
            this._button.enabled = enabled;
        }
        focus() {
            this._button.focus();
        }
        hasFocus() {
            return this._button.hasFocus();
        }
        dispose() {
            this._button.dispose();
        }
        set description(value) {
            if (this.options.supportIcons) {
                (0, dom_1.reset)(this._descriptionElement, ...(0, iconLabels_1.renderLabelWithIcons)(value));
            }
            else {
                this._descriptionElement.textContent = value;
            }
        }
    }
    exports.ButtonWithDescription = ButtonWithDescription;
    class ButtonBar {
        constructor(container) {
            this.container = container;
            this._buttons = [];
            this._buttonStore = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._buttonStore.dispose();
        }
        get buttons() {
            return this._buttons;
        }
        clear() {
            this._buttonStore.clear();
            this._buttons.length = 0;
        }
        addButton(options) {
            const button = this._buttonStore.add(new Button(this.container, options));
            this.pushButton(button);
            return button;
        }
        addButtonWithDescription(options) {
            const button = this._buttonStore.add(new ButtonWithDescription(this.container, options));
            this.pushButton(button);
            return button;
        }
        addButtonWithDropdown(options) {
            const button = this._buttonStore.add(new ButtonWithDropdown(this.container, options));
            this.pushButton(button);
            return button;
        }
        pushButton(button) {
            this._buttons.push(button);
            const index = this._buttons.length - 1;
            this._buttonStore.add((0, dom_1.addDisposableListener)(button.element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                // Next / Previous Button
                let buttonIndexToFocus;
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    buttonIndexToFocus = index > 0 ? index - 1 : this._buttons.length - 1;
                }
                else if (event.equals(17 /* KeyCode.RightArrow */)) {
                    buttonIndexToFocus = index === this._buttons.length - 1 ? 0 : index + 1;
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled && typeof buttonIndexToFocus === 'number') {
                    this._buttons[buttonIndexToFocus].focus();
                    dom_1.EventHelper.stop(e, true);
                }
            }));
        }
    }
    exports.ButtonBar = ButtonBar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2J1dHRvbi9idXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0NuRixRQUFBLG9CQUFvQixHQUFrQjtRQUNsRCxnQkFBZ0IsRUFBRSxTQUFTO1FBQzNCLHFCQUFxQixFQUFFLFNBQVM7UUFDaEMsZUFBZSxFQUFFLGFBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ3ZDLGdCQUFnQixFQUFFLGFBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ3hDLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLHlCQUF5QixFQUFFLFNBQVM7UUFDcEMseUJBQXlCLEVBQUUsU0FBUztRQUNwQyw4QkFBOEIsRUFBRSxTQUFTO0tBQ3pDLENBQUM7SUFrQkYsTUFBYSxNQUFPLFNBQVEsc0JBQVU7UUFTckMsSUFBSSxVQUFVLEtBQXVCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBSXJFLFlBQVksU0FBc0IsRUFBRSxPQUF1QjtZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQVZDLFdBQU0sR0FBNkIsRUFBRSxDQUFDO1lBSXhDLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUyxDQUFDLENBQUM7WUFRMUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFFdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZ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