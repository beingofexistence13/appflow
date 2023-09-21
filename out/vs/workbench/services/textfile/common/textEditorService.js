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
define(["require", "exports", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/base/common/map", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/base/common/network", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorResolverService", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions"], function (require, exports, event_1, platform_1, map_1, instantiation_1, editor_1, untitledTextEditorService_1, network_1, diffEditorInput_1, sideBySideEditorInput_1, textResourceEditorInput_1, untitledTextEditorInput_1, resources_1, uri_1, uriIdentity_1, files_1, editorResolverService_1, lifecycle_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextEditorService = exports.ITextEditorService = void 0;
    exports.ITextEditorService = (0, instantiation_1.createDecorator)('textEditorService');
    let TextEditorService = class TextEditorService extends lifecycle_1.Disposable {
        constructor(untitledTextEditorService, instantiationService, uriIdentityService, fileService, editorResolverService) {
            super();
            this.untitledTextEditorService = untitledTextEditorService;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this.editorResolverService = editorResolverService;
            this.editorInputCache = new map_1.ResourceMap();
            this.fileEditorFactory = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).getFileEditorFactory();
            // Register the default editor to the editor resolver
            // service so that it shows up in the editors picker
            this.registerDefaultEditor();
        }
        registerDefaultEditor() {
            this._register(this.editorResolverService.registerEditor('*', {
                id: editor_1.DEFAULT_EDITOR_ASSOCIATION.id,
                label: editor_1.DEFAULT_EDITOR_ASSOCIATION.displayName,
                detail: editor_1.DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {}, {
                createEditorInput: editor => ({ editor: this.createTextEditor(editor) }),
                createUntitledEditorInput: untitledEditor => ({ editor: this.createTextEditor(untitledEditor) }),
                createDiffEditorInput: diffEditor => ({ editor: this.createTextEditor(diffEditor) })
            }));
        }
        async resolveTextEditor(input) {
            return this.createTextEditor(input);
        }
        createTextEditor(input) {
            // Merge Editor Not Supported (we fallback to showing the result only)
            if ((0, editor_1.isResourceMergeEditorInput)(input)) {
                return this.createTextEditor(input.result);
            }
            // Diff Editor Support
            if ((0, editor_1.isResourceDiffEditorInput)(input)) {
                const original = this.createTextEditor(input.original);
                const modified = this.createTextEditor(input.modified);
                return this.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, input.label, input.description, original, modified, undefined);
            }
            // Side by Side Editor Support
            if ((0, editor_1.isResourceSideBySideEditorInput)(input)) {
                const primary = this.createTextEditor(input.primary);
                const secondary = this.createTextEditor(input.secondary);
                return this.instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, input.label, input.description, secondary, primary);
            }
            // Untitled text file support
            const untitledInput = input;
            if (untitledInput.forceUntitled || !untitledInput.resource || (untitledInput.resource.scheme === network_1.Schemas.untitled)) {
                const untitledOptions = {
                    languageId: untitledInput.languageId,
                    initialValue: untitledInput.contents,
                    encoding: untitledInput.encoding
                };
                // Untitled resource: use as hint for an existing untitled editor
                let untitledModel;
                if (untitledInput.resource?.scheme === network_1.Schemas.untitled) {
                    untitledModel = this.untitledTextEditorService.create({ untitledResource: untitledInput.resource, ...untitledOptions });
                }
                // Other resource: use as hint for associated filepath
                else {
                    untitledModel = this.untitledTextEditorService.create({ associatedResource: untitledInput.resource, ...untitledOptions });
                }
                return this.createOrGetCached(untitledModel.resource, () => {
                    // Factory function for new untitled editor
                    const input = this.instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, untitledModel);
                    // We dispose the untitled model once the editor
                    // is being disposed. Even though we may have not
                    // created the model initially, the lifecycle for
                    // untitled is tightly coupled with the editor
                    // lifecycle for now.
                    event_1.Event.once(input.onWillDispose)(() => untitledModel.dispose());
                    return input;
                });
            }
            // Text File/Resource Editor Support
            const textResourceEditorInput = input;
            if (textResourceEditorInput.resource instanceof uri_1.URI) {
                // Derive the label from the path if not provided explicitly
                const label = textResourceEditorInput.label || (0, resources_1.basename)(textResourceEditorInput.resource);
                // We keep track of the preferred resource this input is to be created
                // with but it may be different from the canonical resource (see below)
                const preferredResource = textResourceEditorInput.resource;
                // From this moment on, only operate on the canonical resource
                // to ensure we reduce the chance of opening the same resource
                // with different resource forms (e.g. path casing on Windows)
                const canonicalResource = this.uriIdentityService.asCanonicalUri(preferredResource);
                return this.createOrGetCached(canonicalResource, () => {
                    // File
                    if (textResourceEditorInput.forceFile || this.fileService.hasProvider(canonicalResource)) {
                        return this.fileEditorFactory.createFileEditor(canonicalResource, preferredResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.encoding, textResourceEditorInput.languageId, textResourceEditorInput.contents, this.instantiationService);
                    }
                    // Resource
                    return this.instantiationService.createInstance(textResourceEditorInput_1.TextResourceEditorInput, canonicalResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.languageId, textResourceEditorInput.contents);
                }, cachedInput => {
                    // Untitled
                    if (cachedInput instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
                        return;
                    }
                    // Files
                    else if (!(cachedInput instanceof textResourceEditorInput_1.TextResourceEditorInput)) {
                        cachedInput.setPreferredResource(preferredResource);
                        if (textResourceEditorInput.label) {
                            cachedInput.setPreferredName(textResourceEditorInput.label);
                        }
                        if (textResourceEditorInput.description) {
                            cachedInput.setPreferredDescription(textResourceEditorInput.description);
                        }
                        if (textResourceEditorInput.encoding) {
                            cachedInput.setPreferredEncoding(textResourceEditorInput.encoding);
                        }
                        if (textResourceEditorInput.languageId) {
                            cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
                        }
                        if (typeof textResourceEditorInput.contents === 'string') {
                            cachedInput.setPreferredContents(textResourceEditorInput.contents);
                        }
                    }
                    // Resources
                    else {
                        if (label) {
                            cachedInput.setName(label);
                        }
                        if (textResourceEditorInput.description) {
                            cachedInput.setDescription(textResourceEditorInput.description);
                        }
                        if (textResourceEditorInput.languageId) {
                            cachedInput.setPreferredLanguageId(textResourceEditorInput.languageId);
                        }
                        if (typeof textResourceEditorInput.contents === 'string') {
                            cachedInput.setPreferredContents(textResourceEditorInput.contents);
                        }
                    }
                });
            }
            throw new Error(`ITextEditorService: Unable to create texteditor from ${JSON.stringify(input)}`);
        }
        createOrGetCached(resource, factoryFn, cachedFn) {
            // Return early if already cached
            let input = this.editorInputCache.get(resource);
            if (input) {
                cachedFn?.(input);
                return input;
            }
            // Otherwise create and add to cache
            input = factoryFn();
            this.editorInputCache.set(resource, input);
            event_1.Event.once(input.onWillDispose)(() => this.editorInputCache.delete(resource));
            return input;
        }
    };
    exports.TextEditorService = TextEditorService;
    exports.TextEditorService = TextEditorService = __decorate([
        __param(0, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, files_1.IFileService),
        __param(4, editorResolverService_1.IEditorResolverService)
    ], TextEditorService);
    (0, extensions_1.registerSingleton)(exports.ITextEditorService, TextEditorService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEVkaXRvclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dGZpbGUvY29tbW9uL3RleHRFZGl0b3JTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCbkYsUUFBQSxrQkFBa0IsR0FBRyxJQUFBLCtCQUFlLEVBQXFCLG1CQUFtQixDQUFDLENBQUM7SUErQnBGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFRaEQsWUFDNkIseUJBQXNFLEVBQzNFLG9CQUE0RCxFQUM5RCxrQkFBd0QsRUFDL0QsV0FBMEMsRUFDaEMscUJBQThEO1lBRXRGLEtBQUssRUFBRSxDQUFDO1lBTnFDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBNEI7WUFDMUQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM3Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2YsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQVR0RSxxQkFBZ0IsR0FBRyxJQUFJLGlCQUFXLEVBQXdFLENBQUM7WUFFM0csc0JBQWlCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLHlCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFXL0gscURBQXFEO1lBQ3JELG9EQUFvRDtZQUNwRCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRU8scUJBQXFCO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FDdkQsR0FBRyxFQUNIO2dCQUNDLEVBQUUsRUFBRSxtQ0FBMEIsQ0FBQyxFQUFFO2dCQUNqQyxLQUFLLEVBQUUsbUNBQTBCLENBQUMs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