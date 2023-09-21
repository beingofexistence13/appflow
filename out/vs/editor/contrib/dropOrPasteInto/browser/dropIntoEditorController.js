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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/editor/browser/dnd", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/treeViewsDnd", "vs/editor/common/services/treeViewsDndService", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/inlineProgress/browser/inlineProgress", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dnd/browser/dnd", "vs/platform/instantiation/common/instantiation", "./edit", "./postEditWidget"], function (require, exports, arrays_1, async_1, dataTransfer_1, lifecycle_1, dnd_1, range_1, languageFeatures_1, treeViewsDnd_1, treeViewsDndService_1, editorState_1, inlineProgress_1, nls_1, configuration_1, contextkey_1, dnd_2, instantiation_1, edit_1, postEditWidget_1) {
    "use strict";
    var DropIntoEditorController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DropIntoEditorController = exports.dropWidgetVisibleCtx = exports.changeDropTypeCommandId = exports.defaultProviderConfig = void 0;
    exports.defaultProviderConfig = 'editor.experimental.dropIntoEditor.defaultProvider';
    exports.changeDropTypeCommandId = 'editor.changeDropType';
    exports.dropWidgetVisibleCtx = new contextkey_1.RawContextKey('dropWidgetVisible', false, (0, nls_1.localize)('dropWidgetVisible', "Whether the drop widget is showing"));
    let DropIntoEditorController = class DropIntoEditorController extends lifecycle_1.Disposable {
        static { DropIntoEditorController_1 = this; }
        static { this.ID = 'editor.contrib.dropIntoEditorController'; }
        static get(editor) {
            return editor.getContribution(DropIntoEditorController_1.ID);
        }
        constructor(editor, instantiationService, _configService, _languageFeaturesService, _treeViewsDragAndDropService) {
            super();
            this._configService = _configService;
            this._languageFeaturesService = _languageFeaturesService;
            this._treeViewsDragAndDropService = _treeViewsDragAndDropService;
            this.treeItemsTransfer = dnd_2.LocalSelectionTransfer.getInstance();
            this._dropProgressManager = this._register(instantiationService.createInstance(inlineProgress_1.InlineProgressManager, 'dropIntoEditor', editor));
            this._postDropWidgetManager = this._register(instantiationService.createInstance(postEditWidget_1.PostEditWidgetManager, 'dropIntoEditor', editor, exports.dropWidgetVisibleCtx, { id: exports.changeDropTypeCommandId, label: (0, nls_1.localize)('postDropWidgetTitle', "Show drop options...") }));
            this._register(editor.onDropIntoEditor(e => this.onDropIntoEditor(editor, e.position, e.event)));
        }
        clearWidgets() {
            this._postDropWidgetManager.clear();
        }
        changeDropType() {
            this._postDropWidgetManager.tryShowSelector();
        }
        async onDropIntoEditor(editor, position, dragEvent) {
            if (!dragEvent.dataTransfer || !editor.hasModel()) {
                return;
            }
            this._currentOperation?.cancel();
            editor.focus();
            editor.setPosition(position);
            const p = (0, async_1.createCancelablePromise)(async (token) => {
                const tokenSource = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */, undefined, token);
                try {
                    const ourDataTransfer = await this.extractDataTransferData(dragEvent);
                    if (ourDataTransfer.size === 0 || tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    const model = editor.getModel();
                    if (!model) {
                        return;
                    }
                    const providers = this._languageFeaturesService.documentOnDropEditProvider
                        .ordered(model)
                        .filter(provider => {
                        if (!provider.dropMimeTypes) {
                            // Keep all providers that don't specify mime types
                            return true;
                        }
                        return provider.dropMimeTypes.some(mime => ourDataTransfer.matches(mime));
                    });
                    const edits = await this.getDropEdits(providers, model, position, ourDataTransfer, tokenSource);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    if (edits.length) {
                        const activeEditIndex = this.getInitialActiveEditIndex(model, edits);
                        const canShowWidget = editor.getOption(36 /* EditorOption.dropIntoEditor */).showDropSelector === 'afterDrop';
                        // Pass in the parent token here as it tracks cancelling the entire drop operation
                        await this._postDropWidgetManager.applyEditAndShowIfNeeded([range_1.Range.fromPositions(position)], { activeEditIndex, allEdits: edits }, canShowWidget, token);
                    }
                }
                finally {
                    tokenSource.dispose();
                    if (this._currentOperation === p) {
                        this._currentOperation = undefined;
                    }
                }
            });
            this._dropProgressManager.showWhile(position, (0, nls_1.localize)('dropIntoEditorProgress', "Running drop handlers. Click to cancel"), p);
            this._currentOperation = p;
        }
        async getDropEdits(providers, model, position, dataTransfer, tokenSource) {
            const results = await (0, async_1.raceCancellation)(Promise.all(providers.map(async (provider) => {
                try {
                    const edit = await provider.provideDocumentOnDropEdits(model, position, dataTransfer, tokenSource.token);
                    if (edit) {
                        return { ...edit, providerId: provider.id };
                    }
                }
                catch (err) {
                    console.error(err);
                }
                return undefined;
            })), tokenSource.token);
            const edits = (0, arrays_1.coalesce)(results ?? []);
            return (0, edit_1.sortEditsByYieldTo)(edits);
        }
        getInitialActiveEditIndex(model, edits) {
            const preferredProviders = this._configService.getValue(exports.defaultProviderConfig, { resource: model.uri });
            for (const [configMime, desiredId] of Object.entries(preferredProviders)) {
                const editIndex = edits.findIndex(edit => desiredId === edit.providerId
                    && edit.handledMimeType && (0, dataTransfer_1.matchesMimeType)(configMime, [edit.handledMimeType]));
                if (editIndex >= 0) {
                    return editIndex;
                }
            }
            return 0;
        }
        async extractDataTransferData(dragEvent) {
            if (!dragEvent.dataTransfer) {
                return new dataTransfer_1.VSDataTransfer();
            }
            const dataTransfer = (0, dnd_1.toExternalVSDataTransfer)(dragEvent.dataTransfer);
            if (this.treeItemsTransfer.hasData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)) {
                const data = this.treeItemsTransfer.getData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
                if (Array.isArray(data)) {
                    for (const id of data) {
                        const treeDataTransfer = await this._treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
                        if (treeDataTransfer) {
                            for (const [type, value] of treeDataTransfer) {
                                dataTransfer.replace(type, value);
                            }
                        }
                    }
                }
            }
            return dataTransfer;
        }
    };
    exports.DropIntoEditorController = DropIntoEditorController;
    exports.DropIntoEditorController = DropIntoEditorController = DropIntoEditorController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, treeViewsDndService_1.ITreeViewsDnDService)
    ], DropIntoEditorController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcEludG9FZGl0b3JDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZHJvcE9yUGFzdGVJbnRvL2Jyb3dzZXIvZHJvcEludG9FZGl0b3JDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyQm5GLFFBQUEscUJBQXFCLEdBQUcsb0RBQW9ELENBQUM7SUFFN0UsUUFBQSx1QkFBdUIsR0FBRyx1QkFBdUIsQ0FBQztJQUVsRCxRQUFBLG9CQUFvQixHQUFHLElBQUksMEJBQWEsQ0FBVSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO0lBRXpKLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7O2lCQUVoQyxPQUFFLEdBQUcseUNBQXlDLEFBQTVDLENBQTZDO1FBRS9ELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDcEMsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUEyQiwwQkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBU0QsWUFDQyxNQUFtQixFQUNJLG9CQUEyQyxFQUMzQyxjQUFzRCxFQUNuRCx3QkFBbUUsRUFDdkUsNEJBQW1FO1lBRXpGLEtBQUssRUFBRSxDQUFDO1lBSmdDLG1CQUFjLEdBQWQsY0FBYyxDQUF1QjtZQUNsQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3RELGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBc0I7WUFQekUsc0JBQWlCLEdBQUcsNEJBQXNCLENBQUMsV0FBVyxFQUE4QixDQUFDO1lBV3JHLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxzQ0FBcUIs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