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
define(["require", "exports", "vs/base/common/event", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/base/common/arrays"], function (require, exports, event_1, editor_1, editorInput_1, sideBySideEditorInput_1, instantiation_1, configuration_1, lifecycle_1, platform_1, arrays_1) {
    "use strict";
    var EditorGroupModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGroupModel = exports.isGroupEditorCloseEvent = exports.isGroupEditorMoveEvent = exports.isGroupEditorOpenEvent = exports.isGroupEditorChangeEvent = exports.isSerializedEditorGroupModel = void 0;
    const EditorOpenPositioning = {
        LEFT: 'left',
        RIGHT: 'right',
        FIRST: 'first',
        LAST: 'last'
    };
    function isSerializedEditorGroupModel(group) {
        const candidate = group;
        return !!(candidate && typeof candidate === 'object' && Array.isArray(candidate.editors) && Array.isArray(candidate.mru));
    }
    exports.isSerializedEditorGroupModel = isSerializedEditorGroupModel;
    function isGroupEditorChangeEvent(e) {
        const candidate = e;
        return candidate.editor && candidate.editorIndex !== undefined;
    }
    exports.isGroupEditorChangeEvent = isGroupEditorChangeEvent;
    function isGroupEditorOpenEvent(e) {
        const candidate = e;
        return candidate.kind === 3 /* GroupModelChangeKind.EDITOR_OPEN */ && candidate.editorIndex !== undefined;
    }
    exports.isGroupEditorOpenEvent = isGroupEditorOpenEvent;
    function isGroupEditorMoveEvent(e) {
        const candidate = e;
        return candidate.kind === 5 /* GroupModelChangeKind.EDITOR_MOVE */ && candidate.editorIndex !== undefined && candidate.oldEditorIndex !== undefined;
    }
    exports.isGroupEditorMoveEvent = isGroupEditorMoveEvent;
    function isGroupEditorCloseEvent(e) {
        const candidate = e;
        return candidate.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */ && candidate.editorIndex !== undefined && candidate.context !== undefined && candidate.sticky !== undefined;
    }
    exports.isGroupEditorCloseEvent = isGroupEditorCloseEvent;
    let EditorGroupModel = class EditorGroupModel extends lifecycle_1.Disposable {
        static { EditorGroupModel_1 = this; }
        static { this.IDS = 0; }
        get id() { return this._id; }
        constructor(labelOrSerializedGroup, instantiationService, configurationService) {
            super();
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            //#region events
            this._onDidModelChange = this._register(new event_1.Emitter());
            this.onDidModelChange = this._onDidModelChange.event;
            this.editors = [];
            this.mru = [];
            this.editorListeners = new Set();
            this.locked = false;
            this.preview = null; // editor in preview state
            this.active = null; // editor in active state
            this.sticky = -1; // index of first editor in sticky state
            if (isSerializedEditorGroupModel(labelOrSerializedGroup)) {
                this._id = this.deserialize(labelOrSerializedGroup);
            }
            else {
                this._id = EditorGroupModel_1.IDS++;
            }
            this.onConfigurationUpdated();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        }
        onConfigurationUpdated(e) {
            if (e && !e.affectsConfiguration('workbench.editor.openPositioning') && !e.affectsConfiguration('workbench.editor.focusRecentEditorAfterClose')) {
                return;
            }
            this.editorOpenPositioning = this.configurationService.getValue('workbench.editor.openPositioning');
            this.focusRecentEditorAfterClose = this.configurationService.getValue('workbench.editor.focusRecentEditorAfterClose');
        }
        get count() {
            return this.editors.length;
        }
        get stickyCount() {
            return this.sticky + 1;
        }
        getEditors(order, options) {
            const editors = order === 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */ ? this.mru.slice(0) : this.editors.slice(0);
            if (options?.excludeSticky) {
                // MRU: need to check for index on each
                if (order === 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */) {
                    return editors.filter(editor => !this.isSticky(editor));
                }
                // Sequential: simply start after sticky index
                return editors.slice(this.sticky + 1);
            }
            return editors;
        }
        getEditorByIndex(index) {
            return this.editors[index];
        }
        get activeEditor() {
            return this.active;
        }
        isActive(editor) {
            return this.matches(this.active, editor);
        }
        get previewEditor() {
            return this.preview;
        }
        openEditor(candidate, options) {
            const makeSticky = options?.sticky || (typeof options?.index === 'number' && this.isSticky(options.index));
            const makePinned = options?.pinned || options?.sticky;
            const makeActive = options?.active || !this.activeEditor || (!makePinned && this.matches(this.preview, this.activeEditor));
            const existingEditorAndIndex = this.findEditor(candidate, options);
            // New editor
            if (!existingEditorAndIndex) {
                const newEditor = candidate;
                const indexOfActive = this.indexOf(this.active);
                // Insert into specific position
                let targetIndex;
                if (options && typeof options.index === 'number') {
                    targetIndex = options.index;
                }
                // Insert to the BEGINNING
                else if (this.editorOpenPositioning === EditorOpenPositioning.FIRST) {
                    targetIndex = 0;
                    // Always make sure targetIndex is after sticky editors
                    // unless we are explicitly told to make the editor sticky
                    if (!makeSticky && this.isSticky(targetIndex)) {
                        targetIndex = this.sticky + 1;
                    }
                }
                // Insert to the END
                else if (this.editorOpenPositioning === EditorOpenPositioning.LAST) {
                    targetIndex = this.editors.length;
                }
                // Insert to LEFT or RIGHT of active editor
                else {
                    // Insert to the LEFT of active editor
                    if (this.editorOpenPositioning === EditorOpenPositioning.LEFT) {
                        if (indexOfActive === 0 || !this.editors.length) {
                            targetIndex = 0; // to the left becoming first editor in list
                        }
                        else {
                            targetIndex = indexOfActive; // to the left of active editor
                        }
                    }
                    // Insert to the RIGHT of active editor
                    else {
                        targetIndex = indexOfActive + 1;
                    }
                    // Always make sure targetIndex is after sticky editors
                    // unless we are explicitly told to make the editor sticky
                    if (!makeSticky && this.isSticky(targetIndex)) {
                        targetIndex = this.sticky + 1;
                    }
                }
                // If the editor becomes sticky, increment the sticky index and adjust
                // the targetIndex to be at the end of sticky editors unless already.
                if (makeSticky) {
                    this.sticky++;
                    if (!this.isSticky(targetIndex)) {
                        targetIndex = this.sticky;
                    }
                }
                // Insert into our list of editors if pinned or we have no preview editor
                if (makePinned || !this.preview) {
                    this.splice(targetIndex, false, newEditor);
                }
                // Handle preview
                if (!makePinned) {
                    // Replace existing preview with this editor if we have a preview
                    if (this.preview) {
                        const indexOfPreview = this.indexOf(this.preview);
                        if (targetIndex > indexOfPreview) {
                            targetIndex--; // accomodate for the fact that the preview editor closes
                        }
                        this.replaceEditor(this.preview, newEditor, targetIndex, !makeActive);
                    }
                    this.preview = newEditor;
                }
                // Listeners
                this.registerEditorListeners(newEditor);
                // Event
                const event = {
                    kind: 3 /* GroupModelChangeKind.EDITOR_OPEN */,
                    editor: newEditor,
                    editorIndex: targetIndex
                };
                this._onDidModelChange.fire(event);
                // Handle active
                if (makeActive) {
                    this.doSetActive(newEditor, targetIndex);
                }
                return {
                    editor: newEditor,
                    isNew: true
                };
            }
            // Existing editor
            else {
                const [existingEditor, existingEditorIndex] = existingEditorAndIndex;
                // Pin it
                if (makePinned) {
                    this.doPin(existingEditor, existingEditorIndex);
                }
                // Activate it
                if (makeActive) {
                    this.doSetActive(existingEditor, existingEditorIndex);
                }
                // Respect index
                if (options && typeof options.index === 'number') {
                    this.moveEditor(existingEditor, options.index);
                }
                // Stick it (intentionally after the moveEditor call in case
                // the editor was already moved into the sticky range)
                if (makeSticky) {
                    this.doStick(existingEditor, this.indexOf(existingEditor));
                }
                return {
                    editor: existingEditor,
                    isNew: false
                };
            }
        }
        registerEditorListeners(editor) {
            const listeners = new lifecycle_1.DisposableStore();
            this.editorListeners.add(listeners);
            // Re-emit disposal of editor input as our own event
            listeners.add(event_1.Event.once(editor.onWillDispose)(() => {
                const editorIndex = this.editors.indexOf(editor);
                if (editorIndex >= 0) {
                    const event = {
                        kind: 12 /* GroupModelChangeKind.EDITOR_WILL_DISPOSE */,
                        editor,
                        editorIndex
                    };
                    this._onDidModelChange.fire(event);
                }
            }));
            // Re-Emit dirty state changes
            listeners.add(editor.onDidChangeDirty(() => {
                const event = {
                    kind: 11 /* GroupModelChangeKind.EDITOR_DIRTY */,
                    editor,
                    editorIndex: this.editors.indexOf(editor)
                };
                this._onDidModelChange.fire(event);
            }));
            // Re-Emit label changes
            listeners.add(editor.onDidChangeLabel(() => {
                const event = {
                    kind: 7 /* GroupModelChangeKind.EDITOR_LABEL */,
                    editor,
                    editorIndex: this.editors.indexOf(editor)
                };
                this._onDidModelChange.fire(event);
            }));
            // Re-Emit capability changes
            listeners.add(editor.onDidChangeCapabilities(() => {
                const event = {
                    kind: 8 /* GroupModelChangeKind.EDITOR_CAPABILITIES */,
                    editor,
                    editorIndex: this.editors.indexOf(editor)
                };
                this._onDidModelChange.fire(event);
            }));
            // Clean up dispose listeners once the editor gets closed
            listeners.add(this.onDidModelChange(event => {
                if (event.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */ && event.editor?.matches(editor)) {
                    (0, lifecycle_1.dispose)(listeners);
                    this.editorListeners.delete(listeners);
                }
            }));
        }
        replaceEditor(toReplace, replaceWith, replaceIndex, openNext = true) {
            const closeResult = this.doCloseEditor(toReplace, editor_1.EditorCloseContext.REPLACE, openNext); // optimization to prevent multiple setActive() in one call
            // We want to first add the new editor into our model before emitting the close event because
            // firing the close event can trigger a dispose on the same editor that is now being added.
            // This can lead into opening a disposed editor which is not what we want.
            this.splice(replaceIndex, false, replaceWith);
            if (closeResult) {
                const event = {
                    kind: 4 /* GroupModelChangeKind.EDITOR_CLOSE */,
                    ...closeResult
                };
                this._onDidModelChange.fire(event);
            }
        }
        closeEditor(candidate, context = editor_1.EditorCloseContext.UNKNOWN, openNext = true) {
            const closeResult = this.doCloseEditor(candidate, context, openNext);
            if (closeResult) {
                const event = {
                    kind: 4 /* GroupModelChangeKind.EDITOR_CLOSE */,
                    ...closeResult
                };
                this._onDidModelChange.fire(event);
                return closeResult;
            }
            return undefined;
        }
        doCloseEditor(candidate, context, openNext) {
            const index = this.indexOf(candidate);
            if (index === -1) {
                return undefined; // not found
            }
            const editor = this.editors[index];
            const sticky = this.isSticky(index);
            // Active Editor closed
            if (openNext && this.matches(this.active, editor)) {
                // More than one editor
                if (this.mru.length > 1) {
                    let newActive;
                    if (this.focusRecentEditorAfterClose) {
                        newActive = this.mru[1]; // active editor is always first in MRU, so pick second editor after as new active
                    }
                    else {
                        if (index === this.editors.length - 1) {
                            newActive = this.editors[index - 1]; // last editor is closed, pick previous as new active
                        }
                        else {
                            newActive = this.editors[index + 1]; // pick next editor as new active
                        }
                    }
                    this.doSetActive(newActive, this.editors.indexOf(newActive));
                }
                // One Editor
                else {
                    this.active = null;
                }
            }
            // Preview Editor closed
            if (this.matches(this.preview, editor)) {
                this.preview = null;
            }
            // Remove from arrays
            this.splice(index, true);
            // Event
            return { editor, sticky, editorIndex: index, context };
        }
        moveEditor(candidate, toIndex) {
            // Ensure toIndex is in bounds of our model
            if (toIndex >= this.editors.length) {
                toIndex = this.editors.length - 1;
            }
            else if (toIndex < 0) {
                toIndex = 0;
            }
            const index = this.indexOf(candidate);
            if (index < 0 || toIndex === index) {
                return;
            }
            const editor = this.editors[index];
            const sticky = this.sticky;
            // Adjust sticky index: editor moved out of sticky state into unsticky state
            if (this.isSticky(index) && toIndex > this.sticky) {
                this.sticky--;
            }
            // ...or editor moved into sticky state from unsticky state
            else if (!this.isSticky(index) && toIndex <= this.sticky) {
                this.sticky++;
            }
            // Move
            this.editors.splice(index, 1);
            this.editors.splice(toIndex, 0, editor);
            // Move Event
            const event = {
                kind: 5 /* GroupModelChangeKind.EDITOR_MOVE */,
                editor,
                oldEditorIndex: index,
                editorIndex: toIndex
            };
            this._onDidModelChange.fire(event);
            // Sticky Event (if sticky changed as part of the move)
            if (sticky !== this.sticky) {
                const event = {
                    kind: 10 /* GroupModelChangeKind.EDITOR_STICKY */,
                    editor,
                    editorIndex: toIndex
                };
                this._onDidModelChange.fire(event);
            }
            return editor;
        }
        setActive(candidate) {
            let result = undefined;
            if (!candidate) {
                this.setGroupActive();
            }
            else {
                result = this.setEditorActive(candidate);
            }
            return result;
        }
        setGroupActive() {
            // We do not really keep the `active` state in our model because
            // it has no special meaning to us here. But for consistency
            // we emit a `onDidModelChange` event so that components can
            // react.
            this._onDidModelChange.fire({ kind: 0 /* GroupModelChangeKind.GROUP_ACTIVE */ });
        }
        setEditorActive(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doSetActive(editor, editorIndex);
            return editor;
        }
        doSetActive(editor, editorIndex) {
            if (this.matches(this.active, editor)) {
                return; // already active
            }
            this.active = editor;
            // Bring to front in MRU list
            const mruIndex = this.indexOf(editor, this.mru);
            this.mru.splice(mruIndex, 1);
            this.mru.unshift(editor);
            // Event
            const event = {
                kind: 6 /* GroupModelChangeKind.EDITOR_ACTIVE */,
                editor,
                editorIndex
            };
            this._onDidModelChange.fire(event);
        }
        setIndex(index) {
            // We do not really keep the `index` in our model because
            // it has no special meaning to us here. But for consistency
            // we emit a `onDidModelChange` event so that components can
            // react.
            this._onDidModelChange.fire({ kind: 1 /* GroupModelChangeKind.GROUP_INDEX */ });
        }
        pin(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doPin(editor, editorIndex);
            return editor;
        }
        doPin(editor, editorIndex) {
            if (this.isPinned(editor)) {
                return; // can only pin a preview editor
            }
            // Convert the preview editor to be a pinned editor
            this.preview = null;
            // Event
            const event = {
                kind: 9 /* GroupModelChangeKind.EDITOR_PIN */,
                editor,
                editorIndex
            };
            this._onDidModelChange.fire(event);
        }
        unpin(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doUnpin(editor, editorIndex);
            return editor;
        }
        doUnpin(editor, editorIndex) {
            if (!this.isPinned(editor)) {
                return; // can only unpin a pinned editor
            }
            // Set new
            const oldPreview = this.preview;
            this.preview = editor;
            // Event
            const event = {
                kind: 9 /* GroupModelChangeKind.EDITOR_PIN */,
                editor,
                editorIndex
            };
            this._onDidModelChange.fire(event);
            // Close old preview editor if any
            if (oldPreview) {
                this.closeEditor(oldPreview, editor_1.EditorCloseContext.UNPIN);
            }
        }
        isPinned(editorOrIndex) {
            let editor;
            if (typeof editorOrIndex === 'number') {
                editor = this.editors[editorOrIndex];
            }
            else {
                editor = editorOrIndex;
            }
            return !this.matches(this.preview, editor);
        }
        stick(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doStick(editor, editorIndex);
            return editor;
        }
        doStick(editor, editorIndex) {
            if (this.isSticky(editorIndex)) {
                return; // can only stick a non-sticky editor
            }
            // Pin editor
            this.pin(editor);
            // Move editor to be the last sticky editor
            const newEditorIndex = this.sticky + 1;
            this.moveEditor(editor, newEditorIndex);
            // Adjust sticky index
            this.sticky++;
            // Event
            const event = {
                kind: 10 /* GroupModelChangeKind.EDITOR_STICKY */,
                editor,
                editorIndex: newEditorIndex
            };
            this._onDidModelChange.fire(event);
        }
        unstick(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.doUnstick(editor, editorIndex);
            return editor;
        }
        doUnstick(editor, editorIndex) {
            if (!this.isSticky(editorIndex)) {
                return; // can only unstick a sticky editor
            }
            // Move editor to be the first non-sticky editor
            const newEditorIndex = this.sticky;
            this.moveEditor(editor, newEditorIndex);
            // Adjust sticky index
            this.sticky--;
            // Event
            const event = {
                kind: 10 /* GroupModelChangeKind.EDITOR_STICKY */,
                editor,
                editorIndex: newEditorIndex
            };
            this._onDidModelChange.fire(event);
        }
        isSticky(candidateOrIndex) {
            if (this.sticky < 0) {
                return false; // no sticky editor
            }
            let index;
            if (typeof candidateOrIndex === 'number') {
                index = candidateOrIndex;
            }
            else {
                index = this.indexOf(candidateOrIndex);
            }
            if (index < 0) {
                return false;
            }
            return index <= this.sticky;
        }
        splice(index, del, editor) {
            const editorToDeleteOrReplace = this.editors[index];
            // Perform on sticky index
            if (del && this.isSticky(index)) {
                this.sticky--;
            }
            // Perform on editors array
            if (editor) {
                this.editors.splice(index, del ? 1 : 0, editor);
            }
            else {
                this.editors.splice(index, del ? 1 : 0);
            }
            // Perform on MRU
            {
                // Add
                if (!del && editor) {
                    if (this.mru.length === 0) {
                        // the list of most recent editors is empty
                        // so this editor can only be the most recent
                        this.mru.push(editor);
                    }
                    else {
                        // we have most recent editors. as such we
                        // put this newly opened editor right after
                        // the current most recent one because it cannot
                        // be the most recently active one unless
                        // it becomes active. but it is still more
                        // active then any other editor in the list.
                        this.mru.splice(1, 0, editor);
                    }
                }
                // Remove / Replace
                else {
                    const indexInMRU = this.indexOf(editorToDeleteOrReplace, this.mru);
                    // Remove
                    if (del && !editor) {
                        this.mru.splice(indexInMRU, 1); // remove from MRU
                    }
                    // Replace
                    else if (del && editor) {
                        this.mru.splice(indexInMRU, 1, editor); // replace MRU at location
                    }
                }
            }
        }
        indexOf(candidate, editors = this.editors, options) {
            let index = -1;
            if (!candidate) {
                return index;
            }
            for (let i = 0; i < editors.length; i++) {
                const editor = editors[i];
                if (this.matches(editor, candidate, options)) {
                    // If we are to support side by side matching, it is possible that
                    // a better direct match is found later. As such, we continue finding
                    // a matching editor and prefer that match over the side by side one.
                    if (options?.supportSideBySide && editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && !(candidate instanceof sideBySideEditorInput_1.SideBySideEditorInput)) {
                        index = i;
                    }
                    else {
                        index = i;
                        break;
                    }
                }
            }
            return index;
        }
        findEditor(candidate, options) {
            const index = this.indexOf(candidate, this.editors, options);
            if (index === -1) {
                return undefined;
            }
            return [this.editors[index], index];
        }
        isFirst(candidate) {
            return this.matches(this.editors[0], candidate);
        }
        isLast(candidate) {
            return this.matches(this.editors[this.editors.length - 1], candidate);
        }
        contains(candidate, options) {
            return this.indexOf(candidate, this.editors, options) !== -1;
        }
        matches(editor, candidate, options) {
            if (!editor || !candidate) {
                return false;
            }
            if (options?.supportSideBySide && editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && !(candidate instanceof sideBySideEditorInput_1.SideBySideEditorInput)) {
                switch (options.supportSideBySide) {
                    case editor_1.SideBySideEditor.ANY:
                        if (this.matches(editor.primary, candidate, options) || this.matches(editor.secondary, candidate, options)) {
                            return true;
                        }
                        break;
                    case editor_1.SideBySideEditor.BOTH:
                        if (this.matches(editor.primary, candidate, options) && this.matches(editor.secondary, candidate, options)) {
                            return true;
                        }
                        break;
                }
            }
            const strictEquals = editor === candidate;
            if (options?.strictEquals) {
                return strictEquals;
            }
            return strictEquals || editor.matches(candidate);
        }
        get isLocked() {
            return this.locked;
        }
        lock(locked) {
            if (this.isLocked !== locked) {
                this.locked = locked;
                this._onDidModelChange.fire({ kind: 2 /* GroupModelChangeKind.GROUP_LOCKED */ });
            }
        }
        clone() {
            const clone = this.instantiationService.createInstance(EditorGroupModel_1, undefined);
            // Copy over group properties
            clone.editors = this.editors.slice(0);
            clone.mru = this.mru.slice(0);
            clone.preview = this.preview;
            clone.active = this.active;
            clone.sticky = this.sticky;
            // Ensure to register listeners for each editor
            for (const editor of clone.editors) {
                clone.registerEditorListeners(editor);
            }
            return clone;
        }
        serialize() {
            const registry = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory);
            // Serialize all editor inputs so that we can store them.
            // Editors that cannot be serialized need to be ignored
            // from mru, active, preview and sticky if any.
            const serializableEditors = [];
            const serializedEditors = [];
            let serializablePreviewIndex;
            let serializableSticky = this.sticky;
            for (let i = 0; i < this.editors.length; i++) {
                const editor = this.editors[i];
                let canSerializeEditor = false;
                const editorSerializer = registry.getEditorSerializer(editor);
                if (editorSerializer) {
                    const value = editorSerializer.serialize(editor);
                    // Editor can be serialized
                    if (typeof value === 'string') {
                        canSerializeEditor = true;
                        serializedEditors.push({ id: editor.typeId, value });
                        serializableEditors.push(editor);
                        if (this.preview === editor) {
                            serializablePreviewIndex = serializableEditors.length - 1;
                        }
                    }
                    // Editor cannot be serialized
                    else {
                        canSerializeEditor = false;
                    }
                }
                // Adjust index of sticky editors if the editor cannot be serialized and is pinned
                if (!canSerializeEditor && this.isSticky(i)) {
                    serializableSticky--;
                }
            }
            const serializableMru = this.mru.map(editor => this.indexOf(editor, serializableEditors)).filter(i => i >= 0);
            return {
                id: this.id,
                locked: this.locked ? true : undefined,
                editors: serializedEditors,
                mru: serializableMru,
                preview: serializablePreviewIndex,
                sticky: serializableSticky >= 0 ? serializableSticky : undefined
            };
        }
        deserialize(data) {
            const registry = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory);
            if (typeof data.id === 'number') {
                this._id = data.id;
                EditorGroupModel_1.IDS = Math.max(data.id + 1, EditorGroupModel_1.IDS); // make sure our ID generator is always larger
            }
            else {
                this._id = EditorGroupModel_1.IDS++; // backwards compatibility
            }
            if (data.locked) {
                this.locked = true;
            }
            this.editors = (0, arrays_1.coalesce)(data.editors.map((e, index) => {
                let editor = undefined;
                const editorSerializer = registry.getEditorSerializer(e.id);
                if (editorSerializer) {
                    const deserializedEditor = editorSerializer.deserialize(this.instantiationService, e.value);
                    if (deserializedEditor instanceof editorInput_1.EditorInput) {
                        editor = deserializedEditor;
                        this.registerEditorListeners(editor);
                    }
                }
                if (!editor && typeof data.sticky === 'number' && index <= data.sticky) {
                    data.sticky--; // if editor cannot be deserialized but was sticky, we need to decrease sticky index
                }
                return editor;
            }));
            this.mru = (0, arrays_1.coalesce)(data.mru.map(i => this.editors[i]));
            this.active = this.mru[0];
            if (typeof data.preview === 'number') {
                this.preview = this.editors[data.preview];
            }
            if (typeof data.sticky === 'number') {
                this.sticky = data.sticky;
            }
            return this._id;
        }
        dispose() {
            (0, lifecycle_1.dispose)(Array.from(this.editorListeners));
            this.editorListeners.clear();
            super.dispose();
        }
    };
    exports.EditorGroupModel = EditorGroupModel;
    exports.EditorGroupModel = EditorGroupModel = EditorGroupModel_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService)
    ], EditorGroupModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vZWRpdG9yL2VkaXRvckdyb3VwTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQVloRyxNQUFNLHFCQUFxQixHQUFHO1FBQzdCLElBQUksRUFBRSxNQUFNO1FBQ1osS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsT0FBTztRQUNkLElBQUksRUFBRSxNQUFNO0tBQ1osQ0FBQztJQTZCRixTQUFnQiw0QkFBNEIsQ0FBQyxLQUFlO1FBQzNELE1BQU0sU0FBUyxHQUFHLEtBQWdELENBQUM7UUFFbkUsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDM0gsQ0FBQztJQUpELG9FQUlDO0lBNkNELFNBQWdCLHdCQUF3QixDQUFDLENBQXlCO1FBQ2pFLE1BQU0sU0FBUyxHQUFHLENBQTBCLENBQUM7UUFFN0MsT0FBTyxTQUFTLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDO0lBQ2hFLENBQUM7SUFKRCw0REFJQztJQU9ELFNBQWdCLHNCQUFzQixDQUFDLENBQXlCO1FBQy9ELE1BQU0sU0FBUyxHQUFHLENBQTBCLENBQUM7UUFFN0MsT0FBTyxTQUFTLENBQUMsSUFBSSw2Q0FBcUMsSUFBSSxTQUFTLENBQUMsV0FBVyxLQUFLLFNBQVMsQ0FBQztJQUNuRyxDQUFDO0lBSkQsd0RBSUM7SUFjRCxTQUFnQixzQkFBc0IsQ0FBQyxDQUF5QjtRQUMvRCxNQUFNLFNBQVMsR0FBRyxD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