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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/languageFeatures", "vs/nls!vs/editor/contrib/dropOrPasteInto/browser/defaultProviders", "vs/platform/workspace/common/workspace"], function (require, exports, arrays_1, dataTransfer_1, lifecycle_1, mime_1, network_1, resources_1, uri_1, languageFeatures_1, nls_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$k7 = exports.$j7 = void 0;
    const builtInLabel = (0, nls_1.localize)(0, null);
    class SimplePasteAndDropProvider {
        async provideDocumentPasteEdits(_model, _ranges, dataTransfer, token) {
            const edit = await this.a(dataTransfer, token);
            return edit ? { insertText: edit.insertText, label: edit.label, detail: edit.detail, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo } : undefined;
        }
        async provideDocumentOnDropEdits(_model, _position, dataTransfer, token) {
            const edit = await this.a(dataTransfer, token);
            return edit ? { insertText: edit.insertText, label: edit.label, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo } : undefined;
        }
    }
    class DefaultTextProvider extends SimplePasteAndDropProvider {
        constructor() {
            super(...arguments);
            this.id = 'text';
            this.dropMimeTypes = [mime_1.$Hr.text];
            this.pasteMimeTypes = [mime_1.$Hr.text];
        }
        async a(dataTransfer, _token) {
            const textEntry = dataTransfer.get(mime_1.$Hr.text);
            if (!textEntry) {
                return;
            }
            // Suppress if there's also a uriList entry.
            // Typically the uri-list contains the same text as the text entry so showing both is confusing.
            if (dataTransfer.has(mime_1.$Hr.uriList)) {
                return;
            }
            const insertText = await textEntry.asString();
            return {
                handledMimeType: mime_1.$Hr.text,
                label: (0, nls_1.localize)(1, null),
                detail: builtInLabel,
                insertText
            };
        }
    }
    class PathProvider extends SimplePasteAndDropProvider {
        constructor() {
            super(...arguments);
            this.id = 'uri';
            this.dropMimeTypes = [mime_1.$Hr.uriList];
            this.pasteMimeTypes = [mime_1.$Hr.uriList];
        }
        async a(dataTransfer, token) {
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
                    ? (0, nls_1.localize)(2, null)
                    : (0, nls_1.localize)(3, null);
            }
            else {
                // All the paths are file paths
                label = entries.length > 1
                    ? (0, nls_1.localize)(4, null)
                    : (0, nls_1.localize)(5, null);
            }
            return {
                handledMimeType: mime_1.$Hr.uriList,
                insertText,
                label,
                detail: builtInLabel,
            };
        }
    }
    let RelativePathProvider = class RelativePathProvider extends SimplePasteAndDropProvider {
        constructor(b) {
            super();
            this.b = b;
            this.id = 'relativePath';
            this.dropMimeTypes = [mime_1.$Hr.uriList];
            this.pasteMimeTypes = [mime_1.$Hr.uriList];
        }
        async a(dataTransfer, token) {
            const entries = await extractUriList(dataTransfer);
            if (!entries.length || token.isCancellationRequested) {
                return;
            }
            const relativeUris = (0, arrays_1.$Fb)(entries.map(({ uri }) => {
                const root = this.b.getWorkspaceFolder(uri);
                return root ? (0, resources_1.$kg)(root.uri, uri) : undefined;
            }));
            if (!relativeUris.length) {
                return;
            }
            return {
                handledMimeType: mime_1.$Hr.uriList,
                insertText: relativeUris.join(' '),
                label: entries.length > 1
                    ? (0, nls_1.localize)(6, null)
                    : (0, nls_1.localize)(7, null),
                detail: builtInLabel,
            };
        }
    };
    RelativePathProvider = __decorate([
        __param(0, workspace_1.$Kh)
    ], RelativePathProvider);
    async function extractUriList(dataTransfer) {
        const urlListEntry = dataTransfer.get(mime_1.$Hr.uriList);
        if (!urlListEntry) {
            return [];
        }
        const strUriList = await urlListEntry.asString();
        const entries = [];
        for (const entry of dataTransfer_1.$Ts.parse(strUriList)) {
            try {
                entries.push({ uri: uri_1.URI.parse(entry), originalText: entry });
            }
            catch {
                // noop
            }
        }
        return entries;
    }
    let $j7 = class $j7 extends lifecycle_1.$kc {
        constructor(languageFeaturesService, workspaceContextService) {
            super();
            this.B(languageFeaturesService.documentOnDropEditProvider.register('*', new DefaultTextProvider()));
            this.B(languageFeaturesService.documentOnDropEditProvider.register('*', new PathProvider()));
            this.B(languageFeaturesService.documentOnDropEditProvider.register('*', new RelativePathProvider(workspaceContextService)));
        }
    };
    exports.$j7 = $j7;
    exports.$j7 = $j7 = __decorate([
        __param(0, languageFeatures_1.$hF),
        __param(1, workspace_1.$Kh)
    ], $j7);
    let $k7 = class $k7 extends lifecycle_1.$kc {
        constructor(languageFeaturesService, workspaceContextService) {
            super();
            this.B(languageFeaturesService.documentPasteEditProvider.register('*', new DefaultTextProvider()));
            this.B(languageFeaturesService.documentPasteEditProvider.register('*', new PathProvider()));
            this.B(languageFeaturesService.documentPasteEditProvider.register('*', new RelativePathProvider(workspaceContextService)));
        }
    };
    exports.$k7 = $k7;
    exports.$k7 = $k7 = __decorate([
        __param(0, languageFeatures_1.$hF),
        __param(1, workspace_1.$Kh)
    ], $k7);
});
//# sourceMappingURL=defaultProviders.js.map