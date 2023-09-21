/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/browser/composite", "vs/workbench/common/editor", "vs/base/common/map", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/types", "vs/workbench/browser/parts/editor/editor", "vs/base/common/resources", "vs/base/common/extpath", "vs/base/common/lifecycle"], function (require, exports, composite_1, editor_1, map_1, uri_1, event_1, types_1, editor_2, resources_1, extpath_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$T = exports.$0T = void 0;
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
    class $0T extends composite_1.$1T {
        //#endregion
        static { this.W = new Map(); }
        get minimumWidth() { return editor_2.$4T.width; }
        get maximumWidth() { return editor_2.$5T.width; }
        get minimumHeight() { return editor_2.$4T.height; }
        get maximumHeight() { return editor_2.$5T.height; }
        get input() { return this.X; }
        get options() { return this.Y; }
        get group() { return this.Z; }
        /**
         * Should be overridden by editors that have their own ScopedContextKeyService
         */
        get scopedContextKeyService() { return undefined; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            //#region Events
            this.onDidChangeSizeConstraints = event_1.Event.None;
            this.U = this.B(new event_1.$fd());
            this.onDidChangeControl = this.U.event;
        }
        create(parent) {
            super.create(parent);
            // Create Editor
            this.ab(parent);
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
            this.X = input;
            this.Y = options;
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
            this.X = undefined;
            this.Y = undefined;
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Sets the given options to the editor. Clients should apply the options
         * to the current input.
         */
        setOptions(options) {
            this.Y = options;
        }
        setVisible(visible, group) {
            super.setVisible(visible);
            // Propagate to Editor
            this.bb(visible, group);
        }
        /**
         * Indicates that the editor control got visible or hidden in a specific group. A
         * editor instance will only ever be visible in one editor group.
         *
         * @param visible the state of visibility of this editor
         * @param group the editor group this editor is in.
         */
        bb(visible, group) {
            this.Z = group;
        }
        setBoundarySashes(_sashes) {
            // Subclasses can implement
        }
        cb(editorGroupService, configurationService, key, limit = 10) {
            const mementoKey = `${this.getId()}${key}`;
            let editorMemento = $0T.W.get(mementoKey);
            if (!editorMemento) {
                editorMemento = this.B(new $$T(this.getId(), key, this.F(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */), limit, editorGroupService, configurationService));
                $0T.W.set(mementoKey, editorMemento);
            }
            return editorMemento;
        }
        getViewState() {
            // Subclasses to override
            return undefined;
        }
        G() {
            // Save all editor memento for this editor type
            for (const [, editorMemento] of $0T.W) {
                if (editorMemento.id === this.getId()) {
                    editorMemento.saveState();
                }
            }
            super.G();
        }
        dispose() {
            this.X = undefined;
            this.Y = undefined;
            super.dispose();
        }
    }
    exports.$0T = $0T;
    class $$T extends lifecycle_1.$kc {
        static { this.a = -1; } // pick a number < 0 to be outside group id range
        constructor(id, h, j, m, n, r) {
            super();
            this.id = id;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.c = false;
            this.g = false;
            this.t(undefined);
            this.s();
        }
        s() {
            this.B(this.r.onDidChangeConfiguration(e => this.t(e)));
        }
        t(e) {
            if (!e || e.affectsConfiguration(undefined, 'workbench.editor.sharedViewState')) {
                this.g = this.r.getValue(undefined, 'workbench.editor.sharedViewState') === true;
            }
        }
        saveEditorState(group, resourceOrEditor, state) {
            const resource = this.u(resourceOrEditor);
            if (!resource || !group) {
                return; // we are not in a good state to save any state for a resource
            }
            const cache = this.w();
            // Ensure mementos for resource map
            let mementosForResource = cache.get(resource.toString());
            if (!mementosForResource) {
                mementosForResource = Object.create(null);
                cache.set(resource.toString(), mementosForResource);
            }
            // Store state for group
            mementosForResource[group.id] = state;
            // Store state as most recent one based on settings
            if (this.g) {
                mementosForResource[$$T.a] = state;
            }
            // Automatically clear when editor input gets disposed if any
            if ((0, editor_1.$UE)(resourceOrEditor)) {
                this.clearEditorStateOnDispose(resource, resourceOrEditor);
            }
        }
        loadEditorState(group, resourceOrEditor) {
            const resource = this.u(resourceOrEditor);
            if (!resource || !group) {
                return; // we are not in a good state to load any state for a resource
            }
            const cache = this.w();
            const mementosForResource = cache.get(resource.toString());
            if (mementosForResource) {
                const mementoForResourceAndGroup = mementosForResource[group.id];
                // Return state for group if present
                if (mementoForResourceAndGroup) {
                    return mementoForResourceAndGroup;
                }
                // Return most recent state based on settings otherwise
                if (this.g) {
                    return mementosForResource[$$T.a];
                }
            }
            return undefined;
        }
        clearEditorState(resourceOrEditor, group) {
            if ((0, editor_1.$UE)(resourceOrEditor)) {
                this.f?.delete(resourceOrEditor);
            }
            const resource = this.u(resourceOrEditor);
            if (resource) {
                const cache = this.w();
                // Clear state for group
                if (group) {
                    const mementosForResource = cache.get(resource.toString());
                    if (mementosForResource) {
                        delete mementosForResource[group.id];
                        if ((0, types_1.$wf)(mementosForResource)) {
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
            if (!this.f) {
                this.f = new Map();
            }
            if (!this.f.has(editor)) {
                this.f.set(editor, event_1.Event.once(editor.onWillDispose)(() => {
                    this.clearEditorState(resource);
                    this.f?.delete(editor);
                }));
            }
        }
        moveEditorState(source, target, comparer) {
            const cache = this.w();
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
                if ((0, resources_1.$bg)(source, resource)) {
                    targetResource = target; // file got moved
                }
                else {
                    const index = (0, extpath_1.$Of)(resource.path, source.path);
                    targetResource = (0, resources_1.$ig)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                }
                // Don't modify LRU state
                const value = cache.get(cacheKey, 0 /* Touch.None */);
                if (value) {
                    cache.delete(cacheKey);
                    cache.set(targetResource.toString(), value);
                }
            }
        }
        u(resourceOrEditor) {
            if ((0, editor_1.$UE)(resourceOrEditor)) {
                return resourceOrEditor.resource;
            }
            return resourceOrEditor;
        }
        w() {
            if (!this.b) {
                this.b = new map_1.$Ci(this.m);
                // Restore from serialized map state
                const rawEditorMemento = this.j[this.h];
                if (Array.isArray(rawEditorMemento)) {
                    this.b.fromJSON(rawEditorMemento);
                }
            }
            return this.b;
        }
        saveState() {
            const cache = this.w();
            // Cleanup once during session
            if (!this.c) {
                this.y();
                this.c = true;
            }
            this.j[this.h] = cache.toJSON();
        }
        y() {
            const cache = this.w();
            // Remove groups from states that no longer exist. Since we modify the
            // cache and its is a LRU cache make a copy to ensure iteration succeeds
            const entries = [...cache.entries()];
            for (const [resource, mapGroupToMementos] of entries) {
                for (const group of Object.keys(mapGroupToMementos)) {
                    const groupId = Number(group);
                    if (groupId === $$T.a && this.g) {
                        continue; // skip over shared entries if sharing is enabled
                    }
                    if (!this.n.getGroup(groupId)) {
                        delete mapGroupToMementos[groupId];
                        if ((0, types_1.$wf)(mapGroupToMementos)) {
                            cache.delete(resource);
                        }
                    }
                }
            }
        }
    }
    exports.$$T = $$T;
});
//# sourceMappingURL=editorPane.js.map