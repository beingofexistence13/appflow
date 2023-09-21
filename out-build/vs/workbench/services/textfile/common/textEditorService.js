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
    exports.$txb = exports.$sxb = void 0;
    exports.$sxb = (0, instantiation_1.$Bh)('textEditorService');
    let $txb = class $txb extends lifecycle_1.$kc {
        constructor(c, f, g, h, j) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = new map_1.$zi();
            this.b = platform_1.$8m.as(editor_1.$GE.EditorFactory).getFileEditorFactory();
            // Register the default editor to the editor resolver
            // service so that it shows up in the editors picker
            this.m();
        }
        m() {
            this.B(this.j.registerEditor('*', {
                id: editor_1.$HE.id,
                label: editor_1.$HE.displayName,
                detail: editor_1.$HE.providerDisplayName,
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
            if ((0, editor_1.$RE)(input)) {
                return this.createTextEditor(input.result);
            }
            // Diff Editor Support
            if ((0, editor_1.$OE)(input)) {
                const original = this.createTextEditor(input.original);
                const modified = this.createTextEditor(input.modified);
                return this.f.createInstance(diffEditorInput_1.$3eb, input.label, input.description, original, modified, undefined);
            }
            // Side by Side Editor Support
            if ((0, editor_1.$PE)(input)) {
                const primary = this.createTextEditor(input.primary);
                const secondary = this.createTextEditor(input.secondary);
                return this.f.createInstance(sideBySideEditorInput_1.$VC, input.label, input.description, secondary, primary);
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
                    untitledModel = this.c.create({ untitledResource: untitledInput.resource, ...untitledOptions });
                }
                // Other resource: use as hint for associated filepath
                else {
                    untitledModel = this.c.create({ associatedResource: untitledInput.resource, ...untitledOptions });
                }
                return this.n(untitledModel.resource, () => {
                    // Factory function for new untitled editor
                    const input = this.f.createInstance(untitledTextEditorInput_1.$Bvb, untitledModel);
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
                const label = textResourceEditorInput.label || (0, resources_1.$fg)(textResourceEditorInput.resource);
                // We keep track of the preferred resource this input is to be created
                // with but it may be different from the canonical resource (see below)
                const preferredResource = textResourceEditorInput.resource;
                // From this moment on, only operate on the canonical resource
                // to ensure we reduce the chance of opening the same resource
                // with different resource forms (e.g. path casing on Windows)
                const canonicalResource = this.g.asCanonicalUri(preferredResource);
                return this.n(canonicalResource, () => {
                    // File
                    if (textResourceEditorInput.forceFile || this.h.hasProvider(canonicalResource)) {
                        return this.b.createFileEditor(canonicalResource, preferredResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.encoding, textResourceEditorInput.languageId, textResourceEditorInput.contents, this.f);
                    }
                    // Resource
                    return this.f.createInstance(textResourceEditorInput_1.$7eb, canonicalResource, textResourceEditorInput.label, textResourceEditorInput.description, textResourceEditorInput.languageId, textResourceEditorInput.contents);
                }, cachedInput => {
                    // Untitled
                    if (cachedInput instanceof untitledTextEditorInput_1.$Bvb) {
                        return;
                    }
                    // Files
                    else if (!(cachedInput instanceof textResourceEditorInput_1.$7eb)) {
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
        n(resource, factoryFn, cachedFn) {
            // Return early if already cached
            let input = this.a.get(resource);
            if (input) {
                cachedFn?.(input);
                return input;
            }
            // Otherwise create and add to cache
            input = factoryFn();
            this.a.set(resource, input);
            event_1.Event.once(input.onWillDispose)(() => this.a.delete(resource));
            return input;
        }
    };
    exports.$txb = $txb;
    exports.$txb = $txb = __decorate([
        __param(0, untitledTextEditorService_1.$tD),
        __param(1, instantiation_1.$Ah),
        __param(2, uriIdentity_1.$Ck),
        __param(3, files_1.$6j),
        __param(4, editorResolverService_1.$pbb)
    ], $txb);
    (0, extensions_1.$mr)(exports.$sxb, $txb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=textEditorService.js.map