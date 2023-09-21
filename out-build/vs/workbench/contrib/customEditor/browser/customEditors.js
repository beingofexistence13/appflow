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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/customEditorModelManager", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/editor/common/editorService", "../common/contributedCustomEditors", "./customEditorInput", "vs/css!./media/customEditor"], function (require, exports, arrays_1, event_1, lifecycle_1, network_1, resources_1, types_1, uri_1, editorExtensions_1, contextkey_1, files_1, instantiation_1, platform_1, storage_1, uriIdentity_1, editor_1, diffEditorInput_1, customEditor_1, customEditorModelManager_1, editorGroupsService_1, editorResolverService_1, editorService_1, contributedCustomEditors_1, customEditorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OTb = void 0;
    let $OTb = class $OTb extends lifecycle_1.$kc {
        constructor(contextKeyService, fileService, storageService, s, t, u, w, y) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.b = 0;
            this.c = this.B(new lifecycle_1.$jc());
            this.g = new Map();
            this.h = new customEditorModelManager_1.$LTb();
            this.n = this.B(new event_1.$fd());
            this.onDidChangeEditorTypes = this.n.event;
            this.r = platform_1.$8m.as(editor_1.$GE.EditorFactory).getFileEditorFactory();
            this.j = customEditor_1.$9eb.bindTo(contextKeyService);
            this.m = customEditor_1.$0eb.bindTo(contextKeyService);
            this.a = this.B(new contributedCustomEditors_1.$NTb(storageService));
            // Register the contribution points only emitting one change from the resolver
            this.y.bufferChangeEvents(this.C.bind(this));
            this.B(this.a.onChange(() => {
                // Register the contribution points only emitting one change from the resolver
                this.y.bufferChangeEvents(this.C.bind(this));
                this.F();
                this.n.fire();
            }));
            this.B(this.s.onDidActiveEditorChange(() => this.F()));
            this.B(fileService.onDidRunOperation(e => {
                if (e.isOperation(2 /* FileOperation.MOVE */)) {
                    this.G(e.resource, this.w.asCanonicalUri(e.target.resource));
                }
            }));
            const PRIORITY = 105;
            this.B(editorExtensions_1.$CV.addImplementation(PRIORITY, 'custom-editor', () => {
                return this.z(editor => editor.undo());
            }));
            this.B(editorExtensions_1.$DV.addImplementation(PRIORITY, 'custom-editor', () => {
                return this.z(editor => editor.redo());
            }));
            this.F();
        }
        getEditorTypes() {
            return [...this.a];
        }
        z(f) {
            const activeEditor = this.s.activeEditor;
            if (activeEditor instanceof customEditorInput_1.$kfb) {
                const result = f(activeEditor);
                if (result) {
                    return result;
                }
                return true;
            }
            return false;
        }
        C() {
            // Clear all previous contributions we know
            this.c.clear();
            for (const contributedEditor of this.a) {
                for (const globPattern of contributedEditor.selector) {
                    if (!globPattern.filenamePattern) {
                        continue;
                    }
                    this.c.add(this.y.registerEditor(globPattern.filenamePattern, {
                        id: contributedEditor.id,
                        label: contributedEditor.displayName,
                        detail: contributedEditor.providerDisplayName,
                        priority: contributedEditor.priority,
                    }, {
                        singlePerResource: () => !this.getCustomEditorCapabilities(contributedEditor.id)?.supportsMultipleEditorsPerDocument ?? true
                    }, {
                        createEditorInput: ({ resource }, group) => {
                            return { editor: customEditorInput_1.$kfb.create(this.u, resource, contributedEditor.id, group.id) };
                        },
                        createUntitledEditorInput: ({ resource }, group) => {
                            return { editor: customEditorInput_1.$kfb.create(this.u, resource ?? uri_1.URI.from({ scheme: network_1.Schemas.untitled, authority: `Untitled-${this.b++}` }), contributedEditor.id, group.id) };
                        },
                        createDiffEditorInput: (diffEditorInput, group) => {
                            return { editor: this.D(diffEditorInput, contributedEditor.id, group) };
                        },
                    }));
                }
            }
        }
        D(editor, editorID, group) {
            const modifiedOverride = customEditorInput_1.$kfb.create(this.u, (0, types_1.$uf)(editor.modified.resource), editorID, group.id, { customClasses: 'modified' });
            const originalOverride = customEditorInput_1.$kfb.create(this.u, (0, types_1.$uf)(editor.original.resource), editorID, group.id, { customClasses: 'original' });
            return this.u.createInstance(diffEditorInput_1.$3eb, editor.label, editor.description, originalOverride, modifiedOverride, true);
        }
        get models() { return this.h; }
        getCustomEditor(viewType) {
            return this.a.get(viewType);
        }
        getContributedCustomEditors(resource) {
            return new customEditor_1.$_eb(this.a.getContributedEditors(resource));
        }
        getUserConfiguredCustomEditors(resource) {
            const resourceAssocations = this.y.getAssociationsForResource(resource);
            return new customEditor_1.$_eb((0, arrays_1.$Fb)(resourceAssocations
                .map(association => this.a.get(association.viewType))));
        }
        getAllCustomEditors(resource) {
            return new customEditor_1.$_eb([
                ...this.getUserConfiguredCustomEditors(resource).allEditors,
                ...this.getContributedCustomEditors(resource).allEditors,
            ]);
        }
        registerCustomEditorCapabilities(viewType, options) {
            if (this.g.has(viewType)) {
                throw new Error(`Capabilities for ${viewType} already set`);
            }
            this.g.set(viewType, options);
            return (0, lifecycle_1.$ic)(() => {
                this.g.delete(viewType);
            });
        }
        getCustomEditorCapabilities(viewType) {
            return this.g.get(viewType);
        }
        F() {
            const activeEditorPane = this.s.activeEditorPane;
            const resource = activeEditorPane?.input?.resource;
            if (!resource) {
                this.j.reset();
                this.m.reset();
                return;
            }
            this.j.set(activeEditorPane?.input instanceof customEditorInput_1.$kfb ? activeEditorPane.input.viewType : '');
            this.m.set(activeEditorPane?.input instanceof customEditorInput_1.$kfb);
        }
        async G(oldResource, newResource) {
            if ((0, resources_1.$gg)(oldResource).toLowerCase() === (0, resources_1.$gg)(newResource).toLowerCase()) {
                return;
            }
            const possibleEditors = this.getAllCustomEditors(newResource);
            // See if we have any non-optional custom editor for this resource
            if (!possibleEditors.allEditors.some(editor => editor.priority !== editorResolverService_1.RegisteredEditorPriority.option)) {
                return;
            }
            // If so, check all editors to see if there are any file editors open for the new resource
            const editorsToReplace = new Map();
            for (const group of this.t.groups) {
                for (const editor of group.editors) {
                    if (this.r.isFileEditor(editor)
                        && !(editor instanceof customEditorInput_1.$kfb)
                        && (0, resources_1.$bg)(editor.resource, newResource)) {
                        let entry = editorsToReplace.get(group.id);
                        if (!entry) {
                            entry = [];
                            editorsToReplace.set(group.id, entry);
                        }
                        entry.push(editor);
                    }
                }
            }
            if (!editorsToReplace.size) {
                return;
            }
            for (const [group, entries] of editorsToReplace) {
                this.s.replaceEditors(entries.map(editor => {
                    let replacement;
                    if (possibleEditors.defaultEditor) {
                        const viewType = possibleEditors.defaultEditor.id;
                        replacement = customEditorInput_1.$kfb.create(this.u, newResource, viewType, group);
                    }
                    else {
                        replacement = { resource: newResource, options: { override: editor_1.$HE.id } };
                    }
                    return {
                        editor,
                        replacement,
                        options: {
                            preserveFocus: true,
                        }
                    };
                }), group);
            }
        }
    };
    exports.$OTb = $OTb;
    exports.$OTb = $OTb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, files_1.$6j),
        __param(2, storage_1.$Vo),
        __param(3, editorService_1.$9C),
        __param(4, editorGroupsService_1.$5C),
        __param(5, instantiation_1.$Ah),
        __param(6, uriIdentity_1.$Ck),
        __param(7, editorResolverService_1.$pbb)
    ], $OTb);
});
//# sourceMappingURL=customEditors.js.map