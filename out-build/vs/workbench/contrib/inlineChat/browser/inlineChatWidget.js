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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/nls!vs/workbench/contrib/inlineChat/browser/inlineChatWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/base/browser/dom", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/common/services/model", "vs/base/common/uri", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/platform/actions/browser/toolbar", "vs/base/browser/ui/progressbar/progressbar", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/browser/style", "vs/editor/common/core/editOperation", "vs/editor/common/languages/language", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/editor/common/services/languageFeatures", "vs/editor/common/model/textModel", "vs/workbench/contrib/inlineChat/browser/utils", "vs/editor/common/core/lineRange", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/iconLabel/iconLabels", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/base/common/async", "vs/base/browser/ui/aria/aria", "vs/platform/actions/browser/buttonbar", "vs/workbench/contrib/chat/browser/chatSlashCommandContentWidget", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/base/browser/mouseEvent", "vs/css!./inlineChat"], function (require, exports, lifecycle_1, range_1, nls_1, contextkey_1, instantiation_1, zoneWidget_1, inlineChat_1, dom_1, event_1, editorExtensions_1, snippetController2_1, model_1, uri_1, embeddedCodeEditorWidget_1, toolbar_1, progressbar_1, suggestController_1, style_1, editOperation_1, language_1, labels_1, files_1, languageFeatures_1, textModel_1, utils_1, lineRange_1, accessibility_1, configuration_1, keybinding_1, iconLabels_1, inlineChatSession_1, async_1, aria, buttonbar_1, chatSlashCommandContentWidget_1, contextView_1, accessibleView_1, mouseEvent_1) {
    "use strict";
    var $zqb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Aqb = exports.$zqb = void 0;
    const defaultAriaLabel = (0, nls_1.localize)(0, null);
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
        fontFamily: style_1.$hqb,
        fontSize: 13,
        lineHeight: 20
    };
    const _previewEditorEditorOptions = {
        scrollbar: { useShadows: false, alwaysConsumeMouseWheel: false },
        renderMarginRevertIcon: false,
        diffCodeLens: false,
        scrollBeyondLastLine: false,
        stickyScroll: { enabled: false },
        originalAriaLabel: (0, nls_1.localize)(1, null),
        modifiedAriaLabel: (0, nls_1.localize)(2, null),
        diffAlgorithm: 'advanced',
        readOnly: true,
        isInEmbeddedEditor: true
    };
    let $zqb = class $zqb {
        static { $zqb_1 = this; }
        static { this.a = 1; }
        constructor(G, H, I, J, K, L, M, N, O, P, Q) {
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.K = K;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.b = (0, dom_1.h)('div.inline-chat@root', [
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
            this.d = new lifecycle_1.$jc();
            this.f = this.d.add(new lifecycle_1.$jc());
            this.u = this.d.add(new lifecycle_1.$lc());
            this.x = this.d.add(new lifecycle_1.$lc());
            this.y = new event_1.$kd();
            this.onDidChangeHeight = event_1.Event.filter(this.y.event, _ => !this.B);
            this.z = new event_1.$fd();
            this.onDidChangeInput = this.z.event;
            this.B = false;
            this.D = inlineChatSession_1.ExpansionState.NOT_CROPPED;
            this.E = [];
            // input editor logic
            const codeEditorWidgetOptions = {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    snippetController2_1.$05.ID,
                    suggestController_1.$G6.ID
                ])
            };
            this.g = this.M.createInstance(embeddedCodeEditorWidget_1.$w3, this.b.editor, _inputEditorOptions, codeEditorWidgetOptions, this.G);
            this.S();
            this.d.add(this.g);
            this.d.add(this.g.onDidChangeModelContent(() => this.z.fire(this)));
            this.d.add(this.g.onDidLayoutChange(() => this.y.fire()));
            this.d.add(this.g.onDidContentSizeChange(() => this.y.fire()));
            this.d.add((0, dom_1.$nO)(this.b.message, 'focus', () => this.r.set(true)));
            this.d.add((0, dom_1.$nO)(this.b.message, 'blur', () => this.r.reset()));
            this.d.add(this.O.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                    this.S();
                }
            }));
            const uri = uri_1.URI.from({ scheme: 'vscode', authority: 'inline-chat', path: `/inline-chat/model${$zqb_1.a++}.txt` });
            this.j = this.d.add(this.H.getModel(uri) ?? this.H.createModel('', null, uri));
            this.g.setModel(this.j);
            // --- context keys
            this.l = inlineChat_1.$pz.bindTo(this.J);
            this.k = inlineChat_1.$kz.bindTo(this.J);
            this.m = inlineChat_1.$lz.bindTo(this.J);
            this.n = inlineChat_1.$mz.bindTo(this.J);
            this.o = inlineChat_1.$nz.bindTo(this.J);
            this.p = inlineChat_1.$oz.bindTo(this.J);
            this.q = inlineChat_1.$iz.bindTo(this.J);
            this.r = inlineChat_1.$jz.bindTo(this.J);
            // (1) inner cursor position (last/first line selected)
            const updateInnerCursorFirstLast = () => {
                const selection = this.g.getSelection();
                const fullRange = this.j.getFullModelRange();
                let onFirst = false;
                let onLast = false;
                if (selection.isEmpty()) {
                    const selectionTop = this.g.getTopForPosition(selection.startLineNumber, selection.startColumn);
                    const firstViewLineTop = this.g.getTopForPosition(fullRange.startLineNumber, fullRange.startColumn);
                    const lastViewLineTop = this.g.getTopForPosition(fullRange.endLineNumber, fullRange.endColumn);
                    if (selectionTop === firstViewLineTop) {
                        onFirst = true;
                    }
                    if (selectionTop === lastViewLineTop) {
                        onLast = true;
                    }
                }
                this.m.set(onFirst);
                this.n.set(onLast);
                this.o.set(fullRange.getStartPosition().equals(selection.getStartPosition()));
                this.p.set(fullRange.getEndPosition().equals(selection.getEndPosition()));
            };
            this.d.add(this.g.onDidChangeCursorPosition(updateInnerCursorFirstLast));
            updateInnerCursorFirstLast();
            // (2) input editor focused or not
            const updateFocused = () => {
                const hasFocus = this.g.hasWidgetFocus();
                this.q.set(hasFocus);
                this.b.content.classList.toggle('synthetic-focus', hasFocus);
                this.readPlaceholder();
            };
            this.d.add(this.g.onDidFocusEditorWidget(updateFocused));
            this.d.add(this.g.onDidBlurEditorWidget(updateFocused));
            this.d.add((0, lifecycle_1.$ic)(() => {
                this.m.reset();
                this.n.reset();
                this.q.reset();
            }));
            updateFocused();
            // placeholder
            this.b.placeholder.style.fontSize = `${this.g.getOption(52 /* EditorOption.fontSize */)}px`;
            this.b.placeholder.style.lineHeight = `${this.g.getOption(66 /* EditorOption.lineHeight */)}px`;
            this.d.add((0, dom_1.$nO)(this.b.placeholder, 'click', () => this.g.focus()));
            // show/hide placeholder depending on text model being empty
            // content height
            const currentContentHeight = 0;
            const togglePlaceholder = () => {
                const hasText = this.j.getValueLength() > 0;
                this.b.placeholder.classList.toggle('hidden', hasText);
                this.k.set(!hasText);
                this.readPlaceholder();
                const contentHeight = this.g.getContentHeight();
                if (contentHeight !== currentContentHeight && this.A) {
                    this.A = this.A.with(undefined, contentHeight);
                    this.g.layout(this.A);
                    this.y.fire();
                }
            };
            this.d.add(this.j.onDidChangeContent(togglePlaceholder));
            togglePlaceholder();
            // slash command content widget
            this.F = new chatSlashCommandContentWidget_1.$rqb(this.g);
            this.d.add(this.F);
            // toolbars
            const toolbar = this.M.createInstance(toolbar_1.$M6, this.b.editorToolbar, inlineChat_1.$Dz, {
                telemetrySource: 'interactiveEditorWidget-toolbar',
                toolbarOptions: { primaryGroup: 'main' }
            });
            this.d.add(toolbar);
            this.s = new progressbar_1.$YR(this.b.progress);
            this.d.add(this.s);
            const workbenchMenubarOptions = {
                telemetrySource: 'interactiveEditorWidget-toolbar',
                buttonConfigProvider: action => {
                    if (action.id === inlineChat_1.$Bz) {
                        return { showIcon: true, showLabel: false };
                    }
                    else if (action.id === inlineChat_1.$Cz) {
                        return { isSecondary: false };
                    }
                    return undefined;
                }
            };
            const statusButtonBar = this.M.createInstance(buttonbar_1.$qqb, this.b.statusToolbar, inlineChat_1.$Fz, workbenchMenubarOptions);
            this.d.add(statusButtonBar.onDidChangeMenuItems(() => this.y.fire()));
            this.d.add(statusButtonBar);
            const workbenchToolbarOptions = {
                hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                toolbarOptions: {
                    primaryGroup: () => true,
                    useSeparatorsInPrimaryActions: true
                }
            };
            const feedbackToolbar = this.M.createInstance(toolbar_1.$M6, this.b.feedbackToolbar, inlineChat_1.$Gz, { ...workbenchToolbarOptions, hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */ });
            this.d.add(feedbackToolbar.onDidChangeMenuItems(() => this.y.fire()));
            this.d.add(feedbackToolbar);
            // preview editors
            this.t = this.d.add(new async_1.$Xg(() => this.d.add(M.createInstance(embeddedCodeEditorWidget_1.$x3, this.b.previewDiff, {
                ..._previewEditorEditorOptions,
                onlyShowAccessibleDiffViewer: this.N.isScreenReaderOptimized(),
            }, { modifiedEditor: codeEditorWidgetOptions, originalEditor: codeEditorWidgetOptions }, G))));
            this.v = this.d.add(M.createInstance(labels_1.$Mlb, this.b.previewCreateTitle, { supportIcons: true }));
            this.w = this.d.add(new async_1.$Xg(() => this.d.add(M.createInstance(embeddedCodeEditorWidget_1.$w3, this.b.previewCreate, _previewEditorEditorOptions, codeEditorWidgetOptions, G))));
            this.b.message.tabIndex = 0;
            this.b.message.ariaLabel = this.Q.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
            this.b.statusLabel.tabIndex = 0;
            const markdownMessageToolbar = this.M.createInstance(toolbar_1.$M6, this.b.messageActions, inlineChat_1.$Ez, workbenchToolbarOptions);
            this.d.add(markdownMessageToolbar.onDidChangeMenuItems(() => this.y.fire()));
            this.d.add(markdownMessageToolbar);
            this.d.add((0, dom_1.$nO)(this.b.root, dom_1.$3O.CONTEXT_MENU, async (event) => {
                this.R(event);
            }));
            this.d.add(this.O.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                    this.b.message.ariaLabel = this.Q.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
                }
            }));
        }
        R(e) {
            const event = new mouseEvent_1.$eO(e);
            this.P.showContextMenu({
                menuId: inlineChat_1.$Iz,
                getAnchor: () => event,
            });
        }
        S() {
            if (!this.N.isScreenReaderOptimized()) {
                return;
            }
            let label = defaultAriaLabel;
            if (this.O.getValue("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                const kbLabel = this.L.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                label = kbLabel ? (0, nls_1.localize)(3, null, kbLabel) : (0, nls_1.localize)(4, null);
            }
            _inputEditorOptions.ariaLabel = label;
            this.g.updateOptions({ ariaLabel: label });
        }
        dispose() {
            this.d.dispose();
            this.k.reset();
            this.l.reset();
        }
        get domNode() {
            return this.b.root;
        }
        layout(dim) {
            this.B = true;
            try {
                const innerEditorWidth = dim.width - ((0, dom_1.$HO)(this.b.editorToolbar) + 8 /* L/R-padding */);
                dim = new dom_1.$BO(innerEditorWidth, dim.height);
                if (!this.A || !dom_1.$BO.equals(this.A, dim)) {
                    this.A = dim;
                    this.g.layout(new dom_1.$BO(innerEditorWidth, this.g.getContentHeight()));
                    this.b.placeholder.style.width = `${innerEditorWidth /* input-padding*/}px`;
                    const previewDiffDim = new dom_1.$BO(dim.width, Math.min(300, Math.max(0, this.t.value.getContentHeight())));
                    this.t.value.layout(previewDiffDim);
                    this.b.previewDiff.style.height = `${previewDiffDim.height}px`;
                    const previewCreateDim = new dom_1.$BO(dim.width, Math.min(300, Math.max(0, this.w.value.getContentHeight())));
                    this.w.value.layout(previewCreateDim);
                    this.b.previewCreate.style.height = `${previewCreateDim.height}px`;
                    const lineHeight = this.G.getOption(66 /* EditorOption.lineHeight */);
                    const editorHeight = this.G.getLayoutInfo().height;
                    const editorHeightInLines = Math.floor(editorHeight / lineHeight);
                    this.b.root.style.setProperty('--vscode-inline-chat-cropped', String(Math.floor(editorHeightInLines / 5)));
                    this.b.root.style.setProperty('--vscode-inline-chat-expanded', String(Math.floor(editorHeightInLines / 3)));
                }
            }
            finally {
                this.B = false;
            }
        }
        getHeight() {
            const base = (0, dom_1.$LO)(this.b.progress) + (0, dom_1.$LO)(this.b.status);
            const editorHeight = this.g.getContentHeight() + 12 /* padding and border */;
            const markdownMessageHeight = (0, dom_1.$LO)(this.b.markdownMessage);
            const previewDiffHeight = this.t.value.getModel() ? 12 + Math.min(300, Math.max(0, this.t.value.getContentHeight())) : 0;
            const previewCreateTitleHeight = (0, dom_1.$LO)(this.b.previewCreateTitle);
            const previewCreateHeight = this.w.value.getModel() ? 18 + Math.min(300, Math.max(0, this.w.value.getContentHeight())) : 0;
            return base + editorHeight + markdownMessageHeight + previewDiffHeight + previewCreateTitleHeight + previewCreateHeight + 18 /* padding */ + 8 /*shadow*/;
        }
        updateProgress(show) {
            if (show) {
                this.s.infinite();
            }
            else {
                this.s.stop();
            }
        }
        get value() {
            return this.j.getValue();
        }
        set value(value) {
            this.j.setValue(value);
            this.g.setPosition(this.j.getFullModelRange().getEndPosition());
        }
        selectAll(includeSlashCommand = true) {
            let selection = this.j.getFullModelRange();
            if (!includeSlashCommand) {
                const firstLine = this.j.getLineContent(1);
                const slashCommand = this.E.find(c => firstLine.startsWith(`/${c.command} `));
                selection = slashCommand ? new range_1.$ks(1, slashCommand.command.length + 3, selection.endLineNumber, selection.endColumn) : selection;
            }
            this.g.setSelection(selection);
        }
        set placeholder(value) {
            this.b.placeholder.innerText = value;
        }
        readPlaceholder() {
            const slashCommand = this.E.find(c => `${c.command} ` === this.j.getValue().substring(1));
            const hasText = this.j.getValueLength() > 0;
            if (!hasText) {
                aria.$_P(this.b.placeholder.innerText);
            }
            else if (slashCommand) {
                aria.$_P(slashCommand.detail);
            }
        }
        updateToolbar(show) {
            this.b.statusToolbar.classList.toggle('hidden', !show);
            this.b.feedbackToolbar.classList.toggle('hidden', !show);
            this.b.status.classList.toggle('actions', show);
            this.b.infoLabel.classList.toggle('hidden', show);
            this.y.fire();
        }
        get expansionState() {
            return this.D;
        }
        set preferredExpansionState(expansionState) {
            this.C = expansionState;
        }
        get responseContent() {
            return this.b.markdownMessage.textContent ?? undefined;
        }
        updateMarkdownMessage(message) {
            this.b.markdownMessage.classList.toggle('hidden', !message);
            let expansionState;
            if (!message) {
                (0, dom_1.$_O)(this.b.message);
                this.l.reset();
                expansionState = inlineChatSession_1.ExpansionState.NOT_CROPPED;
            }
            else {
                if (this.C) {
                    (0, dom_1.$_O)(this.b.message, message);
                    expansionState = this.C;
                    this.C = undefined;
                }
                else {
                    this.T(inlineChatSession_1.ExpansionState.CROPPED);
                    (0, dom_1.$_O)(this.b.message, message);
                    expansionState = this.b.message.scrollHeight > this.b.message.clientHeight ? inlineChatSession_1.ExpansionState.CROPPED : inlineChatSession_1.ExpansionState.NOT_CROPPED;
                }
                this.l.set(expansionState);
                this.T(expansionState);
            }
            this.D = expansionState;
            this.y.fire();
        }
        updateMarkdownMessageExpansionState(expansionState) {
            this.l.set(expansionState);
            const heightBefore = this.b.markdownMessage.scrollHeight;
            this.T(expansionState);
            const heightAfter = this.b.markdownMessage.scrollHeight;
            if (heightBefore === heightAfter) {
                this.l.set(inlineChatSession_1.ExpansionState.NOT_CROPPED);
            }
            this.y.fire();
        }
        T(expansionState) {
            this.b.message.setAttribute('state', expansionState);
        }
        updateInfo(message) {
            this.b.infoLabel.classList.toggle('hidden', !message);
            const renderedMessage = (0, iconLabels_1.$xQ)(message);
            (0, dom_1.$_O)(this.b.infoLabel, ...renderedMessage);
            this.y.fire();
        }
        updateStatus(message, ops = {}) {
            const isTempMessage = typeof ops.resetAfter === 'number';
            if (isTempMessage && !this.b.statusLabel.dataset['state']) {
                const statusLabel = this.b.statusLabel.innerText;
                const classes = Array.from(this.b.statusLabel.classList.values());
                setTimeout(() => {
                    this.updateStatus(statusLabel, { classes, keepMessage: true });
                }, ops.resetAfter);
            }
            (0, dom_1.$_O)(this.b.statusLabel, message);
            this.b.statusLabel.className = `label status ${(ops.classes ?? []).join(' ')}`;
            this.b.statusLabel.classList.toggle('hidden', !message);
            if (isTempMessage) {
                this.b.statusLabel.dataset['state'] = 'temp';
            }
            else {
                delete this.b.statusLabel.dataset['state'];
            }
            this.y.fire();
        }
        reset() {
            this.k.reset();
            this.m.reset();
            this.n.reset();
            this.q.reset();
            this.value = '';
            this.updateMarkdownMessage(undefined);
            (0, dom_1.$_O)(this.b.statusLabel);
            this.b.statusLabel.classList.toggle('hidden', true);
            this.b.statusToolbar.classList.add('hidden');
            this.b.feedbackToolbar.classList.add('hidden');
            this.hideCreatePreview();
            this.hideEditsPreview();
            this.y.fire();
        }
        focus() {
            this.g.focus();
        }
        hasFocus() {
            return this.domNode.contains((0, dom_1.$VO)());
        }
        // --- preview
        showEditsPreview(textModelv0, allEdits, changes) {
            if (changes.length === 0) {
                this.hideEditsPreview();
                return;
            }
            this.b.previewDiff.classList.remove('hidden');
            const languageSelection = { languageId: textModelv0.getLanguageId(), onDidChange: event_1.Event.None };
            const modified = this.H.createModel((0, textModel_1.$KC)(textModelv0.createSnapshot()), languageSelection, undefined, true);
            for (const edits of allEdits) {
                modified.applyEdits(edits, false);
            }
            this.t.value.setModel({ original: textModelv0, modified });
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
            modifiedLineRange = new lineRange_1.$ts(newStartLine, modifiedLineRange.endLineNumberExclusive);
            originalLineRange = new lineRange_1.$ts(newStartLine, originalLineRange.endLineNumberExclusive);
            const newEndLineModified = Math.min(modifiedLineRange.endLineNumberExclusive + pad, modified.getLineCount());
            modifiedLineRange = new lineRange_1.$ts(modifiedLineRange.startLineNumber, newEndLineModified);
            const newEndLineOriginal = Math.min(originalLineRange.endLineNumberExclusive + pad, textModelv0.getLineCount());
            originalLineRange = new lineRange_1.$ts(originalLineRange.startLineNumber, newEndLineOriginal);
            const hiddenOriginal = (0, utils_1.$dqb)(originalLineRange, textModelv0);
            const hiddenModified = (0, utils_1.$dqb)(modifiedLineRange, modified);
            this.t.value.getOriginalEditor().setHiddenAreas(hiddenOriginal.map(utils_1.$eqb), 'diff-hidden');
            this.t.value.getModifiedEditor().setHiddenAreas(hiddenModified.map(utils_1.$eqb), 'diff-hidden');
            this.t.value.revealLine(modifiedLineRange.startLineNumber, 1 /* ScrollType.Immediate */);
            this.y.fire();
        }
        hideEditsPreview() {
            this.b.previewDiff.classList.add('hidden');
            this.t.value.setModel(null);
            this.u.clear();
            this.y.fire();
        }
        showCreatePreview(uri, edits) {
            this.b.previewCreateTitle.classList.remove('hidden');
            this.b.previewCreate.classList.remove('hidden');
            this.v.element.setFile(uri, { fileKind: files_1.FileKind.FILE });
            const langSelection = this.I.createByFilepathOrFirstLine(uri, undefined);
            const model = this.H.createModel('', langSelection, undefined, true);
            model.applyEdits(edits.map(edit => editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text)));
            this.x.value = model;
            this.w.value.setModel(model);
            this.y.fire();
        }
        hideCreatePreview() {
            this.b.previewCreateTitle.classList.add('hidden');
            this.b.previewCreate.classList.add('hidden');
            this.w.value.setModel(null);
            this.v.element.clear();
            this.y.fire();
        }
        showsAnyPreview() {
            return !this.b.previewDiff.classList.contains('hidden') ||
                !this.b.previewCreate.classList.contains('hidden');
        }
        // --- slash commands
        updateSlashCommands(commands) {
            this.f.clear();
            if (commands.length === 0) {
                return;
            }
            this.E = commands.filter(c => c.command && c.detail).map(c => { return { command: c.command, detail: c.detail }; });
            const selector = { scheme: this.j.uri.scheme, pattern: this.j.uri.path, language: this.j.getLanguageId() };
            this.f.add(this.K.completionProvider.register(selector, new class {
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
                            range: new range_1.$ks(1, 1, 1, 1),
                            command: command.executeImmediately ? { id: 'inlineChat.accept', title: withSlash } : undefined
                        };
                    });
                    return { suggestions };
                }
            }));
            const decorations = this.g.createDecorationsCollection();
            const updateSlashDecorations = () => {
                this.F.hide();
                const newDecorations = [];
                for (const command of commands) {
                    const withSlash = `/${command.command}`;
                    const firstLine = this.j.getLineContent(1);
                    if (firstLine.startsWith(withSlash)) {
                        newDecorations.push({
                            range: new range_1.$ks(1, 1, 1, withSlash.length + 1),
                            options: {
                                description: 'inline-chat-slash-command',
                                inlineClassName: 'inline-chat-slash-command',
                                after: {
                                    // Force some space between slash command and placeholder
                                    content: ' '
                                }
                            }
                        });
                        this.F.setCommandText(command.command);
                        this.F.show();
                        // inject detail when otherwise empty
                        if (firstLine === `/${command.command}`) {
                            newDecorations.push({
                                range: new range_1.$ks(1, withSlash.length + 1, 1, withSlash.length + 2),
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
            this.f.add(this.g.onDidChangeModelContent(updateSlashDecorations));
            updateSlashDecorations();
        }
    };
    exports.$zqb = $zqb;
    exports.$zqb = $zqb = $zqb_1 = __decorate([
        __param(1, model_1.$yA),
        __param(2, language_1.$ct),
        __param(3, contextkey_1.$3i),
        __param(4, languageFeatures_1.$hF),
        __param(5, keybinding_1.$2D),
        __param(6, instantiation_1.$Ah),
        __param(7, accessibility_1.$1r),
        __param(8, configuration_1.$8h),
        __param(9, contextView_1.$WZ),
        __param(10, accessibleView_1.$wqb)
    ], $zqb);
    let $Aqb = class $Aqb extends zoneWidget_1.$z3 {
        constructor(editor, m, contextKeyService) {
            super(editor, { showFrame: false, showArrow: false, isAccessible: true, className: 'inline-chat-widget', keepEditorSelection: true, showInHiddenAreas: true, ordinal: 10000 + 3 });
            this.m = m;
            this.a = inlineChat_1.$hz.bindTo(contextKeyService);
            this.b = inlineChat_1.$qz.bindTo(contextKeyService);
            this.o.add((0, lifecycle_1.$ic)(() => {
                this.a.reset();
                this.b.reset();
            }));
            this.widget = this.m.createInstance($zqb, this.editor);
            this.o.add(this.widget.onDidChangeHeight(() => this.H()));
            this.o.add(this.widget);
            this.create();
            this.o.add((0, dom_1.$nO)(this.domNode, 'click', e => {
                if (!this.widget.hasFocus()) {
                    this.widget.focus();
                }
            }, true));
            // todo@jrieken listen ONLY when showing
            const updateCursorIsAboveContextKey = () => {
                if (!this.position || !this.editor.hasModel()) {
                    this.b.reset();
                }
                else if (this.position.lineNumber === this.editor.getPosition().lineNumber) {
                    this.b.set('above');
                }
                else if (this.position.lineNumber + 1 === this.editor.getPosition().lineNumber) {
                    this.b.set('below');
                }
                else {
                    this.b.reset();
                }
            };
            this.o.add(this.editor.onDidChangeCursorPosition(e => updateCursorIsAboveContextKey()));
            this.o.add(this.editor.onDidFocusEditorText(e => updateCursorIsAboveContextKey()));
            updateCursorIsAboveContextKey();
        }
        E(container) {
            container.appendChild(this.widget.domNode);
        }
        G(heightInPixel) {
            const maxWidth = !this.widget.showsAnyPreview() ? 640 : Number.MAX_SAFE_INTEGER;
            const width = Math.min(maxWidth, this.s(this.l));
            this.d = new dom_1.$BO(width, heightInPixel);
            this.widget.domNode.style.width = `${width}px`;
            this.widget.layout(this.d);
        }
        s(indentationWidth) {
            const info = this.editor.getLayoutInfo();
            return info.contentWidth - (info.glyphMarginWidth + info.decorationsWidth + (indentationWidth ?? 0));
        }
        t() {
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            return this.widget.getHeight() / lineHeight;
        }
        H() {
            if (this.d) {
                this.G(this.d.height);
            }
            super.H(this.t());
        }
        show(position) {
            super.show(position, this.t());
            this.widget.focus();
            this.a.set(true);
        }
        u(info) {
            return info.width - info.minimap.minimapWidth;
        }
        updateBackgroundColor(position, selection) {
            if (!this.container) {
                return;
            }
            const widgetLineNumber = position.lineNumber;
            this.container.classList.toggle('inside-selection', widgetLineNumber >= selection.startLineNumber && widgetLineNumber < selection.endLineNumber);
        }
        K(position) {
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
                indentationWidth = this.K(position);
            }
            if (this.l === indentationWidth) {
                return;
            }
            this.l = this.s(indentationWidth) > 400 ? indentationWidth : 0;
            this.widget.domNode.style.marginLeft = `${this.l}px`;
            this.widget.domNode.style.marginRight = `${this.editor.getLayoutInfo().minimap.minimapWidth}px`;
        }
        hide() {
            this.container.classList.remove('inside-selection');
            this.a.reset();
            this.b.reset();
            this.widget.reset();
            super.hide();
            aria.$_P((0, nls_1.localize)(5, null));
        }
    };
    exports.$Aqb = $Aqb;
    exports.$Aqb = $Aqb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextkey_1.$3i)
    ], $Aqb);
});
//# sourceMappingURL=inlineChatWidget.js.map