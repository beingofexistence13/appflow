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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/labels", "vs/workbench/common/editor", "vs/workbench/browser/editor", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/editor/editorTabsControl", "vs/platform/quickinput/common/quickInput", "vs/base/common/lifecycle", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/map", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/dnd", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/dom", "vs/nls!vs/workbench/browser/parts/editor/multiEditorTabsControl", "vs/workbench/browser/parts/editor/editorActions", "vs/base/common/types", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/base/common/async", "vs/workbench/services/path/common/pathService", "vs/base/common/path", "vs/base/common/arrays", "vs/platform/theme/common/theme", "vs/base/browser/browser", "vs/base/common/objects", "vs/platform/editor/common/editor", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/browser/mouseEvent", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/workbench/services/editor/common/editorResolverService", "vs/css!./media/multieditortabscontrol"], function (require, exports, platform_1, labels_1, editor_1, editor_2, keyboardEvent_1, touch_1, labels_2, actionbar_1, contextView_1, instantiation_1, keybinding_1, contextkey_1, actions_1, editorTabsControl_1, quickInput_1, lifecycle_1, scrollableElement_1, map_1, themeService_1, theme_1, colorRegistry_1, dnd_1, notification_1, editorGroupsService_1, dom_1, nls_1, editorActions_1, types_1, editorService_1, resources_1, async_1, pathService_1, path_1, arrays_1, theme_2, browser_1, objects_1, editor_3, editorCommands_1, mouseEvent_1, treeViewsDndService_1, treeViewsDnd_1, editorResolverService_1) {
    "use strict";
    var $Nxb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nxb = void 0;
    let $Nxb = class $Nxb extends editorTabsControl_1.$Mxb {
        static { $Nxb_1 = this; }
        static { this.jb = {
            default: 3,
            large: 10
        }; }
        static { this.lb = {
            compact: 38,
            shrink: 80,
            fit: 120
        }; }
        static { this.mb = 1500; }
        static { this.nb = 150; }
        static { this.ob = 1.5; }
        constructor(parent, accessor, group, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, menuService, quickInputService, themeService, Ib, Jb, Kb, Lb, editorResolverService) {
            super(parent, accessor, group, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, menuService, quickInputService, themeService, editorResolverService);
            this.Ib = Ib;
            this.Jb = Jb;
            this.Kb = Kb;
            this.Lb = Lb;
            this.vb = this.B(this.M.createInstance(editorActions_1.$$vb, editorActions_1.$$vb.ID, editorActions_1.$$vb.LABEL));
            this.wb = this.B(this.M.createInstance(editorActions_1.$0vb, editorActions_1.$0vb.ID, editorActions_1.$0vb.LABEL));
            this.xb = this.B(this.M.createInstance(labels_2.$Llb, labels_2.$Klb));
            this.yb = [];
            this.Ab = [];
            this.Bb = [];
            this.Cb = {
                container: dom_1.$BO.None,
                available: dom_1.$BO.None
            };
            this.Db = this.B(new lifecycle_1.$lc());
            this.Fb = platform_1.$i ? path_1.$5d : path_1.$6d;
            this.Gb = 0;
            this.Hb = false;
            this.$b = this.B(new async_1.$Sg(() => this.ac(), 0));
            // Resolve the correct path library for the OS we are on
            // If we are connected to remote, this accounts for the
            // remote OS.
            (async () => this.Fb = await this.Jb.path)();
            // React to decorations changing for our resource labels
            this.B(this.xb.onDidChangeDecorations(() => this.Tb()));
        }
        U(parent) {
            super.U(parent);
            this.pb = parent;
            // Tabs and Actions Container (are on a single row with flex side-by-side)
            this.qb = document.createElement('div');
            this.qb.classList.add('tabs-and-actions-container');
            this.pb.appendChild(this.qb);
            // Tabs Container
            this.rb = document.createElement('div');
            this.rb.setAttribute('role', 'tablist');
            this.rb.draggable = true;
            this.rb.classList.add('tabs-container');
            this.B(touch_1.$EP.addTarget(this.rb));
            this.ub = this.B(new lifecycle_1.$jc());
            this.Pb(false);
            // Tabs Scrollbar
            this.tb = this.Nb(this.rb);
            this.qb.appendChild(this.tb.getDomNode());
            // Tabs Container listeners
            this.Sb(this.rb, this.tb);
            // Editor Toolbar Container
            this.sb = document.createElement('div');
            this.sb.classList.add('editor-actions');
            this.qb.appendChild(this.sb);
            // Editor Actions Toolbar
            this.W(this.sb);
        }
        Nb(scrollable) {
            const tabsScrollbar = this.B(new scrollableElement_1.$SP(scrollable, {
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                horizontalScrollbarSize: this.Rb(),
                vertical: 2 /* ScrollbarVisibility.Hidden */,
                scrollYToX: true,
                useShadows: false
            }));
            this.B(tabsScrollbar.onScroll(e => {
                if (e.scrollLeftChanged) {
                    scrollable.scrollLeft = e.scrollLeft;
                }
            }));
            return tabsScrollbar;
        }
        Ob() {
            this.tb?.updateOptions({
                horizontalScrollbarSize: this.Rb()
            });
        }
        Pb(fromEvent) {
            const [tabsContainer, tabSizingFixedDisposables] = (0, types_1.$vf)(this.rb, this.ub);
            tabSizingFixedDisposables.clear();
            const options = this.I.partOptions;
            if (options.tabSizing === 'fixed') {
                tabsContainer.style.setProperty('--tab-sizing-fixed-min-width', `${options.tabSizingFixedMinWidth}px`);
                tabsContainer.style.setProperty('--tab-sizing-fixed-max-width', `${options.tabSizingFixedMaxWidth}px`);
                // For https://github.com/microsoft/vscode/issues/40290 we want to
                // preserve the current tab widths as long as the mouse is over the
                // tabs so that you can quickly close them via mouse click. For that
                // we track mouse movements over the tabs container.
                tabSizingFixedDisposables.add((0, dom_1.$nO)(tabsContainer, dom_1.$3O.MOUSE_ENTER, () => {
                    this.Hb = true;
                }));
                tabSizingFixedDisposables.add((0, dom_1.$nO)(tabsContainer, dom_1.$3O.MOUSE_LEAVE, () => {
                    this.Hb = false;
                    this.Qb(false);
                }));
            }
            else if (fromEvent) {
                tabsContainer.style.removeProperty('--tab-sizing-fixed-min-width');
                tabsContainer.style.removeProperty('--tab-sizing-fixed-max-width');
                this.Qb(false);
            }
        }
        Qb(fixed) {
            this.bc((editor, index, tabContainer) => {
                if (fixed) {
                    const { width } = tabContainer.getBoundingClientRect();
                    tabContainer.style.setProperty('--tab-sizing-current-width', `${width}px`);
                }
                else {
                    tabContainer.style.removeProperty('--tab-sizing-current-width');
                }
            });
        }
        Rb() {
            if (this.I.partOptions.titleScrollbarSizing !== 'large') {
                return $Nxb_1.jb.default;
            }
            return $Nxb_1.jb.large;
        }
        Sb(tabsContainer, tabsScrollbar) {
            // Group dragging
            this.cb(tabsContainer);
            // Forward scrolling inside the container to our custom scrollbar
            this.B((0, dom_1.$nO)(tabsContainer, dom_1.$3O.SCROLL, () => {
                if (tabsContainer.classList.contains('scroll')) {
                    tabsScrollbar.setScrollPosition({
                        scrollLeft: tabsContainer.scrollLeft // during DND the container gets scrolled so we need to update the custom scrollbar
                    });
                }
            }));
            // New file when double-clicking on tabs container (but not tabs)
            for (const eventType of [touch_1.EventType.Tap, dom_1.$3O.DBLCLICK]) {
                this.B((0, dom_1.$nO)(tabsContainer, eventType, (e) => {
                    if (eventType === dom_1.$3O.DBLCLICK) {
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
                    dom_1.$5O.stop(e);
                    this.Ib.openEditor({
                        resource: undefined,
                        options: {
                            pinned: true,
                            index: this.J.count,
                            override: editor_1.$HE.id
                        }
                    }, this.J.id);
                }));
            }
            // Prevent auto-scrolling (https://github.com/microsoft/vscode/issues/16690)
            this.B((0, dom_1.$nO)(tabsContainer, dom_1.$3O.MOUSE_DOWN, e => {
                if (e.button === 1) {
                    e.preventDefault();
                }
            }));
            // Drop support
            this.B(new dom_1.$zP(tabsContainer, {
                onDragEnter: e => {
                    // Always enable support to scroll while dragging
                    tabsContainer.classList.add('scroll');
                    // Return if the target is not on the tabs container
                    if (e.target !== tabsContainer) {
                        this.hc(tabsContainer, false); // fixes https://github.com/microsoft/vscode/issues/52093
                        return;
                    }
                    // Return if transfer is unsupported
                    if (!this.gc(e)) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    // Return if dragged editor is last tab because then this is a no-op
                    let isLocalDragAndDrop = false;
                    if (this.a.hasData(dnd_1.$reb.prototype)) {
                        isLocalDragAndDrop = true;
                        const data = this.a.getData(dnd_1.$reb.prototype);
                        if (Array.isArray(data)) {
                            const localDraggedEditor = data[0].identifier;
                            if (this.J.id === localDraggedEditor.groupId && this.J.getIndexOfEditor(localDraggedEditor.editor) === this.J.count - 1) {
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
                    this.hc(tabsContainer, true);
                },
                onDragLeave: e => {
                    this.hc(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                },
                onDragEnd: e => {
                    this.hc(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                },
                onDrop: e => {
                    this.hc(tabsContainer, false);
                    tabsContainer.classList.remove('scroll');
                    if (e.target === tabsContainer) {
                        this.Dc(e, this.J.count, tabsContainer);
                    }
                }
            }));
            // Mouse-wheel support to switch to tabs optionally
            this.B((0, dom_1.$nO)(tabsContainer, dom_1.$3O.MOUSE_WHEEL, (e) => {
                const activeEditor = this.J.activeEditor;
                if (!activeEditor || this.J.count < 2) {
                    return; // need at least 2 open editors
                }
                // Shift-key enables or disables this behaviour depending on the setting
                if (this.I.partOptions.scrollToSwitchTabs === true) {
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
                if (now - this.Gb < $Nxb_1.nb - 2 * (Math.abs(e.deltaX) + Math.abs(e.deltaY))) {
                    return;
                }
                this.Gb = now;
                // Figure out scrolling direction but ignore it if too subtle
                let tabSwitchDirection;
                if (e.deltaX + e.deltaY < -$Nxb_1.ob) {
                    tabSwitchDirection = -1;
                }
                else if (e.deltaX + e.deltaY > $Nxb_1.ob) {
                    tabSwitchDirection = 1;
                }
                else {
                    return;
                }
                const nextEditor = this.J.getEditorByIndex(this.J.getIndexOfEditor(activeEditor) + tabSwitchDirection);
                if (!nextEditor) {
                    return;
                }
                // Open it
                this.J.openEditor(nextEditor);
                // Disable normal scrolling, opening the editor will already reveal it properly
                dom_1.$5O.stop(e, true);
            }));
            // Context menu
            const showContextMenu = (e) => {
                dom_1.$5O.stop(e);
                // Find target anchor
                let anchor = tabsContainer;
                if (e instanceof MouseEvent) {
                    anchor = new mouseEvent_1.$eO(e);
                }
                // Show it
                this.L.showContextMenu({
                    getAnchor: () => anchor,
                    menuId: actions_1.$Ru.EditorTabsBarContext,
                    contextKeyService: this.N,
                    menuActionOptions: { shouldForwardArgs: true },
                    getActionsContext: () => ({ groupId: this.J.id }),
                    getKeyBinding: action => this.fb(action),
                    onHide: () => this.J.focus()
                });
            };
            this.B((0, dom_1.$nO)(tabsContainer, touch_1.EventType.Contextmenu, e => showContextMenu(e)));
            this.B((0, dom_1.$nO)(tabsContainer, dom_1.$3O.CONTEXT_MENU, e => showContextMenu(e)));
        }
        Tb() {
            // A change to decorations potentially has an impact on the size of tabs
            // so we need to trigger a layout in that case to adjust things
            this.layout(this.Cb);
        }
        Y() {
            super.Y();
            // Changing the actions in the toolbar can have an impact on the size of the
            // tab container, so we need to layout the tabs to make sure the active is visible
            this.layout(this.Cb);
        }
        openEditor(editor) {
            return this.Vb();
        }
        openEditors(editors) {
            return this.Vb();
        }
        Vb() {
            // Create tabs as needed
            const [tabsContainer, tabsScrollbar] = (0, types_1.$vf)(this.rb, this.tb);
            for (let i = tabsContainer.children.length; i < this.J.count; i++) {
                tabsContainer.appendChild(this.ec(i, tabsContainer, tabsScrollbar));
            }
            // Make sure to recompute tab labels and detect
            // if a label change occurred that requires a
            // redraw of tabs.
            const activeEditorChanged = this.Wb();
            const oldActiveTabLabel = this.zb;
            const oldTabLabelsLength = this.yb.length;
            this.ic();
            // Redraw and update in these cases
            let didChange = false;
            if (activeEditorChanged || // active editor changed
                oldTabLabelsLength !== this.yb.length || // number of tabs changed
                !this.Xb(oldActiveTabLabel, this.zb) // active editor label changed
            ) {
                this.lc({ forceRevealActiveTab: true });
                didChange = true;
            }
            // Otherwise only layout for revealing
            else {
                this.layout(this.Cb, { forceRevealActiveTab: true });
            }
            return didChange;
        }
        Wb() {
            if (!this.zb?.editor && this.J.activeEditor || // active editor changed from null => editor
                this.zb?.editor && !this.J.activeEditor || // active editor changed from editor => null
                (!this.zb?.editor || !this.J.isActive(this.zb.editor)) // active editor changed from editorA => editorB
            ) {
                return true;
            }
            return false;
        }
        Xb(labelA, labelB) {
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
            if (this.Hb && this.I.partOptions.tabSizing === 'fixed') {
                const closingLastTab = this.J.isLast(editor);
                this.Qb(!closingLastTab);
            }
        }
        closeEditor(editor) {
            this.Yb();
        }
        closeEditors(editors) {
            this.Yb();
        }
        Yb() {
            // There are tabs to show
            if (this.J.activeEditor) {
                // Remove tabs that got closed
                const tabsContainer = (0, types_1.$uf)(this.rb);
                while (tabsContainer.children.length > this.J.count) {
                    // Remove one tab from container (must be the last to keep indexes in order!)
                    tabsContainer.lastChild?.remove();
                    // Remove associated tab label and widget
                    (0, lifecycle_1.$fc)(this.Bb.pop());
                }
                // A removal of a label requires to recompute all labels
                this.ic();
                // Redraw all tabs
                this.lc({ forceRevealActiveTab: true });
            }
            // No tabs to show
            else {
                if (this.rb) {
                    (0, dom_1.$lO)(this.rb);
                }
                this.Bb = (0, lifecycle_1.$fc)(this.Bb);
                this.xb.clear();
                this.yb = [];
                this.zb = undefined;
                this.Ab = [];
                this.bb();
            }
        }
        moveEditor(editor, fromIndex, targetIndex) {
            // Move the editor label
            const editorLabel = this.yb[fromIndex];
            this.yb.splice(fromIndex, 1);
            this.yb.splice(targetIndex, 0, editorLabel);
            // Redraw tabs in the range of the move
            this.bc((editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.mc(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
            }, Math.min(fromIndex, targetIndex), // from: smallest of fromIndex/targetIndex
            Math.max(fromIndex, targetIndex) //   to: largest of fromIndex/targetIndex
            );
            // Moving an editor requires a layout to keep the active editor visible
            this.layout(this.Cb, { forceRevealActiveTab: true });
        }
        pinEditor(editor) {
            this.cc(editor, (editor, index, tabContainer, tabLabelWidget, tabLabel) => this.nc(editor, index, tabContainer, tabLabelWidget, tabLabel));
        }
        stickEditor(editor) {
            this.Zb(editor);
        }
        unstickEditor(editor) {
            this.Zb(editor);
        }
        Zb(editor) {
            // Update tab
            this.cc(editor, (editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.mc(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar));
            // Sticky change has an impact on each tab's border because
            // it potentially moves the border to the last pinned tab
            this.bc((editor, index, tabContainer, tabLabelWidget, tabLabel) => {
                this.rc(index, tabContainer);
            });
            // A change to the sticky state requires a layout to keep the active editor visible
            this.layout(this.Cb, { forceRevealActiveTab: true });
        }
        setActive(isGroupActive) {
            // Activity has an impact on each tab's active indication
            this.bc((editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.oc(isGroupActive, editor, tabContainer, tabActionBar);
            });
            // Activity has an impact on the toolbar, so we need to update and layout
            this.Y();
            this.layout(this.Cb, { forceRevealActiveTab: true });
        }
        updateEditorLabel(editor) {
            // Update all labels to account for changes to tab labels
            // Since this method may be called a lot of times from
            // individual editors, we collect all those requests and
            // then run the update once because we have to update
            // all opened tabs in the group at once.
            this.$b.schedule();
        }
        ac() {
            // A change to a label requires to recompute all labels
            this.ic();
            // As such we need to redraw each label
            this.bc((editor, index, tabContainer, tabLabelWidget, tabLabel) => {
                this.nc(editor, index, tabContainer, tabLabelWidget, tabLabel);
            });
            // A change to a label requires a layout to keep the active editor visible
            this.layout(this.Cb);
        }
        updateEditorDirty(editor) {
            this.cc(editor, (editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.oc(this.I.activeGroup === this.J, editor, tabContainer, tabActionBar));
        }
        updateOptions(oldOptions, newOptions) {
            super.updateOptions(oldOptions, newOptions);
            // A change to a label format options requires to recompute all labels
            if (oldOptions.labelFormat !== newOptions.labelFormat) {
                this.ic();
            }
            // Update tabs scrollbar sizing
            if (oldOptions.titleScrollbarSizing !== newOptions.titleScrollbarSizing) {
                this.Ob();
            }
            // Update tabs sizing
            if (oldOptions.tabSizingFixedMinWidth !== newOptions.tabSizingFixedMinWidth ||
                oldOptions.tabSizingFixedMaxWidth !== newOptions.tabSizingFixedMaxWidth ||
                oldOptions.tabSizing !== newOptions.tabSizing) {
                this.Pb(true);
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
                !(0, objects_1.$Zm)(oldOptions.decorations, newOptions.decorations)) {
                this.lc();
            }
        }
        updateStyles() {
            this.lc();
        }
        bc(fn, fromIndex, toIndex) {
            this.J.editors.forEach((editor, index) => {
                if (typeof fromIndex === 'number' && fromIndex > index) {
                    return; // do nothing if we are not yet at `fromIndex`
                }
                if (typeof toIndex === 'number' && toIndex < index) {
                    return; // do nothing if we are beyond `toIndex`
                }
                this.dc(index, editor, fn);
            });
        }
        cc(editor, fn) {
            this.dc(this.J.getIndexOfEditor(editor), editor, fn);
        }
        dc(index, editor, fn) {
            const tabsContainer = (0, types_1.$uf)(this.rb);
            const tabContainer = tabsContainer.children[index];
            const tabResourceLabel = this.xb.get(index);
            const tabLabel = this.yb[index];
            const tabActionBar = this.Ab[index];
            if (tabContainer && tabResourceLabel && tabLabel) {
                fn(editor, index, tabContainer, tabResourceLabel, tabLabel, tabActionBar);
            }
        }
        ec(index, tabsContainer, tabsScrollbar) {
            // Tab Container
            const tabContainer = document.createElement('div');
            tabContainer.draggable = true;
            tabContainer.setAttribute('role', 'tab');
            tabContainer.classList.add('tab');
            // Gesture Support
            this.B(touch_1.$EP.addTarget(tabContainer));
            // Tab Border Top
            const tabBorderTopContainer = document.createElement('div');
            tabBorderTopContainer.classList.add('tab-border-top-container');
            tabContainer.appendChild(tabBorderTopContainer);
            // Tab Editor Label
            const editorLabel = this.xb.create(tabContainer);
            // Tab Actions
            const tabActionsContainer = document.createElement('div');
            tabActionsContainer.classList.add('tab-actions');
            tabContainer.appendChild(tabActionsContainer);
            const tabActionRunner = new editorTabsControl_1.$Lxb({ groupId: this.J.id, editorIndex: index });
            const tabActionBar = new actionbar_1.$1P(tabActionsContainer, { ariaLabel: (0, nls_1.localize)(0, null), actionRunner: tabActionRunner });
            const tabActionListener = tabActionBar.onWillRun(e => {
                if (e.action.id === this.vb.id) {
                    this.Bc();
                }
            });
            const tabActionBarDisposable = (0, lifecycle_1.$hc)(tabActionBar, tabActionListener, (0, lifecycle_1.$ic)((0, arrays_1.$Sb)(this.Ab, tabActionBar)));
            // Tab Border Bottom
            const tabBorderBottomContainer = document.createElement('div');
            tabBorderBottomContainer.classList.add('tab-border-bottom-container');
            tabContainer.appendChild(tabBorderBottomContainer);
            // Eventing
            const eventsDisposable = this.fc(tabContainer, index, tabsContainer, tabsScrollbar);
            this.Bb.push((0, lifecycle_1.$hc)(eventsDisposable, tabActionBarDisposable, tabActionRunner, editorLabel));
            return tabContainer;
        }
        fc(tab, index, tabsContainer, tabsScrollbar) {
            const disposables = new lifecycle_1.$jc();
            const handleClickOrTouch = (e, preserveFocus) => {
                tab.blur(); // prevent flicker of focus outline on tab until editor got focus
                if (e instanceof MouseEvent && (e.button !== 0 /* middle/right mouse button */ || (platform_1.$j && e.ctrlKey /* macOS context menu */))) {
                    if (e.button === 1) {
                        e.preventDefault(); // required to prevent auto-scrolling (https://github.com/microsoft/vscode/issues/16690)
                    }
                    return undefined;
                }
                if (this.Cc(e)) {
                    return; // not when clicking on actions
                }
                // Open tabs editor
                const editor = this.J.getEditorByIndex(index);
                if (editor) {
                    // Even if focus is preserved make sure to activate the group.
                    this.J.openEditor(editor, { preserveFocus, activation: editor_3.EditorActivation.ACTIVATE });
                }
                return undefined;
            };
            const showContextMenu = (e) => {
                dom_1.$5O.stop(e);
                const editor = this.J.getEditorByIndex(index);
                if (editor) {
                    this.eb(editor, e, tab);
                }
            };
            // Open on Click / Touch
            disposables.add((0, dom_1.$nO)(tab, dom_1.$3O.MOUSE_DOWN, e => handleClickOrTouch(e, false)));
            disposables.add((0, dom_1.$nO)(tab, touch_1.EventType.Tap, (e) => handleClickOrTouch(e, true))); // Preserve focus on touch #125470
            // Touch Scroll Support
            disposables.add((0, dom_1.$nO)(tab, touch_1.EventType.Change, (e) => {
                tabsScrollbar.setScrollPosition({ scrollLeft: tabsScrollbar.getScrollPosition().scrollLeft - e.translationX });
            }));
            // Prevent flicker of focus outline on tab until editor got focus
            disposables.add((0, dom_1.$nO)(tab, dom_1.$3O.MOUSE_UP, e => {
                dom_1.$5O.stop(e);
                tab.blur();
            }));
            // Close on mouse middle click
            disposables.add((0, dom_1.$nO)(tab, dom_1.$3O.AUXCLICK, e => {
                if (e.button === 1 /* Middle Button*/) {
                    dom_1.$5O.stop(e, true /* for https://github.com/microsoft/vscode/issues/56715 */);
                    const editor = this.J.getEditorByIndex(index);
                    if (editor && (0, editor_1.$2E)(this.J, editor, editor_1.EditorCloseMethod.MOUSE, this.I.partOptions)) {
                        return;
                    }
                    this.Bc();
                    this.vb.run({ groupId: this.J.id, editorIndex: index });
                }
            }));
            // Context menu on Shift+F10
            disposables.add((0, dom_1.$nO)(tab, dom_1.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.shiftKey && event.keyCode === 68 /* KeyCode.F10 */) {
                    showContextMenu(e);
                }
            }));
            // Context menu on touch context menu gesture
            disposables.add((0, dom_1.$nO)(tab, touch_1.EventType.Contextmenu, (e) => {
                showContextMenu(e);
            }));
            // Keyboard accessibility
            disposables.add((0, dom_1.$nO)(tab, dom_1.$3O.KEY_UP, e => {
                const event = new keyboardEvent_1.$jO(e);
                let handled = false;
                // Run action on Enter/Space
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    handled = true;
                    const editor = this.J.getEditorByIndex(index);
                    if (editor) {
                        this.J.openEditor(editor);
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
                        targetIndex = this.J.count - 1;
                    }
                    const target = this.J.getEditorByIndex(targetIndex);
                    if (target) {
                        handled = true;
                        this.J.openEditor(target, { preserveFocus: true });
                        tabsContainer.childNodes[targetIndex].focus();
                    }
                }
                if (handled) {
                    dom_1.$5O.stop(e, true);
                }
                // moving in the tabs container can have an impact on scrolling position, so we need to update the custom scrollbar
                tabsScrollbar.setScrollPosition({
                    scrollLeft: tabsContainer.scrollLeft
                });
            }));
            // Double click: either pin or toggle maximized
            for (const eventType of [touch_1.EventType.Tap, dom_1.$3O.DBLCLICK]) {
                disposables.add((0, dom_1.$nO)(tab, eventType, (e) => {
                    if (eventType === dom_1.$3O.DBLCLICK) {
                        dom_1.$5O.stop(e);
                    }
                    else if (e.tapCount !== 2) {
                        return; // ignore single taps
                    }
                    const editor = this.J.getEditorByIndex(index);
                    if (editor && this.J.isPinned(editor)) {
                        if (this.I.partOptions.doubleClickTabToToggleEditorGroupSizes) {
                            this.I.arrangeGroups(2 /* GroupsArrangement.TOGGLE */, this.J);
                        }
                    }
                    else {
                        this.J.pinEditor(editor);
                    }
                }));
            }
            // Context menu
            disposables.add((0, dom_1.$nO)(tab, dom_1.$3O.CONTEXT_MENU, e => {
                dom_1.$5O.stop(e, true);
                const editor = this.J.getEditorByIndex(index);
                if (editor) {
                    this.eb(editor, e, tab);
                }
            }, true /* use capture to fix https://github.com/microsoft/vscode/issues/19145 */));
            // Drag support
            disposables.add((0, dom_1.$nO)(tab, dom_1.$3O.DRAG_START, e => {
                const editor = this.J.getEditorByIndex(index);
                if (!editor) {
                    return;
                }
                this.a.setData([new dnd_1.$reb({ editor, groupId: this.J.id })], dnd_1.$reb.prototype);
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'copyMove';
                }
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.db([editor], e);
                // Fixes https://github.com/microsoft/vscode/issues/18733
                tab.classList.add('dragged');
                (0, dom_1.$vO)(() => tab.classList.remove('dragged'));
            }));
            // Drop support
            disposables.add(new dom_1.$zP(tab, {
                onDragEnter: e => {
                    // Update class to signal drag operation
                    tab.classList.add('dragged-over');
                    // Return if transfer is unsupported
                    if (!this.gc(e)) {
                        if (e.dataTransfer) {
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    // Return if dragged editor is the current tab dragged over
                    let isLocalDragAndDrop = false;
                    if (this.a.hasData(dnd_1.$reb.prototype)) {
                        isLocalDragAndDrop = true;
                        const data = this.a.getData(dnd_1.$reb.prototype);
                        if (Array.isArray(data)) {
                            const localDraggedEditor = data[0].identifier;
                            if (localDraggedEditor.editor === this.J.getEditorByIndex(index) && localDraggedEditor.groupId === this.J.id) {
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
                    this.hc(tab, true, index);
                },
                onDragOver: (_, dragDuration) => {
                    if (dragDuration >= $Nxb_1.mb) {
                        const draggedOverTab = this.J.getEditorByIndex(index);
                        if (draggedOverTab && this.J.activeEditor !== draggedOverTab) {
                            this.J.openEditor(draggedOverTab, { preserveFocus: true });
                        }
                    }
                },
                onDragLeave: () => {
                    tab.classList.remove('dragged-over');
                    this.hc(tab, false, index);
                },
                onDragEnd: () => {
                    tab.classList.remove('dragged-over');
                    this.hc(tab, false, index);
                    this.a.clearData(dnd_1.$reb.prototype);
                },
                onDrop: e => {
                    tab.classList.remove('dragged-over');
                    this.hc(tab, false, index);
                    this.Dc(e, index, tabsContainer);
                }
            }));
            return disposables;
        }
        gc(e) {
            if (this.b.hasData(dnd_1.$seb.prototype)) {
                const data = this.b.getData(dnd_1.$seb.prototype);
                if (Array.isArray(data)) {
                    const group = data[0];
                    if (group.identifier === this.J.id) {
                        return false; // groups cannot be dropped on group it originates from
                    }
                }
                return true;
            }
            if (this.a.hasData(dnd_1.$reb.prototype)) {
                return true; // (local) editors can always be dropped
            }
            if (e.dataTransfer && e.dataTransfer.types.length > 0) {
                return true; // optimistically allow external data (// see https://github.com/microsoft/vscode/issues/25789)
            }
            return false;
        }
        hc(element, isDND, index) {
            const isTab = (typeof index === 'number');
            const editor = typeof index === 'number' ? this.J.getEditorByIndex(index) : undefined;
            const isActiveTab = isTab && !!editor && this.J.isActive(editor);
            // Background
            const noDNDBackgroundColor = isTab ? this.z(isActiveTab ? theme_1.$_$ : theme_1.$b_) : '';
            element.style.backgroundColor = (isDND ? this.z(theme_1.$F_) : noDNDBackgroundColor) || '';
            // Outline
            const activeContrastBorderColor = this.z(colorRegistry_1.$Bv);
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
        ic() {
            const { labelFormat } = this.I.partOptions;
            const { verbosity, shortenDuplicates } = this.kc(labelFormat);
            // Build labels and descriptions for each editor
            const labels = [];
            let activeEditorIndex = -1;
            for (let i = 0; i < this.J.editors.length; i++) {
                const editor = this.J.editors[i];
                labels.push({
                    editor,
                    name: editor.getName(),
                    description: editor.getDescription(verbosity),
                    forceDescription: editor.hasCapability(64 /* EditorInputCapabilities.ForceDescription */),
                    title: editor.getTitle(2 /* Verbosity.LONG */),
                    ariaLabel: (0, editor_2.$cU)(editor, i, this.J, this.Kb.count)
                });
                if (editor === this.J.activeEditor) {
                    activeEditorIndex = i;
                }
            }
            // Shorten labels as needed
            if (shortenDuplicates) {
                this.jc(labels);
            }
            // Remember for fast lookup
            this.yb = labels;
            this.zb = labels[activeEditorIndex];
        }
        jc(labels) {
            // Gather duplicate titles, while filtering out invalid descriptions
            const mapNameToDuplicates = new Map();
            for (const label of labels) {
                if (typeof label.description === 'string') {
                    (0, map_1.$wi)(mapNameToDuplicates, label.name, []).push(label);
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
                    (0, map_1.$wi)(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
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
                        (0, map_1.$wi)(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
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
                const shortenedDescriptions = (0, labels_1.$iA)(descriptions, this.Fb.sep);
                descriptions.forEach((description, index) => {
                    for (const label of mapDescriptionToDuplicates.get(description) || []) {
                        label.description = shortenedDescriptions[index];
                    }
                });
            }
        }
        kc(value) {
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
        lc(options) {
            // Border below tabs if any with explicit high contrast support
            if (this.qb) {
                let tabsContainerBorderColor = this.z(theme_1.$B_);
                if (!tabsContainerBorderColor && (0, theme_2.$ev)(this.h.type)) {
                    tabsContainerBorderColor = this.z(theme_1.$l_) || this.z(colorRegistry_1.$Av);
                }
                if (tabsContainerBorderColor) {
                    this.qb.classList.add('tabs-border-bottom');
                    this.qb.style.setProperty('--tabs-border-bottom-color', tabsContainerBorderColor.toString());
                }
                else {
                    this.qb.classList.remove('tabs-border-bottom');
                    this.qb.style.removeProperty('--tabs-border-bottom-color');
                }
            }
            // For each tab
            this.bc((editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
                this.mc(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
            });
            // Update Editor Actions Toolbar
            this.Y();
            // Ensure the active tab is always revealed
            this.layout(this.Cb, options);
        }
        mc(editor, index, tabContainer, tabLabelWidget, tabLabel, tabActionBar) {
            const isTabSticky = this.J.isSticky(index);
            const options = this.I.partOptions;
            // Label
            this.nc(editor, index, tabContainer, tabLabelWidget, tabLabel);
            // Action
            const tabAction = isTabSticky ? this.wb : this.vb;
            if (!tabActionBar.hasAction(tabAction)) {
                if (!tabActionBar.isEmpty()) {
                    tabActionBar.clear();
                }
                tabActionBar.push(tabAction, { icon: true, label: false, keybinding: this.gb(tabAction) });
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
                        stickyTabWidth = $Nxb_1.lb.compact;
                        break;
                    case 'shrink':
                        stickyTabWidth = $Nxb_1.lb.shrink;
                        break;
                }
                tabContainer.style.left = `${index * stickyTabWidth}px`;
            }
            else {
                tabContainer.style.left = 'auto';
            }
            // Borders / outline
            this.rc(index, tabContainer);
            // Active / dirty state
            this.oc(this.I.activeGroup === this.J, editor, tabContainer, tabActionBar);
        }
        nc(editor, index, tabContainer, tabLabelWidget, tabLabel) {
            const options = this.I.partOptions;
            // Unless tabs are sticky compact, show the full label and description
            // Sticky compact tabs will only show an icon if icons are enabled
            // or their first character of the name otherwise
            let name;
            let forceLabel = false;
            let fileDecorationBadges = Boolean(options.decorations?.badges);
            let description;
            if (options.pinnedTabSizing === 'compact' && this.J.isSticky(index)) {
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
            tabLabelWidget.setResource({ name, description, resource: editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }) }, {
                title,
                extraClasses: (0, arrays_1.$Fb)(['tab-label', fileDecorationBadges ? 'tab-label-has-badge' : undefined].concat(editor.getLabelExtraClasses())),
                italic: !this.J.isPinned(editor),
                forceLabel,
                fileDecorations: {
                    colors: Boolean(options.decorations?.colors),
                    badges: fileDecorationBadges
                }
            });
            // Tests helper
            const resource = editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource) {
                tabContainer.setAttribute('data-resource-name', (0, resources_1.$eg)(resource));
            }
            else {
                tabContainer.removeAttribute('data-resource-name');
            }
        }
        oc(isGroupActive, editor, tabContainer, tabActionBar) {
            const isTabActive = this.J.isActive(editor);
            const hasModifiedBorderTop = this.qc(isGroupActive, isTabActive, editor, tabContainer);
            this.pc(isGroupActive, !hasModifiedBorderTop, editor, tabContainer, tabActionBar);
        }
        pc(isGroupActive, allowBorderTop, editor, tabContainer, tabActionBar) {
            // Tab is active
            if (this.J.isActive(editor)) {
                // Container
                tabContainer.classList.add('active');
                tabContainer.setAttribute('aria-selected', 'true');
                tabContainer.tabIndex = 0; // Only active tab can be focused into
                tabContainer.style.backgroundColor = this.z(isGroupActive ? theme_1.$_$ : theme_1.$a_) || '';
                const activeTabBorderColorBottom = this.z(isGroupActive ? theme_1.$n_ : theme_1.$o_);
                if (activeTabBorderColorBottom) {
                    tabContainer.classList.add('tab-border-bottom');
                    tabContainer.style.setProperty('--tab-border-bottom-color', activeTabBorderColorBottom.toString());
                }
                else {
                    tabContainer.classList.remove('tab-border-bottom');
                    tabContainer.style.removeProperty('--tab-border-bottom-color');
                }
                const activeTabBorderColorTop = allowBorderTop ? this.z(isGroupActive ? theme_1.$p_ : theme_1.$q_) : undefined;
                if (activeTabBorderColorTop) {
                    tabContainer.classList.add('tab-border-top');
                    tabContainer.style.setProperty('--tab-border-top-color', activeTabBorderColorTop.toString());
                }
                else {
                    tabContainer.classList.remove('tab-border-top');
                    tabContainer.style.removeProperty('--tab-border-top-color');
                }
                // Label
                tabContainer.style.color = this.z(isGroupActive ? theme_1.$d_ : theme_1.$f_) || '';
                // Actions
                tabActionBar.setFocusable(true);
            }
            // Tab is inactive
            else {
                // Container
                tabContainer.classList.remove('active');
                tabContainer.setAttribute('aria-selected', 'false');
                tabContainer.tabIndex = -1; // Only active tab can be focused into
                tabContainer.style.backgroundColor = this.z(isGroupActive ? theme_1.$b_ : theme_1.$c_) || '';
                tabContainer.style.boxShadow = '';
                // Label
                tabContainer.style.color = this.z(isGroupActive ? theme_1.$e_ : theme_1.$g_) || '';
                // Actions
                tabActionBar.setFocusable(false);
            }
        }
        qc(isGroupActive, isTabActive, editor, tabContainer) {
            let hasModifiedBorderColor = false;
            // Tab: dirty (unless saving)
            if (editor.isDirty() && !editor.isSaving()) {
                tabContainer.classList.add('dirty');
                // Highlight modified tabs with a border if configured
                if (this.I.partOptions.highlightModifiedTabs) {
                    let modifiedBorderColor;
                    if (isGroupActive && isTabActive) {
                        modifiedBorderColor = this.z(theme_1.$t_);
                    }
                    else if (isGroupActive && !isTabActive) {
                        modifiedBorderColor = this.z(theme_1.$u_);
                    }
                    else if (!isGroupActive && isTabActive) {
                        modifiedBorderColor = this.z(theme_1.$v_);
                    }
                    else {
                        modifiedBorderColor = this.z(theme_1.$w_);
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
        rc(index, tabContainer) {
            const isTabSticky = this.J.isSticky(index);
            const isTabLastSticky = isTabSticky && this.J.stickyCount === index + 1;
            // Borders / Outline
            const borderRightColor = ((isTabLastSticky ? this.z(theme_1.$m_) : undefined) || this.z(theme_1.$l_) || this.z(colorRegistry_1.$Av));
            tabContainer.style.borderRight = borderRightColor ? `1px solid ${borderRightColor}` : '';
            tabContainer.style.outlineColor = this.z(colorRegistry_1.$Bv) || '';
        }
        Z(editorActions) {
            const isGroupActive = this.I.activeGroup === this.J;
            // Active: allow all actions
            if (isGroupActive) {
                return editorActions;
            }
            // Inactive: only show "Unlock" and secondary actions
            else {
                return {
                    primary: editorActions.primary.filter(action => action.id === editorCommands_1.$tub),
                    secondary: editorActions.secondary
                };
            }
        }
        getHeight() {
            // Return quickly if our used dimensions are known
            if (this.Cb.used) {
                return this.Cb.used.height;
            }
            // Otherwise compute via browser APIs
            else {
                return this.tc();
            }
        }
        tc() {
            let height;
            // Wrap: we need to ask `offsetHeight` to get
            // the real height of the title area with wrapping.
            if (this.I.partOptions.wrapTabs && this.qb?.classList.contains('wrapping')) {
                height = this.qb.offsetHeight;
            }
            else {
                height = this.hb;
            }
            return height;
        }
        layout(dimensions, options) {
            // Remember dimensions that we get
            Object.assign(this.Cb, dimensions);
            // The layout of tabs can be an expensive operation because we access DOM properties
            // that can result in the browser doing a full page layout to validate them. To buffer
            // this a little bit we try at least to schedule this work on the next animation frame.
            if (!this.Db.value) {
                const scheduledLayout = (0, dom_1.$vO)(() => {
                    this.uc(this.Cb, this.Db.value?.options /* ensure to pick up latest options */);
                    this.Db.clear();
                });
                this.Db.value = { options, dispose: () => scheduledLayout.dispose() };
            }
            // Make sure to keep options updated
            if (options?.forceRevealActiveTab) {
                this.Db.value.options = {
                    ...this.Db.value.options,
                    forceRevealActiveTab: true
                };
            }
            // First time layout: compute the dimensions and store it
            if (!this.Cb.used) {
                this.Cb.used = new dom_1.$BO(dimensions.container.width, this.tc());
            }
            return this.Cb.used;
        }
        uc(dimensions, options) {
            // Only layout if we have valid tab index and dimensions
            const activeTabAndIndex = this.J.activeEditor ? this.yc(this.J.activeEditor) : undefined;
            if (activeTabAndIndex && dimensions.container !== dom_1.$BO.None && dimensions.available !== dom_1.$BO.None) {
                // Tabs
                const [activeTab, activeIndex] = activeTabAndIndex;
                this.vc(activeTab, activeIndex, dimensions, options);
            }
            // Remember the dimensions used in the control so that we can
            // return it fast from the `layout` call without having to
            // compute it over and over again
            const oldDimension = this.Cb.used;
            const newDimension = this.Cb.used = new dom_1.$BO(dimensions.container.width, this.tc());
            // In case the height of the title control changed from before
            // (currently only possible if wrapping changed on/off), we need
            // to signal this to the outside via a `relayout` call so that
            // e.g. the editor control can be adjusted accordingly.
            if (oldDimension && oldDimension.height !== newDimension.height) {
                this.J.relayout();
            }
        }
        vc(activeTab, activeIndex, dimensions, options) {
            // Always first layout tabs with wrapping support even if wrapping
            // is disabled. The result indicates if tabs wrap and if not, we
            // need to proceed with the layout without wrapping because even
            // if wrapping is enabled in settings, there are cases where
            // wrapping is disabled (e.g. due to space constraints)
            const tabsWrapMultiLine = this.wc(dimensions);
            if (!tabsWrapMultiLine) {
                this.xc(activeTab, activeIndex, options);
            }
        }
        wc(dimensions) {
            const [tabsAndActionsContainer, tabsContainer, editorToolbarContainer, tabsScrollbar] = (0, types_1.$vf)(this.qb, this.rb, this.sb, this.tb);
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
            if (this.I.partOptions.wrapTabs) {
                const visibleTabsWidth = tabsContainer.offsetWidth;
                const allTabsWidth = tabsContainer.scrollWidth;
                const lastTabFitsWrapped = () => {
                    const lastTab = this.Ac();
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
                        (allTabsWidth === visibleTabsWidth && tabsContainer.offsetHeight === this.hb) || // if wrapping is not needed anymore
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
        xc(activeTab, activeIndex, options) {
            const [tabsContainer, tabsScrollbar] = (0, types_1.$vf)(this.rb, this.tb);
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
            if (this.J.stickyCount > 0) {
                let stickyTabWidth = 0;
                switch (this.I.partOptions.pinnedTabSizing) {
                    case 'compact':
                        stickyTabWidth = $Nxb_1.lb.compact;
                        break;
                    case 'shrink':
                        stickyTabWidth = $Nxb_1.lb.shrink;
                        break;
                }
                stickyTabsWidth = this.J.stickyCount * stickyTabWidth;
            }
            // Figure out if active tab is positioned static which has an
            // impact on whether to reveal the tab or not later
            let activeTabPositionStatic = this.I.partOptions.pinnedTabSizing !== 'normal' && this.J.isSticky(activeIndex);
            // Special case: we have sticky tabs but the available space for showing tabs
            // is little enough that we need to disable sticky tabs sticky positioning
            // so that tabs can be scrolled at naturally.
            let availableTabsContainerWidth = visibleTabsWidth - stickyTabsWidth;
            if (this.J.stickyCount > 0 && availableTabsContainerWidth < $Nxb_1.lb.fit) {
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
            if (!this.Eb) {
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
            if (this.Eb || // explicitly disabled
                typeof activeTabPosX !== 'number' || // invalid dimension
                typeof activeTabWidth !== 'number' || // invalid dimension
                activeTabPositionStatic || // static tab (sticky)
                (!dimensionsChanged && !options?.forceRevealActiveTab) // dimensions did not change and we have low layout priority (https://github.com/microsoft/vscode/issues/133631)
            ) {
                this.Eb = false;
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
        yc(editor) {
            const editorIndex = this.J.getIndexOfEditor(editor);
            const tab = this.zc(editorIndex);
            if (tab) {
                return [tab, editorIndex];
            }
            return undefined;
        }
        zc(editorIndex) {
            if (editorIndex >= 0) {
                const tabsContainer = (0, types_1.$uf)(this.rb);
                return tabsContainer.children[editorIndex];
            }
            return undefined;
        }
        Ac() {
            return this.zc(this.J.count - 1);
        }
        Bc() {
            // When closing tabs through the tab close button or gesture, the user
            // might want to rapidly close tabs in sequence and as such revealing
            // the active tab after each close would be annoying. As such we block
            // the automated revealing of the active tab once after the close is
            // triggered.
            this.Eb = true;
        }
        Cc(e) {
            let element;
            if (e instanceof MouseEvent) {
                element = (e.target || e.srcElement);
            }
            else {
                element = e.initialTarget;
            }
            return !!(0, dom_1.$QO)(element, 'action-item', 'tab');
        }
        async Dc(e, targetIndex, tabsContainer) {
            dom_1.$5O.stop(e, true);
            this.hc(tabsContainer, false);
            tabsContainer.classList.remove('scroll');
            // Check for group transfer
            if (this.b.hasData(dnd_1.$seb.prototype)) {
                const data = this.b.getData(dnd_1.$seb.prototype);
                if (Array.isArray(data)) {
                    const sourceGroup = this.I.getGroup(data[0].identifier);
                    if (sourceGroup) {
                        const mergeGroupOptions = { index: targetIndex };
                        if (!this.Ec(e, sourceGroup.id)) {
                            mergeGroupOptions.mode = 0 /* MergeGroupMode.COPY_EDITORS */;
                        }
                        this.I.mergeGroup(sourceGroup, this.J, mergeGroupOptions);
                    }
                    this.J.focus();
                    this.b.clearData(dnd_1.$seb.prototype);
                }
            }
            // Check for editor transfer
            else if (this.a.hasData(dnd_1.$reb.prototype)) {
                const data = this.a.getData(dnd_1.$reb.prototype);
                if (Array.isArray(data)) {
                    const draggedEditor = data[0].identifier;
                    const sourceGroup = this.I.getGroup(draggedEditor.groupId);
                    if (sourceGroup) {
                        // Move editor to target position and index
                        if (this.Ec(e, draggedEditor.groupId, draggedEditor.editor)) {
                            sourceGroup.moveEditor(draggedEditor.editor, this.J, { index: targetIndex });
                        }
                        // Copy editor to target position and index
                        else {
                            sourceGroup.copyEditor(draggedEditor.editor, this.J, { index: targetIndex });
                        }
                    }
                    this.J.focus();
                    this.a.clearData(dnd_1.$reb.prototype);
                }
            }
            // Check for tree items
            else if (this.c.hasData(treeViewsDnd_1.$m7.prototype)) {
                const data = this.c.getData(treeViewsDnd_1.$m7.prototype);
                if (Array.isArray(data)) {
                    const editors = [];
                    for (const id of data) {
                        const dataTransferItem = await this.Lb.removeDragOperationTransfer(id.identifier);
                        if (dataTransferItem) {
                            const treeDropData = await (0, dnd_1.$teb)(dataTransferItem);
                            editors.push(...treeDropData.map(editor => ({ ...editor, options: { ...editor.options, pinned: true, index: targetIndex } })));
                        }
                    }
                    this.Ib.openEditors(editors, this.J, { validateTrust: true });
                }
                this.c.clearData(treeViewsDnd_1.$m7.prototype);
            }
            // Check for URI transfer
            else {
                const dropHandler = this.M.createInstance(dnd_1.$ueb, { allowWorkspaceOpen: false });
                dropHandler.handleDrop(e, () => this.J, () => this.J.focus(), targetIndex);
            }
        }
        Ec(e, sourceGroup, sourceEditor) {
            if (sourceEditor?.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
                return true; // Singleton editors cannot be split
            }
            const isCopy = (e.ctrlKey && !platform_1.$j) || (e.altKey && platform_1.$j);
            return !isCopy || sourceGroup === this.J.id;
        }
        dispose() {
            super.dispose();
            this.Bb = (0, lifecycle_1.$fc)(this.Bb);
        }
    };
    exports.$Nxb = $Nxb;
    exports.$Nxb = $Nxb = $Nxb_1 = __decorate([
        __param(3, contextView_1.$WZ),
        __param(4, instantiation_1.$Ah),
        __param(5, contextkey_1.$3i),
        __param(6, keybinding_1.$2D),
        __param(7, notification_1.$Yu),
        __param(8, actions_1.$Su),
        __param(9, quickInput_1.$Gq),
        __param(10, themeService_1.$gv),
        __param(11, editorService_1.$9C),
        __param(12, pathService_1.$yJ),
        __param(13, editorGroupsService_1.$5C),
        __param(14, treeViewsDndService_1.$n7),
        __param(15, editorResolverService_1.$pbb)
    ], $Nxb);
    (0, themeService_1.$mv)((theme, collector) => {
        // Add bottom border to tabs when wrapping
        const borderColor = theme.getColor(theme_1.$l_);
        if (borderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title > .tabs-and-actions-container.wrapping .tabs-container > .tab {
				border-bottom: 1px solid ${borderColor};
			}
		`);
        }
        // Styling with Outline color (e.g. high contrast theme)
        const activeContrastBorderColor = theme.getColor(colorRegistry_1.$Bv);
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
        const contrastBorderColor = theme.getColor(colorRegistry_1.$Av);
        if (contrastBorderColor) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions {
				outline: 1px solid ${contrastBorderColor}
			}
		`);
        }
        // Hover Background
        const tabHoverBackground = theme.getColor(theme_1.$h_);
        if (tabHoverBackground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover  {
				background-color: ${tabHoverBackground} !important;
			}
		`);
        }
        const tabUnfocusedHoverBackground = theme.getColor(theme_1.$i_);
        if (tabUnfocusedHoverBackground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				background-color: ${tabUnfocusedHoverBackground} !important;
			}
		`);
        }
        // Hover Foreground
        const tabHoverForeground = theme.getColor(theme_1.$j_);
        if (tabHoverForeground) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover  {
				color: ${tabHoverForeground} !important;
			}
		`);
        }
        const tabUnfocusedHoverForeground = theme.getColor(theme_1.$k_);
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
        const tabHoverBorder = theme.getColor(theme_1.$r_);
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
        const tabUnfocusedHoverBorder = theme.getColor(theme_1.$s_);
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
        if (!(0, theme_2.$ev)(theme.type) && !browser_1.$8N && !activeContrastBorderColor) {
            const workbenchBackground = (0, theme_1.$$$)(theme);
            const editorBackgroundColor = theme.getColor(colorRegistry_1.$ww);
            const editorGroupHeaderTabsBackground = theme.getColor(theme_1.$A_);
            const editorDragAndDropBackground = theme.getColor(theme_1.$F_);
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
            const tabActiveBackground = theme.getColor(theme_1.$_$);
            if (tabActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabActiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabActiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, true));
            }
            // Adjust gradient for unfocused active tab background
            const tabUnfocusedActiveBackground = theme.getColor(theme_1.$a_);
            if (tabUnfocusedActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedActiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedActiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, true));
            }
            // Adjust gradient for focused inactive tab background
            const tabInactiveBackground = theme.getColor(theme_1.$b_);
            if (tabInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabInactiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabInactiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, false));
            }
            // Adjust gradient for unfocused inactive tab background
            const tabUnfocusedInactiveBackground = theme.getColor(theme_1.$c_);
            if (tabUnfocusedInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                const adjustedColor = tabUnfocusedInactiveBackground.flatten(adjustedTabBackground);
                const adjustedColorDrag = tabUnfocusedInactiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, false));
            }
        }
    });
});
//# sourceMappingURL=multiEditorTabsControl.js.map