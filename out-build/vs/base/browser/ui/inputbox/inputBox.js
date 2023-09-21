/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/formattedTextRenderer", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/base/common/history", "vs/base/common/objects", "vs/nls!vs/base/browser/ui/inputbox/inputBox", "vs/css!./inputBox"], function (require, exports, dom, event_1, formattedTextRenderer_1, actionbar_1, aria, scrollableElement_1, widget_1, event_2, history_1, objects_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tR = exports.$sR = exports.$rR = exports.MessageType = void 0;
    const $ = dom.$;
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["INFO"] = 1] = "INFO";
        MessageType[MessageType["WARNING"] = 2] = "WARNING";
        MessageType[MessageType["ERROR"] = 3] = "ERROR";
    })(MessageType || (exports.MessageType = MessageType = {}));
    exports.$rR = {
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
    class $sR extends widget_1.$IP {
        constructor(container, contextViewProvider, options) {
            super();
            this.w = 'idle';
            this.M = Number.POSITIVE_INFINITY;
            this.O = this.B(new event_2.$fd());
            this.onDidChange = this.O.event;
            this.P = this.B(new event_2.$fd());
            this.onDidHeightChange = this.P.event;
            this.a = contextViewProvider;
            this.g = options;
            this.h = null;
            this.n = this.g.placeholder || '';
            this.r = this.g.tooltip ?? (this.n || '');
            this.s = this.g.ariaLabel || '';
            if (this.g.validationOptions) {
                this.t = this.g.validationOptions.validation;
            }
            this.element = dom.$0O(container, $('.monaco-inputbox.idle'));
            const tagName = this.g.flexibleHeight ? 'textarea' : 'input';
            const wrapper = dom.$0O(this.element, $('.ibwrapper'));
            this.b = dom.$0O(wrapper, $(tagName + '.input.empty'));
            this.b.setAttribute('autocorrect', 'off');
            this.b.setAttribute('autocapitalize', 'off');
            this.b.setAttribute('spellcheck', 'false');
            this.G(this.b, () => this.element.classList.add('synthetic-focus'));
            this.F(this.b, () => this.element.classList.remove('synthetic-focus'));
            if (this.g.flexibleHeight) {
                this.M = typeof this.g.flexibleMaxHeight === 'number' ? this.g.flexibleMaxHeight : Number.POSITIVE_INFINITY;
                this.y = dom.$0O(wrapper, $('div.mirror'));
                this.y.innerText = '\u00a0';
                this.N = new scrollableElement_1.$SP(this.element, { vertical: 1 /* ScrollbarVisibility.Auto */ });
                if (this.g.flexibleWidth) {
                    this.b.setAttribute('wrap', 'off');
                    this.y.style.whiteSpace = 'pre';
                    this.y.style.wordWrap = 'initial';
                }
                dom.$0O(container, this.N.getDomNode());
                this.B(this.N);
                // from ScrollableElement to DOM
                this.B(this.N.onScroll(e => this.b.scrollTop = e.scrollTop));
                const onSelectionChange = this.B(new event_1.$9P(document, 'selectionchange'));
                const onAnchoredSelectionChange = event_2.Event.filter(onSelectionChange.event, () => {
                    const selection = document.getSelection();
                    return selection?.anchorNode === wrapper;
                });
                // from DOM to ScrollableElement
                this.B(onAnchoredSelectionChange(this.S, this));
                this.B(this.onDidHeightChange(this.S, this));
            }
            else {
                this.b.type = this.g.type || 'text';
                this.b.setAttribute('wrap', 'off');
            }
            if (this.s) {
                this.b.setAttribute('aria-label', this.s);
            }
            if (this.n && !this.g.showPlaceholderOnFocus) {
                this.setPlaceHolder(this.n);
            }
            if (this.r) {
                this.setTooltip(this.r);
            }
            this.D(this.b, () => this.Y());
            this.F(this.b, () => this.Q());
            this.G(this.b, () => this.R());
            this.B(this.I(this.b));
            setTimeout(() => this.Z(), 0);
            // Support actions
            if (this.g.actions) {
                this.c = this.B(new actionbar_1.$1P(this.element));
                this.c.push(this.g.actions, { icon: true, label: false });
            }
            this.ab();
        }
        Q() {
            this.X();
            if (this.g.showPlaceholderOnFocus) {
                this.b.setAttribute('placeholder', '');
            }
        }
        R() {
            this.W();
            if (this.g.showPlaceholderOnFocus) {
                this.b.setAttribute('placeholder', this.n || '');
            }
        }
        setPlaceHolder(placeHolder) {
            this.n = placeHolder;
            this.b.setAttribute('placeholder', placeHolder);
        }
        setTooltip(tooltip) {
            this.r = tooltip;
            this.b.title = tooltip;
        }
        setAriaLabel(label) {
            this.s = label;
            if (label) {
                this.b.setAttribute('aria-label', this.s);
            }
            else {
                this.b.removeAttribute('aria-label');
            }
        }
        getAriaLabel() {
            return this.s;
        }
        get mirrorElement() {
            return this.y;
        }
        get inputElement() {
            return this.b;
        }
        get value() {
            return this.b.value;
        }
        set value(newValue) {
            if (this.b.value !== newValue) {
                this.b.value = newValue;
                this.Y();
            }
        }
        get step() {
            return this.b.step;
        }
        set step(newValue) {
            this.b.step = newValue;
        }
        get height() {
            return typeof this.J === 'number' ? this.J : dom.$LO(this.element);
        }
        focus() {
            this.b.focus();
        }
        blur() {
            this.b.blur();
        }
        hasFocus() {
            return document.activeElement === this.b;
        }
        select(range = null) {
            this.b.select();
            if (range) {
                this.b.setSelectionRange(range.start, range.end);
                if (range.end === this.b.value.length) {
                    this.b.scrollLeft = this.b.scrollWidth;
                }
            }
        }
        isSelectionAtEnd() {
            return this.b.selectionEnd === this.b.value.length && this.b.selectionStart === this.b.selectionEnd;
        }
        enable() {
            this.b.removeAttribute('disabled');
        }
        disable() {
            this.blur();
            this.b.disabled = true;
            this.X();
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
            return dom.$HO(this.b);
        }
        set width(width) {
            if (this.g.flexibleHeight && this.g.flexibleWidth) {
                // textarea with horizontal scrolling
                let horizontalPadding = 0;
                if (this.y) {
                    const paddingLeft = parseFloat(this.y.style.paddingLeft || '') || 0;
                    const paddingRight = parseFloat(this.y.style.paddingRight || '') || 0;
                    horizontalPadding = paddingLeft + paddingRight;
                }
                this.b.style.width = (width - horizontalPadding) + 'px';
            }
            else {
                this.b.style.width = width + 'px';
            }
            if (this.y) {
                this.y.style.width = width + 'px';
            }
        }
        set paddingRight(paddingRight) {
            // Set width to avoid hint text overlapping buttons
            this.b.style.width = `calc(100% - ${paddingRight}px)`;
            if (this.y) {
                this.y.style.paddingRight = paddingRight + 'px';
            }
        }
        S() {
            if (typeof this.L !== 'number' || typeof this.J !== 'number' || !this.N) {
                return;
            }
            const scrollHeight = this.L;
            const height = this.J;
            const scrollTop = this.b.scrollTop;
            this.N.setScrollDimensions({ scrollHeight, height });
            this.N.setScrollPosition({ scrollTop });
        }
        showMessage(message, force) {
            if (this.w === 'open' && (0, objects_1.$Zm)(this.h, message)) {
                // Already showing
                return;
            }
            this.h = message;
            this.element.classList.remove('idle');
            this.element.classList.remove('info');
            this.element.classList.remove('warning');
            this.element.classList.remove('error');
            this.element.classList.add(this.U(message.type));
            const styles = this.stylesForType(this.h.type);
            this.element.style.border = `1px solid ${dom.$pP(styles.border, 'transparent')}`;
            if (this.h.content && (this.hasFocus() || force)) {
                this.W();
            }
        }
        hideMessage() {
            this.h = null;
            this.element.classList.remove('info');
            this.element.classList.remove('warning');
            this.element.classList.remove('error');
            this.element.classList.add('idle');
            this.X();
            this.ab();
        }
        isInputValid() {
            return !!this.t && !this.t(this.value);
        }
        validate() {
            let errorMsg = null;
            if (this.t) {
                errorMsg = this.t(this.value);
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
            const styles = this.g.inputBoxStyles;
            switch (type) {
                case 1 /* MessageType.INFO */: return { border: styles.inputValidationInfoBorder, background: styles.inputValidationInfoBackground, foreground: styles.inputValidationInfoForeground };
                case 2 /* MessageType.WARNING */: return { border: styles.inputValidationWarningBorder, background: styles.inputValidationWarningBackground, foreground: styles.inputValidationWarningForeground };
                default: return { border: styles.inputValidationErrorBorder, background: styles.inputValidationErrorBackground, foreground: styles.inputValidationErrorForeground };
            }
        }
        U(type) {
            switch (type) {
                case 1 /* MessageType.INFO */: return 'info';
                case 2 /* MessageType.WARNING */: return 'warning';
                default: return 'error';
            }
        }
        W() {
            if (!this.a || !this.h) {
                return;
            }
            let div;
            const layout = () => div.style.width = dom.$HO(this.element) + 'px';
            this.a.showContextView({
                getAnchor: () => this.element,
                anchorAlignment: 1 /* AnchorAlignment.RIGHT */,
                render: (container) => {
                    if (!this.h) {
                        return null;
                    }
                    div = dom.$0O(container, $('.monaco-inputbox-container'));
                    layout();
                    const renderOptions = {
                        inline: true,
                        className: 'monaco-inputbox-message'
                    };
                    const spanElement = (this.h.formatContent
                        ? (0, formattedTextRenderer_1.$7P)(this.h.content, renderOptions)
                        : (0, formattedTextRenderer_1.$6P)(this.h.content, renderOptions));
                    spanElement.classList.add(this.U(this.h.type));
                    const styles = this.stylesForType(this.h.type);
                    spanElement.style.backgroundColor = styles.background ?? '';
                    spanElement.style.color = styles.foreground ?? '';
                    spanElement.style.border = styles.border ? `1px solid ${styles.border}` : '';
                    dom.$0O(div, spanElement);
                    return null;
                },
                onHide: () => {
                    this.w = 'closed';
                },
                layout: layout
            });
            // ARIA Support
            let alertText;
            if (this.h.type === 3 /* MessageType.ERROR */) {
                alertText = nls.localize(0, null, this.h.content);
            }
            else if (this.h.type === 2 /* MessageType.WARNING */) {
                alertText = nls.localize(1, null, this.h.content);
            }
            else {
                alertText = nls.localize(2, null, this.h.content);
            }
            aria.$$P(alertText);
            this.w = 'open';
        }
        X() {
            if (!this.a) {
                return;
            }
            if (this.w === 'open') {
                this.a.hideContextView();
            }
            this.w = 'idle';
        }
        Y() {
            this.O.fire(this.value);
            this.validate();
            this.Z();
            this.b.classList.toggle('empty', !this.value);
            if (this.w === 'open' && this.a) {
                this.a.layout();
            }
        }
        Z() {
            if (!this.y) {
                return;
            }
            const value = this.value;
            const lastCharCode = value.charCodeAt(value.length - 1);
            const suffix = lastCharCode === 10 ? ' ' : '';
            const mirrorTextContent = (value + suffix)
                .replace(/\u000c/g, ''); // Don't measure with the form feed character, which messes up sizing
            if (mirrorTextContent) {
                this.y.textContent = value + suffix;
            }
            else {
                this.y.innerText = '\u00a0';
            }
            this.layout();
        }
        ab() {
            const styles = this.g.inputBoxStyles;
            const background = styles.inputBackground ?? '';
            const foreground = styles.inputForeground ?? '';
            const border = styles.inputBorder ?? '';
            this.element.style.backgroundColor = background;
            this.element.style.color = foreground;
            this.b.style.backgroundColor = 'inherit';
            this.b.style.color = foreground;
            // there's always a border, even if the color is not set.
            this.element.style.border = `1px solid ${dom.$pP(border, 'transparent')}`;
        }
        layout() {
            if (!this.y) {
                return;
            }
            const previousHeight = this.L;
            this.L = dom.$LO(this.y);
            if (previousHeight !== this.L) {
                this.J = Math.min(this.L, this.M);
                this.b.style.height = this.J + 'px';
                this.P.fire(this.L);
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
            this.X();
            this.h = null;
            this.c?.dispose();
            super.dispose();
        }
    }
    exports.$sR = $sR;
    class $tR extends $sR {
        constructor(container, contextViewProvider, options) {
            const NLS_PLACEHOLDER_HISTORY_HINT = nls.localize(3, null);
            const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX = ` or \u21C5 ${NLS_PLACEHOLDER_HISTORY_HINT}`;
            const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS = ` (\u21C5 ${NLS_PLACEHOLDER_HISTORY_HINT})`;
            super(container, contextViewProvider, options);
            this.db = this.B(new event_2.$fd());
            this.onDidFocus = this.db.event;
            this.eb = this.B(new event_2.$fd());
            this.onDidBlur = this.eb.event;
            this.bb = new history_1.$pR(options.history, 100);
            // Function to append the history suffix to the placeholder if necessary
            const addSuffix = () => {
                if (options.showHistoryHint && options.showHistoryHint() && !this.n.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX) && !this.n.endsWith(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS) && this.bb.getHistory().length) {
                    const suffix = this.n.endsWith(')') ? NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX : NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS;
                    const suffixedPlaceholder = this.n + suffix;
                    if (options.showPlaceholderOnFocus && document.activeElement !== this.b) {
                        this.n = suffixedPlaceholder;
                    }
                    else {
                        this.setPlaceHolder(suffixedPlaceholder);
                    }
                }
            };
            // Spot the change to the textarea class attribute which occurs when it changes between non-empty and empty,
            // and add the history suffix to the placeholder if not yet present
            this.cb = new MutationObserver((mutationList, observer) => {
                mutationList.forEach((mutation) => {
                    if (!mutation.target.textContent) {
                        addSuffix();
                    }
                });
            });
            this.cb.observe(this.b, { attributeFilter: ['class'] });
            this.G(this.b, () => addSuffix());
            this.F(this.b, () => {
                const resetPlaceholder = (historyHint) => {
                    if (!this.n.endsWith(historyHint)) {
                        return false;
                    }
                    else {
                        const revertedPlaceholder = this.n.slice(0, this.n.length - historyHint.length);
                        if (options.showPlaceholderOnFocus) {
                            this.n = revertedPlaceholder;
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
            if (this.cb) {
                this.cb.disconnect();
                this.cb = undefined;
            }
        }
        addToHistory(always) {
            if (this.value && (always || this.value !== this.hb())) {
                this.bb.add(this.value);
            }
        }
        prependHistory(restoredHistory) {
            const newHistory = this.getHistory();
            this.clearHistory();
            restoredHistory.forEach((item) => {
                this.bb.add(item);
            });
            newHistory.forEach(item => {
                this.bb.add(item);
            });
        }
        getHistory() {
            return this.bb.getHistory();
        }
        isAtFirstInHistory() {
            return this.bb.isFirst();
        }
        isAtLastInHistory() {
            return this.bb.isLast();
        }
        isNowhereInHistory() {
            return this.bb.isNowhere();
        }
        showNextValue() {
            if (!this.bb.has(this.value)) {
                this.addToHistory();
            }
            let next = this.jb();
            if (next) {
                next = next === this.value ? this.jb() : next;
            }
            this.value = next ?? '';
            aria.$_P(this.value ? this.value : nls.localize(4, null));
        }
        showPreviousValue() {
            if (!this.bb.has(this.value)) {
                this.addToHistory();
            }
            let previous = this.ib();
            if (previous) {
                previous = previous === this.value ? this.ib() : previous;
            }
            if (previous) {
                this.value = previous;
                aria.$_P(this.value);
            }
        }
        clearHistory() {
            this.bb.clear();
        }
        Q() {
            super.Q();
            this.eb.fire();
        }
        R() {
            super.R();
            this.db.fire();
        }
        hb() {
            let currentValue = this.bb.current();
            if (!currentValue) {
                currentValue = this.bb.last();
                this.bb.next();
            }
            return currentValue;
        }
        ib() {
            return this.bb.previous() || this.bb.first();
        }
        jb() {
            return this.bb.next();
        }
    }
    exports.$tR = $tR;
});
//# sourceMappingURL=inputBox.js.map