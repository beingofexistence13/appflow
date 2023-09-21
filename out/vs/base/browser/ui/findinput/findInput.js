/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInputToggles", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/nls", "vs/base/common/lifecycle", "vs/css!./findInput"], function (require, exports, dom, findInputToggles_1, inputBox_1, widget_1, event_1, nls, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindInput = void 0;
    const NLS_DEFAULT_LABEL = nls.localize('defaultLabel', "input");
    class FindInput extends widget_1.Widget {
        static { this.OPTION_CHANGE = 'optionChange'; }
        constructor(parent, contextViewProvider, options) {
            super();
            this.fixFocusOnOptionClickEnabled = true;
            this.imeSessionInProgress = false;
            this.additionalTogglesDisposables = this._register(new lifecycle_1.MutableDisposable());
            this.additionalToggles = [];
            this._onDidOptionChange = this._register(new event_1.Emitter());
            this.onDidOptionChange = this._onDidOptionChange.event;
            this._onKeyDown = this._register(new event_1.Emitter());
            this.onKeyDown = this._onKeyDown.event;
            this._onMouseDown = this._register(new event_1.Emitter());
            this.onMouseDown = this._onMouseDown.event;
            this._onInput = this._register(new event_1.Emitter());
            this.onInput = this._onInput.event;
            this._onKeyUp = this._register(new event_1.Emitter());
            this.onKeyUp = this._onKeyUp.event;
            this._onCaseSensitiveKeyDown = this._register(new event_1.Emitter());
            this.onCaseSensitiveKeyDown = this._onCaseSensitiveKeyDown.event;
            this._onRegexKeyDown = this._register(new event_1.Emitter());
            this.onRegexKeyDown = this._onRegexKeyDown.event;
            this._lastHighlightFindOptions = 0;
            this.placeholder = options.placeholder || '';
            this.validation = options.validation;
            this.label = options.label || NLS_DEFAULT_LABEL;
            this.showCommonFindToggles = !!options.showCommonFindToggles;
            const appendCaseSensitiveLabel = options.appendCaseSensitiveLabel || '';
            const appendWholeWordsLabel = options.appendWholeWordsLabel || '';
            const appendRegexLabel = options.appendRegexLabel || '';
            const history = options.history || [];
            const flexibleHeight = !!options.flexibleHeight;
            const flexibleWidth = !!options.flexibleWidth;
            const flexibleMaxHeight = options.flexibleMaxHeight;
            this.domNode = document.createElement('div');
            this.domNode.classList.add('monaco-findInput');
            this.inputBox = this._register(new inputBox_1.HistoryInputBox(this.domNode, contextViewProvider, {
                placeholder: this.placeholder || '',
                ariaLabel: this.label || '',
                validationOptions: {
                    validation: this.validation
                },
                history,
                showHistoryHint: options.showHistoryHint,
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight,
                inputBoxStyles: options.inputBoxStyles,
            }));
            if (this.showCommonFindToggles) {
                this.regex = this._register(new findInputToggles_1.RegexToggle({
                    appendTitle: appendRegexLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this._register(this.regex.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this._register(this.regex.onKeyDown(e => {
                    this._onRegexKeyDown.fire(e);
                }));
                this.wholeWords = this._register(new findInputToggles_1.WholeWordsToggle({
                    appendTitle: appendWholeWordsLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this._register(this.wholeWords.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this.caseSensitive = this._register(new findInputToggles_1.CaseSensitiveToggle({
                    appendTitle: appendCaseSensitiveLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this._register(this.caseSensitive.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this._register(this.caseSensitive.onKeyDown(e => {
                    this._onCaseSensitiveKeyDown.fire(e);
                }));
                // Arrow-Key support to navigate between options
                const indexes = [this.caseSensitive.domNode, this.wholeWords.domNode, this.regex.domNode];
                this.onkeydown(this.domNode, (event) => {
                    if (event.equals(15 /* KeyCode.LeftArrow */) || event.equals(17 /* KeyCode.RightArrow */) || event.equals(9 /* KeyCode.Escape */)) {
                        const index = indexes.indexOf(document.activeElement);
                        if (index >= 0) {
                            let newIndex = -1;
                            if (event.equals(17 /* KeyCode.RightArrow */)) {
                                newIndex = (index + 1) % indexes.length;
                            }
                            else if (event.equals(15 /* KeyCode.LeftArrow */)) {
                                if (index === 0) {
                                    newIndex = indexes.length - 1;
                                }
                                else {
                                    newIndex = index - 1;
                                }
                            }
                            if (event.equals(9 /* KeyCode.Escape */)) {
                                indexes[index].blur();
                                this.inputBox.focus();
                            }
                            else if (newIndex >= 0) {
                                indexes[newIndex].focus();
                            }
                            dom.EventHelper.stop(event, true);
                        }
                    }
                });
            }
            this.controls = document.createElement('div');
            this.controls.className = 'controls';
            this.controls.style.display = this.showCommonFindToggles ? '' : 'none';
            if (this.caseSensitive) {
                this.controls.append(this.caseSensitive.domNode);
            }
            if (this.wholeWords) {
                this.controls.appendChild(this.wholeWords.domNode);
            }
            if (this.regex) {
                this.controls.appendChild(this.regex.domNode);
            }
            this.setAdditionalToggles(options?.additionalToggles);
            if (this.controls) {
                this.domNode.appendChild(this.controls);
            }
            parent?.appendChild(this.domNode);
            this._register(dom.addDisposableListener(this.inputBox.inputElement, 'compositionstart', (e) => {
                this.imeSessionInProgress = true;
            }));
            this._register(dom.addDisposableListener(this.inputBox.inputElement, 'compositionend', (e) => {
                this.imeSessionInProgress = false;
                this._onInput.fire();
            }));
            this.onkeydown(this.inputBox.inputElement, (e) => this._onKeyDown.fire(e));
            this.onkeyup(this.inputBox.inputElement, (e) => this._onKeyUp.fire(e));
            this.oninput(this.inputBox.inputElement, (e) => this._onInput.fire());
            this.onmousedown(this.inputBox.inputElement, (e) => this._onMouseDown.fire(e));
        }
        get isImeSessionInProgress() {
            return this.imeSessionInProgress;
        }
        get onDidChange() {
            return this.inputBox.onDidChange;
        }
        layout(style) {
            this.inputBox.layout();
            this.updateInputBoxPadding(style.collapsedFindWidget);
        }
        enable() {
            this.domNode.classList.remove('disabled');
            this.inputBox.enable();
            this.regex?.enable();
            this.wholeWords?.enable();
            this.caseSensitive?.enable();
            for (const toggle of this.additionalToggles) {
                toggle.enable();
            }
        }
        disable() {
            this.domNode.classList.add('disabled');
            this.inputBox.disable();
            this.regex?.disable();
            this.wholeWords?.disable();
            this.caseSensitive?.disable();
            for (const toggle of this.additionalToggles) {
                toggle.disable();
            }
        }
        setFocusInputOnOptionClick(value) {
            this.fixFocusOnOptionClickEnabled = value;
        }
        setEnabled(enabled) {
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        setAdditionalToggles(toggles) {
            for (const currentToggle of this.additionalToggles) {
                currentToggle.domNode.remove();
            }
            this.additionalToggles = [];
            this.additionalTogglesDisposables.value = new lifecycle_1.DisposableStore();
            for (const toggle of toggles ?? []) {
                this.additionalTogglesDisposables.value.add(toggle);
                this.controls.appendChild(toggle.domNode);
                this.additionalTogglesDisposables.value.add(toggle.onChange(viaKeyboard => {
                    this._onDidOptionChange.fire(viaKeyboard);
                    if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
                        this.inputBox.focus();
                    }
                }));
                this.additionalToggles.push(toggle);
            }
            if (this.additionalToggles.length > 0) {
                this.controls.style.display = '';
            }
            this.updateInputBoxPadding();
        }
        updateInputBoxPadding(controlsHidden = false) {
            if (controlsHidden) {
                this.inputBox.paddingRight = 0;
            }
            else {
                this.inputBox.paddingRight =
                    ((this.caseSensitive?.width() ?? 0) + (this.wholeWords?.width() ?? 0) + (this.regex?.width() ?? 0))
                        + this.additionalToggles.reduce((r, t) => r + t.width(), 0);
            }
        }
        clear() {
            this.clearValidation();
            this.setValue('');
            this.focus();
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            if (this.inputBox.value !== value) {
                this.inputBox.value = value;
            }
        }
        onSearchSubmit() {
            this.inputBox.addToHistory();
        }
        select() {
            this.inputBox.select();
        }
        focus() {
            this.inputBox.focus();
        }
        getCaseSensitive() {
            return this.caseSensitive?.checked ?? false;
        }
        setCaseSensitive(value) {
            if (this.caseSensitive) {
                this.caseSensitive.checked = value;
            }
        }
        getWholeWords() {
            return this.wholeWords?.checked ?? false;
        }
        setWholeWords(value) {
            if (this.wholeWords) {
                this.wholeWords.checked = value;
            }
        }
        getRegex() {
            return this.regex?.checked ?? false;
        }
        setRegex(value) {
            if (this.regex) {
                this.regex.checked = value;
                this.validate();
            }
        }
        focusOnCaseSensitive() {
            this.caseSensitive?.focus();
        }
        focusOnRegex() {
            this.regex?.focus();
        }
        highlightFindOptions() {
            this.domNode.classList.remove('highlight-' + (this._lastHighlightFindOptions));
            this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
            this.domNode.classList.add('highlight-' + (this._lastHighlightFindOptions));
        }
        validate() {
            this.inputBox.validate();
        }
        showMessage(message) {
            this.inputBox.showMessage(message);
        }
        clearMessage() {
            this.inputBox.hideMessage();
        }
        clearValidation() {
            this.inputBox.hideMessage();
        }
    }
    exports.FindInput = FindInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZElucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2ZpbmRpbnB1dC9maW5kSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUNoRyxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWhFLE1BQWEsU0FBVSxTQUFRLGVBQU07aUJBRXBCLGtCQUFhLEdBQVcsY0FBYyxBQUF6QixDQUEwQjtRQXVDdkQsWUFBWSxNQUEwQixFQUFFLG1CQUFxRCxFQUFFLE9BQTBCO1lBQ3hILEtBQUssRUFBRSxDQUFDO1lBbENELGlDQUE0QixHQUFHLElBQUksQ0FBQztZQUNwQyx5QkFBb0IsR0FBRyxLQUFLLENBQUM7WUFDN0IsaUNBQTRCLEdBQXVDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFNekcsc0JBQWlCLEdBQWEsRUFBRSxDQUFDO1lBSTFCLHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVcsQ0FBQyxDQUFDO1lBQzdELHNCQUFpQixHQUFzQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBRXBGLGVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrQixDQUFDLENBQUM7WUFDNUQsY0FBUyxHQUEwQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUV4RCxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWUsQ0FBQyxDQUFDO1lBQzNELGdCQUFXLEdBQXVCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRXpELGFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxF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