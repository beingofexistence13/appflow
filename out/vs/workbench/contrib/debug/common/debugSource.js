/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/resources", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/base/common/network", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, nls, uri_1, path_1, resources, debug_1, editorService_1, network_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUriFromSource = exports.Source = exports.UNKNOWN_SOURCE_LABEL = void 0;
    exports.UNKNOWN_SOURCE_LABEL = nls.localize('unknownSource', "Unknown Source");
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
    class Source {
        constructor(raw_, sessionId, uriIdentityService, logService) {
            let path;
            if (raw_) {
                this.raw = raw_;
                path = this.raw.path || this.raw.name || '';
                this.available = true;
            }
            else {
                this.raw = { name: exports.UNKNOWN_SOURCE_LABEL };
                this.available = false;
                path = `${debug_1.DEBUG_SCHEME}:${exports.UNKNOWN_SOURCE_LABEL}`;
            }
            this.uri = getUriFromSource(this.raw, path, sessionId, uriIdentityService, logService);
        }
        get name() {
            return this.raw.name || resources.basenameOrAuthority(this.uri);
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
            return this.uri.scheme === debug_1.DEBUG_SCHEME;
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
            }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
        }
        static getEncodedDebugData(modelUri) {
            let path;
            let sourceReference;
            let sessionId;
            switch (modelUri.scheme) {
                case network_1.Schemas.file:
                    path = (0, path_1.normalize)(modelUri.fsPath);
                    break;
                case debug_1.DEBUG_SCHEME:
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
                name: resources.basenameOrAuthority(modelUri),
                path,
                sourceReference,
                sessionId
            };
        }
    }
    exports.Source = Source;
    function getUriFromSource(raw, path, sessionId, uriIdentityService, logService) {
        const _getUriFromSource = (path) => {
            if (typeof raw.sourceReference === 'number' && raw.sourceReference > 0) {
                return uri_1.URI.from({
                    scheme: debug_1.DEBUG_SCHEME,
                    path,
                    query: `session=${sessionId}&ref=${raw.sourceReference}`
                });
            }
            if (path && (0, debugUtils_1.isUri)(path)) { // path looks like a uri
                return uriIdentityService.asCanonicalUri(uri_1.URI.parse(path));
            }
            // assume a filesystem path
            if (path && (0, path_1.isAbsolute)(path)) {
                return uriIdentityService.asCanonicalUri(uri_1.URI.file(path));
            }
            // path is relative: since VS Code cannot deal with this by itself
            // create a debug url that will result in a DAP 'source' request when the url is resolved.
            return uriIdentityService.asCanonicalUri(uri_1.URI.from({
                scheme: debug_1.DEBUG_SCHEME,
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
    exports.getUriFromSource = getUriFromSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9jb21tb24vZGVidWdTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JuRixRQUFBLG9CQUFvQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFFcEY7Ozs7Ozs7Ozs7O09BV0c7SUFFSCxNQUFhLE1BQU07UUFNbEIsWUFBWSxJQUFzQyxFQUFFLFNBQWlCLEVBQUUsa0JBQXVDLEVBQUUsVUFBdUI7WUFDdEksSUFBSSxJQUFZLENBQUM7WUFDakIsSUFBSSxJQUFJLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQ3RCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsNEJBQW9CLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7Z0JBQ3ZCLElBQUksR0FBRyxHQUFHLG9CQUFZLElBQUksNEJBQW9CLEVBQUUsQ0FBQzthQUNqRDtZQUVELElBQUksQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxtQkFBbUIsQ0FB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