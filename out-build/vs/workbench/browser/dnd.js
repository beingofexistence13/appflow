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
    exports.$Beb = exports.$Aeb = exports.$zeb = exports.$yeb = exports.$xeb = exports.$web = exports.$veb = exports.$ueb = exports.$teb = exports.$seb = exports.$reb = void 0;
    //#region Editor / Resources DND
    class $reb {
        constructor(identifier) {
            this.identifier = identifier;
        }
    }
    exports.$reb = $reb;
    class $seb {
        constructor(identifier) {
            this.identifier = identifier;
        }
    }
    exports.$seb = $seb;
    async function $teb(dataTransfer) {
        const editors = [];
        const resourcesKey = mime_1.$Hr.uriList.toLowerCase();
        // Data Transfer: Resources
        if (dataTransfer.has(resourcesKey)) {
            try {
                const asString = await dataTransfer.get(resourcesKey)?.asString();
                const rawResourcesData = JSON.stringify(dataTransfer_1.$Ts.parse(asString ?? ''));
                editors.push(...(0, dnd_2.$86)(rawResourcesData));
            }
            catch (error) {
                // Invalid transfer
            }
        }
        return editors;
    }
    exports.$teb = $teb;
    /**
     * Shared function across some components to handle drag & drop of resources.
     * E.g. of folders and workspace files to open them in the window instead of
     * the editor or to handle dirty editors being dropped between instances of Code.
     */
    let $ueb = class $ueb {
        constructor(a, b, c, d, f, g, h, i) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
        }
        async handleDrop(event, resolveTargetGroup, afterDrop, targetIndex) {
            const editors = await this.i.invokeFunction(accessor => (0, dnd_2.$76)(accessor, event));
            if (!editors.length) {
                return;
            }
            // Make the window active to handle the drop properly within
            await this.g.focus();
            // Check for workspace file / folder being dropped if we are allowed to do so
            if (this.a.allowWorkspaceOpen) {
                const localFilesAllowedToOpenAsWorkspace = (0, arrays_1.$Fb)(editors.filter(editor => editor.allowWorkspaceOpen && editor.resource?.scheme === network_1.Schemas.file).map(editor => editor.resource));
                if (localFilesAllowedToOpenAsWorkspace.length > 0) {
                    const isWorkspaceOpening = await this.j(localFilesAllowedToOpenAsWorkspace);
                    if (isWorkspaceOpening) {
                        return; // return early if the drop operation resulted in this window changing to a workspace
                    }
                }
            }
            // Add external ones to recently open list unless dropped resource is a workspace
            const externalLocalFiles = (0, arrays_1.$Fb)(editors.filter(editor => editor.isExternal && editor.resource?.scheme === network_1.Schemas.file).map(editor => editor.resource));
            if (externalLocalFiles.length) {
                this.c.addRecentlyOpened(externalLocalFiles.map(resource => ({ fileUri: resource })));
            }
            // Open in Editor
            const targetGroup = resolveTargetGroup();
            await this.d.openEditors(editors.map(editor => ({
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
        async j(resources) {
            const toOpen = [];
            const folderURIs = [];
            await Promise.all(resources.map(async (resource) => {
                // Check for Workspace
                if ((0, workspace_1.$7h)(resource)) {
                    toOpen.push({ workspaceUri: resource });
                    return;
                }
                // Check for Folder
                try {
                    const stat = await this.b.stat(resource);
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
            this.g.focus();
            // Open in separate windows if we drop workspaces or just one folder
            if (toOpen.length > folderURIs.length || folderURIs.length === 1) {
                await this.g.openWindow(toOpen);
            }
            // Add to workspace if we are in a temporary workspace
            else if ((0, workspace_1.$3h)(this.h.getWorkspace())) {
                await this.f.addFolders(folderURIs);
            }
            // Finally, enter untitled workspace when dropping >1 folders
            else {
                await this.f.createAndEnterWorkspace(folderURIs);
            }
            return true;
        }
    };
    exports.$ueb = $ueb;
    exports.$ueb = $ueb = __decorate([
        __param(1, files_1.$6j),
        __param(2, workspaces_1.$fU),
        __param(3, editorService_1.$9C),
        __param(4, workspaceEditing_1.$pU),
        __param(5, host_1.$VT),
        __param(6, workspace_1.$Kh),
        __param(7, instantiation_1.$Ah)
    ], $ueb);
    function $veb(accessor, resourcesOrEditors, event) {
        if (resourcesOrEditors.length === 0 || !event.dataTransfer) {
            return;
        }
        const textFileService = accessor.get(textfiles_1.$JD);
        const editorService = accessor.get(editorService_1.$9C);
        const fileService = accessor.get(files_1.$6j);
        const labelService = accessor.get(label_1.$Vz);
        // Extract resources from URIs or Editors that
        // can be handled by the file service
        const resources = (0, arrays_1.$Fb)(resourcesOrEditors.map(resourceOrEditor => {
            if (uri_1.URI.isUri(resourceOrEditor)) {
                return { resource: resourceOrEditor };
            }
            if ((0, editor_1.$1E)(resourceOrEditor)) {
                if (uri_1.URI.isUri(resourceOrEditor.editor.resource)) {
                    return { resource: resourceOrEditor.editor.resource };
                }
                return undefined; // editor without resource
            }
            return resourceOrEditor;
        }));
        const fileSystemResources = resources.filter(({ resource }) => fileService.hasProvider(resource));
        // Text: allows to paste into text-capable areas
        const lineDelimiter = platform_1.$i ? '\r\n' : '\n';
        event.dataTransfer.setData(dnd_1.$CP.TEXT, fileSystemResources.map(({ resource }) => labelService.getUriLabel(resource, { noPrefix: true })).join(lineDelimiter));
        // Download URL: enables support to drag a tab as file to desktop
        // Requirements:
        // - Chrome/Edge only
        // - only a single file is supported
        // - only file:/ resources are supported
        const firstFile = fileSystemResources.find(({ isDirectory }) => !isDirectory);
        if (firstFile) {
            const firstFileUri = network_1.$2f.uriToFileUri(firstFile.resource); // enforce `file:` URIs
            if (firstFileUri.scheme === network_1.Schemas.file) {
                event.dataTransfer.setData(dnd_1.$CP.DOWNLOAD_URL, [mime_1.$Hr.binary, (0, resources_1.$fg)(firstFile.resource), firstFileUri.toString()].join(':'));
            }
        }
        // Resource URLs: allows to drop multiple file resources to a target in VS Code
        const files = fileSystemResources.filter(({ isDirectory }) => !isDirectory);
        if (files.length) {
            event.dataTransfer.setData(dnd_1.$CP.RESOURCES, JSON.stringify(files.map(({ resource }) => resource.toString())));
        }
        // Contributions
        const contributions = platform_2.$8m.as(dnd_2.$$6.DragAndDropContribution).getAll();
        for (const contribution of contributions) {
            contribution.setData(resources, event);
        }
        // Editors: enables cross window DND of editors
        // into the editor area while presering UI state
        const draggedEditors = [];
        for (const resourceOrEditor of resourcesOrEditors) {
            // Extract resource editor from provided object or URI
            let editor = undefined;
            if ((0, editor_1.$1E)(resourceOrEditor)) {
                const untypedEditor = resourceOrEditor.editor.toUntyped({ preserveViewState: resourceOrEditor.groupId });
                if (untypedEditor) {
                    editor = { ...untypedEditor, resource: editor_1.$3E.getCanonicalUri(untypedEditor) };
                }
            }
            else if (uri_1.URI.isUri(resourceOrEditor)) {
                const { selection, uri } = (0, opener_1.$RT)(resourceOrEditor);
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
                                    if ((0, resources_1.$bg)(visibleEditorPane.input.resource, resource)) {
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
            event.dataTransfer.setData(dnd_2.$56.EDITORS, (0, marshalling_1.$9g)(draggedEditors));
            // Add a URI list entry
            const uriListEntries = [];
            for (const editor of draggedEditors) {
                if (editor.resource) {
                    uriListEntries.push(editor.resource);
                }
                else if ((0, editor_1.$OE)(editor)) {
                    if (editor.modified.resource) {
                        uriListEntries.push(editor.modified.resource);
                    }
                }
                else if ((0, editor_1.$PE)(editor)) {
                    if (editor.primary.resource) {
                        uriListEntries.push(editor.primary.resource);
                    }
                }
                else if ((0, editor_1.$RE)(editor)) {
                    uriListEntries.push(editor.result.resource);
                }
            }
            // Due to https://bugs.chromium.org/p/chromium/issues/detail?id=239745, we can only set
            // a single uri for the real `text/uri-list` type. Otherwise all uris end up joined together
            // However we write the full uri-list to an internal type so that other parts of VS Code
            // can use the full list.
            event.dataTransfer.setData(mime_1.$Hr.uriList, dataTransfer_1.$Ts.create(uriListEntries.slice(0, 1)));
            event.dataTransfer.setData(dnd_1.$CP.INTERNAL_URI_LIST, dataTransfer_1.$Ts.create(uriListEntries));
        }
    }
    exports.$veb = $veb;
    class $web {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        update(dataTransfer) {
            // no-op
        }
        getData() {
            return { type: this.a, id: this.b };
        }
    }
    exports.$web = $web;
    class $xeb {
        constructor(a) {
            this.a = a;
        }
        get id() {
            return this.a;
        }
    }
    exports.$xeb = $xeb;
    class $yeb {
        constructor(a) {
            this.a = a;
        }
        get id() {
            return this.a;
        }
    }
    exports.$yeb = $yeb;
    class $zeb extends lifecycle_1.$kc {
        static get INSTANCE() {
            if (!$zeb.a) {
                $zeb.a = new $zeb();
                (0, lifecycle_1.$dc)($zeb.a);
            }
            return $zeb.a;
        }
        constructor() {
            super();
            this.b = dnd_2.$_6.getInstance();
            this.c = this.B(new event_1.$fd());
            this.f = this.B(new event_1.$fd());
            this.B(this.f.event(e => {
                const id = e.dragAndDropData.getData().id;
                const type = e.dragAndDropData.getData().type;
                const data = this.g(type);
                if (data?.getData().id === id) {
                    this.b.clearData(type === 'view' ? $yeb.prototype : $xeb.prototype);
                }
            }));
        }
        g(type) {
            if (this.b.hasData(type === 'view' ? $yeb.prototype : $xeb.prototype)) {
                const data = this.b.getData(type === 'view' ? $yeb.prototype : $xeb.prototype);
                if (data && data[0]) {
                    return new $web(type, data[0].id);
                }
            }
            return undefined;
        }
        h(id, type) {
            this.b.setData([type === 'view' ? new $yeb(id) : new $xeb(id)], type === 'view' ? $yeb.prototype : $xeb.prototype);
        }
        registerTarget(element, callbacks) {
            const disposableStore = new lifecycle_1.$jc();
            disposableStore.add(new dom_1.$zP(element, {
                onDragEnd: e => {
                    // no-op
                },
                onDragEnter: e => {
                    e.preventDefault();
                    if (callbacks.onDragEnter) {
                        const data = this.g('composite') || this.g('view');
                        if (data) {
                            callbacks.onDragEnter({ eventData: e, dragAndDropData: data });
                        }
                    }
                },
                onDragLeave: e => {
                    const data = this.g('composite') || this.g('view');
                    if (callbacks.onDragLeave && data) {
                        callbacks.onDragLeave({ eventData: e, dragAndDropData: data });
                    }
                },
                onDrop: e => {
                    if (callbacks.onDrop) {
                        const data = this.g('composite') || this.g('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDrop({ eventData: e, dragAndDropData: data });
                        // Fire drag event in case drop handler destroys the dragged element
                        this.f.fire({ eventData: e, dragAndDropData: data });
                    }
                },
                onDragOver: e => {
                    e.preventDefault();
                    if (callbacks.onDragOver) {
                        const data = this.g('composite') || this.g('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDragOver({ eventData: e, dragAndDropData: data });
                    }
                }
            }));
            if (callbacks.onDragStart) {
                this.c.event(e => {
                    callbacks.onDragStart(e);
                }, this, disposableStore);
            }
            if (callbacks.onDragEnd) {
                this.f.event(e => {
                    callbacks.onDragEnd(e);
                }, this, disposableStore);
            }
            return this.B(disposableStore);
        }
        registerDraggable(element, draggedItemProvider, callbacks) {
            element.draggable = true;
            const disposableStore = new lifecycle_1.$jc();
            disposableStore.add((0, dom_1.$nO)(element, dom_1.$3O.DRAG_START, e => {
                const { id, type } = draggedItemProvider();
                this.h(id, type);
                e.dataTransfer?.setDragImage(element, 0, 0);
                this.c.fire({ eventData: e, dragAndDropData: this.g(type) });
            }));
            disposableStore.add(new dom_1.$zP(element, {
                onDragEnd: e => {
                    const { type } = draggedItemProvider();
                    const data = this.g(type);
                    if (!data) {
                        return;
                    }
                    this.f.fire({ eventData: e, dragAndDropData: data });
                },
                onDragEnter: e => {
                    if (callbacks.onDragEnter) {
                        const data = this.g('composite') || this.g('view');
                        if (!data) {
                            return;
                        }
                        if (data) {
                            callbacks.onDragEnter({ eventData: e, dragAndDropData: data });
                        }
                    }
                },
                onDragLeave: e => {
                    const data = this.g('composite') || this.g('view');
                    if (!data) {
                        return;
                    }
                    callbacks.onDragLeave?.({ eventData: e, dragAndDropData: data });
                },
                onDrop: e => {
                    if (callbacks.onDrop) {
                        const data = this.g('composite') || this.g('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDrop({ eventData: e, dragAndDropData: data });
                        // Fire drag event in case drop handler destroys the dragged element
                        this.f.fire({ eventData: e, dragAndDropData: data });
                    }
                },
                onDragOver: e => {
                    if (callbacks.onDragOver) {
                        const data = this.g('composite') || this.g('view');
                        if (!data) {
                            return;
                        }
                        callbacks.onDragOver({ eventData: e, dragAndDropData: data });
                    }
                }
            }));
            if (callbacks.onDragStart) {
                this.c.event(e => {
                    callbacks.onDragStart(e);
                }, this, disposableStore);
            }
            if (callbacks.onDragEnd) {
                this.f.event(e => {
                    callbacks.onDragEnd(e);
                }, this, disposableStore);
            }
            return this.B(disposableStore);
        }
    }
    exports.$zeb = $zeb;
    function $Aeb(dataTransfer, dropEffect, shouldHaveIt) {
        if (!dataTransfer) {
            return;
        }
        dataTransfer.dropEffect = shouldHaveIt ? dropEffect : 'none';
    }
    exports.$Aeb = $Aeb;
    let $Beb = class $Beb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getDragURI(element) {
            const resource = this.a(element);
            return resource ? resource.toString() : null;
        }
        getDragLabel(elements) {
            const resources = (0, arrays_1.$Fb)(elements.map(this.a));
            return resources.length === 1 ? (0, resources_1.$fg)(resources[0]) : resources.length > 1 ? String(resources.length) : undefined;
        }
        onDragStart(data, originalEvent) {
            const resources = [];
            for (const element of data.elements) {
                const resource = this.a(element);
                if (resource) {
                    resources.push(resource);
                }
            }
            if (resources.length) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.b.invokeFunction(accessor => $veb(accessor, resources, originalEvent));
            }
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            return false;
        }
        drop(data, targetElement, targetIndex, originalEvent) { }
    };
    exports.$Beb = $Beb;
    exports.$Beb = $Beb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $Beb);
});
//#endregion
//# sourceMappingURL=dnd.js.map