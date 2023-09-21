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
define(["require", "exports", "vs/nls!vs/workbench/services/history/browser/historyService", "vs/base/common/uri", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/history/common/history", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/search/common/search", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/layout/browser/layoutService", "vs/platform/contextkey/common/contextkey", "vs/base/common/arrays", "vs/platform/instantiation/common/extensions", "vs/base/browser/dom", "vs/platform/workspaces/common/workspaces", "vs/base/common/network", "vs/base/common/errors", "vs/base/common/async", "vs/workbench/common/resources", "vs/workbench/services/path/common/pathService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, nls_1, uri_1, editor_1, editorService_1, history_1, files_1, workspace_1, lifecycle_1, storage_1, event_1, configuration_1, editorGroupsService_1, search_1, instantiation_1, layoutService_1, contextkey_1, arrays_1, extensions_1, dom_1, workspaces_1, network_1, errors_1, async_1, resources_1, pathService_1, uriIdentity_1, lifecycle_2, log_1) {
    "use strict";
    var $Oyb_1, $Pyb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Pyb = exports.$Oyb = void 0;
    let $Oyb = class $Oyb extends lifecycle_1.$kc {
        static { $Oyb_1 = this; }
        static { this.a = 'workbench.editor.mouseBackForwardToNavigate'; }
        static { this.b = 'workbench.editor.navigationScope'; }
        constructor(h, j, m, n, r, s, t, u, w, y) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.c = this.B(new lifecycle_1.$jc());
            this.f = undefined;
            this.g = this.u.createInstance(EditorHelper);
            //#region History Context Keys
            this.P = (new contextkey_1.$2i('canNavigateBack', false, (0, nls_1.localize)(0, null))).bindTo(this.y);
            this.Q = (new contextkey_1.$2i('canNavigateForward', false, (0, nls_1.localize)(1, null))).bindTo(this.y);
            this.R = (new contextkey_1.$2i('canNavigateBackInNavigationLocations', false, (0, nls_1.localize)(2, null))).bindTo(this.y);
            this.S = (new contextkey_1.$2i('canNavigateForwardInNavigationLocations', false, (0, nls_1.localize)(3, null))).bindTo(this.y);
            this.U = (new contextkey_1.$2i('canNavigateToLastNavigationLocation', false, (0, nls_1.localize)(4, null))).bindTo(this.y);
            this.W = (new contextkey_1.$2i('canNavigateBackInEditLocations', false, (0, nls_1.localize)(5, null))).bindTo(this.y);
            this.X = (new contextkey_1.$2i('canNavigateForwardInEditLocations', false, (0, nls_1.localize)(6, null))).bindTo(this.y);
            this.Y = (new contextkey_1.$2i('canNavigateToLastEditLocation', false, (0, nls_1.localize)(7, null))).bindTo(this.y);
            this.Z = (new contextkey_1.$2i('canReopenClosedEditor', false, (0, nls_1.localize)(8, null))).bindTo(this.y);
            //#endregion
            //#region Editor History Navigation (limit: 50)
            this.$ = this.B(new event_1.$fd());
            this.onDidChangeEditorNavigationStack = this.$.event;
            this.ab = undefined;
            this.bb = new Map();
            this.cb = new Map();
            this.db = 0 /* GoScope.DEFAULT */;
            //#endregion
            //#region Navigation: Next/Previous Used Editor
            this.pb = undefined;
            this.qb = 0;
            this.rb = undefined;
            this.sb = 0;
            this.tb = false;
            this.ub = false;
            this.zb = [];
            this.Ab = false;
            this.Gb = undefined;
            this.Hb = new Map();
            this.Ib = this.B(new async_1.$Xg(() => {
                const matcher = this.B(this.u.createInstance(resources_1.$wD, root => (0, search_1.$wI)(root ? this.r.getValue({ resource: root }) : this.r.getValue()) || Object.create(null), event => event.affectsConfiguration(files_1.$tk) || event.affectsConfiguration(search_1.$nI)));
                this.B(matcher.onExpressionChange(() => this.Nb()));
                return matcher;
            }));
            this.z();
            // if the service is created late enough that an editor is already opened
            // make sure to trigger the onActiveEditorChanged() to track the editor
            // properly (fixes https://github.com/microsoft/vscode/issues/59908)
            if (this.h.activeEditorPane) {
                this.H();
            }
        }
        z() {
            // Mouse back/forward support
            this.D();
            // Editor changes
            this.B(this.h.onDidActiveEditorChange(() => this.H()));
            this.B(this.h.onDidOpenEditorFail(event => this.N(event.editor)));
            this.B(this.h.onDidCloseEditor(event => this.C(event)));
            this.B(this.h.onDidMostRecentlyActiveEditorsChange(() => this.xb()));
            // Editor group changes
            this.B(this.j.onDidRemoveGroup(e => this.G(e)));
            // File changes
            this.B(this.s.onDidFilesChange(event => this.I(event)));
            this.B(this.s.onDidRunOperation(event => this.I(event)));
            // Storage
            this.B(this.n.onWillSaveState(() => this.Tb()));
            // Configuration
            this.eb();
            // Context keys
            this.B(this.onDidChangeEditorNavigationStack(() => this.updateContextKeys()));
            this.B(this.j.onDidChangeActiveGroup(() => this.updateContextKeys()));
        }
        C(e) {
            this.ib(e);
            this.Bb(e);
        }
        D() {
            const mouseBackForwardSupportListener = this.B(new lifecycle_1.$jc());
            const handleMouseBackForwardSupport = () => {
                mouseBackForwardSupportListener.clear();
                if (this.r.getValue($Oyb_1.a)) {
                    mouseBackForwardSupportListener.add((0, dom_1.$nO)(this.w.container, dom_1.$3O.MOUSE_DOWN, e => this.F(e, true)));
                    mouseBackForwardSupportListener.add((0, dom_1.$nO)(this.w.container, dom_1.$3O.MOUSE_UP, e => this.F(e, false)));
                }
            };
            this.B(this.r.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration($Oyb_1.a)) {
                    handleMouseBackForwardSupport();
                }
            }));
            handleMouseBackForwardSupport();
        }
        F(event, isMouseDown) {
            // Support to navigate in history when mouse buttons 4/5 are pressed
            // We want to trigger this on mouse down for a faster experience
            // but we also need to prevent mouse up from triggering the default
            // which is to navigate in the browser history.
            switch (event.button) {
                case 3:
                    dom_1.$5O.stop(event);
                    if (isMouseDown) {
                        this.goBack();
                    }
                    break;
                case 4:
                    dom_1.$5O.stop(event);
                    if (isMouseDown) {
                        this.goForward();
                    }
                    break;
            }
        }
        G(group) {
            this.jb(group);
        }
        H() {
            const activeEditorGroup = this.j.activeGroup;
            const activeEditorPane = activeEditorGroup.activeEditorPane;
            if (this.f && this.g.matchesEditorIdentifier(this.f, activeEditorPane)) {
                return; // return if the active editor is still the same
            }
            // Remember as last active editor (can be undefined if none opened)
            this.f = activeEditorPane?.input && activeEditorPane.group ? { editor: activeEditorPane.input, groupId: activeEditorPane.group.id } : undefined;
            // Dispose old listeners
            this.c.clear();
            // Handle editor change
            this.J(activeEditorGroup, activeEditorPane);
            // Listen to selection changes if the editor pane
            // is having a selection concept.
            if ((0, editor_1.$LE)(activeEditorPane)) {
                this.c.add(activeEditorPane.onDidChangeSelection(e => this.L(activeEditorGroup, activeEditorPane, e)));
            }
            // Context keys
            this.updateContextKeys();
        }
        I(event) {
            // External file changes (watcher)
            if (event instanceof files_1.$lk) {
                if (event.gotDeleted()) {
                    this.N(event);
                }
            }
            // Internal file changes (e.g. explorer)
            else {
                // Delete
                if (event.isOperation(1 /* FileOperation.DELETE */)) {
                    this.N(event);
                }
                // Move
                else if (event.isOperation(2 /* FileOperation.MOVE */) && event.target.isFile) {
                    this.M(event);
                }
            }
        }
        J(group, editorPane) {
            this.Jb(editorPane);
            this.gb(group, editorPane);
        }
        L(group, editorPane, event) {
            this.hb(group, editorPane, event);
        }
        M(event) {
            this.Ob(event);
            this.mb(event);
        }
        N(arg1) {
            this.removeFromHistory(arg1);
            this.lb(arg1);
            this.Db(arg1);
            this.O(arg1);
        }
        O(arg1) {
            let resource = undefined;
            if ((0, editor_1.$UE)(arg1)) {
                resource = editor_1.$3E.getOriginalUri(arg1);
            }
            else if (arg1 instanceof files_1.$lk) {
                // Ignore for now (recently opened are most often out of workspace files anyway for which there are no file events)
            }
            else {
                resource = arg1.resource;
            }
            if (resource) {
                this.t.removeRecentlyOpened([resource]);
            }
        }
        clear() {
            // History
            this.clearRecentlyOpened();
            // Navigation (next, previous)
            this.kb();
            // Recently closed editors
            this.zb = [];
            // Context Keys
            this.updateContextKeys();
        }
        updateContextKeys() {
            this.y.bufferChangeEvents(() => {
                const activeStack = this.fb();
                this.P.set(activeStack.canGoBack(0 /* GoFilter.NONE */));
                this.Q.set(activeStack.canGoForward(0 /* GoFilter.NONE */));
                this.R.set(activeStack.canGoBack(2 /* GoFilter.NAVIGATION */));
                this.S.set(activeStack.canGoForward(2 /* GoFilter.NAVIGATION */));
                this.U.set(activeStack.canGoLast(2 /* GoFilter.NAVIGATION */));
                this.W.set(activeStack.canGoBack(1 /* GoFilter.EDITS */));
                this.X.set(activeStack.canGoForward(1 /* GoFilter.EDITS */));
                this.Y.set(activeStack.canGoLast(1 /* GoFilter.EDITS */));
                this.Z.set(this.zb.length > 0);
            });
        }
        eb() {
            const handleEditorNavigationScopeChange = () => {
                // Ensure to start fresh when setting changes
                this.ob();
                // Update scope
                const configuredScope = this.r.getValue($Oyb_1.b);
                if (configuredScope === 'editorGroup') {
                    this.db = 1 /* GoScope.EDITOR_GROUP */;
                }
                else if (configuredScope === 'editor') {
                    this.db = 2 /* GoScope.EDITOR */;
                }
                else {
                    this.db = 0 /* GoScope.DEFAULT */;
                }
            };
            this.B(this.r.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration($Oyb_1.b)) {
                    handleEditorNavigationScopeChange();
                }
            }));
            handleEditorNavigationScopeChange();
        }
        fb(group = this.j.activeGroup, editor = group.activeEditor) {
            switch (this.db) {
                // Per Editor
                case 2 /* GoScope.EDITOR */: {
                    if (!editor) {
                        return new NoOpEditorNavigationStacks();
                    }
                    let stacksForGroup = this.cb.get(group.id);
                    if (!stacksForGroup) {
                        stacksForGroup = new Map();
                        this.cb.set(group.id, stacksForGroup);
                    }
                    let stack = stacksForGroup.get(editor)?.stack;
                    if (!stack) {
                        const disposable = new lifecycle_1.$jc();
                        stack = disposable.add(this.u.createInstance(EditorNavigationStacks, 2 /* GoScope.EDITOR */));
                        disposable.add(stack.onDidChange(() => this.$.fire()));
                        stacksForGroup.set(editor, { stack, disposable });
                    }
                    return stack;
                }
                // Per Editor Group
                case 1 /* GoScope.EDITOR_GROUP */: {
                    let stack = this.bb.get(group.id)?.stack;
                    if (!stack) {
                        const disposable = new lifecycle_1.$jc();
                        stack = disposable.add(this.u.createInstance(EditorNavigationStacks, 1 /* GoScope.EDITOR_GROUP */));
                        disposable.add(stack.onDidChange(() => this.$.fire()));
                        this.bb.set(group.id, { stack, disposable });
                    }
                    return stack;
                }
                // Global
                case 0 /* GoScope.DEFAULT */: {
                    if (!this.ab) {
                        this.ab = this.B(this.u.createInstance(EditorNavigationStacks, 0 /* GoScope.DEFAULT */));
                        this.B(this.ab.onDidChange(() => this.$.fire()));
                    }
                    return this.ab;
                }
            }
        }
        goForward(filter) {
            return this.fb().goForward(filter);
        }
        goBack(filter) {
            return this.fb().goBack(filter);
        }
        goPrevious(filter) {
            return this.fb().goPrevious(filter);
        }
        goLast(filter) {
            return this.fb().goLast(filter);
        }
        gb(group, editorPane) {
            this.fb(group, editorPane?.input).handleActiveEditorChange(editorPane);
        }
        hb(group, editorPane, event) {
            this.fb(group, editorPane.input).handleActiveEditorSelectionChange(editorPane, event);
        }
        ib(e) {
            const editors = this.cb.get(e.groupId);
            if (editors) {
                const editorStack = editors.get(e.editor);
                if (editorStack) {
                    editorStack.disposable.dispose();
                    editors.delete(e.editor);
                }
                if (editors.size === 0) {
                    this.cb.delete(e.groupId);
                }
            }
        }
        jb(group) {
            // Global
            this.ab?.remove(group.id);
            // Editor groups
            const editorGroupStack = this.bb.get(group.id);
            if (editorGroupStack) {
                editorGroupStack.disposable.dispose();
                this.bb.delete(group.id);
            }
        }
        kb() {
            this.nb(stack => stack.clear());
        }
        lb(arg1) {
            this.nb(stack => stack.remove(arg1));
        }
        mb(event) {
            this.nb(stack => stack.move(event));
        }
        nb(fn) {
            // Global
            if (this.ab) {
                fn(this.ab);
            }
            // Per editor group
            for (const [, entry] of this.bb) {
                fn(entry.stack);
            }
            // Per editor
            for (const [, entries] of this.cb) {
                for (const [, entry] of entries) {
                    fn(entry.stack);
                }
            }
        }
        ob() {
            // Global
            this.ab?.dispose();
            this.ab = undefined;
            // Per Editor group
            for (const [, stack] of this.bb) {
                stack.disposable.dispose();
            }
            this.bb.clear();
            // Per Editor
            for (const [, stacks] of this.cb) {
                for (const [, stack] of stacks) {
                    stack.disposable.dispose();
                }
            }
            this.cb.clear();
        }
        openNextRecentlyUsedEditor(groupId) {
            const [stack, index] = this.wb(index => index - 1, groupId);
            return this.vb(stack[index], groupId);
        }
        openPreviouslyUsedEditor(groupId) {
            const [stack, index] = this.wb(index => index + 1, groupId);
            return this.vb(stack[index], groupId);
        }
        async vb(editorIdentifier, groupId) {
            if (editorIdentifier) {
                const acrossGroups = typeof groupId !== 'number' || !this.j.getGroup(groupId);
                if (acrossGroups) {
                    this.tb = true;
                }
                else {
                    this.ub = true;
                }
                const group = this.j.getGroup(editorIdentifier.groupId) ?? this.j.activeGroup;
                try {
                    await group.openEditor(editorIdentifier.editor);
                }
                finally {
                    if (acrossGroups) {
                        this.tb = false;
                    }
                    else {
                        this.ub = false;
                    }
                }
            }
        }
        wb(indexModifier, groupId) {
            let editors;
            let index;
            const group = typeof groupId === 'number' ? this.j.getGroup(groupId) : undefined;
            // Across groups
            if (!group) {
                editors = this.pb || this.h.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
                index = this.qb;
            }
            // Within group
            else {
                editors = this.rb || group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ groupId: group.id, editor }));
                index = this.sb;
            }
            // Adjust index
            let newIndex = indexModifier(index);
            if (newIndex < 0) {
                newIndex = 0;
            }
            else if (newIndex > editors.length - 1) {
                newIndex = editors.length - 1;
            }
            // Remember index and editors
            if (!group) {
                this.pb = editors;
                this.qb = newIndex;
            }
            else {
                this.rb = editors;
                this.sb = newIndex;
            }
            return [editors, newIndex];
        }
        xb() {
            // Drop all-editors stack unless navigating in all editors
            if (!this.tb) {
                this.pb = undefined;
                this.qb = 0;
            }
            // Drop in-group-editors stack unless navigating in group
            if (!this.ub) {
                this.rb = undefined;
                this.sb = 0;
            }
        }
        //#endregion
        //#region File: Reopen Closed Editor (limit: 20)
        static { this.yb = 20; }
        Bb(event) {
            if (this.Ab) {
                return; // blocked
            }
            const { editor, context } = event;
            if (context === editor_1.EditorCloseContext.REPLACE || context === editor_1.EditorCloseContext.MOVE) {
                return; // ignore if editor was replaced or moved
            }
            const untypedEditor = editor.toUntyped();
            if (!untypedEditor) {
                return; // we need a untyped editor to restore from going forward
            }
            const associatedResources = [];
            const editorResource = editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH });
            if (uri_1.URI.isUri(editorResource)) {
                associatedResources.push(editorResource);
            }
            else if (editorResource) {
                associatedResources.push(...(0, arrays_1.$Fb)([editorResource.primary, editorResource.secondary]));
            }
            // Remove from list of recently closed before...
            this.Db(editor);
            // ...adding it as last recently closed
            this.zb.push({
                editorId: editor.editorId,
                editor: untypedEditor,
                resource: editor_1.$3E.getOriginalUri(editor),
                associatedResources,
                index: event.index,
                sticky: event.sticky
            });
            // Bounding
            if (this.zb.length > $Oyb_1.yb) {
                this.zb.shift();
            }
            // Context
            this.Z.set(true);
        }
        async reopenLastClosedEditor() {
            // Open editor if we have one
            const lastClosedEditor = this.zb.pop();
            let reopenClosedEditorPromise = undefined;
            if (lastClosedEditor) {
                reopenClosedEditorPromise = this.Cb(lastClosedEditor);
            }
            // Update context
            this.Z.set(this.zb.length > 0);
            return reopenClosedEditorPromise;
        }
        async Cb(lastClosedEditor) {
            const options = { pinned: true, sticky: lastClosedEditor.sticky, index: lastClosedEditor.index, ignoreError: true };
            // Special sticky handling: remove the index property from options
            // if that would result in sticky state to not preserve or apply
            // wrongly.
            if ((lastClosedEditor.sticky && !this.j.activeGroup.isSticky(lastClosedEditor.index)) ||
                (!lastClosedEditor.sticky && this.j.activeGroup.isSticky(lastClosedEditor.index))) {
                options.index = undefined;
            }
            // Re-open editor unless already opened
            let editorPane = undefined;
            if (!this.j.activeGroup.contains(lastClosedEditor.editor)) {
                // Fix for https://github.com/microsoft/vscode/issues/107850
                // If opening an editor fails, it is possible that we get
                // another editor-close event as a result. But we really do
                // want to ignore that in our list of recently closed editors
                //  to prevent endless loops.
                this.Ab = true;
                try {
                    editorPane = await this.h.openEditor({
                        ...lastClosedEditor.editor,
                        options: {
                            ...lastClosedEditor.editor.options,
                            ...options
                        }
                    });
                }
                finally {
                    this.Ab = false;
                }
            }
            // If no editor was opened, try with the next one
            if (!editorPane) {
                // Fix for https://github.com/microsoft/vscode/issues/67882
                // If opening of the editor fails, make sure to try the next one
                // but make sure to remove this one from the list to prevent
                // endless loops.
                (0, arrays_1.$Tb)(this.zb, lastClosedEditor);
                // Try with next one
                this.reopenLastClosedEditor();
            }
        }
        Db(arg1) {
            this.zb = this.zb.filter(recentlyClosedEditor => {
                if ((0, editor_1.$UE)(arg1) && recentlyClosedEditor.editorId !== arg1.editorId) {
                    return true; // keep: different editor identifiers
                }
                if (recentlyClosedEditor.resource && this.g.matchesFile(recentlyClosedEditor.resource, arg1)) {
                    return false; // remove: editor matches directly
                }
                if (recentlyClosedEditor.associatedResources.some(associatedResource => this.g.matchesFile(associatedResource, arg1))) {
                    return false; // remove: an associated resource matches
                }
                return true; // keep
            });
            // Update context
            this.Z.set(this.zb.length > 0);
        }
        //#endregion
        //#region Go to: Recently Opened Editor (limit: 200, persisted)
        static { this.Eb = 200; }
        static { this.Fb = 'history.entries'; }
        Jb(editorPane) {
            // Ensure we have not configured to exclude input and don't track invalid inputs
            const editor = editorPane?.input;
            if (!editor || editor.isDisposed() || !this.Mb(editor)) {
                return;
            }
            // Remove any existing entry and add to the beginning
            this.removeFromHistory(editor);
            this.Kb(editor);
        }
        Kb(editor, insertFirst = true) {
            this.Qb(this.Gb);
            const historyInput = this.g.preferResourceEditorInput(editor);
            if (!historyInput) {
                return;
            }
            // Insert based on preference
            if (insertFirst) {
                this.Gb.unshift(historyInput);
            }
            else {
                this.Gb.push(historyInput);
            }
            // Respect max entries setting
            if (this.Gb.length > $Oyb_1.Eb) {
                this.g.clearOnEditorDispose(this.Gb.pop(), this.Hb);
            }
            // React to editor input disposing if this is a typed editor
            if ((0, editor_1.$UE)(historyInput)) {
                this.g.onEditorDispose(historyInput, () => this.Lb(historyInput), this.Hb);
            }
        }
        Lb(editor) {
            // Any non side-by-side editor input gets removed directly on dispose
            if (!(0, editor_1.$VE)(editor)) {
                this.removeFromHistory(editor);
            }
            // Side-by-side editors get special treatment: we try to distill the
            // possibly untyped resource inputs from both sides to be able to
            // offer these entries from the history to the user still.
            else {
                const resourceInputs = [];
                const sideInputs = editor.primary.matches(editor.secondary) ? [editor.primary] : [editor.primary, editor.secondary];
                for (const sideInput of sideInputs) {
                    const candidateResourceInput = this.g.preferResourceEditorInput(sideInput);
                    if ((0, editor_1.$NE)(candidateResourceInput)) {
                        resourceInputs.push(candidateResourceInput);
                    }
                }
                // Insert the untyped resource inputs where our disposed
                // side-by-side editor input is in the history stack
                this.Pb(editor, ...resourceInputs);
            }
        }
        Mb(editor) {
            if ((0, editor_1.$UE)(editor)) {
                return true; // include any non files
            }
            return !this.Ib.value.matches(editor.resource);
        }
        Nb() {
            this.Qb(this.Gb);
            this.Gb = this.Gb.filter(entry => {
                const include = this.Mb(entry);
                // Cleanup any listeners associated with the input when removing from history
                if (!include) {
                    this.g.clearOnEditorDispose(entry, this.Hb);
                }
                return include;
            });
        }
        Ob(event) {
            if (event.isOperation(2 /* FileOperation.MOVE */)) {
                const removed = this.removeFromHistory(event);
                if (removed) {
                    this.Kb({ resource: event.target.resource });
                }
            }
        }
        removeFromHistory(arg1) {
            let removed = false;
            this.Qb(this.Gb);
            this.Gb = this.Gb.filter(entry => {
                const matches = this.g.matchesEditor(arg1, entry);
                // Cleanup any listeners associated with the input when removing from history
                if (matches) {
                    this.g.clearOnEditorDispose(arg1, this.Hb);
                    removed = true;
                }
                return !matches;
            });
            return removed;
        }
        Pb(editor, ...replacements) {
            this.Qb(this.Gb);
            let replaced = false;
            const newHistory = [];
            for (const entry of this.Gb) {
                // Entry matches and is going to be disposed + replaced
                if (this.g.matchesEditor(editor, entry)) {
                    // Cleanup any listeners associated with the input when replacing from history
                    this.g.clearOnEditorDispose(editor, this.Hb);
                    // Insert replacements but only once
                    if (!replaced) {
                        newHistory.push(...replacements);
                        replaced = true;
                    }
                }
                // Entry does not match, but only add it if it didn't match
                // our replacements already
                else if (!replacements.some(replacement => this.g.matchesEditor(replacement, entry))) {
                    newHistory.push(entry);
                }
            }
            // If the target editor to replace was not found, make sure to
            // insert the replacements to the end to ensure we got them
            if (!replaced) {
                newHistory.push(...replacements);
            }
            this.Gb = newHistory;
        }
        clearRecentlyOpened() {
            this.Gb = [];
            for (const [, disposable] of this.Hb) {
                (0, lifecycle_1.$fc)(disposable);
            }
            this.Hb.clear();
        }
        getHistory() {
            this.Qb(this.Gb);
            return this.Gb;
        }
        Qb(history) {
            if (!this.Gb) {
                // Until history is loaded, it is just empty
                this.Gb = [];
                // We want to seed history from opened editors
                // too as well as previous stored state, so we
                // need to wait for the editor groups being ready
                if (this.j.isReady) {
                    this.Rb();
                }
                else {
                    (async () => {
                        await this.j.whenReady;
                        this.Rb();
                    })();
                }
            }
        }
        Rb() {
            // Init as empty before adding - since we are about to
            // populate the history from opened editors, we capture
            // the right order here.
            this.Gb = [];
            // All stored editors from previous session
            const storedEditorHistory = this.Sb();
            // All restored editors from previous session
            // in reverse editor from least to most recently
            // used.
            const openedEditorsLru = [...this.h.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)].reverse();
            // We want to merge the opened editors from the last
            // session with the stored editors from the last
            // session. Because not all editors can be serialised
            // we want to make sure to include all opened editors
            // too.
            // Opened editors should always be first in the history
            const handledEditors = new Set();
            // Add all opened editors first
            for (const { editor } of openedEditorsLru) {
                if (!this.Mb(editor)) {
                    continue;
                }
                // Add into history
                this.Kb(editor);
                // Remember as added
                if (editor.resource) {
                    handledEditors.add(`${editor.resource.toString()}/${editor.editorId}`);
                }
            }
            // Add remaining from storage if not there already
            // We check on resource and `editorId` (from `override`)
            // to figure out if the editor has been already added.
            for (const editor of storedEditorHistory) {
                if (!handledEditors.has(`${editor.resource.toString()}/${editor.options?.override}`)) {
                    this.Kb(editor, false /* at the end */);
                }
            }
        }
        Sb() {
            const entries = [];
            const entriesRaw = this.n.get($Oyb_1.Fb, 1 /* StorageScope.WORKSPACE */);
            if (entriesRaw) {
                try {
                    const entriesParsed = JSON.parse(entriesRaw);
                    for (const entryParsed of entriesParsed) {
                        if (!entryParsed.editor || !entryParsed.editor.resource) {
                            continue; // unexpected data format
                        }
                        try {
                            entries.push({
                                ...entryParsed.editor,
                                resource: typeof entryParsed.editor.resource === 'string' ?
                                    uri_1.URI.parse(entryParsed.editor.resource) : //  from 1.67.x: URI is stored efficiently as URI.toString()
                                    uri_1.URI.from(entryParsed.editor.resource) // until 1.66.x: URI was stored very verbose as URI.toJSON()
                            });
                        }
                        catch (error) {
                            (0, errors_1.$Y)(error); // do not fail entire history when one entry fails
                        }
                    }
                }
                catch (error) {
                    (0, errors_1.$Y)(error); // https://github.com/microsoft/vscode/issues/99075
                }
            }
            return entries;
        }
        Tb() {
            if (!this.Gb) {
                return; // nothing to save because history was not used
            }
            const entries = [];
            for (const editor of this.Gb) {
                if ((0, editor_1.$UE)(editor) || !(0, editor_1.$NE)(editor)) {
                    continue; // only save resource editor inputs
                }
                entries.push({
                    editor: {
                        ...editor,
                        resource: editor.resource.toString()
                    }
                });
            }
            this.n.store($Oyb_1.Fb, JSON.stringify(entries), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        //#endregion
        //#region Last Active Workspace/File
        getLastActiveWorkspaceRoot(schemeFilter) {
            // No Folder: return early
            const folders = this.m.getWorkspace().folders;
            if (folders.length === 0) {
                return undefined;
            }
            // Single Folder: return early
            if (folders.length === 1) {
                const resource = folders[0].uri;
                if (!schemeFilter || resource.scheme === schemeFilter) {
                    return resource;
                }
                return undefined;
            }
            // Multiple folders: find the last active one
            for (const input of this.getHistory()) {
                if ((0, editor_1.$UE)(input)) {
                    continue;
                }
                if (schemeFilter && input.resource.scheme !== schemeFilter) {
                    continue;
                }
                const resourceWorkspace = this.m.getWorkspaceFolder(input.resource);
                if (resourceWorkspace) {
                    return resourceWorkspace.uri;
                }
            }
            // Fallback to first workspace matching scheme filter if any
            for (const folder of folders) {
                const resource = folder.uri;
                if (!schemeFilter || resource.scheme === schemeFilter) {
                    return resource;
                }
            }
            return undefined;
        }
        getLastActiveFile(filterByScheme) {
            for (const input of this.getHistory()) {
                let resource;
                if ((0, editor_1.$UE)(input)) {
                    resource = editor_1.$3E.getOriginalUri(input, { filterByScheme });
                }
                else {
                    resource = input.resource;
                }
                if (resource?.scheme === filterByScheme) {
                    return resource;
                }
            }
            return undefined;
        }
        //#endregion
        dispose() {
            super.dispose();
            for (const [, stack] of this.bb) {
                stack.disposable.dispose();
            }
            for (const [, editors] of this.cb) {
                for (const [, stack] of editors) {
                    stack.disposable.dispose();
                }
            }
        }
    };
    exports.$Oyb = $Oyb;
    exports.$Oyb = $Oyb = $Oyb_1 = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, editorGroupsService_1.$5C),
        __param(2, workspace_1.$Kh),
        __param(3, storage_1.$Vo),
        __param(4, configuration_1.$8h),
        __param(5, files_1.$6j),
        __param(6, workspaces_1.$fU),
        __param(7, instantiation_1.$Ah),
        __param(8, layoutService_1.$Meb),
        __param(9, contextkey_1.$3i)
    ], $Oyb);
    (0, extensions_1.$mr)(history_1.$SM, $Oyb, 0 /* InstantiationType.Eager */);
    class EditorSelectionState {
        constructor(a, selection, b) {
            this.a = a;
            this.selection = selection;
            this.b = b;
        }
        justifiesNewNavigationEntry(other) {
            if (this.a.groupId !== other.a.groupId) {
                return true; // different group
            }
            if (!this.a.editor.matches(other.a.editor)) {
                return true; // different editor
            }
            if (!this.selection || !other.selection) {
                return true; // unknown selections
            }
            const result = this.selection.compare(other.selection);
            if (result === 2 /* EditorPaneSelectionCompareResult.SIMILAR */ && (other.b === 4 /* EditorPaneSelectionChangeReason.NAVIGATION */ || other.b === 5 /* EditorPaneSelectionChangeReason.JUMP */)) {
                // let navigation sources win even if the selection is `SIMILAR`
                // (e.g. "Go to definition" should add a history entry)
                return true;
            }
            return result === 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
    }
    let EditorNavigationStacks = class EditorNavigationStacks extends lifecycle_1.$kc {
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.a = this.B(this.h.createInstance($Pyb, 0 /* GoFilter.NONE */, this.g));
            this.b = this.B(this.h.createInstance($Pyb, 1 /* GoFilter.EDITS */, this.g));
            this.c = this.B(this.h.createInstance($Pyb, 2 /* GoFilter.NAVIGATION */, this.g));
            this.f = [
                this.a,
                this.b,
                this.c
            ];
            this.onDidChange = event_1.Event.any(this.a.onDidChange, this.b.onDidChange, this.c.onDidChange);
        }
        canGoForward(filter) {
            return this.j(filter).canGoForward();
        }
        goForward(filter) {
            return this.j(filter).goForward();
        }
        canGoBack(filter) {
            return this.j(filter).canGoBack();
        }
        goBack(filter) {
            return this.j(filter).goBack();
        }
        goPrevious(filter) {
            return this.j(filter).goPrevious();
        }
        canGoLast(filter) {
            return this.j(filter).canGoLast();
        }
        goLast(filter) {
            return this.j(filter).goLast();
        }
        j(filter = 0 /* GoFilter.NONE */) {
            switch (filter) {
                case 0 /* GoFilter.NONE */: return this.a;
                case 1 /* GoFilter.EDITS */: return this.b;
                case 2 /* GoFilter.NAVIGATION */: return this.c;
            }
        }
        handleActiveEditorChange(editorPane) {
            // Always send to selections navigation stack
            this.a.notifyNavigation(editorPane);
        }
        handleActiveEditorSelectionChange(editorPane, event) {
            const previous = this.a.s;
            // Always send to selections navigation stack
            this.a.notifyNavigation(editorPane, event);
            // Check for edits
            if (event.reason === 3 /* EditorPaneSelectionChangeReason.EDIT */) {
                this.b.notifyNavigation(editorPane, event);
            }
            // Check for navigations
            //
            // Note: ignore if selections navigation stack is navigating because
            // in that case we do not want to receive repeated entries in
            // the navigation stack.
            else if ((event.reason === 4 /* EditorPaneSelectionChangeReason.NAVIGATION */ || event.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */) &&
                !this.a.isNavigating()) {
                // A "JUMP" navigation selection change always has a source and
                // target. As such, we add the previous entry of the selections
                // navigation stack so that our navigation stack receives both
                // entries unless the user is currently navigating.
                if (event.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */ && !this.c.isNavigating()) {
                    if (previous) {
                        this.c.addOrReplace(previous.groupId, previous.editor, previous.selection);
                    }
                }
                this.c.notifyNavigation(editorPane, event);
            }
        }
        clear() {
            for (const stack of this.f) {
                stack.clear();
            }
        }
        remove(arg1) {
            for (const stack of this.f) {
                stack.remove(arg1);
            }
        }
        move(event) {
            for (const stack of this.f) {
                stack.move(event);
            }
        }
    };
    EditorNavigationStacks = __decorate([
        __param(1, instantiation_1.$Ah)
    ], EditorNavigationStacks);
    class NoOpEditorNavigationStacks {
        constructor() {
            this.onDidChange = event_1.Event.None;
        }
        canGoForward() { return false; }
        async goForward() { }
        canGoBack() { return false; }
        async goBack() { }
        async goPrevious() { }
        canGoLast() { return false; }
        async goLast() { }
        handleActiveEditorChange() { }
        handleActiveEditorSelectionChange() { }
        clear() { }
        remove() { }
        move() { }
        dispose() { }
    }
    let $Pyb = class $Pyb extends lifecycle_1.$kc {
        static { $Pyb_1 = this; }
        static { this.a = 50; }
        get s() {
            return this.h[this.j];
        }
        set s(entry) {
            if (entry) {
                this.h[this.j] = entry;
            }
        }
        constructor(t, u, w, y, z, C) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.c = new Map();
            this.f = new Map();
            this.g = this.w.createInstance(EditorHelper);
            this.h = [];
            this.j = -1;
            this.m = -1;
            this.n = false;
            this.r = undefined;
            this.D();
        }
        D() {
            this.B(this.onDidChange(() => this.F()));
            this.B(this.C.onDidChangeLogLevel(() => this.F()));
        }
        F() {
            if (this.C.getLevel() !== log_1.LogLevel.Trace) {
                return;
            }
            const entryLabels = [];
            for (const entry of this.h) {
                if (typeof entry.selection?.log === 'function') {
                    entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: ${entry.selection.log()}`);
                }
                else {
                    entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: <none>`);
                }
            }
            if (entryLabels.length === 0) {
                this.G(`index: ${this.j}, navigating: ${this.isNavigating()}: <empty>`);
            }
            else {
                this.G(`index: ${this.j}, navigating: ${this.isNavigating()}
${entryLabels.join('\n')}
			`);
            }
        }
        G(msg, editor = null, event) {
            if (this.C.getLevel() !== log_1.LogLevel.Trace) {
                return;
            }
            let filterLabel;
            switch (this.t) {
                case 0 /* GoFilter.NONE */:
                    filterLabel = 'global';
                    break;
                case 1 /* GoFilter.EDITS */:
                    filterLabel = 'edits';
                    break;
                case 2 /* GoFilter.NAVIGATION */:
                    filterLabel = 'navigation';
                    break;
            }
            let scopeLabel;
            switch (this.u) {
                case 0 /* GoScope.DEFAULT */:
                    scopeLabel = 'default';
                    break;
                case 1 /* GoScope.EDITOR_GROUP */:
                    scopeLabel = 'editorGroup';
                    break;
                case 2 /* GoScope.EDITOR */:
                    scopeLabel = 'editor';
                    break;
            }
            if (editor !== null) {
                this.C.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg} (editor: ${editor?.resource?.toString()}, event: ${this.H(event)})`);
            }
            else {
                this.C.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg}`);
            }
        }
        H(event) {
            if (!event) {
                return '<none>';
            }
            switch (event.reason) {
                case 3 /* EditorPaneSelectionChangeReason.EDIT */: return 'edit';
                case 4 /* EditorPaneSelectionChangeReason.NAVIGATION */: return 'navigation';
                case 5 /* EditorPaneSelectionChangeReason.JUMP */: return 'jump';
                case 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */: return 'programmatic';
                case 2 /* EditorPaneSelectionChangeReason.USER */: return 'user';
            }
        }
        I(groupId) {
            if (!this.f.has(groupId)) {
                const group = this.z.getGroup(groupId);
                if (group) {
                    this.f.set(groupId, group.onWillMoveEditor(e => this.J(e)));
                }
            }
        }
        J(e) {
            this.G('onWillMoveEditor()', e.editor);
            if (this.u === 1 /* GoScope.EDITOR_GROUP */) {
                return; // ignore move events if our scope is group based
            }
            for (const entry of this.h) {
                if (entry.groupId !== e.groupId) {
                    continue; // not in the group that reported the event
                }
                if (!this.g.matchesEditor(e.editor, entry.editor)) {
                    continue; // not the editor this event is about
                }
                // Update to target group
                entry.groupId = e.target;
            }
        }
        //#region Stack Mutation
        notifyNavigation(editorPane, event) {
            this.G('notifyNavigation()', editorPane?.input, event);
            const isSelectionAwareEditorPane = (0, editor_1.$LE)(editorPane);
            const hasValidEditor = editorPane?.group && editorPane.input && !editorPane.input.isDisposed();
            // Treat editor changes that happen as part of stack navigation specially
            // we do not want to add a new stack entry as a matter of navigating the
            // stack but we need to keep our currentEditorSelectionState up to date
            // with the navigtion that occurs.
            if (this.n) {
                this.G(`notifyNavigation() ignoring (navigating)`, editorPane?.input, event);
                if (isSelectionAwareEditorPane && hasValidEditor) {
                    this.G('notifyNavigation() updating current selection state', editorPane?.input, event);
                    this.r = new EditorSelectionState({ groupId: editorPane.group.id, editor: editorPane.input }, editorPane.getSelection(), event?.reason);
                }
                else {
                    this.G('notifyNavigation() dropping current selection state', editorPane?.input, event);
                    this.r = undefined; // we navigated to a non-selection aware or disposed editor
                }
            }
            // Normal navigation not part of stack navigation
            else {
                this.G(`notifyNavigation() not ignoring`, editorPane?.input, event);
                // Navigation inside selection aware editor
                if (isSelectionAwareEditorPane && hasValidEditor) {
                    this.L(editorPane.group.id, editorPane.input, editorPane.getSelection(), event);
                }
                // Navigation to non-selection aware or disposed editor
                else {
                    this.r = undefined; // at this time we have no active selection aware editor
                    if (hasValidEditor) {
                        this.M(editorPane.group.id, editorPane.input);
                    }
                }
            }
        }
        L(groupId, editor, selection, event) {
            if (this.s?.groupId === groupId && !selection && this.g.matchesEditor(this.s.editor, editor)) {
                return; // do not push same editor input again of same group if we have no valid selection
            }
            this.G('onSelectionAwareEditorNavigation()', editor, event);
            const stateCandidate = new EditorSelectionState({ groupId, editor }, selection, event?.reason);
            // Add to stack if we dont have a current state or this new state justifies a push
            if (!this.r || this.r.justifiesNewNavigationEntry(stateCandidate)) {
                this.N(groupId, editor, stateCandidate.selection);
            }
            // Otherwise we replace the current stack entry with this one
            else {
                this.O(groupId, editor, stateCandidate.selection);
            }
            // Update our current navigation editor state
            this.r = stateCandidate;
        }
        M(groupId, editor) {
            if (this.s?.groupId === groupId && this.g.matchesEditor(this.s.editor, editor)) {
                return; // do not push same editor input again of same group
            }
            this.G('onNonSelectionAwareEditorNavigation()', editor);
            this.N(groupId, editor);
        }
        N(groupId, editor, selection) {
            if (!this.n) {
                this.addOrReplace(groupId, editor, selection);
            }
        }
        O(groupId, editor, selection) {
            if (!this.n) {
                this.addOrReplace(groupId, editor, selection, true /* force replace */);
            }
        }
        addOrReplace(groupId, editorCandidate, selection, forceReplace) {
            // Ensure we listen to changes in group
            this.I(groupId);
            // Check whether to replace an existing entry or not
            let replace = false;
            if (this.s) {
                if (forceReplace) {
                    replace = true; // replace if we are forced to
                }
                else if (this.P(this.s, { groupId, editor: editorCandidate, selection })) {
                    replace = true; // replace if the group & input is the same and selection indicates as such
                }
            }
            const editor = this.g.preferResourceEditorInput(editorCandidate);
            if (!editor) {
                return;
            }
            if (replace) {
                this.G('replace()', editor);
            }
            else {
                this.G('add()', editor);
            }
            const newStackEntry = { groupId, editor, selection };
            // Replace at current position
            const removedEntries = [];
            if (replace) {
                if (this.s) {
                    removedEntries.push(this.s);
                }
                this.s = newStackEntry;
            }
            // Add to stack at current position
            else {
                // If we are not at the end of history, we remove anything after
                if (this.h.length > this.j + 1) {
                    for (let i = this.j + 1; i < this.h.length; i++) {
                        removedEntries.push(this.h[i]);
                    }
                    this.h = this.h.slice(0, this.j + 1);
                }
                // Insert entry at index
                this.h.splice(this.j + 1, 0, newStackEntry);
                // Check for limit
                if (this.h.length > $Pyb_1.a) {
                    removedEntries.push(this.h.shift()); // remove first
                    if (this.m >= 0) {
                        this.m--;
                    }
                }
                else {
                    this.U(this.j + 1, true /* skip event, we fire it later */);
                }
            }
            // Clear editor listeners from removed entries
            for (const removedEntry of removedEntries) {
                this.g.clearOnEditorDispose(removedEntry.editor, this.c);
            }
            // Remove this from the stack unless the stack input is a resource
            // that can easily be restored even when the input gets disposed
            if ((0, editor_1.$UE)(editor)) {
                this.g.onEditorDispose(editor, () => this.remove(editor), this.c);
            }
            // Event
            this.b.fire();
        }
        P(entry, candidate) {
            if (entry.groupId !== candidate.groupId) {
                return false; // different group
            }
            if (!this.g.matchesEditor(entry.editor, candidate.editor)) {
                return false; // different editor
            }
            if (!entry.selection) {
                return true; // always replace when we have no specific selection yet
            }
            if (!candidate.selection) {
                return false; // otherwise, prefer to keep existing specific selection over new unspecific one
            }
            // Finally, replace when selections are considered identical
            return entry.selection.compare(candidate.selection) === 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        move(event) {
            if (event.isOperation(2 /* FileOperation.MOVE */)) {
                for (const entry of this.h) {
                    if (this.g.matchesEditor(event, entry.editor)) {
                        entry.editor = { resource: event.target.resource };
                    }
                }
            }
        }
        remove(arg1) {
            // Remove all stack entries that match `arg1`
            this.h = this.h.filter(entry => {
                const matches = typeof arg1 === 'number' ? entry.groupId === arg1 : this.g.matchesEditor(arg1, entry.editor);
                // Cleanup any listeners associated with the input when removing
                if (matches) {
                    this.g.clearOnEditorDispose(entry.editor, this.c);
                }
                return !matches;
            });
            // Given we just removed entries, we need to make sure
            // to remove entries that are now identical and next
            // to each other to prevent no-op navigations.
            this.Q();
            // Reset indeces
            this.j = this.h.length - 1;
            this.m = -1;
            // Clear group listener
            if (typeof arg1 === 'number') {
                this.f.get(arg1)?.dispose();
                this.f.delete(arg1);
            }
            // Event
            this.b.fire();
        }
        Q() {
            const flattenedStack = [];
            let previousEntry = undefined;
            for (const entry of this.h) {
                if (previousEntry && this.P(entry, previousEntry)) {
                    continue; // skip over entry when it is considered the same
                }
                previousEntry = entry;
                flattenedStack.push(entry);
            }
            this.h = flattenedStack;
        }
        clear() {
            this.j = -1;
            this.m = -1;
            this.h.splice(0);
            for (const [, disposable] of this.c) {
                (0, lifecycle_1.$fc)(disposable);
            }
            this.c.clear();
            for (const [, disposable] of this.f) {
                (0, lifecycle_1.$fc)(disposable);
            }
            this.f.clear();
        }
        dispose() {
            super.dispose();
            this.clear();
        }
        //#endregion
        //#region Navigation
        canGoForward() {
            return this.h.length > this.j + 1;
        }
        async goForward() {
            const navigated = await this.R();
            if (navigated) {
                return;
            }
            if (!this.canGoForward()) {
                return;
            }
            this.U(this.j + 1);
            return this.W();
        }
        canGoBack() {
            return this.j > 0;
        }
        async goBack() {
            const navigated = await this.R();
            if (navigated) {
                return;
            }
            if (!this.canGoBack()) {
                return;
            }
            this.U(this.j - 1);
            return this.W();
        }
        async goPrevious() {
            const navigated = await this.R();
            if (navigated) {
                return;
            }
            // If we never navigated, just go back
            if (this.m === -1) {
                return this.goBack();
            }
            // Otherwise jump to previous stack entry
            this.U(this.m);
            return this.W();
        }
        canGoLast() {
            return this.h.length > 0;
        }
        async goLast() {
            if (!this.canGoLast()) {
                return;
            }
            this.U(this.h.length - 1);
            return this.W();
        }
        async R() {
            // When this navigation stack works with a specific
            // filter where not every selection change is added
            // to the stack, we want to first reveal the current
            // selection before attempting to navigate in the
            // stack.
            if (this.t === 0 /* GoFilter.NONE */) {
                return false; // only applies when  we are a filterd stack
            }
            if (this.S()) {
                return false; // we are at the current navigation stop
            }
            // Go to current selection
            await this.W();
            return true;
        }
        S() {
            if (!this.s?.selection) {
                return false; // we need a current selection
            }
            const pane = this.y.activeEditorPane;
            if (!(0, editor_1.$LE)(pane)) {
                return false; // we need an active editor pane with selection support
            }
            if (pane.group?.id !== this.s.groupId) {
                return false; // we need matching groups
            }
            if (!pane.input || !this.g.matchesEditor(pane.input, this.s.editor)) {
                return false; // we need matching editors
            }
            const paneSelection = pane.getSelection();
            if (!paneSelection) {
                return false; // we need a selection to compare with
            }
            return paneSelection.compare(this.s.selection) === 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        U(newIndex, skipEvent) {
            this.m = this.j;
            this.j = newIndex;
            // Event
            if (!skipEvent) {
                this.b.fire();
            }
        }
        async W() {
            this.n = true;
            try {
                if (this.s) {
                    await this.X(this.s);
                }
            }
            finally {
                this.n = false;
            }
        }
        X(location) {
            let options = Object.create(null);
            // Apply selection if any
            if (location.selection) {
                options = location.selection.restore(options);
            }
            if ((0, editor_1.$UE)(location.editor)) {
                return this.y.openEditor(location.editor, options, location.groupId);
            }
            return this.y.openEditor({
                ...location.editor,
                options: {
                    ...location.editor.options,
                    ...options
                }
            }, location.groupId);
        }
        isNavigating() {
            return this.n;
        }
    };
    exports.$Pyb = $Pyb;
    exports.$Pyb = $Pyb = $Pyb_1 = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, editorService_1.$9C),
        __param(4, editorGroupsService_1.$5C),
        __param(5, log_1.$5i)
    ], $Pyb);
    let EditorHelper = class EditorHelper {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        preferResourceEditorInput(editor) {
            const resource = editor_1.$3E.getOriginalUri(editor);
            // For now, only prefer well known schemes that we control to prevent
            // issues such as https://github.com/microsoft/vscode/issues/85204
            // from being used as resource inputs
            // resource inputs survive editor disposal and as such are a lot more
            // durable across editor changes and restarts
            const hasValidResourceEditorInputScheme = resource?.scheme === network_1.Schemas.file ||
                resource?.scheme === network_1.Schemas.vscodeRemote ||
                resource?.scheme === network_1.Schemas.vscodeUserData ||
                resource?.scheme === this.d.defaultUriScheme;
            // Scheme is valid: prefer the untyped input
            // over the typed input if possible to keep
            // the entry across restarts
            if (hasValidResourceEditorInputScheme) {
                if ((0, editor_1.$UE)(editor)) {
                    const untypedInput = editor.toUntyped();
                    if ((0, editor_1.$NE)(untypedInput)) {
                        return untypedInput;
                    }
                }
                return editor;
            }
            // Scheme is invalid: allow the editor input
            // for as long as it is not disposed
            else {
                return (0, editor_1.$UE)(editor) ? editor : undefined;
            }
        }
        matchesEditor(arg1, inputB) {
            if (arg1 instanceof files_1.$lk || arg1 instanceof files_1.$kk) {
                if ((0, editor_1.$UE)(inputB)) {
                    return false; // we only support this for `IResourceEditorInputs` that are file based
                }
                if (arg1 instanceof files_1.$lk) {
                    return arg1.contains(inputB.resource, 2 /* FileChangeType.DELETED */);
                }
                return this.matchesFile(inputB.resource, arg1);
            }
            if ((0, editor_1.$UE)(arg1)) {
                if ((0, editor_1.$UE)(inputB)) {
                    return arg1.matches(inputB);
                }
                return this.matchesFile(inputB.resource, arg1);
            }
            if ((0, editor_1.$UE)(inputB)) {
                return this.matchesFile(arg1.resource, inputB);
            }
            return arg1 && inputB && this.a.extUri.isEqual(arg1.resource, inputB.resource);
        }
        matchesFile(resource, arg2) {
            if (arg2 instanceof files_1.$lk) {
                return arg2.contains(resource, 2 /* FileChangeType.DELETED */);
            }
            if (arg2 instanceof files_1.$kk) {
                return this.a.extUri.isEqualOrParent(resource, arg2.resource);
            }
            if ((0, editor_1.$UE)(arg2)) {
                const inputResource = arg2.resource;
                if (!inputResource) {
                    return false;
                }
                if (this.b.phase >= 3 /* LifecyclePhase.Restored */ && !this.c.hasProvider(inputResource)) {
                    return false; // make sure to only check this when workbench has restored (for https://github.com/microsoft/vscode/issues/48275)
                }
                return this.a.extUri.isEqual(inputResource, resource);
            }
            return this.a.extUri.isEqual(arg2?.resource, resource);
        }
        matchesEditorIdentifier(identifier, editorPane) {
            if (!editorPane?.group) {
                return false;
            }
            if (identifier.groupId !== editorPane.group.id) {
                return false;
            }
            return editorPane.input ? identifier.editor.matches(editorPane.input) : false;
        }
        onEditorDispose(editor, listener, mapEditorToDispose) {
            const toDispose = event_1.Event.once(editor.onWillDispose)(() => listener());
            let disposables = mapEditorToDispose.get(editor);
            if (!disposables) {
                disposables = new lifecycle_1.$jc();
                mapEditorToDispose.set(editor, disposables);
            }
            disposables.add(toDispose);
        }
        clearOnEditorDispose(editor, mapEditorToDispose) {
            if (!(0, editor_1.$UE)(editor)) {
                return; // only supported when passing in an actual editor input
            }
            const disposables = mapEditorToDispose.get(editor);
            if (disposables) {
                (0, lifecycle_1.$fc)(disposables);
                mapEditorToDispose.delete(editor);
            }
        }
    };
    EditorHelper = __decorate([
        __param(0, uriIdentity_1.$Ck),
        __param(1, lifecycle_2.$7y),
        __param(2, files_1.$6j),
        __param(3, pathService_1.$yJ)
    ], EditorHelper);
});
//# sourceMappingURL=historyService.js.map