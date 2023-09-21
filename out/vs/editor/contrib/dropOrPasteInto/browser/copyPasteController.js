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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/platform", "vs/base/common/uuid", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/dnd", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/dropOrPasteInto/browser/edit", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/inlineProgress/browser/inlineProgress", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "./postEditWidget"], function (require, exports, dom_1, arrays_1, async_1, dataTransfer_1, lifecycle_1, mime_1, platform, uuid_1, textAreaInput_1, dnd_1, bulkEditService_1, range_1, languageFeatures_1, edit_1, editorState_1, inlineProgress_1, nls_1, clipboardService_1, contextkey_1, instantiation_1, progress_1, quickInput_1, postEditWidget_1) {
    "use strict";
    var CopyPasteController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CopyPasteController = exports.pasteWidgetVisibleCtx = exports.changePasteTypeCommandId = void 0;
    exports.changePasteTypeCommandId = 'editor.changePasteType';
    exports.pasteWidgetVisibleCtx = new contextkey_1.RawContextKey('pasteWidgetVisible', false, (0, nls_1.localize)('pasteWidgetVisible', "Whether the paste widget is showing"));
    const vscodeClipboardMime = 'application/vnd.code.copyMetadata';
    let CopyPasteController = class CopyPasteController extends lifecycle_1.Disposable {
        static { CopyPasteController_1 = this; }
        static { this.ID = 'editor.contrib.copyPasteActionController'; }
        static get(editor) {
            return editor.getContribution(CopyPasteController_1.ID);
        }
        constructor(editor, instantiationService, _bulkEditService, _clipboardService, _languageFeaturesService, _quickInputService, _progressService) {
            super();
            this._bulkEditService = _bulkEditService;
            this._clipboardService = _clipboardService;
            this._languageFeaturesService = _languageFeaturesService;
            this._quickInputService = _quickInputService;
            this._progressService = _progressService;
            this._editor = editor;
            const container = editor.getContainerDomNode();
            this._register((0, dom_1.addDisposableListener)(container, 'copy', e => this.handleCopy(e)));
            this._register((0, dom_1.addDisposableListener)(container, 'cut', e => this.handleCopy(e)));
            this._register((0, dom_1.addDisposableListener)(container, 'paste', e => this.handlePaste(e), true));
            this._pasteProgressManager = this._register(new inlineProgress_1.InlineProgressManager('pasteIntoEditor', editor, instantiationService));
            this._postPasteWidgetManager = this._register(instantiationService.createInstance(postEditWidget_1.PostEditWidgetManager, 'pasteIntoEditor', editor, exports.pasteWidgetVisibleCtx, { id: exports.changePasteTypeCommandId, label: (0, nls_1.localize)('postPasteWidgetTitle', "Show paste options...") }));
        }
        changePasteType() {
            this._postPasteWidgetManager.tryShowSelector();
        }
        pasteAs(preferredId) {
            this._editor.focus();
            try {
                this._pasteAsActionContext = { preferredId };
                (0, dom_1.getActiveDocument)().execCommand('paste');
            }
            finally {
                this._pasteAsActionContext = undefined;
            }
        }
        clearWidgets() {
            this._postPasteWidgetManager.clear();
        }
        isPasteAsEnabled() {
            return this._editor.getOption(84 /* EditorOption.pasteAs */).enabled
                && !this._editor.getOption(90 /* EditorOption.readOnly */);
        }
        handleCopy(e) {
            if (!this._editor.hasTextFocus()) {
                return;
            }
            if (platform.isWeb) {
                // Explicitly clear the web resources clipboard.
                // This is needed because on web, the browser clipboard is faked out using an in-memory store.
                // This means the resources clipboard is not properly updated when copying from the editor.
                this._clipboardService.writeResources([]);
            }
            if (!e.clipboardData || !this.isPasteAsEnabled()) {
                return;
            }
            const model = this._editor.getModel();
            const selections = this._editor.getSelections();
            if (!model || !selections?.length) {
                return;
            }
            const enableEmptySelectionClipboard = this._editor.getOption(37 /* EditorOption.emptySelectionClipboard */);
            let ranges = selections;
            const wasFromEmptySelection = selections.length === 1 && selections[0].isEmpty();
            if (wasFromEmptySelection) {
                if (!enableEmptySelectionClipboard) {
                    return;
                }
                ranges = [new range_1.Range(ranges[0].startLineNumber, 1, ranges[0].startLineNumber, 1 + model.getLineLength(ranges[0].startLineNumber))];
            }
            const toCopy = this._editor._getViewModel()?.getPlainTextToCopy(selections, enableEmptySelectionClipboard, platform.isWindows);
            const multicursorText = Array.isArray(toCopy) ? toCopy : null;
            const defaultPastePayload = {
                multicursorText,
                pasteOnNewLine: wasFromEmptySelection,
                mode: null
            };
            const providers = this._languageFeaturesService.documentPasteEditProvider
                .ordered(model)
                .filter(x => !!x.prepareDocumentPaste);
            if (!providers.length) {
                this.setCopyMetadata(e.clipboardData, { defaultPastePayload });
                return;
            }
            const dataTransfer = (0, dnd_1.toVSDataTransfer)(e.clipboardData);
            const providerCopyMimeTypes = providers.flatMap(x => x.copyMimeTypes ?? []);
            // Save off a handle pointing to data that VS Code maintains.
            const handle = (0, uuid_1.generateUuid)();
            this.setCopyMetadata(e.clipboardData, {
                id: handle,
                providerCopyMimeTypes,
                defaultPastePayload
            });
            const promise = (0, async_1.createCancelablePromise)(async (token) => {
                const results = (0, arrays_1.coalesce)(await Promise.all(providers.map(async (provider) => {
                    try {
                        return await provider.prepareDocumentPaste(model, ranges, dataTransfer, token);
                    }
                    catch (err) {
                        console.error(err);
                        return undefined;
                    }
                })));
                // Values from higher priority providers should overwrite values from lower priority ones.
                // Reverse the array to so that the calls to `replace` below will do this
                results.reverse();
                for (const result of results) {
                    for (const [mime, value] of result) {
                        dataTransfer.replace(mime, value);
                    }
                }
                return dataTransfer;
            });
            this._currentCopyOperation?.dataTransferPromise.cancel();
            this._currentCopyOperation = { handle: handle, dataTransferPromise: promise };
        }
        async handlePaste(e) {
            if (!e.clipboardData || !this._editor.hasTextFocus()) {
                return;
            }
            this._currentPasteOperation?.cancel();
            this._currentPasteOperation = undefined;
            const model = this._editor.getModel();
            const selections = this._editor.getSelections();
            if (!selections?.length || !model) {
                return;
            }
            if (!this.isPasteAsEnabled()) {
                return;
            }
            const metadata = this.fetchCopyMetadata(e);
            const dataTransfer = (0, dnd_1.toExternalVSDataTransfer)(e.clipboardData);
            dataTransfer.delete(vscodeClipboardMime);
            const allPotentialMimeTypes = [
                ...e.clipboardData.types,
                ...metadata?.providerCopyMimeTypes ?? [],
                // TODO: always adds `uri-list` because this get set if there are resources in the system clipboard.
                // However we can only check the system clipboard async. For this early check, just add it in.
                // We filter providers again once we have the final dataTransfer we will use.
                mime_1.Mimes.uriList,
            ];
            const allProviders = this._languageFeaturesService.documentPasteEditProvider
                .ordered(model)
                .filter(provider => provider.pasteMimeTypes?.some(type => (0, dataTransfer_1.matchesMimeType)(type, allPotentialMimeTypes)));
            if (!allProviders.length) {
                return;
            }
            // Prevent the editor's default paste handler from running.
            // Note that after this point, we are fully responsible for handling paste.
            // If we can't provider a paste for any reason, we need to explicitly delegate pasting back to the editor.
            e.preventDefault();
            e.stopImmediatePropagation();
            if (this._pasteAsActionContext) {
                this.showPasteAsPick(this._pasteAsActionContext.preferredId, allProviders, selections, dataTransfer, metadata);
            }
            else {
                this.doPasteInline(allProviders, selections, dataTransfer, metadata);
            }
        }
        doPasteInline(allProviders, selections, dataTransfer, metadata) {
            const p = (0, async_1.createCancelablePromise)(async (token) => {
                const editor = this._editor;
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                const tokenSource = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */, undefined, token);
                try {
                    await this.mergeInDataFromCopy(dataTransfer, metadata, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // Filter out any providers the don't match the full data transfer we will send them.
                    const supportedProviders = allProviders.filter(provider => isSupportedPasteProvider(provider, dataTransfer));
                    if (!supportedProviders.length
                        || (supportedProviders.length === 1 && supportedProviders[0].id === 'text') // Only our default text provider is active
                    ) {
                        await this.applyDefaultPasteHandler(dataTransfer, metadata, tokenSource.token);
                        return;
                    }
                    const providerEdits = await this.getPasteEdits(supportedProviders, dataTransfer, model, selections, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // If the only edit returned is a text edit, use the default paste handler
                    if (providerEdits.length === 1 && providerEdits[0].providerId === 'text') {
                        await this.applyDefaultPasteHandler(dataTransfer, metadata, tokenSource.token);
                        return;
                    }
                    if (providerEdits.length) {
                        const canShowWidget = editor.getOption(84 /* EditorOption.pasteAs */).showPasteSelector === 'afterPaste';
                        return this._postPasteWidgetManager.applyEditAndShowIfNeeded(selections, { activeEditIndex: 0, allEdits: providerEdits }, canShowWidget, tokenSource.token);
                    }
                    await this.applyDefaultPasteHandler(dataTransfer, metadata, tokenSource.token);
                }
                finally {
                    tokenSource.dispose();
                    if (this._currentPasteOperation === p) {
                        this._currentPasteOperation = undefined;
                    }
                }
            });
            this._pasteProgressManager.showWhile(selections[0].getEndPosition(), (0, nls_1.localize)('pasteIntoEditorProgress', "Running paste handlers. Click to cancel"), p);
            this._currentPasteOperation = p;
        }
        showPasteAsPick(preferredId, allProviders, selections, dataTransfer, metadata) {
            const p = (0, async_1.createCancelablePromise)(async (token) => {
                const editor = this._editor;
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                const tokenSource = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */, undefined, token);
                try {
                    await this.mergeInDataFromCopy(dataTransfer, metadata, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // Filter out any providers the don't match the full data transfer we will send them.
                    let supportedProviders = allProviders.filter(provider => isSupportedPasteProvider(provider, dataTransfer));
                    if (preferredId) {
                        // We are looking for a specific edit
                        supportedProviders = supportedProviders.filter(edit => edit.id === preferredId);
                    }
                    const providerEdits = await this.getPasteEdits(supportedProviders, dataTransfer, model, selections, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    if (!providerEdits.length) {
                        return;
                    }
                    let pickedEdit;
                    if (preferredId) {
                        pickedEdit = providerEdits.at(0);
                    }
                    else {
                        const selected = await this._quickInputService.pick(providerEdits.map((edit) => ({
                            label: edit.label,
                            description: edit.providerId,
                            detail: edit.detail,
                            edit,
                        })), {
                            placeHolder: (0, nls_1.localize)('pasteAsPickerPlaceholder', "Select Paste Action"),
                        });
                        pickedEdit = selected?.edit;
                    }
                    if (!pickedEdit) {
                        return;
                    }
                    const combinedWorkspaceEdit = (0, edit_1.createCombinedWorkspaceEdit)(model.uri, selections, pickedEdit);
                    await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor });
                }
                finally {
                    tokenSource.dispose();
                    if (this._currentPasteOperation === p) {
                        this._currentPasteOperation = undefined;
                    }
                }
            });
            this._progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)('pasteAsProgress', "Running paste handlers"),
            }, () => p);
        }
        setCopyMetadata(dataTransfer, metadata) {
            dataTransfer.setData(vscodeClipboardMime, JSON.stringify(metadata));
        }
        fetchCopyMetadata(e) {
            if (!e.clipboardData) {
                return;
            }
            // Prefer using the clipboard data we saved off
            const rawMetadata = e.clipboardData.getData(vscodeClipboardMime);
            if (rawMetadata) {
                try {
                    return JSON.parse(rawMetadata);
                }
                catch {
                    return undefined;
                }
            }
            // Otherwise try to extract the generic text editor metadata
            const [_, metadata] = textAreaInput_1.ClipboardEventUtils.getTextData(e.clipboardData);
            if (metadata) {
                return {
                    defaultPastePayload: {
                        mode: metadata.mode,
                        multicursorText: metadata.multicursorText ?? null,
                        pasteOnNewLine: !!metadata.isFromEmptySelection,
                    },
                };
            }
            return undefined;
        }
        async mergeInDataFromCopy(dataTransfer, metadata, token) {
            if (metadata?.id && this._currentCopyOperation?.handle === metadata.id) {
                const toMergeDataTransfer = await this._currentCopyOperation.dataTransferPromise;
                if (token.isCancellationRequested) {
                    return;
                }
                for (const [key, value] of toMergeDataTransfer) {
                    dataTransfer.replace(key, value);
                }
            }
            if (!dataTransfer.has(mime_1.Mimes.uriList)) {
                const resources = await this._clipboardService.readResources();
                if (token.isCancellationRequested) {
                    return;
                }
                if (resources.length) {
                    dataTransfer.append(mime_1.Mimes.uriList, (0, dataTransfer_1.createStringDataTransferItem)(dataTransfer_1.UriList.create(resources)));
                }
            }
        }
        async getPasteEdits(providers, dataTransfer, model, selections, token) {
            const results = await (0, async_1.raceCancellation)(Promise.all(providers.map(async (provider) => {
                try {
                    const edit = await provider.provideDocumentPasteEdits?.(model, selections, dataTransfer, token);
                    if (edit) {
                        return { ...edit, providerId: provider.id };
                    }
                }
                catch (err) {
                    console.error(err);
                }
                return undefined;
            })), token);
            const edits = (0, arrays_1.coalesce)(results ?? []);
            (0, edit_1.sortEditsByYieldTo)(edits);
            return edits;
        }
        async applyDefaultPasteHandler(dataTransfer, metadata, token) {
            const textDataTransfer = dataTransfer.get(mime_1.Mimes.text) ?? dataTransfer.get('text');
            if (!textDataTransfer) {
                return;
            }
            const text = await textDataTransfer.asString();
            if (token.isCancellationRequested) {
                return;
            }
            const payload = {
                text,
                pasteOnNewLine: metadata?.defaultPastePayload.pasteOnNewLine ?? false,
                multicursorText: metadata?.defaultPastePayload.multicursorText ?? null,
                mode: null,
            };
            this._editor.trigger('keyboard', "paste" /* Handler.Paste */, payload);
        }
    };
    exports.CopyPasteController = CopyPasteController;
    exports.CopyPasteController = CopyPasteController = CopyPasteController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, bulkEditService_1.IBulkEditService),
        __param(3, clipboardService_1.IClipboardService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, progress_1.IProgressService)
    ], CopyPasteController);
    function isSupportedPasteProvider(provider, dataTransfer) {
        return Boolean(provider.pasteMimeTypes?.some(type => dataTransfer.matches(type)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weVBhc3RlQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2Ryb3BPclBhc3RlSW50by9icm93c2VyL2NvcHlQYXN0ZUNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWlDbkYsUUFBQSx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztJQUVwRCxRQUFBLHFCQUFxQixHQUFHLElBQUksMEJBQWEsQ0FBVSxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUscUNBQXFDLENBQUMsQ0FBQyxDQUFDO0lBRXBLLE1BQU0sbUJBQW1CLEdBQUcsbUNBQW1DLENBQUM7SUFTekQsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTs7aUJBRTNCLE9BQUUsR0FBRywwQ0FBMEMsQUFBN0MsQ0FBOEM7UUFFaEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUNwQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQXNCLHFCQUFtQixDQUFDLEVBQUUsQ0FBRSxDQUFDO1FBQzdFLENBQUM7UUFlRCxZQUNDLE1BQW1CLEVBQ0ksb0JBQTJDLEVBQy9CLGdCQUFrQyxFQUNqQyxpQkFBb0MsRUFDN0Isd0JBQWtELEVBQ3hELGtCQUFzQyxFQUN4QyxnQkFBa0M7WUFFckUsS0FBSyxFQUFFLENBQUM7WUFOMkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNqQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQzdCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDeEQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUN4QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBSXJFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lB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