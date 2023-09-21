/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dnd", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/map", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/files/browser/htmlFileSystemProvider", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform"], function (require, exports, dnd_1, arrays_1, async_1, buffer_1, map_1, marshalling_1, network_1, platform_1, uri_1, nls_1, dialogs_1, htmlFileSystemProvider_1, webFileSystemAccess_1, files_1, instantiation_1, opener_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalSelectionTransfer = exports.Extensions = exports.containsDragType = exports.extractFileListData = exports.createDraggedEditorInputFromRawResourcesData = exports.extractEditorsAndFilesDropData = exports.extractEditorsDropData = exports.CodeDataTransfers = void 0;
    //#region Editor / Resources DND
    exports.CodeDataTransfers = {
        EDITORS: 'CodeEditors',
        FILES: 'CodeFiles'
    };
    function extractEditorsDropData(e) {
        const editors = [];
        if (e.dataTransfer && e.dataTransfer.types.length > 0) {
            // Data Transfer: Code Editors
            const rawEditorsData = e.dataTransfer.getData(exports.CodeDataTransfers.EDITORS);
            if (rawEditorsData) {
                try {
                    editors.push(...(0, marshalling_1.parse)(rawEditorsData));
                }
                catch (error) {
                    // Invalid transfer
                }
            }
            // Data Transfer: Resources
            else {
                try {
                    const rawResourcesData = e.dataTransfer.getData(dnd_1.DataTransfers.RESOURCES);
                    editors.push(...createDraggedEditorInputFromRawResourcesData(rawResourcesData));
                }
                catch (error) {
                    // Invalid transfer
                }
            }
            // Check for native file transfer
            if (e.dataTransfer?.files) {
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                    const file = e.dataTransfer.files[i];
                    if (file && file.path /* Electron only */) {
                        try {
                            editors.push({ resource: uri_1.URI.file(file.path), isExternal: true, allowWorkspaceOpen: true });
                        }
                        catch (error) {
                            // Invalid URI
                        }
                    }
                }
            }
            // Check for CodeFiles transfer
            const rawCodeFiles = e.dataTransfer.getData(exports.CodeDataTransfers.FILES);
            if (rawCodeFiles) {
                try {
                    const codeFiles = JSON.parse(rawCodeFiles);
                    for (const codeFile of codeFiles) {
                        editors.push({ resource: uri_1.URI.file(codeFile), isExternal: true, allowWorkspaceOpen: true });
                    }
                }
                catch (error) {
                    // Invalid transfer
                }
            }
            // Workbench contributions
            const contributions = platform_2.Registry.as(exports.Extensions.DragAndDropContribution).getAll();
            for (const contribution of contributions) {
                const data = e.dataTransfer.getData(contribution.dataFormatKey);
                if (data) {
                    try {
                        editors.push(...contribution.getEditorInputs(data));
                    }
                    catch (error) {
                        // Invalid transfer
                    }
                }
            }
        }
        // Prevent duplicates: it is possible that we end up with the same
        // dragged editor multiple times because multiple data transfers
        // are being used (https://github.com/microsoft/vscode/issues/128925)
        const coalescedEditors = [];
        const seen = new map_1.ResourceMap();
        for (const editor of editors) {
            if (!editor.resource) {
                coalescedEditors.push(editor);
            }
            else if (!seen.has(editor.resource)) {
                coalescedEditors.push(editor);
                seen.set(editor.resource, true);
            }
        }
        return coalescedEditors;
    }
    exports.extractEditorsDropData = extractEditorsDropData;
    async function extractEditorsAndFilesDropData(accessor, e) {
        const editors = extractEditorsDropData(e);
        // Web: Check for file transfer
        if (e.dataTransfer && platform_1.isWeb && containsDragType(e, dnd_1.DataTransfers.FILES)) {
            const files = e.dataTransfer.items;
            if (files) {
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const filesData = await instantiationService.invokeFunction(accessor => extractFilesDropData(accessor, e));
                for (const fileData of filesData) {
                    editors.push({ resource: fileData.resource, contents: fileData.contents?.toString(), isExternal: true, allowWorkspaceOpen: fileData.isDirectory });
                }
            }
        }
        return editors;
    }
    exports.extractEditorsAndFilesDropData = extractEditorsAndFilesDropData;
    function createDraggedEditorInputFromRawResourcesData(rawResourcesData) {
        const editors = [];
        if (rawResourcesData) {
            const resourcesRaw = JSON.parse(rawResourcesData);
            for (const resourceRaw of resourcesRaw) {
                if (resourceRaw.indexOf(':') > 0) { // mitigate https://github.com/microsoft/vscode/issues/124946
                    const { selection, uri } = (0, opener_1.extractSelection)(uri_1.URI.parse(resourceRaw));
                    editors.push({ resource: uri, options: { selection } });
                }
            }
        }
        return editors;
    }
    exports.createDraggedEditorInputFromRawResourcesData = createDraggedEditorInputFromRawResourcesData;
    async function extractFilesDropData(accessor, event) {
        // Try to extract via `FileSystemHandle`
        if (webFileSystemAccess_1.WebFileSystemAccess.supported(window)) {
            const items = event.dataTransfer?.items;
            if (items) {
                return extractFileTransferData(accessor, items);
            }
        }
        // Try to extract via `FileList`
        const files = event.dataTransfer?.files;
        if (!files) {
            return [];
        }
        return extractFileListData(accessor, files);
    }
    async function extractFileTransferData(accessor, items) {
        const fileSystemProvider = accessor.get(files_1.IFileService).getProvider(network_1.Schemas.file);
        if (!(fileSystemProvider instanceof htmlFileSystemProvider_1.HTMLFileSystemProvider)) {
            return []; // only supported when running in web
        }
        const results = [];
        for (let i = 0; i < items.length; i++) {
            const file = items[i];
            if (file) {
                const result = new async_1.DeferredPromise();
                results.push(result);
                (async () => {
                    try {
                        const handle = await file.getAsFileSystemHandle();
                        if (!handle) {
                            result.complete(undefined);
                            return;
                        }
                        if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemFileHandle(handle)) {
                            result.complete({
                                resource: await fileSystemProvider.registerFileHandle(handle),
                                isDirectory: false
                            });
                        }
                        else if (webFileSystemAccess_1.WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                            result.complete({
                                resource: await fileSystemProvider.registerDirectoryHandle(handle),
                                isDirectory: true
                            });
                        }
                        else {
                            result.complete(undefined);
                        }
                    }
                    catch (error) {
                        result.complete(undefined);
                    }
                })();
            }
        }
        return (0, arrays_1.coalesce)(await Promise.all(results.map(result => result.p)));
    }
    async function extractFileListData(accessor, files) {
        const dialogService = accessor.get(dialogs_1.IDialogService);
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file) {
                // Skip for very large files because this operation is unbuffered
                if (file.size > 100 * files_1.ByteSize.MB) {
                    dialogService.warn((0, nls_1.localize)('fileTooLarge', "File is too large to open as untitled editor. Please upload it first into the file explorer and then try again."));
                    continue;
                }
                const result = new async_1.DeferredPromise();
                results.push(result);
                const reader = new FileReader();
                reader.onerror = () => result.complete(undefined);
                reader.onabort = () => result.complete(undefined);
                reader.onload = async (event) => {
                    const name = file.name;
                    const loadResult = event.target?.result ?? undefined;
                    if (typeof name !== 'string' || typeof loadResult === 'undefined') {
                        result.complete(undefined);
                        return;
                    }
                    result.complete({
                        resource: uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: name }),
                        contents: typeof loadResult === 'string' ? buffer_1.VSBuffer.fromString(loadResult) : buffer_1.VSBuffer.wrap(new Uint8Array(loadResult))
                    });
                };
                // Start reading
                reader.readAsArrayBuffer(file);
            }
        }
        return (0, arrays_1.coalesce)(await Promise.all(results.map(result => result.p)));
    }
    exports.extractFileListData = extractFileListData;
    //#endregion
    function containsDragType(event, ...dragTypesToFind) {
        if (!event.dataTransfer) {
            return false;
        }
        const dragTypes = event.dataTransfer.types;
        const lowercaseDragTypes = [];
        for (let i = 0; i < dragTypes.length; i++) {
            lowercaseDragTypes.push(dragTypes[i].toLowerCase()); // somehow the types are lowercase
        }
        for (const dragType of dragTypesToFind) {
            if (lowercaseDragTypes.indexOf(dragType.toLowerCase()) >= 0) {
                return true;
            }
        }
        return false;
    }
    exports.containsDragType = containsDragType;
    class DragAndDropContributionRegistry {
        constructor() {
            this._contributions = new Map();
        }
        register(contribution) {
            if (this._contributions.has(contribution.dataFormatKey)) {
                throw new Error(`A drag and drop contributiont with key '${contribution.dataFormatKey}' was already registered.`);
            }
            this._contributions.set(contribution.dataFormatKey, contribution);
        }
        getAll() {
            return this._contributions.values();
        }
    }
    exports.Extensions = {
        DragAndDropContribution: 'workbench.contributions.dragAndDrop'
    };
    platform_2.Registry.add(exports.Extensions.DragAndDropContribution, new DragAndDropContributionRegistry());
    //#endregion
    //#region DND Utilities
    /**
     * A singleton to store transfer data during drag & drop operations that are only valid within the application.
     */
    class LocalSelectionTransfer {
        static { this.INSTANCE = new LocalSelectionTransfer(); }
        constructor() {
            // protect against external instantiation
        }
        static getInstance() {
            return LocalSelectionTransfer.INSTANCE;
        }
        hasData(proto) {
            return proto && proto === this.proto;
        }
        clearData(proto) {
            if (this.hasData(proto)) {
                this.proto = undefined;
                this.data = undefined;
            }
        }
        getData(proto) {
            if (this.hasData(proto)) {
                return this.data;
            }
            return undefined;
        }
        setData(data, proto) {
            if (proto) {
                this.data = data;
                this.proto = proto;
            }
        }
    }
    exports.LocalSelectionTransfer = LocalSelectionTransfer;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZG5kL2Jyb3dzZXIvZG5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQThCaEcsZ0NBQWdDO0lBRW5CLFFBQUEsaUJBQWlCLEdBQUc7UUFDaEMsT0FBTyxFQUFFLGFBQWE7UUFDdEIsS0FBSyxFQUFFLFdBQVc7S0FDbEIsQ0FBQztJQW1CRixTQUFnQixzQkFBc0IsQ0FBQyxDQUFZO1FBQ2xELE1BQU0sT0FBTyxHQUFrQyxFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFdEQsOEJBQThCO1lBQzlCLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLHlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLElBQUksY0FBYyxFQUFFO2dCQUNuQixJQUFJO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFBLG1CQUFLLEVBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztpQkFDdkM7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7b0JBQ2YsbUJBQW1CO2lCQUNuQjthQUNEO1lBRUQsMkJBQTJCO2lCQUN0QjtnQkFDSixJQUFJO29CQUNILE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsbUJBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLDRDQUE0QyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztpQkFDaEY7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7b0JBQ2YsbUJBQW1CO2lCQUNuQjthQUNEO1lBRUQsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUU7Z0JBQzFCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3JELE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxJQUFJLElBQUksSUFBSyxJQUF1QyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTt3QkFDOUUsSUFBSTs0QkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUUsSUFBdUMsQ0FBQyxJQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7eUJBQ2pJO3dCQUFDLE9BQU8sS0FBSyxFQUFFOzRCQUNmLGNBQWM7eUJBQ2Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUVELCtCQUErQjtZQUMvQixNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyx5QkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRSxJQUFJLFlBQVksRUFBRTtnQkFDakIsSUFBSTtvQkFDSCxNQUFNLFNBQVMsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNyRCxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTt3QkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDM0Y7aUJBQ0Q7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7b0JBQ2YsbUJBQW1CO2lCQUNuQjthQUNEO1lBRUQsMEJBQTBCO1lBQzFCLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFtQyxrQkFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakgsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7Z0JBQ3pDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsSUFBSTt3QkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUNwRDtvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFDZixtQkFBbUI7cUJBQ25CO2lCQUNEO2FBQ0Q7U0FDRDtRQUVELGtFQUFrRTtRQUNsRSxnRUFBZ0U7UUFDaEUscUVBQXFFO1FBRXJFLE1BQU0sZ0JBQWdCLEdBQWtDLEVBQUUsQ0FBQztRQUMzRCxNQUFNLElBQUksR0FBRyxJQUFJLGlCQUFXLEVBQVcsQ0FBQztRQUN4QyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDckIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlCO2lCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDdEMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDaEM7U0FDRDtRQUVELE9BQU8sZ0JBQWdCLENBQUM7SUFDekIsQ0FBQztJQWpGRCx3REFpRkM7SUFFTSxLQUFLLFVBQVUsOEJBQThCLENBQUMsUUFBMEIsRUFBRSxDQUFZO1FBQzVGLE1BQU0sT0FBTyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFDLCtCQUErQjtRQUMvQixJQUFJLENBQUMsQ0FBQyxZQUFZLElBQUksZ0JBQUssSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsbUJBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN4RSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUNuQyxJQUFJLEtBQUssRUFBRTtnQkFDVixNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztnQkFDakUsTUFBTSxTQUFTLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0csS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7b0JBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2lCQUNuSjthQUNEO1NBQ0Q7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBaEJELHdFQWdCQztJQUVELFNBQWdCLDRDQUE0QyxDQUFDLGdCQUFvQztRQUNoRyxNQUFNLE9BQU8sR0FBa0MsRUFBRSxDQUFDO1FBRWxELElBQUksZ0JBQWdCLEVBQUU7WUFDckIsTUFBTSxZQUFZLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVELEtBQUssTUFBTSxXQUFXLElBQUksWUFBWSxFQUFFO2dCQUN2QyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsNkRBQTZEO29CQUNoRyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUEseUJBQWdCLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3hEO2FBQ0Q7U0FDRDtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFkRCxvR0FjQztJQVNELEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxRQUEwQixFQUFFLEtBQWdCO1FBRS9FLHdDQUF3QztRQUN4QyxJQUFJLHlDQUFtQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMxQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztZQUN4QyxJQUFJLEtBQUssRUFBRTtnQkFDVixPQUFPLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoRDtTQUNEO1FBRUQsZ0NBQWdDO1FBQ2hDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWCxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsT0FBTyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELEtBQUssVUFBVSx1QkFBdUIsQ0FBQyxRQUEwQixFQUFFLEtBQTJCO1FBQzdGLE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLENBQUMsa0JBQWtCLFlBQVksK0NBQXNCLENBQUMsRUFBRTtZQUM1RCxPQUFPLEVBQUUsQ0FBQyxDQUFDLHFDQUFxQztTQUNoRDtRQUVELE1BQU0sT0FBTyxHQUFxRCxFQUFFLENBQUM7UUFFckUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksSUFBSSxFQUFFO2dCQUNULE1BQU0sTUFBTSxHQUFHLElBQUksdUJBQWUsRUFBaUMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFckIsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDWCxJQUFJO3dCQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7d0JBQ2xELElBQUksQ0FBQyxNQUFNLEVBQUU7NEJBQ1osTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDM0IsT0FBTzt5QkFDUDt3QkFFRCxJQUFJLHlDQUFtQixDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUN2RCxNQUFNLENBQUMsUUFBUSxDQUFDO2dDQUNmLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztnQ0FDN0QsV0FBVyxFQUFFLEtBQUs7NkJBQ2xCLENBQUMsQ0FBQzt5QkFDSDs2QkFBTSxJQUFJLHlDQUFtQixDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUNuRSxNQUFNLENBQUMsUUFBUSxDQUFDO2dDQUNmLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQztnQ0FDbEUsV0FBVyxFQUFFLElBQUk7NkJBQ2pCLENBQUMsQ0FBQzt5QkFDSDs2QkFBTTs0QkFDTixNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3lCQUMzQjtxQkFDRDtvQkFBQyxPQUFPLEtBQUssRUFBRTt3QkFDZixNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUMzQjtnQkFDRixDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ0w7U0FDRDtRQUVELE9BQU8sSUFBQSxpQkFBUSxFQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU0sS0FBSyxVQUFVLG1CQUFtQixDQUFDLFFBQTBCLEVBQUUsS0FBZTtRQUNwRixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFjLENBQUMsQ0FBQztRQUVuRCxNQUFNLE9BQU8sR0FBcUQsRUFBRSxDQUFDO1FBRXJFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJLEVBQUU7Z0JBRVQsaUVBQWlFO2dCQUNqRSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLGdCQUFRLENBQUMsRUFBRSxFQUFFO29CQUNsQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxpSEFBaUgsQ0FBQyxDQUFDLENBQUM7b0JBQ2hLLFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSx1QkFBZSxFQUFpQyxDQUFDO2dCQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyQixNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUVoQyxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFbEQsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQztvQkFDckQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksT0FBTyxVQUFVLEtBQUssV0FBVyxFQUFFO3dCQUNsRSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUMzQixPQUFPO3FCQUNQO29CQUVELE1BQU0sQ0FBQyxRQUFRLENBQUM7d0JBQ2YsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO3dCQUM1RCxRQUFRLEVBQUUsT0FBTyxVQUFVLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ3RILENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUM7Z0JBRUYsZ0JBQWdCO2dCQUNoQixNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0I7U0FDRDtRQUVELE9BQU8sSUFBQSxpQkFBUSxFQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBM0NELGtEQTJDQztJQUVELFlBQVk7SUFFWixTQUFnQixnQkFBZ0IsQ0FBQyxLQUFnQixFQUFFLEdBQUcsZUFBeUI7UUFDOUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUU7WUFDeEIsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQzNDLE1BQU0sa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1FBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLGtDQUFrQztTQUN2RjtRQUVELEtBQUssTUFBTSxRQUFRLElBQUksZUFBZSxFQUFFO1lBQ3ZDLElBQUksa0JBQWtCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUQsT0FBTyxJQUFJLENBQUM7YUFDWjtTQUNEO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBbEJELDRDQWtCQztJQTJCRCxNQUFNLCtCQUErQjtRQUFyQztZQUNrQixtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1FBWS9FLENBQUM7UUFWQSxRQUFRLENBQUMsWUFBc0M7WUFDOUMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3hELE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLFlBQVksQ0FBQyxhQUFhLDJCQUEyQixDQUFDLENBQUM7YUFDbEg7WUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxNQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FDRDtJQUVZLFFBQUEsVUFBVSxHQUFHO1FBQ3pCLHVCQUF1QixFQUFFLHFDQUFxQztLQUM5RCxDQUFDO0lBRUYsbUJBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQVUsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLCtCQUErQixFQUFFLENBQUMsQ0FBQztJQUV4RixZQUFZO0lBRVosdUJBQXVCO0lBRXZCOztPQUVHO0lBQ0gsTUFBYSxzQkFBc0I7aUJBRVYsYUFBUSxHQUFHLElBQUksc0JBQXNCLEVBQUUsQ0FBQztRQUtoRTtZQUNDLHlDQUF5QztRQUMxQyxDQUFDO1FBRUQsTUFBTSxDQUFDLFdBQVc7WUFDakIsT0FBTyxzQkFBc0IsQ0FBQyxRQUFxQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBUTtZQUNmLE9BQU8sS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxTQUFTLENBQUMsS0FBUTtZQUNqQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO2dCQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQzthQUN0QjtRQUNGLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBUTtZQUNmLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxJQUFTLEVBQUUsS0FBUTtZQUMxQixJQUFJLEtBQUssRUFBRTtnQkFDVixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDbkI7UUFDRixDQUFDOztJQXZDRix3REF3Q0M7O0FBRUQsWUFBWSJ9