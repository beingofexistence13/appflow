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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/statusbar/statusbarPart", "vs/base/common/lifecycle", "vs/workbench/browser/part", "vs/base/browser/touch", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/contextview/browser/contextView", "vs/base/common/actions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/extensions", "vs/base/common/arrays", "vs/base/browser/mouseEvent", "vs/workbench/browser/actions/layoutActions", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/theme", "vs/base/common/hash", "vs/workbench/services/hover/browser/hover", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/statusbar/statusbarActions", "vs/workbench/browser/parts/statusbar/statusbarModel", "vs/workbench/browser/parts/statusbar/statusbarItem", "vs/workbench/common/contextkeys", "vs/css!./media/statusbarpart"], function (require, exports, nls_1, lifecycle_1, part_1, touch_1, instantiation_1, statusbar_1, contextView_1, actions_1, themeService_1, theme_1, workspace_1, colorRegistry_1, dom_1, storage_1, layoutService_1, extensions_1, arrays_1, mouseEvent_1, layoutActions_1, types_1, contextkey_1, theme_2, hash_1, hover_1, configuration_1, statusbarActions_1, statusbarModel_1, statusbarItem_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fyb = void 0;
    let $fyb = class $fyb extends part_1.Part {
        constructor(X, themeService, Y, Z, layoutService, $, ab, bb, cb) {
            super("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, { hasTitle: false }, themeService, Z, layoutService);
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            //#region IView
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 22;
            this.maximumHeight = 22;
            this.y = [];
            this.P = this.B(new statusbarModel_1.$byb(this.Z));
            this.onDidChangeEntryVisibility = this.P.onDidChangeEntryVisibility;
            this.S = new class {
                get delay() {
                    if (Date.now() - this.c < 200) {
                        return 0; // show instantly when a hover was recently shown
                    }
                    return this.d.getValue('workbench.hover.delay');
                }
                constructor(d, f) {
                    this.d = d;
                    this.f = f;
                    this.c = 0;
                    this.placement = 'element';
                }
                showHover(options, focus) {
                    return this.f.showHover({
                        ...options,
                        hideOnKeyDown: true
                    }, focus);
                }
                onDidHideHover() {
                    this.c = Date.now();
                }
            }(this.cb, this.bb);
            this.U = this.B(new lifecycle_1.$lc());
            this.W = new Set();
            this.db();
        }
        db() {
            // Entry visibility changes
            this.B(this.onDidChangeEntryVisibility(() => this.mb()));
            // Workbench state changes
            this.B(this.Y.onDidChangeWorkbenchState(() => this.updateStyles()));
        }
        addEntry(entry, id, alignment, priorityOrLocation = 0) {
            let priority;
            if ((0, statusbar_1.$8$)(priorityOrLocation)) {
                priority = priorityOrLocation;
            }
            else {
                priority = {
                    primary: priorityOrLocation,
                    secondary: (0, hash_1.$pi)(id) // derive from identifier to accomplish uniqueness
                };
            }
            // As long as we have not been created into a container yet, record all entries
            // that are pending so that they can get created at a later point
            if (!this.element) {
                return this.eb(entry, id, alignment, priority);
            }
            // Otherwise add to view
            return this.fb(entry, id, alignment, priority);
        }
        eb(entry, id, alignment, priority) {
            const pendingEntry = { entry, id, alignment, priority };
            this.y.push(pendingEntry);
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
                        this.y = this.y.filter(entry => entry !== pendingEntry);
                    }
                }
            };
            return accessor;
        }
        fb(entry, id, alignment, priority) {
            // View model item
            const itemContainer = this.gb(id, alignment);
            const item = this.X.createInstance(statusbarItem_1.$eyb, itemContainer, entry, this.S);
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
            const { needsFullRefresh } = this.hb(viewModelEntry, true);
            if (needsFullRefresh) {
                this.kb();
            }
            else {
                this.lb(viewModelEntry);
            }
            return {
                update: entry => {
                    item.update(entry);
                },
                dispose: () => {
                    const { needsFullRefresh } = this.hb(viewModelEntry, false);
                    if (needsFullRefresh) {
                        this.kb();
                    }
                    else {
                        itemContainer.remove();
                    }
                    (0, lifecycle_1.$fc)(item);
                }
            };
        }
        gb(id, alignment, ...extraClasses) {
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
        hb(entry, add) {
            // Update model but remember previous entries
            const entriesBefore = this.P.entries;
            if (add) {
                this.P.add(entry);
            }
            else {
                this.P.remove(entry);
            }
            const entriesAfter = this.P.entries;
            // Apply operation onto the entries from before
            if (add) {
                entriesBefore.splice(entriesAfter.indexOf(entry), 0, entry);
            }
            else {
                entriesBefore.splice(entriesBefore.indexOf(entry), 1);
            }
            // Figure out if a full refresh is needed by comparing arrays
            const needsFullRefresh = !(0, arrays_1.$sb)(entriesBefore, entriesAfter);
            return { needsFullRefresh };
        }
        isEntryVisible(id) {
            return !this.P.isHidden(id);
        }
        updateEntryVisibility(id, visible) {
            if (visible) {
                this.P.show(id);
            }
            else {
                this.P.hide(id);
            }
        }
        focusNextEntry() {
            this.P.focusNextEntry();
        }
        focusPreviousEntry() {
            this.P.focusPreviousEntry();
        }
        isEntryFocused() {
            return this.P.isEntryFocused();
        }
        focus(preserveEntryFocus = true) {
            this.getContainer()?.focus();
            const lastFocusedEntry = this.P.lastFocusedEntry;
            if (preserveEntryFocus && lastFocusedEntry) {
                setTimeout(() => lastFocusedEntry.labelContainer.focus(), 0); // Need a timeout, for some reason without it the inner label container will not get focused
            }
        }
        L(parent) {
            this.element = parent;
            // Track focus within container
            const scopedContextKeyService = this.ab.createScoped(this.element);
            contextkeys_1.$tdb.bindTo(scopedContextKeyService).set(true);
            // Left items container
            this.Q = document.createElement('div');
            this.Q.classList.add('left-items', 'items-container');
            this.element.appendChild(this.Q);
            this.element.tabIndex = 0;
            // Right items container
            this.R = document.createElement('div');
            this.R.classList.add('right-items', 'items-container');
            this.element.appendChild(this.R);
            // Context menu support
            this.B((0, dom_1.$nO)(parent, dom_1.$3O.CONTEXT_MENU, e => this.nb(e)));
            this.B(touch_1.$EP.addTarget(parent));
            this.B((0, dom_1.$nO)(parent, touch_1.EventType.Contextmenu, e => this.nb(e)));
            // Initial status bar entries
            this.jb();
            return this.element;
        }
        jb() {
            // Add items in order according to alignment
            this.kb();
            // Fill in pending entries if any
            while (this.y.length) {
                const pending = this.y.shift();
                if (pending) {
                    pending.accessor = this.addEntry(pending.entry, pending.id, pending.alignment, pending.priority.primary);
                }
            }
        }
        kb() {
            const leftItemsContainer = (0, types_1.$uf)(this.Q);
            const rightItemsContainer = (0, types_1.$uf)(this.R);
            // Clear containers
            (0, dom_1.$lO)(leftItemsContainer);
            (0, dom_1.$lO)(rightItemsContainer);
            // Append all
            for (const entry of [
                ...this.P.getEntries(0 /* StatusbarAlignment.LEFT */),
                ...this.P.getEntries(1 /* StatusbarAlignment.RIGHT */).reverse() // reversing due to flex: row-reverse
            ]) {
                const target = entry.alignment === 0 /* StatusbarAlignment.LEFT */ ? leftItemsContainer : rightItemsContainer;
                target.appendChild(entry.container);
            }
            // Update compact entries
            this.mb();
        }
        lb(entry) {
            const entries = this.P.getEntries(entry.alignment);
            if (entry.alignment === 1 /* StatusbarAlignment.RIGHT */) {
                entries.reverse(); // reversing due to flex: row-reverse
            }
            const target = (0, types_1.$uf)(entry.alignment === 0 /* StatusbarAlignment.LEFT */ ? this.Q : this.R);
            const index = entries.indexOf(entry);
            if (index + 1 === entries.length) {
                target.appendChild(entry.container); // append at the end if last
            }
            else {
                target.insertBefore(entry.container, entries[index + 1].container); // insert before next element otherwise
            }
            // Update compact entries
            this.mb();
        }
        mb() {
            const entries = this.P.entries;
            // Find visible entries and clear compact related CSS classes if any
            const mapIdToVisibleEntry = new Map();
            for (const entry of entries) {
                if (!this.P.isHidden(entry.id)) {
                    mapIdToVisibleEntry.set(entry.id, entry);
                }
                entry.container.classList.remove('compact-left', 'compact-right');
            }
            // Figure out groups of entries with `compact` alignment
            const compactEntryGroups = new Map();
            for (const entry of mapIdToVisibleEntry.values()) {
                if ((0, statusbar_1.$7$)(entry.priority.primary) && // entry references another entry as location
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
            const statusBarItemHoverBackground = this.z(theme_1.$0_);
            const statusBarItemCompactHoverBackground = this.z(theme_1.$__);
            this.U.value = new lifecycle_1.$jc();
            if (statusBarItemHoverBackground && statusBarItemCompactHoverBackground && !(0, theme_2.$ev)(this.h.type)) {
                for (const [, compactEntryGroup] of compactEntryGroups) {
                    for (const compactEntry of compactEntryGroup) {
                        if (!compactEntry.hasCommand) {
                            continue; // only show hover feedback when we have a command
                        }
                        this.U.value.add((0, dom_1.$nO)(compactEntry.labelContainer, dom_1.$3O.MOUSE_OVER, () => {
                            compactEntryGroup.forEach(compactEntry => compactEntry.labelContainer.style.backgroundColor = statusBarItemHoverBackground);
                            compactEntry.labelContainer.style.backgroundColor = statusBarItemCompactHoverBackground;
                        }));
                        this.U.value.add((0, dom_1.$nO)(compactEntry.labelContainer, dom_1.$3O.MOUSE_OUT, () => {
                            compactEntryGroup.forEach(compactEntry => compactEntry.labelContainer.style.backgroundColor = '');
                        }));
                    }
                }
            }
        }
        nb(e) {
            dom_1.$5O.stop(e, true);
            const event = new mouseEvent_1.$eO(e);
            let actions = undefined;
            this.$.showContextMenu({
                getAnchor: () => event,
                getActions: () => {
                    actions = this.ob(event);
                    return actions;
                },
                onHide: () => {
                    if (actions) {
                        (0, lifecycle_1.$gc)(actions);
                    }
                }
            });
        }
        ob(event) {
            const actions = [];
            // Provide an action to hide the status bar at last
            actions.push((0, actions_1.$li)({ id: layoutActions_1.$Rtb.ID, label: (0, nls_1.localize)(0, null), run: () => this.X.invokeFunction(accessor => new layoutActions_1.$Rtb().run(accessor)) }));
            actions.push(new actions_1.$ii());
            // Show an entry per known status entry
            // Note: even though entries have an identifier, there can be multiple entries
            // having the same identifier (e.g. from extensions). So we make sure to only
            // show a single entry per identifier we handled.
            const handledEntries = new Set();
            for (const entry of this.P.entries) {
                if (!handledEntries.has(entry.id)) {
                    actions.push(new statusbarActions_1.$cyb(entry.id, entry.name, this.P));
                    handledEntries.add(entry.id);
                }
            }
            // Figure out if mouse is over an entry
            let statusEntryUnderMouse = undefined;
            for (let element = event.target; element; element = element.parentElement) {
                const entry = this.P.findEntry(element);
                if (entry) {
                    statusEntryUnderMouse = entry;
                    break;
                }
            }
            if (statusEntryUnderMouse) {
                actions.push(new actions_1.$ii());
                actions.push(new statusbarActions_1.$dyb(statusEntryUnderMouse.id, statusEntryUnderMouse.name, this.P));
            }
            return actions;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.$uf)(this.getContainer());
            const styleOverride = [...this.W].sort((a, b) => a.priority - b.priority)[0];
            // Background / foreground colors
            const backgroundColor = this.z(styleOverride?.background ?? (this.Y.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.$3_ : theme_1.$4_)) || '';
            container.style.backgroundColor = backgroundColor;
            const foregroundColor = this.z(styleOverride?.foreground ?? (this.Y.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.$1_ : theme_1.$2_)) || '';
            container.style.color = foregroundColor;
            const itemBorderColor = this.z(theme_1.$9_);
            // Border color
            const borderColor = this.z(styleOverride?.border ?? (this.Y.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ? theme_1.$5_ : theme_1.$7_)) || this.z(colorRegistry_1.$Av);
            if (borderColor) {
                container.classList.add('status-border-top');
                container.style.setProperty('--status-border-top-color', borderColor);
            }
            else {
                container.classList.remove('status-border-top');
                container.style.removeProperty('--status-border-top-color');
            }
            // Colors and focus outlines via dynamic stylesheet
            const statusBarFocusColor = this.z(theme_1.$6_);
            if (!this.c) {
                this.c = (0, dom_1.$XO)(container);
            }
            this.c.textContent = `

				/* Status bar focus outline */
				.monaco-workbench .part.statusbar:focus {
					outline-color: ${statusBarFocusColor};
				}

				/* Status bar item focus outline */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item a:focus-visible:not(.disabled) {
					outline: 1px solid ${this.z(colorRegistry_1.$Bv) ?? itemBorderColor};
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
            super.N(width, height);
        }
        overrideStyle(style) {
            this.W.add(style);
            this.updateStyles();
            return (0, lifecycle_1.$ic)(() => {
                this.W.delete(style);
                this.updateStyles();
            });
        }
        toJSON() {
            return {
                type: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */
            };
        }
    };
    exports.$fyb = $fyb;
    exports.$fyb = $fyb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, themeService_1.$gv),
        __param(2, workspace_1.$Kh),
        __param(3, storage_1.$Vo),
        __param(4, layoutService_1.$Meb),
        __param(5, contextView_1.$WZ),
        __param(6, contextkey_1.$3i),
        __param(7, hover_1.$zib),
        __param(8, configuration_1.$8h)
    ], $fyb);
    (0, extensions_1.$mr)(statusbar_1.$6$, $fyb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=statusbarPart.js.map