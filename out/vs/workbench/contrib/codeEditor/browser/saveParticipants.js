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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/codeEditorService", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/format/browser/formatModified", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, lifecycle_1, strings, editorBrowser_1, codeEditorService_1, trimTrailingWhitespaceCommand_1, editOperation_1, position_1, range_1, languageFeatures_1, codeAction_1, types_1, format_1, snippetController2_1, nls_1, configuration_1, instantiation_1, progress_1, platform_1, contributions_1, formatModified_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveParticipantsContribution = exports.TrimFinalNewLinesParticipant = exports.FinalNewLineParticipant = exports.TrimWhitespaceParticipant = void 0;
    let TrimWhitespaceParticipant = class TrimWhitespaceParticipant {
        constructor(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        async participate(model, env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.configurationService.getValue('files.trimTrailingWhitespace', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.doTrimTrailingWhitespace(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
            }
        }
        doTrimTrailingWhitespace(model, isAutoSaved) {
            let prevSelection = [];
            let cursors = [];
            const editor = findEditor(model, this.codeEditorService);
            if (editor) {
                // Find `prevSelection` in any case do ensure a good undo stack when pushing the edit
                // Collect active cursors in `cursors` only if `isAutoSaved` to avoid having the cursors jump
                prevSelection = editor.getSelections();
                if (isAutoSaved) {
                    cursors = prevSelection.map(s => s.getPosition());
                    const snippetsRange = snippetController2_1.SnippetController2.get(editor)?.getSessionEnclosingRange();
                    if (snippetsRange) {
                        for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                            cursors.push(new position_1.Position(lineNumber, model.getLineMaxColumn(lineNumber)));
                        }
                    }
                }
            }
            const ops = (0, trimTrailingWhitespaceCommand_1.trimTrailingWhitespace)(model, cursors);
            if (!ops.length) {
                return; // Nothing to do
            }
            model.pushEditOperations(prevSelection, ops, (_edits) => prevSelection);
        }
    };
    exports.TrimWhitespaceParticipant = TrimWhitespaceParticipant;
    exports.TrimWhitespaceParticipant = TrimWhitespaceParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], TrimWhitespaceParticipant);
    function findEditor(model, codeEditorService) {
        let candidate = null;
        if (model.isAttachedToEditor()) {
            for (const editor of codeEditorService.listCodeEditors()) {
                if (editor.hasModel() && editor.getModel() === model) {
                    if (editor.hasTextFocus()) {
                        return editor; // favour focused editor if there are multiple
                    }
                    candidate = editor;
                }
            }
        }
        return candidate;
    }
    let FinalNewLineParticipant = class FinalNewLineParticipant {
        constructor(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        async participate(model, _env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.configurationService.getValue('files.insertFinalNewline', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.doInsertFinalNewLine(model.textEditorModel);
            }
        }
        doInsertFinalNewLine(model) {
            const lineCount = model.getLineCount();
            const lastLine = model.getLineContent(lineCount);
            const lastLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(lastLine) === -1;
            if (!lineCount || lastLineIsEmptyOrWhitespace) {
                return;
            }
            const edits = [editOperation_1.EditOperation.insert(new position_1.Position(lineCount, model.getLineMaxColumn(lineCount)), model.getEOL())];
            const editor = findEditor(model, this.codeEditorService);
            if (editor) {
                editor.executeEdits('insertFinalNewLine', edits, editor.getSelections());
            }
            else {
                model.pushEditOperations([], edits, () => null);
            }
        }
    };
    exports.FinalNewLineParticipant = FinalNewLineParticipant;
    exports.FinalNewLineParticipant = FinalNewLineParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], FinalNewLineParticipant);
    let TrimFinalNewLinesParticipant = class TrimFinalNewLinesParticipant {
        constructor(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        async participate(model, env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.configurationService.getValue('files.trimFinalNewlines', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.doTrimFinalNewLines(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
            }
        }
        /**
         * returns 0 if the entire file is empty
         */
        findLastNonEmptyLine(model) {
            for (let lineNumber = model.getLineCount(); lineNumber >= 1; lineNumber--) {
                const lineContent = model.getLineContent(lineNumber);
                if (lineContent.length > 0) {
                    // this line has content
                    return lineNumber;
                }
            }
            // no line has content
            return 0;
        }
        doTrimFinalNewLines(model, isAutoSaved) {
            const lineCount = model.getLineCount();
            // Do not insert new line if file does not end with new line
            if (lineCount === 1) {
                return;
            }
            let prevSelection = [];
            let cannotTouchLineNumber = 0;
            const editor = findEditor(model, this.codeEditorService);
            if (editor) {
                prevSelection = editor.getSelections();
                if (isAutoSaved) {
                    for (let i = 0, len = prevSelection.length; i < len; i++) {
                        const positionLineNumber = prevSelection[i].positionLineNumber;
                        if (positionLineNumber > cannotTouchLineNumber) {
                            cannotTouchLineNumber = positionLineNumber;
                        }
                    }
                }
            }
            const lastNonEmptyLine = this.findLastNonEmptyLine(model);
            const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
            const deletionRange = model.validateRange(new range_1.Range(deleteFromLineNumber, 1, lineCount, model.getLineMaxColumn(lineCount)));
            if (deletionRange.isEmpty()) {
                return;
            }
            model.pushEditOperations(prevSelection, [editOperation_1.EditOperation.delete(deletionRange)], _edits => prevSelection);
            editor?.setSelections(prevSelection);
        }
    };
    exports.TrimFinalNewLinesParticipant = TrimFinalNewLinesParticipant;
    exports.TrimFinalNewLinesParticipant = TrimFinalNewLinesParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], TrimFinalNewLinesParticipant);
    let FormatOnSaveParticipant = class FormatOnSaveParticipant {
        constructor(configurationService, codeEditorService, instantiationService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            this.instantiationService = instantiationService;
            // Nothing
        }
        async participate(model, env, progress, token) {
            if (!model.textEditorModel) {
                return;
            }
            if (env.reason === 2 /* SaveReason.AUTO */) {
                return undefined;
            }
            const textEditorModel = model.textEditorModel;
            const overrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
            const nestedProgress = new progress_1.Progress(provider => {
                progress.report({
                    message: (0, nls_1.localize)({ key: 'formatting2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] }, "Running '{0}' Formatter ([configure]({1})).", provider.displayName || provider.extensionId && provider.extensionId.value || '???', 'command:workbench.action.openSettings?%5B%22editor.formatOnSave%22%5D')
                });
            });
            const enabled = this.configurationService.getValue('editor.formatOnSave', overrides);
            if (!enabled) {
                return undefined;
            }
            const editorOrModel = findEditor(textEditorModel, this.codeEditorService) || textEditorModel;
            const mode = this.configurationService.getValue('editor.formatOnSaveMode', overrides);
            if (mode === 'file') {
                await this.instantiationService.invokeFunction(format_1.formatDocumentWithSelectedProvider, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
            }
            else {
                const ranges = await this.instantiationService.invokeFunction(formatModified_1.getModifiedRanges, (0, editorBrowser_1.isCodeEditor)(editorOrModel) ? editorOrModel.getModel() : editorOrModel);
                if (ranges === null && mode === 'modificationsIfAvailable') {
                    // no SCM, fallback to formatting the whole file iff wanted
                    await this.instantiationService.invokeFunction(format_1.formatDocumentWithSelectedProvider, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
                }
                else if (ranges) {
                    // formatted modified ranges
                    await this.instantiationService.invokeFunction(format_1.formatDocumentRangesWithSelectedProvider, editorOrModel, ranges, 2 /* FormattingMode.Silent */, nestedProgress, token);
                }
            }
        }
    };
    FormatOnSaveParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, instantiation_1.IInstantiationService)
    ], FormatOnSaveParticipant);
    let CodeActionOnSaveParticipant = class CodeActionOnSaveParticipant {
        constructor(configurationService, instantiationService, languageFeaturesService) {
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.languageFeaturesService = languageFeaturesService;
        }
        async participate(model, env, progress, token) {
            if (!model.textEditorModel) {
                return;
            }
            const textEditorModel = model.textEditorModel;
            const settingsOverrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
            // Convert boolean values to strings
            const setting = this.configurationService.getValue('editor.codeActionsOnSave', settingsOverrides);
            if (!setting) {
                return undefined;
            }
            if (env.reason === 2 /* SaveReason.AUTO */) {
                return undefined;
            }
            const convertedSetting = {};
            for (const key in setting) {
                if (typeof setting[key] === 'boolean') {
                    convertedSetting[key] = setting[key] ? 'explicit' : 'never';
                }
                else if (typeof setting[key] === 'string') {
                    convertedSetting[key] = setting[key];
                }
            }
            const codeActionsOnSave = this.createCodeActionsOnSave(Object.keys(convertedSetting));
            if (!Array.isArray(setting)) {
                codeActionsOnSave.sort((a, b) => {
                    if (types_1.CodeActionKind.SourceFixAll.contains(a)) {
                        if (types_1.CodeActionKind.SourceFixAll.contains(b)) {
                            return 0;
                        }
                        return -1;
                    }
                    if (types_1.CodeActionKind.SourceFixAll.contains(b)) {
                        return 1;
                    }
                    return 0;
                });
            }
            if (!codeActionsOnSave.length) {
                return undefined;
            }
            const excludedActions = Object.keys(setting)
                .filter(x => convertedSetting[x] === 'never' || false)
                .map(x => new types_1.CodeActionKind(x));
            progress.report({ message: (0, nls_1.localize)('codeaction', "Quick Fixes") });
            const filteredSaveList = codeActionsOnSave.filter(x => convertedSetting[x.value] === 'always' || (convertedSetting[x.value] === 'explicit') && env.reason === 1 /* SaveReason.EXPLICIT */);
            await this.applyOnSaveActions(textEditorModel, filteredSaveList, excludedActions, progress, token);
        }
        createCodeActionsOnSave(settingItems) {
            const kinds = settingItems.map(x => new types_1.CodeActionKind(x));
            // Remove subsets
            return kinds.filter(kind => {
                return kinds.every(otherKind => otherKind.equals(kind) || !otherKind.contains(kind));
            });
        }
        async applyOnSaveActions(model, codeActionsOnSave, excludes, progress, token) {
            const getActionProgress = new class {
                constructor() {
                    this._names = new Set();
                }
                _report() {
                    progress.report({
                        message: (0, nls_1.localize)({ key: 'codeaction.get2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] }, "Getting code actions from '{0}' ([configure]({1})).", [...this._names].map(name => `'${name}'`).join(', '), 'command:workbench.action.openSettings?%5B%22editor.codeActionsOnSave%22%5D')
                    });
                }
                report(provider) {
                    if (provider.displayName && !this._names.has(provider.displayName)) {
                        this._names.add(provider.displayName);
                        this._report();
                    }
                }
            };
            for (const codeActionKind of codeActionsOnSave) {
                const actionsToRun = await this.getActionsToRun(model, codeActionKind, excludes, getActionProgress, token);
                if (token.isCancellationRequested) {
                    actionsToRun.dispose();
                    return;
                }
                try {
                    for (const action of actionsToRun.validActions) {
                        progress.report({ message: (0, nls_1.localize)('codeAction.apply', "Applying code action '{0}'.", action.action.title) });
                        await this.instantiationService.invokeFunction(codeAction_1.applyCodeAction, action, codeAction_1.ApplyCodeActionReason.OnSave, {}, token);
                        if (token.isCancellationRequested) {
                            return;
                        }
                    }
                }
                catch {
                    // Failure to apply a code action should not block other on save actions
                }
                finally {
                    actionsToRun.dispose();
                }
            }
        }
        getActionsToRun(model, codeActionKind, excludes, progress, token) {
            return (0, codeAction_1.getCodeActions)(this.languageFeaturesService.codeActionProvider, model, model.getFullModelRange(), {
                type: 2 /* CodeActionTriggerType.Auto */,
                triggerAction: types_1.CodeActionTriggerSource.OnSave,
                filter: { include: codeActionKind, excludes: excludes, includeSourceActions: true },
            }, progress, token);
        }
    };
    CodeActionOnSaveParticipant = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], CodeActionOnSaveParticipant);
    let SaveParticipantsContribution = class SaveParticipantsContribution extends lifecycle_1.Disposable {
        constructor(instantiationService, textFileService) {
            super();
            this.instantiationService = instantiationService;
            this.textFileService = textFileService;
            this.registerSaveParticipants();
        }
        registerSaveParticipants() {
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimWhitespaceParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(CodeActionOnSaveParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FormatOnSaveParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FinalNewLineParticipant)));
            this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimFinalNewLinesParticipant)));
        }
    };
    exports.SaveParticipantsContribution = SaveParticipantsContribution;
    exports.SaveParticipantsContribution = SaveParticipantsContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, textfiles_1.ITextFileService)
    ], SaveParticipantsContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(SaveParticipantsContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZVBhcnRpY2lwYW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9zYXZlUGFydGljaXBhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStCekYsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBeUI7UUFFckMsWUFDeUMsb0JBQTJDLEVBQzlDLGlCQUFxQztZQURsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFFMUUsVUFBVTtRQUNYLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQTJCLEVBQUUsR0FBMkI7WUFDekUsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQzNCLE9BQU87YUFDUDtZQUVELElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFO2dCQUNoSyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsTUFBTSw0QkFBb0IsQ0FBQyxDQUFDO2FBQ3JGO1FBQ0YsQ0FBQztRQUVPLHdCQUF3QixDQUFDLEtBQWlCLEVBQUUsV0FBb0I7WUFDdkUsSUFBSSxhQUFhLEdBQWdCLEVBQUUsQ0FBQztZQUNwQyxJQUFJLE9BQU8sR0FBZSxFQUFFLENBQUM7WUFFN0IsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN6RCxJQUFJLE1BQU0sRUFBRTtnQkFDWCxxRkFB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