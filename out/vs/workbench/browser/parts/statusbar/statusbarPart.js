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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/browser/part", "vs/base/browser/touch", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/contextview/browser/contextView", "vs/base/common/actions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/extensions", "vs/base/common/arrays", "vs/base/browser/mouseEvent", "vs/workbench/browser/actions/layoutActions", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/theme", "vs/base/common/hash", "vs/workbench/services/hover/browser/hover", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/statusbar/statusbarActions", "vs/workbench/browser/parts/statusbar/statusbarModel", "vs/workbench/browser/parts/statusbar/statusbarItem", "vs/workbench/common/contextkeys", "vs/css!./media/statusbarpart"], function (require, exports, nls_1, lifecycle_1, part_1, touch_1, instantiation_1, statusbar_1, contextView_1, actions_1, themeService_1, theme_1, workspace_1, colorRegistry_1, dom_1, storage_1, layoutService_1, extensions_1, arrays_1, mouseEvent_1, layoutActions_1, types_1, contextkey_1, theme_2, hash_1, hover_1, configuration_1, statusbarActions_1, statusbarModel_1, statusbarItem_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusbarPart = void 0;
    let StatusbarPart = class StatusbarPart extends part_1.Part {
        constructor(instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService, hoverService, configurationService) {
            super("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.instantiationService = instantiationService;
            this.contextService = contextService;
            this.storageService = storageService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            //#region IView
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 22;
            this.maximumHeight = 22;
            this.pendingEntries = [];
            this.viewModel = this._register(new statusbarModel_1.StatusbarViewModel(this.storageService));
            this.onDidChangeEntryVisibility = this.viewModel.onDidChangeEntryVisibility;
            this.hoverDelegate = new class {
                get delay() {
                    if (Date.now() - this.lastHoverHideTime < 200) {
                        return 0; // show instantly when a hover was recently shown
                    }
                    return this.configurationService.getValue('workbench.hover.delay');
                }
                constructor(configurationService, hoverService) {
                    this.configurationService = configurationService;
                    this.hoverService = hoverService;
                    this.lastHoverHideTime = 0;
                    this.placement = 'element';
                }
                showHover(options, focus) {
                    return this.hoverService.showHover({
                        ...options,
                        hideOnKeyDown: true
                    }, focus);
                }
                onDidHideHover() {
                    this.lastHoverHideTime = Date.now();
                }
            }(this.configurationService, this.hoverService);
            this.compactEntriesDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.styleOverrides = new Set();
            this.registerListeners();
        }
        registerListeners() {
            // Entry visibility changes
            this._register(this.onDidChangeEntryVisibility(() => this.updateCompactEntries()));
            // Workbench state changes
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateStyles()));
        }
        addEntry(entry, id, alignment, priorityOrLocation = 0) {
            let priority;
            if ((0, statusbar_1.isStatusbarEntryPriority)(priorityOrLocation)) {
                priority = priorityOrLocation;
            }
            else {
                priority = {
                    primary: priorityOrLocation,
                    secondary: (0, hash_1.hash)(id) // derive from identifier to accomplish uniqueness
                };
            }
            // As long as we have not been created into a container yet, record all entries
            // that are pending so that they can get created at a later point
            if (!this.element) {
                return this.doAddPendingEntry(entry, id, alignment, priority);
            }
            // Otherwise add to view
            return this.doAddEntry(entry, id, alignment, priority);
        }
        doAddPendingEntry(entry, id, alignment, priority) {
            const pendingEntry = { entry, id, alignment, priority };
            this.pendingEntries.push(pendingEntry);
            const accessor = {
                update: (entry) => {
                    if (pendingEntry.accessor) {
                        pendingEntry.accessor.update(entry);
                    }
                    else {
                        pendingEntry.entry = entry;
                    }
                },
                dispose: () => {
                    if (pendingEntry.accessor) {
                        pendingEntry.accessor.dispose();
                    }
                    else {
                        this.pendingEntries = this.pendingEntries.filter(entry => entry !== pendingEntry);
                    }
                }
            };
            return accessor;
        }
        doAddEntry(entry, id, alignment, priority) {
            // View model item
            const itemContainer = this.doCreateStatusItem(id, alignment);
            const item = this.instantiationService.createInstance(statusbarItem_1.StatusbarEntryItem, itemContainer, entry, this.hoverDelegate);
            // View model entry
            const viewModelEntry = new class {
                constructor() {
                    this.id = id;
                    this.alignment = alignment;
                    this.priority = priority;
                    this.container = itemContainer;
                    this.labelContainer = item.labelContainer;
                }
                get name() { return item.name; }
                get hasCommand() { return item.hasCommand; }
            };
            // Add to view model
            const { needsFullRefresh } = this.doAddOrRemoveModelEntry(viewModelEntry, true);
            if (needsFullRefresh) {
                this.appendStatusbarEntries();
            }
            else {
                this.appendStatusbarEntry(viewModelEntry);
            }
            return {
                update: entry => {
                    item.update(entry);
                },
                dispose: () => {
                    const { needsFullRefresh } = this.doAddOrRemoveModelEntry(viewModelEntry, false);
                    if (needsFullRefresh) {
                        this.appendStatusbarEntries();
                    }
                    else {
                        itemContainer.remove();
                    }
                    (0, lifecycle_1.dispose)(item);
                }
            };
        }
        doCreateStatusItem(id, alignment, ...extraClasses) {
            const itemContainer = document.createElement('div');
            itemContainer.id = id;
            itemContainer.classList.add('statusbar-item');
            if (extraClasses) {
                itemContainer.classList.add(...extraClasses);
            }
            if (alignment === 1 /* StatusbarAlignment.RIGHT */) {
                itemContainer.classList.add('right');
            }
            else {
                itemContainer.classList.add('left');
            }
            return itemContainer;
        }
        doAddOrRemoveModelEntry(entry, add) {
            // Update model but remember previous entries
            const entriesBefore = this.viewModel.entries;
            if (add) {
                this.viewModel.add(entry);
            }
            else {
                this.viewModel.remove(entry);
            }
            const entriesAfter = this.viewModel.entries;
            // Apply operation onto the entries from before
            if (add) {
                entriesBefore.splice(entriesAfter.indexOf(entry), 0, entry);
            }
            else {
                entriesBefore.splice(entriesBefore.indexOf(entry), 1);
            }
            // Figure out if a full refresh is needed by comparing arrays
            const needsFullRefresh = !(0, arrays_1.equals)(entriesBefore, entriesAfter);
            return { needsFullRefresh };
        }
        isEntryVisible(id) {
            return !this.viewModel.isHidden(id);
        }
        updateEntryVisibility(id, visible) {
            if (visible) {
                this.viewModel.show(id);
            }
            else {
                this.viewModel.hide(id);
            }
        }
        focusNextEntry() {
            this.viewModel.focusNextEntry();
        }
        focusPreviousEntry() {
            this.viewModel.focusPreviousEntry();
        }
        isEntryFocused() {
            return this.viewModel.isEntryFocused();
        }
        focus(preserveEntryFocus = true) {
            this.getContainer()?.focus();
            const lastFocusedEntry = this.viewModel.lastFocusedEntry;
            if (preserveEntryFocus && lastFocusedEntry) {
                setTimeout(() => lastFocusedEntry.labelContainer.focus(), 0); // Need a timeout, for some reason without it the inner label container will not get focused
            }
        }
        createContentArea(parent) {
            this.element = parent;
            // Track focus within container
            const scopedContextKeyService = this.contextKeyService.createScoped(this.element);
            contextkeys_1.StatusBarFocused.bindTo(scopedContextKeyService).set(true);
            // Left items container
            this.leftItemsContainer = document.createElement('div');
            this.leftItemsContainer.classList.add('left-items', 'items-container');
            this.element.appendChild(this.leftItemsContainer);
            this.element.tabIndex = 0;
            // Right items container
            this.rightItemsContainer = document.createElement('div');
            this.rightItemsContainer.classList.add('right-items', 'items-container');
            this.element.appendChild(this.rightItemsContainer);
            // Context menu support
            this._register((0, dom_1.addDisposableListener)(parent, dom_1.EventType.CONTEXT_MENU, e => this.showContextMenu(e)));
            this._register(touch_1.Gesture.addTarget(parent));
            this._register((0, dom_1.addDisposableListener)(parent, touch_1.EventType.Contextmenu, e => this.showContextMenu(e)));
            // Initial status bar entries
            this.createInitialStatusbarEntries();
            return this.element;
        }
        createInitialStatusbarEntries() {
            // Add items in order according to alignment
            this.appendStatusbarEntries();
            // Fill in pending entries if any
            while (this.pendingEntries.length) {
                const pending = this.pendingEntries.shift();
                if (pending) {
                    pending.accessor = this.addEntry(pending.entry, pending.id, pending.alignment, pending.priority.primary);
                }
            }
        }
        appendStatusbarEntries() {
            const leftItemsContainer = (0, types_1.assertIsDefined)(this.leftItemsContainer);
            const rightItemsContainer = (0, types_1.assertIsDefined)(this.rightItemsContainer);
            // Clear containers
            (0, dom_1.clearNode)(leftItemsContainer);
            (0, dom_1.clearNode)(rightItemsContainer);
            // Append all
            for (const entry of [
                ...this.viewModel.getEntries(0 /* StatusbarAlignment.LEFT */),
                ...this.viewModel.getEntries(1 /* StatusbarAlignment.RIGHT */).reverse() // reversing due to flex: row-reverse
            ]) {
                const target = entry.alignment === 0 /* StatusbarAlignment.LEFT */ ? leftItemsContainer : rightItemsContainer;
                target.appendChild(entry.container);
            }
            // Update compact entries
            this.updateCompactEntries();
        }
        appendStatusbarEntry(entry) {
            const entries = this.viewModel.getEntries(entry.alignment);
            if (entry.alignment === 1 /* StatusbarAlignment.RIGHT */) {
                entries.reverse(); // reversing due to flex: row-reverse
            }
            const target = (0, types_1.assertIsDefined)(entry.alignment === 0 /* StatusbarAlignment.LEFT */ ? this.leftItemsContainer : this.rightItemsContainer);
            const index = entries.indexOf(entry);
            if (index + 1 === entries.length) {
                target.appendChild(entry.container); // append at the end if last
            }
            else {
                target.insertBefore(entry.container, entries[index + 1].container); // insert before next element otherwise
            }
            // Update compact entries
            this.updateCompactEntries();
        }
        updateCompactEntries() {
            const entries = this.viewModel.entries;
            // Find visible entries and clear compact related CSS classes if any
            const mapIdToVisibleEntry = new Map();
            for (const entry of entries) {
                if (!this.viewModel.isHidden(entry.id)) {
                    mapIdToVisibleEntry.set(entry.id, entry);
                }
                entry.container.classList.remove('compact-left', 'compact-right');
            }
            // Figure out groups of entries with `compact` alignment
            const compactEntryGroups = new Map();
            for (const entry of mapIdToVisibleEntry.values()) {
                if ((0, statusbar_1.isStatusbarEntryLocation)(entry.priority.primary) && // entry references another entry as location
                    entry.priority.primary.compact // entry wants to be compact
                ) {
                    const locationId = entry.priority.primary.id;
                    const location = mapIdToVisibleEntry.get(locationId);
                    if (!location) {
                        continue; // skip if location does not exist
                    }
                    // Build a map of entries that are compact among each other
                    let compactEntryGroup = compactEntryGroups.get(locationId);
                    if (!compactEntryGroup) {
                        compactEntryGroup = new Set([entry, location]);
                        compactEntryGroups.set(locationId, compactEntryGroup);
                    }
                    else {
                        compactEntryGroup.add(entry);
                    }
                    // Adjust CSS classes to move compact items closer together
                    if (entry.priority.primary.alignment === 0 /* StatusbarAlignment.LEFT */) {
                        location.container.classList.add('compact-left');
                        entry.container.classList.add('compact-right');
                    }
                    else {
                        location.container.classList.add('compact-right');
                        entry.container.classList.add('compact-left');
                    }
                }
            }
            // Install mouse listeners to update hover feedback for
            // all compact entries that belong to each other
            const statusBarItemHoverBackground = this.getColor(theme_1.STATUS_BAR_ITEM_HOVER_BACKGROUND);
            const statusBarItemCompactHoverBackground = this.getColor(theme_1.STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND);
            this.compactEntriesDisposable.value = new lifecycle_1.DisposableStore();
            if (statusBarItemHoverBackground && statusBarItemCompactHoverBackground && !(0, theme_2.isHighContrast)(this.theme.type)) {
                for (const [, compactEntryGroup] of compactEntryGroups) {
                    for (const compactEntry of compactEntryGroup) {
                        if (!compactEntry.hasCommand) {
                            continue; // only show hover feedback when we have a command
                        }
                        this.compactEntriesDisposable.value.add((0, dom_1.addDisposableListener)(compactEntry.labelContainer, dom_1.EventType.MOUSE_OVER, () => {
                            compactEntryGroup.forEach(compactEntry => compactEntry.labelContainer.style.backgroundColor = statusBarItemHoverBackground);
                            compactEntry.labelContainer.style.backgroundColor = statusBarItemCompactHoverBackground;
                        }));
                        this.compactEntriesDisposable.value.add((0, dom_1.addDisposableListener)(compactEntry.labelContainer, dom_1.EventType.MOUSE_OUT, () => {
                            compactEntryGroup.forEach(compactEntry => compactEntry.labelContainer.style.backgroundColor = '');
                        }));
                    }
                }
            }
        }
        showContextMenu(e) {
            dom_1.EventHelper.stop(e, true);
            const event = new mouseEvent_1.StandardMouseEvent(e);
            let actions = undefined;
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => {
                    actions = this.getContextMenuActions(event);
                    return actions;
                },
                onHide: () => {
                    if (actions) {
                        (0, lifecycle_1.disposeIfDisposable)(actions);
                    }
                }
            });
        }
        getContextMenuActions(event) {
            const actions = [];
            // Provide an action to hide the status bar at last
            actions.push((0, actions_1.toAction)({ id: layoutActions_1.ToggleStatusbarVisibilityAction.ID, label: (0, nls_1.localize)('hideStatusBar', "Hide Status Bar"), run: () => this.instantiationService.invokeFunction(accessor => new layoutActions_1.ToggleStatusbarVisibilityAction().run(accessor)) }));
            actions.push(new actions_1.Separator());
            // Show an entry per known status entry
            // Note: even though entries have an identifier, there can be multiple entries
            // having the same identifier (e.g. from extensions). So we make sure to only
            // show a single entry per identifier we handled.
            const handledEntries = new Set();
            for (const entry of this.viewModel.entries) {
                if (!handledEntries.has(entry.id)) {
                    actions.push(new statusbarActions_1.ToggleStatusbarEntryVisibilityAction(entry.id, entry.name, this.viewModel));
                    handledEntries.add(entry.id);
                }
            }
            // Figure out if mouse is over an entry
            let statusEntryUnderMouse = undefined;
            for (let element = event.target; element; element = element.parentElement) {
                const entry = this.viewModel.findEntry(element);
                if (entry) {
                    statusEntryUnderMouse = entry;
                    break;
                }
            }
            if (statusEntryUnderMouse) {
                actions.push(new actions_1.Separator());
                actions.push(new statusbarActions_1.HideStatusbarEntryAction(statusEntryUnderMouse.id, statusEntryUnderMouse.name, this.viewModel));
            }
            return actions;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            const styleOverride = [...this.styleOverrides].sort((a, b) => a.priority - b.priority)[0];
            // Background / foreground colors
            const backgroundColor = this.getColor(styleOverride?.background ?? (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.STATUS_BAR_BACKGROUND : theme_1.STATUS_BAR_NO_FOLDER_BACKGROUND)) || '';
            container.style.backgroundColor = backgroundColor;
            const foregroundColor = this.getColor(styleOverride?.foreground ?? (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.STATUS_BAR_FOREGROUND : theme_1.STATUS_BAR_NO_FOLDER_FOREGROUND)) || '';
            container.style.color = foregroundColor;
            const itemBorderColor = this.getColor(theme_1.STATUS_BAR_ITEM_FOCUS_BORDER);
            // Border color
            const borderColor = this.getColor(styleOverride?.border ?? (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.STATUS_BAR_BORDER : theme_1.STATUS_BAR_NO_FOLDER_BORDER)) || this.getColor(colorRegistry_1.contrastBorder);
            if (borderColor) {
                container.classList.add('status-border-top');
                container.style.setProperty('--status-border-top-color', borderColor);
            }
            else {
                container.classList.remove('status-border-top');
                container.style.removeProperty('--status-border-top-color');
            }
            // Colors and focus outlines via dynamic stylesheet
            const statusBarFocusColor = this.getColor(theme_1.STATUS_BAR_FOCUS_BORDER);
            if (!this.styleElement) {
                this.styleElement = (0, dom_1.createStyleSheet)(container);
            }
            this.styleElement.textContent = `

				/* Status bar focus outline */
				.monaco-workbench .part.statusbar:focus {
					outline-color: ${statusBarFocusColor};
				}

				/* Status bar item focus outline */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item a:focus-visible:not(.disabled) {
					outline: 1px solid ${this.getColor(colorRegistry_1.activeContrastBorder) ?? itemBorderColor};
					outline-offset: ${borderColor ? '-2px' : '-1px'};
				}

				/* Notification Beak */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item.has-beak > .status-bar-item-beak-container:before {
					border-bottom-color: ${backgroundColor};
				}
			`;
        }
        layout(width, height, top, left) {
            super.layout(width, height, top, left);
            super.layoutContents(width, height);
        }
        overrideStyle(style) {
            this.styleOverrides.add(style);
            this.updateStyles();
            return (0, lifecycle_1.toDisposable)(() => {
                this.styleOverrides.delete(style);
                this.updateStyles();
            });
        }
        toJSON() {
            return {
                type: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */
            };
        }
    };
    exports.StatusbarPart = StatusbarPart;
    exports.StatusbarPart = StatusbarPart = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, themeService_1.IThemeService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, storage_1.IStorageService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, hover_1.IHoverService),
        __param(8, configuration_1.IConfigurationService)
    ], StatusbarPart);
    (0, extensions_1.registerSingleton)(statusbar_1.IStatusbarService, StatusbarPart, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3N0YXR1c2Jhci9zdGF0dXNiYXJQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJDekYsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLFdBQUk7UUEwRHRDLFlBQ3dCLG9CQUE0RCxFQUNwRSxZQUEyQixFQUNoQixjQUF5RCxFQUNsRSxjQUFnRCxFQUN4QyxhQUFzQyxFQUMxQyxrQkFBK0MsRUFDaEQsaUJBQXNELEVBQzNELFlBQTRDLEVBQ3BDLG9CQUE0RDtZQUVuRixLQUFLLHlEQUF1QixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBVnRELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFeEMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUVwQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQy9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDMUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDbkIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQS9EcEYsZUFBZTtZQUVOLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1lBQ3pCLGlCQUFZLEdBQVcsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1lBQ2hELGtCQUFhLEdBQVcsRUFBRSxDQUFDO1lBQzNCLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1lBTTVCLG1CQUFjLEdBQTZCLEVBQUUsQ0FBQztZQUVyQyxjQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLG1DQUFrQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFD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