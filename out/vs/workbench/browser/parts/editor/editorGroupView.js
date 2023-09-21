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
define(["require", "exports", "vs/workbench/common/editor/editorGroupModel", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom", "vs/platform/instantiation/common/serviceCollection", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/browser/parts/editor/editorPanes", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressIndicator", "vs/nls", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/base/common/async", "vs/base/browser/touch", "vs/workbench/browser/parts/editor/editor", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/base/browser/mouseEvent", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextview/browser/contextView", "vs/workbench/services/editor/common/editorService", "vs/base/common/hash", "vs/editor/common/services/languagesAssociations", "vs/base/common/resources", "vs/base/common/network", "vs/platform/editor/common/editor", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/platform", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/browser/defaultStyles", "vs/workbench/browser/parts/editor/editorGroupWatermark", "vs/workbench/browser/parts/editor/editorTitleControl", "vs/css!./media/editorgroupview"], function (require, exports, editorGroupModel_1, editor_1, contextkeys_1, sideBySideEditorInput_1, event_1, instantiation_1, dom_1, serviceCollection_1, contextkey_1, progressbar_1, themeService_1, colorRegistry_1, theme_1, editorPanes_1, progress_1, progressIndicator_1, nls_1, arrays_1, lifecycle_1, telemetry_1, async_1, touch_1, editor_2, actionbar_1, keybinding_1, actions_1, mouseEvent_1, menuEntryActionViewItem_1, contextView_1, editorService_1, hash_1, languagesAssociations_1, resources_1, network_1, editor_3, dialogs_1, filesConfigurationService_1, uriIdentity_1, platform_1, log_1, telemetryUtils_1, defaultStyles_1, editorGroupWatermark_1, editorTitleControl_1) {
    "use strict";
    var EditorGroupView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGroupView = void 0;
    let EditorGroupView = EditorGroupView_1 = class EditorGroupView extends themeService_1.Themable {
        //#region factory
        static createNew(accessor, index, instantiationService) {
            return instantiationService.createInstance(EditorGroupView_1, accessor, null, index);
        }
        static createFromSerialized(serialized, accessor, index, instantiationService) {
            return instantiationService.createInstance(EditorGroupView_1, accessor, serialized, index);
        }
        static createCopy(copyFrom, accessor, index, instantiationService) {
            return instantiationService.createInstance(EditorGroupView_1, accessor, copyFrom, index);
        }
        constructor(accessor, from, _index, instantiationService, contextKeyService, themeService, telemetryService, keybindingService, menuService, contextMenuService, fileDialogService, editorService, filesConfigurationService, uriIdentityService, logService) {
            super(themeService);
            this.accessor = accessor;
            this._index = _index;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.telemetryService = telemetryService;
            this.keybindingService = keybindingService;
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.fileDialogService = fileDialogService;
            this.editorService = editorService;
            this.filesConfigurationService = filesConfigurationService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            //#region events
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this._onDidModelChange = this._register(new event_1.Emitter());
            this.onDidModelChange = this._onDidModelChange.event;
            this._onDidActiveEditorChange = this._register(new event_1.Emitter());
            this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
            this._onDidOpenEditorFail = this._register(new event_1.Emitter());
            this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
            this._onWillCloseEditor = this._register(new event_1.Emitter());
            this.onWillCloseEditor = this._onWillCloseEditor.event;
            this._onDidCloseEditor = this._register(new event_1.Emitter());
            this.onDidCloseEditor = this._onDidCloseEditor.event;
            this._onWillMoveEditor = this._register(new event_1.Emitter());
            this.onWillMoveEditor = this._onWillMoveEditor.event;
            this._onWillOpenEditor = this._register(new event_1.Emitter());
            this.onWillOpenEditor = this._onWillOpenEditor.event;
            this.disposedEditorsWorker = this._register(new async_1.RunOnceWorker(editors => this.handleDisposedEditors(editors), 0));
            this.mapEditorToPendingConfirmation = new Map();
            this.containerToolBarMenuDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.whenRestoredPromise = new async_1.DeferredPromise();
            this.whenRestored = this.whenRestoredPromise.p;
            this._disposed = false;
            //#endregion
            //#region ISerializableView
            this.element = document.createElement('div');
            this._onDidChange = this._register(new event_1.Relay());
            this.onDidChange = this._onDidChange.event;
            if (from instanceof EditorGroupView_1) {
                this.model = this._register(from.model.clone());
            }
            else if ((0, editorGroupModel_1.isSerializedEditorGroupModel)(from)) {
                this.model = this._register(instantiationService.createInstance(editorGroupModel_1.EditorGroupModel, from));
            }
            else {
                this.model = this._register(instantiationService.createInstance(editorGroupModel_1.EditorGroupModel, undefined));
            }
            //#region create()
            {
                // Scoped context key service
                this.scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
                // Container
                this.element.classList.add('editor-group-container');
                // Container listeners
                this.registerContainerListeners();
                // Container toolbar
                this.createContainerToolbar();
                // Container context menu
                this.createContainerContextMenu();
                // Watermark & shortcuts
                this._register(this.instantiationService.createInstance(editorGroupWatermark_1.EditorGroupWatermark, this.element));
                // Progress bar
                this.progressBar = this._register(new progressbar_1.ProgressBar(this.element, defaultStyles_1.defaultProgressBarStyles));
                this.progressBar.hide();
                // Scoped instantiation service
                this.scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService], [progress_1.IEditorProgressService, this._register(new progressIndicator_1.EditorProgressIndicator(this.progressBar, this))]));
                // Context keys
                this.handleGroupContextKeys();
                // Title container
                this.titleContainer = document.createElement('div');
                this.titleContainer.classList.add('title');
                this.element.appendChild(this.titleContainer);
                // Title control
                this.titleControl = this._register(this.scopedInstantiationService.createInstance(editorTitleControl_1.EditorTitleControl, this.titleContainer, this.accessor, this));
                // Editor container
                this.editorContainer = document.createElement('div');
                this.editorContainer.classList.add('editor-container');
                this.element.appendChild(this.editorContainer);
                // Editor pane
                this.editorPane = this._register(this.scopedInstantiationService.createInstance(editorPanes_1.EditorPanes, this.element, this.editorContainer, this));
                this._onDidChange.input = this.editorPane.onDidChangeSizeConstraints;
                // Track Focus
                this.doTrackFocus();
                // Update containers
                this.updateTitleContainer();
                this.updateContainer();
                // Update styles
                this.updateStyles();
            }
            //#endregion
            // Restore editors if provided
            const restoreEditorsPromise = this.restoreEditors(from) ?? Promise.resolve();
            // Signal restored once editors have restored
            restoreEditorsPromise.finally(() => {
                this.whenRestoredPromise.complete();
            });
            // Register Listeners
            this.registerListeners();
        }
        handleGroupContextKeys() {
            const groupActiveEditorDirtyContext = contextkeys_1.ActiveEditorDirtyContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorPinnedContext = contextkeys_1.ActiveEditorPinnedContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorFirstContext = contextkeys_1.ActiveEditorFirstInGroupContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorLastContext = contextkeys_1.ActiveEditorLastInGroupContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorStickyContext = contextkeys_1.ActiveEditorStickyContext.bindTo(this.scopedContextKeyService);
            const groupEditorsCountContext = contextkeys_1.EditorGroupEditorsCountContext.bindTo(this.scopedContextKeyService);
            const groupLockedContext = contextkeys_1.ActiveEditorGroupLockedContext.bindTo(this.scopedContextKeyService);
            const activeEditorListener = this._register(new lifecycle_1.MutableDisposable());
            const observeActiveEditor = () => {
                activeEditorListener.clear();
                const activeEditor = this.model.activeEditor;
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
            this._register(this.onDidModelChange(e => {
                switch (e.kind) {
                    case 2 /* GroupModelChangeKind.GROUP_LOCKED */:
                        groupLockedContext.set(this.isLocked);
                        break;
                    case 6 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                    case 4 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    case 3 /* GroupModelChangeKind.EDITOR_OPEN */:
                    case 5 /* GroupModelChangeKind.EDITOR_MOVE */:
                        groupActiveEditorFirstContext.set(this.model.isFirst(this.model.activeEditor));
                        groupActiveEditorLastContext.set(this.model.isLast(this.model.activeEditor));
                        break;
                    case 9 /* GroupModelChangeKind.EDITOR_PIN */:
                        if (e.editor && e.editor === this.model.activeEditor) {
                            groupActiveEditorPinnedContext.set(this.model.isPinned(this.model.activeEditor));
                        }
                        break;
                    case 10 /* GroupModelChangeKind.EDITOR_STICKY */:
                        if (e.editor && e.editor === this.model.activeEditor) {
                            groupActiveEditorStickyContext.set(this.model.isSticky(this.model.activeEditor));
                        }
                        break;
                }
                // Group editors count context
                groupEditorsCountContext.set(this.count);
            }));
            // Track the active editor and update context key that reflects
            // the dirty state of this editor
            this._register(this.onDidActiveEditorChange(() => {
                observeActiveEditor();
            }));
            observeActiveEditor();
        }
        registerContainerListeners() {
            // Open new file via doubleclick on empty container
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.DBLCLICK, e => {
                if (this.isEmpty) {
                    dom_1.EventHelper.stop(e);
                    this.editorService.openEditor({
                        resource: undefined,
                        options: {
                            pinned: true,
                            override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id
                        }
                    }, this.id);
                }
            }));
            // Close empty editor group via middle mouse click
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.AUXCLICK, e => {
                if (this.isEmpty && e.button === 1 /* Middle Button */) {
                    dom_1.EventHelper.stop(e, true);
                    this.accessor.removeGroup(this);
                }
            }));
        }
        createContainerToolbar() {
            // Toolbar Container
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('editor-group-container-toolbar');
            this.element.appendChild(toolbarContainer);
            // Toolbar
            const containerToolbar = this._register(new actionbar_1.ActionBar(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)('ariaLabelGroupActions', "Empty editor group actions")
            }));
            // Toolbar actions
            const containerToolbarMenu = this._register(this.menuService.createMenu(actions_1.MenuId.EmptyEditorGroup, this.scopedContextKeyService));
            const updateContainerToolbar = () => {
                const actions = { primary: [], secondary: [] };
                // Clear old actions
                this.containerToolBarMenuDisposable.value = (0, lifecycle_1.toDisposable)(() => containerToolbar.clear());
                // Create new actions
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(containerToolbarMenu, { arg: { groupId: this.id }, shouldForwardArgs: true }, actions, 'navigation');
                for (const action of [...actions.primary, ...actions.secondary]) {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    containerToolbar.push(action, { icon: true, label: false, keybinding: keybinding?.getLabel() });
                }
            };
            updateContainerToolbar();
            this._register(containerToolbarMenu.onDidChange(updateContainerToolbar));
        }
        createContainerContextMenu() {
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.CONTEXT_MENU, e => this.onShowContainerContextMenu(e)));
            this._register((0, dom_1.addDisposableListener)(this.element, touch_1.EventType.Contextmenu, () => this.onShowContainerContextMenu()));
        }
        onShowContainerContextMenu(e) {
            if (!this.isEmpty) {
                return; // only for empty editor groups
            }
            // Find target anchor
            let anchor = this.element;
            if (e instanceof MouseEvent) {
                anchor = new mouseEvent_1.StandardMouseEvent(e);
            }
            // Show it
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.EmptyEditorGroupContext,
                contextKeyService: this.contextKeyService,
                getAnchor: () => anchor,
                onHide: () => {
                    this.focus();
                }
            });
        }
        doTrackFocus() {
            // Container
            const containerFocusTracker = this._register((0, dom_1.trackFocus)(this.element));
            this._register(containerFocusTracker.onDidFocus(() => {
                if (this.isEmpty) {
                    this._onDidFocus.fire(); // only when empty to prevent accident focus
                }
            }));
            // Title Container
            const handleTitleClickOrTouch = (e) => {
                let target;
                if (e instanceof MouseEvent) {
                    if (e.button !== 0 /* middle/right mouse button */ || (platform_1.isMacintosh && e.ctrlKey /* macOS context menu */)) {
                        return undefined;
                    }
                    target = e.target;
                }
                else {
                    target = e.initialTarget;
                }
                if ((0, dom_1.findParentWithClass)(target, 'monaco-action-bar', this.titleContainer) ||
                    (0, dom_1.findParentWithClass)(target, 'monaco-breadcrumb-item', this.titleContainer)) {
                    return; // not when clicking on actions or breadcrumbs
                }
                // timeout to keep focus in editor after mouse up
                setTimeout(() => {
                    this.focus();
                });
            };
            this._register((0, dom_1.addDisposableListener)(this.titleContainer, dom_1.EventType.MOUSE_DOWN, e => handleTitleClickOrTouch(e)));
            this._register((0, dom_1.addDisposableListener)(this.titleContainer, touch_1.EventType.Tap, e => handleTitleClickOrTouch(e)));
            // Editor pane
            this._register(this.editorPane.onDidFocus(() => {
                this._onDidFocus.fire();
            }));
        }
        updateContainer() {
            // Empty Container: add some empty container attributes
            if (this.isEmpty) {
                this.element.classList.add('empty');
                this.element.tabIndex = 0;
                this.element.setAttribute('aria-label', (0, nls_1.localize)('emptyEditorGroup', "{0} (empty)", this.label));
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
        updateTitleContainer() {
            this.titleContainer.classList.toggle('tabs', this.accessor.partOptions.showTabs);
            this.titleContainer.classList.toggle('show-file-icons', this.accessor.partOptions.showIcons);
        }
        restoreEditors(from) {
            if (this.count === 0) {
                return; // nothing to show
            }
            // Determine editor options
            let options;
            if (from instanceof EditorGroupView_1) {
                options = (0, editor_2.fillActiveEditorViewState)(from); // if we copy from another group, ensure to copy its active editor viewstate
            }
            else {
                options = Object.create(null);
            }
            const activeEditor = this.model.activeEditor;
            if (!activeEditor) {
                return;
            }
            options.pinned = this.model.isPinned(activeEditor); // preserve pinned state
            options.sticky = this.model.isSticky(activeEditor); // preserve sticky state
            options.preserveFocus = true; // handle focus after editor is opened
            const activeElement = document.activeElement;
            // Show active editor (intentionally not using async to keep
            // `restoreEditors` from executing in same stack)
            return this.doShowEditor(activeEditor, { active: true, isNew: false /* restored */ }, options).then(() => {
                // Set focused now if this is the active group and focus has
                // not changed meanwhile. This prevents focus from being
                // stolen accidentally on startup when the user already
                // clicked somewhere.
                if (this.accessor.activeGroup === this && activeElement === document.activeElement) {
                    this.focus();
                }
            });
        }
        //#region event handling
        registerListeners() {
            // Model Events
            this._register(this.model.onDidModelChange(e => this.onDidGroupModelChange(e)));
            // Option Changes
            this._register(this.accessor.onDidChangeEditorPartOptions(e => this.onDidChangeEditorPartOptions(e)));
            // Visibility
            this._register(this.accessor.onDidVisibilityChange(e => this.onDidVisibilityChange(e)));
        }
        onDidGroupModelChange(e) {
            // Re-emit to outside
            this._onDidModelChange.fire(e);
            // Handle within
            if (!e.editor) {
                return;
            }
            switch (e.kind) {
                case 3 /* GroupModelChangeKind.EDITOR_OPEN */:
                    if ((0, editorGroupModel_1.isGroupEditorOpenEvent)(e)) {
                        this.onDidOpenEditor(e.editor, e.editorIndex);
                    }
                    break;
                case 4 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    if ((0, editorGroupModel_1.isGroupEditorCloseEvent)(e)) {
                        this.handleOnDidCloseEditor(e.editor, e.editorIndex, e.context, e.sticky);
                    }
                    break;
                case 12 /* GroupModelChangeKind.EDITOR_WILL_DISPOSE */:
                    this.onWillDisposeEditor(e.editor);
                    break;
                case 11 /* GroupModelChangeKind.EDITOR_DIRTY */:
                    this.onDidChangeEditorDirty(e.editor);
                    break;
                case 7 /* GroupModelChangeKind.EDITOR_LABEL */:
                    this.onDidChangeEditorLabel(e.editor);
                    break;
            }
        }
        onDidOpenEditor(editor, editorIndex) {
            /* __GDPR__
                "editorOpened" : {
                    "owner": "bpasero",
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.telemetryService.publicLog('editorOpened', this.toEditorTelemetryDescriptor(editor));
            // Update container
            this.updateContainer();
        }
        handleOnDidCloseEditor(editor, editorIndex, context, sticky) {
            // Before close
            this._onWillCloseEditor.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
            // Handle event
            const editorsToClose = [editor];
            // Include both sides of side by side editors when being closed
            if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                editorsToClose.push(editor.primary, editor.secondary);
            }
            // For each editor to close, we call dispose() to free up any resources.
            // However, certain editors might be shared across multiple editor groups
            // (including being visible in side by side / diff editors) and as such we
            // only dispose when they are not opened elsewhere.
            for (const editor of editorsToClose) {
                if (this.canDispose(editor)) {
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
            this.telemetryService.publicLog('editorClosed', this.toEditorTelemetryDescriptor(editor));
            // Update container
            this.updateContainer();
            // Event
            this._onDidCloseEditor.fire({ groupId: this.id, editor, context, index: editorIndex, sticky });
        }
        canDispose(editor) {
            for (const groupView of this.accessor.groups) {
                if (groupView instanceof EditorGroupView_1 && groupView.model.contains(editor, {
                    strictEquals: true,
                    supportSideBySide: editor_1.SideBySideEditor.ANY // include any side of an opened side by side editor
                })) {
                    return false;
                }
            }
            return true;
        }
        toEditorTelemetryDescriptor(editor) {
            const descriptor = editor.getTelemetryDescriptor();
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor);
            const path = resource ? resource.scheme === network_1.Schemas.file ? resource.fsPath : resource.path : undefined;
            if (resource && path) {
                let resourceExt = (0, resources_1.extname)(resource);
                // Remove query parameters from the resource extension
                const queryStringLocation = resourceExt.indexOf('?');
                resourceExt = queryStringLocation !== -1 ? resourceExt.substr(0, queryStringLocation) : resourceExt;
                descriptor['resource'] = { mimeType: new telemetryUtils_1.TelemetryTrustedValue((0, languagesAssociations_1.getMimeTypes)(resource).join(', ')), scheme: resource.scheme, ext: resourceExt, path: (0, hash_1.hash)(path) };
                /* __GDPR__FRAGMENT__
                    "EditorTelemetryDescriptor" : {
                        "resource": { "${inline}": [ "${URIDescriptor}" ] }
                    }
                */
                return descriptor;
            }
            return descriptor;
        }
        onWillDisposeEditor(editor) {
            // To prevent race conditions, we handle disposed editors in our worker with a timeout
            // because it can happen that an input is being disposed with the intent to replace
            // it with some other input right after.
            this.disposedEditorsWorker.work(editor);
        }
        handleDisposedEditors(disposedEditors) {
            // Split between visible and hidden editors
            let activeEditor;
            const inactiveEditors = [];
            for (const disposedEditor of disposedEditors) {
                const editorFindResult = this.model.findEditor(disposedEditor);
                if (!editorFindResult) {
                    continue; // not part of the model anymore
                }
                const editor = editorFindResult[0];
                if (!editor.isDisposed()) {
                    continue; // editor got reopened meanwhile
                }
                if (this.model.isActive(editor)) {
                    activeEditor = editor;
                }
                else {
                    inactiveEditors.push(editor);
                }
            }
            // Close all inactive editors first to prevent UI flicker
            for (const inactiveEditor of inactiveEditors) {
                this.doCloseEditor(inactiveEditor, false);
            }
            // Close active one last
            if (activeEditor) {
                this.doCloseEditor(activeEditor, false);
            }
        }
        onDidChangeEditorPartOptions(event) {
            // Title container
            this.updateTitleContainer();
            // Title control
            this.titleControl.updateOptions(event.oldPartOptions, event.newPartOptions);
            // Title control Switch between showing tabs <=> not showing tabs
            if (event.oldPartOptions.showTabs !== event.newPartOptions.showTabs) {
                // Re-layout
                this.relayout();
                // Ensure to show active editor if any
                if (this.model.activeEditor) {
                    this.titleControl.openEditor(this.model.activeEditor);
                }
            }
            // Styles
            this.updateStyles();
            // Pin preview editor once user disables preview
            if (event.oldPartOptions.enablePreview && !event.newPartOptions.enablePreview) {
                if (this.model.previewEditor) {
                    this.pinEditor(this.model.previewEditor);
                }
            }
        }
        onDidChangeEditorDirty(editor) {
            // Always show dirty editors pinned
            this.pinEditor(editor);
            // Forward to title control
            this.titleControl.updateEditorDirty(editor);
        }
        onDidChangeEditorLabel(editor) {
            // Forward to title control
            this.titleControl.updateEditorLabel(editor);
        }
        onDidVisibilityChange(visible) {
            // Forward to active editor pane
            this.editorPane.setVisible(visible);
        }
        //#endregion
        //#region IEditorGroupView
        get index() {
            return this._index;
        }
        get label() {
            return (0, nls_1.localize)('groupLabel', "Group {0}", this._index + 1);
        }
        get ariaLabel() {
            return (0, nls_1.localize)('groupAriaLabel', "Editor Group {0}", this._index + 1);
        }
        get disposed() {
            return this._disposed;
        }
        get isEmpty() {
            return this.count === 0;
        }
        get titleHeight() {
            return this.titleControl.getHeight();
        }
        notifyIndexChanged(newIndex) {
            if (this._index !== newIndex) {
                this._index = newIndex;
                this.model.setIndex(newIndex);
            }
        }
        setActive(isActive) {
            this.active = isActive;
            // Update container
            this.element.classList.toggle('active', isActive);
            this.element.classList.toggle('inactive', !isActive);
            // Update title control
            this.titleControl.setActive(isActive);
            // Update styles
            this.updateStyles();
            // Update model
            this.model.setActive(undefined /* entire group got active */);
        }
        //#endregion
        //#region IEditorGroup
        //#region basics()
        get id() {
            return this.model.id;
        }
        get editors() {
            return this.model.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        }
        get count() {
            return this.model.count;
        }
        get stickyCount() {
            return this.model.stickyCount;
        }
        get activeEditorPane() {
            return this.editorPane ? this.editorPane.activeEditorPane ?? undefined : undefined;
        }
        get activeEditor() {
            return this.model.activeEditor;
        }
        get previewEditor() {
            return this.model.previewEditor;
        }
        isPinned(editorOrIndex) {
            return this.model.isPinned(editorOrIndex);
        }
        isSticky(editorOrIndex) {
            return this.model.isSticky(editorOrIndex);
        }
        isActive(editor) {
            return this.model.isActive(editor);
        }
        contains(candidate, options) {
            return this.model.contains(candidate, options);
        }
        getEditors(order, options) {
            return this.model.getEditors(order, options);
        }
        findEditors(resource, options) {
            const canonicalResource = this.uriIdentityService.asCanonicalUri(resource);
            return this.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(editor => {
                if (editor.resource && (0, resources_1.isEqual)(editor.resource, canonicalResource)) {
                    return true;
                }
                // Support side by side editor primary side if specified
                if (options?.supportSideBySide === editor_1.SideBySideEditor.PRIMARY || options?.supportSideBySide === editor_1.SideBySideEditor.ANY) {
                    const primaryResource = editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    if (primaryResource && (0, resources_1.isEqual)(primaryResource, canonicalResource)) {
                        return true;
                    }
                }
                // Support side by side editor secondary side if specified
                if (options?.supportSideBySide === editor_1.SideBySideEditor.SECONDARY || options?.supportSideBySide === editor_1.SideBySideEditor.ANY) {
                    const secondaryResource = editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                    if (secondaryResource && (0, resources_1.isEqual)(secondaryResource, canonicalResource)) {
                        return true;
                    }
                }
                return false;
            });
        }
        getEditorByIndex(index) {
            return this.model.getEditorByIndex(index);
        }
        getIndexOfEditor(editor) {
            return this.model.indexOf(editor);
        }
        isFirst(editor) {
            return this.model.isFirst(editor);
        }
        isLast(editor) {
            return this.model.isLast(editor);
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
            this._onDidFocus.fire();
        }
        pinEditor(candidate = this.activeEditor || undefined) {
            if (candidate && !this.model.isPinned(candidate)) {
                // Update model
                const editor = this.model.pin(candidate);
                // Forward to title control
                if (editor) {
                    this.titleControl.pinEditor(editor);
                }
            }
        }
        stickEditor(candidate = this.activeEditor || undefined) {
            this.doStickEditor(candidate, true);
        }
        unstickEditor(candidate = this.activeEditor || undefined) {
            this.doStickEditor(candidate, false);
        }
        doStickEditor(candidate, sticky) {
            if (candidate && this.model.isSticky(candidate) !== sticky) {
                const oldIndexOfEditor = this.getIndexOfEditor(candidate);
                // Update model
                const editor = sticky ? this.model.stick(candidate) : this.model.unstick(candidate);
                if (!editor) {
                    return;
                }
                // If the index of the editor changed, we need to forward this to
                // title control and also make sure to emit this as an event
                const newIndexOfEditor = this.getIndexOfEditor(editor);
                if (newIndexOfEditor !== oldIndexOfEditor) {
                    this.titleControl.moveEditor(editor, oldIndexOfEditor, newIndexOfEditor);
                }
                // Forward sticky state to title control
                if (sticky) {
                    this.titleControl.stickEditor(editor);
                }
                else {
                    this.titleControl.unstickEditor(editor);
                }
            }
        }
        //#endregion
        //#region openEditor()
        async openEditor(editor, options) {
            return this.doOpenEditor(editor, options, {
                // Allow to match on a side-by-side editor when same
                // editor is opened on both sides. In that case we
                // do not want to open a new editor but reuse that one.
                supportSideBySide: editor_1.SideBySideEditor.BOTH
            });
        }
        async doOpenEditor(editor, options, internalOptions) {
            // Guard against invalid editors. Disposed editors
            // should never open because they emit no events
            // e.g. to indicate dirty changes.
            if (!editor || editor.isDisposed()) {
                return;
            }
            // Fire the event letting everyone know we are about to open an editor
            this._onWillOpenEditor.fire({ editor, groupId: this.id });
            // Determine options
            const pinned = options?.sticky
                || !this.accessor.partOptions.enablePreview
                || editor.isDirty()
                || (options?.pinned ?? typeof options?.index === 'number' /* unless specified, prefer to pin when opening with index */)
                || (typeof options?.index === 'number' && this.model.isSticky(options.index))
                || editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */);
            const openEditorOptions = {
                index: options ? options.index : undefined,
                pinned,
                sticky: options?.sticky || (typeof options?.index === 'number' && this.model.isSticky(options.index)),
                active: this.count === 0 || !options || !options.inactive,
                supportSideBySide: internalOptions?.supportSideBySide
            };
            if (options?.sticky && typeof options?.index === 'number' && !this.model.isSticky(options.index)) {
                // Special case: we are to open an editor sticky but at an index that is not sticky
                // In that case we prefer to open the editor at the index but not sticky. This enables
                // to drag a sticky editor to an index that is not sticky to unstick it.
                openEditorOptions.sticky = false;
            }
            if (!openEditorOptions.active && !openEditorOptions.pinned && this.model.activeEditor && !this.model.isPinned(this.model.activeEditor)) {
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
                const indexOfEditor = this.model.indexOf(editor);
                if (indexOfEditor !== -1 && indexOfEditor !== openEditorOptions.index) {
                    this.doMoveEditorInsideGroup(editor, openEditorOptions);
                }
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const { editor: openedEditor, isNew } = this.model.openEditor(editor, openEditorOptions);
            // Conditionally lock the group
            if (isNew && // only if this editor was new for the group
                this.count === 1 && // only when this editor was the first editor in the group
                this.accessor.groups.length > 1 // only when there are more than one groups open
            ) {
                // only when the editor identifier is configured as such
                if (openedEditor.editorId && this.accessor.partOptions.autoLockGroups?.has(openedEditor.editorId)) {
                    this.lock(true);
                }
            }
            // Show editor
            const showEditorResult = this.doShowEditor(openedEditor, { active: !!openEditorOptions.active, isNew }, options, internalOptions);
            // Finally make sure the group is active or restored as instructed
            if (activateGroup) {
                this.accessor.activateGroup(this);
            }
            else if (restoreGroup) {
                this.accessor.restoreGroup(this);
            }
            return showEditorResult;
        }
        doShowEditor(editor, context, options, internalOptions) {
            // Show in editor control if the active editor changed
            let openEditorPromise;
            if (context.active) {
                openEditorPromise = (async () => {
                    const { pane, changed, cancelled, error } = await this.editorPane.openEditor(editor, options, { newInGroup: context.isNew });
                    // Return early if the operation was cancelled by another operation
                    if (cancelled) {
                        return undefined;
                    }
                    // Editor change event
                    if (changed) {
                        this._onDidActiveEditorChange.fire({ editor });
                    }
                    // Indicate error as an event but do not bubble them up
                    if (error) {
                        this._onDidOpenEditorFail.fire(editor);
                    }
                    // Without an editor pane, recover by closing the active editor
                    // (if the input is still the active one)
                    if (!pane && this.activeEditor === editor) {
                        const focusNext = !options || !options.preserveFocus;
                        this.doCloseEditor(editor, focusNext, { fromError: true });
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
                this.titleControl.openEditor(editor);
            }
            return openEditorPromise;
        }
        //#endregion
        //#region openEditors()
        async openEditors(editors) {
            // Guard against invalid editors. Disposed editors
            // should never open because they emit no events
            // e.g. to indicate dirty changes.
            const editorsToOpen = (0, arrays_1.coalesce)(editors).filter(({ editor }) => !editor.isDisposed());
            // Use the first editor as active editor
            const firstEditor = (0, arrays_1.firstOrDefault)(editorsToOpen);
            if (!firstEditor) {
                return;
            }
            const openEditorsOptions = {
                // Allow to match on a side-by-side editor when same
                // editor is opened on both sides. In that case we
                // do not want to open a new editor but reuse that one.
                supportSideBySide: editor_1.SideBySideEditor.BOTH
            };
            await this.doOpenEditor(firstEditor.editor, firstEditor.options, openEditorsOptions);
            // Open the other ones inactive
            const inactiveEditors = editorsToOpen.slice(1);
            const startingIndex = this.getIndexOfEditor(firstEditor.editor) + 1;
            await async_1.Promises.settled(inactiveEditors.map(({ editor, options }, index) => {
                return this.doOpenEditor(editor, {
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
            this.titleControl.openEditors(inactiveEditors.map(({ editor }) => editor));
            // Opening many editors at once can put any editor to be
            // the active one depending on options. As such, we simply
            // return the active editor pane after this operation.
            return this.editorPane.activeEditorPane ?? undefined;
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
                target.titleControl.openEditors(movedEditors);
                this.titleControl.closeEditors(movedEditors);
            }
        }
        moveEditor(editor, target, options, internalOptions) {
            // Move within same group
            if (this === target) {
                this.doMoveEditorInsideGroup(editor, options);
            }
            // Move across groups
            else {
                this.doMoveOrCopyEditorAcrossGroups(editor, target, options, { ...internalOptions, keepCopy: false });
            }
        }
        doMoveEditorInsideGroup(candidate, options) {
            const moveToIndex = options ? options.index : undefined;
            if (typeof moveToIndex !== 'number') {
                return; // do nothing if we move into same group without index
            }
            const currentIndex = this.model.indexOf(candidate);
            if (currentIndex === -1 || currentIndex === moveToIndex) {
                return; // do nothing if editor unknown in model or is already at the given index
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const editor = this.model.getEditorByIndex(currentIndex);
            if (!editor) {
                return;
            }
            // Update model
            this.model.moveEditor(editor, moveToIndex);
            this.model.pin(editor);
            // Forward to title control
            this.titleControl.moveEditor(editor, currentIndex, moveToIndex);
            this.titleControl.pinEditor(editor);
        }
        doMoveOrCopyEditorAcrossGroups(editor, target, openOptions, internalOptions) {
            const keepCopy = internalOptions?.keepCopy;
            // When moving/copying an editor, try to preserve as much view state as possible
            // by checking for the editor to be a text editor and creating the options accordingly
            // if so
            const options = (0, editor_2.fillActiveEditorViewState)(this, editor, {
                ...openOptions,
                pinned: true,
                sticky: !keepCopy && this.model.isSticky(editor) // preserve sticky state only if editor is moved (https://github.com/microsoft/vscode/issues/99035)
            });
            // Indicate will move event
            if (!keepCopy) {
                this._onWillMoveEditor.fire({
                    groupId: this.id,
                    editor,
                    target: target.id
                });
            }
            // A move to another group is an open first...
            target.doOpenEditor(keepCopy ? editor.copy() : editor, options, internalOptions);
            // ...and a close afterwards (unless we copy)
            if (!keepCopy) {
                this.doCloseEditor(editor, false /* do not focus next one behind if any */, { ...internalOptions, context: editor_1.EditorCloseContext.MOVE });
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
                target.titleControl.openEditors(copiedEditors);
            }
        }
        copyEditor(editor, target, options, internalOptions) {
            // Move within same group because we do not support to show the same editor
            // multiple times in the same group
            if (this === target) {
                this.doMoveEditorInsideGroup(editor, options);
            }
            // Copy across groups
            else {
                this.doMoveOrCopyEditorAcrossGroups(editor, target, options, { ...internalOptions, keepCopy: true });
            }
        }
        //#endregion
        //#region closeEditor()
        async closeEditor(editor = this.activeEditor || undefined, options) {
            return this.doCloseEditorWithConfirmationHandling(editor, options);
        }
        async doCloseEditorWithConfirmationHandling(editor = this.activeEditor || undefined, options, internalOptions) {
            if (!editor) {
                return false;
            }
            // Check for confirmation and veto
            const veto = await this.handleCloseConfirmation([editor]);
            if (veto) {
                return false;
            }
            // Do close
            this.doCloseEditor(editor, options?.preserveFocus ? false : undefined, internalOptions);
            return true;
        }
        doCloseEditor(editor, focusNext = (this.accessor.activeGroup === this), internalOptions) {
            // Forward to title control unless skipped via internal options
            if (!internalOptions?.skipTitleUpdate) {
                this.titleControl.beforeCloseEditor(editor);
            }
            // Closing the active editor of the group is a bit more work
            if (this.model.isActive(editor)) {
                this.doCloseActiveEditor(focusNext, internalOptions);
            }
            // Closing inactive editor is just a model update
            else {
                this.doCloseInactiveEditor(editor, internalOptions);
            }
            // Forward to title control unless skipped via internal options
            if (!internalOptions?.skipTitleUpdate) {
                this.titleControl.closeEditor(editor);
            }
        }
        doCloseActiveEditor(focusNext = (this.accessor.activeGroup === this), internalOptions) {
            const editorToClose = this.activeEditor;
            const restoreFocus = this.shouldRestoreFocus(this.element);
            // Optimization: if we are about to close the last editor in this group and settings
            // are configured to close the group since it will be empty, we first set the last
            // active group as empty before closing the editor. This reduces the amount of editor
            // change events that this operation emits and will reduce flicker. Without this
            // optimization, this group (if active) would first trigger a active editor change
            // event because it became empty, only to then trigger another one when the next
            // group gets active.
            const closeEmptyGroup = this.accessor.partOptions.closeEmptyGroups;
            if (closeEmptyGroup && this.active && this.count === 1) {
                const mostRecentlyActiveGroups = this.accessor.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
                const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current one, so take [1]
                if (nextActiveGroup) {
                    if (restoreFocus) {
                        nextActiveGroup.focus();
                    }
                    else {
                        this.accessor.activateGroup(nextActiveGroup);
                    }
                }
            }
            // Update model
            if (editorToClose) {
                this.model.closeEditor(editorToClose, internalOptions?.context);
            }
            // Open next active if there are more to show
            const nextActiveEditor = this.model.activeEditor;
            if (nextActiveEditor) {
                const preserveFocus = !focusNext;
                let activation = undefined;
                if (preserveFocus && this.accessor.activeGroup !== this) {
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
                this.doOpenEditor(nextActiveEditor, options);
            }
            // Otherwise we are empty, so clear from editor control and send event
            else {
                // Forward to editor pane
                if (editorToClose) {
                    this.editorPane.closeEditor(editorToClose);
                }
                // Restore focus to group container as needed unless group gets closed
                if (restoreFocus && !closeEmptyGroup) {
                    this.focus();
                }
                // Events
                this._onDidActiveEditorChange.fire({ editor: undefined });
                // Remove empty group if we should
                if (closeEmptyGroup) {
                    this.accessor.removeGroup(this);
                }
            }
        }
        shouldRestoreFocus(target) {
            const activeElement = document.activeElement;
            if (activeElement === document.body) {
                return true; // always restore focus if nothing is focused currently
            }
            // otherwise check for the active element being an ancestor of the target
            return (0, dom_1.isAncestor)(activeElement, target);
        }
        doCloseInactiveEditor(editor, internalOptions) {
            // Update model
            this.model.closeEditor(editor, internalOptions?.context);
        }
        async handleCloseConfirmation(editors) {
            if (!editors.length) {
                return false; // no veto
            }
            const editor = editors.shift();
            // To prevent multiple confirmation dialogs from showing up one after the other
            // we check if a pending confirmation is currently showing and if so, join that
            let handleCloseConfirmationPromise = this.mapEditorToPendingConfirmation.get(editor);
            if (!handleCloseConfirmationPromise) {
                handleCloseConfirmationPromise = this.doHandleCloseConfirmation(editor);
                this.mapEditorToPendingConfirmation.set(editor, handleCloseConfirmationPromise);
            }
            let veto;
            try {
                veto = await handleCloseConfirmationPromise;
            }
            finally {
                this.mapEditorToPendingConfirmation.delete(editor);
            }
            // Return for the first veto we got
            if (veto) {
                return veto;
            }
            // Otherwise continue with the remainders
            return this.handleCloseConfirmation(editors);
        }
        async doHandleCloseConfirmation(editor, options) {
            if (!this.shouldConfirmClose(editor)) {
                return false; // no veto
            }
            if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && this.model.contains(editor.primary)) {
                return false; // primary-side of editor is still opened somewhere else
            }
            // Note: we explicitly decide to ask for confirm if closing a normal editor even
            // if it is opened in a side-by-side editor in the group. This decision is made
            // because it may be less obvious that one side of a side by side editor is dirty
            // and can still be changed.
            // The only exception is when the same editor is opened on both sides of a side
            // by side editor (https://github.com/microsoft/vscode/issues/138442)
            if (this.accessor.groups.some(groupView => {
                if (groupView === this) {
                    return false; // skip (we already handled our group above)
                }
                const otherGroup = groupView;
                if (otherGroup.contains(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH })) {
                    return true; // exact editor still opened (either single, or split-in-group)
                }
                if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && otherGroup.contains(editor.primary)) {
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
                if (this.filesConfigurationService.getAutoSaveMode() === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */) {
                    autoSave = true;
                    confirmation = 0 /* ConfirmResult.SAVE */;
                    saveReason = 3 /* SaveReason.FOCUS_CHANGE */;
                }
                // Auto-save on window change: save, because on Windows and Linux, a
                // native dialog triggers the window focus change
                // (see https://github.com/microsoft/vscode/issues/134250)
                else if ((platform_1.isNative && (platform_1.isWindows || platform_1.isLinux)) && this.filesConfigurationService.getAutoSaveMode() === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */) {
                    autoSave = true;
                    confirmation = 0 /* ConfirmResult.SAVE */;
                    saveReason = 4 /* SaveReason.WINDOW_CHANGE */;
                }
            }
            // No auto-save on focus change or custom confirmation handler: ask user
            if (!autoSave) {
                // Switch to editor that we want to handle for confirmation unless showing already
                if (!this.activeEditor || !this.activeEditor.matches(editor)) {
                    await this.doOpenEditor(editor);
                }
                // Let editor handle confirmation if implemented
                if (typeof editor.closeHandler?.confirm === 'function') {
                    confirmation = await editor.closeHandler.confirm([{ editor, groupId: this.id }]);
                }
                // Show a file specific confirmation
                else {
                    let name;
                    if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                        name = editor.primary.getName(); // prefer shorter names by using primary's name in this case
                    }
                    else {
                        name = editor.getName();
                    }
                    confirmation = await this.fileDialogService.showSaveConfirm([name]);
                }
            }
            // It could be that the editor's choice of confirmation has changed
            // given the check for confirmation is long running, so we check
            // again to see if anything needs to happen before closing for good.
            // This can happen for example if `autoSave: onFocusChange` is configured
            // so that the save happens when the dialog opens.
            // However, we only do this unless a custom confirm handler is installed
            // that may not be fit to be asked a second time right after.
            if (!editor.closeHandler && !this.shouldConfirmClose(editor)) {
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
                        return this.doHandleCloseConfirmation(editor, { skipAutoSave: true });
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
                        this.logService.error(error);
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
        shouldConfirmClose(editor) {
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
            const editors = this.doGetEditorsToClose(args);
            // Check for confirmation and veto
            const veto = await this.handleCloseConfirmation(editors.slice(0));
            if (veto) {
                return false;
            }
            // Do close
            this.doCloseEditors(editors, options);
            return true;
        }
        doGetEditorsToClose(args) {
            if (Array.isArray(args)) {
                return args;
            }
            const filter = args;
            const hasDirection = typeof filter.direction === 'number';
            let editorsToClose = this.model.getEditors(hasDirection ? 1 /* EditorsOrder.SEQUENTIAL */ : 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, filter); // in MRU order only if direction is not specified
            // Filter: saved or saving only
            if (filter.savedOnly) {
                editorsToClose = editorsToClose.filter(editor => !editor.isDirty() || editor.isSaving());
            }
            // Filter: direction (left / right)
            else if (hasDirection && filter.except) {
                editorsToClose = (filter.direction === 0 /* CloseDirection.LEFT */) ?
                    editorsToClose.slice(0, this.model.indexOf(filter.except, editorsToClose)) :
                    editorsToClose.slice(this.model.indexOf(filter.except, editorsToClose) + 1);
            }
            // Filter: except
            else if (filter.except) {
                editorsToClose = editorsToClose.filter(editor => filter.except && !editor.matches(filter.except));
            }
            return editorsToClose;
        }
        doCloseEditors(editors, options) {
            // Close all inactive editors first
            let closeActiveEditor = false;
            for (const editor of editors) {
                if (!this.isActive(editor)) {
                    this.doCloseInactiveEditor(editor);
                }
                else {
                    closeActiveEditor = true;
                }
            }
            // Close active editor last if contained in editors list to close
            if (closeActiveEditor) {
                this.doCloseActiveEditor(options?.preserveFocus ? false : undefined);
            }
            // Forward to title control
            if (editors.length) {
                this.titleControl.closeEditors(editors);
            }
        }
        //#endregion
        //#region closeAllEditors()
        async closeAllEditors(options) {
            if (this.isEmpty) {
                // If the group is empty and the request is to close all editors, we still close
                // the editor group is the related setting to close empty groups is enabled for
                // a convenient way of removing empty editor groups for the user.
                if (this.accessor.partOptions.closeEmptyGroups) {
                    this.accessor.removeGroup(this);
                }
                return true;
            }
            // Check for confirmation and veto
            const veto = await this.handleCloseConfirmation(this.model.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, options));
            if (veto) {
                return false;
            }
            // Do close
            this.doCloseAllEditors(options);
            return true;
        }
        doCloseAllEditors(options) {
            // Close all inactive editors first
            const editorsToClose = [];
            for (const editor of this.model.getEditors(1 /* EditorsOrder.SEQUENTIAL */, options)) {
                if (!this.isActive(editor)) {
                    this.doCloseInactiveEditor(editor);
                }
                editorsToClose.push(editor);
            }
            // Close active editor last (unless we skip it, e.g. because it is sticky)
            if (this.activeEditor && editorsToClose.includes(this.activeEditor)) {
                this.doCloseActiveEditor();
            }
            // Forward to title control
            if (editorsToClose.length) {
                this.titleControl.closeEditors(editorsToClose);
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
                await this.doOpenEditor(replacement, options);
                // Close replaced inactive editor unless they match
                if (!editor.matches(replacement)) {
                    let closed = false;
                    if (forceReplaceDirty) {
                        this.doCloseEditor(editor, false, { context: editor_1.EditorCloseContext.REPLACE });
                        closed = true;
                    }
                    else {
                        closed = await this.doCloseEditorWithConfirmationHandling(editor, { preserveFocus: true }, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                    if (!closed) {
                        return; // canceled
                    }
                }
            }
            // Handle active last
            if (activeReplacement) {
                // Open replacement as active editor
                const openEditorResult = this.doOpenEditor(activeReplacement.replacement, activeReplacement.options);
                // Close replaced active editor unless they match
                if (!activeReplacement.editor.matches(activeReplacement.replacement)) {
                    if (activeReplacement.forceReplaceDirty) {
                        this.doCloseEditor(activeReplacement.editor, false, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                    else {
                        await this.doCloseEditorWithConfirmationHandling(activeReplacement.editor, { preserveFocus: true }, { context: editor_1.EditorCloseContext.REPLACE });
                    }
                }
                await openEditorResult;
            }
        }
        //#endregion
        //#region Locking
        get isLocked() {
            if (this.accessor.groups.length === 1) {
                // Special case: if only 1 group is opened, never report it as locked
                // to ensure editors can always open in the "default" editor group
                return false;
            }
            return this.model.isLocked;
        }
        lock(locked) {
            if (this.accessor.groups.length === 1) {
                // Special case: if only 1 group is opened, never allow to lock
                // to ensure editors can always open in the "default" editor group
                locked = false;
            }
            this.model.lock(locked);
        }
        //#endregion
        //#region Themable
        updateStyles() {
            const isEmpty = this.isEmpty;
            // Container
            if (isEmpty) {
                this.element.style.backgroundColor = this.getColor(theme_1.EDITOR_GROUP_EMPTY_BACKGROUND) || '';
            }
            else {
                this.element.style.backgroundColor = '';
            }
            // Title control
            const borderColor = this.getColor(theme_1.EDITOR_GROUP_HEADER_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            if (!isEmpty && borderColor) {
                this.titleContainer.classList.add('title-border-bottom');
                this.titleContainer.style.setProperty('--title-border-bottom-color', borderColor);
            }
            else {
                this.titleContainer.classList.remove('title-border-bottom');
                this.titleContainer.style.removeProperty('--title-border-bottom-color');
            }
            const { showTabs } = this.accessor.partOptions;
            this.titleContainer.style.backgroundColor = this.getColor(showTabs ? theme_1.EDITOR_GROUP_HEADER_TABS_BACKGROUND : theme_1.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND) || '';
            // Editor container
            this.editorContainer.style.backgroundColor = this.getColor(colorRegistry_1.editorBackground) || '';
        }
        get minimumWidth() { return this.editorPane.minimumWidth; }
        get minimumHeight() { return this.editorPane.minimumHeight; }
        get maximumWidth() { return this.editorPane.maximumWidth; }
        get maximumHeight() { return this.editorPane.maximumHeight; }
        get proportionalLayout() {
            if (!this.lastLayout) {
                return true;
            }
            return !(this.lastLayout.width === this.minimumWidth || this.lastLayout.height === this.minimumHeight);
        }
        layout(width, height, top, left) {
            this.lastLayout = { width, height, top, left };
            this.element.classList.toggle('max-height-478px', height <= 478);
            // Layout the title control first to receive the size it occupies
            const titleControlSize = this.titleControl.layout({
                container: new dom_1.Dimension(width, height),
                available: new dom_1.Dimension(width, height - this.editorPane.minimumHeight)
            });
            // Pass the container width and remaining height to the editor layout
            const editorHeight = Math.max(0, height - titleControlSize.height);
            this.editorContainer.style.height = `${editorHeight}px`;
            this.editorPane.layout({ width, height: editorHeight, top: top + titleControlSize.height, left });
        }
        relayout() {
            if (this.lastLayout) {
                const { width, height, top, left } = this.lastLayout;
                this.layout(width, height, top, left);
            }
        }
        setBoundarySashes(sashes) {
            this.editorPane.setBoundarySashes(sashes);
        }
        toJSON() {
            return this.model.serialize();
        }
        //#endregion
        dispose() {
            this._disposed = true;
            this._onWillDispose.fire();
            super.dispose();
        }
    };
    exports.EditorGroupView = EditorGroupView;
    exports.EditorGroupView = EditorGroupView = EditorGroupView_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, themeService_1.IThemeService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, actions_1.IMenuService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, dialogs_1.IFileDialogService),
        __param(11, editorService_1.IEditorService),
        __param(12, filesConfigurationService_1.IFilesConfigurationService),
        __param(13, uriIdentity_1.IUriIdentityService),
        __param(14, log_1.ILogService)
    ], EditorGroupView);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvckdyb3VwVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUR6RixJQUFNLGVBQWUsdUJBQXJCLE1BQU0sZUFBZ0IsU0FBUSx1QkFBUTtRQUU1QyxpQkFBaUI7UUFFakIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUErQixFQUFFLEtBQWEsRUFBRSxvQkFBMkM7WUFDM0csT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUJBQWUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBdUMsRUFBRSxRQUErQixFQUFFLEtBQWEsRUFBRSxvQkFBMkM7WUFDL0osT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUJBQWUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFRCxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQTBCLEVBQUUsUUFBK0IsRUFBRSxLQUFhLEVBQUUsb0JBQTJDO1lBQ3hJLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFlLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBZ0VELFlBQ1MsUUFBK0IsRUFDdkMsSUFBMkQsRUFDbkQsTUFBYyxFQUNDLG9CQUE0RCxFQUMvRCxpQkFBc0QsRUFDM0QsWUFBMkIsRUFDdkIsZ0JBQW9ELEVBQ25ELGlCQUFzRCxFQUM1RCxXQUEwQyxFQUNuQyxrQkFBd0QsRUFDekQsaUJBQXNELEVBQzFELGFBQWlELEVBQ3JDLHlCQUFzRSxFQUM3RSxrQkFBd0QsRUFD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