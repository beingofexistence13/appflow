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
define(["require", "exports", "vs/base/common/types", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/common/editor/textEditorModel", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/browser/parts/editor/textCodeEditor", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/platform/files/common/files"], function (require, exports, types_1, editor_1, editorOptions_1, textResourceEditorInput_1, textEditorModel_1, untitledTextEditorInput_1, textCodeEditor_1, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, themeService_1, editorGroupsService_1, editorService_1, model_1, language_1, modesRegistry_1, files_1) {
    "use strict";
    var TextResourceEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextResourceEditor = exports.AbstractTextResourceEditor = void 0;
    /**
     * An editor implementation that is capable of showing the contents of resource inputs. Uses
     * the TextEditor widget to show the contents.
     */
    let AbstractTextResourceEditor = class AbstractTextResourceEditor extends textCodeEditor_1.AbstractTextCodeEditor {
        constructor(id, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
            super(id, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
        }
        async setInput(input, options, context, token) {
            // Set input and resolve
            await super.setInput(input, options, context, token);
            const resolvedModel = await input.resolve(options);
            // Check for cancellation
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Assert Model instance
            if (!(resolvedModel instanceof textEditorModel_1.BaseTextEditorModel)) {
                throw new Error('Unable to open file as text');
            }
            // Set Editor Model
            const control = (0, types_1.assertIsDefined)(this.editorControl);
            const textEditorModel = resolvedModel.textEditorModel;
            control.setModel(textEditorModel);
            // Restore view state (unless provided by options)
            if (!(0, editor_1.isTextEditorViewState)(options?.viewState)) {
                const editorViewState = this.loadEditorViewState(input, context);
                if (editorViewState) {
                    if (options?.selection) {
                        editorViewState.cursorState = []; // prevent duplicate selections via options
                    }
                    control.restoreViewState(editorViewState);
                }
            }
            // Apply options to editor if any
            if (options) {
                (0, editorOptions_1.applyTextEditorOptions)(options, control, 1 /* ScrollType.Immediate */);
            }
            // Since the resolved model provides information about being readonly
            // or not, we apply it here to the editor even though the editor input
            // was already asked for being readonly or not. The rationale is that
            // a resolved model might have more specific information about being
            // readonly or not that the input did not have.
            control.updateOptions(this.getReadonlyConfiguration(resolvedModel.isReadonly()));
        }
        /**
         * Reveals the last line of this editor if it has a model set.
         */
        revealLastLine() {
            const control = this.editorControl;
            if (!control) {
                return;
            }
            const model = control.getModel();
            if (model) {
                const lastLine = model.getLineCount();
                control.revealPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) }, 0 /* ScrollType.Smooth */);
            }
        }
        clearInput() {
            super.clearInput();
            // Clear Model
            this.editorControl?.setModel(null);
        }
        tracksEditorViewState(input) {
            // editor view state persistence is only enabled for untitled and resource inputs
            return input instanceof untitledTextEditorInput_1.UntitledTextEditorInput || input instanceof textResourceEditorInput_1.TextResourceEditorInput;
        }
    };
    exports.AbstractTextResourceEditor = AbstractTextResourceEditor;
    exports.AbstractTextResourceEditor = AbstractTextResourceEditor = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, editorService_1.IEditorService),
        __param(8, files_1.IFileService)
    ], AbstractTextResourceEditor);
    let TextResourceEditor = class TextResourceEditor extends AbstractTextResourceEditor {
        static { TextResourceEditor_1 = this; }
        static { this.ID = 'workbench.editors.textResourceEditor'; }
        constructor(telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, modelService, languageService, fileService) {
            super(TextResourceEditor_1.ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
            this.modelService = modelService;
            this.languageService = languageService;
        }
        createEditorControl(parent, configuration) {
            super.createEditorControl(parent, configuration);
            // Install a listener for paste to update this editors
            // language if the paste includes a specific language
            const control = this.editorControl;
            if (control) {
                this._register(control.onDidPaste(e => this.onDidEditorPaste(e, control)));
            }
        }
        onDidEditorPaste(e, codeEditor) {
            if (this.input instanceof untitledTextEditorInput_1.UntitledTextEditorInput && this.input.model.hasLanguageSetExplicitly) {
                return; // do not override language if it was set explicitly
            }
            if (e.range.startLineNumber !== 1 || e.range.startColumn !== 1) {
                return; // document had existing content before the pasted text, don't override.
            }
            if (codeEditor.getOption(90 /* EditorOption.readOnly */)) {
                return; // not for readonly editors
            }
            const textModel = codeEditor.getModel();
            if (!textModel) {
                return; // require a live model
            }
            const pasteIsWholeContents = textModel.getLineCount() === e.range.endLineNumber && textModel.getLineMaxColumn(e.range.endLineNumber) === e.range.endColumn;
            if (!pasteIsWholeContents) {
                return; // document had existing content after the pasted text, don't override.
            }
            const currentLanguageId = textModel.getLanguageId();
            if (currentLanguageId !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                return; // require current languageId to be unspecific
            }
            let candidateLanguage = undefined;
            // A languageId is provided via the paste event so text was copied using
            // VSCode. As such we trust this languageId and use it if specific
            if (e.languageId) {
                candidateLanguage = { id: e.languageId, source: 'event' };
            }
            // A languageId was not provided, so the data comes from outside VSCode
            // We can still try to guess a good languageId from the first line if
            // the paste changed the first line
            else {
                const guess = this.languageService.guessLanguageIdByFilepathOrFirstLine(textModel.uri, textModel.getLineContent(1).substr(0, 1000 /* ModelConstants.FIRST_LINE_DETECTION_LENGTH_LIMIT */)) ?? undefined;
                if (guess) {
                    candidateLanguage = { id: guess, source: 'guess' };
                }
            }
            // Finally apply languageId to model if specified
            if (candidateLanguage && candidateLanguage.id !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                if (this.input instanceof untitledTextEditorInput_1.UntitledTextEditorInput && candidateLanguage.source === 'event') {
                    // High confidence, set language id at TextEditorModel level to block future auto-detection
                    this.input.model.setLanguageId(candidateLanguage.id);
                }
                else {
                    textModel.setLanguage(this.languageService.createById(candidateLanguage.id));
                }
                const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
                textModel.detectIndentation(opts.insertSpaces, opts.tabSize);
            }
        }
    };
    exports.TextResourceEditor = TextResourceEditor;
    exports.TextResourceEditor = TextResourceEditor = TextResourceEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(4, themeService_1.IThemeService),
        __param(5, editorService_1.IEditorService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, model_1.IModelService),
        __param(8, language_1.ILanguageService),
        __param(9, files_1.IFileService)
    ], TextResourceEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFJlc291cmNlRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL3RleHRSZXNvdXJjZUVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNEJoRzs7O09BR0c7SUFDSSxJQUFlLDBCQUEwQixHQUF6QyxNQUFlLDBCQUEyQixTQUFRLHVDQUE0QztRQUVwRyxZQUNDLEVBQVUsRUFDUyxnQkFBbUMsRUFDL0Isb0JBQTJDLEVBQ2pELGNBQStCLEVBQ2IsZ0NBQW1FLEVBQ3ZGLFlBQTJCLEVBQ3BCLGtCQUF3QyxFQUM5QyxhQUE2QixFQUMvQixXQUF5QjtZQUV2QyxLQUFLLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxnQ0FBZ0MsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ25LLENBQUM7UUFFUSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXNDLEVBQUUsT0FBdUMsRUFBRSxPQUEyQixFQUFFLEtBQXdCO1lBRTdKLHdCQUF3QjtZQUN4QixNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckQsTUFBTSxhQUFhLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5ELHlCQUF5QjtZQUN6QixJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtnQkFDbEMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCx3QkFBd0I7WUFDeEIsSUFBSSxDQUFDLENBQUMsYUFBYSxZQUFZLHFDQUFtQixDQUFDLEVBQUU7Z0JBQ3BELE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENB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