/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/common/editor", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/network", "vs/base/common/iterator"], function (require, exports, nls_1, editor_1, platform_1, lifecycle_1, async_1, editorService_1, uriIdentity_1, workingCopyService_1, network_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeEditorAriaLabel = exports.whenEditorClosed = exports.EditorPaneRegistry = exports.EditorPaneDescriptor = void 0;
    /**
     * A lightweight descriptor of an editor pane. The descriptor is deferred so that heavy editor
     * panes can load lazily in the workbench.
     */
    class EditorPaneDescriptor {
        static create(ctor, typeId, name) {
            return new EditorPaneDescriptor(ctor, typeId, name);
        }
        constructor(ctor, typeId, name) {
            this.ctor = ctor;
            this.typeId = typeId;
            this.name = name;
        }
        instantiate(instantiationService) {
            return instantiationService.createInstance(this.ctor);
        }
        describes(editorPane) {
            return editorPane.getId() === this.typeId;
        }
    }
    exports.EditorPaneDescriptor = EditorPaneDescriptor;
    class EditorPaneRegistry {
        constructor() {
            this.mapEditorPanesToEditors = new Map();
            //#endregion
        }
        registerEditorPane(editorPaneDescriptor, editorDescriptors) {
            this.mapEditorPanesToEditors.set(editorPaneDescriptor, editorDescriptors);
            return (0, lifecycle_1.toDisposable)(() => {
                this.mapEditorPanesToEditors.delete(editorPaneDescriptor);
            });
        }
        getEditorPane(editor) {
            const descriptors = this.findEditorPaneDescriptors(editor);
            if (descriptors.length === 0) {
                return undefined;
            }
            if (descriptors.length === 1) {
                return descriptors[0];
            }
            return editor.prefersEditorPane(descriptors);
        }
        findEditorPaneDescriptors(editor, byInstanceOf) {
            const matchingEditorPaneDescriptors = [];
            for (const editorPane of this.mapEditorPanesToEditors.keys()) {
                const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane) || [];
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
                return this.findEditorPaneDescriptors(editor, true);
            }
            return matchingEditorPaneDescriptors;
        }
        //#region Used for tests only
        getEditorPaneByType(typeId) {
            return iterator_1.Iterable.find(this.mapEditorPanesToEditors.keys(), editor => editor.typeId === typeId);
        }
        getEditorPanes() {
            return Array.from(this.mapEditorPanesToEditors.keys());
        }
        getEditors() {
            const editorClasses = [];
            for (const editorPane of this.mapEditorPanesToEditors.keys()) {
                const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane);
                if (editorDescriptors) {
                    editorClasses.push(...editorDescriptors.map(editorDescriptor => editorDescriptor.ctor));
                }
            }
            return editorClasses;
        }
    }
    exports.EditorPaneRegistry = EditorPaneRegistry;
    platform_1.Registry.add(editor_1.EditorExtensions.EditorPane, new EditorPaneRegistry());
    //#endregion
    //#region Editor Close Tracker
    function whenEditorClosed(accessor, resources) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
        const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
        return new Promise(resolve => {
            let remainingResources = [...resources];
            // Observe any editor closing from this moment on
            const listener = editorService.onDidCloseEditor(async (event) => {
                if (event.context === editor_1.EditorCloseContext.MOVE) {
                    return; // ignore move events where the editor will open in another group
                }
                let primaryResource = editor_1.EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                let secondaryResource = editor_1.EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                // Specially handle an editor getting replaced: if the new active editor
                // matches any of the resources from the closed editor, ignore those
                // resources because they were actually not closed, but replaced.
                // (see https://github.com/microsoft/vscode/issues/134299)
                if (event.context === editor_1.EditorCloseContext.REPLACE) {
                    const newPrimaryResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    const newSecondaryResource = editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
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
    exports.whenEditorClosed = whenEditorClosed;
    //#endregion
    //#region ARIA
    function computeEditorAriaLabel(input, index, group, groupCount) {
        let ariaLabel = input.getAriaLabel();
        if (group && !group.isPinned(input)) {
            ariaLabel = (0, nls_1.localize)('preview', "{0}, preview", ariaLabel);
        }
        if (group?.isSticky(index ?? input)) {
            ariaLabel = (0, nls_1.localize)('pinned', "{0}, pinned", ariaLabel);
        }
        // Apply group information to help identify in
        // which group we are (only if more than one group
        // is actually opened)
        if (group && typeof groupCount === 'number' && groupCount > 1) {
            ariaLabel = `${ariaLabel}, ${group.ariaLabel}`;
        }
        return ariaLabel;
    }
    exports.computeEditorAriaLabel = computeEditorAriaLabel;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvZWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTBDaEc7OztPQUdHO0lBQ0gsTUFBYSxvQkFBb0I7UUFFaEMsTUFBTSxDQUFDLE1BQU0sQ0FDWixJQUFnRCxFQUNoRCxNQUFjLEVBQ2QsSUFBWTtZQUVaLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxJQUF5QyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRUQsWUFDa0IsSUFBdUMsRUFDL0MsTUFBYyxFQUNkLElBQVk7WUFGSixTQUFJLEdBQUosSUFBSSxDQUFtQztZQUMvQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNsQixDQUFDO1FBRUwsV0FBVyxDQUFDLG9CQUEyQztZQUN0RCxPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELFNBQVMsQ0FBQyxVQUFzQjtZQUMvQixPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzNDLENBQUM7S0FDRDtJQXZCRCxvREF1QkM7SUFFRCxNQUFhLGtCQUFrQjtRQUEvQjtZQUVrQiw0QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBZ0UsQ0FBQztZQTRFbkgsWUFBWTtRQUNiLENBQUM7UUEzRUEsa0JBQWtCLENBQUMsb0JBQTBDLEVBQUUsaUJBQXlEO1lBQ3ZILElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUUxRSxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxN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