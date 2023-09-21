/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/debugSource", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/resources", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/base/common/network", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, nls, uri_1, path_1, resources, debug_1, editorService_1, network_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xF = exports.$wF = exports.$vF = void 0;
    exports.$vF = nls.localize(0, null);
    /**
     * Debug URI format
     *
     * a debug URI represents a Source object and the debug session where the Source comes from.
     *
     *       debug:arbitrary_path?session=123e4567-e89b-12d3-a456-426655440000&ref=1016
     *       \___/ \____________/ \__________________________________________/ \______/
     *         |          |                             |                          |
     *      scheme   source.path                    session id            source.reference
     *
     *
     */
    class $wF {
        constructor(raw_, sessionId, uriIdentityService, logService) {
            let path;
            if (raw_) {
                this.raw = raw_;
                path = this.raw.path || this.raw.name || '';
                this.available = true;
            }
            else {
                this.raw = { name: exports.$vF };
                this.available = false;
                path = `${debug_1.$jH}:${exports.$vF}`;
            }
            this.uri = $xF(this.raw, path, sessionId, uriIdentityService, logService);
        }
        get name() {
            return this.raw.name || resources.$eg(this.uri);
        }
        get origin() {
            return this.raw.origin;
        }
        get presentationHint() {
            return this.raw.presentationHint;
        }
        get reference() {
            return this.raw.sourceReference;
        }
        get inMemory() {
            return this.uri.scheme === debug_1.$jH;
        }
        openInEditor(editorService, selection, preserveFocus, sideBySide, pinned) {
            return !this.available ? Promise.resolve(undefined) : editorService.openEditor({
                resource: this.uri,
                description: this.origin,
                options: {
                    preserveFocus,
                    selection,
                    revealIfOpened: true,
                    selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */,
                    pinned
                }
            }, sideBySide ? editorService_1.$$C : editorService_1.$0C);
        }
        static getEncodedDebugData(modelUri) {
            let path;
            let sourceReference;
            let sessionId;
            switch (modelUri.scheme) {
                case network_1.Schemas.file:
                    path = (0, path_1.$7d)(modelUri.fsPath);
                    break;
                case debug_1.$jH:
                    path = modelUri.path;
                    if (modelUri.query) {
                        const keyvalues = modelUri.query.split('&');
                        for (const keyvalue of keyvalues) {
                            const pair = keyvalue.split('=');
                            if (pair.length === 2) {
                                switch (pair[0]) {
                                    case 'session':
                                        sessionId = pair[1];
                                        break;
                                    case 'ref':
                                        sourceReference = parseInt(pair[1]);
                                        break;
                                }
                            }
                        }
                    }
                    break;
                default:
                    path = modelUri.toString();
                    break;
            }
            return {
                name: resources.$eg(modelUri),
                path,
                sourceReference,
                sessionId
            };
        }
    }
    exports.$wF = $wF;
    function $xF(raw, path, sessionId, uriIdentityService, logService) {
        const _getUriFromSource = (path) => {
            if (typeof raw.sourceReference === 'number' && raw.sourceReference > 0) {
                return uri_1.URI.from({
                    scheme: debug_1.$jH,
                    path,
                    query: `session=${sessionId}&ref=${raw.sourceReference}`
                });
            }
            if (path && (0, debugUtils_1.$pF)(path)) { // path looks like a uri
                return uriIdentityService.asCanonicalUri(uri_1.URI.parse(path));
            }
            // assume a filesystem path
            if (path && (0, path_1.$8d)(path)) {
                return uriIdentityService.asCanonicalUri(uri_1.URI.file(path));
            }
            // path is relative: since VS Code cannot deal with this by itself
            // create a debug url that will result in a DAP 'source' request when the url is resolved.
            return uriIdentityService.asCanonicalUri(uri_1.URI.from({
                scheme: debug_1.$jH,
                path,
                query: `session=${sessionId}`
            }));
        };
        try {
            return _getUriFromSource(path);
        }
        catch (err) {
            logService.error('Invalid path from debug adapter: ' + path);
            return _getUriFromSource('/invalidDebugSource');
        }
    }
    exports.$xF = $xF;
});
//# sourceMappingURL=debugSource.js.map