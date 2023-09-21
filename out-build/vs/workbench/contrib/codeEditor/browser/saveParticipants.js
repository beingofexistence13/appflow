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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/codeEditorService", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/snippet/browser/snippetController2", "vs/nls!vs/workbench/contrib/codeEditor/browser/saveParticipants", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/format/browser/formatModified", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, lifecycle_1, strings, editorBrowser_1, codeEditorService_1, trimTrailingWhitespaceCommand_1, editOperation_1, position_1, range_1, languageFeatures_1, codeAction_1, types_1, format_1, snippetController2_1, nls_1, configuration_1, instantiation_1, progress_1, platform_1, contributions_1, formatModified_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cYb = exports.$bYb = exports.$aYb = exports.$_Xb = void 0;
    let $_Xb = class $_Xb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            // Nothing
        }
        async participate(model, env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.c.getValue('files.trimTrailingWhitespace', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.e(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
            }
        }
        e(model, isAutoSaved) {
            let prevSelection = [];
            let cursors = [];
            const editor = findEditor(model, this.d);
            if (editor) {
                // Find `prevSelection` in any case do ensure a good undo stack when pushing the edit
                // Collect active cursors in `cursors` only if `isAutoSaved` to avoid having the cursors jump
                prevSelection = editor.getSelections();
                if (isAutoSaved) {
                    cursors = prevSelection.map(s => s.getPosition());
                    const snippetsRange = snippetController2_1.$05.get(editor)?.getSessionEnclosingRange();
                    if (snippetsRange) {
                        for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                            cursors.push(new position_1.$js(lineNumber, model.getLineMaxColumn(lineNumber)));
                        }
                    }
                }
            }
            const ops = (0, trimTrailingWhitespaceCommand_1.$w9)(model, cursors);
            if (!ops.length) {
                return; // Nothing to do
            }
            model.pushEditOperations(prevSelection, ops, (_edits) => prevSelection);
        }
    };
    exports.$_Xb = $_Xb;
    exports.$_Xb = $_Xb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, codeEditorService_1.$nV)
    ], $_Xb);
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
    let $aYb = class $aYb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            // Nothing
        }
        async participate(model, _env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.c.getValue('files.insertFinalNewline', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.e(model.textEditorModel);
            }
        }
        e(model) {
            const lineCount = model.getLineCount();
            const lastLine = model.getLineContent(lineCount);
            const lastLineIsEmptyOrWhitespace = strings.$De(lastLine) === -1;
            if (!lineCount || lastLineIsEmptyOrWhitespace) {
                return;
            }
            const edits = [editOperation_1.$ls.insert(new position_1.$js(lineCount, model.getLineMaxColumn(lineCount)), model.getEOL())];
            const editor = findEditor(model, this.d);
            if (editor) {
                editor.executeEdits('insertFinalNewLine', edits, editor.getSelections());
            }
            else {
                model.pushEditOperations([], edits, () => null);
            }
        }
    };
    exports.$aYb = $aYb;
    exports.$aYb = $aYb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, codeEditorService_1.$nV)
    ], $aYb);
    let $bYb = class $bYb {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            // Nothing
        }
        async participate(model, env) {
            if (!model.textEditorModel) {
                return;
            }
            if (this.c.getValue('files.trimFinalNewlines', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
                this.f(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
            }
        }
        /**
         * returns 0 if the entire file is empty
         */
        e(model) {
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
        f(model, isAutoSaved) {
            const lineCount = model.getLineCount();
            // Do not insert new line if file does not end with new line
            if (lineCount === 1) {
                return;
            }
            let prevSelection = [];
            let cannotTouchLineNumber = 0;
            const editor = findEditor(model, this.d);
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
            const lastNonEmptyLine = this.e(model);
            const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
            const deletionRange = model.validateRange(new range_1.$ks(deleteFromLineNumber, 1, lineCount, model.getLineMaxColumn(lineCount)));
            if (deletionRange.isEmpty()) {
                return;
            }
            model.pushEditOperations(prevSelection, [editOperation_1.$ls.delete(deletionRange)], _edits => prevSelection);
            editor?.setSelections(prevSelection);
        }
    };
    exports.$bYb = $bYb;
    exports.$bYb = $bYb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, codeEditorService_1.$nV)
    ], $bYb);
    let FormatOnSaveParticipant = class FormatOnSaveParticipant {
        constructor(c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
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
            const nestedProgress = new progress_1.$4u(provider => {
                progress.report({
                    message: (0, nls_1.localize)(0, null, provider.displayName || provider.extensionId && provider.extensionId.value || '???', 'command:workbench.action.openSettings?%5B%22editor.formatOnSave%22%5D')
                });
            });
            const enabled = this.c.getValue('editor.formatOnSave', overrides);
            if (!enabled) {
                return undefined;
            }
            const editorOrModel = findEditor(textEditorModel, this.d) || textEditorModel;
            const mode = this.c.getValue('editor.formatOnSaveMode', overrides);
            if (mode === 'file') {
                await this.e.invokeFunction(format_1.$H8, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
            }
            else {
                const ranges = await this.e.invokeFunction(formatModified_1.$$Xb, (0, editorBrowser_1.$iV)(editorOrModel) ? editorOrModel.getModel() : editorOrModel);
                if (ranges === null && mode === 'modificationsIfAvailable') {
                    // no SCM, fallback to formatting the whole file iff wanted
                    await this.e.invokeFunction(format_1.$H8, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
                }
                else if (ranges) {
                    // formatted modified ranges
                    await this.e.invokeFunction(format_1.$F8, editorOrModel, ranges, 2 /* FormattingMode.Silent */, nestedProgress, token);
                }
            }
        }
    };
    FormatOnSaveParticipant = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, codeEditorService_1.$nV),
        __param(2, instantiation_1.$Ah)
    ], FormatOnSaveParticipant);
    let CodeActionOnSaveParticipant = class CodeActionOnSaveParticipant {
        constructor(c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
        }
        async participate(model, env, progress, token) {
            if (!model.textEditorModel) {
                return;
            }
            const textEditorModel = model.textEditorModel;
            const settingsOverrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
            // Convert boolean values to strings
            const setting = this.c.getValue('editor.codeActionsOnSave', settingsOverrides);
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
            const codeActionsOnSave = this.f(Object.keys(convertedSetting));
            if (!Array.isArray(setting)) {
                codeActionsOnSave.sort((a, b) => {
                    if (types_1.$v1.SourceFixAll.contains(a)) {
                        if (types_1.$v1.SourceFixAll.contains(b)) {
                            return 0;
                        }
                        return -1;
                    }
                    if (types_1.$v1.SourceFixAll.contains(b)) {
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
                .map(x => new types_1.$v1(x));
            progress.report({ message: (0, nls_1.localize)(1, null) });
            const filteredSaveList = codeActionsOnSave.filter(x => convertedSetting[x.value] === 'always' || (convertedSetting[x.value] === 'explicit') && env.reason === 1 /* SaveReason.EXPLICIT */);
            await this.g(textEditorModel, filteredSaveList, excludedActions, progress, token);
        }
        f(settingItems) {
            const kinds = settingItems.map(x => new types_1.$v1(x));
            // Remove subsets
            return kinds.filter(kind => {
                return kinds.every(otherKind => otherKind.equals(kind) || !otherKind.contains(kind));
            });
        }
        async g(model, codeActionsOnSave, excludes, progress, token) {
            const getActionProgress = new class {
                constructor() {
                    this.c = new Set();
                }
                d() {
                    progress.report({
                        message: (0, nls_1.localize)(2, null, [...this.c].map(name => `'${name}'`).join(', '), 'command:workbench.action.openSettings?%5B%22editor.codeActionsOnSave%22%5D')
                    });
                }
                report(provider) {
                    if (provider.displayName && !this.c.has(provider.displayName)) {
                        this.c.add(provider.displayName);
                        this.d();
                    }
                }
            };
            for (const codeActionKind of codeActionsOnSave) {
                const actionsToRun = await this.h(model, codeActionKind, excludes, getActionProgress, token);
                if (token.isCancellationRequested) {
                    actionsToRun.dispose();
                    return;
                }
                try {
                    for (const action of actionsToRun.validActions) {
                        progress.report({ message: (0, nls_1.localize)(3, null, action.action.title) });
                        await this.d.invokeFunction(codeAction_1.$J1, action, codeAction_1.ApplyCodeActionReason.OnSave, {}, token);
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
        h(model, codeActionKind, excludes, progress, token) {
            return (0, codeAction_1.$I1)(this.e.codeActionProvider, model, model.getFullModelRange(), {
                type: 2 /* CodeActionTriggerType.Auto */,
                triggerAction: types_1.CodeActionTriggerSource.OnSave,
                filter: { include: codeActionKind, excludes: excludes, includeSourceActions: true },
            }, progress, token);
        }
    };
    CodeActionOnSaveParticipant = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, instantiation_1.$Ah),
        __param(2, languageFeatures_1.$hF)
    ], CodeActionOnSaveParticipant);
    let $cYb = class $cYb extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.g();
        }
        g() {
            this.B(this.f.files.addSaveParticipant(this.c.createInstance($_Xb)));
            this.B(this.f.files.addSaveParticipant(this.c.createInstance(CodeActionOnSaveParticipant)));
            this.B(this.f.files.addSaveParticipant(this.c.createInstance(FormatOnSaveParticipant)));
            this.B(this.f.files.addSaveParticipant(this.c.createInstance($aYb)));
            this.B(this.f.files.addSaveParticipant(this.c.createInstance($bYb)));
        }
    };
    exports.$cYb = $cYb;
    exports.$cYb = $cYb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, textfiles_1.$JD)
    ], $cYb);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($cYb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=saveParticipants.js.map