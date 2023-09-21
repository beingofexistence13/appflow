/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/formattedTextRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/base/common/history", "vs/base/common/objects", "vs/nls", "vs/css!./inputBox"], function (require, exports, dom, event_1, formattedTextRenderer_1, actionbar_1, aria, scrollableElement_1, widget_1, event_2, history_1, objects_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HistoryInputBox = exports.InputBox = exports.unthemedInboxStyles = exports.MessageType = void 0;
    const $ = dom.$;
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["INFO"] = 1] = "INFO";
        MessageType[MessageType["WARNING"] = 2] = "WARNING";
        MessageType[MessageType["ERROR"] = 3] = "ERROR";
    })(MessageType || (exports.MessageType = MessageType = {}));
    exports.unthemedInboxStyles = {
        inputBackground: '#3C3C3C',
        inputForeground: '#CCCCCC',
        inputValidationInfoBorder: '#55AAFF',
        inputValidationInfoBackground: '#063B49',
        inputValidationWarningBorder: '#B89500',
        inputValidationWarningBackground: '#352A05',
        inputValidationErrorBorder: '#BE1100',
        inputValidationErrorBackground: '#5A1D1D',
        inputBorder: undefined,
        inputValidationErrorForeground: undefined,
        inputValidationInfoForeground: undefined,
        inputValidationWarningForeground: undefined
    };
    class InputBox extends widget_1.Widget {
        constructor(container, contextViewProvider, options) {
            super();
            this.state = 'idle';
            this.maxHeight = Number.POSITIVE_INFINITY;
            this._onDidChange = this._register(new event_2.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidHeightChange = this._register(new event_2.Emitter());
            this.onDidHeightChange = this._onDidHeightChange.event;
            this.contextViewProvider = contextViewProvider;
            this.options = options;
            this.message = null;
            this.placeholder = this.options.placeholder || '';
            this.tooltip = this.options.tooltip ?? (this.placeholder || '');
            this.ariaLabel = this.options.ariaLabel || '';
            if (this.options.validationOptions) {
                this.validation = this.options.validationOptions.validation;
            }
            this.element = dom.append(container, $('.monaco-inputbox.idle'));
            const tagName = this.options.flexibleHeight ? 'textarea' : 'input';
            const wrapper = dom.append(this.element, $('.ibwrapper'));
            this.input = dom.append(wrapper, $(tagName + '.input.empty'));
            this.input.setAttribute('autocorrect', 'off');
            this.input.setAttribute('autocapitalize', 'off');
            this.input.setAttribute('spellcheck', 'false');
            this.onfocus(this.input, () => this.element.classList.add('synthetic-focus'));
            this.onblur(this.input, () => this.element.classList.remove('synthetic-focus'));
            if (this.options.flexibleHeight) {
                this.maxHeight = typeof this.options.flexibleMaxHeight === 'number' ? this.options.flexibleMaxHeight : Number.POSITIVE_INFINITY;
                this.mirror = dom.append(wrapper, $('div.mirror'));
                this.mirror.innerText = '\u00a0';
                this.scrollableElement = new scrollableElement_1.ScrollableElement(this.element, { vertical: 1 /* ScrollbarVisibility.Auto */ });
                if (this.options.flexibleWidth) {
                    this.input.setAttribute('wrap', 'off');
                    this.mirror.style.whiteSpace = 'pre';
                    this.mirror.style.wordWrap = 'initial';
                }
                dom.append(container, this.scrollableElement.getDomNode());
                this._register(this.scrollableElement);
                // from ScrollableElement to DOM
                this._register(this.scrollableElement.onScroll(e => this.input.scrollTop = e.scrollTop));
                const onSelectionChange = this._register(new event_1.DomEmitter(document, 'selectionchange'));
                const onAnchoredSelectionChange = event_2.Event.filter(onSelectionChange.event, () => {
                    const selection = document.getSelection();
                    return selection?.anchorNode === wrapper;
                });
                // from DOM to ScrollableElement
                this._register(onAnchoredSelectionChange(this.updateScrollDimensions, this));
                this._register(this.onDidHeightChange(this.updateScrollDimensions, this));
            }
            else {
                this.input.type = this.options.type || 'text';
                this.input.setAttribute('wrap', 'off');
            }
            if (this.ariaLabel) {
                this.input.setAttribute('aria-label', this.ariaLabel);
            }
            if (this.placeholder && !this.options.showPlaceholderOnFocus) {
                this.setPlaceHolder(this.placeholder);
            }
            if (this.tooltip) {
                this.setTooltip(this.tooltip);
            }
            this.oninput(this.input, () => this.onValueChange());
            this.onblur(this.input, () => this.onBlur());
            this.onfocus(this.input, () => this.onFocus());
            this._register(this.ignoreGesture(this.input));
            setTimeout(() => this.updateMirror(), 0);
            // Support actions
            if (this.options.actions) {
                this.actionbar = this._register(new actionbar_1.ActionBar(this.element));
                this.actionbar.push(this.options.actions, { icon: true, label: false });
            }
            this.applyStyles();
        }
        onBlur() {
            this._hideMessage();
            if (this.options.showPlaceholderOnFocus) {
                this.input.setAttribute('placeholder', '');
            }
        }
        onFocus() {
            this._showMessage();
            if (this.options.showPlaceholderOnFocus) {
                this.input.setAttribute('placeholder', this.placeholder || '');
            }
        }
        setPlaceHolder(placeHolder) {
            this.placeholder = placeHolder;
            this.input.setAttribute('placeholder', placeHolder);
        }
        setTooltip(tooltip) {
            this.tooltip = tooltip;
            this.input.title = tooltip;
        }
        setAriaLabel(label) {
            this.ariaLabel = label;
            if (label) {
                this.input.setAttribute('aria-label', this.ariaLabel);
            }
            else {
                this.input.removeAttribute('aria-label');
            }
        }
        getAriaLabel() {
            return this.ariaLabel;
        }
        get mirrorElement() {
            return this.mirror;
        }
        get inputElement() {
            return this.input;
        }
        get value() {
            return this.input.value;
        }
        set value(newValue) {
            if (this.input.value !== newValue) {
                this.input.value = newValue;
                this.onValueChange();
            }
        }
        get step() {
            return this.input.step;
        }
        set step(newValue) {
            this.input.step = newValue;
        }
        get height() {
            return typeof this.cachedHeight === 'number' ? this.cachedHeight : dom.getTotalHeight(this.element);
        }
        focus() {
            this.input.focus();
        }
        blur() {
            this.input.blur();
        }
        hasFocus() {
            return document.activeElement === this.input;
        }
        select(range = null) {
            this.input.select();
            if (range) {
                this.input.setSelectionRange(range.start, range.end);
                if (range.end === this.input.value.length) {
                    this.input.scrollLeft = this.input.scrollWidth;
                }
            }
        }
        isSelectionAtEnd() {
            return this.input.selectionEnd === this.input.value.length && this.input.selectionStart === this.input.selectionEnd;
        }
        enable() {
            this.input.removeAttribute('disabled');
        }
        disable() {
            this.blur();
            this.input.disabled = true;
            this._hideMessage();
        }
        setEnabled(enabled) {
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        get width() {
            return dom.getTotalWidth(this.input);
        }
        set width(width) {
            if (this.options.flexibleHeight && this.options.flexibleWidth) {
                // textarea with horizontal scrolling
                let horizontalPadding = 0;
                if (this.mirror) {
                    const paddingLeft = parseFloat(this.mirror.style.paddingLeft || '') || 0;
                    const paddingRight = parseFloat(this.mirror.style.paddingRight || '') || 0;
                    horizontalPadding = paddingLeft + paddingRight;
                }
                this.input.style.width = (width - horizontalPadding) + 'px';
            }
            else {
                this.input.style.width = width + 'px';
            }
            if (this.mirror) {
                this.mirror.style.width = width + 'px';
            }
        }
        set paddingRight(paddingRight) {
            // Set width to avoid hint text overlapping buttons
            this.input.style.width = `calc(100% - ${paddingRight}px)`;
            if (this.mirror) {
                this.mirror.style.paddingRight = paddingRight + 'px';
            }
        }
        updateScrollDimensions() {
            if (typeof this.cachedContentHeight !== 'number' || typeof this.cachedHeight !== 'number' || !this.scrollableElement) {
                return;
            }
            const scrollHeight = this.cachedContentHeight;
            const height = this.cachedHeight;
            const scrollTop = this.input.scrollTop;
            this.scrollableElement.setScrollDimensions({ scrollHeight, height });
            this.scrollableElement.setScrollPosition({ scrollTop });
        }
        showMessage(message, force) {
            if (this.state === 'open' && (0, objects_1.equals)(this.message, message)) {
                // Already showing
                return;
            }
            this.message = message;
            this.element.classList.remove('idle');
            this.element.classList.remove('info');
            this.element.classList.remove('warning');
            this.element.classList.remove('error');
            this.element.classList.add(this.classForType(message.type));
            const styles = this.stylesForType(this.message.type);
            this.element.style.border = `1px solid ${dom.asCssValueWithDefault(styles.border, 'transparent')}`;
            if (this.message.content && (this.hasFocus() || force)) {
                this._showMessage();
            }
        }
        hideMessage() {
            this.message = null;
            this.element.classList.remove('info');
            this.element.classList.remove('warning');
            this.element.classList.remove('error');
            this.element.classList.add('idle');
            this._hideMessage();
            this.applyStyles();
        }
        isInputValid() {
            return !!this.validation && !this.validation(this.value);
        }
        validate() {
            let errorMsg = null;
            if (this.validation) {
                errorMsg = this.validation(this.value);
                if (errorMsg) {
                    this.inputElement.setAttribute('aria-invalid', 'true');
                    this.showMessage(errorMsg);
                }
                else if (this.inputElement.hasAttribute('aria-invalid')) {
                    this.inputElement.removeAttribute('aria-invalid');
                    this.hideMessage();
                }
            }
            return errorMsg?.type;
        }
        stylesForType(type) {
            const styles = this.options.inputBoxStyles;
            switch (type) {
                case 1 /* MessageType.INFO */: return { border: styles.inputValidationInfoBorder, background: styles.inputValidationInfoBackground, foreground: styles.inputValidationInfoForeground };
                case 2 /* MessageType.WARNING */: return { border: styles.inputValidationWarningBorder, background: styles.inputValidationWarningBackground, foreground: styles.inputValidationWarningForeground };
                default: return { border: styles.inputValidationErrorBorder, background: styles.inputValidationErrorBackground, foreground: styles.inputValidationErrorForeground };
            }
        }
        classForType(type) {
            switch (type) {
                case 1 /* MessageType.INFO */: return 'info';
                case 2 /* MessageType.WARNING */: return 'warning';
                default: return 'error';
            }
        }
        _showMessage() {
            if (!this.contextViewProvider || !this.message) {
                return;
            }
            let div;
            const layout = () => div.style.width = dom.getTotalWidth(this.element) + 'px';
            this.contextViewProvider.showContextView({
                getAnchor: () => this.element,
                anchorAlignment: 1 /* AnchorAlignment.RIGHT */,
                render: (container) => {
                    if (!this.message) {
                        return null;
                    }
                    div = dom.append(container, $('.monaco-inputbox-container'));
                    layout();
                    const renderOptions = {
                        inline: true,
                        className: 'monaco-inputbox-message'
                    };
                    const spanElement = (this.message.formatContent
                        ? (0, formattedTextRenderer_1.renderFormattedText)(this.message.content, renderOptions)
                        : (0, formattedTextRenderer_1.renderText)(this.message.content, renderOptions));
                    spanElement.classList.add(this.classForType(this.message.type));
                    const styles = this.stylesForType(this.message.type);
                    spanElement.style.backgroundColor = styles.background ?? '';
                    spanElement.style.color = styles.foreground ?? '';
                    spanElement.style.border = styles.border ? `1px solid ${styles.border}` : '';
                    dom.append(div, spanElement);
                    return null;
                },
                onHide: () => {
                    this.state = 'closed';
                },
                layout: layout
            });
            // ARIA Support
            let alertText;
            if (this.message.type === 3 /* MessageType.ERROR */) {
                alertText = nls.localize('alertErrorMessage', "Error: {0}", this.message.content);
            }
            else if (this.message.type === 2 /* MessageType.WARNING */) {
                alertText = nls.localize('alertWarningMessage', "Warning: {0}", this.message.content);
            }
            else {
                alertText = nls.localize('alertInfoMessage', "Info: {0}", this.message.content);
            }
            aria.alert(alertText);
            this.state = 'open';
        }
        _hideMessage() {
            if (!this.contextViewProvider) {
                return;
            }
            if (this.state === 'open') {
                this.contextViewProvider.hideContextView();
            }
            this.state = 'idle';
        }
        onValueChange() {
            this._onDidChange.fire(this.value);
            this.validate();
            this.updateMirror();
            this.input.classList.toggle('empty', !this.value);
            if (this.state === 'open' && this.contextViewProvider) {
                this.contextViewProvider.layout();
            }
        }
        updateMirror() {
            if (!this.mirror) {
                return;
            }
            const value = this.value;
            const lastCharCode = value.charCodeAt(value.length - 1);
            const suffix = lastCharCode === 10 ? ' ' : '';
            const mirrorTextContent = (value + suffix)
                .replace(/\u000c/g, ''); // Don't measure with the form feed character, which messes up sizing
            if (mirrorTextContent) {
                this.mirror.textContent = value + suffix;
            }
            else {
                this.mirror.innerText = '\u00a0';
            }
            this.layout();
        }
        applyStyles() {
            const styles = this.options.inputBoxStyles;
            const background = styles.inputBackground ?? '';
            const foreground = styles.inputForeground ?? '';
            const border = styles.inputBorder ?? '';
            this.element.style.backgroundColor = background;
            this.element.style.color = foreground;
            this.input.style.backgroundColor = 'inherit';
            this.input.style.color = foreground;
            // there's always a border, even if the color is not set.
            this.element.style.border = `1px solid ${dom.asCssValueWithDefault(border, 'transparent')}`;
        }
        layout() {
            if (!this.mirror) {
                return;
            }
            const previousHeight = this.cachedContentHeight;
            this.cachedContentHeight = dom.getTotalHeight(this.mirror);
            if (previousHeight !== this.cachedContentHeight) {
                this.cachedHeight = Math.min(this.cachedContentHeight, this.maxHeight);
                this.input.style.height = this.cachedHeight + 'px';
                this._onDidHeightChange.fire(this.cachedContentHeight);
            }
        }
        insertAtCursor(text) {
            const inputElement = this.inputElement;
            const start = inputElement.selectionStart;
            const end = inputElement.selectionEnd;
            const content = inputElement.value;
            if (start !== null && end !== null) {
                this.value = content.substr(0, start) + text + content.substr(end);
                inputElement.setSelectionRange(start + 1, start + 1);
                this.layout();
            }
        }
        dispose() {
            this._hideMessage();
            this.message = null;
            this.actionbar?.dispose();
            super.dispose();
        }
    }
    exports.InputBox = InputBox;
    class HistoryInputBox extends InputBox {
        constructor(container, contextViewProvider, options) {
            const NLS_PLACEHOLDER_HISTORY_HINT = nls.localize({ key: 'history.inputbox.hint', comment: ['Text will be prefixed with \u21C5 plus a single space, then used as a hint where input field keeps history'] }, "for history");
            const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX = ` or \u21C5 ${NLS_PLACEHOLDER_HISTORY_HINT}`;
            const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS = ` (\u21C5 ${NLS_PLACEHOLDER_HISTORY_HINT})`;
            super(container, contextViewProvider, options);
            this._onDidFocus = this._register(new event_2.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_2.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this.history = new history_1.HistoryNavigator(options.history, 100);
            // Function to append the history suffix to the placeholder if necessary
            const addSuffix = () => {
                if (options.showHistoryHint && options.showHistoryHint() && !this.placeholder.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX) && !this.placeholder.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS) && this.history.getHistory().length) {
                    const suffix = this.placeholder.endsWith(')') ? NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX : NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS;
                    const suffixedPlaceholder = this.placeholder + suffix;
                    if (options.showPlaceholderOnFocus && document.activeElement !== this.input) {
                        this.placeholder = suffixedPlaceholder;
                    }
                    else {
                        this.setPlaceHolder(suffixedPlaceholder);
                    }
                }
            };
            // Spot the change to the textarea class attribute which occurs when it changes between non-empty and empty,
            // and add the history suffix to the placeholder if not yet present
            this.observer = new MutationObserver((mutationList, observer) => {
                mutationList.forEach((mutation) => {
                    if (!mutation.target.textContent) {
                        addSuffix();
                    }
                });
            });
            this.observer.observe(this.input, { attributeFilter: ['class'] });
            this.onfocus(this.input, () => addSuffix());
            this.onblur(this.input, () => {
                const resetPlaceholder = (historyHint) => {
                    if (!this.placeholder.endsWith(historyHint)) {
                        return false;
                    }
                    else {
                        const revertedPlaceholder = this.placeholder.slice(0, this.placeholder.length - historyHint.length);
                        if (options.showPlaceholderOnFocus) {
                            this.placeholder = revertedPlaceholder;
                        }
                        else {
                            this.setPlaceHolder(revertedPlaceholder);
                        }
                        return true;
                    }
                };
                if (!resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS)) {
                    resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX);
                }
            });
        }
        dispose() {
            super.dispose();
            if (this.observer) {
                this.observer.disconnect();
                this.observer = undefined;
            }
        }
        addToHistory(always) {
            if (this.value && (always || this.value !== this.getCurrentValue())) {
                this.history.add(this.value);
            }
        }
        prependHistory(restoredHistory) {
            const newHistory = this.getHistory();
            this.clearHistory();
            restoredHistory.forEach((item) => {
                this.history.add(item);
            });
            newHistory.forEach(item => {
                this.history.add(item);
            });
        }
        getHistory() {
            return this.history.getHistory();
        }
        isAtFirstInHistory() {
            return this.history.isFirst();
        }
        isAtLastInHistory() {
            return this.history.isLast();
        }
        isNowhereInHistory() {
            return this.history.isNowhere();
        }
        showNextValue() {
            if (!this.history.has(this.value)) {
                this.addToHistory();
            }
            let next = this.getNextValue();
            if (next) {
                next = next === this.value ? this.getNextValue() : next;
            }
            this.value = next ?? '';
            aria.status(this.value ? this.value : nls.localize('clearedInput', "Cleared Input"));
        }
        showPreviousValue() {
            if (!this.history.has(this.value)) {
                this.addToHistory();
            }
            let previous = this.getPreviousValue();
            if (previous) {
                previous = previous === this.value ? this.getPreviousValue() : previous;
            }
            if (previous) {
                this.value = previous;
                aria.status(this.value);
            }
        }
        clearHistory() {
            this.history.clear();
        }
        onBlur() {
            super.onBlur();
            this._onDidBlur.fire();
        }
        onFocus() {
            super.onFocus();
            this._onDidFocus.fire();
        }
        getCurrentValue() {
            let currentValue = this.history.current();
            if (!currentValue) {
                currentValue = this.history.last();
                this.history.next();
            }
            return currentValue;
        }
        getPreviousValue() {
            return this.history.previous() || this.history.first();
        }
        getNextValue() {
            return this.history.next();
        }
    }
    exports.HistoryInputBox = HistoryInputBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRCb3guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvaW5wdXRib3gvaW5wdXRCb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBNkNoQixJQUFrQixXQUlqQjtJQUpELFdBQWtCLFdBQVc7UUFDNUIsNkNBQVEsQ0FBQTtRQUNSLG1EQUFXLENBQUE7UUFDWCwrQ0FBUyxDQUFBO0lBQ1YsQ0FBQyxFQUppQixXQUFXLDJCQUFYLFdBQVcsUUFJNUI7SUFPWSxRQUFBLG1CQUFtQixHQUFvQjtRQUNuRCxlQUFlLEVBQUUsU0FBUztRQUMxQixlQUFlLEVBQUUsU0FBUztRQUMxQix5QkFBeUIsRUFBRSxTQUFTO1FBQ3BDLDZCQUE2QixFQUFFLFNBQVM7UUFDeEMsNEJBQTRCLEVBQUUsU0FBUztRQUN2QyxnQ0FBZ0MsRUFBRSxTQUFTO1FBQzNDLDBCQUEwQixFQUFFLFNBQVM7UUFDckMsOEJBQThCLEVBQUUsU0FBUztRQUN6QyxXQUFXLEVBQUUsU0FBUztRQUN0Qiw4QkFBOEIsRUFBRSxTQUFTO1FBQ3pDLDZCQUE2QixFQUFFLFNBQVM7UUFDeEMsZ0NBQWdDLEVBQUUsU0FBUztLQUMzQyxDQUFDO0lBRUYsTUFBYSxRQUFTLFNBQVEsZUFBTTtRQXlCbkMsWUFBWSxTQUFzQixFQUFFLG1CQUFxRCxFQUFFLE9BQXNCO1lBQ2hILEtBQUssRUFBRSxDQUFDO1lBZkQsVUFBSyxHQUErQixNQUFNLENBQUM7WUFLM0MsY0FBUyxHQUFXLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztZQUc3QyxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVUsQ0FBQyxDQUFDO1lBQzdDLGdCQUFXLEdBQWtCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxD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