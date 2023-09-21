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
define(["require", "exports", "vs/base/common/event", "vs/base/common/path", "vs/base/common/resources", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/resolverService", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/editorInput", "vs/workbench/contrib/interactive/browser/interactiveDocumentService", "vs/workbench/contrib/interactive/browser/interactiveHistoryService", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, event_1, paths, resources_1, modesRegistry_1, resolverService_1, dialogs_1, instantiation_1, editorInput_1, interactiveDocumentService_1, interactiveHistoryService_1, notebookEditorInput_1, notebookService_1) {
    "use strict";
    var InteractiveEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InteractiveEditorInput = void 0;
    let InteractiveEditorInput = class InteractiveEditorInput extends editorInput_1.EditorInput {
        static { InteractiveEditorInput_1 = this; }
        static create(instantiationService, resource, inputResource, title, language) {
            return instantiationService.createInstance(InteractiveEditorInput_1, resource, inputResource, title, language);
        }
        static { this.windowNames = {}; }
        static setName(notebookUri, title) {
            if (title) {
                this.windowNames[notebookUri.path] = title;
            }
        }
        static { this.ID = 'workbench.input.interactive'; }
        get editorId() {
            return 'interactive';
        }
        get typeId() {
            return InteractiveEditorInput_1.ID;
        }
        get language() {
            return this._inputModelRef?.object.textEditorModel.getLanguageId() ?? this._initLanguage;
        }
        get notebookEditorInput() {
            return this._notebookEditorInput;
        }
        get editorInputs() {
            return [this._notebookEditorInput];
        }
        get resource() {
            return this._resource;
        }
        get inputResource() {
            return this._inputResource;
        }
        get primary() {
            return this._notebookEditorInput;
        }
        constructor(resource, inputResource, title, languageId, instantiationService, textModelService, interactiveDocumentService, historyService, _notebookService, _fileDialogService) {
            const input = notebookEditorInput_1.NotebookEditorInput.create(instantiationService, resource, 'interactive', {});
            super();
            this._notebookService = _notebookService;
            this._fileDialogService = _fileDialogService;
            this._notebookEditorInput = input;
            this._register(this._notebookEditorInput);
            this.name = title ?? InteractiveEditorInput_1.windowNames[resource.path] ?? paths.basename(resource.path, paths.extname(resource.path));
            this._initLanguage = languageId;
            this._resource = resource;
            this._inputResource = inputResource;
            this._inputResolver = null;
            this._editorModelReference = null;
            this._inputModelRef = null;
            this._textModelService = textModelService;
            this._interactiveDocumentService = interactiveDocumentService;
            this._historyService = historyService;
            this._registerListeners();
        }
        _registerListeners() {
            const oncePrimaryDisposed = event_1.Event.once(this.primary.onWillDispose);
            this._register(oncePrimaryDisposed(() => {
                if (!this.isDisposed()) {
                    this.dispose();
                }
            }));
            // Re-emit some events from the primary side to the outside
            this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
            // Re-emit some events from both sides to the outside
            this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
        }
        get capabilities() {
            return 4 /* EditorInputCapabilities.Untitled */
                | 2 /* EditorInputCapabilities.Readonly */
                | 512 /* EditorInputCapabilities.Scratchpad */;
        }
        async _resolveEditorModel() {
            if (!this._editorModelReference) {
                this._editorModelReference = await this._notebookEditorInput.resolve();
            }
            return this._editorModelReference;
        }
        async resolve() {
            if (this._editorModelReference) {
                return this._editorModelReference;
            }
            if (this._inputResolver) {
                return this._inputResolver;
            }
            this._inputResolver = this._resolveEditorModel();
            return this._inputResolver;
        }
        async resolveInput(language) {
            if (this._inputModelRef) {
                return this._inputModelRef.object.textEditorModel;
            }
            const resolvedLanguage = language ?? this._initLanguage ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            this._interactiveDocumentService.willCreateInteractiveDocument(this.resource, this.inputResource, resolvedLanguage);
            this._inputModelRef = await this._textModelService.createModelReference(this.inputResource);
            return this._inputModelRef.object.textEditorModel;
        }
        async save(group, options) {
            if (this._editorModelReference) {
                if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    return this.saveAs(group, options);
                }
                else {
                    await this._editorModelReference.save(options);
                }
                return this;
            }
            return undefined;
        }
        async saveAs(group, options) {
            if (!this._editorModelReference) {
                return undefined;
            }
            const provider = this._notebookService.getContributedNotebookType('interactive');
            if (!provider) {
                return undefined;
            }
            const filename = this.getName() + '.ipynb';
            const pathCandidate = (0, resources_1.joinPath)(await this._fileDialogService.defaultFilePath(), filename);
            const target = await this._fileDialogService.pickFileToSave(pathCandidate, options?.availableFileSystems);
            if (!target) {
                return undefined; // save cancelled
            }
            return await this._editorModelReference.saveAs(target);
        }
        matches(otherInput) {
            if (super.matches(otherInput)) {
                return true;
            }
            if (otherInput instanceof InteractiveEditorInput_1) {
                return (0, resources_1.isEqual)(this.resource, otherInput.resource) && (0, resources_1.isEqual)(this.inputResource, otherInput.inputResource);
            }
            return false;
        }
        getName() {
            return this.name;
        }
        isModified() {
            return this._editorModelReference?.isModified() ?? false;
        }
        dispose() {
            // we support closing the interactive window without prompt, so the editor model should not be dirty
            this._editorModelReference?.revert({ soft: true });
            this._notebookEditorInput?.dispose();
            this._editorModelReference?.dispose();
            this._editorModelReference = null;
            this._interactiveDocumentService.willRemoveInteractiveDocument(this.resource, this.inputResource);
            this._inputModelRef?.dispose();
            this._inputModelRef = null;
            super.dispose();
        }
        get historyService() {
            return this._historyService;
        }
    };
    exports.InteractiveEditorInput = InteractiveEditorInput;
    exports.InteractiveEditorInput = InteractiveEditorInput = InteractiveEditorInput_1 = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, resolverService_1.ITextModelService),
        __param(6, interactiveDocumentService_1.IInteractiveDocumentService),
        __param(7, interactiveHistoryService_1.IInteractiveHistoryService),
        __param(8, notebookService_1.INotebookService),
        __param(9, dialogs_1.IFileDialogService)
    ], InteractiveEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmVFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ludGVyYWN0aXZlL2Jyb3dzZXIvaW50ZXJhY3RpdmVFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHlCQUFXOztRQUN0RCxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUEyQyxFQUFFLFFBQWEsRUFBRSxhQUFrQixFQUFFLEtBQWMsRUFBRSxRQUFpQjtZQUM5SCxPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx3QkFBc0IsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM5RyxDQUFDO2lCQUVjLGdCQUFXLEdBQTJCLEVBQUUsQUFBN0IsQ0FBOEI7UUFFeEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFnQixFQUFFLEtBQXlCO1lBQ3pELElBQUksS0FBSyxFQUFFO2dCQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUMzQztRQUNGLENBQUM7aUJBRWUsT0FBRSxHQUFXLDZCQUE2QixBQUF4QyxDQUF5QztRQUUzRCxJQUFvQixRQUFRO1lBQzNCLE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFhLE1BQU07WUFDbEIsT0FBTyx3QkFBc0IsQ0FBQyxFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUlELElBQUksUUFBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDMUYsQ0FBQztRQUlELElBQUksbUJBQW1CO1lB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