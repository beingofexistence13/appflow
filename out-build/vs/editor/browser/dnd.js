/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dnd", "vs/base/common/dataTransfer", "vs/base/common/mime", "vs/base/common/uri", "vs/platform/dnd/browser/dnd"], function (require, exports, dnd_1, dataTransfer_1, mime_1, uri_1, dnd_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b7 = exports.$a7 = void 0;
    function $a7(dataTransfer) {
        const vsDataTransfer = new dataTransfer_1.$Rs();
        for (const item of dataTransfer.items) {
            const type = item.type;
            if (item.kind === 'string') {
                const asStringValue = new Promise(resolve => item.getAsString(resolve));
                vsDataTransfer.append(type, (0, dataTransfer_1.$Ps)(asStringValue));
            }
            else if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    vsDataTransfer.append(type, createFileDataTransferItemFromFile(file));
                }
            }
        }
        return vsDataTransfer;
    }
    exports.$a7 = $a7;
    function createFileDataTransferItemFromFile(file) {
        const uri = file.path ? uri_1.URI.parse(file.path) : undefined;
        return (0, dataTransfer_1.$Qs)(file.name, uri, async () => {
            return new Uint8Array(await file.arrayBuffer());
        });
    }
    const INTERNAL_DND_MIME_TYPES = Object.freeze([
        dnd_2.$56.EDITORS,
        dnd_2.$56.FILES,
        dnd_1.$CP.RESOURCES,
        dnd_1.$CP.INTERNAL_URI_LIST,
    ]);
    function $b7(sourceDataTransfer, overwriteUriList = false) {
        const vsDataTransfer = $a7(sourceDataTransfer);
        // Try to expose the internal uri-list type as the standard type
        const uriList = vsDataTransfer.get(dnd_1.$CP.INTERNAL_URI_LIST);
        if (uriList) {
            vsDataTransfer.replace(mime_1.$Hr.uriList, uriList);
        }
        else {
            if (overwriteUriList || !vsDataTransfer.has(mime_1.$Hr.uriList)) {
                // Otherwise, fallback to adding dragged resources to the uri list
                const editorData = [];
                for (const item of sourceDataTransfer.items) {
                    const file = item.getAsFile();
                    if (file) {
                        const path = file.path;
                        try {
                            if (path) {
                                editorData.push(uri_1.URI.file(path).toString());
                            }
                            else {
                                editorData.push(uri_1.URI.parse(file.name, true).toString());
                            }
                        }
                        catch {
                            // Parsing failed. Leave out from list
                        }
                    }
                }
                if (editorData.length) {
                    vsDataTransfer.replace(mime_1.$Hr.uriList, (0, dataTransfer_1.$Ps)(dataTransfer_1.$Ts.create(editorData)));
                }
            }
        }
        for (const internal of INTERNAL_DND_MIME_TYPES) {
            vsDataTransfer.delete(internal);
        }
        return vsDataTransfer;
    }
    exports.$b7 = $b7;
});
//# sourceMappingURL=dnd.js.map