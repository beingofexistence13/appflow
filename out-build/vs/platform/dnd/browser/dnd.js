/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dnd", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/map", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/nls!vs/platform/dnd/browser/dnd", "vs/platform/dialogs/common/dialogs", "vs/platform/files/browser/htmlFileSystemProvider", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/registry/common/platform"], function (require, exports, dnd_1, arrays_1, async_1, buffer_1, map_1, marshalling_1, network_1, platform_1, uri_1, nls_1, dialogs_1, htmlFileSystemProvider_1, webFileSystemAccess_1, files_1, instantiation_1, opener_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_6 = exports.$$6 = exports.$06 = exports.$96 = exports.$86 = exports.$76 = exports.$66 = exports.$56 = void 0;
    //#region Editor / Resources DND
    exports.$56 = {
        EDITORS: 'CodeEditors',
        FILES: 'CodeFiles'
    };
    function $66(e) {
        const editors = [];
        if (e.dataTransfer && e.dataTransfer.types.length > 0) {
            // Data Transfer: Code Editors
            const rawEditorsData = e.dataTransfer.getData(exports.$56.EDITORS);
            if (rawEditorsData) {
                try {
                    editors.push(...(0, marshalling_1.$0g)(rawEditorsData));
                }
                catch (error) {
                    // Invalid transfer
                }
            }
            // Data Transfer: Resources
            else {
                try {
                    const rawResourcesData = e.dataTransfer.getData(dnd_1.$CP.RESOURCES);
                    editors.push(...$86(rawResourcesData));
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
            const rawCodeFiles = e.dataTransfer.getData(exports.$56.FILES);
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
            const contributions = platform_2.$8m.as(exports.$$6.DragAndDropContribution).getAll();
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
        const seen = new map_1.$zi();
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
    exports.$66 = $66;
    async function $76(accessor, e) {
        const editors = $66(e);
        // Web: Check for file transfer
        if (e.dataTransfer && platform_1.$o && $06(e, dnd_1.$CP.FILES)) {
            const files = e.dataTransfer.items;
            if (files) {
                const instantiationService = accessor.get(instantiation_1.$Ah);
                const filesData = await instantiationService.invokeFunction(accessor => extractFilesDropData(accessor, e));
                for (const fileData of filesData) {
                    editors.push({ resource: fileData.resource, contents: fileData.contents?.toString(), isExternal: true, allowWorkspaceOpen: fileData.isDirectory });
                }
            }
        }
        return editors;
    }
    exports.$76 = $76;
    function $86(rawResourcesData) {
        const editors = [];
        if (rawResourcesData) {
            const resourcesRaw = JSON.parse(rawResourcesData);
            for (const resourceRaw of resourcesRaw) {
                if (resourceRaw.indexOf(':') > 0) { // mitigate https://github.com/microsoft/vscode/issues/124946
                    const { selection, uri } = (0, opener_1.$RT)(uri_1.URI.parse(resourceRaw));
                    editors.push({ resource: uri, options: { selection } });
                }
            }
        }
        return editors;
    }
    exports.$86 = $86;
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
        return $96(accessor, files);
    }
    async function extractFileTransferData(accessor, items) {
        const fileSystemProvider = accessor.get(files_1.$6j).getProvider(network_1.Schemas.file);
        if (!(fileSystemProvider instanceof htmlFileSystemProvider_1.$46)) {
            return []; // only supported when running in web
        }
        const results = [];
        for (let i = 0; i < items.length; i++) {
            const file = items[i];
            if (file) {
                const result = new async_1.$2g();
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
        return (0, arrays_1.$Fb)(await Promise.all(results.map(result => result.p)));
    }
    async function $96(accessor, files) {
        const dialogService = accessor.get(dialogs_1.$oA);
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file) {
                // Skip for very large files because this operation is unbuffered
                if (file.size > 100 * files_1.$Ak.MB) {
                    dialogService.warn((0, nls_1.localize)(0, null));
                    continue;
                }
                const result = new async_1.$2g();
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
                        contents: typeof loadResult === 'string' ? buffer_1.$Fd.fromString(loadResult) : buffer_1.$Fd.wrap(new Uint8Array(loadResult))
                    });
                };
                // Start reading
                reader.readAsArrayBuffer(file);
            }
        }
        return (0, arrays_1.$Fb)(await Promise.all(results.map(result => result.p)));
    }
    exports.$96 = $96;
    //#endregion
    function $06(event, ...dragTypesToFind) {
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
    exports.$06 = $06;
    class DragAndDropContributionRegistry {
        constructor() {
            this.a = new Map();
        }
        register(contribution) {
            if (this.a.has(contribution.dataFormatKey)) {
                throw new Error(`A drag and drop contributiont with key '${contribution.dataFormatKey}' was already registered.`);
            }
            this.a.set(contribution.dataFormatKey, contribution);
        }
        getAll() {
            return this.a.values();
        }
    }
    exports.$$6 = {
        DragAndDropContribution: 'workbench.contributions.dragAndDrop'
    };
    platform_2.$8m.add(exports.$$6.DragAndDropContribution, new DragAndDropContributionRegistry());
    //#endregion
    //#region DND Utilities
    /**
     * A singleton to store transfer data during drag & drop operations that are only valid within the application.
     */
    class $_6 {
        static { this.a = new $_6(); }
        constructor() {
            // protect against external instantiation
        }
        static getInstance() {
            return $_6.a;
        }
        hasData(proto) {
            return proto && proto === this.c;
        }
        clearData(proto) {
            if (this.hasData(proto)) {
                this.c = undefined;
                this.b = undefined;
            }
        }
        getData(proto) {
            if (this.hasData(proto)) {
                return this.b;
            }
            return undefined;
        }
        setData(data, proto) {
            if (proto) {
                this.b = data;
                this.c = proto;
            }
        }
    }
    exports.$_6 = $_6;
});
//#endregion
//# sourceMappingURL=dnd.js.map