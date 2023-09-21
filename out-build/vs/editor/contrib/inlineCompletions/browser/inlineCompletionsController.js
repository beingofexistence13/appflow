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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/editor/contrib/inlineCompletions/browser/ghostTextWidget", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsModel", "vs/editor/contrib/inlineCompletions/browser/suggestWidgetInlineCompletionProvider", "vs/nls!vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/platform/audioCues/browser/audioCueService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding"], function (require, exports, aria_1, event_1, lifecycle_1, observable_1, coreCommands_1, position_1, languageFeatureDebounce_1, languageFeatures_1, commandIds_1, ghostTextWidget_1, inlineCompletionContextKeys_1, inlineCompletionsHintsWidget_1, inlineCompletionsModel_1, suggestWidgetInlineCompletionProvider_1, nls_1, audioCueService_1, commands_1, configuration_1, contextkey_1, instantiation_1, keybinding_1) {
    "use strict";
    var $V8_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V8 = void 0;
    let $V8 = class $V8 extends lifecycle_1.$kc {
        static { $V8_1 = this; }
        static { this.ID = 'editor.contrib.inlineCompletionsController'; }
        static get(editor) {
            return editor.getContribution($V8_1.ID);
        }
        constructor(editor, j, m, n, r, s, t, u, w) {
            super();
            this.editor = editor;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.model = (0, observable_1.disposableObservableValue)('inlineCompletionModel', undefined);
            this.a = (0, observable_1.observableValue)(this, -1);
            this.b = (0, observable_1.observableValue)(this, new position_1.$js(1, 1));
            this.c = this.B(new suggestWidgetInlineCompletionProvider_1.$I6(this.editor, () => this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(undefined), (tx) => this.z(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other), (item) => {
                (0, observable_1.transaction)(tx => {
                    /** @description handleSuggestAccepted */
                    this.z(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                    this.model.get()?.handleSuggestAccepted(item);
                });
            }));
            this.f = (0, observable_1.observableFromEvent)(this.editor.onDidChangeConfiguration, () => this.editor.getOption(62 /* EditorOption.inlineSuggest */).enabled);
            this.g = this.B(this.j.createInstance(ghostTextWidget_1.$U8, this.editor, {
                ghostText: this.model.map((v, reader) => v?.ghostText.read(reader)),
                minReservedLineCount: (0, observable_1.constObservable)(0),
                targetTextModel: this.model.map(v => v?.textModel),
            }));
            this.h = this.s.for(this.t.inlineCompletionsProvider, 'InlineCompletionsDebounce', { min: 50, max: 50 });
            this.B(new inlineCompletionContextKeys_1.$95(this.m, this.model));
            this.B(event_1.Event.runAndSubscribe(editor.onDidChangeModel, () => (0, observable_1.transaction)(tx => {
                /** @description onDidChangeModel */
                this.model.set(undefined, tx);
                this.z(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                const textModel = editor.getModel();
                if (textModel) {
                    const model = j.createInstance(inlineCompletionsModel_1.$K6, textModel, this.c.selectedItem, this.b, this.a, this.h, (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(117 /* EditorOption.suggest */).preview), (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(117 /* EditorOption.suggest */).previewMode), (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(62 /* EditorOption.inlineSuggest */).mode), this.f);
                    this.model.set(model, tx);
                }
            })));
            const getReason = (e) => {
                if (e.isUndoing) {
                    return inlineCompletionsModel_1.VersionIdChangeReason.Undo;
                }
                if (e.isRedoing) {
                    return inlineCompletionsModel_1.VersionIdChangeReason.Redo;
                }
                if (this.model.get()?.isAcceptingPartially) {
                    return inlineCompletionsModel_1.VersionIdChangeReason.AcceptWord;
                }
                return inlineCompletionsModel_1.VersionIdChangeReason.Other;
            };
            this.B(editor.onDidChangeModelContent((e) => (0, observable_1.transaction)(tx => 
            /** @description onDidChangeModelContent */
            this.z(tx, getReason(e)))));
            this.B(editor.onDidChangeCursorPosition(e => (0, observable_1.transaction)(tx => {
                /** @description onDidChangeCursorPosition */
                this.z(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                if (e.reason === 3 /* CursorChangeReason.Explicit */ || e.source === 'api') {
                    this.model.get()?.stop(tx);
                }
            })));
            this.B(editor.onDidType(() => (0, observable_1.transaction)(tx => {
                /** @description onDidType */
                this.z(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                if (this.f.get()) {
                    this.model.get()?.trigger(tx);
                }
            })));
            this.B(this.r.onDidExecuteCommand((e) => {
                // These commands don't trigger onDidType.
                const commands = new Set([
                    coreCommands_1.CoreEditingCommands.Tab.id,
                    coreCommands_1.CoreEditingCommands.DeleteLeft.id,
                    coreCommands_1.CoreEditingCommands.DeleteRight.id,
                    commandIds_1.$h5,
                    'acceptSelectedSuggestion',
                ]);
                if (commands.has(e.commandId) && editor.hasTextFocus() && this.f.get()) {
                    (0, observable_1.transaction)(tx => {
                        /** @description onDidExecuteCommand */
                        this.model.get()?.trigger(tx);
                    });
                }
            }));
            this.B(this.editor.onDidBlurEditorWidget(() => {
                // This is a hidden setting very useful for debugging
                if (this.m.getContextKeyValue('accessibleViewIsShown') || this.n.getValue('editor.inlineSuggest.keepOnBlur') ||
                    editor.getOption(62 /* EditorOption.inlineSuggest */).keepOnBlur) {
                    return;
                }
                if (inlineCompletionsHintsWidget_1.$O6.dropDownVisible) {
                    return;
                }
                (0, observable_1.transaction)(tx => {
                    /** @description onDidBlurEditorWidget */
                    this.model.get()?.stop(tx);
                });
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description forceRenderingAbove */
                const state = this.model.read(reader)?.state.read(reader);
                if (state?.suggestItem) {
                    if (state.ghostText.lineCount >= 2) {
                        this.c.forceRenderingAbove();
                    }
                }
                else {
                    this.c.stopForceRenderingAbove();
                }
            }));
            this.B((0, lifecycle_1.$ic)(() => {
                this.c.stopForceRenderingAbove();
            }));
            let lastInlineCompletionId = undefined;
            this.B((0, observable_1.autorun)(reader => {
                /** @description play audio cue & read suggestion */
                const model = this.model.read(reader);
                const state = model?.state.read(reader);
                if (!model || !state || !state.inlineCompletion) {
                    lastInlineCompletionId = undefined;
                    return;
                }
                if (state.inlineCompletion.semanticId !== lastInlineCompletionId) {
                    lastInlineCompletionId = state.inlineCompletion.semanticId;
                    const lineText = model.textModel.getLineContent(state.ghostText.lineNumber);
                    this.u.playAudioCue(audioCueService_1.$wZ.inlineSuggestion).then(() => {
                        if (this.editor.getOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */)) {
                            this.y(state.ghostText.renderForScreenReader(lineText));
                        }
                    });
                }
            }));
            this.B(new inlineCompletionsHintsWidget_1.$N6(this.editor, this.model, this.j));
            this.B(this.n.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('accessibility.verbosity.inlineCompletions')) {
                    this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this.n.getValue('accessibility.verbosity.inlineCompletions') });
                }
            }));
            this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this.n.getValue('accessibility.verbosity.inlineCompletions') });
        }
        y(content) {
            const accessibleViewShowing = this.m.getContextKeyValue('accessibleViewIsShown');
            const accessibleViewKeybinding = this.w.lookupKeybinding('editor.action.accessibleView');
            let hint;
            if (!accessibleViewShowing && accessibleViewKeybinding && this.editor.getOption(147 /* EditorOption.inlineCompletionsAccessibilityVerbose */)) {
                hint = (0, nls_1.localize)(0, null, accessibleViewKeybinding.getAriaLabel());
            }
            hint ? (0, aria_1.$$P)(content + ', ' + hint) : (0, aria_1.$$P)(content);
        }
        /**
         * Copies over the relevant state from the text model to observables.
         * This solves all kind of eventing issues, as we make sure we always operate on the latest state,
         * regardless of who calls into us.
         */
        z(tx, changeReason) {
            const newModel = this.editor.getModel();
            this.a.set(newModel?.getVersionId() ?? -1, tx, changeReason);
            this.b.set(this.editor.getPosition() ?? new position_1.$js(1, 1), tx);
        }
        shouldShowHoverAt(range) {
            const ghostText = this.model.get()?.ghostText.get();
            if (ghostText) {
                return ghostText.parts.some(p => range.containsPosition(new position_1.$js(ghostText.lineNumber, p.column)));
            }
            return false;
        }
        shouldShowHoverAtViewZone(viewZoneId) {
            return this.g.ownsViewZone(viewZoneId);
        }
        hide() {
            (0, observable_1.transaction)(tx => {
                this.model.get()?.stop(tx);
            });
        }
    };
    exports.$V8 = $V8;
    exports.$V8 = $V8 = $V8_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextkey_1.$3i),
        __param(3, configuration_1.$8h),
        __param(4, commands_1.$Fr),
        __param(5, languageFeatureDebounce_1.$52),
        __param(6, languageFeatures_1.$hF),
        __param(7, audioCueService_1.$sZ),
        __param(8, keybinding_1.$2D)
    ], $V8);
});
//# sourceMappingURL=inlineCompletionsController.js.map