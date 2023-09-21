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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/history", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/services/model", "vs/nls!vs/workbench/contrib/chat/browser/chatInputPart", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/workbench/browser/style", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/chat/browser/chatFollowups", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/platform/accessibility/common/accessibility", "vs/base/common/platform"], function (require, exports, dom, aria, event_1, history_1, lifecycle_1, uri_1, codeEditorWidget_1, model_1, nls_1, toolbar_1, actions_1, configuration_1, contextkey_1, contextScopedHistoryWidget_1, instantiation_1, serviceCollection_1, keybinding_1, style_1, simpleEditorOptions_1, chatFollowups_1, chatContextKeys_1, chatWidgetHistoryService_1, accessibility_1, platform_1) {
    "use strict";
    var $SGb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SGb = void 0;
    const $ = dom.$;
    const INPUT_EDITOR_MAX_HEIGHT = 250;
    let $SGb = class $SGb extends lifecycle_1.$kc {
        static { $SGb_1 = this; }
        static { this.INPUT_SCHEME = 'chatSessionInput'; }
        static { this.a = 0; }
        get inputEditor() {
            return this.r;
        }
        constructor(
        // private readonly editorOptions: ChatEditorOptions, // TODO this should be used
        D, F, G, H, I, J, L, M) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeHeight = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidFocus = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidBlur = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidAcceptFollowup = this.g.event;
            this.h = 0;
            this.n = this.B(new lifecycle_1.$jc());
            this.inputUri = uri_1.URI.parse(`${$SGb_1.INPUT_SCHEME}:input-${$SGb_1.a++}`);
            this.z = chatContextKeys_1.$HGb.bindTo(I);
            this.u = new history_1.$pR([], 5);
            this.B(this.F.onDidClearHistory(() => this.u.clear()));
            this.B(this.J.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */)) {
                    this.inputEditor.updateOptions({ ariaLabel: this.N() });
                }
            }));
        }
        N() {
            const verbose = this.J.getValue("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */);
            if (verbose) {
                const kbLabel = this.L.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                return kbLabel ? (0, nls_1.localize)(0, null, kbLabel) : (0, nls_1.localize)(1, null);
            }
            return (0, nls_1.localize)(2, null);
        }
        setState(providerId, inputValue) {
            this.C = providerId;
            const history = this.F.getHistory(providerId);
            this.u = new history_1.$pR(history, 50);
            this.setValue(inputValue);
        }
        get element() {
            return this.j;
        }
        showPreviousValue() {
            this.O(true);
        }
        showNextValue() {
            this.O(false);
        }
        O(previous) {
            const historyInput = (previous ?
                (this.u.previous() ?? this.u.first()) : this.u.next())
                ?? '';
            aria.$_P(historyInput);
            this.setValue(historyInput);
            this.w(true);
        }
        setValue(value) {
            this.inputEditor.setValue(value);
            // always leave cursor at the end
            this.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
        }
        focus() {
            this.r.focus();
        }
        hasFocus() {
            return this.r.hasWidgetFocus();
        }
        async acceptInput(query) {
            const editorValue = this.r.getValue();
            if (!query && editorValue) {
                // Followups and programmatic messages don't go to history
                this.u.add(editorValue);
            }
            if (this.M.isScreenReaderOptimized() && platform_1.$j) {
                this.P();
            }
            else {
                this.r.focus();
                this.r.setValue('');
            }
        }
        P() {
            const domNode = this.r.getDomNode();
            if (!domNode) {
                return;
            }
            // Remove the input editor from the DOM temporarily to prevent VoiceOver
            // from reading the cleared text (the request) to the user.
            this.s.removeChild(domNode);
            this.r.setValue('');
            this.s.appendChild(domNode);
            this.r.focus();
        }
        render(container, initialValue, widget) {
            this.j = dom.$0O(container, $('.interactive-input-part'));
            this.m = dom.$0O(this.j, $('.interactive-input-followups'));
            const inputAndSideToolbar = dom.$0O(this.j, $('.interactive-input-and-side-toolbar'));
            const inputContainer = dom.$0O(inputAndSideToolbar, $('.interactive-input-and-execute-toolbar'));
            const inputScopedContextKeyService = this.B(this.I.createScoped(inputContainer));
            chatContextKeys_1.$IGb.bindTo(inputScopedContextKeyService).set(true);
            const scopedInstantiationService = this.H.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, inputScopedContextKeyService]));
            const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this.B((0, contextScopedHistoryWidget_1.$R5)(inputScopedContextKeyService, this));
            this.w = enabled => {
                historyNavigationBackwardsEnablement.set(enabled);
                historyNavigationForwardsEnablement.set(enabled);
            };
            const options = (0, simpleEditorOptions_1.$uqb)(this.J);
            options.readOnly = false;
            options.ariaLabel = this.N();
            options.fontFamily = style_1.$hqb;
            options.fontSize = 13;
            options.lineHeight = 20;
            options.padding = this.D.renderStyle === 'compact' ? { top: 2, bottom: 2 } : { top: 8, bottom: 8 };
            options.cursorWidth = 1;
            options.wrappingStrategy = 'advanced';
            options.bracketPairColorization = { enabled: false };
            options.suggest = { showIcons: false };
            options.scrollbar = { ...(options.scrollbar ?? {}), vertical: 'hidden' };
            this.s = dom.$0O(inputContainer, $('.interactive-input-editor'));
            this.r = this.B(scopedInstantiationService.createInstance(codeEditorWidget_1.$uY, this.s, options, (0, simpleEditorOptions_1.$vqb)()));
            this.B(this.r.onDidChangeModelContent(() => {
                const currentHeight = Math.min(this.r.getContentHeight(), INPUT_EDITOR_MAX_HEIGHT);
                if (currentHeight !== this.h) {
                    this.h = currentHeight;
                    this.b.fire();
                }
                // Only allow history navigation when the input is empty.
                // (If this model change happened as a result of a history navigation, this is canceled out by a call in this.navigateHistory)
                const model = this.r.getModel();
                const inputHasText = !!model && model.getValueLength() > 0;
                this.w(!inputHasText);
                this.z.set(inputHasText);
            }));
            this.B(this.r.onDidFocusEditorText(() => {
                this.c.fire();
                inputContainer.classList.toggle('focused', true);
            }));
            this.B(this.r.onDidBlurEditorText(() => {
                inputContainer.classList.toggle('focused', false);
                this.f.fire();
            }));
            this.t = this.B(this.H.createInstance(toolbar_1.$M6, inputContainer, actions_1.$Ru.ChatExecute, {
                menuOptions: {
                    shouldForwardArgs: true
                }
            }));
            this.t.getElement().classList.add('interactive-execute-toolbar');
            this.t.context = { widget };
            if (this.D.renderStyle === 'compact') {
                const toolbarSide = this.B(this.H.createInstance(toolbar_1.$M6, inputAndSideToolbar, actions_1.$Ru.ChatInputSide, {
                    menuOptions: {
                        shouldForwardArgs: true
                    }
                }));
                toolbarSide.getElement().classList.add('chat-side-toolbar');
                toolbarSide.context = { widget };
            }
            this.y = this.G.getModel(this.inputUri) || this.G.createModel('', null, this.inputUri, true);
            this.y.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } });
            this.r.setModel(this.y);
            if (initialValue) {
                this.y.setValue(initialValue);
                const lineNumber = this.y.getLineCount();
                this.r.setPosition({ lineNumber, column: this.y.getLineMaxColumn(lineNumber) });
            }
        }
        async renderFollowups(items) {
            if (!this.D.renderFollowups) {
                return;
            }
            this.n.clear();
            dom.$lO(this.m);
            if (items && items.length > 0) {
                this.n.add(new chatFollowups_1.$PGb(this.m, items, undefined, followup => this.g.fire(followup), this.I));
            }
        }
        layout(height, width) {
            return this.Q(height, width);
        }
        Q(height, width, allowRecurse = true) {
            const followupsHeight = this.m.offsetHeight;
            const inputPartBorder = 1;
            const inputPartHorizontalPadding = 40;
            const inputPartVerticalPadding = 24;
            const inputEditorHeight = Math.min(this.r.getContentHeight(), height - followupsHeight - inputPartHorizontalPadding - inputPartBorder, INPUT_EDITOR_MAX_HEIGHT);
            const inputEditorBorder = 2;
            const inputPartHeight = followupsHeight + inputEditorHeight + inputPartVerticalPadding + inputPartBorder + inputEditorBorder;
            const editorBorder = 2;
            const editorPadding = 8;
            const executeToolbarWidth = this.t.getItemsWidth();
            const sideToolbarWidth = this.D.renderStyle === 'compact' ? 20 : 0;
            const initialEditorScrollWidth = this.r.getScrollWidth();
            this.r.layout({ width: width - inputPartHorizontalPadding - editorBorder - editorPadding - executeToolbarWidth - sideToolbarWidth, height: inputEditorHeight });
            if (allowRecurse && initialEditorScrollWidth < 10) {
                // This is probably the initial layout. Now that the editor is layed out with its correct width, it should report the correct contentHeight
                return this.Q(height, width, false);
            }
            return inputPartHeight;
        }
        saveState() {
            const inputHistory = this.u.getHistory();
            this.F.saveHistory(this.C, inputHistory);
        }
    };
    exports.$SGb = $SGb;
    exports.$SGb = $SGb = $SGb_1 = __decorate([
        __param(1, chatWidgetHistoryService_1.$QGb),
        __param(2, model_1.$yA),
        __param(3, instantiation_1.$Ah),
        __param(4, contextkey_1.$3i),
        __param(5, configuration_1.$8h),
        __param(6, keybinding_1.$2D),
        __param(7, accessibility_1.$1r)
    ], $SGb);
});
//# sourceMappingURL=chatInputPart.js.map