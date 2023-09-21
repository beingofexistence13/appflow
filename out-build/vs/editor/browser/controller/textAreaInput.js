/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/performance", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/strings", "vs/editor/browser/controller/textAreaState", "vs/editor/common/core/selection"], function (require, exports, browser, dom, event_1, keyboardEvent_1, performance_1, async_1, event_2, lifecycle_1, mime_1, strings, textAreaState_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bX = exports.$aX = exports.$_W = exports.$$W = exports.$0W = exports.TextAreaSyntethicEvents = void 0;
    var TextAreaSyntethicEvents;
    (function (TextAreaSyntethicEvents) {
        TextAreaSyntethicEvents.Tap = '-monaco-textarea-synthetic-tap';
    })(TextAreaSyntethicEvents || (exports.TextAreaSyntethicEvents = TextAreaSyntethicEvents = {}));
    exports.$0W = {
        forceCopyWithSyntaxHighlighting: false
    };
    /**
     * Every time we write to the clipboard, we record a bit of extra metadata here.
     * Every time we read from the cipboard, if the text matches our last written text,
     * we can fetch the previous metadata.
     */
    class $$W {
        static { this.INSTANCE = new $$W(); }
        constructor() {
            this.a = null;
        }
        set(lastCopiedValue, data) {
            this.a = { lastCopiedValue, data };
        }
        get(pastedText) {
            if (this.a && this.a.lastCopiedValue === pastedText) {
                // match!
                return this.a.data;
            }
            this.a = null;
            return null;
        }
    }
    exports.$$W = $$W;
    class CompositionContext {
        constructor() {
            this.a = 0;
        }
        handleCompositionUpdate(text) {
            text = text || '';
            const typeInput = {
                text: text,
                replacePrevCharCnt: this.a,
                replaceNextCharCnt: 0,
                positionDelta: 0
            };
            this.a = text.length;
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
    class $_W extends lifecycle_1.$kc {
        get textAreaState() {
            return this.w;
        }
        constructor(D, F, G, H) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.a = this.B(new event_2.$fd());
            this.onFocus = this.a.event;
            this.b = this.B(new event_2.$fd());
            this.onBlur = this.b.event;
            this.c = this.B(new event_2.$fd());
            this.onKeyDown = this.c.event;
            this.f = this.B(new event_2.$fd());
            this.onKeyUp = this.f.event;
            this.g = this.B(new event_2.$fd());
            this.onCut = this.g.event;
            this.h = this.B(new event_2.$fd());
            this.onPaste = this.h.event;
            this.j = this.B(new event_2.$fd());
            this.onType = this.j.event;
            this.m = this.B(new event_2.$fd());
            this.onCompositionStart = this.m.event;
            this.n = this.B(new event_2.$fd());
            this.onCompositionUpdate = this.n.event;
            this.r = this.B(new event_2.$fd());
            this.onCompositionEnd = this.r.event;
            this.s = this.B(new event_2.$fd());
            this.onSelectionChangeRequest = this.s.event;
            this.t = this.B(new async_1.$Sg(() => this.g.fire(), 0));
            this.u = this.B(new async_1.$Sg(() => this.writeScreenReaderContent('asyncFocusGain'), 0));
            this.w = textAreaState_1.$8W.EMPTY;
            this.y = null;
            this.writeScreenReaderContent('ctor');
            this.z = false;
            this.C = null;
            let lastKeyDown = null;
            this.B(this.F.onKeyDown((_e) => {
                const e = new keyboardEvent_1.$jO(_e);
                if (e.keyCode === 114 /* KeyCode.KEY_IN_COMPOSITION */
                    || (this.C && e.keyCode === 1 /* KeyCode.Backspace */)) {
                    // Stop propagation for keyDown events if the IME is processing key input
                    e.stopPropagation();
                }
                if (e.equals(9 /* KeyCode.Escape */)) {
                    // Prevent default always for `Esc`, otherwise it will generate a keypress
                    // See https://msdn.microsoft.com/en-us/library/ie/ms536939(v=vs.85).aspx
                    e.preventDefault();
                }
                lastKeyDown = e;
                this.c.fire(e);
            }));
            this.B(this.F.onKeyUp((_e) => {
                const e = new keyboardEvent_1.$jO(_e);
                this.f.fire(e);
            }));
            this.B(this.F.onCompositionStart((e) => {
                if (textAreaState_1.$7W) {
                    console.log(`[compositionstart]`, e);
                }
                const currentComposition = new CompositionContext();
                if (this.C) {
                    // simply reset the composition context
                    this.C = currentComposition;
                    return;
                }
                this.C = currentComposition;
                if (this.G === 2 /* OperatingSystem.Macintosh */
                    && lastKeyDown
                    && lastKeyDown.equals(114 /* KeyCode.KEY_IN_COMPOSITION */)
                    && this.w.selectionStart === this.w.selectionEnd
                    && this.w.selectionStart > 0
                    && this.w.value.substr(this.w.selectionStart - 1, 1) === e.data
                    && (lastKeyDown.code === 'ArrowRight' || lastKeyDown.code === 'ArrowLeft')) {
                    // Handling long press case on Chromium/Safari macOS + arrow key => pretend the character was selected
                    if (textAreaState_1.$7W) {
                        console.log(`[compositionstart] Handling long press case on macOS + arrow key`, e);
                    }
                    // Pretend the previous character was composed (in order to get it removed by subsequent compositionupdate events)
                    currentComposition.handleCompositionUpdate('x');
                    this.m.fire({ data: e.data });
                    return;
                }
                if (this.H.isAndroid) {
                    // when tapping on the editor, Android enters composition mode to edit the current word
                    // so we cannot clear the textarea on Android and we must pretend the current word was selected
                    this.m.fire({ data: e.data });
                    return;
                }
                this.m.fire({ data: e.data });
            }));
            this.B(this.F.onCompositionUpdate((e) => {
                if (textAreaState_1.$7W) {
                    console.log(`[compositionupdate]`, e);
                }
                const currentComposition = this.C;
                if (!currentComposition) {
                    // should not be possible to receive a 'compositionupdate' without a 'compositionstart'
                    return;
                }
                if (this.H.isAndroid) {
                    // On Android, the data sent with the composition update event is unusable.
                    // For example, if the cursor is in the middle of a word like Mic|osoft
                    // and Microsoft is chosen from the keyboard's suggestions, the e.data will contain "Microsoft".
                    // This is not really usable because it doesn't tell us where the edit began and where it ended.
                    const newState = textAreaState_1.$8W.readFromTextArea(this.F, this.w);
                    const typeInput = textAreaState_1.$8W.deduceAndroidCompositionInput(this.w, newState);
                    this.w = newState;
                    this.j.fire(typeInput);
                    this.n.fire(e);
                    return;
                }
                const typeInput = currentComposition.handleCompositionUpdate(e.data);
                this.w = textAreaState_1.$8W.readFromTextArea(this.F, this.w);
                this.j.fire(typeInput);
                this.n.fire(e);
            }));
            this.B(this.F.onCompositionEnd((e) => {
                if (textAreaState_1.$7W) {
                    console.log(`[compositionend]`, e);
                }
                const currentComposition = this.C;
                if (!currentComposition) {
                    // https://github.com/microsoft/monaco-editor/issues/1663
                    // On iOS 13.2, Chinese system IME randomly trigger an additional compositionend event with empty data
                    return;
                }
                this.C = null;
                if (this.H.isAndroid) {
                    // On Android, the data sent with the composition update event is unusable.
                    // For example, if the cursor is in the middle of a word like Mic|osoft
                    // and Microsoft is chosen from the keyboard's suggestions, the e.data will contain "Microsoft".
                    // This is not really usable because it doesn't tell us where the edit began and where it ended.
                    const newState = textAreaState_1.$8W.readFromTextArea(this.F, this.w);
                    const typeInput = textAreaState_1.$8W.deduceAndroidCompositionInput(this.w, newState);
                    this.w = newState;
                    this.j.fire(typeInput);
                    this.r.fire();
                    return;
                }
                const typeInput = currentComposition.handleCompositionUpdate(e.data);
                this.w = textAreaState_1.$8W.readFromTextArea(this.F, this.w);
                this.j.fire(typeInput);
                this.r.fire();
            }));
            this.B(this.F.onInput((e) => {
                if (textAreaState_1.$7W) {
                    console.log(`[input]`, e);
                }
                // Pretend here we touched the text area, as the `input` event will most likely
                // result in a `selectionchange` event which we want to ignore
                this.F.setIgnoreSelectionChangeTime('received input event');
                if (this.C) {
                    return;
                }
                const newState = textAreaState_1.$8W.readFromTextArea(this.F, this.w);
                const typeInput = textAreaState_1.$8W.deduceInput(this.w, newState, /*couldBeEmojiInput*/ this.G === 2 /* OperatingSystem.Macintosh */);
                if (typeInput.replacePrevCharCnt === 0 && typeInput.text.length === 1) {
                    // one character was typed
                    if (strings.$Qe(typeInput.text.charCodeAt(0))
                        || typeInput.text.charCodeAt(0) === 0x7f /* Delete */) {
                        // Ignore invalid input but keep it around for next time
                        return;
                    }
                }
                this.w = newState;
                if (typeInput.text !== ''
                    || typeInput.replacePrevCharCnt !== 0
                    || typeInput.replaceNextCharCnt !== 0
                    || typeInput.positionDelta !== 0) {
                    this.j.fire(typeInput);
                }
            }));
            // --- Clipboard operations
            this.B(this.F.onCut((e) => {
                // Pretend here we touched the text area, as the `cut` event will most likely
                // result in a `selectionchange` event which we want to ignore
                this.F.setIgnoreSelectionChangeTime('received cut event');
                this.M(e);
                this.t.schedule();
            }));
            this.B(this.F.onCopy((e) => {
                this.M(e);
            }));
            this.B(this.F.onPaste((e) => {
                // Pretend here we touched the text area, as the `paste` event will most likely
                // result in a `selectionchange` event which we want to ignore
                this.F.setIgnoreSelectionChangeTime('received paste event');
                e.preventDefault();
                if (!e.clipboardData) {
                    return;
                }
                let [text, metadata] = exports.$aX.getTextData(e.clipboardData);
                if (!text) {
                    return;
                }
                // try the in-memory store
                metadata = metadata || $$W.INSTANCE.get(text);
                this.h.fire({
                    text: text,
                    metadata: metadata
                });
            }));
            this.B(this.F.onFocus(() => {
                const hadFocus = this.z;
                this.J(true);
                if (this.H.isSafari && !hadFocus && this.z) {
                    // When "tabbing into" the textarea, immediately after dispatching the 'focus' event,
                    // Safari will always move the selection at offset 0 in the textarea
                    this.u.schedule();
                }
            }));
            this.B(this.F.onBlur(() => {
                if (this.C) {
                    // See https://github.com/microsoft/vscode/issues/112621
                    // where compositionend is not triggered when the editor
                    // is taken off-dom during a composition
                    // Clear the flag to be able to write to the textarea
                    this.C = null;
                    // Clear the textarea to avoid an unwanted cursor type
                    this.writeScreenReaderContent('blurWithoutCompositionEnd');
                    // Fire artificial composition end
                    this.r.fire();
                }
                this.J(false);
            }));
            this.B(this.F.onSyntheticTap(() => {
                if (this.H.isAndroid && this.C) {
                    // on Android, tapping does not cancel the current composition, so the
                    // textarea is stuck showing the old composition
                    // Clear the flag to be able to write to the textarea
                    this.C = null;
                    // Clear the textarea to avoid an unwanted cursor type
                    this.writeScreenReaderContent('tapWithoutCompositionEnd');
                    // Fire artificial composition end
                    this.r.fire();
                }
            }));
        }
        _initializeFromTest() {
            this.z = true;
            this.w = textAreaState_1.$8W.readFromTextArea(this.F, null);
        }
        I() {
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
            return dom.$nO(this.F.ownerDocument, 'selectionchange', (e) => {
                performance_1.inputLatency.onSelectionChange();
                if (!this.z) {
                    return;
                }
                if (this.C) {
                    return;
                }
                if (!this.H.isChrome) {
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
                const delta2 = now - this.F.getIgnoreSelectionChangeTime();
                this.F.resetSelectionChangeTime();
                if (delta2 < 100) {
                    // received a `selectionchange` event within 100ms since we touched the textarea
                    // => ignore it, since we caused it
                    return;
                }
                if (!this.w.selection) {
                    // Cannot correlate a position in the textarea with a position in the editor...
                    return;
                }
                const newValue = this.F.getValue();
                if (this.w.value !== newValue) {
                    // Cannot correlate a position in the textarea with a position in the editor...
                    return;
                }
                const newSelectionStart = this.F.getSelectionStart();
                const newSelectionEnd = this.F.getSelectionEnd();
                if (this.w.selectionStart === newSelectionStart && this.w.selectionEnd === newSelectionEnd) {
                    // Nothing to do...
                    return;
                }
                const _newSelectionStartPosition = this.w.deduceEditorPosition(newSelectionStart);
                const newSelectionStartPosition = this.D.deduceModelPosition(_newSelectionStartPosition[0], _newSelectionStartPosition[1], _newSelectionStartPosition[2]);
                const _newSelectionEndPosition = this.w.deduceEditorPosition(newSelectionEnd);
                const newSelectionEndPosition = this.D.deduceModelPosition(_newSelectionEndPosition[0], _newSelectionEndPosition[1], _newSelectionEndPosition[2]);
                const newSelection = new selection_1.$ms(newSelectionStartPosition.lineNumber, newSelectionStartPosition.column, newSelectionEndPosition.lineNumber, newSelectionEndPosition.column);
                this.s.fire(newSelection);
            });
        }
        dispose() {
            super.dispose();
            if (this.y) {
                this.y.dispose();
                this.y = null;
            }
        }
        focusTextArea() {
            // Setting this._hasFocus and writing the screen reader content
            // will result in a focus() and setSelectionRange() in the textarea
            this.J(true);
            // If the editor is off DOM, focus cannot be really set, so let's double check that we have managed to set the focus
            this.refreshFocusState();
        }
        isFocused() {
            return this.z;
        }
        refreshFocusState() {
            this.J(this.F.hasFocus());
        }
        J(newHasFocus) {
            if (this.z === newHasFocus) {
                // no change
                return;
            }
            this.z = newHasFocus;
            if (this.y) {
                this.y.dispose();
                this.y = null;
            }
            if (this.z) {
                this.y = this.I();
            }
            if (this.z) {
                this.writeScreenReaderContent('focusgain');
            }
            if (this.z) {
                this.a.fire();
            }
            else {
                this.b.fire();
            }
        }
        L(reason, textAreaState) {
            if (!this.z) {
                textAreaState = textAreaState.collapseSelection();
            }
            textAreaState.writeToTextArea(reason, this.F, this.z);
            this.w = textAreaState;
        }
        writeScreenReaderContent(reason) {
            if (this.C) {
                // Do not write to the text area when doing composition
                return;
            }
            this.L(reason, this.D.getScreenReaderContent());
        }
        M(e) {
            const dataToCopy = this.D.getDataToCopy();
            const storedMetadata = {
                version: 1,
                isFromEmptySelection: dataToCopy.isFromEmptySelection,
                multicursorText: dataToCopy.multicursorText,
                mode: dataToCopy.mode
            };
            $$W.INSTANCE.set(
            // When writing "LINE\r\n" to the clipboard and then pasting,
            // Firefox pastes "LINE\n", so let's work around this quirk
            (this.H.isFirefox ? dataToCopy.text.replace(/\r\n/g, '\n') : dataToCopy.text), storedMetadata);
            e.preventDefault();
            if (e.clipboardData) {
                exports.$aX.setTextData(e.clipboardData, dataToCopy.text, dataToCopy.html, storedMetadata);
            }
        }
    }
    exports.$_W = $_W;
    exports.$aX = {
        getTextData(clipboardData) {
            const text = clipboardData.getData(mime_1.$Hr.text);
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
            clipboardData.setData(mime_1.$Hr.text, text);
            if (typeof html === 'string') {
                clipboardData.setData('text/html', html);
            }
            clipboardData.setData('vscode-editor-data', JSON.stringify(metadata));
        }
    };
    class $bX extends lifecycle_1.$kc {
        get ownerDocument() {
            return this.c.ownerDocument;
        }
        constructor(c) {
            super();
            this.c = c;
            this.onKeyDown = this.B(new event_1.$9P(this.c, 'keydown')).event;
            this.onKeyPress = this.B(new event_1.$9P(this.c, 'keypress')).event;
            this.onKeyUp = this.B(new event_1.$9P(this.c, 'keyup')).event;
            this.onCompositionStart = this.B(new event_1.$9P(this.c, 'compositionstart')).event;
            this.onCompositionUpdate = this.B(new event_1.$9P(this.c, 'compositionupdate')).event;
            this.onCompositionEnd = this.B(new event_1.$9P(this.c, 'compositionend')).event;
            this.onBeforeInput = this.B(new event_1.$9P(this.c, 'beforeinput')).event;
            this.onInput = this.B(new event_1.$9P(this.c, 'input')).event;
            this.onCut = this.B(new event_1.$9P(this.c, 'cut')).event;
            this.onCopy = this.B(new event_1.$9P(this.c, 'copy')).event;
            this.onPaste = this.B(new event_1.$9P(this.c, 'paste')).event;
            this.onFocus = this.B(new event_1.$9P(this.c, 'focus')).event;
            this.onBlur = this.B(new event_1.$9P(this.c, 'blur')).event;
            this.a = this.B(new event_2.$fd());
            this.onSyntheticTap = this.a.event;
            this.b = 0;
            this.B(this.onKeyDown(() => performance_1.inputLatency.onKeyDown()));
            this.B(this.onBeforeInput(() => performance_1.inputLatency.onBeforeInput()));
            this.B(this.onInput(() => performance_1.inputLatency.onInput()));
            this.B(this.onKeyUp(() => performance_1.inputLatency.onKeyUp()));
            this.B(dom.$nO(this.c, TextAreaSyntethicEvents.Tap, () => this.a.fire()));
        }
        hasFocus() {
            const shadowRoot = dom.$UO(this.c);
            if (shadowRoot) {
                return shadowRoot.activeElement === this.c;
            }
            else if (dom.$mO(this.c)) {
                return this.c.ownerDocument.activeElement === this.c;
            }
            else {
                return false;
            }
        }
        setIgnoreSelectionChangeTime(reason) {
            this.b = Date.now();
        }
        getIgnoreSelectionChangeTime() {
            return this.b;
        }
        resetSelectionChangeTime() {
            this.b = 0;
        }
        getValue() {
            // console.log('current value: ' + this._textArea.value);
            return this.c.value;
        }
        setValue(reason, value) {
            const textArea = this.c;
            if (textArea.value === value) {
                // No change
                return;
            }
            // console.log('reason: ' + reason + ', current value: ' + textArea.value + ' => new value: ' + value);
            this.setIgnoreSelectionChangeTime('setValue');
            textArea.value = value;
        }
        getSelectionStart() {
            return this.c.selectionDirection === 'backward' ? this.c.selectionEnd : this.c.selectionStart;
        }
        getSelectionEnd() {
            return this.c.selectionDirection === 'backward' ? this.c.selectionStart : this.c.selectionEnd;
        }
        setSelectionRange(reason, selectionStart, selectionEnd) {
            const textArea = this.c;
            let activeElement = null;
            const shadowRoot = dom.$UO(textArea);
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
                if (browser.$5N && window.parent !== window) {
                    textArea.focus();
                }
                return;
            }
            // console.log('reason: ' + reason + ', setSelectionRange: ' + selectionStart + ' -> ' + selectionEnd);
            if (currentIsFocused) {
                // No need to focus, only need to change the selection range
                this.setIgnoreSelectionChangeTime('setSelectionRange');
                textArea.setSelectionRange(selectionStart, selectionEnd);
                if (browser.$5N && window.parent !== window) {
                    textArea.focus();
                }
                return;
            }
            // If the focus is outside the textarea, browsers will try really hard to reveal the textarea.
            // Here, we try to undo the browser's desperate reveal.
            try {
                const scrollState = dom.$6O(textArea);
                this.setIgnoreSelectionChangeTime('setSelectionRange');
                textArea.focus();
                textArea.setSelectionRange(selectionStart, selectionEnd);
                dom.$7O(textArea, scrollState);
            }
            catch (e) {
                // Sometimes IE throws when setting selection (e.g. textarea is off-DOM)
            }
        }
    }
    exports.$bX = $bX;
});
//# sourceMappingURL=textAreaInput.js.map