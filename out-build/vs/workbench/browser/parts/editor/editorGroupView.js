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
define(["require", "exports", "vs/workbench/common/editor/editorGroupModel", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom", "vs/platform/instantiation/common/serviceCollection", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/browser/parts/editor/editorPanes", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressIndicator", "vs/nls!vs/workbench/browser/parts/editor/editorGroupView", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/base/common/async", "vs/base/browser/touch", "vs/workbench/browser/parts/editor/editor", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/base/browser/mouseEvent", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextview/browser/contextView", "vs/workbench/services/editor/common/editorService", "vs/base/common/hash", "vs/editor/common/services/languagesAssociations", "vs/base/common/resources", "vs/base/common/network", "vs/platform/editor/common/editor", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/platform", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/browser/defaultStyles", "vs/workbench/browser/parts/editor/editorGroupWatermark", "vs/workbench/browser/parts/editor/editorTitleControl", "vs/css!./media/editorgroupview"], function (require, exports, editorGroupModel_1, editor_1, contextkeys_1, sideBySideEditorInput_1, event_1, instantiation_1, dom_1, serviceCollection_1, contextkey_1, progressbar_1, themeService_1, colorRegistry_1, theme_1, editorPanes_1, progress_1, progressIndicator_1, nls_1, arrays_1, lifecycle_1, telemetry_1, async_1, touch_1, editor_2, actionbar_1, keybinding_1, actions_1, mouseEvent_1, menuEntryActionViewItem_1, contextView_1, editorService_1, hash_1, languagesAssociations_1, resources_1, network_1, editor_3, dialogs_1, filesConfigurationService_1, uriIdentity_1, platform_1, log_1, telemetryUtils_1, defaultStyles_1, editorGroupWatermark_1, editorTitleControl_1) {
    "use strict";
    var $Qxb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Qxb = void 0;
    let $Qxb = $Qxb_1 = class $Qxb extends themeService_1.$nv {
        //#region factory
        static createNew(accessor, index, instantiationService) {
            return instantiationService.createInstance($Qxb_1, accessor, null, index);
        }
        static createFromSerialized(serialized, accessor, index, instantiationService) {
            return instantiationService.createInstance($Qxb_1, accessor, serialized, index);
        }
        static createCopy(copyFrom, accessor, index, instantiationService) {
            return instantiationService.createInstance($Qxb_1, accessor, copyFrom, index);
        }
        constructor(O, from, P, Q, R, themeService, S, U, W, X, Y, Z, $, ab, bb) {
            super(themeService);
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            //#region events
            this.a = this.B(new event_1.$fd());
            this.onDidFocus = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onWillDispose = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidModelChange = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidActiveEditorChange = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidOpenEditorFail = this.g.event;
            this.j = this.B(new event_1.$fd());
            this.onWillCloseEditor = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidCloseEditor = this.m.event;
            this.r = this.B(new event_1.$fd());
            this.onWillMoveEditor = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onWillOpenEditor = this.s.event;
            this.J = this.B(new async_1.$Ug(editors => this.sb(editors), 0));
            this.L = new Map();
            this.M = this.B(new lifecycle_1.$lc());
            this.N = new async_1.$2g();
            this.whenRestored = this.N.p;
            this.xb = false;
            //#endregion
            //#region ISerializableView
            this.element = document.createElement('div');
            this.Ob = this.B(new event_1.$od());
            this.onDidChange = this.Ob.event;
            if (from instanceof $Qxb_1) {
                this.t = this.B(from.t.clone());
            }
            else if ((0, editorGroupModel_1.$YC)(from)) {
                this.t = this.B(Q.createInstance(editorGroupModel_1.$4C, from));
            }
            else {
                this.t = this.B(Q.createInstance(editorGroupModel_1.$4C, undefined));
            }
            //#region create()
            {
                // Scoped context key service
                this.scopedContextKeyService = this.B(this.R.createScoped(this.element));
                // Container
                this.element.classList.add('editor-group-container');
                // Container listeners
                this.db();
                // Container toolbar
                this.eb();
                // Container context menu
                this.fb();
                // Watermark & shortcuts
                this.B(this.Q.createInstance(editorGroupWatermark_1.$yxb, this.element));
                // Progress bar
                this.G = this.B(new progressbar_1.$YR(this.element, defaultStyles_1.$k2));
                this.G.hide();
                // Scoped instantiation service
                this.C = this.Q.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.scopedContextKeyService], [progress_1.$7u, this.B(new progressIndicator_1.$Ceb(this.G, this))]));
                // Context keys
                this.cb();
                // Title container
                this.D = document.createElement('div');
                this.D.classList.add('title');
                this.element.appendChild(this.D);
                // Title control
                this.F = this.B(this.C.createInstance(editorTitleControl_1.$Pxb, this.D, this.O, this));
                // Editor container
                this.H = document.createElement('div');
                this.H.classList.add('editor-container');
                this.element.appendChild(this.H);
                // Editor pane
                this.I = this.B(this.C.createInstance(editorPanes_1.$xxb, this.element, this.H, this));
                this.Ob.input = this.I.onDidChangeSizeConstraints;
                // Track Focus
                this.hb();
                // Update containers
                this.jb();
                this.ib();
                // Update styles
                this.updateStyles();
            }
            //#endregion
            // Restore editors if provided
            const restoreEditorsPromise = this.kb(from) ?? Promise.resolve();
            // Signal restored once editors have restored
            restoreEditorsPromise.finally(() => {
                this.N.complete();
            });
            // Register Listeners
            this.lb();
        }
        cb() {
            const groupActiveEditorDirtyContext = contextkeys_1.$2cb.bindTo(this.scopedContextKeyService);
            const groupActiveEditorPinnedContext = contextkeys_1.$3cb.bindTo(this.scopedContextKeyService);
            const groupActiveEditorFirstContext = contextkeys_1.$4cb.bindTo(this.scopedContextKeyService);
            const groupActiveEditorLastContext = contextkeys_1.$5cb.bindTo(this.scopedContextKeyService);
            const groupActiveEditorStickyContext = contextkeys_1.$6cb.bindTo(this.scopedContextKeyService);
            const groupEditorsCountContext = contextkeys_1.$ddb.bindTo(this.scopedContextKeyService);
            const groupLockedContext = contextkeys_1.$hdb.bindTo(this.scopedContextKeyService);
            const activeEditorListener = this.B(new lifecycle_1.$lc());
            const observeActiveEditor = () => {
                activeEditorListener.clear();
                const activeEditor = this.t.activeEditor;
                if (activeEditor) {
                    groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                    activeEditorListener.value = activeEditor.onDidChangeDirty(() => {
                        groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                    });
                }
                else {
                    groupActiveEditorDirtyContext.set(false);
                }
            };
            // Update group contexts based on group changes
            this.B(this.onDidModelChange(e => {
                switch (e.kind) {
                    case 2 /* GroupModelChangeKind.GROUP_LOCKED */:
                        groupLockedContext.set(this.isLocked);
                        break;
                    case 6 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                    case 4 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    case 3 /* GroupModelChangeKind.EDITOR_OPEN */:
                    case 5 /* GroupModelChangeKind.EDITOR_MOVE */:
                        groupActiveEditorFirstContext.set(this.t.isFirst(this.t.activeEditor));
                        groupActiveEditorLastContext.set(this.t.isLast(this.t.activeEditor));
                        break;
                    case 9 /* GroupModelChangeKind.EDITOR_PIN */:
                        if (e.editor && e.editor === this.t.activeEditor) {
                            groupActiveEditorPinnedContext.set(this.t.isPinned(this.t.activeEditor));
                        }
                        break;
                    case 10 /* GroupModelChangeKind.EDITOR_STICKY */:
                        if (e.editor && e.editor === this.t.activeEditor) {
                            groupActiveEditorStickyContext.set(this.t.isSticky(this.t.activeEditor));
                        }
                        break;
                }
                // Group editors count context
                groupEditorsCountContext.set(this.count);
            }));
            // Track the active editor and update context key that reflects
            // the dirty state of this editor
            this.B(this.onDidActiveEditorChange(() => {
                observeActiveEditor();
            }));
            observeActiveEditor();
        }
        db() {
            // Open new file via doubleclick on empty container
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.DBLCLICK, e => {
                if (this.isEmpty) {
                    dom_1.$5O.stop(e);
                    this.Z.openEditor({
                        resource: undefined,
                        options: {
                            pinned: true,
                            override: editor_1.$HE.id
                        }
                    }, this.id);
                }
            }));
            // Close empty editor group via middle mouse click
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.AUXCLICK, e => {
                if (this.isEmpty && e.button === 1 /* Middle Button */) {
                    dom_1.$5O.stop(e, true);
                    this.O.removeGroup(this);
                }
            }));
        }
        eb() {
            // Toolbar Container
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('editor-group-container-toolbar');
            this.element.appendChild(toolbarContainer);
            // Toolbar
            const containerToolbar = this.B(new actionbar_1.$1P(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)(0, null)
            }));
            // Toolbar actions
            const containerToolbarMenu = this.B(this.W.createMenu(actions_1.$Ru.EmptyEditorGroup, this.scopedContextKeyService));
            const updateContainerToolbar = () => {
                const actions = { primary: [], secondary: [] };
                // Clear old actions
                this.M.value = (0, lifecycle_1.$ic)(() => containerToolbar.clear());
                // Create new actions
                (0, menuEntryActionViewItem_1.$B3)(containerToolbarMenu, { arg: { groupId: this.id }, shouldForwardArgs: true }, actions, 'navigation');
                for (const action of [...actions.primary, ...actions.secondary]) {
                    const keybinding = this.U.lookupKeybinding(action.id);
                    containerToolbar.push(action, { icon: true, label: false, keybinding: keybinding?.getLabel() });
                }
            };
            updateContainerToolbar();
            this.B(containerToolbarMenu.onDidChange(updateContainerToolbar));
        }
        fb() {
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.CONTEXT_MENU, e => this.gb(e)));
            this.B((0, dom_1.$nO)(this.element, touch_1.EventType.Contextmenu, () => this.gb()));
        }
        gb(e) {
            if (!this.isEmpty) {
                return; // only for empty editor groups
            }
            // Find target anchor
            let anchor = this.element;
            if (e instanceof MouseEvent) {
                anchor = new mouseEvent_1.$eO(e);
            }
            // Show it
            this.X.showContextMenu({
                menuId: actions_1.$Ru.EmptyEditorGroupContext,
                contextKeyService: this.R,
                getAnchor: () => anchor,
                onHide: () => {
                    this.focus();
                }
            });
        }
        hb() {
            // Container
            const containerFocusTracker = this.B((0, dom_1.$8O)(this.element));
            this.B(containerFocusTracker.onDidFocus(() => {
                if (this.isEmpty) {
                    this.a.fire(); // only when empty to prevent accident focus
                }
            }));
            // Title Container
            const handleTitleClickOrTouch = (e) => {
                let target;
                if (e instanceof MouseEvent) {
                    if (e.button !== 0 /* middle/right mouse button */ || (platform_1.$j && e.ctrlKey /* macOS context menu */)) {
                        return undefined;
                    }
                    target = e.target;
                }
                else {
                    target = e.initialTarget;
                }
                if ((0, dom_1.$QO)(target, 'monaco-action-bar', this.D) ||
                    (0, dom_1.$QO)(target, 'monaco-breadcrumb-item', this.D)) {
                    return; // not when clicking on actions or breadcrumbs
                }
                // timeout to keep focus in editor after mouse up
                setTimeout(() => {
                    this.focus();
                });
            };
            this.B((0, dom_1.$nO)(this.D, dom_1.$3O.MOUSE_DOWN, e => handleTitleClickOrTouch(e)));
            this.B((0, dom_1.$nO)(this.D, touch_1.EventType.Tap, e => handleTitleClickOrTouch(e)));
            // Editor pane
            this.B(this.I.onDidFocus(() => {
                this.a.fire();
            }));
        }
        ib() {
            // Empty Container: add some empty container attributes
            if (this.isEmpty) {
                this.element.classList.add('empty');
                this.element.tabIndex = 0;
                this.element.setAttribute('aria-label', (0, nls_1.localize)(1, null, this.label));
            }
            // Non-Empty Container: revert empty container attributes
            else {
                this.element.classList.remove('empty');
                this.element.removeAttribute('tabIndex');
                this.element.removeAttribute('aria-label');
            }
            // Update styles
            this.updateStyles();
        }
        jb() {
            this.D.classList.toggle('tabs', this.O.partOptions.showTabs);
            this.D.classList.toggle('show-file-icons', this.O.partOptions.showIcons);
        }
        kb(from) {
            if (this.count === 0) {
                return; // nothing to show
            }
            // Determine editor options
            let options;
            if (from instanceof $Qxb_1) {
                options = (0, editor_2.$9T)(from); // if we copy from another group, ensure to copy its active editor viewstate
            }
            else {
                options = Object.create(null);
            }
            const activeEditor = this.t.activeEditor;
            if (!activeEditor) {
                return;
            }
            options.pinned = this.t.isPinned(activeEditor); // preserve pinned state
            options.sticky = this.t.isSticky(activeEditor); // preserve sticky state
            options.preserveFocus = true; // handle focus after editor is opened
            const activeElement = document.activeElement;
            // Show active editor (intentionally not using async to keep
            // `restoreEditors` from executing in same stack)
            return this.Ab(activeEditor, { active: true, isNew: false /* restored */ }, options).then(() => {
                // Set focused now if this is the active group and focus has
                // not changed meanwhile. This prevents focus from being
                // stolen accidentally on startup when the user already
                // clicked somewhere.
                if (this.O.activeGroup === this && activeElement === document.activeElement) {
                    this.focus();
                }
            });
        }
        //#region event handling
        lb() {
            // Model Events
            this.B(this.t.onDidModelChange(e => this.mb(e)));
            // Option Changes
            this.B(this.O.onDidChangeEditorPartOptions(e => this.tb(e)));
            // Visibility
            this.B(this.O.onDidVisibilityChange(e => this.wb(e)));
        }
        mb(e) {
            // Re-emit to outside
            this.c.fire(e);
            // Handle within
            if (!e.editor) {
                return;
            }
            switch (e.kind) {
                case 3 /* GroupModelChangeKind.EDITOR_OPEN */:
                    if ((0, editorGroupModel_1.$1C)(e)) {
                        this.nb(e.editor, e.editorIndex);
                    }
                    break;
                case 4 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    if ((0, editorGroupModel_1.$3C)(e)) {
                        this.ob(e.editor, e.editorIndex, e.context, e.sticky);
                    }
                    break;
                case 12 /* GroupModelChangeKind.EDITOR_WILL_DISPOSE */:
                    this.rb(e.editor);
                    break;
                case 11 /* GroupModelChangeKind.EDITOR_DIRTY */:
                    this.ub(e.editor);
                    break;
                case 7 /* GroupModelChangeKind.EDITOR_LABEL */:
                    this.vb(e.editor);
                    break;
            }
        }
        nb(editor, editorIndex) {
            /* __GDPR__
                "editorOpened" : {
                    "owner": "bpasero",
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.S.publicLog('editorOpened', this.qb(editor));
            // Update container
            this.ib();
        }
        ob(editor, editorIndex, context, sticky) {
            // Before close
            this.j.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
            // Handle event
            const editorsToClose = [editor];
            // Include both sides of side by side editors when being closed
            if (editor instanceof sideBySideEditorInput_1.$VC) {
                editorsToClose.push(editor.primary, editor.secondary);
            }
            // For each editor to close, we call dispose() to free up any resources.
            // However, certain editors might be shared across multiple editor groups
            // (including being visible in side by side / diff editors) and as such we
            // only dispose when they are not opened elsewhere.
            for (const editor of editorsToClose) {
                if (this.pb(editor)) {
                    editor.dispose();
                }
            }
            /* __GDPR__
                "editorClosed" : {
                    "owner": "bpasero",
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.S.publicLog('editorClosed', this.qb(editor));
            // Update container
            this.ib();
            // Event
            this.m.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
        }
        pb(editor) {
            for (const groupView of this.O.groups) {
                if (groupView instanceof $Qxb_1 && groupView.t.contains(editor, {
                    strictEquals: true,
                    supportSideBySide: editor_1.SideBySideEditor.ANY // include any side of an opened side by side editor
                })) {
                    return false;
                }
            }
            return true;
        }
        qb(editor) {
            const descriptor = editor.getTelemetryDescriptor();
            const resource = editor_1.$3E.getOriginalUri(editor);
            const path = resource ? resource.scheme === network_1.Schemas.file ? resource.fsPath : resource.path : undefined;
            if (resource && path) {
                let resourceExt = (0, resources_1.$gg)(resource);
                // Remove query parameters from the resource extension
                const queryStringLocation = resourceExt.indexOf('?');
                resourceExt = queryStringLocation !== -1 ? resourceExt.substr(0, queryStringLocation) : resourceExt;
                descriptor['resource'] = { mimeType: new telemetryUtils_1.$_n((0, languagesAssociations_1.$fmb)(resource).join(', ')), scheme: resource.scheme, ext: resourceExt, path: (0, hash_1.$pi)(path) };
                /* __GDPR__FRAGMENT__
                    "EditorTelemetryDescriptor" : {
                        "resource": { "${inline}": [ "${URIDescriptor}" ] }
                    }
                */
                return descriptor;
            }
            return descriptor;
        }
        rb(editor) {
            // To prevent race conditions, we handle disposed editors in our worker with a timeout
            // because it can happen that an input is being disposed with the intent to replace
            // it with some other input right after.
            this.J.work(editor);
        }
        sb(disposedEditors) {
            // Split between visible and hidden editors
            let activeEditor;
            const inactiveEditors = [];
            for (const disposedEditor of disposedEditors) {
                const editorFindResult = this.t.findEditor(disposedEditor);
                if (!editorFindResult) {
                    continue; // not part of the model anymore
                }
                const editor = editorFindResult[0];
                if (!editor.isDisposed()) {
                    continue; // editor got reopened meanwhile
                }
                if (this.t.isActive(editor)) {
                    activeEditor = editor;
                }
                else {
                    inactiveEditors.push(editor);
                }
            }
            // Close all inactive editors first to prevent UI flicker
            for (const inactiveEditor of inactiveEditors) {
                this.Eb(inactiveEditor, false);
            }
            // Close active one last
            if (activeEditor) {
                this.Eb(activeEditor, false);
            }
        }
        tb(event) {
            // Title container
            this.jb();
            // Title control
            this.F.updateOptions(event.oldPartOptions, event.newPartOptions);
            // Title control Switch between showing tabs <=> not showing tabs
            if (event.oldPartOptions.showTabs !== event.newPartOptions.showTabs) {
                // Re-layout
                this.relayout();
                // Ensure to show active editor if any
                if (this.t.activeEditor) {
                    this.F.openEditor(this.t.activeEditor);
                }
            }
            // Styles
            this.updateStyles();
            // Pin preview editor once user disables preview
            if (event.oldPartOptions.enablePreview && !event.newPartOptions.enablePreview) {
                if (this.t.previewEditor) {
                    this.pinEditor(this.t.previewEditor);
                }
            }
        }
        ub(editor) {
            // Always show dirty editors pinned
            this.pinEditor(editor);
            // Forward to title control
            this.F.updateEditorDirty(editor);
        }
        vb(editor) {
            // Forward to title control
            this.F.updateEditorLabel(editor);
        }
        wb(visible) {
            // Forward to active editor pane
            this.I.setVisible(visible);
        }
        //#endregion
        //#region IEditorGroupView
        get index() {
            return this.P;
        }
        get label() {
            return (0, nls_1.localize)(2, null, this.P + 1);
        }
        get ariaLabel() {
            return (0, nls_1.localize)(3, null, this.P + 1);
        }
        get disposed() {
            return this.xb;
        }
        get isEmpty() {
            return this.count === 0;
        }
        get titleHeight() {
            return this.F.getHeight();
        }
        notifyIndexChanged(newIndex) {
            if (this.P !== newIndex) {
                this.P = newIndex;
                this.t.setIndex(newIndex);
            }
        }
        setActive(isActive) {
            this.u = isActive;
            // Update container
            this.element.classList.toggle('active', isActive);
            this.element.classList.toggle('inactive', !isActive);
            // Update title control
            this.F.setActive(isActive);
            // Update styles
            this.updateStyles();
            // Update model
            this.t.setActive(undefined /* entire group got active */);
        }
        //#endregion
        //#region IEditorGroup
        //#region basics()
        get id() {
            return this.t.id;
        }
        get editors() {
            return this.t.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        }
        get count() {
            return this.t.count;
        }
        get stickyCount() {
            return this.t.stickyCount;
        }
        get activeEditorPane() {
            return this.I ? this.I.activeEditorPane ?? undefined : undefined;
        }
        get activeEditor() {
            return this.t.activeEditor;
        }
        get previewEditor() {
            return this.t.previewEditor;
        }
        isPinned(editorOrIndex) {
            return this.t.isPinned(editorOrIndex);
        }
        isSticky(editorOrIndex) {
            return this.t.isSticky(editorOrIndex);
        }
        isActive(editor) {
            return this.t.isActive(editor);
        }
        contains(candidate, options) {
            return this.t.contains(candidate, options);
        }
        getEditors(order, options) {
            return this.t.getEditors(order, options);
        }
        findEditors(resource, options) {
            const canonicalResource = this.ab.asCanonicalUri(resource);
            return this.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(editor => {
                if (editor.resource && (0, resources_1.$bg)(editor.resource, canonicalResource)) {
                    return true;
                }
                // Support side by side editor primary side if specified
                if (options?.supportSideBySide === editor_1.SideBySideEditor.PRIMARY || options?.supportSideBySide === editor_1.SideBySideEditor.ANY) {
                    const primaryResource = editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    if (primaryResource && (0, resources_1.$bg)(primaryResource, canonicalResource)) {
                        return true;
                    }
                }
                // Support side by side editor secondary side if specified
                if (options?.supportSideBySide === editor_1.SideBySideEditor.SECONDARY || options?.supportSideBySide === editor_1.SideBySideEditor.ANY) {
                    const secondaryResource = editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                    if (secondaryResource && (0, resources_1.$bg)(secondaryResource, canonicalResource)) {
                        return true;
                    }
                }
                return false;
            });
        }
        getEditorByIndex(index) {
            return this.t.getEditorByIndex(index);
        }
        getIndexOfEditor(editor) {
            return this.t.indexOf(editor);
        }
        isFirst(editor) {
            return this.t.isFirst(editor);
        }
        isLast(editor) {
            return this.t.isLast(editor);
        }
        focus() {
            // Pass focus to editor panes
            if (this.activeEditorPane) {
                this.activeEditorPane.focus();
            }
            else {
                this.element.focus();
            }
            // Event
            this.a.fire();
        }
        pinEditor(candidate = this.activeEditor || undefined) {
            if (candidate && !this.t.isPinned(candidate)) {
                // Update model
                const editor = this.t.pin(candidate);
                // Forward to title control
                if (editor) {
                    this.F.pinEditor(editor);
                }
            }
        }
        stickEditor(candidate = this.activeEditor || undefined) {
            this.yb(candidate, true);
        }
        unstickEditor(candidate = this.activeEditor || undefined) {
            this.yb(candidate, false);
        }
        yb(candidate, sticky) {
            if (candidate && this.t.isSticky(candidate) !== sticky) {
                const oldIndexOfEditor = this.getIndexOfEditor(candidate);
                // Update model
                const editor = sticky ? this.t.stick(candidate) : this.t.unstick(candidate);
                if (!editor) {
                    return;
                }
                // If the index of the editor changed, we need to forward this to
                // title control and also make sure to emit this as an event
                const newIndexOfEditor = this.getIndexOfEditor(editor);
                if (newIndexOfEditor !== oldIndexOfEditor) {
                    this.F.moveEditor(editor, oldIndexOfEditor, newIndexOfEditor);
                }
                // Forward sticky state to title control
                if (sticky) {
                    this.F.stickEditor(editor);
                }
                else {
                    this.F.unstickEditor(editor);
                }
            }
        }
        //#endregion
        //#region openEditor()
        async openEditor(editor, options) {
            return this.zb(editor, options, {
                // Allow to match on a side-by-side editor when same
                // editor is opened on both sides. In that case we
                // do not want to open a new editor but reuse that one.
                supportSideBySide: editor_1.SideBySideEditor.BOTH
            });
        }
        async zb(editor, options, internalOptions) {
            // Guard against invalid editors. Disposed editors
            // should never open because they emit no events
            // e.g. to indicate dirty changes.
            if (!editor || editor.isDisposed()) {
                return;
            }
            // Fire the event letting everyone know we are about to open an editor
            this.s.fire({ editor, groupId: this.id });
            // Determine options
            const pinned = options?.sticky
                || !this.O.partOptions.enablePreview
                || editor.isDirty()
                || (options?.pinned ?? typeof options?.index === 'number' /* unless specified, prefer to pin when opening with index */)
                || (typeof options?.index === 'number' && this.t.isSticky(options.index))
                || editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */);
            const openEditorOptions = {
                index: options ? options.index : undefined,
                pinned,
                sticky: options?.sticky || (typeof options?.index === 'number' && this.t.isSticky(options.index)),
                active: this.count === 0 || !options || !options.inactive,
                supportSideBySide: internalOptions?.supportSideBySide
            };
            if (options?.sticky && typeof options?.index === 'number' && !this.t.isSticky(options.index)) {
                // Special case: we are to open an editor sticky but at an index that is not sticky
                // In that case we prefer to open the editor at the index but not sticky. This enables
                // to drag a sticky editor to an index that is not sticky to unstick it.
                openEditorOptions.sticky = false;
            }
            if (!openEditorOptions.active && !openEditorOptions.pinned && this.t.activeEditor && !this.t.isPinned(this.t.activeEditor)) {
                // Special case: we are to open an editor inactive and not pinned, but the current active
                // editor is also not pinned, which means it will get replaced with this one. As such,
                // the editor can only be active.
                openEditorOptions.active = true;
            }
            let activateGroup = false;
            let restoreGroup = false;
            if (options?.activation === editor_3.EditorActivation.ACTIVATE) {
                // Respect option to force activate an editor group.
                activateGroup = true;
            }
            else if (options?.activation === editor_3.EditorActivation.RESTORE) {
                // Respect option to force restore an editor group.
                restoreGroup = true;
            }
            else if (options?.activation === editor_3.EditorActivation.PRESERVE) {
                // Respect option to preserve active editor group.
                activateGroup = false;
                restoreGroup = false;
            }
            else if (openEditorOptions.active) {
                // Finally, we only activate/restore an editor which is
                // opening as active editor.
                // If preserveFocus is enabled, we only restore but never
                // activate the group.
                activateGroup = !options || !options.preserveFocus;
                restoreGroup = !activateGroup;
            }
            // Actually move the editor if a specific index is provided and we figure
            // out that the editor is already opened at a different index. This
            // ensures the right set of events are fired to the outside.
            if (typeof openEditorOptions.index === 'number') {
                const indexOfEditor = this.t.indexOf(editor);
                if (indexOfEditor !== -1 && indexOfEditor !== openEditorOptions.index) {
                    this.Bb(editor, openEditorOptions);
                }
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const { editor: openedEditor, isNew } = this.t.openEditor(editor, openEditorOptions);
            // Conditionally lock the group
            if (isNew && // only if this editor was new for the group
                this.count === 1 && // only when this editor was the first editor in the group
                this.O.groups.length > 1 // only when there are more than one groups open
            ) {
                // only when the editor identifier is configured as such
                if (openedEditor.editorId && this.O.partOptions.autoLockGroups?.has(openedEditor.editorId)) {
                    this.lock(true);
                }
            }
            // Show editor
            const showEditorResult = this.Ab(openedEditor, { active: !!openEditorOptions.active, isNew }, options, internalOptions);
            // Finally make sure the group is active or restored as instructed
            if (activateGroup) {
                this.O.activateGroup(this);
            }
            else if (restoreGroup) {
                this.O.restoreGroup(this);
            }
            return showEditorResult;
        }
        Ab(editor, context, options, internalOptions) {
            // Show in editor control if the active editor changed
            let openEditorPromise;
            if (context.active) {
                openEditorPromise = (async () => {
                    const { pane, changed, cancelled, error } = await this.I.openEditor(editor, options, { newInGroup: context.isNew });
                    // Return early if the operation was cancelled by another operation
                    if (cancelled) {
                        return undefined;
                    }
                    // Editor change event
                    if (changed) {
                        this.f.fire({ editor });
                    }
                    // Indicate error as an event but do not bubble them up
                    if (error) {
                        this.g.fire(editor);
                    }
                    // Without an editor pane, recover by closing the active editor
                    // (if the input is still the active one)
                    if (!pane && this.activeEditor === editor) {
                        const focusNext = !options || !options.preserveFocus;
                        this.Eb(editor, focusNext, { fromError: true });
                    }
                    return pane;
                })();
            }
            else {
                openEditorPromise = Promise.resolve(undefined); // inactive: return undefined as result to signal this
            }
            // Show in title control after editor control because some actions depend on it
            // but respect the internal options in case title control updates should skip.
            if (!internalOptions?.skipTitleUpdate) {
                this.F.openEditor(editor);
            }
            return openEditorPromise;
        }
        //#endregion
        //#region openEditors()
        async openEditors(editors) {
            // Guard against invalid editors. Disposed editors
            // should never open because they emit no events
            // e.g. to indicate dirty changes.
            const editorsToOpen = (0, arrays_1.$Fb)(editors).filter(({ editor }) => !editor.isDisposed());
            // Use the first editor as active editor
            const firstEditor = (0, arrays_1.$Mb)(editorsToOpen);
            if (!firstEditor) {
                return;
            }
            const openEditorsOptions = {
                // Allow to match on a side-by-side editor when same
                // editor is opened on both sides. In that case we
                // do not want to open a new editor but reuse that one.
                supportSideBySide: editor_1.SideBySideEditor.BOTH
            };
            await this.zb(firstEditor.editor, firstEditor.options, openEditorsOptions);
            // Open the other ones inactive
            const inactiveEditors = editorsToOpen.slice(1);
            const startingIndex = this.getIndexOfEditor(firstEditor.editor) + 1;
            await async_1.Promises.settled(inactiveEditors.map(({ editor, options }, index) => {
                return this.zb(editor, {
                    ...options,
                    inactive: true,
                    pinned: true,
                    index: startingIndex + index
                }, {
                    ...openEditorsOptions,
                    // optimization: update the title control later
                    // https://github.com/microsoft/vscode/issues/130634
                    skipTitleUpdate: true
                });
            }));
            // Update the title control all at once with all editors
            this.F.openEditors(inactiveEditors.map(({ editor }) => editor));
            // Opening many editors at once can put any editor to be
            // the active one depending on options. As such, we simply
            // return the active editor pane after this operation.
            return this.I.activeEditorPane ?? undefined;
        }
        //#endregion
        //#region moveEditor()
        moveEditors(editors, target) {
            // Optimization: knowing that we move many editors, we
            // delay the title update to a later point for this group
            // through a method that allows for bulk updates but only
            // when moving to a different group where many editors
            // are more likely to occur.
            const internalOptions = {
                skipTitleUpdate: this !== target
            };
            for (const { editor, options } of editors) {
                this.moveEditor(editor, target, options, internalOptions);
            }
            // Update the title control all at once with all editors
            // in source and target if the title update was skipped
            if (internalOptions.skipTitleUpdate) {
                const movedEditors = editors.map(({ editor }) => editor);
                target.F.openEditors(movedEditors);
                this.F.closeEditors(movedEditors);
            }
        }
        moveEditor(editor, target, options, internalOptions) {
            // Move within same group
            if (this === target) {
                this.Bb(editor, options);
            }
            // Move across groups
            else {
                this.Cb(editor, target, options, { ...internalOptions, keepCopy: false });
            }
        }
        Bb(candidate, options) {
            const moveToIndex = options ? options.index : undefined;
            if (typeof moveToIndex !== 'number') {
                return; // do nothing if we move into same group without index
            }
            const currentIndex = this.t.indexOf(candidate);
            if (currentIndex === -1 || currentIndex === moveToIndex) {
                return; // do nothing if editor unknown in model or is already at the given index
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const editor = this.t.getEditorByIndex(currentIndex);
            if (!editor) {
                return;
            }
            // Update model
            this.t.moveEditor(editor, moveToIndex);
            this.t.pin(editor);
            // Forward to title control
            this.F.moveEditor(editor, currentIndex, moveToIndex);
            this.F.pinEditor(editor);
        }
        Cb(editor, target, openOptions, internalOptions) {
            const keepCopy = internalOptions?.keepCopy;
            // When moving/copying an editor, try to preserve as much view state as possible
            // by checking for the editor to be a text editor and creating the options accordingly
            // if so
            const options = (0, editor_2.$9T)(this, editor, {
                ...openOptions,
                pinned: true,
                sticky: !keepCopy && this.t.isSticky(editor) // preserve sticky state only if editor is moved (https://github.com/microsoft/vscode/issues/99035)
            });
            // Indicate will move event
            if (!keepCopy) {
                this.r.fire({
                    groupId: this.id,
                    editor,
                    target: target.id
                });
            }
            // A move to another group is an open first...
            target.zb(keepCopy ? editor.copy() : editor, options, internalOptions);
            // ...and a close afterwards (unless we copy)
            if (!keepCopy) {
                this.Eb(editor, false /* do not focus next one behind if any */, { ...internalOptions, context: editor_1.EditorCloseContext.MOVE });
            }
        }
        //#endregion
        //#region copyEditor()
        copyEditors(editors, target) {
            // Optimization: knowing that we move many editors, we
            // delay the title update to a later point for this group
            // through a method that allows for bulk updates but only
            // when moving to a different group where many editors
            // are more likely to occur.
            const internalOptions = {
                skipTitleUpdate: this !== target
            };
            for (const { editor, options } of editors) {
                this.copyEditor(editor, target, options, internalOptions);
            }
            // Update the title control all at once with all editors
            // in target if the title update was skipped
            if (internalOptions.skipTitleUpdate) {
                const copiedEditors = editors.map(({ editor }) => editor);
                target.F.openEditors(copiedEditors);
            }
        }
        copyEditor(editor, target, options, internalOptions) {
            // Move within same group because we do not support to show the same editor
            // multiple times in the same group
            if (this === target) {
                this.Bb(editor, options);
            }
            // Copy across groups
            else {
                this.Cb(editor, target, options, { ...internalOptions, keepCopy: true });
            }
        }
        //#endregion
        //#region closeEditor()
        async closeEditor(editor = this.activeEditor || undefined, options) {
            return this.Db(editor, options);
        }
        async Db(editor = this.activeEditor || undefined, options, internalOptions) {
            if (!editor) {
                return false;
            }
            // Check for confirmation and veto
            const veto = await this.Ib([editor]);
            if (veto) {
                return false;
            }
            // Do close
            this.Eb(editor, options?.preserveFocus ? false : undefined, internalOptions);
            return true;
        }
        Eb(editor, focusNext = (this.O.activeGroup === this), internalOptions) {
            // Forward to title control unless skipped via internal options
            if (!internalOptions?.skipTitleUpdate) {
                this.F.beforeCloseEditor(editor);
            }
            // Closing the active editor of the group is a bit more work
            if (this.t.isActive(editor)) {
                this.Fb(focusNext, internalOptions);
            }
            // Closing inactive editor is just a model update
            else {
                this.Hb(editor, internalOptions);
            }
            // Forward to title control unless skipped via internal options
            if (!internalOptions?.skipTitleUpdate) {
                this.F.closeEditor(editor);
            }
        }
        Fb(focusNext = (this.O.activeGroup === this), internalOptions) {
            const editorToClose = this.activeEditor;
            const restoreFocus = this.Gb(this.element);
            // Optimization: if we are about to close the last editor in this group and settings
            // are configured to close the group since it will be empty, we first set the last
            // active group as empty before closing the editor. This reduces the amount of editor
            // change events that this operation emits and will reduce flicker. Without this
            // optimization, this group (if active) would first trigger a active editor change
            // event because it became empty, only to then trigger another one when the next
            // group gets active.
            const closeEmptyGroup = this.O.partOptions.closeEmptyGroups;
            if (closeEmptyGroup && this.u && this.count === 1) {
                const mostRecentlyActiveGroups = this.O.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
                const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current one, so take [1]
                if (nextActiveGroup) {
                    if (restoreFocus) {
                        nextActiveGroup.focus();
                    }
                    else {
                        this.O.activateGroup(nextActiveGroup);
                    }
                }
            }
            // Update model
            if (editorToClose) {
                this.t.closeEditor(editorToClose, internalOptions?.context);
            }
            // Open next active if there are more to show
            const nextActiveEditor = this.t.activeEditor;
            if (nextActiveEditor) {
                const preserveFocus = !focusNext;
                let activation = undefined;
                if (preserveFocus && this.O.activeGroup !== this) {
                    // If we are opening the next editor in an inactive group
                    // without focussing it, ensure we preserve the editor
                    // group sizes in case that group is minimized.
                    // https://github.com/microsoft/vscode/issues/117686
                    activation = editor_3.EditorActivation.PRESERVE;
                }
                const options = {
                    preserveFocus,
                    activation,
                    // When closing an editor due to an error we can end up in a loop where we continue closing
                    // editors that fail to open (e.g. when the file no longer exists). We do not want to show
                    // repeated errors in this case to the user. As such, if we open the next editor and we are
                    // in a scope of a previous editor failing, we silence the input errors until the editor is
                    // opened by setting ignoreError: true.
                    ignoreError: internalOptions?.fromError
                };
                this.zb(nextActiveEditor, options);
            }
            // Otherwise we are empty, so clear from editor control and send event
            else {
                // Forward to editor pane
                if (editorToClose) {
                    this.I.closeEditor(editorToClose);
                }
                // Restore focus to group container as needed unless group gets closed
                if (restoreFocus && !closeEmptyGroup) {
                    this.focus();
                }
                // Events
                this.f.fire({ editor: undefined });
                // Remove empty group if we should
                if (closeEmptyGroup) {
                    this.O.removeGroup(this);
                }
            }
        }
        Gb(target) {
            const activeElement = document.activeElement;
            if (activeElement === document.body) {
                return true; // always restore focus if nothing is focused currently
            }
            // otherwise check for the active element being an ancestor of the target
            return (0, dom_1.$NO)(activeElement, target);
        }
        Hb(editor, internalOptions) {
            // Update model
            this.t.closeEditor(editor, internalOptions?.context);
        }
        async Ib(editors) {
            if (!editors.length) {
                return false; // no veto
            }
            const editor = editors.shift();
            // To prevent multiple confirmation dialogs from showing up one after the other
            // we check if a pending confirmation is currently showing and if so, join that
            let handleCloseConfirmationPromise = this.L.get(editor);
            if (!handleCloseConfirmationPromise) {
                handleCloseConfirmationPromise = this.Jb(editor);
                this.L.set(editor, handleCloseConfirmationPromise);
            }
            let veto;
            try {
                veto = await handleCloseConfirmationPromise;
            }
            finally {
                this.L.delete(editor);
            }
            // Return for the first veto we got
            if (veto) {
                return veto;
            }
            // Otherwise continue with the remainders
            return this.Ib(editors);
        }
        async Jb(editor, options) {
            if (!this.Kb(editor)) {
                return false; // no veto
            }
            if (editor instanceof sideBySideEditorInput_1.$VC && this.t.contains(editor.primary)) {
                return false; // primary-side of editor is still opened somewhere else
            }
            // Note: we explicitly decide to ask for confirm if closing a normal editor even
            // if it is opened in a side-by-side editor in the group. This decision is made
            // because it may be less obvious that one side of a side by side editor is dirty
            // and can still be changed.
            // The only exception is when the same editor is opened on both sides of a side
            // by side editor (https://github.com/microsoft/vscode/issues/138442)
            if (this.O.groups.some(groupView => {
                if (groupView === this) {
                    return false; // skip (we already handled our group above)
                }
                const otherGroup = groupView;
                if (otherGroup.contains(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH })) {
                    return true; // exact editor still opened (either single, or split-in-group)
                }
                if (editor instanceof sideBySideEditorInput_1.$VC && otherGroup.contains(editor.primary)) {
                    return true; // primary side of side by side editor still opened
                }
                return false;
            })) {
                return false; // editor is still editable somewhere else
            }
            // In some cases trigger save before opening the dialog depending
            // on auto-save configuration.
            // However, make sure to respect `skipAutoSave` option in case the automated
            // save fails which would result in the editor never closing.
            // Also, we only do this if no custom confirmation handling is implemented.
            let confirmation = 2 /* ConfirmResult.CANCEL */;
            let saveReason = 1 /* SaveReason.EXPLICIT */;
            let autoSave = false;
            if (!editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) && !options?.skipAutoSave && !editor.closeHandler) {
                // Auto-save on focus change: save, because a dialog would steal focus
                // (see https://github.com/microsoft/vscode/issues/108752)
                if (this.$.getAutoSaveMode() === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */) {
                    autoSave = true;
                    confirmation = 0 /* ConfirmResult.SAVE */;
                    saveReason = 3 /* SaveReason.FOCUS_CHANGE */;
                }
                // Auto-save on window change: save, because on Windows and Linux, a
                // native dialog triggers the window focus change
                // (see https://github.com/microsoft/vscode/issues/134250)
                else if ((platform_1.$m && (platform_1.$i || platform_1.$k)) && this.$.getAutoSaveMode() === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */) {
                    autoSave = true;
                    confirmation = 0 /* ConfirmResult.SAVE */;
                    saveReason = 4 /* SaveReason.WINDOW_CHANGE */;
                }
            }
            // No auto-save on focus change or custom confirmation handler: ask user
            if (!autoSave) {
                // Switch to editor that we want to handle for confirmation unless showing already
                if (!this.activeEditor || !this.activeEditor.matches(editor)) {
                    await this.zb(editor);
                }
                // Let editor handle confirmation if implemented
                if (typeof editor.closeHandler?.confirm === 'function') {
                    confirmation = await editor.closeHandler.confirm([{ editor, groupId: this.id }]);
                }
                // Show a file specific confirmation
                else {
                    let name;
                    if (editor instanceof sideBySideEditorInput_1.$VC) {
                        name = editor.primary.getName(); // prefer shorter names by using primary's name in this case
                    }
                    else {
                        name = editor.getName();
                    }
                    confirmation = await this.Y.showSaveConfirm([name]);
                }
            }
            // It could be that the editor's choice of confirmation has changed
            // given the check for confirmation is long running, so we check
            // again to see if anything needs to happen before closing for good.
            // This can happen for example if `autoSave: onFocusChange` is configured
            // so that the save happens when the dialog opens.
            // However, we only do this unless a custom confirm handler is installed
            // that may not be fit to be asked a second time right after.
            if (!editor.closeHandler && !this.Kb(editor)) {
                return confirmation === 2 /* ConfirmResult.CANCEL */ ? true : false;
            }
            // Otherwise, handle accordingly
            switch (confirmation) {
                case 0 /* ConfirmResult.SAVE */: {
                    const result = await editor.save(this.id, { reason: saveReason });
                    if (!result && autoSave) {
                        // Save failed and we need to signal this back to the user, so
                        // we handle the dirty editor again but this time ensuring to
                        // show the confirm dialog
                        // (see https://github.com/microsoft/vscode/issues/108752)
                        return this.Jb(editor, { skipAutoSave: true });
                    }
                    return editor.isDirty(); // veto if still dirty
                }
                case 1 /* ConfirmResult.DONT_SAVE */:
                    try {
                        // first try a normal revert where the contents of the editor are restored
                        await editor.revert(this.id);
                        return editor.isDirty(); // veto if still dirty
                    }
                    catch (error) {
                        this.bb.error(error);
                        // if that fails, since we are about to close the editor, we accept that
                        // the editor cannot be reverted and instead do a soft revert that just
                        // enables us to close the editor. With this, a user can always close a
                        // dirty editor even when reverting fails.
                        await editor.revert(this.id, { soft: true });
                        return editor.isDirty(); // veto if still dirty
                    }
                case 2 /* ConfirmResult.CANCEL */:
                    return true; // veto
            }
        }
        Kb(editor) {
            if (editor.closeHandler) {
                return editor.closeHandler.showConfirm(); // custom handling of confirmation on close
            }
            return editor.isDirty() && !editor.isSaving(); // editor must be dirty and not saving
        }
        //#endregion
        //#region closeEditors()
        async closeEditors(args, options) {
            if (this.isEmpty) {
                return true;
            }
            const editors = this.Lb(args);
            // Check for confirmation and veto
            const veto = await this.Ib(editors.slice(0));
            if (veto) {
                return false;
            }
            // Do close
            this.Mb(editors, options);
            return true;
        }
        Lb(args) {
            if (Array.isArray(args)) {
                return args;
            }
            const filter = args;
            const hasDirection = typeof filter.direction === 'number';
            let editorsToClose = this.t.getEditors(hasDirection ? 1 /* EditorsOrder.SEQUENTIAL */ : 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, filter); // in MRU order only if direction is not specified
            // Filter: saved or saving only
            if (filter.savedOnly) {
                editorsToClose = editorsToClose.filter(editor => !editor.isDirty() || editor.isSaving());
            }
            // Filter: direction (left / right)
            else if (hasDirection && filter.except) {
                editorsToClose = (filter.direction === 0 /* CloseDirection.LEFT */) ?
                    editorsToClose.slice(0, this.t.indexOf(filter.except, editorsToClose)) :
                    editorsToClose.slice(this.t.indexOf(filter.except, editorsToClose) + 1);
            }
            // Filter: except
            else if (filter.except) {
                editorsToClose = editorsToClose.filter(editor => filter.except && !editor.matches(filter.except));
            }
            return editorsToClose;
        }
        Mb(editors, options) {
            // Close all inactive editors first
            let closeActiveEditor = false;
            for (const editor of editors) {
                if (!this.isActive(editor)) {
                    this.Hb(editor);
                }
                else {
                    closeActiveEditor = true;
                }
            }
            // Close active editor last if contained in editors list to close
            if (closeActiveEditor) {
                this.Fb(options?.preserveFocus ? false : undefined);
            }
            // Forward to title control
            if (editors.length) {
                this.F.closeEditors(editors);
            }
        }
        //#endregion
        //#region closeAllEditors()
        async closeAllEditors(options) {
            if (this.isEmpty) {
                // If the group is empty and the request is to close all editors, we still close
                // the editor group is the related setting to close empty groups is enabled for
                // a convenient way of removing empty editor groups for the user.
                if (this.O.partOptions.closeEmptyGroups) {
                    this.O.removeGroup(this);
                }
                return true;
            }
            // Check for confirmation and veto
            const veto = await this.Ib(this.t.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, options));
            if (veto) {
                return false;
            }
            // Do close
            this.Nb(options);
            return true;
        }
        Nb(options) {
            // Close all inactive editors first
            const editorsToClose = [];
            for (const editor of this.t.getEditors(1 /* EditorsOrder.SEQUENTIAL */, options)) {
                if (!this.isActive(editor)) {
                    this.Hb(editor);
                }
                editorsToClose.push(editor);
            }
            // Close active editor last (unless we skip it, e.g. because it is sticky)
            if (this.activeEditor && editorsToClose.includes(this.activeEditor)) {
                this.Fb();
            }
            // Forward to title control
            if (editorsToClose.length) {
                this.F.closeEditors(editorsToClose);
            }
        }
        //#endregion
        //#region replaceEditors()
        async replaceEditors(editors) {
            // Extract active vs. inactive replacements
            let activeReplacement;
            const inactiveReplacements = [];
            for (let { editor, replacement, forceReplaceDirty, options } of editors) {
                const index = this.getIndexOfEditor(editor);
                if (index >= 0) {
                    const isActiveEditor = this.isActive(editor);
                    // make sure we respect the index of the editor to replace
                    if (options) {
                        options.index = index;
                    }
                    else {
                        options = { index };
                    }
                    options.inactive = !isActiveEditor;
                    options.pinned = options.pinned ?? true; // unless specified, prefer to pin upon replace
                    const editorToReplace = { editor, replacement, forceReplaceDirty, options };
                    if (isActiveEditor) {
                        activeReplacement = editorToReplace;
                    }
                    else {
                        inactiveReplacements.push(editorToReplace);
                    }
                }
            }
            // Handle inactive first
            for (const { editor, replacement, forceReplaceDirty, options } of inactiveReplacements) {
                // Open inactive editor
                await this.zb(replacement, options);
                // Close replaced inactive editor unless they match
                if (!editor.matches(replacement)) {
                    let closed = false;
                    if (forceReplaceDirty) {
                        this.Eb(editor, false, { context: editor_1.EditorCloseContext.REPLACE });
                        closed = true;
                    }
                    else {
                        closed = await this.Db(editor, { preserveFocus: true }, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                    if (!closed) {
                        return; // canceled
                    }
                }
            }
            // Handle active last
            if (activeReplacement) {
                // Open replacement as active editor
                const openEditorResult = this.zb(activeReplacement.replacement, activeReplacement.options);
                // Close replaced active editor unless they match
                if (!activeReplacement.editor.matches(activeReplacement.replacement)) {
                    if (activeReplacement.forceReplaceDirty) {
                        this.Eb(activeReplacement.editor, false, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                    else {
                        await this.Db(activeReplacement.editor, { preserveFocus: true }, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                }
                await openEditorResult;
            }
        }
        //#endregion
        //#region Locking
        get isLocked() {
            if (this.O.groups.length === 1) {
                // Special case: if only 1 group is opened, never report it as locked
                // to ensure editors can always open in the "default" editor group
                return false;
            }
            return this.t.isLocked;
        }
        lock(locked) {
            if (this.O.groups.length === 1) {
                // Special case: if only 1 group is opened, never allow to lock
                // to ensure editors can always open in the "default" editor group
                locked = false;
            }
            this.t.lock(locked);
        }
        //#endregion
        //#region Themable
        updateStyles() {
            const isEmpty = this.isEmpty;
            // Container
            if (isEmpty) {
                this.element.style.backgroundColor = this.z(theme_1.$y_) || '';
            }
            else {
                this.element.style.backgroundColor = '';
            }
            // Title control
            const borderColor = this.z(theme_1.$D_) || this.z(colorRegistry_1.$Av);
            if (!isEmpty && borderColor) {
                this.D.classList.add('title-border-bottom');
                this.D.style.setProperty('--title-border-bottom-color', borderColor);
            }
            else {
                this.D.classList.remove('title-border-bottom');
                this.D.style.removeProperty('--title-border-bottom-color');
            }
            const { showTabs } = this.O.partOptions;
            this.D.style.backgroundColor = this.z(showTabs ? theme_1.$A_ : theme_1.$C_) || '';
            // Editor container
            this.H.style.backgroundColor = this.z(colorRegistry_1.$ww) || '';
        }
        get minimumWidth() { return this.I.minimumWidth; }
        get minimumHeight() { return this.I.minimumHeight; }
        get maximumWidth() { return this.I.maximumWidth; }
        get maximumHeight() { return this.I.maximumHeight; }
        get proportionalLayout() {
            if (!this.y) {
                return true;
            }
            return !(this.y.width === this.minimumWidth || this.y.height === this.minimumHeight);
        }
        layout(width, height, top, left) {
            this.y = { width, height, top, left };
            this.element.classList.toggle('max-height-478px', height <= 478);
            // Layout the title control first to receive the size it occupies
            const titleControlSize = this.F.layout({
                container: new dom_1.$BO(width, height),
                available: new dom_1.$BO(width, height - this.I.minimumHeight)
            });
            // Pass the container width and remaining height to the editor layout
            const editorHeight = Math.max(0, height - titleControlSize.height);
            this.H.style.height = `${editorHeight}px`;
            this.I.layout({ width, height: editorHeight, top: top + titleControlSize.height, left });
        }
        relayout() {
            if (this.y) {
                const { width, height, top, left } = this.y;
                this.layout(width, height, top, left);
            }
        }
        setBoundarySashes(sashes) {
            this.I.setBoundarySashes(sashes);
        }
        toJSON() {
            return this.t.serialize();
        }
        //#endregion
        dispose() {
            this.xb = true;
            this.b.fire();
            super.dispose();
        }
    };
    exports.$Qxb = $Qxb;
    exports.$Qxb = $Qxb = $Qxb_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, contextkey_1.$3i),
        __param(5, themeService_1.$gv),
        __param(6, telemetry_1.$9k),
        __param(7, keybinding_1.$2D),
        __param(8, actions_1.$Su),
        __param(9, contextView_1.$WZ),
        __param(10, dialogs_1.$qA),
        __param(11, editorService_1.$9C),
        __param(12, filesConfigurationService_1.$yD),
        __param(13, uriIdentity_1.$Ck),
        __param(14, log_1.$5i)
    ], $Qxb);
});
//# sourceMappingURL=editorGroupView.js.map