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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/editor/contrib/inlineCompletions/browser/ghostTextWidget", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsModel", "vs/editor/contrib/inlineCompletions/browser/suggestWidgetInlineCompletionProvider", "vs/nls", "vs/platform/audioCues/browser/audioCueService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding"], function (require, exports, aria_1, event_1, lifecycle_1, observable_1, coreCommands_1, position_1, languageFeatureDebounce_1, languageFeatures_1, commandIds_1, ghostTextWidget_1, inlineCompletionContextKeys_1, inlineCompletionsHintsWidget_1, inlineCompletionsModel_1, suggestWidgetInlineCompletionProvider_1, nls_1, audioCueService_1, commands_1, configuration_1, contextkey_1, instantiation_1, keybinding_1) {
    "use strict";
    var InlineCompletionsController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionsController = void 0;
    let InlineCompletionsController = class InlineCompletionsController extends lifecycle_1.Disposable {
        static { InlineCompletionsController_1 = this; }
        static { this.ID = 'editor.contrib.inlineCompletionsController'; }
        static get(editor) {
            return editor.getContribution(InlineCompletionsController_1.ID);
        }
        constructor(editor, instantiationService, contextKeyService, configurationService, commandService, debounceService, languageFeaturesService, audioCueService, _keybindingService) {
            super();
            this.editor = editor;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.commandService = commandService;
            this.debounceService = debounceService;
            this.languageFeaturesService = languageFeaturesService;
            this.audioCueService = audioCueService;
            this._keybindingService = _keybindingService;
            this.model = (0, observable_1.disposableObservableValue)('inlineCompletionModel', undefined);
            this.textModelVersionId = (0, observable_1.observableValue)(this, -1);
            this.cursorPosition = (0, observable_1.observableValue)(this, new position_1.Position(1, 1));
            this.suggestWidgetAdaptor = this._register(new suggestWidgetInlineCompletionProvider_1.SuggestWidgetAdaptor(this.editor, () => this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(undefined), (tx) => this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other), (item) => {
                (0, observable_1.transaction)(tx => {
                    /** @description handleSuggestAccepted */
                    this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                    this.model.get()?.handleSuggestAccepted(item);
                });
            }));
            this._enabled = (0, observable_1.observableFromEvent)(this.editor.onDidChangeConfiguration, () => this.editor.getOption(62 /* EditorOption.inlineSuggest */).enabled);
            this.ghostTextWidget = this._register(this.instantiationService.createInstance(ghostTextWidget_1.GhostTextWidget, this.editor, {
                ghostText: this.model.map((v, reader) => v?.ghostText.read(reader)),
                minReservedLineCount: (0, observable_1.constObservable)(0),
                targetTextModel: this.model.map(v => v?.textModel),
            }));
            this._debounceValue = this.debounceService.for(this.languageFeaturesService.inlineCompletionsProvider, 'InlineCompletionsDebounce', { min: 50, max: 50 });
            this._register(new inlineCompletionContextKeys_1.InlineCompletionContextKeys(this.contextKeyService, this.model));
            this._register(event_1.Event.runAndSubscribe(editor.onDidChangeModel, () => (0, observable_1.transaction)(tx => {
                /** @description onDidChangeModel */
                this.model.set(undefined, tx);
                this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                const textModel = editor.getModel();
                if (textModel) {
                    const model = instantiationService.createInstance(inlineCompletionsModel_1.InlineCompletionsModel, textModel, this.suggestWidgetAdaptor.selectedItem, this.cursorPosition, this.textModelVersionId, this._debounceValue, (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(117 /* EditorOption.suggest */).preview), (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(117 /* EditorOption.suggest */).previewMode), (0, observable_1.observableFromEvent)(editor.onDidChangeConfiguration, () => editor.getOption(62 /* EditorOption.inlineSuggest */).mode), this._enabled);
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
            this._register(editor.onDidChangeModelContent((e) => (0, observable_1.transaction)(tx => 
            /** @description onDidChangeModelContent */
            this.updateObservables(tx, getReason(e)))));
            this._register(editor.onDidChangeCursorPosition(e => (0, observable_1.transaction)(tx => {
                /** @description onDidChangeCursorPosition */
                this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                if (e.reason === 3 /* CursorChangeReason.Explicit */ || e.source === 'api') {
                    this.model.get()?.stop(tx);
                }
            })));
            this._register(editor.onDidType(() => (0, observable_1.transaction)(tx => {
                /** @description onDidType */
                this.updateObservables(tx, inlineCompletionsModel_1.VersionIdChangeReason.Other);
                if (this._enabled.get()) {
                    this.model.get()?.trigger(tx);
                }
            })));
            this._register(this.commandService.onDidExecuteCommand((e) => {
                // These commands don't trigger onDidType.
                const commands = new Set([
                    coreCommands_1.CoreEditingCommands.Tab.id,
                    coreCommands_1.CoreEditingCommands.DeleteLeft.id,
                    coreCommands_1.CoreEditingCommands.DeleteRight.id,
                    commandIds_1.inlineSuggestCommitId,
                    'acceptSelectedSuggestion',
                ]);
                if (commands.has(e.commandId) && editor.hasTextFocus() && this._enabled.get()) {
                    (0, observable_1.transaction)(tx => {
                        /** @description onDidExecuteCommand */
                        this.model.get()?.trigger(tx);
                    });
                }
            }));
            this._register(this.editor.onDidBlurEditorWidget(() => {
                // This is a hidden setting very useful for debugging
                if (this.contextKeyService.getContextKeyValue('accessibleViewIsShown') || this.configurationService.getValue('editor.inlineSuggest.keepOnBlur') ||
                    editor.getOption(62 /* EditorOption.inlineSuggest */).keepOnBlur) {
                    return;
                }
                if (inlineCompletionsHintsWidget_1.InlineSuggestionHintsContentWidget.dropDownVisible) {
                    return;
                }
                (0, observable_1.transaction)(tx => {
                    /** @description onDidBlurEditorWidget */
                    this.model.get()?.stop(tx);
                });
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description forceRenderingAbove */
                const state = this.model.read(reader)?.state.read(reader);
                if (state?.suggestItem) {
                    if (state.ghostText.lineCount >= 2) {
                        this.suggestWidgetAdaptor.forceRenderingAbove();
                    }
                }
                else {
                    this.suggestWidgetAdaptor.stopForceRenderingAbove();
                }
            }));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.suggestWidgetAdaptor.stopForceRenderingAbove();
            }));
            let lastInlineCompletionId = undefined;
            this._register((0, observable_1.autorun)(reader => {
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
                    this.audioCueService.playAudioCue(audioCueService_1.AudioCue.inlineSuggestion).then(() => {
                        if (this.editor.getOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */)) {
                            this.provideScreenReaderUpdate(state.ghostText.renderForScreenReader(lineText));
                        }
                    });
                }
            }));
            this._register(new inlineCompletionsHintsWidget_1.InlineCompletionsHintsWidget(this.editor, this.model, this.instantiationService));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('accessibility.verbosity.inlineCompletions')) {
                    this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this.configurationService.getValue('accessibility.verbosity.inlineCompletions') });
                }
            }));
            this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this.configurationService.getValue('accessibility.verbosity.inlineCompletions') });
        }
        provideScreenReaderUpdate(content) {
            const accessibleViewShowing = this.contextKeyService.getContextKeyValue('accessibleViewIsShown');
            const accessibleViewKeybinding = this._keybindingService.lookupKeybinding('editor.action.accessibleView');
            let hint;
            if (!accessibleViewShowing && accessibleViewKeybinding && this.editor.getOption(147 /* EditorOption.inlineCompletionsAccessibilityVerbose */)) {
                hint = (0, nls_1.localize)('showAccessibleViewHint', "Inspect this in the accessible view ({0})", accessibleViewKeybinding.getAriaLabel());
            }
            hint ? (0, aria_1.alert)(content + ', ' + hint) : (0, aria_1.alert)(content);
        }
        /**
         * Copies over the relevant state from the text model to observables.
         * This solves all kind of eventing issues, as we make sure we always operate on the latest state,
         * regardless of who calls into us.
         */
        updateObservables(tx, changeReason) {
            const newModel = this.editor.getModel();
            this.textModelVersionId.set(newModel?.getVersionId() ?? -1, tx, changeReason);
            this.cursorPosition.set(this.editor.getPosition() ?? new position_1.Position(1, 1), tx);
        }
        shouldShowHoverAt(range) {
            const ghostText = this.model.get()?.ghostText.get();
            if (ghostText) {
                return ghostText.parts.some(p => range.containsPosition(new position_1.Position(ghostText.lineNumber, p.column)));
            }
            return false;
        }
        shouldShowHoverAtViewZone(viewZoneId) {
            return this.ghostTextWidget.ownsViewZone(viewZoneId);
        }
        hide() {
            (0, observable_1.transaction)(tx => {
                this.model.get()?.stop(tx);
            });
        }
    };
    exports.InlineCompletionsController = InlineCompletionsController;
    exports.InlineCompletionsController = InlineCompletionsController = InlineCompletionsController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, commands_1.ICommandService),
        __param(5, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(6, languageFeatures_1.ILanguageFeaturesService),
        __param(7, audioCueService_1.IAudioCueService),
        __param(8, keybinding_1.IKeybindingService)
    ], InlineCompletionsController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9pbmxpbmVDb21wbGV0aW9uc0NvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTs7aUJBQ25ELE9BQUUsR0FBRyw0Q0FBNEMsQUFBL0MsQ0FBZ0Q7UUFFbEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUNwQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQThCLDZCQUEyQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLENBQUM7UUErQkQsWUFDaUIsTUFBbUIsRUFDWixvQkFBNEQsRUFDL0QsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUNsRSxjQUFnRCxFQUNoQyxlQUFpRSxFQUN4RSx1QkFBa0UsRUFDMUUsZUFBa0QsRUFDaEQsa0JBQXVEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBVlEsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUNLLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNmLG9CQUFlLEdBQWYsZUFBZSxDQUFpQztZQUN2RCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3pELG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUMvQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBdEM1RCxVQUFLLEdBQUcsSUFBQSxzQ0FBeUIsRUFBcUMsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDekcs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