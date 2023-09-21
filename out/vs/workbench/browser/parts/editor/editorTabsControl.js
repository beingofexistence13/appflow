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
define(["require", "exports", "vs/nls", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/dnd", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/base/common/types", "vs/base/browser/browser", "vs/base/common/errors", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/actions/browser/toolbar", "vs/platform/dnd/browser/dnd", "vs/workbench/services/editor/common/editorResolverService", "vs/css!./media/editortabscontrol"], function (require, exports, nls_1, dnd_1, dom_1, mouseEvent_1, actionbar_1, actions_1, lifecycle_1, menuEntryActionViewItem_1, actions_2, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, quickInput_1, colorRegistry_1, themeService_1, dnd_2, editorPane_1, editor_1, contextkeys_1, types_1, browser_1, errors_1, sideBySideEditorInput_1, toolbar_1, dnd_3, editorResolverService_1) {
    "use strict";
    var EditorTabsControl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorTabsControl = exports.EditorCommandsContextActionRunner = void 0;
    class EditorCommandsContextActionRunner extends actions_1.ActionRunner {
        constructor(context) {
            super();
            this.context = context;
        }
        run(action, context) {
            // Even though we have a fixed context for editor commands,
            // allow to preserve the context that is given to us in case
            // it applies.
            let mergedContext = this.context;
            if (context?.preserveFocus) {
                mergedContext = {
                    ...this.context,
                    preserveFocus: true
                };
            }
            return super.run(action, mergedContext);
        }
    }
    exports.EditorCommandsContextActionRunner = EditorCommandsContextActionRunner;
    let EditorTabsControl = class EditorTabsControl extends themeService_1.Themable {
        static { EditorTabsControl_1 = this; }
        static { this.EDITOR_TAB_HEIGHT = {
            normal: 35,
            compact: 22
        }; }
        constructor(parent, accessor, group, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, menuService, quickInputService, themeService, editorResolverService) {
            super(themeService);
            this.parent = parent;
            this.accessor = accessor;
            this.group = group;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.menuService = menuService;
            this.quickInputService = quickInputService;
            this.editorResolverService = editorResolverService;
            this.editorTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.groupTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.treeItemsTransfer = dnd_3.LocalSelectionTransfer.getInstance();
            this.editorToolBarMenuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.resourceContext = this._register(instantiationService.createInstance(contextkeys_1.ResourceContextKey));
            this.editorPinnedContext = contextkeys_1.ActiveEditorPinnedContext.bindTo(contextKeyService);
            this.editorIsFirstContext = contextkeys_1.ActiveEditorFirstInGroupContext.bindTo(contextKeyService);
            this.editorIsLastContext = contextkeys_1.ActiveEditorLastInGroupContext.bindTo(contextKeyService);
            this.editorStickyContext = contextkeys_1.ActiveEditorStickyContext.bindTo(contextKeyService);
            this.editorAvailableEditorIds = contextkeys_1.ActiveEditorAvailableEditorIdsContext.bindTo(this.contextKeyService);
            this.editorCanSplitInGroupContext = contextkeys_1.ActiveEditorCanSplitInGroupContext.bindTo(contextKeyService);
            this.sideBySideEditorContext = contextkeys_1.SideBySideEditorActiveContext.bindTo(contextKeyService);
            this.groupLockedContext = contextkeys_1.ActiveEditorGroupLockedContext.bindTo(contextKeyService);
            this.renderDropdownAsChildElement = false;
            this.create(parent);
        }
        create(parent) {
            this.updateTabHeight();
        }
        createEditorActionsToolBar(container) {
            const context = { groupId: this.group.id };
            // Toolbar Widget
            this.editorActionsToolbar = this._register(this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, container, {
                actionViewItemProvider: action => this.actionViewItemProvider(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                ariaLabel: (0, nls_1.localize)('ariaLabelEditorActions', "Editor actions"),
                getKeyBinding: action => this.getKeybinding(action),
                actionRunner: this._register(new EditorCommandsContextActionRunner(context)),
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                renderDropdownAsChildElement: this.renderDropdownAsChildElement,
                telemetrySource: 'editorPart',
                resetMenu: actions_2.MenuId.EditorTitle,
                maxNumberOfItems: 9,
                highlightToggledItems: true,
            }));
            // Context
            this.editorActionsToolbar.context = context;
            // Action Run Handling
            this._register(this.editorActionsToolbar.actionRunner.onDidRun(e => {
                // Notify for Error
                if (e.error && !(0, errors_1.isCancellationError)(e.error)) {
                    this.notificationService.error(e.error);
                }
            }));
        }
        actionViewItemProvider(action) {
            const activeEditorPane = this.group.activeEditorPane;
            // Check Active Editor
            if (activeEditorPane instanceof editorPane_1.EditorPane) {
                const result = activeEditorPane.getActionViewItem(action);
                if (result) {
                    return result;
                }
            }
            // Check extensions
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action, { menuAsChild: this.renderDropdownAsChildElement });
        }
        updateEditorActionsToolbar() {
            const { primary, secondary } = this.prepareEditorActions(this.getEditorActions());
            const editorActionsToolbar = (0, types_1.assertIsDefined)(this.editorActionsToolbar);
            editorActionsToolbar.setActions((0, actionbar_1.prepareActions)(primary), (0, actionbar_1.prepareActions)(secondary));
        }
        getEditorActions() {
            const primary = [];
            const secondary = [];
            // Dispose previous listeners
            this.editorToolBarMenuDisposables.clear();
            // Update contexts
            this.contextKeyService.bufferChangeEvents(() => {
                const activeEditor = this.group.activeEditor;
                this.resourceContext.set(editor_1.EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY } ?? null));
                this.editorPinnedContext.set(activeEditor ? this.group.isPinned(activeEditor) : false);
                this.editorIsFirstContext.set(activeEditor ? this.group.isFirst(activeEditor) : false);
                this.editorIsLastContext.set(activeEditor ? this.group.isLast(activeEditor) : false);
                this.editorStickyContext.set(activeEditor ? this.group.isSticky(activeEditor) : false);
                (0, contextkeys_1.applyAvailableEditorIds)(this.editorAvailableEditorIds, activeEditor, this.editorResolverService);
                this.editorCanSplitInGroupContext.set(activeEditor ? activeEditor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */) : false);
                this.sideBySideEditorContext.set(activeEditor?.typeId === sideBySideEditorInput_1.SideBySideEditorInput.ID);
                this.groupLockedContext.set(this.group.isLocked);
            });
            // Editor actions require the editor control to be there, so we retrieve it via service
            const activeEditorPane = this.group.activeEditorPane;
            if (activeEditorPane instanceof editorPane_1.EditorPane) {
                const scopedContextKeyService = this.getEditorPaneAwareContextKeyService();
                const titleBarMenu = this.menuService.createMenu(actions_2.MenuId.EditorTitle, scopedContextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: 0 });
                this.editorToolBarMenuDisposables.add(titleBarMenu);
                this.editorToolBarMenuDisposables.add(titleBarMenu.onDidChange(() => {
                    this.updateEditorActionsToolbar(); // Update editor toolbar whenever contributed actions change
                }));
                const shouldInlineGroup = (action, group) => group === 'navigation' && action.actions.length <= 1;
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(titleBarMenu, { arg: this.resourceContext.get(), shouldForwardArgs: true }, { primary, secondary }, 'navigation', shouldInlineGroup);
            }
            return { primary, secondary };
        }
        getEditorPaneAwareContextKeyService() {
            return this.group.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
        }
        clearEditorActionsToolbar() {
            this.editorActionsToolbar?.setActions([], []);
        }
        enableGroupDragging(element) {
            // Drag start
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.DRAG_START, e => {
                if (e.target !== element) {
                    return; // only if originating from tabs container
                }
                // Set editor group as transfer
                this.groupTransfer.setData([new dnd_2.DraggedEditorGroupIdentifier(this.group.id)], dnd_2.DraggedEditorGroupIdentifier.prototype);
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'copyMove';
                }
                // Drag all tabs of the group if tabs are enabled
                let hasDataTransfer = false;
                if (this.accessor.partOptions.showTabs) {
                    hasDataTransfer = this.doFillResourceDataTransfers(this.group.getEditors(1 /* EditorsOrder.SEQUENTIAL */), e);
                }
                // Otherwise only drag the active editor
                else {
                    if (this.group.activeEditor) {
                        hasDataTransfer = this.doFillResourceDataTransfers([this.group.activeEditor], e);
                    }
                }
                // Firefox: requires to set a text data transfer to get going
                if (!hasDataTransfer && browser_1.isFirefox) {
                    e.dataTransfer?.setData(dnd_1.DataTransfers.TEXT, String(this.group.label));
                }
                // Drag Image
                if (this.group.activeEditor) {
                    let label = this.group.activeEditor.getName();
                    if (this.accessor.partOptions.showTabs && this.group.count > 1) {
                        label = (0, nls_1.localize)('draggedEditorGroup', "{0} (+{1})", label, this.group.count - 1);
                    }
                    (0, dnd_1.applyDragImage)(e, label, 'monaco-editor-group-drag-image', this.getColor(colorRegistry_1.listActiveSelectionBackground), this.getColor(colorRegistry_1.listActiveSelectionForeground));
                }
            }));
            // Drag end
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.DRAG_END, () => {
                this.groupTransfer.clearData(dnd_2.DraggedEditorGroupIdentifier.prototype);
            }));
        }
        doFillResourceDataTransfers(editors, e) {
            if (editors.length) {
                this.instantiationService.invokeFunction(dnd_2.fillEditorsDragData, editors.map(editor => ({ editor, groupId: this.group.id })), e);
                return true;
            }
            return false;
        }
        onContextMenu(editor, e, node) {
            // Update contexts based on editor picked and remember previous to restore
            const currentResourceContext = this.resourceContext.get();
            this.resourceContext.set(editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY } ?? null));
            const currentPinnedContext = !!this.editorPinnedContext.get();
            this.editorPinnedContext.set(this.group.isPinned(editor));
            const currentEditorIsFirstContext = !!this.editorIsFirstContext.get();
            this.editorIsFirstContext.set(this.group.isFirst(editor));
            const currentEditorIsLastContext = !!this.editorIsLastContext.get();
            this.editorIsLastContext.set(this.group.isLast(editor));
            const currentStickyContext = !!this.editorStickyContext.get();
            this.editorStickyContext.set(this.group.isSticky(editor));
            const currentGroupLockedContext = !!this.groupLockedContext.get();
            this.groupLockedContext.set(this.group.isLocked);
            const currentEditorCanSplitContext = !!this.editorCanSplitInGroupContext.get();
            this.editorCanSplitInGroupContext.set(editor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
            const currentSideBySideEditorContext = !!this.sideBySideEditorContext.get();
            this.sideBySideEditorContext.set(editor.typeId === sideBySideEditorInput_1.SideBySideEditorInput.ID);
            const currentEditorAvailableEditorIds = this.editorAvailableEditorIds.get() ?? '';
            (0, contextkeys_1.applyAvailableEditorIds)(this.editorAvailableEditorIds, editor, this.editorResolverService);
            // Find target anchor
            let anchor = node;
            if (e instanceof MouseEvent) {
                anchor = new mouseEvent_1.StandardMouseEvent(e);
            }
            // Show it
            this.contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                menuId: actions_2.MenuId.EditorTitleContext,
                menuActionOptions: { shouldForwardArgs: true, arg: this.resourceContext.get() },
                contextKeyService: this.contextKeyService,
                getActionsContext: () => ({ groupId: this.group.id, editorIndex: this.group.getIndexOfEditor(editor) }),
                getKeyBinding: action => this.getKeybinding(action),
                onHide: () => {
                    // restore previous contexts
                    this.resourceContext.set(currentResourceContext || null);
                    this.editorPinnedContext.set(currentPinnedContext);
                    this.editorIsFirstContext.set(currentEditorIsFirstContext);
                    this.editorIsLastContext.set(currentEditorIsLastContext);
                    this.editorStickyContext.set(currentStickyContext);
                    this.groupLockedContext.set(currentGroupLockedContext);
                    this.editorCanSplitInGroupContext.set(currentEditorCanSplitContext);
                    this.sideBySideEditorContext.set(currentSideBySideEditorContext);
                    this.editorAvailableEditorIds.set(currentEditorAvailableEditorIds);
                    // restore focus to active group
                    this.accessor.activeGroup.focus();
                }
            });
        }
        getKeybinding(action) {
            return this.keybindingService.lookupKeybinding(action.id, this.getEditorPaneAwareContextKeyService());
        }
        getKeybindingLabel(action) {
            const keybinding = this.getKeybinding(action);
            return keybinding ? keybinding.getLabel() ?? undefined : undefined;
        }
        get tabHeight() {
            return this.accessor.partOptions.tabHeight !== 'compact' ? EditorTabsControl_1.EDITOR_TAB_HEIGHT.normal : EditorTabsControl_1.EDITOR_TAB_HEIGHT.compact;
        }
        updateTabHeight() {
            this.parent.style.setProperty('--editor-group-tab-height', `${this.tabHeight}px`);
        }
        updateOptions(oldOptions, newOptions) {
            // Update tab height
            if (oldOptions.tabHeight !== newOptions.tabHeight) {
                this.updateTabHeight();
            }
        }
    };
    exports.EditorTabsControl = EditorTabsControl;
    exports.EditorTabsControl = EditorTabsControl = EditorTabsControl_1 = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, notification_1.INotificationService),
        __param(8, actions_2.IMenuService),
        __param(9, quickInput_1.IQuickInputService),
        __param(10, themeService_1.IThemeService),
        __param(11, editorResolverService_1.IEditorResolverService)
    ], EditorTabsControl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yVGFic0NvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yVGFic0NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJDaEcsTUFBYSxpQ0FBa0MsU0FBUSxzQkFBWTtRQUVsRSxZQUNTLE9BQStCO1lBRXZDLEtBQUssRUFBRSxDQUFDO1lBRkEsWUFBTyxHQUFQLE9BQU8sQ0FBd0I7UUFHeEMsQ0FBQztRQUVRLEdBQUcsQ0FBQyxNQUFlLEVBQUUsT0FBcUM7WUFFbEUsMkRBQTJEO1lBQzNELDREQUE0RDtZQUM1RCxjQUFjO1lBRWQsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNqQyxJQUFJLE9BQU8sRUFBRSxhQUFhLEVBQUU7Z0JBQzNCLGFBQWEsR0FBRztvQkFDZixHQUFHLElBQUksQ0FBQyxPQUFPO29CQUNmLGFBQWEsRUFBRSxJQUFJO2lCQUNuQixDQUFDO2FBQ0Y7WUFFRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FDRDtJQXhCRCw4RUF3QkM7SUFFTSxJQUFlLGlCQUFpQixHQUFoQyxNQUFlLGlCQUFrQixTQUFRLHVCQUFROztpQkFNL0Isc0JBQWlCLEdBQUc7WUFDM0MsTUFBTSxFQUFFLEVBQVc7WUFDbkIsT0FBTyxFQUFFLEVBQVc7U0FDcEIsQUFId0MsQ0FHdkM7UUFxQkYsWUFDUyxNQUFtQixFQUNqQixRQUErQixFQUMvQixLQUF1QixFQUNaLGtCQUEwRCxFQUN4RCxvQkFBcUQsRUFDeEQsaUJBQXdELEVBQ3hELGlCQUFzRCxFQUNwRCxtQkFBMEQsRUFDbEUsV0FBMEMsRUFDcEMsaUJBQStDLEVBQ3BELFlBQTJCLEVBQ2xCLHFCQUE4RDtZ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