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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/characterClassifier", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/format/browser/formattingEdit", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress"], function (require, exports, arrays_1, cancellation_1, errors_1, keyCodes_1, lifecycle_1, editorExtensions_1, codeEditorService_1, characterClassifier_1, range_1, editorContextKeys_1, editorWorker_1, languageFeatures_1, format_1, formattingEdit_1, nls, commands_1, contextkey_1, instantiation_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormatOnType = void 0;
    let FormatOnType = class FormatOnType {
        static { this.ID = 'editor.contrib.autoFormat'; }
        constructor(_editor, _languageFeaturesService, _workerService) {
            this._editor = _editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._workerService = _workerService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this._disposables.add(_languageFeaturesService.onTypeFormattingEditProvider.onDidChange(this._update, this));
            this._disposables.add(_editor.onDidChangeModel(() => this._update()));
            this._disposables.add(_editor.onDidChangeModelLanguage(() => this._update()));
            this._disposables.add(_editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(56 /* EditorOption.formatOnType */)) {
                    this._update();
                }
            }));
            this._update();
        }
        dispose() {
            this._disposables.dispose();
            this._sessionDisposables.dispose();
        }
        _update() {
            // clean up
            this._sessionDisposables.clear();
            // we are disabled
            if (!this._editor.getOption(56 /* EditorOption.formatOnType */)) {
                return;
            }
            // no model
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            // no support
            const [support] = this._languageFeaturesService.onTypeFormattingEditProvider.ordered(model);
            if (!support || !support.autoFormatTriggerCharacters) {
                return;
            }
            // register typing listeners that will trigger the format
            const triggerChars = new characterClassifier_1.CharacterSet();
            for (const ch of support.autoFormatTriggerCharacters) {
                triggerChars.add(ch.charCodeAt(0));
            }
            this._sessionDisposables.add(this._editor.onDidType((text) => {
                const lastCharCode = text.charCodeAt(text.length - 1);
                if (triggerChars.has(lastCharCode)) {
                    this._trigger(String.fromCharCode(lastCharCode));
                }
            }));
        }
        _trigger(ch) {
            if (!this._editor.hasModel()) {
                return;
            }
            if (this._editor.getSelections().length > 1 || !this._editor.getSelection().isEmpty()) {
                return;
            }
            const model = this._editor.getModel();
            const position = this._editor.getPosition();
            const cts = new cancellation_1.CancellationTokenSource();
            // install a listener that checks if edits happens before the
            // position on which we format right now. If so, we won't
            // apply the format edits
            const unbind = this._editor.onDidChangeModelContent((e) => {
                if (e.isFlush) {
                    // a model.setValue() was called
                    // cancel only once
                    cts.cancel();
                    unbind.dispose();
                    return;
                }
                for (let i = 0, len = e.changes.length; i < len; i++) {
                    const change = e.changes[i];
                    if (change.range.endLineNumber <= position.lineNumber) {
                        // cancel only once
                        cts.cancel();
                        unbind.dispose();
                        return;
                    }
                }
            });
            (0, format_1.getOnTypeFormattingEdits)(this._workerService, this._languageFeaturesService, model, position, ch, model.getFormattingOptions(), cts.token).then(edits => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                if ((0, arrays_1.isNonEmptyArray)(edits)) {
                    formattingEdit_1.FormattingEdit.execute(this._editor, edits, true);
                    (0, format_1.alertFormattingEdits)(edits);
                }
            }).finally(() => {
                unbind.dispose();
            });
        }
    };
    exports.FormatOnType = FormatOnType;
    exports.FormatOnType = FormatOnType = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, editorWorker_1.IEditorWorkerService)
    ], FormatOnType);
    let FormatOnPaste = class FormatOnPaste {
        static { this.ID = 'editor.contrib.formatOnPaste'; }
        constructor(editor, _languageFeaturesService, _instantiationService) {
            this.editor = editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._instantiationService = _instantiationService;
            this._callOnDispose = new lifecycle_1.DisposableStore();
            this._callOnModel = new lifecycle_1.DisposableStore();
            this._callOnDispose.add(editor.onDidChangeConfiguration(() => this._update()));
            this._callOnDispose.add(editor.onDidChangeModel(() => this._update()));
            this._callOnDispose.add(editor.onDidChangeModelLanguage(() => this._update()));
            this._callOnDispose.add(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(this._update, this));
        }
        dispose() {
            this._callOnDispose.dispose();
            this._callOnModel.dispose();
        }
        _update() {
            // clean up
            this._callOnModel.clear();
            // we are disabled
            if (!this.editor.getOption(55 /* EditorOption.formatOnPaste */)) {
                return;
            }
            // no model
            if (!this.editor.hasModel()) {
                return;
            }
            // no formatter
            if (!this._languageFeaturesService.documentRangeFormattingEditProvider.has(this.editor.getModel())) {
                return;
            }
            this._callOnModel.add(this.editor.onDidPaste(({ range }) => this._trigger(range)));
        }
        _trigger(range) {
            if (!this.editor.hasModel()) {
                return;
            }
            if (this.editor.getSelections().length > 1) {
                return;
            }
            this._instantiationService.invokeFunction(format_1.formatDocumentRangesWithSelectedProvider, this.editor, range, 2 /* FormattingMode.Silent */, progress_1.Progress.None, cancellation_1.CancellationToken.None).catch(errors_1.onUnexpectedError);
        }
    };
    FormatOnPaste = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, instantiation_1.IInstantiationService)
    ], FormatOnPaste);
    class FormatDocumentAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatDocument',
                label: nls.localize('formatDocument.label', "Format Document"),
                alias: 'Format Document',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.notInCompositeEditor, editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.3
                }
            });
        }
        async run(accessor, editor) {
            if (editor.hasModel()) {
                const instaService = accessor.get(instantiation_1.IInstantiationService);
                const progressService = accessor.get(progress_1.IEditorProgressService);
                await progressService.showWhile(instaService.invokeFunction(format_1.formatDocumentWithSelectedProvider, editor, 1 /* FormattingMode.Explicit */, progress_1.Progress.None, cancellation_1.CancellationToken.None), 250);
            }
        }
    }
    class FormatSelectionAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatSelection',
                label: nls.localize('formatSelection.label', "Format Selection"),
                alias: 'Format Selection',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentSelectionFormattingProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    when: editorContextKeys_1.EditorContextKeys.hasNonEmptySelection,
                    group: '1_modification',
                    order: 1.31
                }
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const model = editor.getModel();
            const ranges = editor.getSelections().map(range => {
                return range.isEmpty()
                    ? new range_1.Range(range.startLineNumber, 1, range.startLineNumber, model.getLineMaxColumn(range.startLineNumber))
                    : range;
            });
            const progressService = accessor.get(progress_1.IEditorProgressService);
            await progressService.showWhile(instaService.invokeFunction(format_1.formatDocumentRangesWithSelectedProvider, editor, ranges, 1 /* FormattingMode.Explicit */, progress_1.Progress.None, cancellation_1.CancellationToken.None), 250);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(FormatOnType.ID, FormatOnType, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorContribution)(FormatOnPaste.ID, FormatOnPaste, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(FormatDocumentAction);
    (0, editorExtensions_1.registerEditorAction)(FormatSelectionAction);
    // this is the old format action that does both (format document OR format selection)
    // and we keep it here such that existing keybinding configurations etc will still work
    commands_1.CommandsRegistry.registerCommand('editor.action.format', async (accessor) => {
        const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
        if (!editor || !editor.hasModel()) {
            return;
        }
        const commandService = accessor.get(commands_1.ICommandService);
        if (editor.getSelection().isEmpty()) {
            await commandService.executeCommand('editor.action.formatDocument');
        }
        else {
            await commandService.executeCommand('editor.action.formatSelection');
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2Zvcm1hdC9icm93c2VyL2Zvcm1hdEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJ6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFZO2lCQUVELE9BQUUsR0FBRywyQkFBMkIsQUFBOUIsQ0FBK0I7UUFNeEQsWUFDa0IsT0FBb0IsRUFDWCx3QkFBbUUsRUFDdkUsY0FBcUQ7WUFGMUQsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNNLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDdEQsbUJBQWMsR0FBZCxjQUFjLENBQXNCO1lBTjNELGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDckMsd0JBQW1CLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFPNUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsNEJBQTRCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3RyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFELElBQUksQ0FBQyxDQUFDLFVBQVUsb0NB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