/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/network", "vs/base/common/iterator"], function (require, exports, nls_1, editor_1, platform_1, lifecycle_1, async_1, editorService_1, uriIdentity_1, workingCopyService_1, network_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cU = exports.$bU = exports.$aU = exports.$_T = void 0;
    /**
     * A lightweight descriptor of an editor pane. The descriptor is deferred so that heavy editor
     * panes can load lazily in the workbench.
     */
    class $_T {
        static create(ctor, typeId, name) {
            return new $_T(ctor, typeId, name);
        }
        constructor(a, typeId, name) {
            this.a = a;
            this.typeId = typeId;
            this.name = name;
        }
        instantiate(instantiationService) {
            return instantiationService.createInstance(this.a);
        }
        describes(editorPane) {
            return editorPane.getId() === this.typeId;
        }
    }
    exports.$_T = $_T;
    class $aU {
        constructor() {
            this.a = new Map();
            //#endregion
        }
        registerEditorPane(editorPaneDescriptor, editorDescriptors) {
            this.a.set(editorPaneDescriptor, editorDescriptors);
            return (0, lifecycle_1.$ic)(() => {
                this.a.delete(editorPaneDescriptor);
            });
        }
        getEditorPane(editor) {
            const descriptors = this.b(editor);
            if (descriptors.length === 0) {
                return undefined;
            }
            if (descriptors.length === 1) {
                return descriptors[0];
            }
            return editor.prefersEditorPane(descriptors);
        }
        b(editor, byInstanceOf) {
            const matchingEditorPaneDescriptors = [];
            for (const editorPane of this.a.keys()) {
                const editorDescriptors = this.a.get(editorPane) || [];
                for (const editorDescriptor of editorDescriptors) {
                    const editorClass = editorDescriptor.ctor;
                    // Direct check on constructor type (ignores prototype chain)
                    if (!byInstanceOf && editor.constructor === editorClass) {
                        matchingEditorPaneDescriptors.push(editorPane);
                        break;
                    }
                    // Normal instanceof check
                    else if (byInstanceOf && editor instanceof editorClass) {
                        matchingEditorPaneDescriptors.push(editorPane);
                        break;
                    }
                }
            }
            // If no descriptors found, continue search using instanceof and prototype chain
            if (!byInstanceOf && matchingEditorPaneDescriptors.length === 0) {
                return this.b(editor, true);
            }
            return matchingEditorPaneDescriptors;
        }
        //#region Used for tests only
        getEditorPaneByType(typeId) {
            return iterator_1.Iterable.find(this.a.keys(), editor => editor.typeId === typeId);
        }
        getEditorPanes() {
            return Array.from(this.a.keys());
        }
        getEditors() {
            const editorClasses = [];
            for (const editorPane of this.a.keys()) {
                const editorDescriptors = this.a.get(editorPane);
                if (editorDescriptors) {
                    editorClasses.push(...editorDescriptors.map(editorDescriptor => editorDescriptor.ctor));
                }
            }
            return editorClasses;
        }
    }
    exports.$aU = $aU;
    platform_1.$8m.add(editor_1.$GE.EditorPane, new $aU());
    //#endregion
    //#region Editor Close Tracker
    function $bU(accessor, resources) {
        const editorService = accessor.get(editorService_1.$9C);
        const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
        const workingCopyService = accessor.get(workingCopyService_1.$TC);
        return new Promise(resolve => {
            let remainingResources = [...resources];
            // Observe any editor closing from this moment on
            const listener = editorService.onDidCloseEditor(async (event) => {
                if (event.context === editor_1.EditorCloseContext.MOVE) {
                    return; // ignore move events where the editor will open in another group
                }
                let primaryResource = editor_1.$3E.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                let secondaryResource = editor_1.$3E.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                // Specially handle an editor getting replaced: if the new active editor
                // matches any of the resources from the closed editor, ignore those
                // resources because they were actually not closed, but replaced.
                // (see https://github.com/microsoft/vscode/issues/134299)
                if (event.context === editor_1.EditorCloseContext.REPLACE) {
                    const newPrimaryResource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    const newSecondaryResource = editor_1.$3E.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                    if (uriIdentityService.extUri.isEqual(primaryResource, newPrimaryResource)) {
                        primaryResource = undefined;
                    }
                    if (uriIdentityService.extUri.isEqual(secondaryResource, newSecondaryResource)) {
                        secondaryResource = undefined;
                    }
                }
                // Remove from resources to wait for being closed based on the
                // resources from editors that got closed
                remainingResources = remainingResources.filter(resource => {
                    // Closing editor matches resource directly: remove from remaining
                    if (uriIdentityService.extUri.isEqual(resource, primaryResource) || uriIdentityService.extUri.isEqual(resource, secondaryResource)) {
                        return false;
                    }
                    // Closing editor is untitled with associated resource
                    // that matches resource directly: remove from remaining
                    // but only if the editor was not replaced, otherwise
                    // saving an untitled with associated resource would
                    // release the `--wait` call.
                    // (see https://github.com/microsoft/vscode/issues/141237)
                    if (event.context !== editor_1.EditorCloseContext.REPLACE) {
                        if ((primaryResource?.scheme === network_1.Schemas.untitled && uriIdentityService.extUri.isEqual(resource, primaryResource.with({ scheme: resource.scheme }))) ||
                            (secondaryResource?.scheme === network_1.Schemas.untitled && uriIdentityService.extUri.isEqual(resource, secondaryResource.with({ scheme: resource.scheme })))) {
                            return false;
                        }
                    }
                    // Editor is not yet closed, so keep it in waiting mode
                    return true;
                });
                // All resources to wait for being closed are closed
                if (remainingResources.length === 0) {
                    // If auto save is configured with the default delay (1s) it is possible
                    // to close the editor while the save still continues in the background. As such
                    // we have to also check if the editors to track for are dirty and if so wait
                    // for them to get saved.
                    const dirtyResources = resources.filter(resource => workingCopyService.isDirty(resource));
                    if (dirtyResources.length > 0) {
                        await async_1.Promises.settled(dirtyResources.map(async (resource) => await new Promise(resolve => {
                            if (!workingCopyService.isDirty(resource)) {
                                return resolve(); // return early if resource is not dirty
                            }
                            // Otherwise resolve promise when resource is saved
                            const listener = workingCopyService.onDidChangeDirty(workingCopy => {
                                if (!workingCopy.isDirty() && uriIdentityService.extUri.isEqual(resource, workingCopy.resource)) {
                                    listener.dispose();
                                    return resolve();
                                }
                            });
                        })));
                    }
                    listener.dispose();
                    return resolve();
                }
            });
        });
    }
    exports.$bU = $bU;
    //#endregion
    //#region ARIA
    function $cU(input, index, group, groupCount) {
        let ariaLabel = input.getAriaLabel();
        if (group && !group.isPinned(input)) {
            ariaLabel = (0, nls_1.localize)(0, null, ariaLabel);
        }
        if (group?.isSticky(index ?? input)) {
            ariaLabel = (0, nls_1.localize)(1, null, ariaLabel);
        }
        // Apply group information to help identify in
        // which group we are (only if more than one group
        // is actually opened)
        if (group && typeof groupCount === 'number' && groupCount > 1) {
            ariaLabel = `${ariaLabel}, ${group.ariaLabel}`;
        }
        return ariaLabel;
    }
    exports.$cU = $cU;
});
//#endregion
//# sourceMappingURL=editor.js.map