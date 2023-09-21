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
    var $Evb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Evb = exports.$Dvb = void 0;
    /**
     * An editor implementation that is capable of showing the contents of resource inputs. Uses
     * the TextEditor widget to show the contents.
     */
    let $Dvb = class $Dvb extends textCodeEditor_1.$Cvb {
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
            if (!(resolvedModel instanceof textEditorModel_1.$DA)) {
                throw new Error('Unable to open file as text');
            }
            // Set Editor Model
            const control = (0, types_1.$uf)(this.a);
            const textEditorModel = resolvedModel.textEditorModel;
            control.setModel(textEditorModel);
            // Restore view state (unless provided by options)
            if (!(0, editor_1.$5E)(options?.viewState)) {
                const editorViewState = this.kb(input, context);
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
            control.updateOptions(this.Gb(resolvedModel.isReadonly()));
        }
        /**
         * Reveals the last line of this editor if it has a model set.
         */
        revealLastLine() {
            const control = this.a;
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
            this.a?.setModel(null);
        }
        ob(input) {
            // editor view state persistence is only enabled for untitled and resource inputs
            return input instanceof untitledTextEditorInput_1.$Bvb || input instanceof textResourceEditorInput_1.$7eb;
        }
    };
    exports.$Dvb = $Dvb;
    exports.$Dvb = $Dvb = __decorate([
        __param(1, telemetry_1.$9k),
        __param(2, instantiation_1.$Ah),
        __param(3, storage_1.$Vo),
        __param(4, textResourceConfiguration_1.$FA),
        __param(5, themeService_1.$gv),
        __param(6, editorGroupsService_1.$5C),
        __param(7, editorService_1.$9C),
        __param(8, files_1.$6j)
    ], $Dvb);
    let $Evb = class $Evb extends $Dvb {
        static { $Evb_1 = this; }
        static { this.ID = 'workbench.editors.textResourceEditor'; }
        constructor(telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, $, Xb, fileService) {
            super($Evb_1.ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
            this.$ = $;
            this.Xb = Xb;
        }
        Lb(parent, configuration) {
            super.Lb(parent, configuration);
            // Install a listener for paste to update this editors
            // language if the paste includes a specific language
            const control = this.a;
            if (control) {
                this.B(control.onDidPaste(e => this.Zb(e, control)));
            }
        }
        Zb(e, codeEditor) {
            if (this.input instanceof untitledTextEditorInput_1.$Bvb && this.input.model.hasLanguageSetExplicitly) {
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
            if (currentLanguageId !== modesRegistry_1.$Yt) {
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
                const guess = this.Xb.guessLanguageIdByFilepathOrFirstLine(textModel.uri, textModel.getLineContent(1).substr(0, 1000 /* ModelConstants.FIRST_LINE_DETECTION_LENGTH_LIMIT */)) ?? undefined;
                if (guess) {
                    candidateLanguage = { id: guess, source: 'guess' };
                }
            }
            // Finally apply languageId to model if specified
            if (candidateLanguage && candidateLanguage.id !== modesRegistry_1.$Yt) {
                if (this.input instanceof untitledTextEditorInput_1.$Bvb && candidateLanguage.source === 'event') {
                    // High confidence, set language id at TextEditorModel level to block future auto-detection
                    this.input.model.setLanguageId(candidateLanguage.id);
                }
                else {
                    textModel.setLanguage(this.Xb.createById(candidateLanguage.id));
                }
                const opts = this.$.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
                textModel.detectIndentation(opts.insertSpaces, opts.tabSize);
            }
        }
    };
    exports.$Evb = $Evb;
    exports.$Evb = $Evb = $Evb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, instantiation_1.$Ah),
        __param(2, storage_1.$Vo),
        __param(3, textResourceConfiguration_1.$FA),
        __param(4, themeService_1.$gv),
        __param(5, editorService_1.$9C),
        __param(6, editorGroupsService_1.$5C),
        __param(7, model_1.$yA),
        __param(8, language_1.$ct),
        __param(9, files_1.$6j)
    ], $Evb);
});
//# sourceMappingURL=textResourceEditor.js.map