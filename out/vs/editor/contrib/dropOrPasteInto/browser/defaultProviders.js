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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/languageFeatures", "vs/nls", "vs/platform/workspace/common/workspace"], function (require, exports, arrays_1, dataTransfer_1, lifecycle_1, mime_1, network_1, resources_1, uri_1, languageFeatures_1, nls_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultPasteProvidersFeature = exports.DefaultDropProvidersFeature = void 0;
    const builtInLabel = (0, nls_1.localize)('builtIn', 'Built-in');
    class SimplePasteAndDropProvider {
        async provideDocumentPasteEdits(_model, _ranges, dataTransfer, token) {
            const edit = await this.getEdit(dataTransfer, token);
            return edit ? { insertText: edit.insertText, label: edit.label, detail: edit.detail, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo } : undefined;
        }
        async provideDocumentOnDropEdits(_model, _position, dataTransfer, token) {
            const edit = await this.getEdit(dataTransfer, token);
            return edit ? { insertText: edit.insertText, label: edit.label, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo } : undefined;
        }
    }
    class DefaultTextProvider extends SimplePasteAndDropProvider {
        constructor() {
            super(...arguments);
            this.id = 'text';
            this.dropMimeTypes = [mime_1.Mimes.text];
            this.pasteMimeTypes = [mime_1.Mimes.text];
        }
        async getEdit(dataTransfer, _token) {
            const textEntry = dataTransfer.get(mime_1.Mimes.text);
            if (!textEntry) {
                return;
            }
            // Suppress if there's also a uriList entry.
            // Typically the uri-list contains the same text as the text entry so showing both is confusing.
            if (dataTransfer.has(mime_1.Mimes.uriList)) {
                return;
            }
            const insertText = await textEntry.asString();
            return {
                handledMimeType: mime_1.Mimes.text,
                label: (0, nls_1.localize)('text.label', "Insert Plain Text"),
                detail: builtInLabel,
                insertText
            };
        }
    }
    class PathProvider extends SimplePasteAndDropProvider {
        constructor() {
            super(...arguments);
            this.id = 'uri';
            this.dropMimeTypes = [mime_1.Mimes.uriList];
            this.pasteMimeTypes = [mime_1.Mimes.uriList];
        }
        async getEdit(dataTransfer, token) {
            const entries = await extractUriList(dataTransfer);
            if (!entries.length || token.isCancellationRequested) {
                return;
            }
            let uriCount = 0;
            const insertText = entries
                .map(({ uri, originalText }) => {
                if (uri.scheme === network_1.Schemas.file) {
                    return uri.fsPath;
                }
                else {
                    uriCount++;
                    return originalText;
                }
            })
                .join(' ');
            let label;
            if (uriCount > 0) {
                // Dropping at least one generic uri (such as https) so use most generic label
                label = entries.length > 1
                    ? (0, nls_1.localize)('defaultDropProvider.uriList.uris', "Insert Uris")
                    : (0, nls_1.localize)('defaultDropProvider.uriList.uri', "Insert Uri");
            }
            else {
                // All the paths are file paths
                label = entries.length > 1
                    ? (0, nls_1.localize)('defaultDropProvider.uriList.paths', "Insert Paths")
                    : (0, nls_1.localize)('defaultDropProvider.uriList.path', "Insert Path");
            }
            return {
                handledMimeType: mime_1.Mimes.uriList,
                insertText,
                label,
                detail: builtInLabel,
            };
        }
    }
    let RelativePathProvider = class RelativePathProvider extends SimplePasteAndDropProvider {
        constructor(_workspaceContextService) {
            super();
            this._workspaceContextService = _workspaceContextService;
            this.id = 'relativePath';
            this.dropMimeTypes = [mime_1.Mimes.uriList];
            this.pasteMimeTypes = [mime_1.Mimes.uriList];
        }
        async getEdit(dataTransfer, token) {
            const entries = await extractUriList(dataTransfer);
            if (!entries.length || token.isCancellationRequested) {
                return;
            }
            const relativeUris = (0, arrays_1.coalesce)(entries.map(({ uri }) => {
                const root = this._workspaceContextService.getWorkspaceFolder(uri);
                return root ? (0, resources_1.relativePath)(root.uri, uri) : undefined;
            }));
            if (!relativeUris.length) {
                return;
            }
            return {
                handledMimeType: mime_1.Mimes.uriList,
                insertText: relativeUris.join(' '),
                label: entries.length > 1
                    ? (0, nls_1.localize)('defaultDropProvider.uriList.relativePaths', "Insert Relative Paths")
                    : (0, nls_1.localize)('defaultDropProvider.uriList.relativePath', "Insert Relative Path"),
                detail: builtInLabel,
            };
        }
    };
    RelativePathProvider = __decorate([
        __param(0, workspace_1.IWorkspaceContextService)
    ], RelativePathProvider);
    async function extractUriList(dataTransfer) {
        const urlListEntry = dataTransfer.get(mime_1.Mimes.uriList);
        if (!urlListEntry) {
            return [];
        }
        const strUriList = await urlListEntry.asString();
        const entries = [];
        for (const entry of dataTransfer_1.UriList.parse(strUriList)) {
            try {
                entries.push({ uri: uri_1.URI.parse(entry), originalText: entry });
            }
            catch {
                // noop
            }
        }
        return entries;
    }
    let DefaultDropProvidersFeature = class DefaultDropProvidersFeature extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, workspaceContextService) {
            super();
            this._register(languageFeaturesService.documentOnDropEditProvider.register('*', new DefaultTextProvider()));
            this._register(languageFeaturesService.documentOnDropEditProvider.register('*', new PathProvider()));
            this._register(languageFeaturesService.documentOnDropEditProvider.register('*', new RelativePathProvider(workspaceContextService)));
        }
    };
    exports.DefaultDropProvidersFeature = DefaultDropProvidersFeature;
    exports.DefaultDropProvidersFeature = DefaultDropProvidersFeature = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], DefaultDropProvidersFeature);
    let DefaultPasteProvidersFeature = class DefaultPasteProvidersFeature extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, workspaceContextService) {
            super();
            this._register(languageFeaturesService.documentPasteEditProvider.register('*', new DefaultTextProvider()));
            this._register(languageFeaturesService.documentPasteEditProvider.register('*', new PathProvider()));
            this._register(languageFeaturesService.documentPasteEditProvider.register('*', new RelativePathProvider(workspaceContextService)));
        }
    };
    exports.DefaultPasteProvidersFeature = DefaultPasteProvidersFeature;
    exports.DefaultPasteProvidersFeature = DefaultPasteProvidersFeature = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], DefaultPasteProvidersFeature);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdFByb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2Ryb3BPclBhc3RlSW50by9icm93c2VyL2RlZmF1bHRQcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRyxNQUFNLFlBQVksR0FBRyxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFckQsTUFBZSwwQkFBMEI7UUFNeEMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLE1BQWtCLEVBQUUsT0FBMEIsRUFBRSxZQUFxQyxFQUFFLEtBQXdCO1lBQzlJLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2pLLENBQUM7UUFFRCxLQUFLLENBQUMsMEJBQTBCLENBQUMsTUFBa0IsRUFBRSxTQUFvQixFQUFFLFlBQXFDLEVBQUUsS0FBd0I7WUFDekksTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsSUFB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