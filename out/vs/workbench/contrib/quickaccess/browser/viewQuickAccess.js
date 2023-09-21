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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/common/views", "vs/workbench/services/output/common/output", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/contextkey/common/contextkey", "vs/base/common/filters", "vs/base/common/strings", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/debug/common/debug"], function (require, exports, nls_1, quickInput_1, pickerQuickAccess_1, views_1, output_1, terminal_1, contextkey_1, filters_1, strings_1, keybinding_1, actions_1, actionCommonCategories_1, panecomposite_1, debug_1) {
    "use strict";
    var ViewQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickAccessViewPickerAction = exports.OpenViewPickerAction = exports.ViewQuickAccessProvider = void 0;
    let ViewQuickAccessProvider = class ViewQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { ViewQuickAccessProvider_1 = this; }
        static { this.PREFIX = 'view '; }
        constructor(viewDescriptorService, viewsService, outputService, terminalService, terminalGroupService, debugService, paneCompositeService, contextKeyService) {
            super(ViewQuickAccessProvider_1.PREFIX, {
                noResultsPick: {
                    label: (0, nls_1.localize)('noViewResults', "No matching views"),
                    containerLabel: ''
                }
            });
            this.viewDescriptorService = viewDescriptorService;
            this.viewsService = viewsService;
            this.outputService = outputService;
            this.terminalService = terminalService;
            this.terminalGroupService = terminalGroupService;
            this.debugService = debugService;
            this.paneCompositeService = paneCompositeService;
            this.contextKeyService = contextKeyService;
        }
        _getPicks(filter) {
            const filteredViewEntries = this.doGetViewPickItems().filter(entry => {
                if (!filter) {
                    return true;
                }
                // Match fuzzy on label
                entry.highlights = { label: (0, filters_1.matchesFuzzy)(filter, entry.label, true) ?? undefined };
                // Return if we have a match on label or container
                return entry.highlights.label || (0, strings_1.fuzzyContains)(entry.containerLabel, filter);
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
        doGetViewPickItems() {
            const viewEntries = [];
            const getViewEntriesForPaneComposite = (paneComposite, viewContainer) => {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                const result = [];
                for (const view of viewContainerModel.allViewDescriptors) {
                    if (this.contextKeyService.contextMatchesRules(view.when)) {
                        result.push({
                            label: view.name,
                            containerLabel: viewContainerModel.title,
                            accept: () => this.viewsService.openView(view.id, true)
                        });
                    }
                }
                return result;
            };
            const addPaneComposites = (location, containerLabel) => {
                const paneComposites = this.paneCompositeService.getPaneComposites(location);
                const visiblePaneCompositeIds = this.paneCompositeService.getVisiblePaneCompositeIds(location);
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
                    if (this.includeViewContainer(paneComposite)) {
                        const viewContainer = this.viewDescriptorService.getViewContainerById(paneComposite.id);
                        if (viewContainer) {
                            viewEntries.push({
                                label: this.viewDescriptorService.getViewContainerModel(viewContainer).title,
                                containerLabel,
                                accept: () => this.paneCompositeService.openPaneComposite(paneComposite.id, location, true)
                            });
                        }
                    }
                }
            };
            // Viewlets / Panels
            addPaneComposites(0 /* ViewContainerLocation.Sidebar */, (0, nls_1.localize)('views', "Side Bar"));
            addPaneComposites(1 /* ViewContainerLocation.Panel */, (0, nls_1.localize)('panels', "Panel"));
            addPaneComposites(2 /* ViewContainerLocation.AuxiliaryBar */, (0, nls_1.localize)('secondary side bar', "Secondary Side Bar"));
            const addPaneCompositeViews = (location) => {
                const paneComposites = this.paneCompositeService.getPaneComposites(location);
                for (const paneComposite of paneComposites) {
                    const viewContainer = this.viewDescriptorService.getViewContainerById(paneComposite.id);
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
            this.terminalGroupService.groups.forEach((group, groupIndex) => {
                group.terminalInstances.forEach((terminal, terminalIndex) => {
                    const label = (0, nls_1.localize)('terminalTitle', "{0}: {1}", `${groupIndex + 1}.${terminalIndex + 1}`, terminal.title);
                    viewEntries.push({
                        label,
                        containerLabel: (0, nls_1.localize)('terminals', "Terminal"),
                        accept: async () => {
                            await this.terminalGroupService.showPanel(true);
                            this.terminalService.setActiveInstance(terminal);
                        }
                    });
                });
            });
            // Debug Consoles
            this.debugService.getModel().getSessions(true).filter(s => s.hasSeparateRepl()).forEach((session, _) => {
                const label = session.name;
                viewEntries.push({
                    label,
                    containerLabel: (0, nls_1.localize)('debugConsoles', "Debug Console"),
                    accept: async () => {
                        await this.debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
                        if (!this.viewsService.isViewVisible(debug_1.REPL_VIEW_ID)) {
                            await this.viewsService.openView(debug_1.REPL_VIEW_ID, true);
                        }
                    }
                });
            });
            // Output Channels
            const channels = this.outputService.getChannelDescriptors();
            for (const channel of channels) {
                viewEntries.push({
                    label: channel.label,
                    containerLabel: (0, nls_1.localize)('channels', "Output"),
                    accept: () => this.outputService.showChannel(channel.id)
                });
            }
            return viewEntries;
        }
        includeViewContainer(container) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(container.id);
            if (viewContainer?.hideIfEmpty) {
                return this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0;
            }
            return true;
        }
    };
    exports.ViewQuickAccessProvider = ViewQuickAccessProvider;
    exports.ViewQuickAccessProvider = ViewQuickAccessProvider = ViewQuickAccessProvider_1 = __decorate([
        __param(0, views_1.IViewDescriptorService),
        __param(1, views_1.IViewsService),
        __param(2, output_1.IOutputService),
        __param(3, terminal_1.ITerminalService),
        __param(4, terminal_1.ITerminalGroupService),
        __param(5, debug_1.IDebugService),
        __param(6, panecomposite_1.IPaneCompositePartService),
        __param(7, contextkey_1.IContextKeyService)
    ], ViewQuickAccessProvider);
    //#region Actions
    class OpenViewPickerAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openView'; }
        constructor() {
            super({
                id: OpenViewPickerAction.ID,
                title: { value: (0, nls_1.localize)('openView', "Open View"), original: 'Open View' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(ViewQuickAccessProvider.PREFIX);
        }
    }
    exports.OpenViewPickerAction = OpenViewPickerAction;
    class QuickAccessViewPickerAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.quickOpenView'; }
        static { this.KEYBINDING = {
            primary: 2048 /* KeyMod.CtrlCmd */ | 47 /* KeyCode.KeyQ */,
            mac: { primary: 256 /* KeyMod.WinCtrl */ | 47 /* KeyCode.KeyQ */ },
            linux: { primary: 0 }
        }; }
        constructor() {
            super({
                id: QuickAccessViewPickerAction.ID,
                title: { value: (0, nls_1.localize)('quickOpenView', "Quick Open View"), original: 'Quick Open View' },
                category: actionCommonCategories_1.Categories.View,
                f1: false,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: undefined,
                    ...QuickAccessViewPickerAction.KEYBINDING
                }
            });
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keys = keybindingService.lookupKeybindings(QuickAccessViewPickerAction.ID);
            quickInputService.quickAccess.show(ViewQuickAccessProvider.PREFIX, { quickNavigateConfiguration: { keybindings: keys }, itemActivation: quickInput_1.ItemActivation.FIRST });
        }
    }
    exports.QuickAccessViewPickerAction = QuickAccessViewPickerAction;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld1F1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcXVpY2thY2Nlc3MvYnJvd3Nlci92aWV3UXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSw2Q0FBNkM7O2lCQUVsRixXQUFNLEdBQUcsT0FBTyxBQUFWLENBQVc7UUFFeEIsWUFDMEMscUJBQTZDLEVBQ3RELFlBQTJCLEVBQzFCLGFBQTZCLEVBQzNCLGVBQWlDLEVBQzVCLG9CQUEyQyxFQUNuRCxZQUEyQixFQUNmLG9CQUErQyxFQUN0RCxpQkFBcUM7WUFFMUUsS0FBSyxDQUFDLHlCQUF1QixDQUFDLE1BQU0sRUFBRTtnQkFDckMsYUFBYSxFQUFFO29CQUNkLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsbUJBQW1CLENBQUM7b0JBQ3JELGNBQWMsRUFBRSxFQUFFO2lCQUNsQjthQUNELENBQUMsQ0FBQztZQWRzQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQ3RELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzFCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDNUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNuRCxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNmLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7WUFDdEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtRQVEzRSxDQUFDO1FBRVMsU0FBUyxDQUFDLE1BQWM7WUFDakMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BF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