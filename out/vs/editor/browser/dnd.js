/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dnd", "vs/base/common/dataTransfer", "vs/base/common/mime", "vs/base/common/uri", "vs/platform/dnd/browser/dnd"], function (require, exports, dnd_1, dataTransfer_1, mime_1, uri_1, dnd_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toExternalVSDataTransfer = exports.toVSDataTransfer = void 0;
    function toVSDataTransfer(dataTransfer) {
        const vsDataTransfer = new dataTransfer_1.VSDataTransfer();
        for (const item of dataTransfer.items) {
            const type = item.type;
            if (item.kind === 'string') {
                const asStringValue = new Promise(resolve => item.getAsString(resolve));
                vsDataTransfer.append(type, (0, dataTransfer_1.createStringDataTransferItem)(asStringValue));
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
    exports.toVSDataTransfer = toVSDataTransfer;
    function createFileDataTransferItemFromFile(file) {
        const uri = file.path ? uri_1.URI.parse(file.path) : undefined;
        return (0, dataTransfer_1.createFileDataTransferItem)(file.name, uri, async () => {
            return new Uint8Array(await file.arrayBuffer());
        });
    }
    const INTERNAL_DND_MIME_TYPES = Object.freeze([
        dnd_2.CodeDataTransfers.EDITORS,
        dnd_2.CodeDataTransfers.FILES,
        dnd_1.DataTransfers.RESOURCES,
        dnd_1.DataTransfers.INTERNAL_URI_LIST,
    ]);
    function toExternalVSDataTransfer(sourceDataTransfer, overwriteUriList = false) {
        const vsDataTransfer = toVSDataTransfer(sourceDataTransfer);
        // Try to expose the internal uri-list type as the standard type
        const uriList = vsDataTransfer.get(dnd_1.DataTransfers.INTERNAL_URI_LIST);
        if (uriList) {
            vsDataTransfer.replace(mime_1.Mimes.uriList, uriList);
        }
        else {
            if (overwriteUriList || !vsDataTransfer.has(mime_1.Mimes.uriList)) {
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
                    vsDataTransfer.replace(mime_1.Mimes.uriList, (0, dataTransfer_1.createStringDataTransferItem)(dataTransfer_1.UriList.create(editorData)));
                }
            }
        }
        for (const internal of INTERNAL_DND_MIME_TYPES) {
            vsDataTransfer.delete(internal);
        }
        return vsDataTransfer;
    }
    exports.toExternalVSDataTransfer = toExternalVSDataTransfer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvZG5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxTQUFnQixnQkFBZ0IsQ0FBQyxZQUEwQjtRQUMxRCxNQUFNLGNBQWMsR0FBRyxJQUFJLDZCQUFjLEVBQUUsQ0FBQztRQUM1QyxLQUFLLE1BQU0sSUFBSSxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUMzQixNQUFNLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBUyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBQSwyQ0FBNEIsRUFBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQ3pFO2lCQUFNLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7Z0JBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsa0NBQWtDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDdEU7YUFDRDtTQUNEO1FBQ0QsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQWZELDRDQWVDO0lBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxJQUFVO1FBQ3JELE1BQU0sR0FBRyxHQUFJLElBQXVDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFFLElBQXVDLENBQUMsSUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNsSSxPQUFPLElBQUEseUNBQTBCLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDNUQsT0FBTyxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM3Qyx1QkFBaUIsQ0FBQyxPQUFPO1FBQ3pCLHVCQUFpQixDQUFDLEtBQUs7UUFDdkIsbUJBQWEsQ0FBQyxTQUFTO1FBQ3ZCLG1CQUFhLENBQUMsaUJBQWlCO0tBQy9CLENBQUMsQ0FBQztJQUVILFNBQWdCLHdCQUF3QixDQUFDLGtCQUFnQyxFQUFFLGdCQUFnQixHQUFHLEtBQUs7UUFDbEcsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUU1RCxnRUFBZ0U7UUFDaEUsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxtQkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEUsSUFBSSxPQUFPLEVBQUU7WUFDWixjQUFjLENBQUMsT0FBTyxDQUFDLFlBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDL0M7YUFBTTtZQUNOLElBQUksZ0JBQWdCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFlBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0Qsa0VBQWtFO2dCQUNsRSxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7Z0JBQ2hDLEtBQUssTUFBTSxJQUFJLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFO29CQUM1QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQzlCLElBQUksSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxHQUFJLElBQXVDLENBQUMsSUFBSSxDQUFDO3dCQUMzRCxJQUFJOzRCQUNILElBQUksSUFBSSxFQUFFO2dDQUNULFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOzZCQUMzQztpQ0FBTTtnQ0FDTixVQUFVLENBQUMsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOzZCQUN2RDt5QkFDRDt3QkFBQyxNQUFNOzRCQUNQLHNDQUFzQzt5QkFDdEM7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO29CQUN0QixjQUFjLENBQUMsT0FBTyxDQUFDLFlBQUssQ0FBQyxPQUFPLEVBQUUsSUFBQSwyQ0FBNEIsRUFBQyxzQkFBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hHO2FBQ0Q7U0FDRDtRQUVELEtBQUssTUFBTSxRQUFRLElBQUksdUJBQXVCLEVBQUU7WUFDL0MsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNoQztRQUVELE9BQU8sY0FBYyxDQUFDO0lBQ3ZCLENBQUM7SUF0Q0QsNERBc0NDIn0=