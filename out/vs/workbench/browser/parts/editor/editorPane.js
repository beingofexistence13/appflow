/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/browser/composite", "vs/workbench/common/editor", "vs/base/common/map", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/types", "vs/workbench/browser/parts/editor/editor", "vs/base/common/resources", "vs/base/common/extpath", "vs/base/common/lifecycle"], function (require, exports, composite_1, editor_1, map_1, uri_1, event_1, types_1, editor_2, resources_1, extpath_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorMemento = exports.EditorPane = void 0;
    /**
     * The base class of editors in the workbench. Editors register themselves for specific editor inputs.
     * Editors are layed out in the editor part of the workbench in editor groups. Multiple editors can be
     * open at the same time. Each editor has a minimized representation that is good enough to provide some
     * information about the state of the editor data.
     *
     * The workbench will keep an editor alive after it has been created and show/hide it based on
     * user interaction. The lifecycle of a editor goes in the order:
     *
     * - `createEditor()`
     * - `setEditorVisible()`
     * - `layout()`
     * - `setInput()`
     * - `focus()`
     * - `dispose()`: when the editor group the editor is in closes
     *
     * During use of the workbench, a editor will often receive a `clearInput()`, `setEditorVisible()`, `layout()` and
     * `focus()` calls, but only one `create()` and `dispose()` call.
     *
     * This class is only intended to be subclassed and not instantiated.
     */
    class EditorPane extends composite_1.Composite {
        //#endregion
        static { this.EDITOR_MEMENTOS = new Map(); }
        get minimumWidth() { return editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.width; }
        get maximumWidth() { return editor_2.DEFAULT_EDITOR_MAX_DIMENSIONS.width; }
        get minimumHeight() { return editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.height; }
        get maximumHeight() { return editor_2.DEFAULT_EDITOR_MAX_DIMENSIONS.height; }
        get input() { return this._input; }
        get options() { return this._options; }
        get group() { return this._group; }
        /**
         * Should be overridden by editors that have their own ScopedContextKeyService
         */
        get scopedContextKeyService() { return undefined; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            //#region Events
            this.onDidChangeSizeConstraints = event_1.Event.None;
            this._onDidChangeControl = this._register(new event_1.Emitter());
            this.onDidChangeControl = this._onDidChangeControl.event;
        }
        create(parent) {
            super.create(parent);
            // Create Editor
            this.createEditor(parent);
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Sets the given input with the options to the editor. The input is guaranteed
         * to be different from the previous input that was set using the `input.matches()`
         * method.
         *
         * The provided context gives more information around how the editor was opened.
         *
         * The provided cancellation token should be used to test if the operation
         * was cancelled.
         */
        async setInput(input, options, context, token) {
            this._input = input;
            this._options = options;
        }
        /**
         * Called to indicate to the editor that the input should be cleared and
         * resources associated with the input should be freed.
         *
         * This method can be called based on different contexts, e.g. when opening
         * a different input or different editor control or when closing all editors
         * in a group.
         *
         * To monitor the lifecycle of editor inputs, you should not rely on this
         * method, rather refer to the listeners on `IEditorGroup` via `IEditorGroupsService`.
         */
        clearInput() {
            this._input = undefined;
            this._options = undefined;
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Sets the given options to the editor. Clients should apply the options
         * to the current input.
         */
        setOptions(options) {
            this._options = options;
        }
        setVisible(visible, group) {
            super.setVisible(visible);
            // Propagate to Editor
            this.setEditorVisible(visible, group);
        }
        /**
         * Indicates that the editor control got visible or hidden in a specific group. A
         * editor instance will only ever be visible in one editor group.
         *
         * @param visible the state of visibility of this editor
         * @param group the editor group this editor is in.
         */
        setEditorVisible(visible, group) {
            this._group = group;
        }
        setBoundarySashes(_sashes) {
            // Subclasses can implement
        }
        getEditorMemento(editorGroupService, configurationService, key, limit = 10) {
            const mementoKey = `${this.getId()}${key}`;
            let editorMemento = EditorPane.EDITOR_MEMENTOS.get(mementoKey);
            if (!editorMemento) {
                editorMemento = this._register(new EditorMemento(this.getId(), key, this.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */), limit, editorGroupService, configurationService));
                EditorPane.EDITOR_MEMENTOS.set(mementoKey, editorMemento);
            }
            return editorMemento;
        }
        getViewState() {
            // Subclasses to override
            return undefined;
        }
        saveState() {
            // Save all editor memento for this editor type
            for (const [, editorMemento] of EditorPane.EDITOR_MEMENTOS) {
                if (editorMemento.id === this.getId()) {
                    editorMemento.saveState();
                }
            }
            super.saveState();
        }
        dispose() {
            this._input = undefined;
            this._options = undefined;
            super.dispose();
        }
    }
    exports.EditorPane = EditorPane;
    class EditorMemento extends lifecycle_1.Disposable {
        static { this.SHARED_EDITOR_STATE = -1; } // pick a number < 0 to be outside group id range
        constructor(id, key, memento, limit, editorGroupService, configurationService) {
            super();
            this.id = id;
            this.key = key;
            this.memento = memento;
            this.limit = limit;
            this.editorGroupService = editorGroupService;
            this.configurationService = configurationService;
            this.cleanedUp = false;
            this.shareEditorState = false;
            this.updateConfiguration(undefined);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.updateConfiguration(e)));
        }
        updateConfiguration(e) {
            if (!e || e.affectsConfiguration(undefined, 'workbench.editor.sharedViewState')) {
                this.shareEditorState = this.configurationService.getValue(undefined, 'workbench.editor.sharedViewState') === true;
            }
        }
        saveEditorState(group, resourceOrEditor, state) {
            const resource = this.doGetResource(resourceOrEditor);
            if (!resource || !group) {
                return; // we are not in a good state to save any state for a resource
            }
            const cache = this.doLoad();
            // Ensure mementos for resource map
            let mementosForResource = cache.get(resource.toString());
            if (!mementosForResource) {
                mementosForResource = Object.create(null);
                cache.set(resource.toString(), mementosForResource);
            }
            // Store state for group
            mementosForResource[group.id] = state;
            // Store state as most recent one based on settings
            if (this.shareEditorState) {
                mementosForResource[EditorMemento.SHARED_EDITOR_STATE] = state;
            }
            // Automatically clear when editor input gets disposed if any
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                this.clearEditorStateOnDispose(resource, resourceOrEditor);
            }
        }
        loadEditorState(group, resourceOrEditor) {
            const resource = this.doGetResource(resourceOrEditor);
            if (!resource || !group) {
                return; // we are not in a good state to load any state for a resource
            }
            const cache = this.doLoad();
            const mementosForResource = cache.get(resource.toString());
            if (mementosForResource) {
                const mementoForResourceAndGroup = mementosForResource[group.id];
                // Return state for group if present
                if (mementoForResourceAndGroup) {
                    return mementoForResourceAndGroup;
                }
                // Return most recent state based on settings otherwise
                if (this.shareEditorState) {
                    return mementosForResource[EditorMemento.SHARED_EDITOR_STATE];
                }
            }
            return undefined;
        }
        clearEditorState(resourceOrEditor, group) {
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                this.editorDisposables?.delete(resourceOrEditor);
            }
            const resource = this.doGetResource(resourceOrEditor);
            if (resource) {
                const cache = this.doLoad();
                // Clear state for group
                if (group) {
                    const mementosForResource = cache.get(resource.toString());
                    if (mementosForResource) {
                        delete mementosForResource[group.id];
                        if ((0, types_1.isEmptyObject)(mementosForResource)) {
                            cache.delete(resource.toString());
                        }
                    }
                }
                // Clear state across all groups for resource
                else {
                    cache.delete(resource.toString());
                }
            }
        }
        clearEditorStateOnDispose(resource, editor) {
            if (!this.editorDisposables) {
                this.editorDisposables = new Map();
            }
            if (!this.editorDisposables.has(editor)) {
                this.editorDisposables.set(editor, event_1.Event.once(editor.onWillDispose)(() => {
                    this.clearEditorState(resource);
                    this.editorDisposables?.delete(editor);
                }));
            }
        }
        moveEditorState(source, target, comparer) {
            const cache = this.doLoad();
            // We need a copy of the keys to not iterate over
            // newly inserted elements.
            const cacheKeys = [...cache.keys()];
            for (const cacheKey of cacheKeys) {
                const resource = uri_1.URI.parse(cacheKey);
                if (!comparer.isEqualOrParent(resource, source)) {
                    continue; // not matching our resource
                }
                // Determine new resulting target resource
                let targetResource;
                if ((0, resources_1.isEqual)(source, resource)) {
                    targetResource = target; // file got moved
                }
                else {
                    const index = (0, extpath_1.indexOfPath)(resource.path, source.path);
                    targetResource = (0, resources_1.joinPath)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                }
                // Don't modify LRU state
                const value = cache.get(cacheKey, 0 /* Touch.None */);
                if (value) {
                    cache.delete(cacheKey);
                    cache.set(targetResource.toString(), value);
                }
            }
        }
        doGetResource(resourceOrEditor) {
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                return resourceOrEditor.resource;
            }
            return resourceOrEditor;
        }
        doLoad() {
            if (!this.cache) {
                this.cache = new map_1.LRUCache(this.limit);
                // Restore from serialized map state
                const rawEditorMemento = this.memento[this.key];
                if (Array.isArray(rawEditorMemento)) {
                    this.cache.fromJSON(rawEditorMemento);
                }
            }
            return this.cache;
        }
        saveState() {
            const cache = this.doLoad();
            // Cleanup once during session
            if (!this.cleanedUp) {
                this.cleanUp();
                this.cleanedUp = true;
            }
            this.memento[this.key] = cache.toJSON();
        }
        cleanUp() {
            const cache = this.doLoad();
            // Remove groups from states that no longer exist. Since we modify the
            // cache and its is a LRU cache make a copy to ensure iteration succeeds
            const entries = [...cache.entries()];
            for (const [resource, mapGroupToMementos] of entries) {
                for (const group of Object.keys(mapGroupToMementos)) {
                    const groupId = Number(group);
                    if (groupId === EditorMemento.SHARED_EDITOR_STATE && this.shareEditorState) {
                        continue; // skip over shared entries if sharing is enabled
                    }
                    if (!this.editorGroupService.getGroup(groupId)) {
                        delete mapGroupToMementos[groupId];
                        if ((0, types_1.isEmptyObject)(mapGroupToMementos)) {
                            cache.delete(resource);
                        }
                    }
                }
            }
        }
    }
    exports.EditorMemento = EditorMemento;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUGFuZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JQYW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdCaEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bb0JHO0lBQ0gsTUFBc0IsVUFBVyxTQUFRLHFCQUFTO1FBU2pELFlBQVk7aUJBRVksb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQUFBeEMsQ0FBeUM7UUFFaEYsSUFBSSxZQUFZLEtBQUssT0FBTyxzQ0FBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksWUFBWSxLQUFLLE9BQU8sc0NBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLGFBQWEsS0FBSyxPQUFPLHNDQUE2QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDcEUsSUFBSSxhQUFhLEtBQUssT0FBTyxzQ0FBNkIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBR3BFLElBQUksS0FBSyxLQUE4QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRzVELElBQUksT0FBTyxLQUFpQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBR25FLElBQUksS0FBSyxLQUErQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTdEOztXQUVHO1FBQ0gsSUFBSSx1QkFBdUIsS0FBcUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRW5GLFlBQ0MsRUFBVSxFQUNWLGdCQUFtQyxFQUNuQyxZQUEyQixFQUMzQixjQUErQjtZQUUvQixLQUFLLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQXBDM0QsZ0JBQWdCO1lBRVAsK0JB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