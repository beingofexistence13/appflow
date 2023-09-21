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
    var $4C_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4C = exports.$3C = exports.$2C = exports.$1C = exports.$ZC = exports.$YC = void 0;
    const EditorOpenPositioning = {
        LEFT: 'left',
        RIGHT: 'right',
        FIRST: 'first',
        LAST: 'last'
    };
    function $YC(group) {
        const candidate = group;
        return !!(candidate && typeof candidate === 'object' && Array.isArray(candidate.editors) && Array.isArray(candidate.mru));
    }
    exports.$YC = $YC;
    function $ZC(e) {
        const candidate = e;
        return candidate.editor && candidate.editorIndex !== undefined;
    }
    exports.$ZC = $ZC;
    function $1C(e) {
        const candidate = e;
        return candidate.kind === 3 /* GroupModelChangeKind.EDITOR_OPEN */ && candidate.editorIndex !== undefined;
    }
    exports.$1C = $1C;
    function $2C(e) {
        const candidate = e;
        return candidate.kind === 5 /* GroupModelChangeKind.EDITOR_MOVE */ && candidate.editorIndex !== undefined && candidate.oldEditorIndex !== undefined;
    }
    exports.$2C = $2C;
    function $3C(e) {
        const candidate = e;
        return candidate.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */ && candidate.editorIndex !== undefined && candidate.context !== undefined && candidate.sticky !== undefined;
    }
    exports.$3C = $3C;
    let $4C = class $4C extends lifecycle_1.$kc {
        static { $4C_1 = this; }
        static { this.a = 0; }
        get id() { return this.c; }
        constructor(labelOrSerializedGroup, u, w) {
            super();
            this.u = u;
            this.w = w;
            //#region events
            this.b = this.B(new event_1.$fd());
            this.onDidModelChange = this.b.event;
            this.f = [];
            this.g = [];
            this.h = new Set();
            this.j = false;
            this.m = null; // editor in preview state
            this.n = null; // editor in active state
            this.r = -1; // index of first editor in sticky state
            if ($YC(labelOrSerializedGroup)) {
                this.c = this.Q(labelOrSerializedGroup);
            }
            else {
                this.c = $4C_1.a++;
            }
            this.z();
            this.y();
        }
        y() {
            this.B(this.w.onDidChangeConfiguration(e => this.z(e)));
        }
        z(e) {
            if (e && !e.affectsConfiguration('workbench.editor.openPositioning') && !e.affectsConfiguration('workbench.editor.focusRecentEditorAfterClose')) {
                return;
            }
            this.s = this.w.getValue('workbench.editor.openPositioning');
            this.t = this.w.getValue('workbench.editor.focusRecentEditorAfterClose');
        }
        get count() {
            return this.f.length;
        }
        get stickyCount() {
            return this.r + 1;
        }
        getEditors(order, options) {
            const editors = order === 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */ ? this.g.slice(0) : this.f.slice(0);
            if (options?.excludeSticky) {
                // MRU: need to check for index on each
                if (order === 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */) {
                    return editors.filter(editor => !this.isSticky(editor));
                }
                // Sequential: simply start after sticky index
                return editors.slice(this.r + 1);
            }
            return editors;
        }
        getEditorByIndex(index) {
            return this.f[index];
        }
        get activeEditor() {
            return this.n;
        }
        isActive(editor) {
            return this.P(this.n, editor);
        }
        get previewEditor() {
            return this.m;
        }
        openEditor(candidate, options) {
            const makeSticky = options?.sticky || (typeof options?.index === 'number' && this.isSticky(options.index));
            const makePinned = options?.pinned || options?.sticky;
            const makeActive = options?.active || !this.activeEditor || (!makePinned && this.P(this.m, this.activeEditor));
            const existingEditorAndIndex = this.findEditor(candidate, options);
            // New editor
            if (!existingEditorAndIndex) {
                const newEditor = candidate;
                const indexOfActive = this.indexOf(this.n);
                // Insert into specific position
                let targetIndex;
                if (options && typeof options.index === 'number') {
                    targetIndex = options.index;
                }
                // Insert to the BEGINNING
                else if (this.s === EditorOpenPositioning.FIRST) {
                    targetIndex = 0;
                    // Always make sure targetIndex is after sticky editors
                    // unless we are explicitly told to make the editor sticky
                    if (!makeSticky && this.isSticky(targetIndex)) {
                        targetIndex = this.r + 1;
                    }
                }
                // Insert to the END
                else if (this.s === EditorOpenPositioning.LAST) {
                    targetIndex = this.f.length;
                }
                // Insert to LEFT or RIGHT of active editor
                else {
                    // Insert to the LEFT of active editor
                    if (this.s === EditorOpenPositioning.LEFT) {
                        if (indexOfActive === 0 || !this.f.length) {
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
                        targetIndex = this.r + 1;
                    }
                }
                // If the editor becomes sticky, increment the sticky index and adjust
                // the targetIndex to be at the end of sticky editors unless already.
                if (makeSticky) {
                    this.r++;
                    if (!this.isSticky(targetIndex)) {
                        targetIndex = this.r;
                    }
                }
                // Insert into our list of editors if pinned or we have no preview editor
                if (makePinned || !this.m) {
                    this.O(targetIndex, false, newEditor);
                }
                // Handle preview
                if (!makePinned) {
                    // Replace existing preview with this editor if we have a preview
                    if (this.m) {
                        const indexOfPreview = this.indexOf(this.m);
                        if (targetIndex > indexOfPreview) {
                            targetIndex--; // accomodate for the fact that the preview editor closes
                        }
                        this.D(this.m, newEditor, targetIndex, !makeActive);
                    }
                    this.m = newEditor;
                }
                // Listeners
                this.C(newEditor);
                // Event
                const event = {
                    kind: 3 /* GroupModelChangeKind.EDITOR_OPEN */,
                    editor: newEditor,
                    editorIndex: targetIndex
                };
                this.b.fire(event);
                // Handle active
                if (makeActive) {
                    this.I(newEditor, targetIndex);
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
                    this.J(existingEditor, existingEditorIndex);
                }
                // Activate it
                if (makeActive) {
                    this.I(existingEditor, existingEditorIndex);
                }
                // Respect index
                if (options && typeof options.index === 'number') {
                    this.moveEditor(existingEditor, options.index);
                }
                // Stick it (intentionally after the moveEditor call in case
                // the editor was already moved into the sticky range)
                if (makeSticky) {
                    this.M(existingEditor, this.indexOf(existingEditor));
                }
                return {
                    editor: existingEditor,
                    isNew: false
                };
            }
        }
        C(editor) {
            const listeners = new lifecycle_1.$jc();
            this.h.add(listeners);
            // Re-emit disposal of editor input as our own event
            listeners.add(event_1.Event.once(editor.onWillDispose)(() => {
                const editorIndex = this.f.indexOf(editor);
                if (editorIndex >= 0) {
                    const event = {
                        kind: 12 /* GroupModelChangeKind.EDITOR_WILL_DISPOSE */,
                        editor,
                        editorIndex
                    };
                    this.b.fire(event);
                }
            }));
            // Re-Emit dirty state changes
            listeners.add(editor.onDidChangeDirty(() => {
                const event = {
                    kind: 11 /* GroupModelChangeKind.EDITOR_DIRTY */,
                    editor,
                    editorIndex: this.f.indexOf(editor)
                };
                this.b.fire(event);
            }));
            // Re-Emit label changes
            listeners.add(editor.onDidChangeLabel(() => {
                const event = {
                    kind: 7 /* GroupModelChangeKind.EDITOR_LABEL */,
                    editor,
                    editorIndex: this.f.indexOf(editor)
                };
                this.b.fire(event);
            }));
            // Re-Emit capability changes
            listeners.add(editor.onDidChangeCapabilities(() => {
                const event = {
                    kind: 8 /* GroupModelChangeKind.EDITOR_CAPABILITIES */,
                    editor,
                    editorIndex: this.f.indexOf(editor)
                };
                this.b.fire(event);
            }));
            // Clean up dispose listeners once the editor gets closed
            listeners.add(this.onDidModelChange(event => {
                if (event.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */ && event.editor?.matches(editor)) {
                    (0, lifecycle_1.$fc)(listeners);
                    this.h.delete(listeners);
                }
            }));
        }
        D(toReplace, replaceWith, replaceIndex, openNext = true) {
            const closeResult = this.F(toReplace, editor_1.EditorCloseContext.REPLACE, openNext); // optimization to prevent multiple setActive() in one call
            // We want to first add the new editor into our model before emitting the close event because
            // firing the close event can trigger a dispose on the same editor that is now being added.
            // This can lead into opening a disposed editor which is not what we want.
            this.O(replaceIndex, false, replaceWith);
            if (closeResult) {
                const event = {
                    kind: 4 /* GroupModelChangeKind.EDITOR_CLOSE */,
                    ...closeResult
                };
                this.b.fire(event);
            }
        }
        closeEditor(candidate, context = editor_1.EditorCloseContext.UNKNOWN, openNext = true) {
            const closeResult = this.F(candidate, context, openNext);
            if (closeResult) {
                const event = {
                    kind: 4 /* GroupModelChangeKind.EDITOR_CLOSE */,
                    ...closeResult
                };
                this.b.fire(event);
                return closeResult;
            }
            return undefined;
        }
        F(candidate, context, openNext) {
            const index = this.indexOf(candidate);
            if (index === -1) {
                return undefined; // not found
            }
            const editor = this.f[index];
            const sticky = this.isSticky(index);
            // Active Editor closed
            if (openNext && this.P(this.n, editor)) {
                // More than one editor
                if (this.g.length > 1) {
                    let newActive;
                    if (this.t) {
                        newActive = this.g[1]; // active editor is always first in MRU, so pick second editor after as new active
                    }
                    else {
                        if (index === this.f.length - 1) {
                            newActive = this.f[index - 1]; // last editor is closed, pick previous as new active
                        }
                        else {
                            newActive = this.f[index + 1]; // pick next editor as new active
                        }
                    }
                    this.I(newActive, this.f.indexOf(newActive));
                }
                // One Editor
                else {
                    this.n = null;
                }
            }
            // Preview Editor closed
            if (this.P(this.m, editor)) {
                this.m = null;
            }
            // Remove from arrays
            this.O(index, true);
            // Event
            return { editor, sticky, editorIndex: index, context };
        }
        moveEditor(candidate, toIndex) {
            // Ensure toIndex is in bounds of our model
            if (toIndex >= this.f.length) {
                toIndex = this.f.length - 1;
            }
            else if (toIndex < 0) {
                toIndex = 0;
            }
            const index = this.indexOf(candidate);
            if (index < 0 || toIndex === index) {
                return;
            }
            const editor = this.f[index];
            const sticky = this.r;
            // Adjust sticky index: editor moved out of sticky state into unsticky state
            if (this.isSticky(index) && toIndex > this.r) {
                this.r--;
            }
            // ...or editor moved into sticky state from unsticky state
            else if (!this.isSticky(index) && toIndex <= this.r) {
                this.r++;
            }
            // Move
            this.f.splice(index, 1);
            this.f.splice(toIndex, 0, editor);
            // Move Event
            const event = {
                kind: 5 /* GroupModelChangeKind.EDITOR_MOVE */,
                editor,
                oldEditorIndex: index,
                editorIndex: toIndex
            };
            this.b.fire(event);
            // Sticky Event (if sticky changed as part of the move)
            if (sticky !== this.r) {
                const event = {
                    kind: 10 /* GroupModelChangeKind.EDITOR_STICKY */,
                    editor,
                    editorIndex: toIndex
                };
                this.b.fire(event);
            }
            return editor;
        }
        setActive(candidate) {
            let result = undefined;
            if (!candidate) {
                this.G();
            }
            else {
                result = this.H(candidate);
            }
            return result;
        }
        G() {
            // We do not really keep the `active` state in our model because
            // it has no special meaning to us here. But for consistency
            // we emit a `onDidModelChange` event so that components can
            // react.
            this.b.fire({ kind: 0 /* GroupModelChangeKind.GROUP_ACTIVE */ });
        }
        H(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.I(editor, editorIndex);
            return editor;
        }
        I(editor, editorIndex) {
            if (this.P(this.n, editor)) {
                return; // already active
            }
            this.n = editor;
            // Bring to front in MRU list
            const mruIndex = this.indexOf(editor, this.g);
            this.g.splice(mruIndex, 1);
            this.g.unshift(editor);
            // Event
            const event = {
                kind: 6 /* GroupModelChangeKind.EDITOR_ACTIVE */,
                editor,
                editorIndex
            };
            this.b.fire(event);
        }
        setIndex(index) {
            // We do not really keep the `index` in our model because
            // it has no special meaning to us here. But for consistency
            // we emit a `onDidModelChange` event so that components can
            // react.
            this.b.fire({ kind: 1 /* GroupModelChangeKind.GROUP_INDEX */ });
        }
        pin(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.J(editor, editorIndex);
            return editor;
        }
        J(editor, editorIndex) {
            if (this.isPinned(editor)) {
                return; // can only pin a preview editor
            }
            // Convert the preview editor to be a pinned editor
            this.m = null;
            // Event
            const event = {
                kind: 9 /* GroupModelChangeKind.EDITOR_PIN */,
                editor,
                editorIndex
            };
            this.b.fire(event);
        }
        unpin(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.L(editor, editorIndex);
            return editor;
        }
        L(editor, editorIndex) {
            if (!this.isPinned(editor)) {
                return; // can only unpin a pinned editor
            }
            // Set new
            const oldPreview = this.m;
            this.m = editor;
            // Event
            const event = {
                kind: 9 /* GroupModelChangeKind.EDITOR_PIN */,
                editor,
                editorIndex
            };
            this.b.fire(event);
            // Close old preview editor if any
            if (oldPreview) {
                this.closeEditor(oldPreview, editor_1.EditorCloseContext.UNPIN);
            }
        }
        isPinned(editorOrIndex) {
            let editor;
            if (typeof editorOrIndex === 'number') {
                editor = this.f[editorOrIndex];
            }
            else {
                editor = editorOrIndex;
            }
            return !this.P(this.m, editor);
        }
        stick(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.M(editor, editorIndex);
            return editor;
        }
        M(editor, editorIndex) {
            if (this.isSticky(editorIndex)) {
                return; // can only stick a non-sticky editor
            }
            // Pin editor
            this.pin(editor);
            // Move editor to be the last sticky editor
            const newEditorIndex = this.r + 1;
            this.moveEditor(editor, newEditorIndex);
            // Adjust sticky index
            this.r++;
            // Event
            const event = {
                kind: 10 /* GroupModelChangeKind.EDITOR_STICKY */,
                editor,
                editorIndex: newEditorIndex
            };
            this.b.fire(event);
        }
        unstick(candidate) {
            const res = this.findEditor(candidate);
            if (!res) {
                return; // not found
            }
            const [editor, editorIndex] = res;
            this.N(editor, editorIndex);
            return editor;
        }
        N(editor, editorIndex) {
            if (!this.isSticky(editorIndex)) {
                return; // can only unstick a sticky editor
            }
            // Move editor to be the first non-sticky editor
            const newEditorIndex = this.r;
            this.moveEditor(editor, newEditorIndex);
            // Adjust sticky index
            this.r--;
            // Event
            const event = {
                kind: 10 /* GroupModelChangeKind.EDITOR_STICKY */,
                editor,
                editorIndex: newEditorIndex
            };
            this.b.fire(event);
        }
        isSticky(candidateOrIndex) {
            if (this.r < 0) {
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
            return index <= this.r;
        }
        O(index, del, editor) {
            const editorToDeleteOrReplace = this.f[index];
            // Perform on sticky index
            if (del && this.isSticky(index)) {
                this.r--;
            }
            // Perform on editors array
            if (editor) {
                this.f.splice(index, del ? 1 : 0, editor);
            }
            else {
                this.f.splice(index, del ? 1 : 0);
            }
            // Perform on MRU
            {
                // Add
                if (!del && editor) {
                    if (this.g.length === 0) {
                        // the list of most recent editors is empty
                        // so this editor can only be the most recent
                        this.g.push(editor);
                    }
                    else {
                        // we have most recent editors. as such we
                        // put this newly opened editor right after
                        // the current most recent one because it cannot
                        // be the most recently active one unless
                        // it becomes active. but it is still more
                        // active then any other editor in the list.
                        this.g.splice(1, 0, editor);
                    }
                }
                // Remove / Replace
                else {
                    const indexInMRU = this.indexOf(editorToDeleteOrReplace, this.g);
                    // Remove
                    if (del && !editor) {
                        this.g.splice(indexInMRU, 1); // remove from MRU
                    }
                    // Replace
                    else if (del && editor) {
                        this.g.splice(indexInMRU, 1, editor); // replace MRU at location
                    }
                }
            }
        }
        indexOf(candidate, editors = this.f, options) {
            let index = -1;
            if (!candidate) {
                return index;
            }
            for (let i = 0; i < editors.length; i++) {
                const editor = editors[i];
                if (this.P(editor, candidate, options)) {
                    // If we are to support side by side matching, it is possible that
                    // a better direct match is found later. As such, we continue finding
                    // a matching editor and prefer that match over the side by side one.
                    if (options?.supportSideBySide && editor instanceof sideBySideEditorInput_1.$VC && !(candidate instanceof sideBySideEditorInput_1.$VC)) {
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
            const index = this.indexOf(candidate, this.f, options);
            if (index === -1) {
                return undefined;
            }
            return [this.f[index], index];
        }
        isFirst(candidate) {
            return this.P(this.f[0], candidate);
        }
        isLast(candidate) {
            return this.P(this.f[this.f.length - 1], candidate);
        }
        contains(candidate, options) {
            return this.indexOf(candidate, this.f, options) !== -1;
        }
        P(editor, candidate, options) {
            if (!editor || !candidate) {
                return false;
            }
            if (options?.supportSideBySide && editor instanceof sideBySideEditorInput_1.$VC && !(candidate instanceof sideBySideEditorInput_1.$VC)) {
                switch (options.supportSideBySide) {
                    case editor_1.SideBySideEditor.ANY:
                        if (this.P(editor.primary, candidate, options) || this.P(editor.secondary, candidate, options)) {
                            return true;
                        }
                        break;
                    case editor_1.SideBySideEditor.BOTH:
                        if (this.P(editor.primary, candidate, options) && this.P(editor.secondary, candidate, options)) {
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
            return this.j;
        }
        lock(locked) {
            if (this.isLocked !== locked) {
                this.j = locked;
                this.b.fire({ kind: 2 /* GroupModelChangeKind.GROUP_LOCKED */ });
            }
        }
        clone() {
            const clone = this.u.createInstance($4C_1, undefined);
            // Copy over group properties
            clone.f = this.f.slice(0);
            clone.g = this.g.slice(0);
            clone.m = this.m;
            clone.n = this.n;
            clone.r = this.r;
            // Ensure to register listeners for each editor
            for (const editor of clone.f) {
                clone.C(editor);
            }
            return clone;
        }
        serialize() {
            const registry = platform_1.$8m.as(editor_1.$GE.EditorFactory);
            // Serialize all editor inputs so that we can store them.
            // Editors that cannot be serialized need to be ignored
            // from mru, active, preview and sticky if any.
            const serializableEditors = [];
            const serializedEditors = [];
            let serializablePreviewIndex;
            let serializableSticky = this.r;
            for (let i = 0; i < this.f.length; i++) {
                const editor = this.f[i];
                let canSerializeEditor = false;
                const editorSerializer = registry.getEditorSerializer(editor);
                if (editorSerializer) {
                    const value = editorSerializer.serialize(editor);
                    // Editor can be serialized
                    if (typeof value === 'string') {
                        canSerializeEditor = true;
                        serializedEditors.push({ id: editor.typeId, value });
                        serializableEditors.push(editor);
                        if (this.m === editor) {
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
            const serializableMru = this.g.map(editor => this.indexOf(editor, serializableEditors)).filter(i => i >= 0);
            return {
                id: this.id,
                locked: this.j ? true : undefined,
                editors: serializedEditors,
                mru: serializableMru,
                preview: serializablePreviewIndex,
                sticky: serializableSticky >= 0 ? serializableSticky : undefined
            };
        }
        Q(data) {
            const registry = platform_1.$8m.as(editor_1.$GE.EditorFactory);
            if (typeof data.id === 'number') {
                this.c = data.id;
                $4C_1.a = Math.max(data.id + 1, $4C_1.a); // make sure our ID generator is always larger
            }
            else {
                this.c = $4C_1.a++; // backwards compatibility
            }
            if (data.locked) {
                this.j = true;
            }
            this.f = (0, arrays_1.$Fb)(data.editors.map((e, index) => {
                let editor = undefined;
                const editorSerializer = registry.getEditorSerializer(e.id);
                if (editorSerializer) {
                    const deserializedEditor = editorSerializer.deserialize(this.u, e.value);
                    if (deserializedEditor instanceof editorInput_1.$tA) {
                        editor = deserializedEditor;
                        this.C(editor);
                    }
                }
                if (!editor && typeof data.sticky === 'number' && index <= data.sticky) {
                    data.sticky--; // if editor cannot be deserialized but was sticky, we need to decrease sticky index
                }
                return editor;
            }));
            this.g = (0, arrays_1.$Fb)(data.mru.map(i => this.f[i]));
            this.n = this.g[0];
            if (typeof data.preview === 'number') {
                this.m = this.f[data.preview];
            }
            if (typeof data.sticky === 'number') {
                this.r = data.sticky;
            }
            return this.c;
        }
        dispose() {
            (0, lifecycle_1.$fc)(Array.from(this.h));
            this.h.clear();
            super.dispose();
        }
    };
    exports.$4C = $4C;
    exports.$4C = $4C = $4C_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h)
    ], $4C);
});
//# sourceMappingURL=editorGroupModel.js.map