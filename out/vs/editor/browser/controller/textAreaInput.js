/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/performance", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/strings", "vs/editor/browser/controller/textAreaState", "vs/editor/common/core/selection"], function (require, exports, browser, dom, event_1, keyboardEvent_1, performance_1, async_1, event_2, lifecycle_1, mime_1, strings, textAreaState_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextAreaWrapper = exports.ClipboardEventUtils = exports.TextAreaInput = exports.InMemoryClipboardMetadataManager = exports.CopyOptions = exports.TextAreaSyntethicEvents = void 0;
    var TextAreaSyntethicEvents;
    (function (TextAreaSyntethicEvents) {
        TextAreaSyntethicEvents.Tap = '-monaco-textarea-synthetic-tap';
    })(TextAreaSyntethicEvents || (exports.TextAreaSyntethicEvents = TextAreaSyntethicEvents = {}));
    exports.CopyOptions = {
        forceCopyWithSyntaxHighlighting: false
    };
    /**
     * Every time we write to the clipboard, we record a bit of extra metadata here.
     * Every time we read from the cipboard, if the text matches our last written text,
     * we can fetch the previous metadata.
     */
    class InMemoryClipboardMetadataManager {
        static { this.INSTANCE = new InMemoryClipboardMetadataManager(); }
        constructor() {
            this._lastState = null;
        }
        set(lastCopiedValue, data) {
            this._lastState = { lastCopiedValue, data };
        }
        get(pastedText) {
            if (this._lastState && this._lastState.lastCopiedValue === pastedText) {
                // match!
                return this._lastState.data;
            }
            this._lastState = null;
            return null;
        }
    }
    exports.InMemoryClipboardMetadataManager = InMemoryClipboardMetadataManager;
    class CompositionContext {
        constructor() {
            this._lastTypeTextLength = 0;
        }
        handleCompositionUpdate(text) {
            text = text || '';
            const typeInput = {
                text: text,
                replacePrevCharCnt: this._lastTypeTextLength,
                replaceNextCharCnt: 0,
                positionDelta: 0
            };
            this._lastTypeTextLength = text.length;
            return typeInput;
        }
    }
    /**
     * Writes screen reader content to the textarea and is able to analyze its input events to generate:
     *  - onCut
     *  - onPaste
     *  - onType
     *
     * Composition events are generated for presentation purposes (composition input is reflected in onType).
     */
    class TextAreaInput extends lifecycle_1.Disposable {
        get textAreaState() {
            return this._textAreaState;
        }
        constructor(_host, _textArea, _OS, _browser) {
            super();
            this._host = _host;
            this._textArea = _textArea;
            this._OS = _OS;
            this._browser = _browser;
            this._onFocus = this._register(new event_2.Emitter());
            this.onFocus = this._onFocus.event;
            this._onBlur = this._register(new event_2.Emitter());
            this.onBlur = this._onBlur.event;
            this._onKeyDown = this._register(new event_2.Emitter());
            this.onKeyDown = this._onKeyDown.event;
            this._onKeyUp = this._register(new event_2.Emitter());
            this.onKeyUp = this._onKeyUp.event;
            this._onCut = this._register(new event_2.Emitter());
            this.onCut = this._onCut.event;
            this._onPaste = this._register(new event_2.Emitter());
            this.onPaste = this._onPaste.event;
            this._onType = this._register(new event_2.Emitter());
            this.onType = this._onType.event;
            this._onCompositionStart = this._register(new event_2.Emitter());
            this.onCompositionStart = this._onCompositionStart.event;
            this._onCompositionUpdate = this._register(new event_2.Emitter());
            this.onCompositionUpdate = this._onCompositionUpdate.event;
            this._onCompositionEnd = this._register(new event_2.Emitter());
            this.onCompositionEnd = this._onCompositionEnd.event;
            this._onSelectionChangeRequest = this._register(new event_2.Emitter());
            this.onSelectionChangeRequest = this._onSelectionChangeRequest.event;
            this._asyncTriggerCut = this._register(new async_1.RunOnceScheduler(() => this._onCut.fire(), 0));
            this._asyncFocusGainWriteScreenReaderContent = this._register(new async_1.RunOnceScheduler(() => this.writeScreenReaderContent('asyncFocusGain'), 0));
            this._textAreaState = textAreaState_1.TextAreaState.EMPTY;
            this._selectionChangeListener = null;
            this.writeScreenReaderContent('ctor');
            this._hasFocus = false;
            this._currentComposition = null;
            let lastKeyDown = null;
            this._register(this._textArea.onKeyDown((_e) => {
                const e = new keyboardEvent_1.StandardKeyboardEvent(_e);
                if (e.keyCode === 114 /* KeyCode.KEY_IN_COMPOSITION */
                    || (this._currentComposition && e.keyCode === 1 /* KeyCode.Backspace */)) {
                    // Stop propagation for keyDown events if the IME is processing key input
                    e.stopPropagation();
                }
                if (e.equals(9 /* KeyCode.Escape */)) {
                    // Prevent default always for `Esc`, otherwise it will generate a keypress
                    // See https://msdn.microsoft.com/en-us/library/ie/ms536939(v=vs.85).aspx
                    e.preventDefault();
                }
                lastKeyDown = e;
                this._onKeyDown.fire(e);
            }));
            this._register(this._textArea.onKeyUp((_e) => {
                const e = new keyboardEvent_1.StandardKeyboardEvent(_e);
                this._onKeyUp.fire(e);
            }));
            this._register(this._textArea.onCompositionStart((e) => {
                if (textAreaState_1._debugComposition) {
                    console.log(`[compositionstart]`, e);
                }
                const currentComposition = new CompositionContext();
                if (this._currentComposition) {
                    // simply reset the composition context
                    this._currentComposition = currentComposition;
                    return;
                }
                this._currentComposition = currentComposition;
                if (this._OS === 2 /* OperatingSystem.Macintosh */
                    && lastKeyDown
                    && lastKeyDown.equals(114 /* KeyCode.KEY_IN_COMPOSITION */)
                    && this._textAreaState.selectionStart === this._textAreaState.selectionEnd
                    && this._textAreaState.selectionStart > 0
                    && this._textAreaState.value.substr(this._textAreaState.selectionStart - 1, 1) === e.data
                    && (lastKeyDown.code === 'ArrowRight' || lastKeyDown.code === 'ArrowLeft')) {
                    // Handling long press case on Chromium/Safari macOS + arrow key => pretend the character was selected
                    if (textAreaState_1._debugComposition) {
                        console.log(`[compositionstart] Handling long press case on macOS + arrow key`, e);
                    }
                    // Pretend the previous character was composed (in order to get it removed by subsequent compositionupdate events)
                    currentComposition.handleCompositionUpdate('x');
                    this._onCompositionStart.fire({ data: e.data });
                    return;
                }
                if (this._browser.isAndroid) {
                    // when tapping on the editor, Android enters composition mode to edit the current word
                    // so we cannot clear the textarea on Android and we must pretend the current word was selected
                    this._onCompositionStart.fire({ data: e.data });
                    return;
                }
                this._onCompositionStart.fire({ data: e.data });
            }));
            this._register(this._textArea.onCompositionUpdate((e) => {
                if (textAreaState_1._debugComposition) {
                    console.log(`[compositionupdate]`, e);
                }
                const currentComposition = this._currentComposition;
                if (!currentComposition) {
                    // should not be possible to receive a 'compositionupdate' without a 'compositionstart'
                    return;
                }
                if (this._browser.isAndroid) {
                    // On Android, the data sent with the composition update event is unusable.
                    // For example, if the cursor is in the middle of a word like Mic|osoft
                    // and Microsoft is chosen from the keyboard's suggestions, the e.data will contain "Microsoft".
                    // This is not really usable because it doesn't tell us where the edit began and where it ended.
                    const newState = textAreaState_1.TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
                    const typeInput = textAreaState_1.TextAreaState.deduceAndroidCompositionInput(this._textAreaState, newState);
                    this._textAreaState = newState;
                    this._onType.fire(typeInput);
                    this._onCompositionUpdate.fire(e);
                    return;
                }
                const typeInput = currentComposition.handleCompositionUpdate(e.data);
                this._textAreaState = textAreaState_1.TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
                this._onType.fire(typeInput);
                this._onCompositionUpdate.fire(e);
            }));
            this._register(this._textArea.onCompositionEnd((e) => {
                if (textAreaState_1._debugComposition) {
                    console.log(`[compositionend]`, e);
                }
                const currentComposition = this._currentComposition;
                if (!currentComposition) {
                    // https://github.com/microsoft/monaco-editor/issues/1663
                    // On iOS 13.2, Chinese system IME randomly trigger an additional compositionend event with empty data
                    return;
                }
                this._currentComposition = null;
                if (this._browser.isAndroid) {
                    // On Android, the data sent with the composition update event is unusable.
                    // For example, if the cursor is in the middle of a word like Mic|osoft
                    // and Microsoft is chosen from the keyboard's suggestions, the e.data will contain "Microsoft".
                    // This is not really usable because it doesn't tell us where the edit began and where it ended.
                    const newState = textAreaState_1.TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
                    const typeInput = textAreaState_1.TextAreaState.deduceAndroidCompositionInput(this._textAreaState, newState);
                    this._textAreaState = newState;
                    this._onType.fire(typeInput);
                    this._onCompositionEnd.fire();
                    return;
                }
                const typeInput = currentComposition.handleCompositionUpdate(e.data);
                this._textAreaState = textAreaState_1.TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
                this._onType.fire(typeInput);
                this._onCompositionEnd.fire();
            }));
            this._register(this._textArea.onInput((e) => {
                if (textAreaState_1._debugComposition) {
                    console.log(`[input]`, e);
                }
                // Pretend here we touched the text area, as the `input` event will most likely
                // result in a `selectionchange` event which we want to ignore
                this._textArea.setIgnoreSelectionChangeTime('received input event');
                if (this._currentComposition) {
                    return;
                }
                const newState = textAreaState_1.TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
                const typeInput = textAreaState_1.TextAreaState.deduceInput(this._textAreaState, newState, /*couldBeEmojiInput*/ this._OS === 2 /* OperatingSystem.Macintosh */);
                if (typeInput.replacePrevCharCnt === 0 && typeInput.text.length === 1) {
                    // one character was typed
                    if (strings.isHighSurrogate(typeInput.text.charCodeAt(0))
                        || typeInput.text.charCodeAt(0) === 0x7f /* Delete */) {
                        // Ignore invalid input but keep it around for next time
                        return;
                    }
                }
                this._textAreaState = newState;
                if (typeInput.text !== ''
                    || typeInput.replacePrevCharCnt !== 0
                    || typeInput.replaceNextCharCnt !== 0
                    || typeInput.positionDelta !== 0) {
                    this._onType.fire(typeInput);
                }
            }));
            // --- Clipboard operations
            this._register(this._textArea.onCut((e) => {
                // Pretend here we touched the text area, as the `cut` event will most likely
                // result in a `selectionchange` event which we want to ignore
                this._textArea.setIgnoreSelectionChangeTime('received cut event');
                this._ensureClipboardGetsEditorSelection(e);
                this._asyncTriggerCut.schedule();
            }));
            this._register(this._textArea.onCopy((e) => {
                this._ensureClipboardGetsEditorSelection(e);
            }));
            this._register(this._textArea.onPaste((e) => {
                // Pretend here we touched the text area, as the `paste` event will most likely
                // result in a `selectionchange` event which we want to ignore
                this._textArea.setIgnoreSelectionChangeTime('received paste event');
                e.preventDefault();
                if (!e.clipboardData) {
                    return;
                }
                let [text, metadata] = exports.ClipboardEventUtils.getTextData(e.clipboardData);
                if (!text) {
                    return;
                }
                // try the in-memory store
                metadata = metadata || InMemoryClipboardMetadataManager.INSTANCE.get(text);
                this._onPaste.fire({
                    text: text,
                    metadata: metadata
                });
            }));
            this._register(this._textArea.onFocus(() => {
                const hadFocus = this._hasFocus;
                this._setHasFocus(true);
                if (this._browser.isSafari && !hadFocus && this._hasFocus) {
                    // When "tabbing into" the textarea, immediately after dispatching the 'focus' event,
                    // Safari will always move the selection at offset 0 in the textarea
                    this._asyncFocusGainWriteScreenReaderContent.schedule();
                }
            }));
            this._register(this._textArea.onBlur(() => {
                if (this._currentComposition) {
                    // See https://github.com/microsoft/vscode/issues/112621
                    // where compositionend is not triggered when the editor
                    // is taken off-dom during a composition
                    // Clear the flag to be able to write to the textarea
                    this._currentComposition = null;
                    // Clear the textarea to avoid an unwanted cursor type
                    this.writeScreenReaderContent('blurWithoutCompositionEnd');
                    // Fire artificial composition end
                    this._onCompositionEnd.fire();
                }
                this._setHasFocus(false);
            }));
            this._register(this._textArea.onSyntheticTap(() => {
                if (this._browser.isAndroid && this._currentComposition) {
                    // on Android, tapping does not cancel the current composition, so the
                    // textarea is stuck showing the old composition
                    // Clear the flag to be able to write to the textarea
                    this._currentComposition = null;
                    // Clear the textarea to avoid an unwanted cursor type
                    this.writeScreenReaderContent('tapWithoutCompositionEnd');
                    // Fire artificial composition end
                    this._onCompositionEnd.fire();
                }
            }));
        }
        _initializeFromTest() {
            this._hasFocus = true;
            this._textAreaState = textAreaState_1.TextAreaState.readFromTextArea(this._textArea, null);
        }
        _installSelectionChangeListener() {
            // See https://github.com/microsoft/vscode/issues/27216 and https://github.com/microsoft/vscode/issues/98256
            // When using a Braille display, it is possible for users to reposition the
            // system caret. This is reflected in Chrome as a `selectionchange` event.
            //
            // The `selectionchange` event appears to be emitted under numerous other circumstances,
            // so it is quite a challenge to distinguish a `selectionchange` coming in from a user
            // using a Braille display from all the other cases.
            //
            // The problems with the `selectionchange` event are:
            //  * the event is emitted when the textarea is focused programmatically -- textarea.focus()
            //  * the event is emitted when the selection is changed in the textarea programmatically -- textarea.setSelectionRange(...)
            //  * the event is emitted when the value of the textarea is changed programmatically -- textarea.value = '...'
            //  * the event is emitted when tabbing into the textarea
            //  * the event is emitted asynchronously (sometimes with a delay as high as a few tens of ms)
            //  * the event sometimes comes in bursts for a single logical textarea operation
            // `selectionchange` events often come multiple times for a single logical change
            // so throttle multiple `selectionchange` events that burst in a short period of time.
            let previousSelectionChangeEventTime = 0;
            return dom.addDisposableListener(this._textArea.ownerDocument, 'selectionchange', (e) => {
                performance_1.inputLatency.onSelectionChange();
                if (!this._hasFocus) {
                    return;
                }
                if (this._currentComposition) {
                    return;
                }
                if (!this._browser.isChrome) {
                    // Support only for Chrome until testing happens on other browsers
                    return;
                }
                const now = Date.now();
                const delta1 = now - previousSelectionChangeEventTime;
                previousSelectionChangeEventTime = now;
                if (delta1 < 5) {
                    // received another `selectionchange` event within 5ms of the previous `selectionchange` event
                    // => ignore it
                    return;
                }
                const delta2 = now - this._textArea.getIgnoreSelectionChangeTime();
                this._textArea.resetSelectionChangeTime();
                if (delta2 < 100) {
                    // received a `selectionchange` event within 100ms since we touched the textarea
                    // => ignore it, since we caused it
                    return;
                }
                if (!this._textAreaState.selection) {
                    // Cannot correlate a position in the textarea with a position in the editor...
                    return;
                }
                const newValue = this._textArea.getValue();
                if (this._textAreaState.value !== newValue) {
                    // Cannot correlate a position in the textarea with a position in the editor...
                    return;
                }
                const newSelectionStart = this._textArea.getSelectionStart();
                const newSelectionEnd = this._textArea.getSelectionEnd();
                if (this._textAreaState.selectionStart === newSelectionStart && this._textAreaState.selectionEnd === newSelectionEnd) {
                    // Nothing to do...
                    return;
                }
                const _newSelectionStartPosition = this._textAreaState.deduceEditorPosition(newSelectionStart);
                const newSelectionStartPosition = this._host.deduceModelPosition(_newSelectionStartPosition[0], _newSelectionStartPosition[1], _newSelectionStartPosition[2]);
                const _newSelectionEndPosition = this._textAreaState.deduceEditorPosition(newSelectionEnd);
                const newSelectionEndPosition = this._host.deduceModelPosition(_newSelectionEndPosition[0], _newSelectionEndPosition[1], _newSelectionEndPosition[2]);
                const newSelection = new selection_1.Selection(newSelectionStartPosition.lineNumber, newSelectionStartPosition.column, newSelectionEndPosition.lineNumber, newSelectionEndPosition.column);
                this._onSelectionChangeRequest.fire(newSelection);
            });
        }
        dispose() {
            super.dispose();
            if (this._selectionChangeListener) {
                this._selectionChangeListener.dispose();
                this._selectionChangeListener = null;
            }
        }
        focusTextArea() {
            // Setting this._hasFocus and writing the screen reader content
            // will result in a focus() and setSelectionRange() in the textarea
            this._setHasFocus(true);
            // If the editor is off DOM, focus cannot be really set, so let's double check that we have managed to set the focus
            this.refreshFocusState();
        }
        isFocused() {
            return this._hasFocus;
        }
        refreshFocusState() {
            this._setHasFocus(this._textArea.hasFocus());
        }
        _setHasFocus(newHasFocus) {
            if (this._hasFocus === newHasFocus) {
                // no change
                return;
            }
            this._hasFocus = newHasFocus;
            if (this._selectionChangeListener) {
                this._selectionChangeListener.dispose();
                this._selectionChangeListener = null;
            }
            if (this._hasFocus) {
                this._selectionChangeListener = this._installSelectionChangeListener();
            }
            if (this._hasFocus) {
                this.writeScreenReaderContent('focusgain');
            }
            if (this._hasFocus) {
                this._onFocus.fire();
            }
            else {
                this._onBlur.fire();
            }
        }
        _setAndWriteTextAreaState(reason, textAreaState) {
            if (!this._hasFocus) {
                textAreaState = textAreaState.collapseSelection();
            }
            textAreaState.writeToTextArea(reason, this._textArea, this._hasFocus);
            this._textAreaState = textAreaState;
        }
        writeScreenReaderContent(reason) {
            if (this._currentComposition) {
                // Do not write to the text area when doing composition
                return;
            }
            this._setAndWriteTextAreaState(reason, this._host.getScreenReaderContent());
        }
        _ensureClipboardGetsEditorSelection(e) {
            const dataToCopy = this._host.getDataToCopy();
            const storedMetadata = {
                version: 1,
                isFromEmptySelection: dataToCopy.isFromEmptySelection,
                multicursorText: dataToCopy.multicursorText,
                mode: dataToCopy.mode
            };
            InMemoryClipboardMetadataManager.INSTANCE.set(
            // When writing "LINE\r\n" to the clipboard and then pasting,
            // Firefox pastes "LINE\n", so let's work around this quirk
            (this._browser.isFirefox ? dataToCopy.text.replace(/\r\n/g, '\n') : dataToCopy.text), storedMetadata);
            e.preventDefault();
            if (e.clipboardData) {
                exports.ClipboardEventUtils.setTextData(e.clipboardData, dataToCopy.text, dataToCopy.html, storedMetadata);
            }
        }
    }
    exports.TextAreaInput = TextAreaInput;
    exports.ClipboardEventUtils = {
        getTextData(clipboardData) {
            const text = clipboardData.getData(mime_1.Mimes.text);
            let metadata = null;
            const rawmetadata = clipboardData.getData('vscode-editor-data');
            if (typeof rawmetadata === 'string') {
                try {
                    metadata = JSON.parse(rawmetadata);
                    if (metadata.version !== 1) {
                        metadata = null;
                    }
                }
                catch (err) {
                    // no problem!
                }
            }
            if (text.length === 0 && metadata === null && clipboardData.files.length > 0) {
                // no textual data pasted, generate text from file names
                const files = Array.prototype.slice.call(clipboardData.files, 0);
                return [files.map(file => file.name).join('\n'), null];
            }
            return [text, metadata];
        },
        setTextData(clipboardData, text, html, metadata) {
            clipboardData.setData(mime_1.Mimes.text, text);
            if (typeof html === 'string') {
                clipboardData.setData('text/html', html);
            }
            clipboardData.setData('vscode-editor-data', JSON.stringify(metadata));
        }
    };
    class TextAreaWrapper extends lifecycle_1.Disposable {
        get ownerDocument() {
            return this._actual.ownerDocument;
        }
        constructor(_actual) {
            super();
            this._actual = _actual;
            this.onKeyDown = this._register(new event_1.DomEmitter(this._actual, 'keydown')).event;
            this.onKeyPress = this._register(new event_1.DomEmitter(this._actual, 'keypress')).event;
            this.onKeyUp = this._register(new event_1.DomEmitter(this._actual, 'keyup')).event;
            this.onCompositionStart = this._register(new event_1.DomEmitter(this._actual, 'compositionstart')).event;
            this.onCompositionUpdate = this._register(new event_1.DomEmitter(this._actual, 'compositionupdate')).event;
            this.onCompositionEnd = this._register(new event_1.DomEmitter(this._actual, 'compositionend')).event;
            this.onBeforeInput = this._register(new event_1.DomEmitter(this._actual, 'beforeinput')).event;
            this.onInput = this._register(new event_1.DomEmitter(this._actual, 'input')).event;
            this.onCut = this._register(new event_1.DomEmitter(this._actual, 'cut')).event;
            this.onCopy = this._register(new event_1.DomEmitter(this._actual, 'copy')).event;
            this.onPaste = this._register(new event_1.DomEmitter(this._actual, 'paste')).event;
            this.onFocus = this._register(new event_1.DomEmitter(this._actual, 'focus')).event;
            this.onBlur = this._register(new event_1.DomEmitter(this._actual, 'blur')).event;
            this._onSyntheticTap = this._register(new event_2.Emitter());
            this.onSyntheticTap = this._onSyntheticTap.event;
            this._ignoreSelectionChangeTime = 0;
            this._register(this.onKeyDown(() => performance_1.inputLatency.onKeyDown()));
            this._register(this.onBeforeInput(() => performance_1.inputLatency.onBeforeInput()));
            this._register(this.onInput(() => performance_1.inputLatency.onInput()));
            this._register(this.onKeyUp(() => performance_1.inputLatency.onKeyUp()));
            this._register(dom.addDisposableListener(this._actual, TextAreaSyntethicEvents.Tap, () => this._onSyntheticTap.fire()));
        }
        hasFocus() {
            const shadowRoot = dom.getShadowRoot(this._actual);
            if (shadowRoot) {
                return shadowRoot.activeElement === this._actual;
            }
            else if (dom.isInDOM(this._actual)) {
                return this._actual.ownerDocument.activeElement === this._actual;
            }
            else {
                return false;
            }
        }
        setIgnoreSelectionChangeTime(reason) {
            this._ignoreSelectionChangeTime = Date.now();
        }
        getIgnoreSelectionChangeTime() {
            return this._ignoreSelectionChangeTime;
        }
        resetSelectionChangeTime() {
            this._ignoreSelectionChangeTime = 0;
        }
        getValue() {
            // console.log('current value: ' + this._textArea.value);
            return this._actual.value;
        }
        setValue(reason, value) {
            const textArea = this._actual;
            if (textArea.value === value) {
                // No change
                return;
            }
            // console.log('reason: ' + reason + ', current value: ' + textArea.value + ' => new value: ' + value);
            this.setIgnoreSelectionChangeTime('setValue');
            textArea.value = value;
        }
        getSelectionStart() {
            return this._actual.selectionDirection === 'backward' ? this._actual.selectionEnd : this._actual.selectionStart;
        }
        getSelectionEnd() {
            return this._actual.selectionDirection === 'backward' ? this._actual.selectionStart : this._actual.selectionEnd;
        }
        setSelectionRange(reason, selectionStart, selectionEnd) {
            const textArea = this._actual;
            let activeElement = null;
            const shadowRoot = dom.getShadowRoot(textArea);
            if (shadowRoot) {
                activeElement = shadowRoot.activeElement;
            }
            else {
                activeElement = textArea.ownerDocument.activeElement;
            }
            const currentIsFocused = (activeElement === textArea);
            const currentSelectionStart = textArea.selectionStart;
            const currentSelectionEnd = textArea.selectionEnd;
            if (currentIsFocused && currentSelectionStart === selectionStart && currentSelectionEnd === selectionEnd) {
                // No change
                // Firefox iframe bug https://github.com/microsoft/monaco-editor/issues/643#issuecomment-367871377
                if (browser.isFirefox && window.parent !== window) {
                    textArea.focus();
                }
                return;
            }
            // console.log('reason: ' + reason + ', setSelectionRange: ' + selectionStart + ' -> ' + selectionEnd);
            if (currentIsFocused) {
                // No need to focus, only need to change the selection range
                this.setIgnoreSelectionChangeTime('setSelectionRange');
                textArea.setSelectionRange(selectionStart, selectionEnd);
                if (browser.isFirefox && window.parent !== window) {
                    textArea.focus();
                }
                return;
            }
            // If the focus is outside the textarea, browsers will try really hard to reveal the textarea.
            // Here, we try to undo the browser's desperate reveal.
            try {
                const scrollState = dom.saveParentsScrollTop(textArea);
                this.setIgnoreSelectionChangeTime('setSelectionRange');
                textArea.focus();
                textArea.setSelectionRange(selectionStart, selectionEnd);
                dom.restoreParentsScrollTop(textArea, scrollState);
            }
            catch (e) {
                // Sometimes IE throws when setting selection (e.g. textarea is off-DOM)
            }
        }
    }
    exports.TextAreaWrapper = TextAreaWrapper;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEFyZWFJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL2NvbnRyb2xsZXIvdGV4dEFyZWFJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLElBQWlCLHVCQUF1QixDQUV2QztJQUZELFdBQWlCLHVCQUF1QjtRQUMxQiwyQkFBRyxHQUFHLGdDQUFnQyxDQUFDO0lBQ3JELENBQUMsRUFGZ0IsdUJBQXVCLHVDQUF2Qix1QkFBdUIsUUFFdkM7SUFNWSxRQUFBLFdBQVcsR0FBRztRQUMxQiwrQkFBK0IsRUFBRSxLQUFLO0tBQ3RDLENBQUM7SUFpQ0Y7Ozs7T0FJRztJQUNILE1BQWEsZ0NBQWdDO2lCQUNyQixhQUFRLEdBQUcsSUFBSSxnQ0FBZ0MsRUFBRSxDQUFDO1FBSXpFO1lBQ0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDeEIsQ0FBQztRQUVNLEdBQUcsQ0FBQyxlQUF1QixFQUFFLElBQTZCO1lBQ2hFLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUVNLEdBQUcsQ0FBQyxVQUFrQjtZQUM1QixJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEtBQUssVUFBVSxFQUFFO2dCQUN0RSxTQUFTO2dCQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFDNUI7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7O0lBcEJGLDRFQXFCQztJQXNDRCxNQUFNLGtCQUFrQjtRQUl2QjtZQUNDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVNLHVCQUF1QixDQUFDLElB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