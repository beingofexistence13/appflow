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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/base/browser/dom", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/common/services/model", "vs/base/common/uri", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/platform/actions/browser/toolbar", "vs/base/browser/ui/progressbar/progressbar", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/browser/style", "vs/editor/common/core/editOperation", "vs/editor/common/languages/language", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/editor/common/services/languageFeatures", "vs/editor/common/model/textModel", "vs/workbench/contrib/inlineChat/browser/utils", "vs/editor/common/core/lineRange", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/iconLabel/iconLabels", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/base/common/async", "vs/base/browser/ui/aria/aria", "vs/platform/actions/browser/buttonbar", "vs/workbench/contrib/chat/browser/chatSlashCommandContentWidget", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/base/browser/mouseEvent", "vs/css!./inlineChat"], function (require, exports, lifecycle_1, range_1, nls_1, contextkey_1, instantiation_1, zoneWidget_1, inlineChat_1, dom_1, event_1, editorExtensions_1, snippetController2_1, model_1, uri_1, embeddedCodeEditorWidget_1, toolbar_1, progressbar_1, suggestController_1, style_1, editOperation_1, language_1, labels_1, files_1, languageFeatures_1, textModel_1, utils_1, lineRange_1, accessibility_1, configuration_1, keybinding_1, iconLabels_1, inlineChatSession_1, async_1, aria, buttonbar_1, chatSlashCommandContentWidget_1, contextView_1, accessibleView_1, mouseEvent_1) {
    "use strict";
    var InlineChatWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatZoneWidget = exports.InlineChatWidget = void 0;
    const defaultAriaLabel = (0, nls_1.localize)('aria-label', "Inline Chat Input");
    const _inputEditorOptions = {
        padding: { top: 2, bottom: 2 },
        overviewRulerLanes: 0,
        glyphMargin: false,
        lineNumbers: 'off',
        folding: false,
        hideCursorInOverviewRuler: true,
        selectOnLineNumbers: false,
        selectionHighlight: false,
        scrollbar: {
            useShadows: false,
            vertical: 'hidden',
            horizontal: 'auto',
            alwaysConsumeMouseWheel: false
        },
        lineDecorationsWidth: 0,
        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        renderLineHighlight: 'none',
        fixedOverflowWidgets: true,
        dragAndDrop: false,
        revealHorizontalRightPadding: 5,
        minimap: { enabled: false },
        guides: { indentation: false },
        rulers: [],
        cursorWidth: 1,
        cursorStyle: 'line',
        cursorBlinking: 'blink',
        wrappingStrategy: 'advanced',
        wrappingIndent: 'none',
        renderWhitespace: 'none',
        dropIntoEditor: { enabled: true },
        quickSuggestions: false,
        suggest: {
            showIcons: false,
            showSnippets: false,
            showStatusBar: false,
        },
        wordWrap: 'on',
        ariaLabel: defaultAriaLabel,
        fontFamily: style_1.DEFAULT_FONT_FAMILY,
        fontSize: 13,
        lineHeight: 20
    };
    const _previewEditorEditorOptions = {
        scrollbar: { useShadows: false, alwaysConsumeMouseWheel: false },
        renderMarginRevertIcon: false,
        diffCodeLens: false,
        scrollBeyondLastLine: false,
        stickyScroll: { enabled: false },
        originalAriaLabel: (0, nls_1.localize)('original', 'Original'),
        modifiedAriaLabel: (0, nls_1.localize)('modified', 'Modified'),
        diffAlgorithm: 'advanced',
        readOnly: true,
        isInEmbeddedEditor: true
    };
    let InlineChatWidget = class InlineChatWidget {
        static { InlineChatWidget_1 = this; }
        static { this._modelPool = 1; }
        constructor(parentEditor, _modelService, _languageService, _contextKeyService, _languageFeaturesService, _keybindingService, _instantiationService, _accessibilityService, _configurationService, _contextMenuService, _accessibleViewService) {
            this.parentEditor = parentEditor;
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._contextKeyService = _contextKeyService;
            this._languageFeaturesService = _languageFeaturesService;
            this._keybindingService = _keybindingService;
            this._instantiationService = _instantiationService;
            this._accessibilityService = _accessibilityService;
            this._configurationService = _configurationService;
            this._contextMenuService = _contextMenuService;
            this._accessibleViewService = _accessibleViewService;
            this._elements = (0, dom_1.h)('div.inline-chat@root', [
                (0, dom_1.h)('div.body', [
                    (0, dom_1.h)('div.content@content', [
                        (0, dom_1.h)('div.input@input', [
                            (0, dom_1.h)('div.editor-placeholder@placeholder'),
                            (0, dom_1.h)('div.editor-container@editor'),
                        ]),
                        (0, dom_1.h)('div.toolbar@editorToolbar'),
                    ]),
                ]),
                (0, dom_1.h)('div.progress@progress'),
                (0, dom_1.h)('div.previewDiff.hidden@previewDiff'),
                (0, dom_1.h)('div.previewCreateTitle.show-file-icons@previewCreateTitle'),
                (0, dom_1.h)('div.previewCreate.hidden@previewCreate'),
                (0, dom_1.h)('div.markdownMessage.hidden@markdownMessage', [
                    (0, dom_1.h)('div.message@message'),
                    (0, dom_1.h)('div.messageActions@messageActions')
                ]),
                (0, dom_1.h)('div.status@status', [
                    (0, dom_1.h)('div.label.info.hidden@infoLabel'),
                    (0, dom_1.h)('div.actions.hidden@statusToolbar'),
                    (0, dom_1.h)('div.label.status.hidden@statusLabel'),
                    (0, dom_1.h)('div.actions.hidden@feedbackToolbar'),
                ]),
            ]);
            this._store = new lifecycle_1.DisposableStore();
            this._slashCommands = this._store.add(new lifecycle_1.DisposableStore());
            this._previewDiffModel = this._store.add(new lifecycle_1.MutableDisposable());
            this._previewCreateModel = this._store.add(new lifecycle_1.MutableDisposable());
            this._onDidChangeHeight = new event_1.MicrotaskEmitter();
            this.onDidChangeHeight = event_1.Event.filter(this._onDidChangeHeight.event, _ => !this._isLayouting);
            this._onDidChangeInput = new event_1.Emitter();
            this.onDidChangeInput = this._onDidChangeInput.event;
            this._isLayouting = false;
            this._expansionState = inlineChatSession_1.ExpansionState.NOT_CROPPED;
            this._slashCommandDetails = [];
            // input editor logic
            const codeEditorWidgetOptions = {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    snippetController2_1.SnippetController2.ID,
                    suggestController_1.SuggestController.ID
                ])
            };
            this._inputEditor = this._instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this._elements.editor, _inputEditorOptions, codeEditorWidgetOptions, this.parentEditor);
            this._updateAriaLabel();
            this._store.add(this._inputEditor);
            this._store.add(this._inputEditor.onDidChangeModelContent(() => this._onDidChangeInput.fire(this)));
            this._store.add(this._inputEditor.onDidLayoutChange(() => this._onDidChangeHeight.fire()));
            this._store.add(this._inputEditor.onDidContentSizeChange(() => this._onDidChangeHeight.fire()));
            this._store.add((0, dom_1.addDisposableListener)(this._elements.message, 'focus', () => this._ctxResponseFocused.set(true)));
            this._store.add((0, dom_1.addDisposableListener)(this._elements.message, 'blur', () => this._ctxResponseFocused.reset()));
            this._store.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                    this._updateAriaLabel();
                }
            }));
            const uri = uri_1.URI.from({ scheme: 'vscode', authority: 'inline-chat', path: `/inline-chat/model${InlineChatWidget_1._modelPool++}.txt` });
            this._inputModel = this._store.add(this._modelService.getModel(uri) ?? this._modelService.createModel('', null, uri));
            this._inputEditor.setModel(this._inputModel);
            // --- context keys
            this._ctxMessageCropState = inlineChat_1.CTX_INLINE_CHAT_MESSAGE_CROP_STATE.bindTo(this._contextKeyService);
            this._ctxInputEmpty = inlineChat_1.CTX_INLINE_CHAT_EMPTY.bindTo(this._contextKeyService);
            this._ctxInnerCursorFirst = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_FIRST.bindTo(this._contextKeyService);
            this._ctxInnerCursorLast = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_LAST.bindTo(this._contextKeyService);
            this._ctxInnerCursorStart = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_START.bindTo(this._contextKeyService);
            this._ctxInnerCursorEnd = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_END.bindTo(this._contextKeyService);
            this._ctxInputEditorFocused = inlineChat_1.CTX_INLINE_CHAT_FOCUSED.bindTo(this._contextKeyService);
            this._ctxResponseFocused = inlineChat_1.CTX_INLINE_CHAT_RESPONSE_FOCUSED.bindTo(this._contextKeyService);
            // (1) inner cursor position (last/first line selected)
            const updateInnerCursorFirstLast = () => {
                const selection = this._inputEditor.getSelection();
                const fullRange = this._inputModel.getFullModelRange();
                let onFirst = false;
                let onLast = false;
                if (selection.isEmpty()) {
                    const selectionTop = this._inputEditor.getTopForPosition(selection.startLineNumber, selection.startColumn);
                    const firstViewLineTop = this._inputEditor.getTopForPosition(fullRange.startLineNumber, fullRange.startColumn);
                    const lastViewLineTop = this._inputEditor.getTopForPosition(fullRange.endLineNumber, fullRange.endColumn);
                    if (selectionTop === firstViewLineTop) {
                        onFirst = true;
                    }
                    if (selectionTop === lastViewLineTop) {
                        onLast = true;
                    }
                }
                this._ctxInnerCursorFirst.set(onFirst);
                this._ctxInnerCursorLast.set(onLast);
                this._ctxInnerCursorStart.set(fullRange.getStartPosition().equals(selection.getStartPosition()));
                this._ctxInnerCursorEnd.set(fullRange.getEndPosition().equals(selection.getEndPosition()));
            };
            this._store.add(this._inputEditor.onDidChangeCursorPosition(updateInnerCursorFirstLast));
            updateInnerCursorFirstLast();
            // (2) input editor focused or not
            const updateFocused = () => {
                const hasFocus = this._inputEditor.hasWidgetFocus();
                this._ctxInputEditorFocused.set(hasFocus);
                this._elements.content.classList.toggle('synthetic-focus', hasFocus);
                this.readPlaceholder();
            };
            this._store.add(this._inputEditor.onDidFocusEditorWidget(updateFocused));
            this._store.add(this._inputEditor.onDidBlurEditorWidget(updateFocused));
            this._store.add((0, lifecycle_1.toDisposable)(() => {
                this._ctxInnerCursorFirst.reset();
                this._ctxInnerCursorLast.reset();
                this._ctxInputEditorFocused.reset();
            }));
            updateFocused();
            // placeholder
            this._elements.placeholder.style.fontSize = `${this._inputEditor.getOption(52 /* EditorOption.fontSize */)}px`;
            this._elements.placeholder.style.lineHeight = `${this._inputEditor.getOption(66 /* EditorOption.lineHeight */)}px`;
            this._store.add((0, dom_1.addDisposableListener)(this._elements.placeholder, 'click', () => this._inputEditor.focus()));
            // show/hide placeholder depending on text model being empty
            // content height
            const currentContentHeight = 0;
            const togglePlaceholder = () => {
                const hasText = this._inputModel.getValueLength() > 0;
                this._elements.placeholder.classList.toggle('hidden', hasText);
                this._ctxInputEmpty.set(!hasText);
                this.readPlaceholder();
                const contentHeight = this._inputEditor.getContentHeight();
                if (contentHeight !== currentContentHeight && this._lastDim) {
                    this._lastDim = this._lastDim.with(undefined, contentHeight);
                    this._inputEditor.layout(this._lastDim);
                    this._onDidChangeHeight.fire();
                }
            };
            this._store.add(this._inputModel.onDidChangeContent(togglePlaceholder));
            togglePlaceholder();
            // slash command content widget
            this._slashCommandContentWidget = new chatSlashCommandContentWidget_1.SlashCommandContentWidget(this._inputEditor);
            this._store.add(this._slashCommandContentWidget);
            // toolbars
            const toolbar = this._instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this._elements.editorToolbar, inlineChat_1.MENU_INLINE_CHAT_WIDGET, {
                telemetrySource: 'interactiveEditorWidget-toolbar',
                toolbarOptions: { primaryGroup: 'main' }
            });
            this._store.add(toolbar);
            this._progressBar = new progressbar_1.ProgressBar(this._elements.progress);
            this._store.add(this._progressBar);
            const workbenchMenubarOptions = {
                telemetrySource: 'interactiveEditorWidget-toolbar',
                buttonConfigProvider: action => {
                    if (action.id === inlineChat_1.ACTION_REGENERATE_RESPONSE) {
                        return { showIcon: true, showLabel: false };
                    }
                    else if (action.id === inlineChat_1.ACTION_VIEW_IN_CHAT) {
                        return { isSecondary: false };
                    }
                    return undefined;
                }
            };
            const statusButtonBar = this._instantiationService.createInstance(buttonbar_1.MenuWorkbenchButtonBar, this._elements.statusToolbar, inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS, workbenchMenubarOptions);
            this._store.add(statusButtonBar.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
            this._store.add(statusButtonBar);
            const workbenchToolbarOptions = {
                hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                toolbarOptions: {
                    primaryGroup: () => true,
                    useSeparatorsInPrimaryActions: true
                }
            };
            const feedbackToolbar = this._instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this._elements.feedbackToolbar, inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK, { ...workbenchToolbarOptions, hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */ });
            this._store.add(feedbackToolbar.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
            this._store.add(feedbackToolbar);
            // preview editors
            this._previewDiffEditor = this._store.add(new async_1.IdleValue(() => this._store.add(_instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, this._elements.previewDiff, {
                ..._previewEditorEditorOptions,
                onlyShowAccessibleDiffViewer: this._accessibilityService.isScreenReaderOptimized(),
            }, { modifiedEditor: codeEditorWidgetOptions, originalEditor: codeEditorWidgetOptions }, parentEditor))));
            this._previewCreateTitle = this._store.add(_instantiationService.createInstance(labels_1.ResourceLabel, this._elements.previewCreateTitle, { supportIcons: true }));
            this._previewCreateEditor = this._store.add(new async_1.IdleValue(() => this._store.add(_instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this._elements.previewCreate, _previewEditorEditorOptions, codeEditorWidgetOptions, parentEditor))));
            this._elements.message.tabIndex = 0;
            this._elements.message.ariaLabel = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
            this._elements.statusLabel.tabIndex = 0;
            const markdownMessageToolbar = this._instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this._elements.messageActions, inlineChat_1.MENU_INLINE_CHAT_WIDGET_MARKDOWN_MESSAGE, workbenchToolbarOptions);
            this._store.add(markdownMessageToolbar.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
            this._store.add(markdownMessageToolbar);
            this._store.add((0, dom_1.addDisposableListener)(this._elements.root, dom_1.EventType.CONTEXT_MENU, async (event) => {
                this._onContextMenu(event);
            }));
            this._store.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                    this._elements.message.ariaLabel = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
                }
            }));
        }
        _onContextMenu(e) {
            const event = new mouseEvent_1.StandardMouseEvent(e);
            this._contextMenuService.showContextMenu({
                menuId: inlineChat_1.MENU_INLINE_CHAT_WIDGET_TOGGLE,
                getAnchor: () => event,
            });
        }
        _updateAriaLabel() {
            if (!this._accessibilityService.isScreenReaderOptimized()) {
                return;
            }
            let label = defaultAriaLabel;
            if (this._configurationService.getValue("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                const kbLabel = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                label = kbLabel ? (0, nls_1.localize)('inlineChat.accessibilityHelp', "Inline Chat Input, Use {0} for Inline Chat Accessibility Help.", kbLabel) : (0, nls_1.localize)('inlineChat.accessibilityHelpNoKb', "Inline Chat Input, Run the Inline Chat Accessibility Help command for more information.");
            }
            _inputEditorOptions.ariaLabel = label;
            this._inputEditor.updateOptions({ ariaLabel: label });
        }
        dispose() {
            this._store.dispose();
            this._ctxInputEmpty.reset();
            this._ctxMessageCropState.reset();
        }
        get domNode() {
            return this._elements.root;
        }
        layout(dim) {
            this._isLayouting = true;
            try {
                const innerEditorWidth = dim.width - ((0, dom_1.getTotalWidth)(this._elements.editorToolbar) + 8 /* L/R-padding */);
                dim = new dom_1.Dimension(innerEditorWidth, dim.height);
                if (!this._lastDim || !dom_1.Dimension.equals(this._lastDim, dim)) {
                    this._lastDim = dim;
                    this._inputEditor.layout(new dom_1.Dimension(innerEditorWidth, this._inputEditor.getContentHeight()));
                    this._elements.placeholder.style.width = `${innerEditorWidth /* input-padding*/}px`;
                    const previewDiffDim = new dom_1.Dimension(dim.width, Math.min(300, Math.max(0, this._previewDiffEditor.value.getContentHeight())));
                    this._previewDiffEditor.value.layout(previewDiffDim);
                    this._elements.previewDiff.style.height = `${previewDiffDim.height}px`;
                    const previewCreateDim = new dom_1.Dimension(dim.width, Math.min(300, Math.max(0, this._previewCreateEditor.value.getContentHeight())));
                    this._previewCreateEditor.value.layout(previewCreateDim);
                    this._elements.previewCreate.style.height = `${previewCreateDim.height}px`;
                    const lineHeight = this.parentEditor.getOption(66 /* EditorOption.lineHeight */);
                    const editorHeight = this.parentEditor.getLayoutInfo().height;
                    const editorHeightInLines = Math.floor(editorHeight / lineHeight);
                    this._elements.root.style.setProperty('--vscode-inline-chat-cropped', String(Math.floor(editorHeightInLines / 5)));
                    this._elements.root.style.setProperty('--vscode-inline-chat-expanded', String(Math.floor(editorHeightInLines / 3)));
                }
            }
            finally {
                this._isLayouting = false;
            }
        }
        getHeight() {
            const base = (0, dom_1.getTotalHeight)(this._elements.progress) + (0, dom_1.getTotalHeight)(this._elements.status);
            const editorHeight = this._inputEditor.getContentHeight() + 12 /* padding and border */;
            const markdownMessageHeight = (0, dom_1.getTotalHeight)(this._elements.markdownMessage);
            const previewDiffHeight = this._previewDiffEditor.value.getModel() ? 12 + Math.min(300, Math.max(0, this._previewDiffEditor.value.getContentHeight())) : 0;
            const previewCreateTitleHeight = (0, dom_1.getTotalHeight)(this._elements.previewCreateTitle);
            const previewCreateHeight = this._previewCreateEditor.value.getModel() ? 18 + Math.min(300, Math.max(0, this._previewCreateEditor.value.getContentHeight())) : 0;
            return base + editorHeight + markdownMessageHeight + previewDiffHeight + previewCreateTitleHeight + previewCreateHeight + 18 /* padding */ + 8 /*shadow*/;
        }
        updateProgress(show) {
            if (show) {
                this._progressBar.infinite();
            }
            else {
                this._progressBar.stop();
            }
        }
        get value() {
            return this._inputModel.getValue();
        }
        set value(value) {
            this._inputModel.setValue(value);
            this._inputEditor.setPosition(this._inputModel.getFullModelRange().getEndPosition());
        }
        selectAll(includeSlashCommand = true) {
            let selection = this._inputModel.getFullModelRange();
            if (!includeSlashCommand) {
                const firstLine = this._inputModel.getLineContent(1);
                const slashCommand = this._slashCommandDetails.find(c => firstLine.startsWith(`/${c.command} `));
                selection = slashCommand ? new range_1.Range(1, slashCommand.command.length + 3, selection.endLineNumber, selection.endColumn) : selection;
            }
            this._inputEditor.setSelection(selection);
        }
        set placeholder(value) {
            this._elements.placeholder.innerText = value;
        }
        readPlaceholder() {
            const slashCommand = this._slashCommandDetails.find(c => `${c.command} ` === this._inputModel.getValue().substring(1));
            const hasText = this._inputModel.getValueLength() > 0;
            if (!hasText) {
                aria.status(this._elements.placeholder.innerText);
            }
            else if (slashCommand) {
                aria.status(slashCommand.detail);
            }
        }
        updateToolbar(show) {
            this._elements.statusToolbar.classList.toggle('hidden', !show);
            this._elements.feedbackToolbar.classList.toggle('hidden', !show);
            this._elements.status.classList.toggle('actions', show);
            this._elements.infoLabel.classList.toggle('hidden', show);
            this._onDidChangeHeight.fire();
        }
        get expansionState() {
            return this._expansionState;
        }
        set preferredExpansionState(expansionState) {
            this._preferredExpansionState = expansionState;
        }
        get responseContent() {
            return this._elements.markdownMessage.textContent ?? undefined;
        }
        updateMarkdownMessage(message) {
            this._elements.markdownMessage.classList.toggle('hidden', !message);
            let expansionState;
            if (!message) {
                (0, dom_1.reset)(this._elements.message);
                this._ctxMessageCropState.reset();
                expansionState = inlineChatSession_1.ExpansionState.NOT_CROPPED;
            }
            else {
                if (this._preferredExpansionState) {
                    (0, dom_1.reset)(this._elements.message, message);
                    expansionState = this._preferredExpansionState;
                    this._preferredExpansionState = undefined;
                }
                else {
                    this._updateLineClamp(inlineChatSession_1.ExpansionState.CROPPED);
                    (0, dom_1.reset)(this._elements.message, message);
                    expansionState = this._elements.message.scrollHeight > this._elements.message.clientHeight ? inlineChatSession_1.ExpansionState.CROPPED : inlineChatSession_1.ExpansionState.NOT_CROPPED;
                }
                this._ctxMessageCropState.set(expansionState);
                this._updateLineClamp(expansionState);
            }
            this._expansionState = expansionState;
            this._onDidChangeHeight.fire();
        }
        updateMarkdownMessageExpansionState(expansionState) {
            this._ctxMessageCropState.set(expansionState);
            const heightBefore = this._elements.markdownMessage.scrollHeight;
            this._updateLineClamp(expansionState);
            const heightAfter = this._elements.markdownMessage.scrollHeight;
            if (heightBefore === heightAfter) {
                this._ctxMessageCropState.set(inlineChatSession_1.ExpansionState.NOT_CROPPED);
            }
            this._onDidChangeHeight.fire();
        }
        _updateLineClamp(expansionState) {
            this._elements.message.setAttribute('state', expansionState);
        }
        updateInfo(message) {
            this._elements.infoLabel.classList.toggle('hidden', !message);
            const renderedMessage = (0, iconLabels_1.renderLabelWithIcons)(message);
            (0, dom_1.reset)(this._elements.infoLabel, ...renderedMessage);
            this._onDidChangeHeight.fire();
        }
        updateStatus(message, ops = {}) {
            const isTempMessage = typeof ops.resetAfter === 'number';
            if (isTempMessage && !this._elements.statusLabel.dataset['state']) {
                const statusLabel = this._elements.statusLabel.innerText;
                const classes = Array.from(this._elements.statusLabel.classList.values());
                setTimeout(() => {
                    this.updateStatus(statusLabel, { classes, keepMessage: true });
                }, ops.resetAfter);
            }
            (0, dom_1.reset)(this._elements.statusLabel, message);
            this._elements.statusLabel.className = `label status ${(ops.classes ?? []).join(' ')}`;
            this._elements.statusLabel.classList.toggle('hidden', !message);
            if (isTempMessage) {
                this._elements.statusLabel.dataset['state'] = 'temp';
            }
            else {
                delete this._elements.statusLabel.dataset['state'];
            }
            this._onDidChangeHeight.fire();
        }
        reset() {
            this._ctxInputEmpty.reset();
            this._ctxInnerCursorFirst.reset();
            this._ctxInnerCursorLast.reset();
            this._ctxInputEditorFocused.reset();
            this.value = '';
            this.updateMarkdownMessage(undefined);
            (0, dom_1.reset)(this._elements.statusLabel);
            this._elements.statusLabel.classList.toggle('hidden', true);
            this._elements.statusToolbar.classList.add('hidden');
            this._elements.feedbackToolbar.classList.add('hidden');
            this.hideCreatePreview();
            this.hideEditsPreview();
            this._onDidChangeHeight.fire();
        }
        focus() {
            this._inputEditor.focus();
        }
        hasFocus() {
            return this.domNode.contains((0, dom_1.getActiveElement)());
        }
        // --- preview
        showEditsPreview(textModelv0, allEdits, changes) {
            if (changes.length === 0) {
                this.hideEditsPreview();
                return;
            }
            this._elements.previewDiff.classList.remove('hidden');
            const languageSelection = { languageId: textModelv0.getLanguageId(), onDidChange: event_1.Event.None };
            const modified = this._modelService.createModel((0, textModel_1.createTextBufferFactoryFromSnapshot)(textModelv0.createSnapshot()), languageSelection, undefined, true);
            for (const edits of allEdits) {
                modified.applyEdits(edits, false);
            }
            this._previewDiffEditor.value.setModel({ original: textModelv0, modified });
            // joined ranges
            let originalLineRange = changes[0].original;
            let modifiedLineRange = changes[0].modified;
            for (let i = 1; i < changes.length; i++) {
                originalLineRange = originalLineRange.join(changes[i].original);
                modifiedLineRange = modifiedLineRange.join(changes[i].modified);
            }
            // apply extra padding
            const pad = 3;
            const newStartLine = Math.max(1, originalLineRange.startLineNumber - pad);
            modifiedLineRange = new lineRange_1.LineRange(newStartLine, modifiedLineRange.endLineNumberExclusive);
            originalLineRange = new lineRange_1.LineRange(newStartLine, originalLineRange.endLineNumberExclusive);
            const newEndLineModified = Math.min(modifiedLineRange.endLineNumberExclusive + pad, modified.getLineCount());
            modifiedLineRange = new lineRange_1.LineRange(modifiedLineRange.startLineNumber, newEndLineModified);
            const newEndLineOriginal = Math.min(originalLineRange.endLineNumberExclusive + pad, textModelv0.getLineCount());
            originalLineRange = new lineRange_1.LineRange(originalLineRange.startLineNumber, newEndLineOriginal);
            const hiddenOriginal = (0, utils_1.invertLineRange)(originalLineRange, textModelv0);
            const hiddenModified = (0, utils_1.invertLineRange)(modifiedLineRange, modified);
            this._previewDiffEditor.value.getOriginalEditor().setHiddenAreas(hiddenOriginal.map(utils_1.lineRangeAsRange), 'diff-hidden');
            this._previewDiffEditor.value.getModifiedEditor().setHiddenAreas(hiddenModified.map(utils_1.lineRangeAsRange), 'diff-hidden');
            this._previewDiffEditor.value.revealLine(modifiedLineRange.startLineNumber, 1 /* ScrollType.Immediate */);
            this._onDidChangeHeight.fire();
        }
        hideEditsPreview() {
            this._elements.previewDiff.classList.add('hidden');
            this._previewDiffEditor.value.setModel(null);
            this._previewDiffModel.clear();
            this._onDidChangeHeight.fire();
        }
        showCreatePreview(uri, edits) {
            this._elements.previewCreateTitle.classList.remove('hidden');
            this._elements.previewCreate.classList.remove('hidden');
            this._previewCreateTitle.element.setFile(uri, { fileKind: files_1.FileKind.FILE });
            const langSelection = this._languageService.createByFilepathOrFirstLine(uri, undefined);
            const model = this._modelService.createModel('', langSelection, undefined, true);
            model.applyEdits(edits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text)));
            this._previewCreateModel.value = model;
            this._previewCreateEditor.value.setModel(model);
            this._onDidChangeHeight.fire();
        }
        hideCreatePreview() {
            this._elements.previewCreateTitle.classList.add('hidden');
            this._elements.previewCreate.classList.add('hidden');
            this._previewCreateEditor.value.setModel(null);
            this._previewCreateTitle.element.clear();
            this._onDidChangeHeight.fire();
        }
        showsAnyPreview() {
            return !this._elements.previewDiff.classList.contains('hidden') ||
                !this._elements.previewCreate.classList.contains('hidden');
        }
        // --- slash commands
        updateSlashCommands(commands) {
            this._slashCommands.clear();
            if (commands.length === 0) {
                return;
            }
            this._slashCommandDetails = commands.filter(c => c.command && c.detail).map(c => { return { command: c.command, detail: c.detail }; });
            const selector = { scheme: this._inputModel.uri.scheme, pattern: this._inputModel.uri.path, language: this._inputModel.getLanguageId() };
            this._slashCommands.add(this._languageFeaturesService.completionProvider.register(selector, new class {
                constructor() {
                    this._debugDisplayName = 'InlineChatSlashCommandProvider';
                    this.triggerCharacters = ['/'];
                }
                provideCompletionItems(_model, position) {
                    if (position.lineNumber !== 1 && position.column !== 1) {
                        return undefined;
                    }
                    const suggestions = commands.map(command => {
                        const withSlash = `/${command.command}`;
                        return {
                            label: { label: withSlash, description: command.detail },
                            insertText: `${withSlash} $0`,
                            insertTextRules: 4 /* CompletionItemInsertTextRule.InsertAsSnippet */,
                            kind: 18 /* CompletionItemKind.Text */,
                            range: new range_1.Range(1, 1, 1, 1),
                            command: command.executeImmediately ? { id: 'inlineChat.accept', title: withSlash } : undefined
                        };
                    });
                    return { suggestions };
                }
            }));
            const decorations = this._inputEditor.createDecorationsCollection();
            const updateSlashDecorations = () => {
                this._slashCommandContentWidget.hide();
                const newDecorations = [];
                for (const command of commands) {
                    const withSlash = `/${command.command}`;
                    const firstLine = this._inputModel.getLineContent(1);
                    if (firstLine.startsWith(withSlash)) {
                        newDecorations.push({
                            range: new range_1.Range(1, 1, 1, withSlash.length + 1),
                            options: {
                                description: 'inline-chat-slash-command',
                                inlineClassName: 'inline-chat-slash-command',
                                after: {
                                    // Force some space between slash command and placeholder
                                    content: ' '
                                }
                            }
                        });
                        this._slashCommandContentWidget.setCommandText(command.command);
                        this._slashCommandContentWidget.show();
                        // inject detail when otherwise empty
                        if (firstLine === `/${command.command}`) {
                            newDecorations.push({
                                range: new range_1.Range(1, withSlash.length + 1, 1, withSlash.length + 2),
                                options: {
                                    description: 'inline-chat-slash-command-detail',
                                    after: {
                                        content: `${command.detail}`,
                                        inlineClassName: 'inline-chat-slash-command-detail'
                                    }
                                }
                            });
                        }
                        break;
                    }
                }
                decorations.set(newDecorations);
            };
            this._slashCommands.add(this._inputEditor.onDidChangeModelContent(updateSlashDecorations));
            updateSlashDecorations();
        }
    };
    exports.InlineChatWidget = InlineChatWidget;
    exports.InlineChatWidget = InlineChatWidget = InlineChatWidget_1 = __decorate([
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, accessibility_1.IAccessibilityService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, accessibleView_1.IAccessibleViewService)
    ], InlineChatWidget);
    let InlineChatZoneWidget = class InlineChatZoneWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, _instaService, contextKeyService) {
            super(editor, { showFrame: false, showArrow: false, isAccessible: true, className: 'inline-chat-widget', keepEditorSelection: true, showInHiddenAreas: true, ordinal: 10000 + 3 });
            this._instaService = _instaService;
            this._ctxVisible = inlineChat_1.CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
            this._ctxCursorPosition = inlineChat_1.CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.bindTo(contextKeyService);
            this._disposables.add((0, lifecycle_1.toDisposable)(() => {
                this._ctxVisible.reset();
                this._ctxCursorPosition.reset();
            }));
            this.widget = this._instaService.createInstance(InlineChatWidget, this.editor);
            this._disposables.add(this.widget.onDidChangeHeight(() => this._relayout()));
            this._disposables.add(this.widget);
            this.create();
            this._disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'click', e => {
                if (!this.widget.hasFocus()) {
                    this.widget.focus();
                }
            }, true));
            // todo@jrieken listen ONLY when showing
            const updateCursorIsAboveContextKey = () => {
                if (!this.position || !this.editor.hasModel()) {
                    this._ctxCursorPosition.reset();
                }
                else if (this.position.lineNumber === this.editor.getPosition().lineNumber) {
                    this._ctxCursorPosition.set('above');
                }
                else if (this.position.lineNumber + 1 === this.editor.getPosition().lineNumber) {
                    this._ctxCursorPosition.set('below');
                }
                else {
                    this._ctxCursorPosition.reset();
                }
            };
            this._disposables.add(this.editor.onDidChangeCursorPosition(e => updateCursorIsAboveContextKey()));
            this._disposables.add(this.editor.onDidFocusEditorText(e => updateCursorIsAboveContextKey()));
            updateCursorIsAboveContextKey();
        }
        _fillContainer(container) {
            container.appendChild(this.widget.domNode);
        }
        _doLayout(heightInPixel) {
            const maxWidth = !this.widget.showsAnyPreview() ? 640 : Number.MAX_SAFE_INTEGER;
            const width = Math.min(maxWidth, this._availableSpaceGivenIndentation(this._indentationWidth));
            this._dimension = new dom_1.Dimension(width, heightInPixel);
            this.widget.domNode.style.width = `${width}px`;
            this.widget.layout(this._dimension);
        }
        _availableSpaceGivenIndentation(indentationWidth) {
            const info = this.editor.getLayoutInfo();
            return info.contentWidth - (info.glyphMarginWidth + info.decorationsWidth + (indentationWidth ?? 0));
        }
        _computeHeightInLines() {
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            return this.widget.getHeight() / lineHeight;
        }
        _relayout() {
            if (this._dimension) {
                this._doLayout(this._dimension.height);
            }
            super._relayout(this._computeHeightInLines());
        }
        show(position) {
            super.show(position, this._computeHeightInLines());
            this.widget.focus();
            this._ctxVisible.set(true);
        }
        _getWidth(info) {
            return info.width - info.minimap.minimapWidth;
        }
        updateBackgroundColor(position, selection) {
            if (!this.container) {
                return;
            }
            const widgetLineNumber = position.lineNumber;
            this.container.classList.toggle('inside-selection', widgetLineNumber >= selection.startLineNumber && widgetLineNumber < selection.endLineNumber);
        }
        _calculateIndentationWidth(position) {
            const viewModel = this.editor._getViewModel();
            if (!viewModel) {
                return 0;
            }
            const visibleRange = viewModel.getCompletelyVisibleViewRange();
            const startLineVisibleRange = visibleRange.startLineNumber;
            const positionLine = position.lineNumber;
            let indentationLineNumber;
            let indentationLevel;
            for (let lineNumber = positionLine; lineNumber >= startLineVisibleRange; lineNumber--) {
                const currentIndentationLevel = viewModel.getLineFirstNonWhitespaceColumn(lineNumber);
                if (currentIndentationLevel !== 0) {
                    indentationLineNumber = lineNumber;
                    indentationLevel = currentIndentationLevel;
                    break;
                }
            }
            return this.editor.getOffsetForColumn(indentationLineNumber ?? positionLine, indentationLevel ?? viewModel.getLineFirstNonWhitespaceColumn(positionLine));
        }
        setContainerMargins() {
            if (!this.container) {
                return;
            }
            const info = this.editor.getLayoutInfo();
            const marginWithoutIndentation = info.glyphMarginWidth + info.decorationsWidth + info.lineNumbersWidth;
            this.container.style.marginLeft = `${marginWithoutIndentation}px`;
        }
        setWidgetMargins(position, indentationWidth) {
            if (indentationWidth === undefined) {
                indentationWidth = this._calculateIndentationWidth(position);
            }
            if (this._indentationWidth === indentationWidth) {
                return;
            }
            this._indentationWidth = this._availableSpaceGivenIndentation(indentationWidth) > 400 ? indentationWidth : 0;
            this.widget.domNode.style.marginLeft = `${this._indentationWidth}px`;
            this.widget.domNode.style.marginRight = `${this.editor.getLayoutInfo().minimap.minimapWidth}px`;
        }
        hide() {
            this.container.classList.remove('inside-selection');
            this._ctxVisible.reset();
            this._ctxCursorPosition.reset();
            this.widget.reset();
            super.hide();
            aria.status((0, nls_1.localize)('inlineChatClosed', 'Closed inline chat widget'));
        }
    };
    exports.InlineChatZoneWidget = InlineChatZoneWidget;
    exports.InlineChatZoneWidget = InlineChatZoneWidget = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService)
    ], InlineChatZoneWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvYnJvd3Nlci9pbmxpbmVDaGF0V2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzRGhHLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFFckUsTUFBTSxtQkFBbUIsR0FBK0I7UUFDdkQsT0FBTyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO1FBQzlCLGtCQUFrQixFQUFFLENBQUM7UUFDckIsV0FBVyxFQUFFLEtBQUs7UUFDbEIsV0FBVyxFQUFFLEtBQUs7UUFDbEIsT0FBTyxFQUFFLEtBQUs7UUFDZCx5QkFBeUIsRUFBRSxJQUFJO1FBQy9CLG1CQUFtQixFQUFFLEtBQUs7UUFDMUIsa0JBQWtCLEVBQUUsS0FBSztRQUN6QixTQUFTLEVBQUU7WUFDVixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsUUFBUTtZQUNsQixVQUFVLEVBQUUsTUFBTTtZQUNsQix1QkFBdUIsRUFBRSxLQUFLO1NBQzlCO1FBQ0Qsb0JBQW9CLEVBQUUsQ0FBQztRQUN2QixtQkFBbUIsRUFBRSxLQUFLO1FBQzFCLG9CQUFvQixFQUFFLEtBQUs7UUFDM0IsbUJBQW1CLEVBQUUsTUFBTTtRQUMzQixvQkFBb0IsRUFBRSxJQUFJO1FBQzFCLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLDRCQUE0QixFQUFFLENBQUM7UUFDL0IsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtRQUMzQixNQUFNLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO1FBQzlCLE1BQU0sRUFBRSxFQUFFO1FBQ1YsV0FBVyxFQUFF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