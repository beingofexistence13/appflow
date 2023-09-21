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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/message/browser/messageController", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "./renameInputField", "vs/editor/common/services/languageFeatures"], function (require, exports, aria_1, async_1, cancellation_1, errors_1, lifecycle_1, types_1, uri_1, editorState_1, editorExtensions_1, bulkEditService_1, codeEditorService_1, position_1, range_1, editorContextKeys_1, textResourceConfiguration_1, messageController_1, nls, configurationRegistry_1, contextkey_1, instantiation_1, log_1, notification_1, progress_1, platform_1, renameInputField_1, languageFeatures_1) {
    "use strict";
    var RenameController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenameAction = exports.rename = void 0;
    class RenameSkeleton {
        constructor(model, position, registry) {
            this.model = model;
            this.position = position;
            this._providerRenameIdx = 0;
            this._providers = registry.ordered(model);
        }
        hasProvider() {
            return this._providers.length > 0;
        }
        async resolveRenameLocation(token) {
            const rejects = [];
            for (this._providerRenameIdx = 0; this._providerRenameIdx < this._providers.length; this._providerRenameIdx++) {
                const provider = this._providers[this._providerRenameIdx];
                if (!provider.resolveRenameLocation) {
                    break;
                }
                const res = await provider.resolveRenameLocation(this.model, this.position, token);
                if (!res) {
                    continue;
                }
                if (res.rejectReason) {
                    rejects.push(res.rejectReason);
                    continue;
                }
                return res;
            }
            const word = this.model.getWordAtPosition(this.position);
            if (!word) {
                return {
                    range: range_1.Range.fromPositions(this.position),
                    text: '',
                    rejectReason: rejects.length > 0 ? rejects.join('\n') : undefined
                };
            }
            return {
                range: new range_1.Range(this.position.lineNumber, word.startColumn, this.position.lineNumber, word.endColumn),
                text: word.word,
                rejectReason: rejects.length > 0 ? rejects.join('\n') : undefined
            };
        }
        async provideRenameEdits(newName, token) {
            return this._provideRenameEdits(newName, this._providerRenameIdx, [], token);
        }
        async _provideRenameEdits(newName, i, rejects, token) {
            const provider = this._providers[i];
            if (!provider) {
                return {
                    edits: [],
                    rejectReason: rejects.join('\n')
                };
            }
            const result = await provider.provideRenameEdits(this.model, this.position, newName, token);
            if (!result) {
                return this._provideRenameEdits(newName, i + 1, rejects.concat(nls.localize('no result', "No result.")), token);
            }
            else if (result.rejectReason) {
                return this._provideRenameEdits(newName, i + 1, rejects.concat(result.rejectReason), token);
            }
            return result;
        }
    }
    async function rename(registry, model, position, newName) {
        const skeleton = new RenameSkeleton(model, position, registry);
        const loc = await skeleton.resolveRenameLocation(cancellation_1.CancellationToken.None);
        if (loc?.rejectReason) {
            return { edits: [], rejectReason: loc.rejectReason };
        }
        return skeleton.provideRenameEdits(newName, cancellation_1.CancellationToken.None);
    }
    exports.rename = rename;
    // ---  register actions and commands
    let RenameController = class RenameController {
        static { RenameController_1 = this; }
        static { this.ID = 'editor.contrib.renameController'; }
        static get(editor) {
            return editor.getContribution(RenameController_1.ID);
        }
        constructor(editor, _instaService, _notificationService, _bulkEditService, _progressService, _logService, _configService, _languageFeaturesService) {
            this.editor = editor;
            this._instaService = _instaService;
            this._notificationService = _notificationService;
            this._bulkEditService = _bulkEditService;
            this._progressService = _progressService;
            this._logService = _logService;
            this._configService = _configService;
            this._languageFeaturesService = _languageFeaturesService;
            this._disposableStore = new lifecycle_1.DisposableStore();
            this._cts = new cancellation_1.CancellationTokenSource();
            this._renameInputField = this._disposableStore.add(this._instaService.createInstance(renameInputField_1.RenameInputField, this.editor, ['acceptRenameInput', 'acceptRenameInputWithPreview']));
        }
        dispose() {
            this._disposableStore.dispose();
            this._cts.dispose(true);
        }
        async run() {
            // set up cancellation token to prevent reentrant rename, this
            // is the parent to the resolve- and rename-tokens
            this._cts.dispose(true);
            this._cts = new cancellation_1.CancellationTokenSource();
            if (!this.editor.hasModel()) {
                return undefined;
            }
            const position = this.editor.getPosition();
            const skeleton = new RenameSkeleton(this.editor.getModel(), position, this._languageFeaturesService.renameProvider);
            if (!skeleton.hasProvider()) {
                return undefined;
            }
            // part 1 - resolve rename location
            const cts1 = new editorState_1.EditorStateCancellationTokenSource(this.editor, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */, undefined, this._cts.token);
            let loc;
            try {
                const resolveLocationOperation = skeleton.resolveRenameLocation(cts1.token);
                this._progressService.showWhile(resolveLocationOperation, 250);
                loc = await resolveLocationOperation;
            }
            catch (e) {
                messageController_1.MessageController.get(this.editor)?.showMessage(e || nls.localize('resolveRenameLocationFailed', "An unknown error occurred while resolving rename location"), position);
                return undefined;
            }
            finally {
                cts1.dispose();
            }
            if (!loc) {
                return undefined;
            }
            if (loc.rejectReason) {
                messageController_1.MessageController.get(this.editor)?.showMessage(loc.rejectReason, position);
                return undefined;
            }
            if (cts1.token.isCancellationRequested) {
                return undefined;
            }
            // part 2 - do rename at location
            const cts2 = new editorState_1.EditorStateCancellationTokenSource(this.editor, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */, loc.range, this._cts.token);
            const selection = this.editor.getSelection();
            let selectionStart = 0;
            let selectionEnd = loc.text.length;
            if (!range_1.Range.isEmpty(selection) && !range_1.Range.spansMultipleLines(selection) && range_1.Range.containsRange(loc.range, selection)) {
                selectionStart = Math.max(0, selection.startColumn - loc.range.startColumn);
                selectionEnd = Math.min(loc.range.endColumn, selection.endColumn) - loc.range.startColumn;
            }
            const supportPreview = this._bulkEditService.hasPreviewHandler() && this._configService.getValue(this.editor.getModel().uri, 'editor.rename.enablePreview');
            const inputFieldResult = await this._renameInputField.getInput(loc.range, loc.text, selectionStart, selectionEnd, supportPreview, cts2.token);
            // no result, only hint to focus the editor or not
            if (typeof inputFieldResult === 'boolean') {
                if (inputFieldResult) {
                    this.editor.focus();
                }
                cts2.dispose();
                return undefined;
            }
            this.editor.focus();
            const renameOperation = (0, async_1.raceCancellation)(skeleton.provideRenameEdits(inputFieldResult.newName, cts2.token), cts2.token).then(async (renameResult) => {
                if (!renameResult || !this.editor.hasModel()) {
                    return;
                }
                if (renameResult.rejectReason) {
                    this._notificationService.info(renameResult.rejectReason);
                    return;
                }
                // collapse selection to active end
                this.editor.setSelection(range_1.Range.fromPositions(this.editor.getSelection().getPosition()));
                this._bulkEditService.apply(renameResult, {
                    editor: this.editor,
                    showPreview: inputFieldResult.wantsPreview,
                    label: nls.localize('label', "Renaming '{0}' to '{1}'", loc?.text, inputFieldResult.newName),
                    code: 'undoredo.rename',
                    quotableLabel: nls.localize('quotableLabel', "Renaming {0} to {1}", loc?.text, inputFieldResult.newName),
                    respectAutoSaveConfig: true
                }).then(result => {
                    if (result.ariaSummary) {
                        (0, aria_1.alert)(nls.localize('aria', "Successfully renamed '{0}' to '{1}'. Summary: {2}", loc.text, inputFieldResult.newName, result.ariaSummary));
                    }
                }).catch(err => {
                    this._notificationService.error(nls.localize('rename.failedApply', "Rename failed to apply edits"));
                    this._logService.error(err);
                });
            }, err => {
                this._notificationService.error(nls.localize('rename.failed', "Rename failed to compute edits"));
                this._logService.error(err);
            }).finally(() => {
                cts2.dispose();
            });
            this._progressService.showWhile(renameOperation, 250);
            return renameOperation;
        }
        acceptRenameInput(wantsPreview) {
            this._renameInputField.acceptInput(wantsPreview);
        }
        cancelRenameInput() {
            this._renameInputField.cancelInput(true);
        }
    };
    RenameController = RenameController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, progress_1.IEditorProgressService),
        __param(5, log_1.ILogService),
        __param(6, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(7, languageFeatures_1.ILanguageFeaturesService)
    ], RenameController);
    // ---- action implementation
    class RenameAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.rename',
                label: nls.localize('rename.label', "Rename Symbol"),
                alias: 'Rename Symbol',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasRenameProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 60 /* KeyCode.F2 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.1
                }
            });
        }
        runCommand(accessor, args) {
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const [uri, pos] = Array.isArray(args) && args || [undefined, undefined];
            if (uri_1.URI.isUri(uri) && position_1.Position.isIPosition(pos)) {
                return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then(editor => {
                    if (!editor) {
                        return;
                    }
                    editor.setPosition(pos);
                    editor.invokeWithinContext(accessor => {
                        this.reportTelemetry(accessor, editor);
                        return this.run(accessor, editor);
                    });
                }, errors_1.onUnexpectedError);
            }
            return super.runCommand(accessor, args);
        }
        run(accessor, editor) {
            const controller = RenameController.get(editor);
            if (controller) {
                return controller.run();
            }
            return Promise.resolve();
        }
    }
    exports.RenameAction = RenameAction;
    (0, editorExtensions_1.registerEditorContribution)(RenameController.ID, RenameController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorAction)(RenameAction);
    const RenameCommand = editorExtensions_1.EditorCommand.bindToContribution(RenameController.get);
    (0, editorExtensions_1.registerEditorCommand)(new RenameCommand({
        id: 'acceptRenameInput',
        precondition: renameInputField_1.CONTEXT_RENAME_INPUT_VISIBLE,
        handler: x => x.acceptRenameInput(false),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.not('isComposing')),
            primary: 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new RenameCommand({
        id: 'acceptRenameInputWithPreview',
        precondition: contextkey_1.ContextKeyExpr.and(renameInputField_1.CONTEXT_RENAME_INPUT_VISIBLE, contextkey_1.ContextKeyExpr.has('config.editor.rename.enablePreview')),
        handler: x => x.acceptRenameInput(true),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.not('isComposing')),
            primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new RenameCommand({
        id: 'cancelRenameInput',
        precondition: renameInputField_1.CONTEXT_RENAME_INPUT_VISIBLE,
        handler: x => x.cancelRenameInput(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    // ---- api bridge command
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeDocumentRenameProvider', function (accessor, model, position, ...args) {
        const [newName] = args;
        (0, types_1.assertType)(typeof newName === 'string');
        const { renameProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        return rename(renameProvider, model, position, newName);
    });
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executePrepareRename', async function (accessor, model, position) {
        const { renameProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const skeleton = new RenameSkeleton(model, position, renameProvider);
        const loc = await skeleton.resolveRenameLocation(cancellation_1.CancellationToken.None);
        if (loc?.rejectReason) {
            throw new Error(loc.rejectReason);
        }
        return loc;
    });
    //todo@jrieken use editor options world
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'editor',
        properties: {
            'editor.rename.enablePreview': {
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                description: nls.localize('enablePreview', "Enable/disable the ability to preview changes before renaming"),
                default: true,
                type: 'boolean'
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuYW1lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvcmVuYW1lL2Jyb3dzZXIvcmVuYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFvQ2hHLE1BQU0sY0FBYztRQUtuQixZQUNrQixLQUFpQixFQUNqQixRQUFrQixFQUNuQyxRQUFpRDtZQUZoQyxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQ2pCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFKNUIsdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1lBT3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsV0FBVztZQUNWLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxLQUFLLENBQUMscUJBQXFCLENBQUMsS0FBd0I7WUFFbkQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBRTdCLEtBQUssSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQzlHLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUU7b0JBQ3BDLE1BQU07aUJBQ047Z0JBQ0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuRixJQUFJLENBQUMs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