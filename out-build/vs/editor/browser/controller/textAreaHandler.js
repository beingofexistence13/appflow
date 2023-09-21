/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/editor/browser/controller/textAreaHandler", "vs/base/browser/browser", "vs/base/browser/fastDomNode", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/controller/textAreaState", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/lineNumbers/lineNumbers", "vs/editor/browser/viewParts/margin/margin", "vs/editor/common/config/editorOptions", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/editor/common/languages", "vs/base/common/color", "vs/base/common/ime", "vs/platform/keybinding/common/keybinding", "vs/css!./textAreaHandler"], function (require, exports, nls, browser, fastDomNode_1, platform, strings, domFontInfo_1, textAreaInput_1, textAreaState_1, viewPart_1, lineNumbers_1, margin_1, editorOptions_1, wordCharacterClassifier_1, position_1, range_1, selection_1, mouseCursor_1, languages_1, color_1, ime_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hX = void 0;
    class VisibleTextAreaData {
        constructor(b, modelLineNumber, distanceToModelLineStart, widthOfHiddenLineTextBefore, distanceToModelLineEnd) {
            this.b = b;
            this.modelLineNumber = modelLineNumber;
            this.distanceToModelLineStart = distanceToModelLineStart;
            this.widthOfHiddenLineTextBefore = widthOfHiddenLineTextBefore;
            this.distanceToModelLineEnd = distanceToModelLineEnd;
            this._visibleTextAreaBrand = undefined;
            this.startPosition = null;
            this.endPosition = null;
            this.visibleTextareaStart = null;
            this.visibleTextareaEnd = null;
            /**
             * When doing composition, the currently composed text might be split up into
             * multiple tokens, then merged again into a single token, etc. Here we attempt
             * to keep the presentation of the <textarea> stable by using the previous used
             * style if multiple tokens come into play. This avoids flickering.
             */
            this.a = null;
        }
        prepareRender(visibleRangeProvider) {
            const startModelPosition = new position_1.$js(this.modelLineNumber, this.distanceToModelLineStart + 1);
            const endModelPosition = new position_1.$js(this.modelLineNumber, this.b.viewModel.model.getLineMaxColumn(this.modelLineNumber) - this.distanceToModelLineEnd);
            this.startPosition = this.b.viewModel.coordinatesConverter.convertModelPositionToViewPosition(startModelPosition);
            this.endPosition = this.b.viewModel.coordinatesConverter.convertModelPositionToViewPosition(endModelPosition);
            if (this.startPosition.lineNumber === this.endPosition.lineNumber) {
                this.visibleTextareaStart = visibleRangeProvider.visibleRangeForPosition(this.startPosition);
                this.visibleTextareaEnd = visibleRangeProvider.visibleRangeForPosition(this.endPosition);
            }
            else {
                // TODO: what if the view positions are not on the same line?
                this.visibleTextareaStart = null;
                this.visibleTextareaEnd = null;
            }
        }
        definePresentation(tokenPresentation) {
            if (!this.a) {
                // To avoid flickering, once set, always reuse a presentation throughout the entire IME session
                if (tokenPresentation) {
                    this.a = tokenPresentation;
                }
                else {
                    this.a = {
                        foreground: 1 /* ColorId.DefaultForeground */,
                        italic: false,
                        bold: false,
                        underline: false,
                        strikethrough: false,
                    };
                }
            }
            return this.a;
        }
    }
    const canUseZeroSizeTextarea = (browser.$5N);
    let $hX = class $hX extends viewPart_1.$FW {
        constructor(context, viewController, visibleRangeProvider, L) {
            super(context);
            this.L = L;
            this.S = new position_1.$js(1, 1);
            this.U = null;
            this.a = viewController;
            this.b = visibleRangeProvider;
            this.c = 0;
            this.g = 0;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.Q(options);
            this.t = layoutInfo.contentLeft;
            this.u = layoutInfo.contentWidth;
            this.w = layoutInfo.height;
            this.y = options.get(50 /* EditorOption.fontInfo */);
            this.z = options.get(66 /* EditorOption.lineHeight */);
            this.C = options.get(37 /* EditorOption.emptySelectionClipboard */);
            this.D = options.get(25 /* EditorOption.copyWithSyntaxHighlighting */);
            this.F = null;
            this.G = [new selection_1.$ms(1, 1, 1, 1)];
            this.H = [new selection_1.$ms(1, 1, 1, 1)];
            this.I = null;
            // Text Area (The focus will always be in the textarea when the cursor is blinking)
            this.textArea = (0, fastDomNode_1.$GP)(document.createElement('textarea'));
            viewPart_1.$GW.write(this.textArea, 6 /* PartFingerprint.TextArea */);
            this.textArea.setClassName(`inputarea ${mouseCursor_1.$WR}`);
            this.textArea.setAttribute('wrap', this.n && !this.F ? 'on' : 'off');
            const { tabSize } = this._context.viewModel.model.getOptions();
            this.textArea.domNode.style.tabSize = `${tabSize * this.y.spaceWidth}px`;
            this.textArea.setAttribute('autocorrect', 'off');
            this.textArea.setAttribute('autocapitalize', 'off');
            this.textArea.setAttribute('autocomplete', 'off');
            this.textArea.setAttribute('spellcheck', 'false');
            this.textArea.setAttribute('aria-label', this.P(options));
            this.textArea.setAttribute('aria-required', options.get(5 /* EditorOption.ariaRequired */) ? 'true' : 'false');
            this.textArea.setAttribute('tabindex', String(options.get(123 /* EditorOption.tabIndex */)));
            this.textArea.setAttribute('role', 'textbox');
            this.textArea.setAttribute('aria-roledescription', nls.localize(0, null));
            this.textArea.setAttribute('aria-multiline', 'true');
            this.textArea.setAttribute('aria-autocomplete', options.get(90 /* EditorOption.readOnly */) ? 'none' : 'both');
            this.R();
            this.textAreaCover = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.textAreaCover.setPosition('absolute');
            const simpleModel = {
                getLineCount: () => {
                    return this._context.viewModel.getLineCount();
                },
                getLineMaxColumn: (lineNumber) => {
                    return this._context.viewModel.getLineMaxColumn(lineNumber);
                },
                getValueInRange: (range, eol) => {
                    return this._context.viewModel.getValueInRange(range, eol);
                },
                getValueLengthInRange: (range, eol) => {
                    return this._context.viewModel.getValueLengthInRange(range, eol);
                },
                modifyPosition: (position, offset) => {
                    return this._context.viewModel.modifyPosition(position, offset);
                }
            };
            const textAreaInputHost = {
                getDataToCopy: () => {
                    const rawTextToCopy = this._context.viewModel.getPlainTextToCopy(this.H, this.C, platform.$i);
                    const newLineCharacter = this._context.viewModel.model.getEOL();
                    const isFromEmptySelection = (this.C && this.H.length === 1 && this.H[0].isEmpty());
                    const multicursorText = (Array.isArray(rawTextToCopy) ? rawTextToCopy : null);
                    const text = (Array.isArray(rawTextToCopy) ? rawTextToCopy.join(newLineCharacter) : rawTextToCopy);
                    let html = undefined;
                    let mode = null;
                    if (textAreaInput_1.$0W.forceCopyWithSyntaxHighlighting || (this.D && text.length < 65536)) {
                        const richText = this._context.viewModel.getRichTextToCopy(this.H, this.C);
                        if (richText) {
                            html = richText.html;
                            mode = richText.mode;
                        }
                    }
                    return {
                        isFromEmptySelection,
                        multicursorText,
                        text,
                        html,
                        mode
                    };
                },
                getScreenReaderContent: () => {
                    if (this.j === 1 /* AccessibilitySupport.Disabled */) {
                        // We know for a fact that a screen reader is not attached
                        // On OSX, we write the character before the cursor to allow for "long-press" composition
                        // Also on OSX, we write the word before the cursor to allow for the Accessibility Keyboard to give good hints
                        const selection = this.G[0];
                        if (platform.$j && selection.isEmpty()) {
                            const position = selection.getStartPosition();
                            let textBefore = this.N(position);
                            if (textBefore.length === 0) {
                                textBefore = this.O(position);
                            }
                            if (textBefore.length > 0) {
                                return new textAreaState_1.$8W(textBefore, textBefore.length, textBefore.length, range_1.$ks.fromPositions(position), 0);
                            }
                        }
                        // on macOS, write current selection into textarea will allow system text services pick selected text,
                        // but we still want to limit the amount of text given Chromium handles very poorly text even of a few
                        // thousand chars
                        // (https://github.com/microsoft/vscode/issues/27799)
                        const LIMIT_CHARS = 500;
                        if (platform.$j && !selection.isEmpty() && simpleModel.getValueLengthInRange(selection, 0 /* EndOfLinePreference.TextDefined */) < LIMIT_CHARS) {
                            const text = simpleModel.getValueInRange(selection, 0 /* EndOfLinePreference.TextDefined */);
                            return new textAreaState_1.$8W(text, 0, text.length, selection, 0);
                        }
                        // on Safari, document.execCommand('cut') and document.execCommand('copy') will just not work
                        // if the textarea has no content selected. So if there is an editor selection, ensure something
                        // is selected in the textarea.
                        if (browser.$8N && !selection.isEmpty()) {
                            const placeholderText = 'vscode-placeholder';
                            return new textAreaState_1.$8W(placeholderText, 0, placeholderText.length, null, undefined);
                        }
                        return textAreaState_1.$8W.EMPTY;
                    }
                    if (browser.$$N) {
                        // when tapping in the editor on a word, Android enters composition mode.
                        // in the `compositionstart` event we cannot clear the textarea, because
                        // it then forgets to ever send a `compositionend`.
                        // we therefore only write the current word in the textarea
                        const selection = this.G[0];
                        if (selection.isEmpty()) {
                            const position = selection.getStartPosition();
                            const [wordAtPosition, positionOffsetInWord] = this.M(position);
                            if (wordAtPosition.length > 0) {
                                return new textAreaState_1.$8W(wordAtPosition, positionOffsetInWord, positionOffsetInWord, range_1.$ks.fromPositions(position), 0);
                            }
                        }
                        return textAreaState_1.$8W.EMPTY;
                    }
                    return textAreaState_1.$9W.fromEditorSelection(simpleModel, this.G[0], this.m, this.j === 0 /* AccessibilitySupport.Unknown */);
                },
                deduceModelPosition: (viewAnchorPosition, deltaOffset, lineFeedCnt) => {
                    return this._context.viewModel.deduceModelPositionRelativeToViewPosition(viewAnchorPosition, deltaOffset, lineFeedCnt);
                }
            };
            const textAreaWrapper = this.B(new textAreaInput_1.$bX(this.textArea.domNode));
            this.J = this.B(new textAreaInput_1.$_W(textAreaInputHost, textAreaWrapper, platform.OS, {
                isAndroid: browser.$$N,
                isChrome: browser.$7N,
                isFirefox: browser.$5N,
                isSafari: browser.$8N,
            }));
            this.B(this.J.onKeyDown((e) => {
                this.a.emitKeyDown(e);
            }));
            this.B(this.J.onKeyUp((e) => {
                this.a.emitKeyUp(e);
            }));
            this.B(this.J.onPaste((e) => {
                let pasteOnNewLine = false;
                let multicursorText = null;
                let mode = null;
                if (e.metadata) {
                    pasteOnNewLine = (this.C && !!e.metadata.isFromEmptySelection);
                    multicursorText = (typeof e.metadata.multicursorText !== 'undefined' ? e.metadata.multicursorText : null);
                    mode = e.metadata.mode;
                }
                this.a.paste(e.text, pasteOnNewLine, multicursorText, mode);
            }));
            this.B(this.J.onCut(() => {
                this.a.cut();
            }));
            this.B(this.J.onType((e) => {
                if (e.replacePrevCharCnt || e.replaceNextCharCnt || e.positionDelta) {
                    // must be handled through the new command
                    if (textAreaState_1.$7W) {
                        console.log(` => compositionType: <<${e.text}>>, ${e.replacePrevCharCnt}, ${e.replaceNextCharCnt}, ${e.positionDelta}`);
                    }
                    this.a.compositionType(e.text, e.replacePrevCharCnt, e.replaceNextCharCnt, e.positionDelta);
                }
                else {
                    if (textAreaState_1.$7W) {
                        console.log(` => type: <<${e.text}>>`);
                    }
                    this.a.type(e.text);
                }
            }));
            this.B(this.J.onSelectionChangeRequest((modelSelection) => {
                this.a.setSelection(modelSelection);
            }));
            this.B(this.J.onCompositionStart((e) => {
                // The textarea might contain some content when composition starts.
                //
                // When we make the textarea visible, it always has a height of 1 line,
                // so we don't need to worry too much about content on lines above or below
                // the selection.
                //
                // However, the text on the current line needs to be made visible because
                // some IME methods allow to move to other glyphs on the current line
                // (by pressing arrow keys).
                //
                // (1) The textarea might contain only some parts of the current line,
                // like the word before the selection. Also, the content inside the textarea
                // can grow or shrink as composition occurs. We therefore anchor the textarea
                // in terms of distance to a certain line start and line end.
                //
                // (2) Also, we should not make \t characters visible, because their rendering
                // inside the <textarea> will not align nicely with our rendering. We therefore
                // will hide (if necessary) some of the leading text on the current line.
                const ta = this.textArea.domNode;
                const modelSelection = this.H[0];
                const { distanceToModelLineStart, widthOfHiddenTextBefore } = (() => {
                    // Find the text that is on the current line before the selection
                    const textBeforeSelection = ta.value.substring(0, Math.min(ta.selectionStart, ta.selectionEnd));
                    const lineFeedOffset1 = textBeforeSelection.lastIndexOf('\n');
                    const lineTextBeforeSelection = textBeforeSelection.substring(lineFeedOffset1 + 1);
                    // We now search to see if we should hide some part of it (if it contains \t)
                    const tabOffset1 = lineTextBeforeSelection.lastIndexOf('\t');
                    const desiredVisibleBeforeCharCount = lineTextBeforeSelection.length - tabOffset1 - 1;
                    const startModelPosition = modelSelection.getStartPosition();
                    const visibleBeforeCharCount = Math.min(startModelPosition.column - 1, desiredVisibleBeforeCharCount);
                    const distanceToModelLineStart = startModelPosition.column - 1 - visibleBeforeCharCount;
                    const hiddenLineTextBefore = lineTextBeforeSelection.substring(0, lineTextBeforeSelection.length - visibleBeforeCharCount);
                    const { tabSize } = this._context.viewModel.model.getOptions();
                    const widthOfHiddenTextBefore = measureText(this.textArea.domNode.ownerDocument, hiddenLineTextBefore, this.y, tabSize);
                    return { distanceToModelLineStart, widthOfHiddenTextBefore };
                })();
                const { distanceToModelLineEnd } = (() => {
                    // Find the text that is on the current line after the selection
                    const textAfterSelection = ta.value.substring(Math.max(ta.selectionStart, ta.selectionEnd));
                    const lineFeedOffset2 = textAfterSelection.indexOf('\n');
                    const lineTextAfterSelection = lineFeedOffset2 === -1 ? textAfterSelection : textAfterSelection.substring(0, lineFeedOffset2);
                    const tabOffset2 = lineTextAfterSelection.indexOf('\t');
                    const desiredVisibleAfterCharCount = (tabOffset2 === -1 ? lineTextAfterSelection.length : lineTextAfterSelection.length - tabOffset2 - 1);
                    const endModelPosition = modelSelection.getEndPosition();
                    const visibleAfterCharCount = Math.min(this._context.viewModel.model.getLineMaxColumn(endModelPosition.lineNumber) - endModelPosition.column, desiredVisibleAfterCharCount);
                    const distanceToModelLineEnd = this._context.viewModel.model.getLineMaxColumn(endModelPosition.lineNumber) - endModelPosition.column - visibleAfterCharCount;
                    return { distanceToModelLineEnd };
                })();
                // Scroll to reveal the location in the editor where composition occurs
                this._context.viewModel.revealRange('keyboard', true, range_1.$ks.fromPositions(this.G[0].getStartPosition()), 0 /* viewEvents.VerticalRevealType.Simple */, 1 /* ScrollType.Immediate */);
                this.F = new VisibleTextAreaData(this._context, modelSelection.startLineNumber, distanceToModelLineStart, widthOfHiddenTextBefore, distanceToModelLineEnd);
                // We turn off wrapping if the <textarea> becomes visible for composition
                this.textArea.setAttribute('wrap', this.n && !this.F ? 'on' : 'off');
                this.F.prepareRender(this.b);
                this.W();
                // Show the textarea
                this.textArea.setClassName(`inputarea ${mouseCursor_1.$WR} ime-input`);
                this.a.compositionStart();
                this._context.viewModel.onCompositionStart();
            }));
            this.B(this.J.onCompositionUpdate((e) => {
                if (!this.F) {
                    return;
                }
                this.F.prepareRender(this.b);
                this.W();
            }));
            this.B(this.J.onCompositionEnd(() => {
                this.F = null;
                // We turn on wrapping as necessary if the <textarea> hides after composition
                this.textArea.setAttribute('wrap', this.n && !this.F ? 'on' : 'off');
                this.W();
                this.textArea.setClassName(`inputarea ${mouseCursor_1.$WR}`);
                this.a.compositionEnd();
                this._context.viewModel.onCompositionEnd();
            }));
            this.B(this.J.onFocus(() => {
                this._context.viewModel.setHasFocus(true);
            }));
            this.B(this.J.onBlur(() => {
                this._context.viewModel.setHasFocus(false);
            }));
            this.B(ime_1.IME.onDidChange(() => {
                this.R();
            }));
        }
        writeScreenReaderContent(reason) {
            this.J.writeScreenReaderContent(reason);
        }
        dispose() {
            super.dispose();
        }
        M(position) {
            const ANDROID_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:",.<>/?';
            const lineContent = this._context.viewModel.getLineContent(position.lineNumber);
            const wordSeparators = (0, wordCharacterClassifier_1.$Ks)(ANDROID_WORD_SEPARATORS);
            let goingLeft = true;
            let startColumn = position.column;
            let goingRight = true;
            let endColumn = position.column;
            let distance = 0;
            while (distance < 50 && (goingLeft || goingRight)) {
                if (goingLeft && startColumn <= 1) {
                    goingLeft = false;
                }
                if (goingLeft) {
                    const charCode = lineContent.charCodeAt(startColumn - 2);
                    const charClass = wordSeparators.get(charCode);
                    if (charClass !== 0 /* WordCharacterClass.Regular */) {
                        goingLeft = false;
                    }
                    else {
                        startColumn--;
                    }
                }
                if (goingRight && endColumn > lineContent.length) {
                    goingRight = false;
                }
                if (goingRight) {
                    const charCode = lineContent.charCodeAt(endColumn - 1);
                    const charClass = wordSeparators.get(charCode);
                    if (charClass !== 0 /* WordCharacterClass.Regular */) {
                        goingRight = false;
                    }
                    else {
                        endColumn++;
                    }
                }
                distance++;
            }
            return [lineContent.substring(startColumn - 1, endColumn - 1), position.column - startColumn];
        }
        N(position) {
            const lineContent = this._context.viewModel.getLineContent(position.lineNumber);
            const wordSeparators = (0, wordCharacterClassifier_1.$Ks)(this._context.configuration.options.get(129 /* EditorOption.wordSeparators */));
            let column = position.column;
            let distance = 0;
            while (column > 1) {
                const charCode = lineContent.charCodeAt(column - 2);
                const charClass = wordSeparators.get(charCode);
                if (charClass !== 0 /* WordCharacterClass.Regular */ || distance > 50) {
                    return lineContent.substring(column - 1, position.column - 1);
                }
                distance++;
                column--;
            }
            return lineContent.substring(0, position.column - 1);
        }
        O(position) {
            if (position.column > 1) {
                const lineContent = this._context.viewModel.getLineContent(position.lineNumber);
                const charBefore = lineContent.charAt(position.column - 2);
                if (!strings.$Qe(charBefore.charCodeAt(0))) {
                    return charBefore;
                }
            }
            return '';
        }
        P(options) {
            const accessibilitySupport = options.get(2 /* EditorOption.accessibilitySupport */);
            if (accessibilitySupport === 1 /* AccessibilitySupport.Disabled */) {
                const toggleKeybindingLabel = this.L.lookupKeybinding('editor.action.toggleScreenReaderAccessibilityMode')?.getAriaLabel();
                const runCommandKeybindingLabel = this.L.lookupKeybinding('workbench.action.showCommands')?.getAriaLabel();
                const keybindingEditorKeybindingLabel = this.L.lookupKeybinding('workbench.action.openGlobalKeybindings')?.getAriaLabel();
                const editorNotAccessibleMessage = nls.localize(1, null);
                if (toggleKeybindingLabel) {
                    return nls.localize(2, null, editorNotAccessibleMessage, toggleKeybindingLabel);
                }
                else if (runCommandKeybindingLabel) {
                    return nls.localize(3, null, editorNotAccessibleMessage, runCommandKeybindingLabel);
                }
                else if (keybindingEditorKeybindingLabel) {
                    return nls.localize(4, null, editorNotAccessibleMessage, keybindingEditorKeybindingLabel);
                }
                else {
                    // SOS
                    return editorNotAccessibleMessage;
                }
            }
            return options.get(4 /* EditorOption.ariaLabel */);
        }
        Q(options) {
            this.j = options.get(2 /* EditorOption.accessibilitySupport */);
            const accessibilityPageSize = options.get(3 /* EditorOption.accessibilityPageSize */);
            if (this.j === 2 /* AccessibilitySupport.Enabled */ && accessibilityPageSize === editorOptions_1.EditorOptions.accessibilityPageSize.defaultValue) {
                // If a screen reader is attached and the default value is not set we should automatically increase the page size to 500 for a better experience
                this.m = 500;
            }
            else {
                this.m = accessibilityPageSize;
            }
            // When wrapping is enabled and a screen reader might be attached,
            // we will size the textarea to match the width used for wrapping points computation (see `domLineBreaksComputer.ts`).
            // This is because screen readers will read the text in the textarea and we'd like that the
            // wrapping points in the textarea match the wrapping points in the editor.
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const wrappingColumn = layoutInfo.wrappingColumn;
            if (wrappingColumn !== -1 && this.j !== 1 /* AccessibilitySupport.Disabled */) {
                const fontInfo = options.get(50 /* EditorOption.fontInfo */);
                this.n = true;
                this.s = Math.round(wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
            }
            else {
                this.n = false;
                this.s = (canUseZeroSizeTextarea ? 0 : 1);
            }
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.Q(options);
            this.t = layoutInfo.contentLeft;
            this.u = layoutInfo.contentWidth;
            this.w = layoutInfo.height;
            this.y = options.get(50 /* EditorOption.fontInfo */);
            this.z = options.get(66 /* EditorOption.lineHeight */);
            this.C = options.get(37 /* EditorOption.emptySelectionClipboard */);
            this.D = options.get(25 /* EditorOption.copyWithSyntaxHighlighting */);
            this.textArea.setAttribute('wrap', this.n && !this.F ? 'on' : 'off');
            const { tabSize } = this._context.viewModel.model.getOptions();
            this.textArea.domNode.style.tabSize = `${tabSize * this.y.spaceWidth}px`;
            this.textArea.setAttribute('aria-label', this.P(options));
            this.textArea.setAttribute('aria-required', options.get(5 /* EditorOption.ariaRequired */) ? 'true' : 'false');
            this.textArea.setAttribute('tabindex', String(options.get(123 /* EditorOption.tabIndex */)));
            if (e.hasChanged(34 /* EditorOption.domReadOnly */) || e.hasChanged(90 /* EditorOption.readOnly */)) {
                this.R();
            }
            if (e.hasChanged(2 /* EditorOption.accessibilitySupport */)) {
                this.J.writeScreenReaderContent('strategy changed');
            }
            return true;
        }
        onCursorStateChanged(e) {
            this.G = e.selections.slice(0);
            this.H = e.modelSelections.slice(0);
            // We must update the <textarea> synchronously, otherwise long press IME on macos breaks.
            // See https://github.com/microsoft/vscode/issues/165821
            this.J.writeScreenReaderContent('selection changed');
            return true;
        }
        onDecorationsChanged(e) {
            // true for inline decorations that can end up relayouting text
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onLinesChanged(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            this.c = e.scrollLeft;
            this.g = e.scrollTop;
            return true;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        // --- begin view API
        isFocused() {
            return this.J.isFocused();
        }
        focusTextArea() {
            this.J.focusTextArea();
        }
        refreshFocusState() {
            this.J.refreshFocusState();
        }
        getLastRenderData() {
            return this.I;
        }
        setAriaOptions(options) {
            if (options.activeDescendant) {
                this.textArea.setAttribute('aria-haspopup', 'true');
                this.textArea.setAttribute('aria-autocomplete', 'list');
                this.textArea.setAttribute('aria-activedescendant', options.activeDescendant);
            }
            else {
                this.textArea.setAttribute('aria-haspopup', 'false');
                this.textArea.setAttribute('aria-autocomplete', 'both');
                this.textArea.removeAttribute('aria-activedescendant');
            }
            if (options.role) {
                this.textArea.setAttribute('role', options.role);
            }
        }
        // --- end view API
        R() {
            const options = this._context.configuration.options;
            // When someone requests to disable IME, we set the "readonly" attribute on the <textarea>.
            // This will prevent composition.
            const useReadOnly = !ime_1.IME.enabled || (options.get(34 /* EditorOption.domReadOnly */) && options.get(90 /* EditorOption.readOnly */));
            if (useReadOnly) {
                this.textArea.setAttribute('readonly', 'true');
            }
            else {
                this.textArea.removeAttribute('readonly');
            }
        }
        prepareRender(ctx) {
            this.S = new position_1.$js(this.G[0].positionLineNumber, this.G[0].positionColumn);
            this.U = ctx.visibleRangeForPosition(this.S);
            this.F?.prepareRender(ctx);
        }
        render(ctx) {
            this.J.writeScreenReaderContent('render');
            this.W();
        }
        W() {
            if (this.F) {
                // The text area is visible for composition reasons
                const visibleStart = this.F.visibleTextareaStart;
                const visibleEnd = this.F.visibleTextareaEnd;
                const startPosition = this.F.startPosition;
                const endPosition = this.F.endPosition;
                if (startPosition && endPosition && visibleStart && visibleEnd && visibleEnd.left >= this.c && visibleStart.left <= this.c + this.u) {
                    const top = (this._context.viewLayout.getVerticalOffsetForLineNumber(this.S.lineNumber) - this.g);
                    const lineCount = this.X(this.textArea.domNode.value.substr(0, this.textArea.domNode.selectionStart));
                    let scrollLeft = this.F.widthOfHiddenLineTextBefore;
                    let left = (this.t + visibleStart.left - this.c);
                    // See https://github.com/microsoft/vscode/issues/141725#issuecomment-1050670841
                    // Here we are adding +1 to avoid flickering that might be caused by having a width that is too small.
                    // This could be caused by rounding errors that might only show up with certain font families.
                    // In other words, a pixel might be lost when doing something like
                    //      `Math.round(end) - Math.round(start)`
                    // vs
                    //      `Math.round(end - start)`
                    let width = visibleEnd.left - visibleStart.left + 1;
                    if (left < this.t) {
                        // the textarea would be rendered on top of the margin,
                        // so reduce its width. We use the same technique as
                        // for hiding text before
                        const delta = (this.t - left);
                        left += delta;
                        scrollLeft += delta;
                        width -= delta;
                    }
                    if (width > this.u) {
                        // the textarea would be wider than the content width,
                        // so reduce its width.
                        width = this.u;
                    }
                    // Try to render the textarea with the color/font style to match the text under it
                    const viewLineData = this._context.viewModel.getViewLineData(startPosition.lineNumber);
                    const startTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(startPosition.column - 1);
                    const endTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(endPosition.column - 1);
                    const textareaSpansSingleToken = (startTokenIndex === endTokenIndex);
                    const presentation = this.F.definePresentation((textareaSpansSingleToken ? viewLineData.tokens.getPresentation(startTokenIndex) : null));
                    this.textArea.domNode.scrollTop = lineCount * this.z;
                    this.textArea.domNode.scrollLeft = scrollLeft;
                    this.Z({
                        lastRenderPosition: null,
                        top: top,
                        left: left,
                        width: width,
                        height: this.z,
                        useCover: false,
                        color: (languages_1.$bt.getColorMap() || [])[presentation.foreground],
                        italic: presentation.italic,
                        bold: presentation.bold,
                        underline: presentation.underline,
                        strikethrough: presentation.strikethrough
                    });
                }
                return;
            }
            if (!this.U) {
                // The primary cursor is outside the viewport => place textarea to the top left
                this.Y();
                return;
            }
            const left = this.t + this.U.left - this.c;
            if (left < this.t || left > this.t + this.u) {
                // cursor is outside the viewport
                this.Y();
                return;
            }
            const top = this._context.viewLayout.getVerticalOffsetForLineNumber(this.G[0].positionLineNumber) - this.g;
            if (top < 0 || top > this.w) {
                // cursor is outside the viewport
                this.Y();
                return;
            }
            // The primary cursor is in the viewport (at least vertically) => place textarea on the cursor
            if (platform.$j) {
                // For the popup emoji input, we will make the text area as high as the line height
                // We will also make the fontSize and lineHeight the correct dimensions to help with the placement of these pickers
                this.Z({
                    lastRenderPosition: this.S,
                    top,
                    left: this.n ? this.t : left,
                    width: this.s,
                    height: this.z,
                    useCover: false
                });
                // In case the textarea contains a word, we're going to try to align the textarea's cursor
                // with our cursor by scrolling the textarea as much as possible
                this.textArea.domNode.scrollLeft = this.U.left;
                const lineCount = this.J.textAreaState.newlineCountBeforeSelection ?? this.X(this.textArea.domNode.value.substr(0, this.textArea.domNode.selectionStart));
                this.textArea.domNode.scrollTop = lineCount * this.z;
                return;
            }
            this.Z({
                lastRenderPosition: this.S,
                top: top,
                left: this.n ? this.t : left,
                width: this.s,
                height: (canUseZeroSizeTextarea ? 0 : 1),
                useCover: false
            });
        }
        X(text) {
            let result = 0;
            let startIndex = -1;
            do {
                startIndex = text.indexOf('\n', startIndex + 1);
                if (startIndex === -1) {
                    break;
                }
                result++;
            } while (true);
            return result;
        }
        Y() {
            // (in WebKit the textarea is 1px by 1px because it cannot handle input to a 0x0 textarea)
            // specifically, when doing Korean IME, setting the textarea to 0x0 breaks IME badly.
            this.Z({
                lastRenderPosition: null,
                top: 0,
                left: 0,
                width: this.s,
                height: (canUseZeroSizeTextarea ? 0 : 1),
                useCover: true
            });
        }
        Z(renderData) {
            this.I = renderData.lastRenderPosition;
            const ta = this.textArea;
            const tac = this.textAreaCover;
            (0, domFontInfo_1.$vU)(ta, this.y);
            ta.setTop(renderData.top);
            ta.setLeft(renderData.left);
            ta.setWidth(renderData.width);
            ta.setHeight(renderData.height);
            ta.setColor(renderData.color ? color_1.$Os.Format.CSS.formatHex(renderData.color) : '');
            ta.setFontStyle(renderData.italic ? 'italic' : '');
            if (renderData.bold) {
                // fontWeight is also set by `applyFontInfo`, so only overwrite it if necessary
                ta.setFontWeight('bold');
            }
            ta.setTextDecoration(`${renderData.underline ? ' underline' : ''}${renderData.strikethrough ? ' line-through' : ''}`);
            tac.setTop(renderData.useCover ? renderData.top : 0);
            tac.setLeft(renderData.useCover ? renderData.left : 0);
            tac.setWidth(renderData.useCover ? renderData.width : 0);
            tac.setHeight(renderData.useCover ? renderData.height : 0);
            const options = this._context.configuration.options;
            if (options.get(57 /* EditorOption.glyphMargin */)) {
                tac.setClassName('monaco-editor-background textAreaCover ' + margin_1.$gX.OUTER_CLASS_NAME);
            }
            else {
                if (options.get(67 /* EditorOption.lineNumbers */).renderType !== 0 /* RenderLineNumbersType.Off */) {
                    tac.setClassName('monaco-editor-background textAreaCover ' + lineNumbers_1.$fX.CLASS_NAME);
                }
                else {
                    tac.setClassName('monaco-editor-background textAreaCover');
                }
            }
        }
    };
    exports.$hX = $hX;
    exports.$hX = $hX = __decorate([
        __param(3, keybinding_1.$2D)
    ], $hX);
    function measureText(document, text, fontInfo, tabSize) {
        if (text.length === 0) {
            return 0;
        }
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-50000px';
        container.style.width = '50000px';
        const regularDomNode = document.createElement('span');
        (0, domFontInfo_1.$vU)(regularDomNode, fontInfo);
        regularDomNode.style.whiteSpace = 'pre'; // just like the textarea
        regularDomNode.style.tabSize = `${tabSize * fontInfo.spaceWidth}px`; // just like the textarea
        regularDomNode.append(text);
        container.appendChild(regularDomNode);
        document.body.appendChild(container);
        const res = regularDomNode.offsetWidth;
        document.body.removeChild(container);
        return res;
    }
});
//# sourceMappingURL=textAreaHandler.js.map