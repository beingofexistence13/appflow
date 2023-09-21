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
define(["require", "exports", "vs/nls", "vs/base/browser/browser", "vs/base/browser/fastDomNode", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/controller/textAreaState", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/lineNumbers/lineNumbers", "vs/editor/browser/viewParts/margin/margin", "vs/editor/common/config/editorOptions", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/editor/common/languages", "vs/base/common/color", "vs/base/common/ime", "vs/platform/keybinding/common/keybinding", "vs/css!./textAreaHandler"], function (require, exports, nls, browser, fastDomNode_1, platform, strings, domFontInfo_1, textAreaInput_1, textAreaState_1, viewPart_1, lineNumbers_1, margin_1, editorOptions_1, wordCharacterClassifier_1, position_1, range_1, selection_1, mouseCursor_1, languages_1, color_1, ime_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextAreaHandler = void 0;
    class VisibleTextAreaData {
        constructor(_context, modelLineNumber, distanceToModelLineStart, widthOfHiddenLineTextBefore, distanceToModelLineEnd) {
            this._context = _context;
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
            this._previousPresentation = null;
        }
        prepareRender(visibleRangeProvider) {
            const startModelPosition = new position_1.Position(this.modelLineNumber, this.distanceToModelLineStart + 1);
            const endModelPosition = new position_1.Position(this.modelLineNumber, this._context.viewModel.model.getLineMaxColumn(this.modelLineNumber) - this.distanceToModelLineEnd);
            this.startPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(startModelPosition);
            this.endPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(endModelPosition);
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
            if (!this._previousPresentation) {
                // To avoid flickering, once set, always reuse a presentation throughout the entire IME session
                if (tokenPresentation) {
                    this._previousPresentation = tokenPresentation;
                }
                else {
                    this._previousPresentation = {
                        foreground: 1 /* ColorId.DefaultForeground */,
                        italic: false,
                        bold: false,
                        underline: false,
                        strikethrough: false,
                    };
                }
            }
            return this._previousPresentation;
        }
    }
    const canUseZeroSizeTextarea = (browser.isFirefox);
    let TextAreaHandler = class TextAreaHandler extends viewPart_1.ViewPart {
        constructor(context, viewController, visibleRangeProvider, _keybindingService) {
            super(context);
            this._keybindingService = _keybindingService;
            this._primaryCursorPosition = new position_1.Position(1, 1);
            this._primaryCursorVisibleRange = null;
            this._viewController = viewController;
            this._visibleRangeProvider = visibleRangeProvider;
            this._scrollLeft = 0;
            this._scrollTop = 0;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._setAccessibilityOptions(options);
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            this._contentHeight = layoutInfo.height;
            this._fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._emptySelectionClipboard = options.get(37 /* EditorOption.emptySelectionClipboard */);
            this._copyWithSyntaxHighlighting = options.get(25 /* EditorOption.copyWithSyntaxHighlighting */);
            this._visibleTextArea = null;
            this._selections = [new selection_1.Selection(1, 1, 1, 1)];
            this._modelSelections = [new selection_1.Selection(1, 1, 1, 1)];
            this._lastRenderPosition = null;
            // Text Area (The focus will always be in the textarea when the cursor is blinking)
            this.textArea = (0, fastDomNode_1.createFastDomNode)(document.createElement('textarea'));
            viewPart_1.PartFingerprints.write(this.textArea, 6 /* PartFingerprint.TextArea */);
            this.textArea.setClassName(`inputarea ${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
            this.textArea.setAttribute('wrap', this._textAreaWrapping && !this._visibleTextArea ? 'on' : 'off');
            const { tabSize } = this._context.viewModel.model.getOptions();
            this.textArea.domNode.style.tabSize = `${tabSize * this._fontInfo.spaceWidth}px`;
            this.textArea.setAttribute('autocorrect', 'off');
            this.textArea.setAttribute('autocapitalize', 'off');
            this.textArea.setAttribute('autocomplete', 'off');
            this.textArea.setAttribute('spellcheck', 'false');
            this.textArea.setAttribute('aria-label', this._getAriaLabel(options));
            this.textArea.setAttribute('aria-required', options.get(5 /* EditorOption.ariaRequired */) ? 'true' : 'false');
            this.textArea.setAttribute('tabindex', String(options.get(123 /* EditorOption.tabIndex */)));
            this.textArea.setAttribute('role', 'textbox');
            this.textArea.setAttribute('aria-roledescription', nls.localize('editor', "editor"));
            this.textArea.setAttribute('aria-multiline', 'true');
            this.textArea.setAttribute('aria-autocomplete', options.get(90 /* EditorOption.readOnly */) ? 'none' : 'both');
            this._ensureReadOnlyAttribute();
            this.textAreaCover = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
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
                    const rawTextToCopy = this._context.viewModel.getPlainTextToCopy(this._modelSelections, this._emptySelectionClipboard, platform.isWindows);
                    const newLineCharacter = this._context.viewModel.model.getEOL();
                    const isFromEmptySelection = (this._emptySelectionClipboard && this._modelSelections.length === 1 && this._modelSelections[0].isEmpty());
                    const multicursorText = (Array.isArray(rawTextToCopy) ? rawTextToCopy : null);
                    const text = (Array.isArray(rawTextToCopy) ? rawTextToCopy.join(newLineCharacter) : rawTextToCopy);
                    let html = undefined;
                    let mode = null;
                    if (textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting || (this._copyWithSyntaxHighlighting && text.length < 65536)) {
                        const richText = this._context.viewModel.getRichTextToCopy(this._modelSelections, this._emptySelectionClipboard);
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
                    if (this._accessibilitySupport === 1 /* AccessibilitySupport.Disabled */) {
                        // We know for a fact that a screen reader is not attached
                        // On OSX, we write the character before the cursor to allow for "long-press" composition
                        // Also on OSX, we write the word before the cursor to allow for the Accessibility Keyboard to give good hints
                        const selection = this._selections[0];
                        if (platform.isMacintosh && selection.isEmpty()) {
                            const position = selection.getStartPosition();
                            let textBefore = this._getWordBeforePosition(position);
                            if (textBefore.length === 0) {
                                textBefore = this._getCharacterBeforePosition(position);
                            }
                            if (textBefore.length > 0) {
                                return new textAreaState_1.TextAreaState(textBefore, textBefore.length, textBefore.length, range_1.Range.fromPositions(position), 0);
                            }
                        }
                        // on macOS, write current selection into textarea will allow system text services pick selected text,
                        // but we still want to limit the amount of text given Chromium handles very poorly text even of a few
                        // thousand chars
                        // (https://github.com/microsoft/vscode/issues/27799)
                        const LIMIT_CHARS = 500;
                        if (platform.isMacintosh && !selection.isEmpty() && simpleModel.getValueLengthInRange(selection, 0 /* EndOfLinePreference.TextDefined */) < LIMIT_CHARS) {
                            const text = simpleModel.getValueInRange(selection, 0 /* EndOfLinePreference.TextDefined */);
                            return new textAreaState_1.TextAreaState(text, 0, text.length, selection, 0);
                        }
                        // on Safari, document.execCommand('cut') and document.execCommand('copy') will just not work
                        // if the textarea has no content selected. So if there is an editor selection, ensure something
                        // is selected in the textarea.
                        if (browser.isSafari && !selection.isEmpty()) {
                            const placeholderText = 'vscode-placeholder';
                            return new textAreaState_1.TextAreaState(placeholderText, 0, placeholderText.length, null, undefined);
                        }
                        return textAreaState_1.TextAreaState.EMPTY;
                    }
                    if (browser.isAndroid) {
                        // when tapping in the editor on a word, Android enters composition mode.
                        // in the `compositionstart` event we cannot clear the textarea, because
                        // it then forgets to ever send a `compositionend`.
                        // we therefore only write the current word in the textarea
                        const selection = this._selections[0];
                        if (selection.isEmpty()) {
                            const position = selection.getStartPosition();
                            const [wordAtPosition, positionOffsetInWord] = this._getAndroidWordAtPosition(position);
                            if (wordAtPosition.length > 0) {
                                return new textAreaState_1.TextAreaState(wordAtPosition, positionOffsetInWord, positionOffsetInWord, range_1.Range.fromPositions(position), 0);
                            }
                        }
                        return textAreaState_1.TextAreaState.EMPTY;
                    }
                    return textAreaState_1.PagedScreenReaderStrategy.fromEditorSelection(simpleModel, this._selections[0], this._accessibilityPageSize, this._accessibilitySupport === 0 /* AccessibilitySupport.Unknown */);
                },
                deduceModelPosition: (viewAnchorPosition, deltaOffset, lineFeedCnt) => {
                    return this._context.viewModel.deduceModelPositionRelativeToViewPosition(viewAnchorPosition, deltaOffset, lineFeedCnt);
                }
            };
            const textAreaWrapper = this._register(new textAreaInput_1.TextAreaWrapper(this.textArea.domNode));
            this._textAreaInput = this._register(new textAreaInput_1.TextAreaInput(textAreaInputHost, textAreaWrapper, platform.OS, {
                isAndroid: browser.isAndroid,
                isChrome: browser.isChrome,
                isFirefox: browser.isFirefox,
                isSafari: browser.isSafari,
            }));
            this._register(this._textAreaInput.onKeyDown((e) => {
                this._viewController.emitKeyDown(e);
            }));
            this._register(this._textAreaInput.onKeyUp((e) => {
                this._viewController.emitKeyUp(e);
            }));
            this._register(this._textAreaInput.onPaste((e) => {
                let pasteOnNewLine = false;
                let multicursorText = null;
                let mode = null;
                if (e.metadata) {
                    pasteOnNewLine = (this._emptySelectionClipboard && !!e.metadata.isFromEmptySelection);
                    multicursorText = (typeof e.metadata.multicursorText !== 'undefined' ? e.metadata.multicursorText : null);
                    mode = e.metadata.mode;
                }
                this._viewController.paste(e.text, pasteOnNewLine, multicursorText, mode);
            }));
            this._register(this._textAreaInput.onCut(() => {
                this._viewController.cut();
            }));
            this._register(this._textAreaInput.onType((e) => {
                if (e.replacePrevCharCnt || e.replaceNextCharCnt || e.positionDelta) {
                    // must be handled through the new command
                    if (textAreaState_1._debugComposition) {
                        console.log(` => compositionType: <<${e.text}>>, ${e.replacePrevCharCnt}, ${e.replaceNextCharCnt}, ${e.positionDelta}`);
                    }
                    this._viewController.compositionType(e.text, e.replacePrevCharCnt, e.replaceNextCharCnt, e.positionDelta);
                }
                else {
                    if (textAreaState_1._debugComposition) {
                        console.log(` => type: <<${e.text}>>`);
                    }
                    this._viewController.type(e.text);
                }
            }));
            this._register(this._textAreaInput.onSelectionChangeRequest((modelSelection) => {
                this._viewController.setSelection(modelSelection);
            }));
            this._register(this._textAreaInput.onCompositionStart((e) => {
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
                const modelSelection = this._modelSelections[0];
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
                    const widthOfHiddenTextBefore = measureText(this.textArea.domNode.ownerDocument, hiddenLineTextBefore, this._fontInfo, tabSize);
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
                this._context.viewModel.revealRange('keyboard', true, range_1.Range.fromPositions(this._selections[0].getStartPosition()), 0 /* viewEvents.VerticalRevealType.Simple */, 1 /* ScrollType.Immediate */);
                this._visibleTextArea = new VisibleTextAreaData(this._context, modelSelection.startLineNumber, distanceToModelLineStart, widthOfHiddenTextBefore, distanceToModelLineEnd);
                // We turn off wrapping if the <textarea> becomes visible for composition
                this.textArea.setAttribute('wrap', this._textAreaWrapping && !this._visibleTextArea ? 'on' : 'off');
                this._visibleTextArea.prepareRender(this._visibleRangeProvider);
                this._render();
                // Show the textarea
                this.textArea.setClassName(`inputarea ${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME} ime-input`);
                this._viewController.compositionStart();
                this._context.viewModel.onCompositionStart();
            }));
            this._register(this._textAreaInput.onCompositionUpdate((e) => {
                if (!this._visibleTextArea) {
                    return;
                }
                this._visibleTextArea.prepareRender(this._visibleRangeProvider);
                this._render();
            }));
            this._register(this._textAreaInput.onCompositionEnd(() => {
                this._visibleTextArea = null;
                // We turn on wrapping as necessary if the <textarea> hides after composition
                this.textArea.setAttribute('wrap', this._textAreaWrapping && !this._visibleTextArea ? 'on' : 'off');
                this._render();
                this.textArea.setClassName(`inputarea ${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
                this._viewController.compositionEnd();
                this._context.viewModel.onCompositionEnd();
            }));
            this._register(this._textAreaInput.onFocus(() => {
                this._context.viewModel.setHasFocus(true);
            }));
            this._register(this._textAreaInput.onBlur(() => {
                this._context.viewModel.setHasFocus(false);
            }));
            this._register(ime_1.IME.onDidChange(() => {
                this._ensureReadOnlyAttribute();
            }));
        }
        writeScreenReaderContent(reason) {
            this._textAreaInput.writeScreenReaderContent(reason);
        }
        dispose() {
            super.dispose();
        }
        _getAndroidWordAtPosition(position) {
            const ANDROID_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:",.<>/?';
            const lineContent = this._context.viewModel.getLineContent(position.lineNumber);
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(ANDROID_WORD_SEPARATORS);
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
        _getWordBeforePosition(position) {
            const lineContent = this._context.viewModel.getLineContent(position.lineNumber);
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(this._context.configuration.options.get(129 /* EditorOption.wordSeparators */));
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
        _getCharacterBeforePosition(position) {
            if (position.column > 1) {
                const lineContent = this._context.viewModel.getLineContent(position.lineNumber);
                const charBefore = lineContent.charAt(position.column - 2);
                if (!strings.isHighSurrogate(charBefore.charCodeAt(0))) {
                    return charBefore;
                }
            }
            return '';
        }
        _getAriaLabel(options) {
            const accessibilitySupport = options.get(2 /* EditorOption.accessibilitySupport */);
            if (accessibilitySupport === 1 /* AccessibilitySupport.Disabled */) {
                const toggleKeybindingLabel = this._keybindingService.lookupKeybinding('editor.action.toggleScreenReaderAccessibilityMode')?.getAriaLabel();
                const runCommandKeybindingLabel = this._keybindingService.lookupKeybinding('workbench.action.showCommands')?.getAriaLabel();
                const keybindingEditorKeybindingLabel = this._keybindingService.lookupKeybinding('workbench.action.openGlobalKeybindings')?.getAriaLabel();
                const editorNotAccessibleMessage = nls.localize('accessibilityModeOff', "The editor is not accessible at this time.");
                if (toggleKeybindingLabel) {
                    return nls.localize('accessibilityOffAriaLabel', "{0} To enable screen reader optimized mode, use {1}", editorNotAccessibleMessage, toggleKeybindingLabel);
                }
                else if (runCommandKeybindingLabel) {
                    return nls.localize('accessibilityOffAriaLabelNoKb', "{0} To enable screen reader optimized mode, open the quick pick with {1} and run the command Toggle Screen Reader Accessibility Mode, which is currently not triggerable via keyboard.", editorNotAccessibleMessage, runCommandKeybindingLabel);
                }
                else if (keybindingEditorKeybindingLabel) {
                    return nls.localize('accessibilityOffAriaLabelNoKbs', "{0} Please assign a keybinding for the command Toggle Screen Reader Accessibility Mode by accessing the keybindings editor with {1} and run it.", editorNotAccessibleMessage, keybindingEditorKeybindingLabel);
                }
                else {
                    // SOS
                    return editorNotAccessibleMessage;
                }
            }
            return options.get(4 /* EditorOption.ariaLabel */);
        }
        _setAccessibilityOptions(options) {
            this._accessibilitySupport = options.get(2 /* EditorOption.accessibilitySupport */);
            const accessibilityPageSize = options.get(3 /* EditorOption.accessibilityPageSize */);
            if (this._accessibilitySupport === 2 /* AccessibilitySupport.Enabled */ && accessibilityPageSize === editorOptions_1.EditorOptions.accessibilityPageSize.defaultValue) {
                // If a screen reader is attached and the default value is not set we should automatically increase the page size to 500 for a better experience
                this._accessibilityPageSize = 500;
            }
            else {
                this._accessibilityPageSize = accessibilityPageSize;
            }
            // When wrapping is enabled and a screen reader might be attached,
            // we will size the textarea to match the width used for wrapping points computation (see `domLineBreaksComputer.ts`).
            // This is because screen readers will read the text in the textarea and we'd like that the
            // wrapping points in the textarea match the wrapping points in the editor.
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const wrappingColumn = layoutInfo.wrappingColumn;
            if (wrappingColumn !== -1 && this._accessibilitySupport !== 1 /* AccessibilitySupport.Disabled */) {
                const fontInfo = options.get(50 /* EditorOption.fontInfo */);
                this._textAreaWrapping = true;
                this._textAreaWidth = Math.round(wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
            }
            else {
                this._textAreaWrapping = false;
                this._textAreaWidth = (canUseZeroSizeTextarea ? 0 : 1);
            }
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._setAccessibilityOptions(options);
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            this._contentHeight = layoutInfo.height;
            this._fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._emptySelectionClipboard = options.get(37 /* EditorOption.emptySelectionClipboard */);
            this._copyWithSyntaxHighlighting = options.get(25 /* EditorOption.copyWithSyntaxHighlighting */);
            this.textArea.setAttribute('wrap', this._textAreaWrapping && !this._visibleTextArea ? 'on' : 'off');
            const { tabSize } = this._context.viewModel.model.getOptions();
            this.textArea.domNode.style.tabSize = `${tabSize * this._fontInfo.spaceWidth}px`;
            this.textArea.setAttribute('aria-label', this._getAriaLabel(options));
            this.textArea.setAttribute('aria-required', options.get(5 /* EditorOption.ariaRequired */) ? 'true' : 'false');
            this.textArea.setAttribute('tabindex', String(options.get(123 /* EditorOption.tabIndex */)));
            if (e.hasChanged(34 /* EditorOption.domReadOnly */) || e.hasChanged(90 /* EditorOption.readOnly */)) {
                this._ensureReadOnlyAttribute();
            }
            if (e.hasChanged(2 /* EditorOption.accessibilitySupport */)) {
                this._textAreaInput.writeScreenReaderContent('strategy changed');
            }
            return true;
        }
        onCursorStateChanged(e) {
            this._selections = e.selections.slice(0);
            this._modelSelections = e.modelSelections.slice(0);
            // We must update the <textarea> synchronously, otherwise long press IME on macos breaks.
            // See https://github.com/microsoft/vscode/issues/165821
            this._textAreaInput.writeScreenReaderContent('selection changed');
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
            this._scrollLeft = e.scrollLeft;
            this._scrollTop = e.scrollTop;
            return true;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        // --- begin view API
        isFocused() {
            return this._textAreaInput.isFocused();
        }
        focusTextArea() {
            this._textAreaInput.focusTextArea();
        }
        refreshFocusState() {
            this._textAreaInput.refreshFocusState();
        }
        getLastRenderData() {
            return this._lastRenderPosition;
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
        _ensureReadOnlyAttribute() {
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
            this._primaryCursorPosition = new position_1.Position(this._selections[0].positionLineNumber, this._selections[0].positionColumn);
            this._primaryCursorVisibleRange = ctx.visibleRangeForPosition(this._primaryCursorPosition);
            this._visibleTextArea?.prepareRender(ctx);
        }
        render(ctx) {
            this._textAreaInput.writeScreenReaderContent('render');
            this._render();
        }
        _render() {
            if (this._visibleTextArea) {
                // The text area is visible for composition reasons
                const visibleStart = this._visibleTextArea.visibleTextareaStart;
                const visibleEnd = this._visibleTextArea.visibleTextareaEnd;
                const startPosition = this._visibleTextArea.startPosition;
                const endPosition = this._visibleTextArea.endPosition;
                if (startPosition && endPosition && visibleStart && visibleEnd && visibleEnd.left >= this._scrollLeft && visibleStart.left <= this._scrollLeft + this._contentWidth) {
                    const top = (this._context.viewLayout.getVerticalOffsetForLineNumber(this._primaryCursorPosition.lineNumber) - this._scrollTop);
                    const lineCount = this._newlinecount(this.textArea.domNode.value.substr(0, this.textArea.domNode.selectionStart));
                    let scrollLeft = this._visibleTextArea.widthOfHiddenLineTextBefore;
                    let left = (this._contentLeft + visibleStart.left - this._scrollLeft);
                    // See https://github.com/microsoft/vscode/issues/141725#issuecomment-1050670841
                    // Here we are adding +1 to avoid flickering that might be caused by having a width that is too small.
                    // This could be caused by rounding errors that might only show up with certain font families.
                    // In other words, a pixel might be lost when doing something like
                    //      `Math.round(end) - Math.round(start)`
                    // vs
                    //      `Math.round(end - start)`
                    let width = visibleEnd.left - visibleStart.left + 1;
                    if (left < this._contentLeft) {
                        // the textarea would be rendered on top of the margin,
                        // so reduce its width. We use the same technique as
                        // for hiding text before
                        const delta = (this._contentLeft - left);
                        left += delta;
                        scrollLeft += delta;
                        width -= delta;
                    }
                    if (width > this._contentWidth) {
                        // the textarea would be wider than the content width,
                        // so reduce its width.
                        width = this._contentWidth;
                    }
                    // Try to render the textarea with the color/font style to match the text under it
                    const viewLineData = this._context.viewModel.getViewLineData(startPosition.lineNumber);
                    const startTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(startPosition.column - 1);
                    const endTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(endPosition.column - 1);
                    const textareaSpansSingleToken = (startTokenIndex === endTokenIndex);
                    const presentation = this._visibleTextArea.definePresentation((textareaSpansSingleToken ? viewLineData.tokens.getPresentation(startTokenIndex) : null));
                    this.textArea.domNode.scrollTop = lineCount * this._lineHeight;
                    this.textArea.domNode.scrollLeft = scrollLeft;
                    this._doRender({
                        lastRenderPosition: null,
                        top: top,
                        left: left,
                        width: width,
                        height: this._lineHeight,
                        useCover: false,
                        color: (languages_1.TokenizationRegistry.getColorMap() || [])[presentation.foreground],
                        italic: presentation.italic,
                        bold: presentation.bold,
                        underline: presentation.underline,
                        strikethrough: presentation.strikethrough
                    });
                }
                return;
            }
            if (!this._primaryCursorVisibleRange) {
                // The primary cursor is outside the viewport => place textarea to the top left
                this._renderAtTopLeft();
                return;
            }
            const left = this._contentLeft + this._primaryCursorVisibleRange.left - this._scrollLeft;
            if (left < this._contentLeft || left > this._contentLeft + this._contentWidth) {
                // cursor is outside the viewport
                this._renderAtTopLeft();
                return;
            }
            const top = this._context.viewLayout.getVerticalOffsetForLineNumber(this._selections[0].positionLineNumber) - this._scrollTop;
            if (top < 0 || top > this._contentHeight) {
                // cursor is outside the viewport
                this._renderAtTopLeft();
                return;
            }
            // The primary cursor is in the viewport (at least vertically) => place textarea on the cursor
            if (platform.isMacintosh) {
                // For the popup emoji input, we will make the text area as high as the line height
                // We will also make the fontSize and lineHeight the correct dimensions to help with the placement of these pickers
                this._doRender({
                    lastRenderPosition: this._primaryCursorPosition,
                    top,
                    left: this._textAreaWrapping ? this._contentLeft : left,
                    width: this._textAreaWidth,
                    height: this._lineHeight,
                    useCover: false
                });
                // In case the textarea contains a word, we're going to try to align the textarea's cursor
                // with our cursor by scrolling the textarea as much as possible
                this.textArea.domNode.scrollLeft = this._primaryCursorVisibleRange.left;
                const lineCount = this._textAreaInput.textAreaState.newlineCountBeforeSelection ?? this._newlinecount(this.textArea.domNode.value.substr(0, this.textArea.domNode.selectionStart));
                this.textArea.domNode.scrollTop = lineCount * this._lineHeight;
                return;
            }
            this._doRender({
                lastRenderPosition: this._primaryCursorPosition,
                top: top,
                left: this._textAreaWrapping ? this._contentLeft : left,
                width: this._textAreaWidth,
                height: (canUseZeroSizeTextarea ? 0 : 1),
                useCover: false
            });
        }
        _newlinecount(text) {
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
        _renderAtTopLeft() {
            // (in WebKit the textarea is 1px by 1px because it cannot handle input to a 0x0 textarea)
            // specifically, when doing Korean IME, setting the textarea to 0x0 breaks IME badly.
            this._doRender({
                lastRenderPosition: null,
                top: 0,
                left: 0,
                width: this._textAreaWidth,
                height: (canUseZeroSizeTextarea ? 0 : 1),
                useCover: true
            });
        }
        _doRender(renderData) {
            this._lastRenderPosition = renderData.lastRenderPosition;
            const ta = this.textArea;
            const tac = this.textAreaCover;
            (0, domFontInfo_1.applyFontInfo)(ta, this._fontInfo);
            ta.setTop(renderData.top);
            ta.setLeft(renderData.left);
            ta.setWidth(renderData.width);
            ta.setHeight(renderData.height);
            ta.setColor(renderData.color ? color_1.Color.Format.CSS.formatHex(renderData.color) : '');
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
                tac.setClassName('monaco-editor-background textAreaCover ' + margin_1.Margin.OUTER_CLASS_NAME);
            }
            else {
                if (options.get(67 /* EditorOption.lineNumbers */).renderType !== 0 /* RenderLineNumbersType.Off */) {
                    tac.setClassName('monaco-editor-background textAreaCover ' + lineNumbers_1.LineNumbersOverlay.CLASS_NAME);
                }
                else {
                    tac.setClassName('monaco-editor-background textAreaCover');
                }
            }
        }
    };
    exports.TextAreaHandler = TextAreaHandler;
    exports.TextAreaHandler = TextAreaHandler = __decorate([
        __param(3, keybinding_1.IKeybindingService)
    ], TextAreaHandler);
    function measureText(document, text, fontInfo, tabSize) {
        if (text.length === 0) {
            return 0;
        }
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-50000px';
        container.style.width = '50000px';
        const regularDomNode = document.createElement('span');
        (0, domFontInfo_1.applyFontInfo)(regularDomNode, fontInfo);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEFyZWFIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvY29udHJvbGxlci90ZXh0QXJlYUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0NoRyxNQUFNLG1CQUFtQjtRQWlCeEIsWUFDa0IsUUFBcUIsRUFDdEIsZUFBdUIsRUFDdkIsd0JBQWdDLEVBQ2hDLDJCQUFtQyxFQUNuQyxzQkFBOEI7WUFKN0IsYUFBUSxHQUFSLFFBQVEsQ0FBYTtZQUN0QixvQkFBZSxHQUFmLGVBQWUsQ0FBUTtZQUN2Qiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQVE7WUFDaEMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUFRO1lBQ25DLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBUTtZQXJCL0MsMEJBQXFCLEdBQVMsU0FBUyxDQUFDO1lBRWpDLGtCQUFhLEdBQW9CLElBQUksQ0FBQztZQUN0QyxnQkFBVyxHQUFvQixJQUFJLENBQUM7WUFFcEMseUJBQW9CLEdBQThCLElBQUksQ0FBQztZQUN2RCx1QkFBa0IsR0FBOEIsSUFBSSxDQUFDO1lBRTVEOzs7OztlQUtHO1lBQ0ssMEJBQXFCLEdBQThCLElBQUksQ0FBQztRQVNoRSxDQUFDO1FBRUQsYUFBYSxDQUFDLG9CQUEyQztZQUN4RCxNQUFNLGtCQUFrQixHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRyxNQUFNLGdCQUFnQixHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLHNCQUFz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