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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/dataTransfer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/dnd/browser/dnd", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/workspaces/common/workspaceEditing"], function (require, exports, dnd_1, dom_1, arrays_1, dataTransfer_1, event_1, lifecycle_1, marshalling_1, mime_1, network_1, platform_1, resources_1, uri_1, dnd_2, files_1, instantiation_1, label_1, opener_1, platform_2, workspace_1, workspaces_1, editor_1, editorService_1, host_1, textfiles_1, workspaceEditing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceListDnDHandler = exports.toggleDropEffect = exports.CompositeDragAndDropObserver = exports.DraggedViewIdentifier = exports.DraggedCompositeIdentifier = exports.CompositeDragAndDropData = exports.fillEditorsDragData = exports.ResourcesDropHandler = exports.extractTreeDropData = exports.DraggedEditorGroupIdentifier = exports.DraggedEditorIdentifier = void 0;
    //#region Editor / Resources DND
    class DraggedEditorIdentifier {
        constructor(identifier) {
            this.identifier = identifier;
        }
    }
    exports.DraggedEditorIdentifier = DraggedEditorIdentifier;
    class DraggedEditorGroupIdentifier {
        constructor(identifier) {
            this.identifier = identifier;
        }
    }
    exports.DraggedEditorGroupIdentifier = DraggedEditorGroupIdentifier;
    async function extractTreeDropData(dataTransfer) {
        const editors = [];
        const resourcesKey = mime_1.Mimes.uriList.toLowerCase();
        // Data Transfer: Resources
        if (dataTransfer.has(resourcesKey)) {
            try {
                const asString = await dataTransfer.get(resourcesKey)?.asString();
                const rawResourcesData = JSON.stringify(dataTransfer_1.UriList.parse(asString ?? ''));
                editors.push(...(0, dnd_2.createDraggedEditorInputFromRawResourcesData)(rawResourcesData));
            }
            catch (error) {
                // Invalid transfer
            }
        }
        return editors;
    }
    exports.extractTreeDropData = extractTreeDropData;
    /**
     * Shared function across some components to handle drag & drop of resources.
     * E.g. of folders and workspace files to open them in the window instead of
     * the editor or to handle dirty editors being dropped between instances of Code.
     */
    let ResourcesDropHandler = class ResourcesDropHandler {
        constructor(options, fileService, workspacesService, editorService, workspaceEditingService, hostService, contextService, instantiationService) {
            this.options = options;
            this.fileService = fileService;
            this.workspacesService = workspacesService;
            this.editorService = editorService;
            this.workspaceEditingService = workspaceEditingService;
            this.hostService = hostService;
            this.contextService = contextService;
            this.instantiationService = instantiationService;
        }
        async handleDrop(event, resolveTargetGroup, afterDrop, targetIndex) {
            const editors = await this.instantiationService.invokeFunction(accessor => (0, dnd_2.extractEditorsAndFilesDropData)(accessor, event));
            if (!editors.length) {
                return;
            }
            // Make the window active to handle the drop properly within
            await this.hostService.focus();
            // Check for workspace file / folder being dropped if we are allowed to do so
            if (this.options.allowWorkspaceOpen) {
                const localFilesAllowedToOpenAsWorkspace = (0, arrays_1.coalesce)(editors.filter(editor => editor.allowWorkspaceOpen && editor.resource?.scheme === network_1.Schemas.file).map(editor => editor.resource));
                if (localFilesAllowedToOpenAsWorkspace.length > 0) {
                    const isWorkspaceOpening = await this.handleWorkspaceDrop(localFilesAllowedToOpenAsWorkspace);
                    if (isWorkspaceOpening) {
                        return; // return early if the drop operation resulted in this window changing to a workspace
                    }
                }
            }
            // Add external ones to recently open list unless dropped resource is a workspace
            const externalLocalFiles = (0, arrays_1.coalesce)(editors.filter(editor => editor.isExternal && editor.resource?.scheme === network_1.Schemas.file).map(editor => editor.resource));
            if (externalLocalFiles.length) {
                this.workspacesService.addRecentlyOpened(externalLocalFiles.map(resource => ({ fileUri: resource })));
            }
            // Open in Editor
            const targetGroup = resolveTargetGroup();
            await this.editorService.openEditors(editors.map(editor => ({
                ...editor,
                resource: editor.resource,
                options: {
                    ...editor.options,
                    pinned: true,
                    index: targetIndex
                }
            })), targetGroup, { validateTrust: true });
            // Finish with provided function
            afterDrop(targetGroup);
        }
        async handleWorkspaceDrop(resources) {
            const toOpen = [];
            const folderURIs = [];
            await Promise.all(resources.map(async (resource) => {
                // Check for Workspace
                if ((0, workspace_1.hasWorkspaceFileExtension)(resource)) {
                    toOpen.push({ workspaceUri: resource });
                    return;
                }
                // Check for Folder
                try {
                    const stat = await this.fileService.stat(resource);
                    if (stat.isDirectory) {
                        toOpen.push({ folderUri: stat.resource });
                        folderURIs.push({ uri: stat.resource });
                    }
                }
                catch (error) {
                    // Ignore error
                }
            }));
            // Return early if no external resource is a folder or workspace
            if (toOpen.length === 0) {
                return false;
            }
            // Pass focus to window
            this.hostService.focus();
            // Open in separate windows if we drop workspaces or just one folder
            if (toOpen.length > folderURIs.length || folderURIs.length === 1) {
                await this.hostService.openWindow(toOpen);
            }
            // Add to workspace if we are in a temporary workspace
            else if ((0, workspace_1.isTemporaryWorkspace)(this.contextService.getWorkspace())) {
                await this.workspaceEditingService.addFolders(folderURIs);
            }
            // Finally, enter untitled workspace when dropping >1 folders
            else {
                await this.workspaceEditingService.createAndEnterWorkspace(folderURIs);
            }
            return true;
        }
    };
    exports.ResourcesDropHandler = ResourcesDropHandler;
    exports.ResourcesDropHandler = ResourcesDropHandler = __decorate([
        __param(1, files_1.IFileService),
        __param(2, workspaces_1.IWorkspacesService),
        __param(3, editorService_1.IEditorService),
        __param(4, workspaceEditing_1.IWorkspaceEditingService),
        __param(5, host_1.IHostService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, instantiation_1.IInstantiationService)
    ], ResourcesDropHandler);
    function fillEditorsDragData(accessor, resourcesOrEditors, event) {
        if (resourcesOrEditors.length === 0 || !event.dataTransfer) {
            return;
        }
        const textFileService = accessor.get(textfiles_1.ITextFileService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const fileService = accessor.get(files_1.IFileService);
        const labelService = accessor.get(label_1.ILabelService);
        // Extract resources from URIs or Editors that
        // can be handled by the file service
        const resources = (0, arrays_1.coalesce)(resourcesOrEditors.map(resourceOrEditor => {
            if (uri_1.URI.isUri(resourceOrEditor)) {
                return { resource: resourceOrEditor };
            }
            if ((0, editor_1.isEditorIdentifier)(resourceOrEditor)) {
                if (uri_1.URI.isUri(resourceOrEditor.editor.resource)) {
                    return { resource: resourceOrEditor.editor.resource };
                }
                return undefined; // editor without resource
            }
            return resourceOrEditor;
        }));
        const fileSystemResources = resources.filter(({ resource }) => fileService.hasProvider(resource));
        // Text: allows to paste into text-capable areas
        const lineDelimiter = platform_1.isWindows ? '\r\n' : '\n';
        event.dataTransfer.setData(dnd_1.DataTransfers.TEXT, fileSystemResources.map(({ resource }) => labelService.getUriLabel(resource, { noPrefix: true })).join(lineDelimiter));
        // Download URL: enables support to drag a tab as file to desktop
        // Requirements:
        // - Chrome/Edge only
        // - only a single file is supported
        // - only file:/ resources are supported
        const firstFile = fileSystemResources.find(({ isDirectory }) => !isDirectory);
        if (firstFile) {
            const firstFileUri = network_1.FileAccess.uriToFileUri(firstFile.resource); // enforce `file:` URIs
            if (firstFileUri.scheme === network_1.Schemas.file) {
                event.dataTransfer.setData(dnd_1.DataTransfers.DOWNLOAD_URL, [mime_1.Mimes.binary, (0, resources_1.basename)(firstFile.resource), firstFileUri.toString()].join(':'));
            }
        }
        // Resource URLs: allows to drop multiple file resources to a target in VS Code
        const files = fileSystemResources.filter(({ isDirectory }) => !isDirectory);
        if (files.length) {
            event.dataTransfer.setData(dnd_1.DataTransfers.RESOURCES, JSON.stringify(files.map(({ resource }) => resource.toString())));
        }
        // Contributions
        const contributions = platform_2.Registry.as(dnd_2.Extensions.DragAndDropContribution).getAll();
        for (const contribution of contributions) {
            contribution.setData(resources, event);
        }
        // Editors: enables cross window DND of editors
        // into the editor area while presering UI state
        const draggedEditors = [];
        for (const resourceOrEditor of resourcesOrEditors) {
            // Extract resource editor from provided object or URI
            let editor = undefined;
            if ((0, editor_1.isEditorIdentifier)(resourceOrEditor)) {
                const untypedEditor = resourceOrEditor.editor.toUntyped({ preserveViewState: resourceOrEditor.groupId });
                if (untypedEditor) {
                    editor = { ...untypedEditor, resource: editor_1.EditorResourceAccessor.getCanonicalUri(untypedEditor) };
                }
            }
            else if (uri_1.URI.isUri(resourceOrEditor)) {
                const { selection, uri } = (0, opener_1.extractSelection)(resourceOrEditor);
                editor = { resource: uri, options: selection ? { selection } : undefined };
            }
            else if (!resourceOrEditor.isDirectory) {
                editor = { resource: resourceOrEditor.resource };
            }
            if (!editor) {
                continue; // skip over editors that cannot be transferred via dnd
            }
            // Fill in some properties if they are not there already by accessing
            // some well known things from the text file universe.
            // This is not ideal for custom editors, but those have a chance to
            // provide everything from the `toUntyped` method.
            {
                const resource = editor.resource;
                if (resource) {
                    const textFileModel = textFileService.files.get(resource);
                    if (textFileModel) {
                        // language
                        if (typeof editor.languageId !== 'string') {
                            editor.languageId = textFileModel.getLanguageId();
                        }
                        // encoding
                        if (typeof editor.encoding !== 'string') {
                            editor.encoding = textFileModel.getEncoding();
                        }
                        // contents (only if dirty and not too large)
                        if (typeof editor.contents !== 'string' && textFileModel.isDirty() && !textFileModel.textEditorModel.isTooLargeForHeapOperation()) {
                            editor.contents = textFileModel.textEditorModel.getValue();
                        }
                    }
                    // viewState
                    if (!editor.options?.viewState) {
                        editor.options = {
                            ...editor.options,
                            viewState: (() => {
                                for (const visibleEditorPane of editorService.visibleEditorPanes) {
                                    if ((0, resources_1.isEqual)(visibleEditorPane.input.resource, resource)) {
                                        const viewState = visibleEditorPane.getViewState();
                                        if (viewState) {
                                            return viewState;
                                        }
                                    }
                                }
                                return undefined;
                            })()
                        };
                    }
                }
            }
            // Add as dragged editor
            draggedEditors.push(editor);
        }
        if (draggedEditors.length) {
            event.dataTransfer.setData(dnd_2.CodeDataTransfers.EDITORS, (0, marshalling_1.stringify)(draggedEditors));
            // Add a URI list entry
            const uriListEntries = [];
            for (const editor of draggedEditors) {
                if (editor.resource) {
                    uriListEntries.push(editor.resource);
                }
                else if ((0, editor_1.isResourceDiffEditorInput)(editor)) {
                    if (editor.modified.resource) {
                        uriListEntries.push(editor.modified.resource);
                    }
                }
                else if ((0, editor_1.isResourceSideBySideEditorInput)(editor)) {
                    if (editor.primary.resource) {
                        uriListEntries.push(editor.primary.resource);
                    }
                }
                else if ((0, editor_1.isResourceMergeEditorInput)(editor)) {
                    uriListEntries.push(editor.result.resource);
                }
            }
            // Due to https://bugs.chromium.org/p/chromium/issues/detail?id=239745, we can only set
            // a single uri for the real `text/uri-list` type. Otherwise all uris end up joined together
            // However we write the full uri-list to an internal type so that other parts of VS Code
            // can use the full list.
            event.dataTransfer.setData(mime_1.Mimes.uriList, dataTransfer_1.UriList.create(uriListEntries.slice(0, 1)));
            event.dataTransfer.setData(dnd_1.DataTransfers.INTERNAL_URI_LIST, dataTransfer_1.UriList.create(uriListEntries));
        }
    }
    exports.fillEditorsDragData = fillEditorsDragData;
    class CompositeDragAndDropData {
        constructor(type, id) {
            this.type = type;
            this.id = id;
        }
        update(dataTransfer) {
            // no-op
        }
        getData() {
            return { type: this.type, id: this.id };
        }
    }
    exports.CompositeDragAndDropData = CompositeDragAndDropData;
    class DraggedCompositeIdentifier {
        constructor(compositeId) {
            this.compositeId = compositeId;
        }
        get id() {
            return this.compositeId;
        }
    }
    exports.DraggedCompositeIdentifier = DraggedCompositeIdentifier;
    class DraggedViewIdentifier {
        constructor(viewId) {
            this.viewId = viewId;
        }
        get id() {
            return this.viewId;
        }
    }
    exports.DraggedViewIdentifier = DraggedViewIdentifier;
    class CompositeDragAndDropObserver extends lifecycle_1.Disposable {
        static get INSTANCE() {
            if (!CompositeDragAndDropObserver.instance) {
                CompositeDragAndDropObserver.instance = new CompositeDragAndDropObserver();
                (0, lifecycle_1.markAsSingleton)(CompositeDragAndDropObserver.instance);
            }
            return CompositeDragAndDropObserver.instance;
        }
        constructor() {
            super();
            this.transferData = dnd_2.LocalSelectionTransfer.getInstance();
            this.onDragStart = this._register(new event_1.Emitter());
            this.onDragEnd = this._register(new event_1.Emitter());
            this._register(this.onDragEnd.event(e => {
                const id = e.dragAndDropData.getData().id;
                const type = e.dragAndDropData.getData().type;
                const data = this.readDragData(type);
                if (data?.getData().id === id) {
                    this.transferData.clearData(type === 'view' ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype);
                }
            }));
        }
        readDragData(type) {
            if (this.transferData.hasData(type === 'view' ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype)) {
                const data = this.transferData.getData(type === 'view' ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype);
                if (data && data[0]) {
                    return new CompositeDragAndDropData(type, data[0].id);
                }
            }
            return undefined;
        }
        writeDragData(id, type) {
            this.transferData.setData([type === 'view' ? new DraggedViewIdentifier(id) : new DraggedCompositeIdentifier(id)], type === 'view' ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype);
        }
        registerTarget(element, callbacks) {
            const disposableStore = new lifecycle_1.DisposableStore();
            disposableStore.add(new dom_1.DragAndDropObserver(element, {
                onDragEnd: e => {
                    // no-op
                },
                onDragEnter: e => {
                    e.preventDefault();
                    if (callbacks.onDragEnter) {
                        const data = this.readDragData('composite') || this.readDragData('view');
                        if (data) {
                            callbacks.onDragEnter({ eventData: e, dragAndDropData: data });
                        }
                    }
                },
                onDragLeave: e => {
                    const data = this.readDragData('composite') || this.readDragData('view');
                    if (callbacks.onDragLeave && data) {
                        callbacks.onDragLeave({ eventData: e, dragAndDropData: data });
                    }
                },
                onDrop: e => {
                    if (callbacks.onDrop) {
                        const data = this.readDragData('composite') || this.readDragData('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDrop({ eventData: e, dragAndDropData: data });
                        // Fire drag event in case drop handler destroys the dragged element
                        this.onDragEnd.fire({ eventData: e, dragAndDropData: data });
                    }
                },
                onDragOver: e => {
                    e.preventDefault();
                    if (callbacks.onDragOver) {
                        const data = this.readDragData('composite') || this.readDragData('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDragOver({ eventData: e, dragAndDropData: data });
                    }
                }
            }));
            if (callbacks.onDragStart) {
                this.onDragStart.event(e => {
                    callbacks.onDragStart(e);
                }, this, disposableStore);
            }
            if (callbacks.onDragEnd) {
                this.onDragEnd.event(e => {
                    callbacks.onDragEnd(e);
                }, this, disposableStore);
            }
            return this._register(disposableStore);
        }
        registerDraggable(element, draggedItemProvider, callbacks) {
            element.draggable = true;
            const disposableStore = new lifecycle_1.DisposableStore();
            disposableStore.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.DRAG_START, e => {
                const { id, type } = draggedItemProvider();
                this.writeDragData(id, type);
                e.dataTransfer?.setDragImage(element, 0, 0);
                this.onDragStart.fire({ eventData: e, dragAndDropData: this.readDragData(type) });
            }));
            disposableStore.add(new dom_1.DragAndDropObserver(element, {
                onDragEnd: e => {
                    const { type } = draggedItemProvider();
                    const data = this.readDragData(type);
                    if (!data) {
                        return;
                    }
                    this.onDragEnd.fire({ eventData: e, dragAndDropData: data });
                },
                onDragEnter: e => {
                    if (callbacks.onDragEnter) {
                        const data = this.readDragData('composite') || this.readDragData('view');
                        if (!data) {
                            return;
                        }
                        if (data) {
                            callbacks.onDragEnter({ eventData: e, dragAndDropData: data });
                        }
                    }
                },
                onDragLeave: e => {
                    const data = this.readDragData('composite') || this.readDragData('view');
                    if (!data) {
                        return;
                    }
                    callbacks.onDragLeave?.({ eventData: e, dragAndDropData: data });
                },
                onDrop: e => {
                    if (callbacks.onDrop) {
                        const data = this.readDragData('composite') || this.readDragData('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDrop({ eventData: e, dragAndDropData: data });
                        // Fire drag event in case drop handler destroys the dragged element
                        this.onDragEnd.fire({ eventData: e, dragAndDropData: data });
                    }
                },
                onDragOver: e => {
                    if (callbacks.onDragOver) {
                        const data = this.readDragData('composite') || this.readDragData('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDragOver({ eventData: e, dragAndDropData: data });
                    }
                }
            }));
            if (callbacks.onDragStart) {
                this.onDragStart.event(e => {
                    callbacks.onDragStart(e);
                }, this, disposableStore);
            }
            if (callbacks.onDragEnd) {
                this.onDragEnd.event(e => {
                    callbacks.onDragEnd(e);
                }, this, disposableStore);
            }
            return this._register(disposableStore);
        }
    }
    exports.CompositeDragAndDropObserver = CompositeDragAndDropObserver;
    function toggleDropEffect(dataTransfer, dropEffect, shouldHaveIt) {
        if (!dataTransfer) {
            return;
        }
        dataTransfer.dropEffect = shouldHaveIt ? dropEffect : 'none';
    }
    exports.toggleDropEffect = toggleDropEffect;
    let ResourceListDnDHandler = class ResourceListDnDHandler {
        constructor(toResource, instantiationService) {
            this.toResource = toResource;
            this.instantiationService = instantiationService;
        }
        getDragURI(element) {
            const resource = this.toResource(element);
            return resource ? resource.toString() : null;
        }
        getDragLabel(elements) {
            const resources = (0, arrays_1.coalesce)(elements.map(this.toResource));
            return resources.length === 1 ? (0, resources_1.basename)(resources[0]) : resources.length > 1 ? String(resources.length) : undefined;
        }
        onDragStart(data, originalEvent) {
            const resources = [];
            for (const element of data.elements) {
                const resource = this.toResource(element);
                if (resource) {
                    resources.push(resource);
                }
            }
            if (resources.length) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, resources, originalEvent));
            }
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            return false;
        }
        drop(data, targetElement, targetIndex, originalEvent) { }
    };
    exports.ResourceListDnDHandler = ResourceListDnDHandler;
    exports.ResourceListDnDHandler = ResourceListDnDHandler = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ResourceListDnDHandler);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvZG5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtDaEcsZ0NBQWdDO0lBRWhDLE1BQWEsdUJBQXVCO1FBRW5DLFlBQXFCLFVBQTZCO1lBQTdCLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQUksQ0FBQztLQUN2RDtJQUhELDBEQUdDO0lBRUQsTUFBYSw0QkFBNEI7UUFFeEMsWUFBcUIsVUFBMkI7WUFBM0IsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFBSSxDQUFDO0tBQ3JEO0lBSEQsb0VBR0M7SUFHTSxLQUFLLFVBQVUsbUJBQW1CLENBQUMsWUFBNEI7UUFDckUsTUFBTSxPQUFPLEdBQWtDLEVBQUUsQ0FBQztRQUNsRCxNQUFNLFlBQVksR0FBRyxZQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRWpELDJCQUEyQjtRQUMzQixJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDbkMsSUFBSTtnQkFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7Z0JBQ2xFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUEsa0RBQTRDLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2FBQ2hGO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsbUJBQW1CO2FBQ25CO1NBQ0Q7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBaEJELGtEQWdCQztJQVlEOzs7O09BSUc7SUFDSSxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtRQUVoQyxZQUNrQixPQUFxQyxFQUN2QixXQUF5QixFQUNuQixpQkFBcUMsRUFDekMsYUFBNkIsRUFDbkIsdUJBQWlELEVBQzdELFdBQXlCLEVBQ2IsY0FBd0MsRUFDM0Msb0JBQTJDO1lBUGxFLFlBQU8sR0FBUCxPQUFPLENBQThCO1lBQ3ZCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ25CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDekMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ25CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDN0QsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDYixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtRQUVwRixDQUFDO1FBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFnQixFQUFFLGtCQUFrRCxFQUFFLFNBQTBELEVBQUUsV0FBb0I7WUFDdEssTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBQSxvQ0FBOEIsRUFBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM1SCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsT0FBTzthQUNQO1lBRUQsNERBQTREO1lBQzVELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUUvQiw2RUFBNkU7WUFDN0UsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFO2dCQUNwQyxNQUFNLGtDQUFrQyxHQUFHLElBQUEsaUJBQVEsRUFBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BMLElBQUksa0NBQWtDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDbEQsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO29CQUM5RixJQUFJLGtCQUFrQixFQUFFO3dCQUN2QixPQUFPLENBQUMscUZBQXFGO3FCQUM3RjtpQkFDRDthQUNEO1lBRUQsaUZBQWlGO1lBQ2pGLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxpQkFBUSxFQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDNUosSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RHO1lBRUQsaUJBQWlCO1lBQ2pCLE1BQU0sV0FBVyxHQUFHLGtCQUFrQixFQUFFLENBQUM7WUFDekMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0QsR0FBRyxNQUFNO2dCQUNULFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtnQkFDekIsT0FBTyxFQUFFO29CQUNSLEdBQUcsTUFBTSxDQUFDLE9BQU87b0JBQ2pCLE1BQU0sRUFBRSxJQUFJO29CQUNaLEtBQUssRUFBRSxXQUFXO2lCQUNsQjthQUNELENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTNDLGdDQUFnQztZQUNoQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVPLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFnQjtZQUNqRCxNQUFNLE1BQU0sR0FBc0IsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sVUFBVSxHQUFtQyxFQUFFLENBQUM7WUFFdEQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLFFBQVEsRUFBQyxFQUFFO2dCQUVoRCxzQkFBc0I7Z0JBQ3RCLElBQUksSUFBQSxxQ0FBeUIsRUFBQyxRQUFRLENBQUMsRUFBRTtvQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUV4QyxPQUFPO2lCQUNQO2dCQUVELG1CQUFtQjtnQkFDbkIsSUFBSTtvQkFDSCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNuRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7cUJBQ3hDO2lCQUNEO2dCQUFDLE9BQU8sS0FBSyxFQUFFO29CQUNmLGVBQWU7aUJBQ2Y7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosZ0VBQWdFO1lBQ2hFLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCx1QkFBdUI7WUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV6QixvRUFBb0U7WUFDcEUsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2pFLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDMUM7WUFFRCxzREFBc0Q7aUJBQ2pELElBQUksSUFBQSxnQ0FBb0IsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUU7Z0JBQ2xFLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMxRDtZQUVELDZEQUE2RDtpQkFDeEQ7Z0JBQ0osTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdkU7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFBO0lBMUdZLG9EQUFvQjttQ0FBcEIsb0JBQW9CO1FBSTlCLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSwyQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLG1CQUFZLENBQUE7UUFDWixXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEscUNBQXFCLENBQUE7T0FWWCxvQkFBb0IsQ0EwR2hDO0lBS0QsU0FBZ0IsbUJBQW1CLENBQUMsUUFBMEIsRUFBRSxrQkFBa0UsRUFBRSxLQUFpQztRQUNwSyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFO1lBQzNELE9BQU87U0FDUDtRQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztRQUNuRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsQ0FBQztRQUMvQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztRQUVqRCw4Q0FBOEM7UUFDOUMscUNBQXFDO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUEsaUJBQVEsRUFBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUNwRSxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDaEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3RDO1lBRUQsSUFBSSxJQUFBLDJCQUFrQixFQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ3pDLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ2hELE9BQU8sRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUN0RDtnQkFFRCxPQUFPLFNBQVMsQ0FBQyxDQUFDLDBCQUEwQjthQUM1QztZQUVELE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVsRyxnREFBZ0Q7UUFDaEQsTUFBTSxhQUFhLEdBQUcsb0JBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDaEQsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsbUJBQWEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBRXRLLGlFQUFpRTtRQUNqRSxnQkFBZ0I7UUFDaEIscUJBQXFCO1FBQ3JCLG9DQUFvQztRQUNwQyx3Q0FBd0M7UUFDeEMsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5RSxJQUFJLFNBQVMsRUFBRTtZQUNkLE1BQU0sWUFBWSxHQUFHLG9CQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHVCQUF1QjtZQUN6RixJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3pDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLG1CQUFhLENBQUMsWUFBWSxFQUFFLENBQUMsWUFBSyxDQUFDLE1BQU0sRUFBRSxJQUFBLG9CQUFRLEVBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3hJO1NBQ0Q7UUFFRCwrRUFBK0U7UUFDL0UsTUFBTSxLQUFLLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsbUJBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RIO1FBRUQsZ0JBQWdCO1FBQ2hCLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFtQyxnQkFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDakgsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7WUFDekMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDdkM7UUFFRCwrQ0FBK0M7UUFDL0MsZ0RBQWdEO1FBQ2hELE1BQU0sY0FBYyxHQUFrQyxFQUFFLENBQUM7UUFFekQsS0FBSyxNQUFNLGdCQUFnQixJQUFJLGtCQUFrQixFQUFFO1lBRWxELHNEQUFzRDtZQUN0RCxJQUFJLE1BQU0sR0FBNEMsU0FBUyxDQUFDO1lBQ2hFLElBQUksSUFBQSwyQkFBa0IsRUFBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUN6QyxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDekcsSUFBSSxhQUFhLEVBQUU7b0JBQ2xCLE1BQU0sR0FBRyxFQUFFLEdBQUcsYUFBYSxFQUFFLFFBQVEsRUFBRSwrQkFBc0IsQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztpQkFDL0Y7YUFDRDtpQkFBTSxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDdkMsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFBLHlCQUFnQixFQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzlELE1BQU0sR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDM0U7aUJBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRTtnQkFDekMsTUFBTSxHQUFHLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2pEO1lBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixTQUFTLENBQUMsdURBQXVEO2FBQ2pFO1lBRUQscUVBQXFFO1lBQ3JFLHNEQUFzRDtZQUN0RCxtRUFBbUU7WUFDbkUsa0RBQWtEO1lBQ2xEO2dCQUNDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ2pDLElBQUksUUFBUSxFQUFFO29CQUNiLE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMxRCxJQUFJLGFBQWEsRUFBRTt3QkFFbEIsV0FBVzt3QkFDWCxJQUFJLE9BQU8sTUFBTSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUU7NEJBQzFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO3lCQUNsRDt3QkFFRCxXQUFXO3dCQUNYLElBQUksT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTs0QkFDeEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7eUJBQzlDO3dCQUVELDZDQUE2Qzt3QkFDN0MsSUFBSSxPQUFPLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsMEJBQTBCLEVBQUUsRUFBRTs0QkFDbEksTUFBTSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO3lCQUMzRDtxQkFDRDtvQkFFRCxZQUFZO29CQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRTt3QkFDL0IsTUFBTSxDQUFDLE9BQU8sR0FBRzs0QkFDaEIsR0FBRyxNQUFNLENBQUMsT0FBTzs0QkFDakIsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFO2dDQUNoQixLQUFLLE1BQU0saUJBQWlCLElBQUksYUFBYSxDQUFDLGtCQUFrQixFQUFFO29DQUNqRSxJQUFJLElBQUEsbUJBQU8sRUFBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFO3dDQUN4RCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3Q0FDbkQsSUFBSSxTQUFTLEVBQUU7NENBQ2QsT0FBTyxTQUFTLENBQUM7eUNBQ2pCO3FDQUNEO2lDQUNEO2dDQUVELE9BQU8sU0FBUyxDQUFDOzRCQUNsQixDQUFDLENBQUMsRUFBRTt5QkFDSixDQUFDO3FCQUNGO2lCQUNEO2FBQ0Q7WUFFRCx3QkFBd0I7WUFDeEIsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1QjtRQUVELElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTtZQUMxQixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyx1QkFBaUIsQ0FBQyxPQUFPLEVBQUUsSUFBQSx1QkFBUyxFQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFFakYsdUJBQXVCO1lBQ3ZCLE1BQU0sY0FBYyxHQUFVLEVBQUUsQ0FBQztZQUNqQyxLQUFLLE1BQU0sTUFBTSxJQUFJLGNBQWMsRUFBRTtnQkFDcEMsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO29CQUNwQixjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDckM7cUJBQU0sSUFBSSxJQUFBLGtDQUF5QixFQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM3QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO3dCQUM3QixjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzlDO2lCQUNEO3FCQUFNLElBQUksSUFBQSx3Q0FBK0IsRUFBQyxNQUFNLENBQUMsRUFBRTtvQkFDbkQsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTt3QkFDNUIsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUM3QztpQkFDRDtxQkFBTSxJQUFJLElBQUEsbUNBQTBCLEVBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQzlDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDNUM7YUFDRDtZQUVELHVGQUF1RjtZQUN2Riw0RkFBNEY7WUFDNUYsd0ZBQXdGO1lBQ3hGLHlCQUF5QjtZQUN6QixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxZQUFLLENBQUMsT0FBTyxFQUFFLHNCQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxtQkFBYSxDQUFDLGlCQUFpQixFQUFFLHNCQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7U0FDNUY7SUFDRixDQUFDO0lBaktELGtEQWlLQztJQTBCRCxNQUFhLHdCQUF3QjtRQUVwQyxZQUFvQixJQUEwQixFQUFVLEVBQVU7WUFBOUMsU0FBSSxHQUFKLElBQUksQ0FBc0I7WUFBVSxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQUksQ0FBQztRQUV2RSxNQUFNLENBQUMsWUFBMEI7WUFDaEMsUUFBUTtRQUNULENBQUM7UUFFRCxPQUFPO1lBSU4sT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDekMsQ0FBQztLQUNEO0lBZEQsNERBY0M7SUFPRCxNQUFhLDBCQUEwQjtRQUV0QyxZQUFvQixXQUFtQjtZQUFuQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUFJLENBQUM7UUFFNUMsSUFBSSxFQUFFO1lBQ0wsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7S0FDRDtJQVBELGdFQU9DO0lBRUQsTUFBYSxxQkFBcUI7UUFFakMsWUFBb0IsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBSSxDQUFDO1FBRXZDLElBQUksRUFBRTtZQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO0tBQ0Q7SUFQRCxzREFPQztJQUlELE1BQWEsNEJBQTZCLFNBQVEsc0JBQVU7UUFJM0QsTUFBTSxLQUFLLFFBQVE7WUFDbEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsRUFBRTtnQkFDM0MsNEJBQTRCLENBQUMsUUFBUSxHQUFHLElBQUksNEJBQTRCLEVBQUUsQ0FBQztnQkFDM0UsSUFBQSwyQkFBZSxFQUFDLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3ZEO1lBRUQsT0FBTyw0QkFBNEIsQ0FBQyxRQUFRLENBQUM7UUFDOUMsQ0FBQztRQU9EO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFOUSxpQkFBWSxHQUFHLDRCQUFzQixDQUFDLFdBQVcsRUFBc0QsQ0FBQztZQUV4RyxnQkFBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXlCLENBQUMsQ0FBQztZQUNuRSxjQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBeUIsQ0FBQyxDQUFDO1lBS2pGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztnQkFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsSUFBSSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDdEg7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLFlBQVksQ0FBQyxJQUFjO1lBQ2xDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDeEgsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDakksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNwQixPQUFPLElBQUksd0JBQXdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDdEQ7YUFDRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTyxhQUFhLENBQUMsRUFBVSxFQUFFLElBQWM7WUFDL0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLDBCQUEwQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3TSxDQUFDO1FBRUQsY0FBYyxDQUFDLE9BQW9CLEVBQUUsU0FBaUQ7WUFDckYsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDOUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlCQUFtQixDQUFDLE9BQU8sRUFBRTtnQkFDcEQsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNkLFFBQVE7Z0JBQ1QsQ0FBQztnQkFDRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ2hCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFFbkIsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFO3dCQUMxQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3pFLElBQUksSUFBSSxFQUFFOzRCQUNULFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFLLEVBQUUsQ0FBQyxDQUFDO3lCQUNoRTtxQkFDRDtnQkFDRixDQUFDO2dCQUNELFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDaEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN6RSxJQUFJLFNBQVMsQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFO3dCQUNsQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSyxFQUFFLENBQUMsQ0FBQztxQkFDaEU7Z0JBQ0YsQ0FBQztnQkFDRCxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1gsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO3dCQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3pFLElBQUksQ0FBQyxJQUFJLEVBQUU7NEJBQ1YsT0FBTzt5QkFDUDt3QkFFRCxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSyxFQUFFLENBQUMsQ0FBQzt3QkFFM0Qsb0VBQW9FO3dCQUNwRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUssRUFBRSxDQUFDLENBQUM7cUJBQzlEO2dCQUNGLENBQUM7Z0JBQ0QsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNmLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFFbkIsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFO3dCQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3pFLElBQUksQ0FBQyxJQUFJLEVBQUU7NEJBQ1YsT0FBTzt5QkFDUDt3QkFFRCxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSyxFQUFFLENBQUMsQ0FBQztxQkFDL0Q7Z0JBQ0YsQ0FBQzthQUNELENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFO2dCQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDMUIsU0FBUyxDQUFDLFdBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQzthQUMxQjtZQUVELElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3hCLFNBQVMsQ0FBQyxTQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDMUI7WUFFRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELGlCQUFpQixDQUFDLE9BQW9CLEVBQUUsbUJBQXlELEVBQUUsU0FBaUQ7WUFDbkosT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFFekIsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFOUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLE9BQU8sRUFBRSxlQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUM1RSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLG1CQUFtQixFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU3QixDQUFDLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixlQUFlLENBQUMsR0FBRyxDQUFDLElBQUkseUJBQW1CLENBQUMsT0FBTyxFQUFFO2dCQUNwRCxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ2QsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLG1CQUFtQixFQUFFLENBQUM7b0JBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ1YsT0FBTztxQkFDUDtvQkFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUssRUFBRSxDQUFDLENBQUM7Z0JBQy9ELENBQUM7Z0JBQ0QsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNoQixJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7d0JBQzFCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDekUsSUFBSSxDQUFDLElBQUksRUFBRTs0QkFDVixPQUFPO3lCQUNQO3dCQUVELElBQUksSUFBSSxFQUFFOzRCQUNULFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFLLEVBQUUsQ0FBQyxDQUFDO3lCQUNoRTtxQkFDRDtnQkFDRixDQUFDO2dCQUNELFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDaEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN6RSxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNWLE9BQU87cUJBQ1A7b0JBRUQsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSyxFQUFFLENBQUMsQ0FBQztnQkFDbkUsQ0FBQztnQkFDRCxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1gsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO3dCQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3pFLElBQUksQ0FBQyxJQUFJLEVBQUU7NEJBQ1YsT0FBTzt5QkFDUDt3QkFFRCxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSyxFQUFFLENBQUMsQ0FBQzt3QkFFM0Qsb0VBQW9FO3dCQUNwRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUssRUFBRSxDQUFDLENBQUM7cUJBQzlEO2dCQUNGLENBQUM7Z0JBQ0QsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNmLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRTt3QkFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN6RSxJQUFJLENBQUMsSUFBSSxFQUFFOzRCQUNWLE9BQU87eUJBQ1A7d0JBRUQsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUssRUFBRSxDQUFDLENBQUM7cUJBQy9EO2dCQUNGLENBQUM7YUFDRCxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzFCLFNBQVMsQ0FBQyxXQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDMUI7WUFFRCxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUN4QixTQUFTLENBQUMsU0FBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQzFCO1lBRUQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7S0FDRDtJQWpNRCxvRUFpTUM7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxZQUFpQyxFQUFFLFVBQTZDLEVBQUUsWUFBcUI7UUFDdkksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNsQixPQUFPO1NBQ1A7UUFFRCxZQUFZLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDOUQsQ0FBQztJQU5ELDRDQU1DO0lBRU0sSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7UUFDbEMsWUFDa0IsVUFBZ0MsRUFDVCxvQkFBMkM7WUFEbEUsZUFBVSxHQUFWLFVBQVUsQ0FBc0I7WUFDVCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1FBQ2hGLENBQUM7UUFFTCxVQUFVLENBQUMsT0FBVTtZQUNwQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUM5QyxDQUFDO1FBRUQsWUFBWSxDQUFDLFFBQWE7WUFDekIsTUFBTSxTQUFTLEdBQUcsSUFBQSxpQkFBUSxFQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDMUQsT0FBTyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxvQkFBUSxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3RILENBQUM7UUFFRCxXQUFXLENBQUMsSUFBc0IsRUFBRSxhQUF3QjtZQUMzRCxNQUFNLFNBQVMsR0FBVSxFQUFFLENBQUM7WUFDNUIsS0FBSyxNQUFNLE9BQU8sSUFBSyxJQUFtQyxDQUFDLFFBQVEsRUFBRTtnQkFDcEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDekI7YUFDRDtZQUNELElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDckIsNkZBQTZGO2dCQUM3RixJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQzlHO1FBQ0YsQ0FBQztRQUVELFVBQVUsQ0FBQyxJQUFzQixFQUFFLGFBQWdCLEVBQUUsV0FBbUIsRUFBRSxhQUF3QjtZQUNqRyxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBc0IsRUFBRSxhQUFnQixFQUFFLFdBQW1CLEVBQUUsYUFBd0IsSUFBVSxDQUFDO0tBQ3ZHLENBQUE7SUFuQ1ksd0RBQXNCO3FDQUF0QixzQkFBc0I7UUFHaEMsV0FBQSxxQ0FBcUIsQ0FBQTtPQUhYLHNCQUFzQixDQW1DbEM7O0FBRUQsWUFBWSJ9