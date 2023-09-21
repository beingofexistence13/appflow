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
define(["require", "exports", "vs/nls!vs/workbench/contrib/quickaccess/browser/viewQuickAccess", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/common/views", "vs/workbench/services/output/common/output", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/contextkey/common/contextkey", "vs/base/common/filters", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/debug/common/debug"], function (require, exports, nls_1, quickInput_1, pickerQuickAccess_1, views_1, output_1, terminal_1, contextkey_1, filters_1, strings_1, keybinding_1, actions_1, actionCommonCategories_1, panecomposite_1, debug_1) {
    "use strict";
    var $GLb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ILb = exports.$HLb = exports.$GLb = void 0;
    let $GLb = class $GLb extends pickerQuickAccess_1.$sqb {
        static { $GLb_1 = this; }
        static { this.PREFIX = 'view '; }
        constructor(h, j, m, n, r, t, u, w) {
            super($GLb_1.PREFIX, {
                noResultsPick: {
                    label: (0, nls_1.localize)(0, null),
                    containerLabel: ''
                }
            });
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
        }
        g(filter) {
            const filteredViewEntries = this.z().filter(entry => {
                if (!filter) {
                    return true;
                }
                // Match fuzzy on label
                entry.highlights = { label: (0, filters_1.$Ej)(filter, entry.label, true) ?? undefined };
                // Return if we have a match on label or container
                return entry.highlights.label || (0, strings_1.$_e)(entry.containerLabel, filter);
            });
            // Map entries to container labels
            const mapEntryToContainer = new Map();
            for (const entry of filteredViewEntries) {
                if (!mapEntryToContainer.has(entry.label)) {
                    mapEntryToContainer.set(entry.label, entry.containerLabel);
                }
            }
            // Add separators for containers
            const filteredViewEntriesWithSeparators = [];
            let lastContainer = undefined;
            for (const entry of filteredViewEntries) {
                if (lastContainer !== entry.containerLabel) {
                    lastContainer = entry.containerLabel;
                    // When the entry container has a parent container, set container
                    // label as Parent / Child. For example, `Views / Explorer`.
                    let separatorLabel;
                    if (mapEntryToContainer.has(lastContainer)) {
                        separatorLabel = `${mapEntryToContainer.get(lastContainer)} / ${lastContainer}`;
                    }
                    else {
                        separatorLabel = lastContainer;
                    }
                    filteredViewEntriesWithSeparators.push({ type: 'separator', label: separatorLabel });
                }
                filteredViewEntriesWithSeparators.push(entry);
            }
            return filteredViewEntriesWithSeparators;
        }
        z() {
            const viewEntries = [];
            const getViewEntriesForPaneComposite = (paneComposite, viewContainer) => {
                const viewContainerModel = this.h.getViewContainerModel(viewContainer);
                const result = [];
                for (const view of viewContainerModel.allViewDescriptors) {
                    if (this.w.contextMatchesRules(view.when)) {
                        result.push({
                            label: view.name,
                            containerLabel: viewContainerModel.title,
                            accept: () => this.j.openView(view.id, true)
                        });
                    }
                }
                return result;
            };
            const addPaneComposites = (location, containerLabel) => {
                const paneComposites = this.u.getPaneComposites(location);
                const visiblePaneCompositeIds = this.u.getVisiblePaneCompositeIds(location);
                paneComposites.sort((a, b) => {
                    let aIndex = visiblePaneCompositeIds.findIndex(id => a.id === id);
                    let bIndex = visiblePaneCompositeIds.findIndex(id => b.id === id);
                    if (aIndex < 0) {
                        aIndex = paneComposites.indexOf(a) + visiblePaneCompositeIds.length;
                    }
                    if (bIndex < 0) {
                        bIndex = paneComposites.indexOf(b) + visiblePaneCompositeIds.length;
                    }
                    return aIndex - bIndex;
                });
                for (const paneComposite of paneComposites) {
                    if (this.C(paneComposite)) {
                        const viewContainer = this.h.getViewContainerById(paneComposite.id);
                        if (viewContainer) {
                            viewEntries.push({
                                label: this.h.getViewContainerModel(viewContainer).title,
                                containerLabel,
                                accept: () => this.u.openPaneComposite(paneComposite.id, location, true)
                            });
                        }
                    }
                }
            };
            // Viewlets / Panels
            addPaneComposites(0 /* ViewContainerLocation.Sidebar */, (0, nls_1.localize)(1, null));
            addPaneComposites(1 /* ViewContainerLocation.Panel */, (0, nls_1.localize)(2, null));
            addPaneComposites(2 /* ViewContainerLocation.AuxiliaryBar */, (0, nls_1.localize)(3, null));
            const addPaneCompositeViews = (location) => {
                const paneComposites = this.u.getPaneComposites(location);
                for (const paneComposite of paneComposites) {
                    const viewContainer = this.h.getViewContainerById(paneComposite.id);
                    if (viewContainer) {
                        viewEntries.push(...getViewEntriesForPaneComposite(paneComposite, viewContainer));
                    }
                }
            };
            // Side Bar / Panel Views
            addPaneCompositeViews(0 /* ViewContainerLocation.Sidebar */);
            addPaneCompositeViews(1 /* ViewContainerLocation.Panel */);
            addPaneCompositeViews(2 /* ViewContainerLocation.AuxiliaryBar */);
            // Terminals
            this.r.groups.forEach((group, groupIndex) => {
                group.terminalInstances.forEach((terminal, terminalIndex) => {
                    const label = (0, nls_1.localize)(4, null, `${groupIndex + 1}.${terminalIndex + 1}`, terminal.title);
                    viewEntries.push({
                        label,
                        containerLabel: (0, nls_1.localize)(5, null),
                        accept: async () => {
                            await this.r.showPanel(true);
                            this.n.setActiveInstance(terminal);
                        }
                    });
                });
            });
            // Debug Consoles
            this.t.getModel().getSessions(true).filter(s => s.hasSeparateRepl()).forEach((session, _) => {
                const label = session.name;
                viewEntries.push({
                    label,
                    containerLabel: (0, nls_1.localize)(6, null),
                    accept: async () => {
                        await this.t.focusStackFrame(undefined, undefined, session, { explicit: true });
                        if (!this.j.isViewVisible(debug_1.$rG)) {
                            await this.j.openView(debug_1.$rG, true);
                        }
                    }
                });
            });
            // Output Channels
            const channels = this.m.getChannelDescriptors();
            for (const channel of channels) {
                viewEntries.push({
                    label: channel.label,
                    containerLabel: (0, nls_1.localize)(7, null),
                    accept: () => this.m.showChannel(channel.id)
                });
            }
            return viewEntries;
        }
        C(container) {
            const viewContainer = this.h.getViewContainerById(container.id);
            if (viewContainer?.hideIfEmpty) {
                return this.h.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0;
            }
            return true;
        }
    };
    exports.$GLb = $GLb;
    exports.$GLb = $GLb = $GLb_1 = __decorate([
        __param(0, views_1.$_E),
        __param(1, views_1.$$E),
        __param(2, output_1.$eJ),
        __param(3, terminal_1.$Mib),
        __param(4, terminal_1.$Oib),
        __param(5, debug_1.$nH),
        __param(6, panecomposite_1.$Yeb),
        __param(7, contextkey_1.$3i)
    ], $GLb);
    //#region Actions
    class $HLb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openView'; }
        constructor() {
            super({
                id: $HLb.ID,
                title: { value: (0, nls_1.localize)(8, null), original: 'Open View' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show($GLb.PREFIX);
        }
    }
    exports.$HLb = $HLb;
    class $ILb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.quickOpenView'; }
        static { this.KEYBINDING = {
            primary: 2048 /* KeyMod.CtrlCmd */ | 47 /* KeyCode.KeyQ */,
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 47 /* KeyCode.KeyQ */ },
            linux: { primary: 0 }
        }; }
        constructor() {
            super({
                id: $ILb.ID,
                title: { value: (0, nls_1.localize)(9, null), original: 'Quick Open View' },
                category: actionCommonCategories_1.$Nl.View,
                f1: false,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: undefined,
                    ...$ILb.KEYBINDING
                }
            });
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.$2D);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const keys = keybindingService.lookupKeybindings($ILb.ID);
            quickInputService.quickAccess.show($GLb.PREFIX, { quickNavigateConfiguration: { keybindings: keys }, itemActivation: quickInput_1.ItemActivation.FIRST });
        }
    }
    exports.$ILb = $ILb;
});
//#endregion
//# sourceMappingURL=viewQuickAccess.js.map