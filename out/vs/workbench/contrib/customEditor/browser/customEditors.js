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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/customEditorModelManager", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/editor/common/editorService", "../common/contributedCustomEditors", "./customEditorInput", "vs/css!./media/customEditor"], function (require, exports, arrays_1, event_1, lifecycle_1, network_1, resources_1, types_1, uri_1, editorExtensions_1, contextkey_1, files_1, instantiation_1, platform_1, storage_1, uriIdentity_1, editor_1, diffEditorInput_1, customEditor_1, customEditorModelManager_1, editorGroupsService_1, editorResolverService_1, editorService_1, contributedCustomEditors_1, customEditorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEditorService = void 0;
    let CustomEditorService = class CustomEditorService extends lifecycle_1.Disposable {
        constructor(contextKeyService, fileService, storageService, editorService, editorGroupService, instantiationService, uriIdentityService, editorResolverService) {
            super();
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            this.editorResolverService = editorResolverService;
            this._untitledCounter = 0;
            this._editorResolverDisposables = this._register(new lifecycle_1.DisposableStore());
            this._editorCapabilities = new Map();
            this._models = new customEditorModelManager_1.CustomEditorModelManager();
            this._onDidChangeEditorTypes = this._register(new event_1.Emitter());
            this.onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
            this._fileEditorFactory = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).getFileEditorFactory();
            this._activeCustomEditorId = customEditor_1.CONTEXT_ACTIVE_CUSTOM_EDITOR_ID.bindTo(contextKeyService);
            this._focusedCustomEditorIsEditable = customEditor_1.CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE.bindTo(contextKeyService);
            this._contributedEditors = this._register(new contributedCustomEditors_1.ContributedCustomEditors(storageService));
            // Register the contribution points only emitting one change from the resolver
            this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
            this._register(this._contributedEditors.onChange(() => {
                // Register the contribution points only emitting one change from the resolver
                this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
                this.updateContexts();
                this._onDidChangeEditorTypes.fire();
            }));
            this._register(this.editorService.onDidActiveEditorChange(() => this.updateContexts()));
            this._register(fileService.onDidRunOperation(e => {
                if (e.isOperation(2 /* FileOperation.MOVE */)) {
                    this.handleMovedFileInOpenedFileEditors(e.resource, this.uriIdentityService.asCanonicalUri(e.target.resource));
                }
            }));
            const PRIORITY = 105;
            this._register(editorExtensions_1.UndoCommand.addImplementation(PRIORITY, 'custom-editor', () => {
                return this.withActiveCustomEditor(editor => editor.undo());
            }));
            this._register(editorExtensions_1.RedoCommand.addImplementation(PRIORITY, 'custom-editor', () => {
                return this.withActiveCustomEditor(editor => editor.redo());
            }));
            this.updateContexts();
        }
        getEditorTypes() {
            return [...this._contributedEditors];
        }
        withActiveCustomEditor(f) {
            const activeEditor = this.editorService.activeEditor;
            if (activeEditor instanceof customEditorInput_1.CustomEditorInput) {
                const result = f(activeEditor);
                if (result) {
                    return result;
                }
                return true;
            }
            return false;
        }
        registerContributionPoints() {
            // Clear all previous contributions we know
            this._editorResolverDisposables.clear();
            for (const contributedEditor of this._contributedEditors) {
                for (const globPattern of contributedEditor.selector) {
                    if (!globPattern.filenamePattern) {
                        continue;
                    }
                    this._editorResolverDisposables.add(this.editorResolverService.registerEditor(globPattern.filenamePattern, {
                        id: contributedEditor.id,
                        label: contributedEditor.displayName,
                        detail: contributedEditor.providerDisplayName,
                        priority: contributedEditor.priority,
                    }, {
                        singlePerResource: () => !this.getCustomEditorCapabilities(contributedEditor.id)?.supportsMultipleEditorsPerDocument ?? true
                    }, {
                        createEditorInput: ({ resource }, group) => {
                            return { editor: customEditorInput_1.CustomEditorInput.create(this.instantiationService, resource, contributedEditor.id, group.id) };
                        },
                        createUntitledEditorInput: ({ resource }, group) => {
                            return { editor: customEditorInput_1.CustomEditorInput.create(this.instantiationService, resource ?? uri_1.URI.from({ scheme: network_1.Schemas.untitled, authority: `Untitled-${this._untitledCounter++}` }), contributedEditor.id, group.id) };
                        },
                        createDiffEditorInput: (diffEditorInput, group) => {
                            return { editor: this.createDiffEditorInput(diffEditorInput, contributedEditor.id, group) };
                        },
                    }));
                }
            }
        }
        createDiffEditorInput(editor, editorID, group) {
            const modifiedOverride = customEditorInput_1.CustomEditorInput.create(this.instantiationService, (0, types_1.assertIsDefined)(editor.modified.resource), editorID, group.id, { customClasses: 'modified' });
            const originalOverride = customEditorInput_1.CustomEditorInput.create(this.instantiationService, (0, types_1.assertIsDefined)(editor.original.resource), editorID, group.id, { customClasses: 'original' });
            return this.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, editor.label, editor.description, originalOverride, modifiedOverride, true);
        }
        get models() { return this._models; }
        getCustomEditor(viewType) {
            return this._contributedEditors.get(viewType);
        }
        getContributedCustomEditors(resource) {
            return new customEditor_1.CustomEditorInfoCollection(this._contributedEditors.getContributedEditors(resource));
        }
        getUserConfiguredCustomEditors(resource) {
            const resourceAssocations = this.editorResolverService.getAssociationsForResource(resource);
            return new customEditor_1.CustomEditorInfoCollection((0, arrays_1.coalesce)(resourceAssocations
                .map(association => this._contributedEditors.get(association.viewType))));
        }
        getAllCustomEditors(resource) {
            return new customEditor_1.CustomEditorInfoCollection([
                ...this.getUserConfiguredCustomEditors(resource).allEditors,
                ...this.getContributedCustomEditors(resource).allEditors,
            ]);
        }
        registerCustomEditorCapabilities(viewType, options) {
            if (this._editorCapabilities.has(viewType)) {
                throw new Error(`Capabilities for ${viewType} already set`);
            }
            this._editorCapabilities.set(viewType, options);
            return (0, lifecycle_1.toDisposable)(() => {
                this._editorCapabilities.delete(viewType);
            });
        }
        getCustomEditorCapabilities(viewType) {
            return this._editorCapabilities.get(viewType);
        }
        updateContexts() {
            const activeEditorPane = this.editorService.activeEditorPane;
            const resource = activeEditorPane?.input?.resource;
            if (!resource) {
                this._activeCustomEditorId.reset();
                this._focusedCustomEditorIsEditable.reset();
                return;
            }
            this._activeCustomEditorId.set(activeEditorPane?.input instanceof customEditorInput_1.CustomEditorInput ? activeEditorPane.input.viewType : '');
            this._focusedCustomEditorIsEditable.set(activeEditorPane?.input instanceof customEditorInput_1.CustomEditorInput);
        }
        async handleMovedFileInOpenedFileEditors(oldResource, newResource) {
            if ((0, resources_1.extname)(oldResource).toLowerCase() === (0, resources_1.extname)(newResource).toLowerCase()) {
                return;
            }
            const possibleEditors = this.getAllCustomEditors(newResource);
            // See if we have any non-optional custom editor for this resource
            if (!possibleEditors.allEditors.some(editor => editor.priority !== editorResolverService_1.RegisteredEditorPriority.option)) {
                return;
            }
            // If so, check all editors to see if there are any file editors open for the new resource
            const editorsToReplace = new Map();
            for (const group of this.editorGroupService.groups) {
                for (const editor of group.editors) {
                    if (this._fileEditorFactory.isFileEditor(editor)
                        && !(editor instanceof customEditorInput_1.CustomEditorInput)
                        && (0, resources_1.isEqual)(editor.resource, newResource)) {
                        let entry = editorsToReplace.get(group.id);
                        if (!entry) {
                            entry = [];
                            editorsToReplace.set(group.id, entry);
                        }
                        entry.push(editor);
                    }
                }
            }
            if (!editorsToReplace.size) {
                return;
            }
            for (const [group, entries] of editorsToReplace) {
                this.editorService.replaceEditors(entries.map(editor => {
                    let replacement;
                    if (possibleEditors.defaultEditor) {
                        const viewType = possibleEditors.defaultEditor.id;
                        replacement = customEditorInput_1.CustomEditorInput.create(this.instantiationService, newResource, viewType, group);
                    }
                    else {
                        replacement = { resource: newResource, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } };
                    }
                    return {
                        editor,
                        replacement,
                        options: {
                            preserveFocus: true,
                        }
                    };
                }), group);
            }
        }
    };
    exports.CustomEditorService = CustomEditorService;
    exports.CustomEditorService = CustomEditorService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, files_1.IFileService),
        __param(2, storage_1.IStorageService),
        __param(3, editorService_1.IEditorService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, editorResolverService_1.IEditorResolverService)
    ], CustomEditorService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tRWRpdG9ycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2N1c3RvbUVkaXRvci9icm93c2VyL2N1c3RvbUVkaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkJ6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBa0JsRCxZQUNxQixpQkFBcUMsRUFDM0MsV0FBeUIsRUFDdEIsY0FBK0IsRUFDaEMsYUFBOEMsRUFDeEMsa0JBQXlELEVBQ3hELG9CQUE0RCxFQUM5RCxrQkFBd0QsRUFDckQscUJBQThEO1lBRXRGLEtBQUssRUFBRSxDQUFDO1lBTnlCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXNCO1lBQ3ZDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNwQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBdEIvRSxxQkFBZ0IsR0FBRyxDQUFDLENBQUM7WUFDWiwrQkFBMEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFDbkUsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7WUFFbEUsWUFBTyxHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUt6Qyw0QkFBdUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMvRCwyQkFBc0IsR0FBZ0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQUV4RSx1QkFBa0IsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIseUJBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsb0JBQW9CLEVB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