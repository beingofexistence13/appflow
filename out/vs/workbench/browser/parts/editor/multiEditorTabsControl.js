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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/labels", "vs/workbench/common/editor", "vs/workbench/browser/editor", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/editor/editorTabsControl", "vs/platform/quickinput/common/quickInput", "vs/base/common/lifecycle", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/map", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/dnd", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/dom", "vs/nls", "vs/workbench/browser/parts/editor/editorActions", "vs/base/common/types", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/base/common/async", "vs/workbench/services/path/common/pathService", "vs/base/common/path", "vs/base/common/arrays", "vs/platform/theme/common/theme", "vs/base/browser/browser", "vs/base/common/objects", "vs/platform/editor/common/editor", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/browser/mouseEvent", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/workbench/services/editor/common/editorResolverService", "vs/css!./media/multieditortabscontrol"], function (require, exports, platform_1, labels_1, editor_1, editor_2, keyboardEvent_1, touch_1, labels_2, actionbar_1, contextView_1, instantiation_1, keybinding_1, contextkey_1, actions_1, editorTabsControl_1, quickInput_1, lifecycle_1, scrollableElement_1, map_1, themeService_1, theme_1, colorRegistry_1, dnd_1, notification_1, editorGroupsService_1, dom_1, nls_1, editorActions_1, types_1, editorService_1, resources_1, async_1, pathService_1, path_1, arrays_1, theme_2, browser_1, objects_1, editor_3, editorCommands_1, mouseEvent_1, treeViewsDndService_1, treeViewsDnd_1, editorResolverService_1) {
    "use strict";
    var MultiEditorTabsControl_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiEditorTabsControl = void 0;
    let MultiEditorTabsControl = class MultiEditorTabsControl extends editorTabsControl_1.EditorTabsControl {
        static { MultiEditorTabsControl_1 = this; }
        static { this.SCROLLBAR_SIZES = {
            default: 3,
            large: 10
        }; }
        static { this.TAB_WIDTH = {
            compact: 38,
            shrink: 80,
            fit: 120
        }; }
        static { this.DRAG_OVER_OPEN_TAB_THRESHOLD = 1500; }
        static { this.MOUSE_WHEEL_EVENT_THRESHOLD = 150; }
        static { this.MOUSE_WHEEL_DISTANCE_THRESHOLD = 1.5; }
        constructor(parent, accessor, group, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, menuService, quickInputService, themeService, editorService, pathService, editorGroupService, treeViewsDragAndDropService, editorResolverService) {
            super(parent, accessor, group, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, menuService, quickInputService, themeService, editorResolverService);
            this.editorService = editorService;
            this.pathService = pathService;
            this.editorGroupService = editorGroupService;
            this.treeViewsDragAndDropService = treeViewsDragAndDropService;
            this.closeEditorAction = this._register(this.instantiationService.createInstance(editorActions_1.CloseOneEditorAction, editorActions_1.CloseOneEditorAction.ID, editorActions_1.CloseOneEditorAction.LABEL));
            this.unpinEditorAction = this._register(this.instantiationService.createInstance(editorActions_1.UnpinEditorAction, editorActions_1.UnpinEditorAction.ID, editorActions_1.UnpinEditorAction.LABEL));
            this.tabResourceLabels = this._register(this.instantiationService.createInstance(labels_2.ResourceLabels, labels_2.DEFAULT_LABELS_CONTAINER));
            this.tabLabels = [];
            this.tabActionBars = [];
            this.tabDisposables = [];
            this.dimensions = {
                container: dom_1.Dimension.None,
                available: dom_1.Dimension.None
            };
            this.layoutScheduler = this._register(new lifecycle_1.MutableDisposable());
            this.path = platform_1.isWindows ? path_1.win32 : path_1.posix;
            this.lastMouseWheelEventTime = 0;
            this.isMouseOverTabs = false;
            this.updateEditorLabelScheduler = this._register(new async_1.RunOnceScheduler(() => this.doUpdateEditorLabels(), 0));
            // Resolve the correct path library for the OS we are on
            // If we are connected to remote, this accounts for the
            // remote OS.
            (async () => this.path = await this.pathService.path)();
            // React to decorations changing for our resource labels
            this._register(this.tabResourceLabels.onDidChangeDecorations(() => this.doHandleDecorationsChange()));
        }
        create(parent) {
            super.create(parent);
            this.titleContainer = parent;
            // Tabs and Actions Container (are on a single row with flex side-by-side)
            this.tabsAndActionsContainer = document.createElement('div');
            this.tabsAndActionsContainer.classList.add('tabs-and-actions-container');
            this.titleContainer.appendChild(this.tabsAndActionsContainer);
            // Tabs Container
            this.tabsContainer = document.createElement('div');
            this.tabsContainer.setAttribute('role', 'tablist');
            this.tabsContainer.draggable = true;
            this.tabsContainer.classList.add('tabs-container');
            this._register(touch_1.Gesture.addTarget(this.tabsContainer));
            this.tabSizingFixedDisposables = this._register(new lifecycle_1.DisposableStore());
            this.updateTabSizing(false);
            // Tabs Scrollbar
            this.tabsScrollbar = this.createTabsScrollbar(this.tabsContainer);
            this.tabsAndActionsContainer.appendChild(this.tabsScrollbar.getDomNode());
            // Tabs Container listeners
            this.registerTabsContainerListeners(this.tabsContainer, this.tabsScrollbar);
            // Editor Toolbar Container
            this.editorToolbarContainer = document.createElement('div');
            this.editorToolbarContainer.classList.add('editor-actions');
            this.tabsAndActionsContainer.appendChild(this.editorToolbarContainer);
            // Editor Actions Toolbar
            this.createEditorActionsToolBar(this.editorToolbarContainer);
        }
        createTabsScrollbar(scrollable) {
            const tabsScrollbar = this._register(new scrollableElement_1.ScrollableElement(scrollable, {
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                horizontalScrollbarSize: this.getTabsScrollbarSizing(),
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                scrollYToX: true,
                useShadows: false
            }));
            this._register(tabsScrollbar.onScroll(e => {
                if (e.scrollLeftChanged) {
                    scrollable.scrollLeft = e.scrollLeft;
                }
            }));
            return tabsScrollbar;
        }
        updateTabsScrollbarSizing() {
            this.tabsScrollbar?.updateOptions({
                horizontalScrollbarSize: this.getTabsScrollbarSizing()
            });
        }
        updateTabSizing(fromEvent) {
            const [tabsContainer, tabSizingFixedDisposables] = (0, types_1.assertAllDefined)(this.tabsContainer, this.tabSizingFixedDisposables);
            tabSizingFixedDisposables.clear();
            const options = this.accessor.partOptions;
            if (options.tabSizing === 'fixed') {
                tabsContainer.style.setProperty('--tab-sizing-fixed-min-width', `${options.tabSizingFixedMinWidth}px`);
                tabsContainer.style.setProperty('--tab-sizing-fixed-max-width', `${options.tabSizingFixedMaxWidth}px`);
                // For https://github.com/microsoft/vscode/issues/40290 we want to
                // preserve the current tab widths as long as the mouse is over the
                // tabs so that you can quickly close them via mouse click. For that
                // we track mouse movements over the tabs container.
                tabSizingFixedDisposables.add((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_ENTER, () => {
                    this.isMouseOverTabs = true;
                }));
                tabSizingFixedDisposables.add((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_LEAVE, () => {
                    this.isMouseOverTabs = false;
                    this.updateTabsFixedWidth(false);
                }));
            }
            else if (fromEvent) {
                tabsContainer.style.removeProperty('--tab-sizing-fixed-min-width');
                tabsContainer.style.removeProperty('--tab-sizing-fixed-max-width');
                this.updateTabsFixedWidth(false);
            }
        }
        updateTabsFixedWidth(fixed) {
            this.forEachTab((editor, index, tabContainer) => {
                if (fixed) {
                    const { width } = tabContainer.getBoundingClientRect();
                    tabContainer.style.setProperty('--tab-sizing-current-width', `${width}px`);
                }
                else {
                    tabContainer.style.removeProperty('--tab-sizing-current-width');
                }
            });
        }
        getTabsScrollbarSizing() {
            if (this.accessor.partOptions.titleScrollbarSizing !== 'large') {
                return MultiEditorTabsControl_1.SCROLLBAR_SIZES.default;
            }
            return MultiEditorTabsControl_1.SCROLLBAR_SIZES.large;
        }
        registerTabsContainerListeners(tabsContainer, tabsScrollbar) {
            // Group dragging
            this.enableGroupDragging(tabsContainer);
            // Forward scrolling inside the container to our custom scrollbar
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.SCROLL, () => {
                if (tabsContainer.classList.contains('scroll')) {
                    tabsScrollbar.setScrollPosition({
                        scrollLeft: tabsContainer.scrollLeft // during DND the container gets scrolled so we need to update the custom scrollbar
                    });
                }
            }));
            // New file when double-clicking on tabs container (but not tabs)
            for (const eventType of [touch_1.EventType.Tap, dom_1.EventType.DBLCLICK]) {
                this._register((0, dom_1.addDisposableListener)(tabsContainer, eventType, (e) => {
                    if (eventType === dom_1.EventType.DBLCLICK) {
                        if (e.target !== tabsContainer) {
                            return; // ignore if target is not tabs container
                        }
                    }
                    else {
                        if (e.tapCount !== 2) {
                            return; // ignore single taps
                        }
                        if (e.initialTarget !== tabsContainer) {
                            return; // ignore if target is not tabs container
                        }
                    }
                    dom_1.EventHelper.stop(e);
                    this.editorService.openEditor({
                        resource: undefined,
                        options: {
                            pinned: true,
                            index: this.group.count,
                            override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id
                        }
                    }, this.group.id);
                }));
            }
            // Prevent auto-scrolling (https://github.com/microsoft/vscode/issues/16690)
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_DOWN, e => {
                if (e.button === 1) {
                    e.preventDefault();
                }
            }));
            // Drop support
            this._register(new dom_1.DragAndDropObserver(tabsContainer, {
                onDragEnter: e => {
                    // Always enable support to scroll while dragging
                    tabsContainer.classList.add('scroll');
                    // Return if the target is not on the tabs container
                    if (e.target !== tabsContainer) {
                        this.updateDropFeedback(tabsContainer, false); // fixes https://github.com/microsoft/vscode/issues/52093
                        return;
                    }
                    // Return if transfer is unsupported
                    if (!this.isSupportedDropTransfer(e)) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    // Return if dragged editor is last tab because then this is a no-op
                    let isLocalDragAndDrop = false;
                    if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                        isLocalDragAndDrop = true;
                        const data = this.editorTransfer.getData(dnd_1.DraggedEditorIdentifier.prototype);
                        if (Array.isArray(data)) {
                            const localDraggedEditor = data[0].identifier;
                            if (this.group.id === localDraggedEditor.groupId && this.group.getIndexOfEditor(localDraggedEditor.editor) === this.group.count - 1) {
                                if (e.dataTransfer) {
                                    e.dataTransfer.dropEffect = 'none';
                                }
                                return;
                            }
                        }
                    }
                    // Update the dropEffect to "copy" if there is no local data to be dragged because
                    // in that case we can only copy the data into and not move it from its source
                    if (!isLocalDragAndDrop) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'copy';
                        }
                    }
                    this.updateDropFeedback(tabsContainer, true);
                },
                onDragLeave: e => {
                    this.updateDropFeedback(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                },
                onDragEnd: e => {
                    this.updateDropFeedback(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                },
                onDrop: e => {
                    this.updateDropFeedback(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                    if (e.target === tabsContainer) {
                        this.onDrop(e, this.group.count, tabsContainer);
                    }
                }
            }));
            // Mouse-wheel support to switch to tabs optionally
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.MOUSE_WHEEL, (e) => {
                const activeEditor = this.group.activeEditor;
                if (!activeEditor || this.group.count < 2) {
                    return; // need at least 2 open editors
                }
                // Shift-key enables or disables this behaviour depending on the setting
                if (this.accessor.partOptions.scrollToSwitchTabs === true) {
                    if (e.shiftKey) {
                        return; // 'on': only enable this when Shift-key is not pressed
                    }
                }
                else {
                    if (!e.shiftKey) {
                        return; // 'off': only enable this when Shift-key is pressed
                    }
                }
                // Ignore event if the last one happened too recently (https://github.com/microsoft/vscode/issues/96409)
                // The restriction is relaxed according to the absolute value of `deltaX` and `deltaY`
                // to support discrete (mouse wheel) and contiguous scrolling (touchpad) equally well
                const now = Date.now();
                if (now - this.lastMouseWheelEventTime < MultiEditorTabsControl_1.MOUSE_WHEEL_EVENT_THRESHOLD - 2 * (Math.abs(e.deltaX) + Math.abs(e.deltaY))) {
                    return;
                }
                this.lastMouseWheelEventTime = now;
                // Figure out scrolling direction but ignore it if too subtle
                let tabSwitchDirection;
                if (e.deltaX + e.deltaY < -MultiEditorTabsControl_1.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
                    tabSwitchDirection = -1;
                }
                else if (e.deltaX + e.deltaY > MultiEditorTabsControl_1.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
                    tabSwitchDirection = 1;
                }
                else {
                    return;
                }
                const nextEditor = this.group.getEditorByIndex(this.group.getIndexOfEditor(activeEditor) + tabSwitchDirection);
                if (!nextEditor) {
                    return;
                }
                // Open it
                this.group.openEditor(nextEditor);
                // Disable normal scrolling, opening the editor will already reveal it properly
                dom_1.EventHelper.stop(e, true);
            }));
            // Context menu
            const showContextMenu = (e) => {
                dom_1.EventHelper.stop(e);
                // Find target anchor
                let anchor = tabsContainer;
                if (e instanceof MouseEvent) {
                    anchor = new mouseEvent_1.StandardMouseEvent(e);
                }
                // Show it
                this.contextMenuService.showContextMenu({
                    getAnchor: () => anchor,
                    menuId: actions_1.MenuId.EditorTabsBarContext,
                    contextKeyService: this.contextKeyService,
                    menuActionOptions: { shouldForwardArgs: true },
                    getActionsContext: () => ({ groupId: this.group.id }),
                    getKeyBinding: action => this.getKeybinding(action),
                    onHide: () => this.group.focus()
                });
            };
            this._register((0, dom_1.addDisposableListener)(tabsContainer, touch_1.EventType.Contextmenu, e => showContextMenu(e)));
            this._register((0, dom_1.addDisposableListener)(tabsContainer, dom_1.EventType.CONTEXT_MENU, e => showContextMenu(e)));
        }
        doHandleDecorationsChange() {
            // A change to decorations potentially has an impact on the size of tabs
            // so we need to trigger a layout in that case to adjust things
            this.layout(this.dimensions);
        }
        updateEditorActionsToolbar() {
            super.updateEditorActionsToolbar();
            // Changing the actions in the toolbar can have an impact on the size of the
            // tab container, so we need to layout the tabs to make sure the active is visible
            this.layout(this.dimensions);
        }
        openEditor(editor) {
            return this.handleOpenedEditors();
        }
        openEditors(editors) {
            return this.handleOpenedEditors();
        }
        handleOpenedEditors() {
            // Create tabs as needed
            const [tabsContainer, tabsScrollbar] = (0, types_1.assertAllDefined)(this.tabsContainer, this.tabsScrollbar);
            for (let i = tabsContainer.children.length; i < this.group.count; i++) {
                tabsContainer.appendChild(this.createTab(i, tabsContainer, tabsScrollbar));
            }
            // Make sure to recompute tab labels and detect
            // if a label change occurred that requires a
            // redraw of tabs.
            const activeEditorChanged = this.didActiveEditorChange();
            const oldActiveTabLabel = this.activeTabLabel;
            const oldTabLabelsLength = this.tabLabels.length;
            this.computeTabLabels();
            // Redraw and update in these cases
            let didChange = false;
            if (activeEditorChanged || // active editor changed
                oldTabLabelsLength !== this.tabLabels.length || // number of tabs changed
                !this.equalsEditorInputLabel(oldActiveTabLabel, this.activeTabLabel) // active editor label changed
            ) {
                this.redraw({ forceRevealActiveTab: true });
                didChange = true;
            }
            // Otherwise only layout for revealing
            else {
                this.layout(this.dimensions, { forceRevealActiveTab: true });
            }
            return didChange;
        }
        didActiveEditorChange() {
            if (!this.activeTabLabel?.editor && this.group.activeEditor || // active editor changed from null => editor
                this.activeTabLabel?.editor && !this.group.activeEditor || // active editor changed from editor => null
                (!this.activeTabLabel?.editor || !this.group.isActive(this.activeTabLabel.editor)) // active editor changed from editorA => editorB
            ) {
                return true;
            }
            return false;
        }
        equalsEditorInputLabel(labelA, labelB) {
            if (labelA === labelB) {
                return true;
            }
            if (!labelA || !labelB) {
                return false;
            }
            return labelA.name === labelB.name &&
                labelA.description === labelB.description &&
                labelA.forceDescription === labelB.forceDescription &&
                labelA.title === labelB.title &&
                labelA.ariaLabel === labelB.ariaLabel;
        }
        beforeCloseEditor(editor) {
            // Fix tabs width if the mouse is over tabs and before closing
            // a tab (except the last tab) when tab sizing is 'fixed'.
            // This helps keeping the close button stable under
            // the mouse and allows for rapid closing of tabs.
            if (this.isMouseOverTabs && this.accessor.partOptions.tabSizing === 'fixed') {
                const closingLastTab = this.group.isLast(editor);
                this.updateTabsFixedWidth(!closingLastTab);
            }
        }
        closeEditor(editor) {
            this.handleClosedEditors();
        }
        closeEditors(editors) {
            this.handleClosedEditors();
        }
        handleClosedEditors() {
            // There are tabs to show
            if (this.group.activeEditor) {
                // Remove tabs that got closed
                const tabsContainer = (0, types_1.assertIsDefined)(this.tabsContainer);
                while (tabsContainer.children.length > this.group.count) {
                    // Remove one tab from container (must be the last to keep indexes in order!)
                    tabsContainer.lastChild?.remove();
                    // Remove associated tab label and widget
                    (0, lifecycle_1.dispose)(this.tabDisposables.pop());
                }
                // A removal of a label requires to recompute all labels
                this.computeTabLabels();
                // Redraw all tabs
                this.redraw({ forceRevealActiveTab: true });
            }
            // No tabs to show
            else {
                if (this.tabsContainer) {
                    (0, dom_1.clearNode)(this.tabsContainer);
                }
                this.tabDisposables = (0, lifecycle_1.dispose)(this.tabDisposables);
                this.tabResourceLabels.clear();
                this.tabLabels = [];
                this.activeTabLabel = undefined;
                this.tabActionBars = [];
                this.clearEditorActionsToolbar();
            }
        }
        moveEditor(editor, fromIndex, targetIndex) {
            // Move the editor label
            const editorLabel = this.tabLabels[fromIndex];
            this.tabLabels.splice(fromIndex, 1);
            this.tabLabels.splice(targetIndex, 0, editorLabel);
            // Redraw tabs in the range of the move
            this.forEachTab((editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.redrawTab(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
            }, Math.min(fromIndex, targetIndex), // from: smallest of fromIndex/targetIndex
            Math.max(fromIndex, targetIndex) //   to: largest of fromIndex/targetIndex
            );
            // Moving an editor requires a layout to keep the active editor visible
            this.layout(this.dimensions, { forceRevealActiveTab: true });
        }
        pinEditor(editor) {
            this.withTab(editor, (editor, index, tabContainer, tabLabelWidget, tabLabel) => this.redrawTabLabel(editor, index, tabContainer, tabLabelWidget, tabLabel));
        }
        stickEditor(editor) {
            this.doHandleStickyEditorChange(editor);
        }
        unstickEditor(editor) {
            this.doHandleStickyEditorChange(editor);
        }
        doHandleStickyEditorChange(editor) {
            // Update tab
            this.withTab(editor, (editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTab(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar));
            // Sticky change has an impact on each tab's border because
            // it potentially moves the border to the last pinned tab
            this.forEachTab((editor, index, tabContainer, tabLabelWidget, tabLabel) => {
                this.redrawTabBorders(index, tabContainer);
            });
            // A change to the sticky state requires a layout to keep the active editor visible
            this.layout(this.dimensions, { forceRevealActiveTab: true });
        }
        setActive(isGroupActive) {
            // Activity has an impact on each tab's active indication
            this.forEachTab((editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.redrawTabActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar);
            });
            // Activity has an impact on the toolbar, so we need to update and layout
            this.updateEditorActionsToolbar();
            this.layout(this.dimensions, { forceRevealActiveTab: true });
        }
        updateEditorLabel(editor) {
            // Update all labels to account for changes to tab labels
            // Since this method may be called a lot of times from
            // individual editors, we collect all those requests and
            // then run the update once because we have to update
            // all opened tabs in the group at once.
            this.updateEditorLabelScheduler.schedule();
        }
        doUpdateEditorLabels() {
            // A change to a label requires to recompute all labels
            this.computeTabLabels();
            // As such we need to redraw each label
            this.forEachTab((editor, index, tabContainer, tabLabelWidget, tabLabel) => {
                this.redrawTabLabel(editor, index, tabContainer, tabLabelWidget, tabLabel);
            });
            // A change to a label requires a layout to keep the active editor visible
            this.layout(this.dimensions);
        }
        updateEditorDirty(editor) {
            this.withTab(editor, (editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTabActiveAndDirty(this.accessor.activeGroup === this.group, editor, tabContainer, tabActionBar));
        }
        updateOptions(oldOptions, newOptions) {
            super.updateOptions(oldOptions, newOptions);
            // A change to a label format options requires to recompute all labels
            if (oldOptions.labelFormat !== newOptions.labelFormat) {
                this.computeTabLabels();
            }
            // Update tabs scrollbar sizing
            if (oldOptions.titleScrollbarSizing !== newOptions.titleScrollbarSizing) {
                this.updateTabsScrollbarSizing();
            }
            // Update tabs sizing
            if (oldOptions.tabSizingFixedMinWidth !== newOptions.tabSizingFixedMinWidth ||
                oldOptions.tabSizingFixedMaxWidth !== newOptions.tabSizingFixedMaxWidth ||
                oldOptions.tabSizing !== newOptions.tabSizing) {
                this.updateTabSizing(true);
            }
            // Redraw tabs when other options change
            if (oldOptions.labelFormat !== newOptions.labelFormat ||
                oldOptions.tabCloseButton !== newOptions.tabCloseButton ||
                oldOptions.tabSizing !== newOptions.tabSizing ||
                oldOptions.pinnedTabSizing !== newOptions.pinnedTabSizing ||
                oldOptions.showIcons !== newOptions.showIcons ||
                oldOptions.hasIcons !== newOptions.hasIcons ||
                oldOptions.highlightModifiedTabs !== newOptions.highlightModifiedTabs ||
                oldOptions.wrapTabs !== newOptions.wrapTabs ||
                !(0, objects_1.equals)(oldOptions.decorations, newOptions.decorations)) {
                this.redraw();
            }
        }
        updateStyles() {
            this.redraw();
        }
        forEachTab(fn, fromIndex, toIndex) {
            this.group.editors.forEach((editor, index) => {
                if (typeof fromIndex === 'number' && fromIndex > index) {
                    return; // do nothing if we are not yet at `fromIndex`
                }
                if (typeof toIndex === 'number' && toIndex < index) {
                    return; // do nothing if we are beyond `toIndex`
                }
                this.doWithTab(index, editor, fn);
            });
        }
        withTab(editor, fn) {
            this.doWithTab(this.group.getIndexOfEditor(editor), editor, fn);
        }
        doWithTab(index, editor, fn) {
            const tabsContainer = (0, types_1.assertIsDefined)(this.tabsContainer);
            const tabContainer = tabsContainer.children[index];
            const tabResourceLabel = this.tabResourceLabels.get(index);
            const tabLabel = this.tabLabels[index];
            const tabActionBar = this.tabActionBars[index];
            if (tabContainer && tabResourceLabel && tabLabel) {
                fn(editor, index, tabContainer, tabResourceLabel, tabLabel, tabActionBar);
            }
        }
        createTab(index, tabsContainer, tabsScrollbar) {
            // Tab Container
            const tabContainer = document.createElement('div');
            tabContainer.draggable = true;
            tabContainer.setAttribute('role', 'tab');
            tabContainer.classList.add('tab');
            // Gesture Support
            this._register(touch_1.Gesture.addTarget(tabContainer));
            // Tab Border Top
            const tabBorderTopContainer = document.createElement('div');
            tabBorderTopContainer.classList.add('tab-border-top-container');
            tabContainer.appendChild(tabBorderTopContainer);
            // Tab Editor Label
            const editorLabel = this.tabResourceLabels.create(tabContainer);
            // Tab Actions
            const tabActionsContainer = document.createElement('div');
            tabActionsContainer.classList.add('tab-actions');
            tabContainer.appendChild(tabActionsContainer);
            const tabActionRunner = new editorTabsControl_1.EditorCommandsContextActionRunner({ groupId: this.group.id, editorIndex: index });
            const tabActionBar = new actionbar_1.ActionBar(tabActionsContainer, { ariaLabel: (0, nls_1.localize)('ariaLabelTabActions', "Tab actions"), actionRunner: tabActionRunner });
            const tabActionListener = tabActionBar.onWillRun(e => {
                if (e.action.id === this.closeEditorAction.id) {
                    this.blockRevealActiveTabOnce();
                }
            });
            const tabActionBarDisposable = (0, lifecycle_1.combinedDisposable)(tabActionBar, tabActionListener, (0, lifecycle_1.toDisposable)((0, arrays_1.insert)(this.tabActionBars, tabActionBar)));
            // Tab Border Bottom
            const tabBorderBottomContainer = document.createElement('div');
            tabBorderBottomContainer.classList.add('tab-border-bottom-container');
            tabContainer.appendChild(tabBorderBottomContainer);
            // Eventing
            const eventsDisposable = this.registerTabListeners(tabContainer, index, tabsContainer, tabsScrollbar);
            this.tabDisposables.push((0, lifecycle_1.combinedDisposable)(eventsDisposable, tabActionBarDisposable, tabActionRunner, editorLabel));
            return tabContainer;
        }
        registerTabListeners(tab, index, tabsContainer, tabsScrollbar) {
            const disposables = new lifecycle_1.DisposableStore();
            const handleClickOrTouch = (e, preserveFocus) => {
                tab.blur(); // prevent flicker of focus outline on tab until editor got focus
                if (e instanceof MouseEvent && (e.button !== 0 /* middle/right mouse button */ || (platform_1.isMacintosh && e.ctrlKey /* macOS context menu */))) {
                    if (e.button === 1) {
                        e.preventDefault(); // required to prevent auto-scrolling (https://github.com/microsoft/vscode/issues/16690)
                    }
                    return undefined;
                }
                if (this.originatesFromTabActionBar(e)) {
                    return; // not when clicking on actions
                }
                // Open tabs editor
                const editor = this.group.getEditorByIndex(index);
                if (editor) {
                    // Even if focus is preserved make sure to activate the group.
                    this.group.openEditor(editor, { preserveFocus, activation: editor_3.EditorActivation.ACTIVATE });
                }
                return undefined;
            };
            const showContextMenu = (e) => {
                dom_1.EventHelper.stop(e);
                const editor = this.group.getEditorByIndex(index);
                if (editor) {
                    this.onContextMenu(editor, e, tab);
                }
            };
            // Open on Click / Touch
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.MOUSE_DOWN, e => handleClickOrTouch(e, false)));
            disposables.add((0, dom_1.addDisposableListener)(tab, touch_1.EventType.Tap, (e) => handleClickOrTouch(e, true))); // Preserve focus on touch #125470
            // Touch Scroll Support
            disposables.add((0, dom_1.addDisposableListener)(tab, touch_1.EventType.Change, (e) => {
                tabsScrollbar.setScrollPosition({ scrollLeft: tabsScrollbar.getScrollPosition().scrollLeft - e.translationX });
            }));
            // Prevent flicker of focus outline on tab until editor got focus
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.MOUSE_UP, e => {
                dom_1.EventHelper.stop(e);
                tab.blur();
            }));
            // Close on mouse middle click
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.AUXCLICK, e => {
                if (e.button === 1 /* Middle Button*/) {
                    dom_1.EventHelper.stop(e, true /* for https://github.com/microsoft/vscode/issues/56715 */);
                    const editor = this.group.getEditorByIndex(index);
                    if (editor && (0, editor_1.preventEditorClose)(this.group, editor, editor_1.EditorCloseMethod.MOUSE, this.accessor.partOptions)) {
                        return;
                    }
                    this.blockRevealActiveTabOnce();
                    this.closeEditorAction.run({ groupId: this.group.id, editorIndex: index });
                }
            }));
            // Context menu on Shift+F10
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.shiftKey && event.keyCode === 68 /* KeyCode.F10 */) {
                    showContextMenu(e);
                }
            }));
            // Context menu on touch context menu gesture
            disposables.add((0, dom_1.addDisposableListener)(tab, touch_1.EventType.Contextmenu, (e) => {
                showContextMenu(e);
            }));
            // Keyboard accessibility
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.KEY_UP, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let handled = false;
                // Run action on Enter/Space
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    handled = true;
                    const editor = this.group.getEditorByIndex(index);
                    if (editor) {
                        this.group.openEditor(editor);
                    }
                }
                // Navigate in editors
                else if ([15 /* KeyCode.LeftArrow */, 17 /* KeyCode.RightArrow */, 16 /* KeyCode.UpArrow */, 18 /* KeyCode.DownArrow */, 14 /* KeyCode.Home */, 13 /* KeyCode.End */].some(kb => event.equals(kb))) {
                    let targetIndex;
                    if (event.equals(15 /* KeyCode.LeftArrow */) || event.equals(16 /* KeyCode.UpArrow */)) {
                        targetIndex = index - 1;
                    }
                    else if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(18 /* KeyCode.DownArrow */)) {
                        targetIndex = index + 1;
                    }
                    else if (event.equals(14 /* KeyCode.Home */)) {
                        targetIndex = 0;
                    }
                    else {
                        targetIndex = this.group.count - 1;
                    }
                    const target = this.group.getEditorByIndex(targetIndex);
                    if (target) {
                        handled = true;
                        this.group.openEditor(target, { preserveFocus: true });
                        tabsContainer.childNodes[targetIndex].focus();
                    }
                }
                if (handled) {
                    dom_1.EventHelper.stop(e, true);
                }
                // moving in the tabs container can have an impact on scrolling position, so we need to update the custom scrollbar
                tabsScrollbar.setScrollPosition({
                    scrollLeft: tabsContainer.scrollLeft
                });
            }));
            // Double click: either pin or toggle maximized
            for (const eventType of [touch_1.EventType.Tap, dom_1.EventType.DBLCLICK]) {
                disposables.add((0, dom_1.addDisposableListener)(tab, eventType, (e) => {
                    if (eventType === dom_1.EventType.DBLCLICK) {
                        dom_1.EventHelper.stop(e);
                    }
                    else if (e.tapCount !== 2) {
                        return; // ignore single taps
                    }
                    const editor = this.group.getEditorByIndex(index);
                    if (editor && this.group.isPinned(editor)) {
                        if (this.accessor.partOptions.doubleClickTabToToggleEditorGroupSizes) {
                            this.accessor.arrangeGroups(2 /* GroupsArrangement.TOGGLE */, this.group);
                        }
                    }
                    else {
                        this.group.pinEditor(editor);
                    }
                }));
            }
            // Context menu
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.CONTEXT_MENU, e => {
                dom_1.EventHelper.stop(e, true);
                const editor = this.group.getEditorByIndex(index);
                if (editor) {
                    this.onContextMenu(editor, e, tab);
                }
            }, true /* use capture to fix https://github.com/microsoft/vscode/issues/19145 */));
            // Drag support
            disposables.add((0, dom_1.addDisposableListener)(tab, dom_1.EventType.DRAG_START, e => {
                const editor = this.group.getEditorByIndex(index);
                if (!editor) {
                    return;
                }
                this.editorTransfer.setData([new dnd_1.DraggedEditorIdentifier({ editor, groupId: this.group.id })], dnd_1.DraggedEditorIdentifier.prototype);
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'copyMove';
                }
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.doFillResourceDataTransfers([editor], e);
                // Fixes https://github.com/microsoft/vscode/issues/18733
                tab.classList.add('dragged');
                (0, dom_1.scheduleAtNextAnimationFrame)(() => tab.classList.remove('dragged'));
            }));
            // Drop support
            disposables.add(new dom_1.DragAndDropObserver(tab, {
                onDragEnter: e => {
                    // Update class to signal drag operation
                    tab.classList.add('dragged-over');
                    // Return if transfer is unsupported
                    if (!this.isSupportedDropTransfer(e)) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    // Return if dragged editor is the current tab dragged over
                    let isLocalDragAndDrop = false;
                    if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                        isLocalDragAndDrop = true;
                        const data = this.editorTransfer.getData(dnd_1.DraggedEditorIdentifier.prototype);
                        if (Array.isArray(data)) {
                            const localDraggedEditor = data[0].identifier;
                            if (localDraggedEditor.editor === this.group.getEditorByIndex(index) && localDraggedEditor.groupId === this.group.id) {
                                if (e.dataTransfer) {
                                    e.dataTransfer.dropEffect = 'none';
                                }
                                return;
                            }
                        }
                    }
                    // Update the dropEffect to "copy" if there is no local data to be dragged because
                    // in that case we can only copy the data into and not move it from its source
                    if (!isLocalDragAndDrop) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'copy';
                        }
                    }
                    this.updateDropFeedback(tab, true, index);
                },
                onDragOver: (_, dragDuration) => {
                    if (dragDuration >= MultiEditorTabsControl_1.DRAG_OVER_OPEN_TAB_THRESHOLD) {
                        const draggedOverTab = this.group.getEditorByIndex(index);
                        if (draggedOverTab && this.group.activeEditor !== draggedOverTab) {
                            this.group.openEditor(draggedOverTab, { preserveFocus: true });
                        }
                    }
                },
                onDragLeave: () => {
                    tab.classList.remove('dragged-over');
                    this.updateDropFeedback(tab, false, index);
                },
                onDragEnd: () => {
                    tab.classList.remove('dragged-over');
                    this.updateDropFeedback(tab, false, index);
                    this.editorTransfer.clearData(dnd_1.DraggedEditorIdentifier.prototype);
                },
                onDrop: e => {
                    tab.classList.remove('dragged-over');
                    this.updateDropFeedback(tab, false, index);
                    this.onDrop(e, index, tabsContainer);
                }
            }));
            return disposables;
        }
        isSupportedDropTransfer(e) {
            if (this.groupTransfer.hasData(dnd_1.DraggedEditorGroupIdentifier.prototype)) {
                const data = this.groupTransfer.getData(dnd_1.DraggedEditorGroupIdentifier.prototype);
                if (Array.isArray(data)) {
                    const group = data[0];
                    if (group.identifier === this.group.id) {
                        return false; // groups cannot be dropped on group it originates from
                    }
                }
                return true;
            }
            if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                return true; // (local) editors can always be dropped
            }
            if (e.dataTransfer && e.dataTransfer.types.length > 0) {
                return true; // optimistically allow external data (// see https://github.com/microsoft/vscode/issues/25789)
            }
            return false;
        }
        updateDropFeedback(element, isDND, index) {
            const isTab = (typeof index === 'number');
            const editor = typeof index === 'number' ? this.group.getEditorByIndex(index) : undefined;
            const isActiveTab = isTab && !!editor && this.group.isActive(editor);
            // Background
            const noDNDBackgroundColor = isTab ? this.getColor(isActiveTab ? theme_1.TAB_ACTIVE_BACKGROUND : theme_1.TAB_INACTIVE_BACKGROUND) : '';
            element.style.backgroundColor = (isDND ? this.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND) : noDNDBackgroundColor) || '';
            // Outline
            const activeContrastBorderColor = this.getColor(colorRegistry_1.activeContrastBorder);
            if (activeContrastBorderColor && isDND) {
                element.style.outlineWidth = '2px';
                element.style.outlineStyle = 'dashed';
                element.style.outlineColor = activeContrastBorderColor;
                element.style.outlineOffset = isTab ? '-5px' : '-3px';
            }
            else {
                element.style.outlineWidth = '';
                element.style.outlineStyle = '';
                element.style.outlineColor = activeContrastBorderColor || '';
                element.style.outlineOffset = '';
            }
        }
        computeTabLabels() {
            const { labelFormat } = this.accessor.partOptions;
            const { verbosity, shortenDuplicates } = this.getLabelConfigFlags(labelFormat);
            // Build labels and descriptions for each editor
            const labels = [];
            let activeEditorIndex = -1;
            for (let i = 0; i < this.group.editors.length; i++) {
                const editor = this.group.editors[i];
                labels.push({
                    editor,
                    name: editor.getName(),
                    description: editor.getDescription(verbosity),
                    forceDescription: editor.hasCapability(64 /* EditorInputCapabilities.ForceDescription */),
                    title: editor.getTitle(2 /* Verbosity.LONG */),
                    ariaLabel: (0, editor_2.computeEditorAriaLabel)(editor, i, this.group, this.editorGroupService.count)
                });
                if (editor === this.group.activeEditor) {
                    activeEditorIndex = i;
                }
            }
            // Shorten labels as needed
            if (shortenDuplicates) {
                this.shortenTabLabels(labels);
            }
            // Remember for fast lookup
            this.tabLabels = labels;
            this.activeTabLabel = labels[activeEditorIndex];
        }
        shortenTabLabels(labels) {
            // Gather duplicate titles, while filtering out invalid descriptions
            const mapNameToDuplicates = new Map();
            for (const label of labels) {
                if (typeof label.description === 'string') {
                    (0, map_1.getOrSet)(mapNameToDuplicates, label.name, []).push(label);
                }
                else {
                    label.description = '';
                }
            }
            // Identify duplicate names and shorten descriptions
            for (const [, duplicateLabels] of mapNameToDuplicates) {
                // Remove description if the title isn't duplicated
                // and we have no indication to enforce description
                if (duplicateLabels.length === 1 && !duplicateLabels[0].forceDescription) {
                    duplicateLabels[0].description = '';
                    continue;
                }
                // Identify duplicate descriptions
                const mapDescriptionToDuplicates = new Map();
                for (const duplicateLabel of duplicateLabels) {
                    (0, map_1.getOrSet)(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
                }
                // For editors with duplicate descriptions, check whether any long descriptions differ
                let useLongDescriptions = false;
                for (const [, duplicateLabels] of mapDescriptionToDuplicates) {
                    if (!useLongDescriptions && duplicateLabels.length > 1) {
                        const [first, ...rest] = duplicateLabels.map(({ editor }) => editor.getDescription(2 /* Verbosity.LONG */));
                        useLongDescriptions = rest.some(description => description !== first);
                    }
                }
                // If so, replace all descriptions with long descriptions
                if (useLongDescriptions) {
                    mapDescriptionToDuplicates.clear();
                    for (const duplicateLabel of duplicateLabels) {
                        duplicateLabel.description = duplicateLabel.editor.getDescription(2 /* Verbosity.LONG */);
                        (0, map_1.getOrSet)(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
                    }
                }
                // Obtain final set of descriptions
                const descriptions = [];
                for (const [description] of mapDescriptionToDuplicates) {
                    descriptions.push(description);
                }
                // Remove description if all descriptions are identical unless forced
                if (descriptions.length === 1) {
                    for (const label of mapDescriptionToDuplicates.get(descriptions[0]) || []) {
                        if (!label.forceDescription) {
                            label.description = '';
                        }
                    }
                    continue;
                }
                // Shorten descriptions
                const shortenedDescriptions = (0, labels_1.shorten)(descriptions, this.path.sep);
                descriptions.forEach((description, index) => {
                    for (const label of mapDescriptionToDuplicates.get(description) || []) {
                        label.description = shortenedDescriptions[index];
                    }
                });
            }
        }
        getLabelConfigFlags(value) {
            switch (value) {
                case 'short':
                    return { verbosity: 0 /* Verbosity.SHORT */, shortenDuplicates: false };
                case 'medium':
                    return { verbosity: 1 /* Verbosity.MEDIUM */, shortenDuplicates: false };
                case 'long':
                    return { verbosity: 2 /* Verbosity.LONG */, shortenDuplicates: false };
                default:
                    return { verbosity: 1 /* Verbosity.MEDIUM */, shortenDuplicates: true };
            }
        }
        redraw(options) {
            // Border below tabs if any with explicit high contrast support
            if (this.tabsAndActionsContainer) {
                let tabsContainerBorderColor = this.getColor(theme_1.EDITOR_GROUP_HEADER_TABS_BORDER);
                if (!tabsContainerBorderColor && (0, theme_2.isHighContrast)(this.theme.type)) {
                    tabsContainerBorderColor = this.getColor(theme_1.TAB_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
                }
                if (tabsContainerBorderColor) {
                    this.tabsAndActionsContainer.classList.add('tabs-border-bottom');
                    this.tabsAndActionsContainer.style.setProperty('--tabs-border-bottom-color', tabsContainerBorderColor.toString());
                }
                else {
                    this.tabsAndActionsContainer.classList.remove('tabs-border-bottom');
                    this.tabsAndActionsContainer.style.removeProperty('--tabs-border-bottom-color');
                }
            }
            // For each tab
            this.forEachTab((editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.redrawTab(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
            });
            // Update Editor Actions Toolbar
            this.updateEditorActionsToolbar();
            // Ensure the active tab is always revealed
            this.layout(this.dimensions, options);
        }
        redrawTab(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) {
            const isTabSticky = this.group.isSticky(index);
            const options = this.accessor.partOptions;
            // Label
            this.redrawTabLabel(editor, index, tabContainer, tabLabelWidget, tabLabel);
            // Action
            const tabAction = isTabSticky ? this.unpinEditorAction : this.closeEditorAction;
            if (!tabActionBar.hasAction(tabAction)) {
                if (!tabActionBar.isEmpty()) {
                    tabActionBar.clear();
                }
                tabActionBar.push(tabAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(tabAction) });
            }
            // Settings
            const tabActionsVisibility = isTabSticky && options.pinnedTabSizing === 'compact' ? 'off' /* treat sticky compact tabs as tabCloseButton: 'off' */ : options.tabCloseButton;
            for (const option of ['off', 'left', 'right']) {
                tabContainer.classList.toggle(`tab-actions-${option}`, tabActionsVisibility === option);
            }
            const tabSizing = isTabSticky && options.pinnedTabSizing === 'shrink' ? 'shrink' /* treat sticky shrink tabs as tabSizing: 'shrink' */ : options.tabSizing;
            for (const option of ['fit', 'shrink', 'fixed']) {
                tabContainer.classList.toggle(`sizing-${option}`, tabSizing === option);
            }
            tabContainer.classList.toggle('has-icon', options.showIcons && options.hasIcons);
            tabContainer.classList.toggle('sticky', isTabSticky);
            for (const option of ['normal', 'compact', 'shrink']) {
                tabContainer.classList.toggle(`sticky-${option}`, isTabSticky && options.pinnedTabSizing === option);
            }
            // If not wrapping tabs, sticky compact/shrink tabs need a position to remain at their location
            // when scrolling to stay in view (requirement for position: sticky)
            if (!options.wrapTabs && isTabSticky && options.pinnedTabSizing !== 'normal') {
                let stickyTabWidth = 0;
                switch (options.pinnedTabSizing) {
                    case 'compact':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.compact;
                        break;
                    case 'shrink':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.shrink;
                        break;
                }
                tabContainer.style.left = `${index * stickyTabWidth}px`;
            }
            else {
                tabContainer.style.left = 'auto';
            }
            // Borders / outline
            this.redrawTabBorders(index, tabContainer);
            // Active / dirty state
            this.redrawTabActiveAndDirty(this.accessor.activeGroup === this.group, editor, tabContainer, tabActionBar);
        }
        redrawTabLabel(editor, index, tabContainer, tabLabelWidget, tabLabel) {
            const options = this.accessor.partOptions;
            // Unless tabs are sticky compact, show the full label and description
            // Sticky compact tabs will only show an icon if icons are enabled
            // or their first character of the name otherwise
            let name;
            let forceLabel = false;
            let fileDecorationBadges = Boolean(options.decorations?.badges);
            let description;
            if (options.pinnedTabSizing === 'compact' && this.group.isSticky(index)) {
                const isShowingIcons = options.showIcons && options.hasIcons;
                name = isShowingIcons ? '' : tabLabel.name?.charAt(0).toUpperCase();
                description = '';
                forceLabel = true;
                fileDecorationBadges = false; // not enough space when sticky tabs are compact
            }
            else {
                name = tabLabel.name;
                description = tabLabel.description || '';
            }
            if (tabLabel.ariaLabel) {
                tabContainer.setAttribute('aria-label', tabLabel.ariaLabel);
                // Set aria-description to empty string so that screen readers would not read the title as well
                // More details https://github.com/microsoft/vscode/issues/95378
                tabContainer.setAttribute('aria-description', '');
            }
            const title = tabLabel.title || '';
            tabContainer.title = title;
            // Label
            tabLabelWidget.setResource({ name, description, resource: editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }) }, {
                title,
                extraClasses: (0, arrays_1.coalesce)(['tab-label', fileDecorationBadges ? 'tab-label-has-badge' : undefined].concat(editor.getLabelExtraClasses())),
                italic: !this.group.isPinned(editor),
                forceLabel,
                fileDecorations: {
                    colors: Boolean(options.decorations?.colors),
                    badges: fileDecorationBadges
                }
            });
            // Tests helper
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource) {
                tabContainer.setAttribute('data-resource-name', (0, resources_1.basenameOrAuthority)(resource));
            }
            else {
                tabContainer.removeAttribute('data-resource-name');
            }
        }
        redrawTabActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar) {
            const isTabActive = this.group.isActive(editor);
            const hasModifiedBorderTop = this.doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer);
            this.doRedrawTabActive(isGroupActive, !hasModifiedBorderTop, editor, tabContainer, tabActionBar);
        }
        doRedrawTabActive(isGroupActive, allowBorderTop, editor, tabContainer, tabActionBar) {
            // Tab is active
            if (this.group.isActive(editor)) {
                // Container
                tabContainer.classList.add('active');
                tabContainer.setAttribute('aria-selected', 'true');
                tabContainer.tabIndex = 0; // Only active tab can be focused into
                tabContainer.style.backgroundColor = this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_BACKGROUND : theme_1.TAB_UNFOCUSED_ACTIVE_BACKGROUND) || '';
                const activeTabBorderColorBottom = this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_BORDER : theme_1.TAB_UNFOCUSED_ACTIVE_BORDER);
                if (activeTabBorderColorBottom) {
                    tabContainer.classList.add('tab-border-bottom');
                    tabContainer.style.setProperty('--tab-border-bottom-color', activeTabBorderColorBottom.toString());
                }
                else {
                    tabContainer.classList.remove('tab-border-bottom');
                    tabContainer.style.removeProperty('--tab-border-bottom-color');
                }
                const activeTabBorderColorTop = allowBorderTop ? this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_BORDER_TOP : theme_1.TAB_UNFOCUSED_ACTIVE_BORDER_TOP) : undefined;
                if (activeTabBorderColorTop) {
                    tabContainer.classList.add('tab-border-top');
                    tabContainer.style.setProperty('--tab-border-top-color', activeTabBorderColorTop.toString());
                }
                else {
                    tabContainer.classList.remove('tab-border-top');
                    tabContainer.style.removeProperty('--tab-border-top-color');
                }
                // Label
                tabContainer.style.color = this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_FOREGROUND : theme_1.TAB_UNFOCUSED_ACTIVE_FOREGROUND) || '';
                // Actions
                tabActionBar.setFocusable(true);
            }
            // Tab is inactive
            else {
                // Container
                tabContainer.classList.remove('active');
                tabContainer.setAttribute('aria-selected', 'false');
                tabContainer.tabIndex = -1; // Only active tab can be focused into
                tabContainer.style.backgroundColor = this.getColor(isGroupActive ? theme_1.TAB_INACTIVE_BACKGROUND : theme_1.TAB_UNFOCUSED_INACTIVE_BACKGROUND) || '';
                tabContainer.style.boxShadow = '';
                // Label
                tabContainer.style.color = this.getColor(isGroupActive ? theme_1.TAB_INACTIVE_FOREGROUND : theme_1.TAB_UNFOCUSED_INACTIVE_FOREGROUND) || '';
                // Actions
                tabActionBar.setFocusable(false);
            }
        }
        doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer) {
            let hasModifiedBorderColor = false;
            // Tab: dirty (unless saving)
            if (editor.isDirty() && !editor.isSaving()) {
                tabContainer.classList.add('dirty');
                // Highlight modified tabs with a border if configured
                if (this.accessor.partOptions.highlightModifiedTabs) {
                    let modifiedBorderColor;
                    if (isGroupActive && isTabActive) {
                        modifiedBorderColor = this.getColor(theme_1.TAB_ACTIVE_MODIFIED_BORDER);
                    }
                    else if (isGroupActive && !isTabActive) {
                        modifiedBorderColor = this.getColor(theme_1.TAB_INACTIVE_MODIFIED_BORDER);
                    }
                    else if (!isGroupActive && isTabActive) {
                        modifiedBorderColor = this.getColor(theme_1.TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER);
                    }
                    else {
                        modifiedBorderColor = this.getColor(theme_1.TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER);
                    }
                    if (modifiedBorderColor) {
                        hasModifiedBorderColor = true;
                        tabContainer.classList.add('dirty-border-top');
                        tabContainer.style.setProperty('--tab-dirty-border-top-color', modifiedBorderColor);
                    }
                }
                else {
                    tabContainer.classList.remove('dirty-border-top');
                    tabContainer.style.removeProperty('--tab-dirty-border-top-color');
                }
            }
            // Tab: not dirty
            else {
                tabContainer.classList.remove('dirty', 'dirty-border-top');
                tabContainer.style.removeProperty('--tab-dirty-border-top-color');
            }
            return hasModifiedBorderColor;
        }
        redrawTabBorders(index, tabContainer) {
            const isTabSticky = this.group.isSticky(index);
            const isTabLastSticky = isTabSticky && this.group.stickyCount === index + 1;
            // Borders / Outline
            const borderRightColor = ((isTabLastSticky ? this.getColor(theme_1.TAB_LAST_PINNED_BORDER) : undefined) || this.getColor(theme_1.TAB_BORDER) || this.getColor(colorRegistry_1.contrastBorder));
            tabContainer.style.borderRight = borderRightColor ? `1px solid ${borderRightColor}` : '';
            tabContainer.style.outlineColor = this.getColor(colorRegistry_1.activeContrastBorder) || '';
        }
        prepareEditorActions(editorActions) {
            const isGroupActive = this.accessor.activeGroup === this.group;
            // Active: allow all actions
            if (isGroupActive) {
                return editorActions;
            }
            // Inactive: only show "Unlock" and secondary actions
            else {
                return {
                    primary: editorActions.primary.filter(action => action.id === editorCommands_1.UNLOCK_GROUP_COMMAND_ID),
                    secondary: editorActions.secondary
                };
            }
        }
        getHeight() {
            // Return quickly if our used dimensions are known
            if (this.dimensions.used) {
                return this.dimensions.used.height;
            }
            // Otherwise compute via browser APIs
            else {
                return this.computeHeight();
            }
        }
        computeHeight() {
            let height;
            // Wrap: we need to ask `offsetHeight` to get
            // the real height of the title area with wrapping.
            if (this.accessor.partOptions.wrapTabs && this.tabsAndActionsContainer?.classList.contains('wrapping')) {
                height = this.tabsAndActionsContainer.offsetHeight;
            }
            else {
                height = this.tabHeight;
            }
            return height;
        }
        layout(dimensions, options) {
            // Remember dimensions that we get
            Object.assign(this.dimensions, dimensions);
            // The layout of tabs can be an expensive operation because we access DOM properties
            // that can result in the browser doing a full page layout to validate them. To buffer
            // this a little bit we try at least to schedule this work on the next animation frame.
            if (!this.layoutScheduler.value) {
                const scheduledLayout = (0, dom_1.scheduleAtNextAnimationFrame)(() => {
                    this.doLayout(this.dimensions, this.layoutScheduler.value?.options /* ensure to pick up latest options */);
                    this.layoutScheduler.clear();
                });
                this.layoutScheduler.value = { options, dispose: () => scheduledLayout.dispose() };
            }
            // Make sure to keep options updated
            if (options?.forceRevealActiveTab) {
                this.layoutScheduler.value.options = {
                    ...this.layoutScheduler.value.options,
                    forceRevealActiveTab: true
                };
            }
            // First time layout: compute the dimensions and store it
            if (!this.dimensions.used) {
                this.dimensions.used = new dom_1.Dimension(dimensions.container.width, this.computeHeight());
            }
            return this.dimensions.used;
        }
        doLayout(dimensions, options) {
            // Only layout if we have valid tab index and dimensions
            const activeTabAndIndex = this.group.activeEditor ? this.getTabAndIndex(this.group.activeEditor) : undefined;
            if (activeTabAndIndex && dimensions.container !== dom_1.Dimension.None && dimensions.available !== dom_1.Dimension.None) {
                // Tabs
                const [activeTab, activeIndex] = activeTabAndIndex;
                this.doLayoutTabs(activeTab, activeIndex, dimensions, options);
            }
            // Remember the dimensions used in the control so that we can
            // return it fast from the `layout` call without having to
            // compute it over and over again
            const oldDimension = this.dimensions.used;
            const newDimension = this.dimensions.used = new dom_1.Dimension(dimensions.container.width, this.computeHeight());
            // In case the height of the title control changed from before
            // (currently only possible if wrapping changed on/off), we need
            // to signal this to the outside via a `relayout` call so that
            // e.g. the editor control can be adjusted accordingly.
            if (oldDimension && oldDimension.height !== newDimension.height) {
                this.group.relayout();
            }
        }
        doLayoutTabs(activeTab, activeIndex, dimensions, options) {
            // Always first layout tabs with wrapping support even if wrapping
            // is disabled. The result indicates if tabs wrap and if not, we
            // need to proceed with the layout without wrapping because even
            // if wrapping is enabled in settings, there are cases where
            // wrapping is disabled (e.g. due to space constraints)
            const tabsWrapMultiLine = this.doLayoutTabsWrapping(dimensions);
            if (!tabsWrapMultiLine) {
                this.doLayoutTabsNonWrapping(activeTab, activeIndex, options);
            }
        }
        doLayoutTabsWrapping(dimensions) {
            const [tabsAndActionsContainer, tabsContainer, editorToolbarContainer, tabsScrollbar] = (0, types_1.assertAllDefined)(this.tabsAndActionsContainer, this.tabsContainer, this.editorToolbarContainer, this.tabsScrollbar);
            // Handle wrapping tabs according to setting:
            // - enabled: only add class if tabs wrap and don't exceed available dimensions
            // - disabled: remove class and margin-right variable
            const didTabsWrapMultiLine = tabsAndActionsContainer.classList.contains('wrapping');
            let tabsWrapMultiLine = didTabsWrapMultiLine;
            function updateTabsWrapping(enabled) {
                tabsWrapMultiLine = enabled;
                // Toggle the `wrapped` class to enable wrapping
                tabsAndActionsContainer.classList.toggle('wrapping', tabsWrapMultiLine);
                // Update `last-tab-margin-right` CSS variable to account for the absolute
                // positioned editor actions container when tabs wrap. The margin needs to
                // be the width of the editor actions container to avoid screen cheese.
                tabsContainer.style.setProperty('--last-tab-margin-right', tabsWrapMultiLine ? `${editorToolbarContainer.offsetWidth}px` : '0');
            }
            // Setting enabled: selectively enable wrapping if possible
            if (this.accessor.partOptions.wrapTabs) {
                const visibleTabsWidth = tabsContainer.offsetWidth;
                const allTabsWidth = tabsContainer.scrollWidth;
                const lastTabFitsWrapped = () => {
                    const lastTab = this.getLastTab();
                    if (!lastTab) {
                        return true; // no tab always fits
                    }
                    const lastTabOverlapWithToolbarWidth = lastTab.offsetWidth + editorToolbarContainer.offsetWidth - dimensions.available.width;
                    if (lastTabOverlapWithToolbarWidth > 1) {
                        // Allow for slight rounding errors related to zooming here
                        // https://github.com/microsoft/vscode/issues/116385
                        return false;
                    }
                    return true;
                };
                // If tabs wrap or should start to wrap (when width exceeds visible width)
                // we must trigger `updateWrapping` to set the `last-tab-margin-right`
                // accordingly based on the number of actions. The margin is important to
                // properly position the last tab apart from the actions
                //
                // We already check here if the last tab would fit when wrapped given the
                // editor toolbar will also show right next to it. This ensures we are not
                // enabling wrapping only to disable it again in the code below (this fixes
                // flickering issue https://github.com/microsoft/vscode/issues/115050)
                if (tabsWrapMultiLine || (allTabsWidth > visibleTabsWidth && lastTabFitsWrapped())) {
                    updateTabsWrapping(true);
                }
                // Tabs wrap multiline: remove wrapping under certain size constraint conditions
                if (tabsWrapMultiLine) {
                    if ((tabsContainer.offsetHeight > dimensions.available.height) || // if height exceeds available height
                        (allTabsWidth === visibleTabsWidth && tabsContainer.offsetHeight === this.tabHeight) || // if wrapping is not needed anymore
                        (!lastTabFitsWrapped()) // if last tab does not fit anymore
                    ) {
                        updateTabsWrapping(false);
                    }
                }
            }
            // Setting disabled: remove CSS traces only if tabs did wrap
            else if (didTabsWrapMultiLine) {
                updateTabsWrapping(false);
            }
            // If we transitioned from non-wrapping to wrapping, we need
            // to update the scrollbar to have an equal `width` and
            // `scrollWidth`. Otherwise a scrollbar would appear which is
            // never desired when wrapping.
            if (tabsWrapMultiLine && !didTabsWrapMultiLine) {
                const visibleTabsWidth = tabsContainer.offsetWidth;
                tabsScrollbar.setScrollDimensions({
                    width: visibleTabsWidth,
                    scrollWidth: visibleTabsWidth
                });
            }
            // Update the `last-in-row` class on tabs when wrapping
            // is enabled (it doesn't do any harm otherwise). This
            // class controls additional properties of tab when it is
            // the last tab in a row
            if (tabsWrapMultiLine) {
                // Using a map here to change classes after the for loop is
                // crucial for performance because changing the class on a
                // tab can result in layouts of the rendering engine.
                const tabs = new Map();
                let currentTabsPosY = undefined;
                let lastTab = undefined;
                for (const child of tabsContainer.children) {
                    const tab = child;
                    const tabPosY = tab.offsetTop;
                    // Marks a new or the first row of tabs
                    if (tabPosY !== currentTabsPosY) {
                        currentTabsPosY = tabPosY;
                        if (lastTab) {
                            tabs.set(lastTab, true); // previous tab must be last in row then
                        }
                    }
                    // Always remember last tab and ensure the
                    // last-in-row class is not present until
                    // we know the tab is last
                    lastTab = tab;
                    tabs.set(tab, false);
                }
                // Last tab overally is always last-in-row
                if (lastTab) {
                    tabs.set(lastTab, true);
                }
                for (const [tab, lastInRow] of tabs) {
                    tab.classList.toggle('last-in-row', lastInRow);
                }
            }
            return tabsWrapMultiLine;
        }
        doLayoutTabsNonWrapping(activeTab, activeIndex, options) {
            const [tabsContainer, tabsScrollbar] = (0, types_1.assertAllDefined)(this.tabsContainer, this.tabsScrollbar);
            //
            // Synopsis
            // - allTabsWidth:   			sum of all tab widths
            // - stickyTabsWidth:			sum of all sticky tab widths (unless `pinnedTabSizing: normal`)
            // - visibleContainerWidth: 	size of tab container
            // - availableContainerWidth: 	size of tab container minus size of sticky tabs
            //
            // [------------------------------ All tabs width ---------------------------------------]
            // [------------------- Visible container width -------------------]
            //                         [------ Available container width ------]
            // [ Sticky A ][ Sticky B ][ Tab C ][ Tab D ][ Tab E ][ Tab F ][ Tab G ][ Tab H ][ Tab I ]
            //                 Active Tab Width [-------]
            // [------- Active Tab Pos X -------]
            // [-- Sticky Tabs Width --]
            //
            const visibleTabsWidth = tabsContainer.offsetWidth;
            const allTabsWidth = tabsContainer.scrollWidth;
            // Compute width of sticky tabs depending on pinned tab sizing
            // - compact: sticky-tabs * TAB_SIZES.compact
            // -  shrink: sticky-tabs * TAB_SIZES.shrink
            // -  normal: 0 (sticky tabs inherit look and feel from non-sticky tabs)
            let stickyTabsWidth = 0;
            if (this.group.stickyCount > 0) {
                let stickyTabWidth = 0;
                switch (this.accessor.partOptions.pinnedTabSizing) {
                    case 'compact':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.compact;
                        break;
                    case 'shrink':
                        stickyTabWidth = MultiEditorTabsControl_1.TAB_WIDTH.shrink;
                        break;
                }
                stickyTabsWidth = this.group.stickyCount * stickyTabWidth;
            }
            // Figure out if active tab is positioned static which has an
            // impact on whether to reveal the tab or not later
            let activeTabPositionStatic = this.accessor.partOptions.pinnedTabSizing !== 'normal' && this.group.isSticky(activeIndex);
            // Special case: we have sticky tabs but the available space for showing tabs
            // is little enough that we need to disable sticky tabs sticky positioning
            // so that tabs can be scrolled at naturally.
            let availableTabsContainerWidth = visibleTabsWidth - stickyTabsWidth;
            if (this.group.stickyCount > 0 && availableTabsContainerWidth < MultiEditorTabsControl_1.TAB_WIDTH.fit) {
                tabsContainer.classList.add('disable-sticky-tabs');
                availableTabsContainerWidth = visibleTabsWidth;
                stickyTabsWidth = 0;
                activeTabPositionStatic = false;
            }
            else {
                tabsContainer.classList.remove('disable-sticky-tabs');
            }
            let activeTabPosX;
            let activeTabWidth;
            if (!this.blockRevealActiveTab) {
                activeTabPosX = activeTab.offsetLeft;
                activeTabWidth = activeTab.offsetWidth;
            }
            // Update scrollbar
            const { width: oldVisibleTabsWidth, scrollWidth: oldAllTabsWidth } = tabsScrollbar.getScrollDimensions();
            tabsScrollbar.setScrollDimensions({
                width: visibleTabsWidth,
                scrollWidth: allTabsWidth
            });
            const dimensionsChanged = oldVisibleTabsWidth !== visibleTabsWidth || oldAllTabsWidth !== allTabsWidth;
            // Revealing the active tab is skipped under some conditions:
            if (this.blockRevealActiveTab || // explicitly disabled
                typeof activeTabPosX !== 'number' || // invalid dimension
                typeof activeTabWidth !== 'number' || // invalid dimension
                activeTabPositionStatic || // static tab (sticky)
                (!dimensionsChanged && !options?.forceRevealActiveTab) // dimensions did not change and we have low layout priority (https://github.com/microsoft/vscode/issues/133631)
            ) {
                this.blockRevealActiveTab = false;
                return;
            }
            // Reveal the active one
            const tabsContainerScrollPosX = tabsScrollbar.getScrollPosition().scrollLeft;
            const activeTabFits = activeTabWidth <= availableTabsContainerWidth;
            const adjustedActiveTabPosX = activeTabPosX - stickyTabsWidth;
            //
            // Synopsis
            // - adjustedActiveTabPosX: the adjusted tabPosX takes the width of sticky tabs into account
            //   conceptually the scrolling only begins after sticky tabs so in order to reveal a tab fully
            //   the actual position needs to be adjusted for sticky tabs.
            //
            // Tab is overflowing to the right: Scroll minimally until the element is fully visible to the right
            // Note: only try to do this if we actually have enough width to give to show the tab fully!
            //
            // Example: Tab G should be made active and needs to be fully revealed as such.
            //
            // [-------------------------------- All tabs width -----------------------------------------]
            // [-------------------- Visible container width --------------------]
            //                           [----- Available container width -------]
            //     [ Sticky A ][ Sticky B ][ Tab C ][ Tab D ][ Tab E ][ Tab F ][ Tab G ][ Tab H ][ Tab I ]
            //                     Active Tab Width [-------]
            //     [------- Active Tab Pos X -------]
            //                             [-------- Adjusted Tab Pos X -------]
            //     [-- Sticky Tabs Width --]
            //
            //
            if (activeTabFits && tabsContainerScrollPosX + availableTabsContainerWidth < adjustedActiveTabPosX + activeTabWidth) {
                tabsScrollbar.setScrollPosition({
                    scrollLeft: tabsContainerScrollPosX + ((adjustedActiveTabPosX + activeTabWidth) /* right corner of tab */ - (tabsContainerScrollPosX + availableTabsContainerWidth) /* right corner of view port */)
                });
            }
            //
            // Tab is overlflowing to the left or does not fit: Scroll it into view to the left
            //
            // Example: Tab C should be made active and needs to be fully revealed as such.
            //
            // [----------------------------- All tabs width ----------------------------------------]
            //     [------------------ Visible container width ------------------]
            //                           [----- Available container width -------]
            // [ Sticky A ][ Sticky B ][ Tab C ][ Tab D ][ Tab E ][ Tab F ][ Tab G ][ Tab H ][ Tab I ]
            //                 Active Tab Width [-------]
            // [------- Active Tab Pos X -------]
            //      Adjusted Tab Pos X []
            // [-- Sticky Tabs Width --]
            //
            //
            else if (tabsContainerScrollPosX > adjustedActiveTabPosX || !activeTabFits) {
                tabsScrollbar.setScrollPosition({
                    scrollLeft: adjustedActiveTabPosX
                });
            }
        }
        getTabAndIndex(editor) {
            const editorIndex = this.group.getIndexOfEditor(editor);
            const tab = this.getTabAtIndex(editorIndex);
            if (tab) {
                return [tab, editorIndex];
            }
            return undefined;
        }
        getTabAtIndex(editorIndex) {
            if (editorIndex >= 0) {
                const tabsContainer = (0, types_1.assertIsDefined)(this.tabsContainer);
                return tabsContainer.children[editorIndex];
            }
            return undefined;
        }
        getLastTab() {
            return this.getTabAtIndex(this.group.count - 1);
        }
        blockRevealActiveTabOnce() {
            // When closing tabs through the tab close button or gesture, the user
            // might want to rapidly close tabs in sequence and as such revealing
            // the active tab after each close would be annoying. As such we block
            // the automated revealing of the active tab once after the close is
            // triggered.
            this.blockRevealActiveTab = true;
        }
        originatesFromTabActionBar(e) {
            let element;
            if (e instanceof MouseEvent) {
                element = (e.target || e.srcElement);
            }
            else {
                element = e.initialTarget;
            }
            return !!(0, dom_1.findParentWithClass)(element, 'action-item', 'tab');
        }
        async onDrop(e, targetIndex, tabsContainer) {
            dom_1.EventHelper.stop(e, true);
            this.updateDropFeedback(tabsContainer, false);
            tabsContainer.classList.remove('scroll');
            // Check for group transfer
            if (this.groupTransfer.hasData(dnd_1.DraggedEditorGroupIdentifier.prototype)) {
                const data = this.groupTransfer.getData(dnd_1.DraggedEditorGroupIdentifier.prototype);
                if (Array.isArray(data)) {
                    const sourceGroup = this.accessor.getGroup(data[0].identifier);
                    if (sourceGroup) {
                        const mergeGroupOptions = { index: targetIndex };
                        if (!this.isMoveOperation(e, sourceGroup.id)) {
                            mergeGroupOptions.mode = 0 /* MergeGroupMode.COPY_EDITORS */;
                        }
                        this.accessor.mergeGroup(sourceGroup, this.group, mergeGroupOptions);
                    }
                    this.group.focus();
                    this.groupTransfer.clearData(dnd_1.DraggedEditorGroupIdentifier.prototype);
                }
            }
            // Check for editor transfer
            else if (this.editorTransfer.hasData(dnd_1.DraggedEditorIdentifier.prototype)) {
                const data = this.editorTransfer.getData(dnd_1.DraggedEditorIdentifier.prototype);
                if (Array.isArray(data)) {
                    const draggedEditor = data[0].identifier;
                    const sourceGroup = this.accessor.getGroup(draggedEditor.groupId);
                    if (sourceGroup) {
                        // Move editor to target position and index
                        if (this.isMoveOperation(e, draggedEditor.groupId, draggedEditor.editor)) {
                            sourceGroup.moveEditor(draggedEditor.editor, this.group, { index: targetIndex });
                        }
                        // Copy editor to target position and index
                        else {
                            sourceGroup.copyEditor(draggedEditor.editor, this.group, { index: targetIndex });
                        }
                    }
                    this.group.focus();
                    this.editorTransfer.clearData(dnd_1.DraggedEditorIdentifier.prototype);
                }
            }
            // Check for tree items
            else if (this.treeItemsTransfer.hasData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)) {
                const data = this.treeItemsTransfer.getData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
                if (Array.isArray(data)) {
                    const editors = [];
                    for (const id of data) {
                        const dataTransferItem = await this.treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
                        if (dataTransferItem) {
                            const treeDropData = await (0, dnd_1.extractTreeDropData)(dataTransferItem);
                            editors.push(...treeDropData.map(editor => ({ ...editor, options: { ...editor.options, pinned: true, index: targetIndex } })));
                        }
                    }
                    this.editorService.openEditors(editors, this.group, { validateTrust: true });
                }
                this.treeItemsTransfer.clearData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
            }
            // Check for URI transfer
            else {
                const dropHandler = this.instantiationService.createInstance(dnd_1.ResourcesDropHandler, { allowWorkspaceOpen: false });
                dropHandler.handleDrop(e, () => this.group, () => this.group.focus(), targetIndex);
            }
        }
        isMoveOperation(e, sourceGroup, sourceEditor) {
            if (sourceEditor?.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
                return true; // Singleton editors cannot be split
            }
            const isCopy = (e.ctrlKey && !platform_1.isMacintosh) || (e.altKey && platform_1.isMacintosh);
            return !isCopy || sourceGroup === this.group.id;
        }
        dispose() {
            super.dispose();
            this.tabDisposables = (0, lifecycle_1.dispose)(this.tabDisposables);
        }
    };
    exports.MultiEditorTabsControl = MultiEditorTabsControl;
    exports.MultiEditorTabsControl = MultiEditorTabsControl = MultiEditorTabsControl_1 = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, notification_1.INotificationService),
        __param(8, actions_1.IMenuService),
        __param(9, quickInput_1.IQuickInputService),
        __param(10, themeService_1.IThemeService),
        __param(11, editorService_1.IEditorService),
        __param(12, pathService_1.IPathService),
        __param(13, editorGroupsService_1.IEditorGroupsService),
        __param(14, treeViewsDndService_1.ITreeViewsDnDService),
        __param(15, editorResolverService_1.IEditorResolverService)
    ], MultiEditorTabsControl);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        // Add bottom border to tabs when wrapping
        const borderColor = theme.getColor(theme_1.TAB_BORDER);
        if (borderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title > .tabs-and-actions-container.wrapping .tabs-container > .tab {
				border-bottom: 1px solid ${borderColor};
			}
		`);
        }
        // Styling with Outline color (e.g. high contrast theme)
        const activeContrastBorderColor = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (activeContrastBorderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active,
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:hover  {
				outline: 1px solid;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:focus {
				outline-style: dashed;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active {
				outline: 1px dotted;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				outline: 1px dashed;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active:hover > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.dirty > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.sticky > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-actions .action-label {
				opacity: 1 !important;
			}
		`);
        }
        // High Contrast Border Color for Editor Actions
        const contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
        if (contrastBorderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions {
				outline: 1px solid ${contrastBorderColor}
			}
		`);
        }
        // Hover Background
        const tabHoverBackground = theme.getColor(theme_1.TAB_HOVER_BACKGROUND);
        if (tabHoverBackground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover  {
				background-color: ${tabHoverBackground} !important;
			}
		`);
        }
        const tabUnfocusedHoverBackground = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_BACKGROUND);
        if (tabUnfocusedHoverBackground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				background-color: ${tabUnfocusedHoverBackground} !important;
			}
		`);
        }
        // Hover Foreground
        const tabHoverForeground = theme.getColor(theme_1.TAB_HOVER_FOREGROUND);
        if (tabHoverForeground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover  {
				color: ${tabHoverForeground} !important;
			}
		`);
        }
        const tabUnfocusedHoverForeground = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_FOREGROUND);
        if (tabUnfocusedHoverForeground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				color: ${tabUnfocusedHoverForeground} !important;
			}
		`);
        }
        // Hover Border
        //
        // Unfortunately we need to copy a lot of CSS over from the
        // multiEditorTabsControl.css because we want to reuse the same
        // styles we already have for the normal bottom-border.
        const tabHoverBorder = theme.getColor(theme_1.TAB_HOVER_BORDER);
        if (tabHoverBorder) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover > .tab-border-bottom-container {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabHoverBorder};
			}
		`);
        }
        const tabUnfocusedHoverBorder = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_BORDER);
        if (tabUnfocusedHoverBorder) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-border-bottom-container  {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabUnfocusedHoverBorder};
			}
		`);
        }
        // Fade out styles via linear gradient (when tabs are set to shrink or fixed)
        // But not when:
        // - in high contrast theme
        // - if we have a contrast border (which draws an outline - https://github.com/microsoft/vscode/issues/109117)
        // - on Safari (https://github.com/microsoft/vscode/issues/108996)
        if (!(0, theme_2.isHighContrast)(theme.type) && !browser_1.isSafari && !activeContrastBorderColor) {
            const workbenchBackground = (0, theme_1.WORKBENCH_BACKGROUND)(theme);
            const editorBackgroundColor = theme.getColor(colorRegistry_1.editorBackground);
            const editorGroupHeaderTabsBackground = theme.getColor(theme_1.EDITOR_GROUP_HEADER_TABS_BACKGROUND);
            const editorDragAndDropBackground = theme.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND);
            let adjustedTabBackground;
            if (editorGroupHeaderTabsBackground && editorBackgroundColor) {
                adjustedTabBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorBackgroundColor, workbenchBackground);
            }
            let adjustedTabDragBackground;
            if (editorGroupHeaderTabsBackground && editorBackgroundColor && editorDragAndDropBackground && editorBackgroundColor) {
                adjustedTabDragBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorDragAndDropBackground, editorBackgroundColor, workbenchBackground);
            }
            // Adjust gradient for focused and unfocused hover background
            const makeTabHoverBackgroundRule = (color, colorDrag, hasFocus = false) => `
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${color}, transparent) !important;
			}

			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? '.active' : ''} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${colorDrag}, transparent) !important;
			}
		`;
            // Adjust gradient for (focused) hover background
            if (tabHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabHoverBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabHoverBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag, true));
            }
            // Adjust gradient for unfocused hover background
            if (tabUnfocusedHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedHoverBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedHoverBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag));
            }
            // Adjust gradient for drag and drop background
            if (editorDragAndDropBackground && adjustedTabDragBackground) {
                const adjustedColorDrag = editorDragAndDropBackground.flatten(adjustedTabDragBackground);
                collector.addRule(`
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${adjustedColorDrag}, transparent) !important;
				}
		`);
            }
            const makeTabBackgroundRule = (color, colorDrag, focused, active) => `
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-shrink${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-fixed${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${color}, transparent);
				}

				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-shrink${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? '.active' : ':not(.active)'} > .title .tabs-container > .tab.sizing-fixed${active ? '.active' : ''}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${colorDrag}, transparent);
				}
		`;
            // Adjust gradient for focused active tab background
            const tabActiveBackground = theme.getColor(theme_1.TAB_ACTIVE_BACKGROUND);
            if (tabActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabActiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabActiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, true));
            }
            // Adjust gradient for unfocused active tab background
            const tabUnfocusedActiveBackground = theme.getColor(theme_1.TAB_UNFOCUSED_ACTIVE_BACKGROUND);
            if (tabUnfocusedActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedActiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedActiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, true));
            }
            // Adjust gradient for focused inactive tab background
            const tabInactiveBackground = theme.getColor(theme_1.TAB_INACTIVE_BACKGROUND);
            if (tabInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabInactiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabInactiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, false));
            }
            // Adjust gradient for unfocused inactive tab background
            const tabUnfocusedInactiveBackground = theme.getColor(theme_1.TAB_UNFOCUSED_INACTIVE_BACKGROUND);
            if (tabUnfocusedInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedInactiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedInactiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, false));
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlFZGl0b3JUYWJzQ29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9tdWx0aUVkaXRvclRhYnNDb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpRnpGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEscUNBQWlCOztpQkFFcEMsb0JBQWUsR0FBRztZQUN6QyxPQUFPLEVBQUUsQ0FBVTtZQUNuQixLQUFLLEVBQUUsRUFBVztTQUNsQixBQUhzQyxDQUdyQztpQkFFc0IsY0FBUyxHQUFHO1lBQ25DLE9BQU8sRUFBRSxFQUFXO1lBQ3BCLE1BQU0sRUFBRSxFQUFXO1lBQ25CLEdBQUcsRUFBRSxHQUFZO1NBQ2pCLEFBSmdDLENBSS9CO2lCQUVzQixpQ0FBNEIsR0FBRyxJQUFJLEFBQVAsQ0FBUTtpQkFFcEMsZ0NBQTJCLEdBQUcsR0FBRyxBQUFOLENBQU87aUJBQ2xDLG1DQUE4QixHQUFHLEdBQUcsQUFBTixDQUFPO1FBZ0M3RCxZQUNDLE1BQW1CLEVBQ25CLFFBQStCLEVBQy9CLEtBQXVCLEVBQ0Ysa0JBQXVDLEVBQ3JDLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDckMsaUJBQXFDLEVBQ25DLG1CQUF5QyxFQUNqRCxXQUF5QixFQUNuQixpQkFBcUMsRUFDMUMsWUFBMkIsRUFDMUIsYUFBaUQsRUFDbkQsV0FBMEMsRUFDbEMsa0JBQXlELEVBQ3pELDJCQUFrRSxFQUNoRSxxQkFBNkM7WUFFckUsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUscUJBQXFCLENB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