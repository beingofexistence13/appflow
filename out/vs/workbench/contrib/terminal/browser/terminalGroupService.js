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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/terminalGroup", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey"], function (require, exports, async_1, event_1, lifecycle_1, contextkey_1, instantiation_1, views_1, terminalGroup_1, terminalUri_1, terminal_1, terminalContextKey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalGroupService = void 0;
    let TerminalGroupService = class TerminalGroupService extends lifecycle_1.Disposable {
        get instances() {
            return this.groups.reduce((p, c) => p.concat(c.terminalInstances), []);
        }
        constructor(_contextKeyService, _instantiationService, _viewsService, _viewDescriptorService) {
            super();
            this._contextKeyService = _contextKeyService;
            this._instantiationService = _instantiationService;
            this._viewsService = _viewsService;
            this._viewDescriptorService = _viewDescriptorService;
            this.groups = [];
            this.activeGroupIndex = -1;
            this.lastAccessedMenu = 'inline-tab';
            this._onDidChangeActiveGroup = this._register(new event_1.Emitter());
            this.onDidChangeActiveGroup = this._onDidChangeActiveGroup.event;
            this._onDidDisposeGroup = this._register(new event_1.Emitter());
            this.onDidDisposeGroup = this._onDidDisposeGroup.event;
            this._onDidChangeGroups = this._register(new event_1.Emitter());
            this.onDidChangeGroups = this._onDidChangeGroups.event;
            this._onDidShow = this._register(new event_1.Emitter());
            this.onDidShow = this._onDidShow.event;
            this._onDidDisposeInstance = this._register(new event_1.Emitter());
            this.onDidDisposeInstance = this._onDidDisposeInstance.event;
            this._onDidFocusInstance = this._register(new event_1.Emitter());
            this.onDidFocusInstance = this._onDidFocusInstance.event;
            this._onDidChangeActiveInstance = this._register(new event_1.Emitter());
            this.onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
            this._onDidChangeInstances = this._register(new event_1.Emitter());
            this.onDidChangeInstances = this._onDidChangeInstances.event;
            this._onDidChangeInstanceCapability = this._register(new event_1.Emitter());
            this.onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
            this._onDidChangePanelOrientation = this._register(new event_1.Emitter());
            this.onDidChangePanelOrientation = this._onDidChangePanelOrientation.event;
            this.onDidDisposeGroup(group => this._removeGroup(group));
            this._terminalGroupCountContextKey = terminalContextKey_1.TerminalContextKeys.groupCount.bindTo(this._contextKeyService);
            this.onDidChangeGroups(() => this._terminalGroupCountContextKey.set(this.groups.length));
            event_1.Event.any(this.onDidChangeActiveGroup, this.onDidChangeInstances)(() => this.updateVisibility());
        }
        hidePanel() {
            // Hide the panel if the terminal is in the panel and it has no sibling views
            const panel = this._viewDescriptorService.getViewContainerByViewId(terminal_1.TERMINAL_VIEW_ID);
            if (panel && this._viewDescriptorService.getViewContainerModel(panel).activeViewDescriptors.length === 1) {
                this._viewsService.closeView(terminal_1.TERMINAL_VIEW_ID);
                terminalContextKey_1.TerminalContextKeys.tabsMouse.bindTo(this._contextKeyService).set(false);
            }
        }
        get activeGroup() {
            if (this.activeGroupIndex < 0 || this.activeGroupIndex >= this.groups.length) {
                return undefined;
            }
            return this.groups[this.activeGroupIndex];
        }
        set activeGroup(value) {
            if (value === undefined) {
                // Setting to undefined is not possible, this can only be done when removing the last group
                return;
            }
            const index = this.groups.findIndex(e => e === value);
            this.setActiveGroupByIndex(index);
        }
        get activeInstance() {
            return this.activeGroup?.activeInstance;
        }
        setActiveInstance(instance) {
            this.setActiveInstanceByIndex(this._getIndexFromId(instance.instanceId));
        }
        _getIndexFromId(terminalId) {
            const terminalIndex = this.instances.findIndex(e => e.instanceId === terminalId);
            if (terminalIndex === -1) {
                throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
            }
            return terminalIndex;
        }
        setContainer(container) {
            this._container = container;
            this.groups.forEach(group => group.attachToElement(container));
        }
        async focusTabs() {
            if (this.instances.length === 0) {
                return;
            }
            await this.showPanel(true);
            const pane = this._viewsService.getActiveViewWithId(terminal_1.TERMINAL_VIEW_ID);
            pane?.terminalTabbedView?.focusTabs();
        }
        async focusHover() {
            if (this.instances.length === 0) {
                return;
            }
            const pane = this._viewsService.getActiveViewWithId(terminal_1.TERMINAL_VIEW_ID);
            pane?.terminalTabbedView?.focusHover();
        }
        async focusActiveInstance() {
            return this.showPanel(true);
        }
        createGroup(slcOrInstance) {
            const group = this._instantiationService.createInstance(terminalGroup_1.TerminalGroup, this._container, slcOrInstance);
            // TODO: Move panel orientation change into this file so it's not fired many times
            group.onPanelOrientationChanged((orientation) => this._onDidChangePanelOrientation.fire(orientation));
            this.groups.push(group);
            group.addDisposable(group.onDidDisposeInstance(this._onDidDisposeInstance.fire, this._onDidDisposeInstance));
            group.addDisposable(group.onDidFocusInstance(this._onDidFocusInstance.fire, this._onDidFocusInstance));
            group.addDisposable(group.onDidChangeActiveInstance(e => {
                if (group === this.activeGroup) {
                    this._onDidChangeActiveInstance.fire(e);
                }
            }));
            group.addDisposable(group.onDidChangeInstanceCapability(this._onDidChangeInstanceCapability.fire, this._onDidChangeInstanceCapability));
            group.addDisposable(group.onInstancesChanged(this._onDidChangeInstances.fire, this._onDidChangeInstances));
            group.addDisposable(group.onDisposed(this._onDidDisposeGroup.fire, this._onDidDisposeGroup));
            if (group.terminalInstances.length > 0) {
                this._onDidChangeInstances.fire();
            }
            if (this.instances.length === 1) {
                // It's the first instance so it should be made active automatically, this must fire
                // after onInstancesChanged so consumers can react to the instance being added first
                this.setActiveInstanceByIndex(0);
            }
            this._onDidChangeGroups.fire();
            return group;
        }
        async showPanel(focus) {
            const pane = this._viewsService.getActiveViewWithId(terminal_1.TERMINAL_VIEW_ID)
                ?? await this._viewsService.openView(terminal_1.TERMINAL_VIEW_ID, focus);
            pane?.setExpanded(true);
            if (focus) {
                // Do the focus call asynchronously as going through the
                // command palette will force editor focus
                await (0, async_1.timeout)(0);
                const instance = this.activeInstance;
                if (instance) {
                    // HACK: Ensure the panel is still visible at this point as there may have been
                    // a request since it was opened to show a different panel
                    if (pane && !pane.isVisible()) {
                        await this._viewsService.openView(terminal_1.TERMINAL_VIEW_ID, focus);
                    }
                    await instance.focusWhenReady(true);
                }
            }
            this._onDidShow.fire();
        }
        getInstanceFromResource(resource) {
            return (0, terminalUri_1.getInstanceFromResource)(this.instances, resource);
        }
        _removeGroup(group) {
            // Get the index of the group and remove it from the list
            const activeGroup = this.activeGroup;
            const wasActiveGroup = group === activeGroup;
            const index = this.groups.indexOf(group);
            if (index !== -1) {
                this.groups.splice(index, 1);
                this._onDidChangeGroups.fire();
            }
            if (wasActiveGroup) {
                // Adjust focus if the group was active
                if (this.groups.length > 0) {
                    const newIndex = index < this.groups.length ? index : this.groups.length - 1;
                    this.setActiveGroupByIndex(newIndex, true);
                    this.activeInstance?.focus(true);
                }
            }
            else {
                // Adjust the active group if the removed group was above the active group
                if (this.activeGroupIndex > index) {
                    this.setActiveGroupByIndex(this.activeGroupIndex - 1);
                }
            }
            // Ensure the active group is still valid, this should set the activeGroupIndex to -1 if
            // there are no groups
            if (this.activeGroupIndex >= this.groups.length) {
                this.setActiveGroupByIndex(this.groups.length - 1);
            }
            this._onDidChangeInstances.fire();
            this._onDidChangeGroups.fire();
            if (wasActiveGroup) {
                this._onDidChangeActiveGroup.fire(this.activeGroup);
                this._onDidChangeActiveInstance.fire(this.activeInstance);
            }
        }
        /**
         * @param force Whether to force the group change, this should be used when the previous active
         * group has been removed.
         */
        setActiveGroupByIndex(index, force) {
            // Unset active group when the last group is removed
            if (index === -1 && this.groups.length === 0) {
                if (this.activeGroupIndex !== -1) {
                    this.activeGroupIndex = -1;
                    this._onDidChangeActiveGroup.fire(this.activeGroup);
                    this._onDidChangeActiveInstance.fire(this.activeInstance);
                }
                return;
            }
            // Ensure index is valid
            if (index < 0 || index >= this.groups.length) {
                return;
            }
            // Fire group/instance change if needed
            const oldActiveGroup = this.activeGroup;
            this.activeGroupIndex = index;
            if (force || oldActiveGroup !== this.activeGroup) {
                this._onDidChangeActiveGroup.fire(this.activeGroup);
                this._onDidChangeActiveInstance.fire(this.activeInstance);
            }
        }
        _getInstanceLocation(index) {
            let currentGroupIndex = 0;
            while (index >= 0 && currentGroupIndex < this.groups.length) {
                const group = this.groups[currentGroupIndex];
                const count = group.terminalInstances.length;
                if (index < count) {
                    return {
                        group,
                        groupIndex: currentGroupIndex,
                        instance: group.terminalInstances[index],
                        instanceIndex: index
                    };
                }
                index -= count;
                currentGroupIndex++;
            }
            return undefined;
        }
        setActiveInstanceByIndex(index) {
            const activeInstance = this.activeInstance;
            const instanceLocation = this._getInstanceLocation(index);
            const newActiveInstance = instanceLocation?.group.terminalInstances[instanceLocation.instanceIndex];
            if (!instanceLocation || activeInstance === newActiveInstance) {
                return;
            }
            const activeInstanceIndex = instanceLocation.instanceIndex;
            this.activeGroupIndex = instanceLocation.groupIndex;
            this._onDidChangeActiveGroup.fire(this.activeGroup);
            instanceLocation.group.setActiveInstanceByIndex(activeInstanceIndex, true);
        }
        setActiveGroupToNext() {
            if (this.groups.length <= 1) {
                return;
            }
            let newIndex = this.activeGroupIndex + 1;
            if (newIndex >= this.groups.length) {
                newIndex = 0;
            }
            this.setActiveGroupByIndex(newIndex);
        }
        setActiveGroupToPrevious() {
            if (this.groups.length <= 1) {
                return;
            }
            let newIndex = this.activeGroupIndex - 1;
            if (newIndex < 0) {
                newIndex = this.groups.length - 1;
            }
            this.setActiveGroupByIndex(newIndex);
        }
        moveGroup(source, target) {
            const sourceGroup = this.getGroupForInstance(source);
            const targetGroup = this.getGroupForInstance(target);
            // Something went wrong
            if (!sourceGroup || !targetGroup) {
                return;
            }
            // The groups are the same, rearrange within the group
            if (sourceGroup === targetGroup) {
                const index = sourceGroup.terminalInstances.indexOf(target);
                if (index !== -1) {
                    sourceGroup.moveInstance(source, index);
                }
                return;
            }
            // The groups differ, rearrange groups
            const sourceGroupIndex = this.groups.indexOf(sourceGroup);
            const targetGroupIndex = this.groups.indexOf(targetGroup);
            this.groups.splice(sourceGroupIndex, 1);
            this.groups.splice(targetGroupIndex, 0, sourceGroup);
            this._onDidChangeInstances.fire();
        }
        moveGroupToEnd(source) {
            const sourceGroup = this.getGroupForInstance(source);
            if (!sourceGroup) {
                return;
            }
            const sourceGroupIndex = this.groups.indexOf(sourceGroup);
            this.groups.splice(sourceGroupIndex, 1);
            this.groups.push(sourceGroup);
            this._onDidChangeInstances.fire();
        }
        moveInstance(source, target, side) {
            const sourceGroup = this.getGroupForInstance(source);
            const targetGroup = this.getGroupForInstance(target);
            if (!sourceGroup || !targetGroup) {
                return;
            }
            // Move from the source group to the target group
            if (sourceGroup !== targetGroup) {
                // Move groups
                sourceGroup.removeInstance(source);
                targetGroup.addInstance(source);
            }
            // Rearrange within the target group
            const index = targetGroup.terminalInstances.indexOf(target) + (side === 'after' ? 1 : 0);
            targetGroup.moveInstance(source, index);
        }
        unsplitInstance(instance) {
            const oldGroup = this.getGroupForInstance(instance);
            if (!oldGroup || oldGroup.terminalInstances.length < 2) {
                return;
            }
            oldGroup.removeInstance(instance);
            this.createGroup(instance);
        }
        joinInstances(instances) {
            const group = this.getGroupForInstance(instances[0]);
            if (group) {
                let differentGroups = true;
                for (let i = 1; i < group.terminalInstances.length; i++) {
                    if (group.terminalInstances.includes(instances[i])) {
                        differentGroups = false;
                        break;
                    }
                }
                if (!differentGroups) {
                    return;
                }
            }
            // Find the group of the first instance that is the only instance in the group, if one exists
            let candidateInstance = undefined;
            let candidateGroup = undefined;
            for (const instance of instances) {
                const group = this.getGroupForInstance(instance);
                if (group?.terminalInstances.length === 1) {
                    candidateInstance = instance;
                    candidateGroup = group;
                    break;
                }
            }
            // Create a new group if needed
            if (!candidateGroup) {
                candidateGroup = this.createGroup();
            }
            const wasActiveGroup = this.activeGroup === candidateGroup;
            // Unsplit all other instances and add them to the new group
            for (const instance of instances) {
                if (instance === candidateInstance) {
                    continue;
                }
                const oldGroup = this.getGroupForInstance(instance);
                if (!oldGroup) {
                    // Something went wrong, don't join this one
                    continue;
                }
                oldGroup.removeInstance(instance);
                candidateGroup.addInstance(instance);
            }
            // Set the active terminal
            this.setActiveInstance(instances[0]);
            // Fire events
            this._onDidChangeInstances.fire();
            if (!wasActiveGroup) {
                this._onDidChangeActiveGroup.fire(this.activeGroup);
            }
        }
        instanceIsSplit(instance) {
            const group = this.getGroupForInstance(instance);
            if (!group) {
                return false;
            }
            return group.terminalInstances.length > 1;
        }
        getGroupForInstance(instance) {
            return this.groups.find(group => group.terminalInstances.includes(instance));
        }
        getGroupLabels() {
            return this.groups.filter(group => group.terminalInstances.length > 0).map((group, index) => {
                return `${index + 1}: ${group.title ? group.title : ''}`;
            });
        }
        /**
         * Visibility should be updated in the following cases:
         * 1. Toggle `TERMINAL_VIEW_ID` visibility
         * 2. Change active group
         * 3. Change instances in active group
         */
        updateVisibility() {
            const visible = this._viewsService.isViewVisible(terminal_1.TERMINAL_VIEW_ID);
            this.groups.forEach((g, i) => g.setVisible(visible && i === this.activeGroupIndex));
        }
    };
    exports.TerminalGroupService = TerminalGroupService;
    exports.TerminalGroupService = TerminalGroupService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, views_1.IViewsService),
        __param(3, views_1.IViewDescriptorService)
    ], TerminalGroupService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxHcm91cFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsR3JvdXBTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCekYsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTtRQUtuRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUF5QixDQUFDLENBQUM7UUFDL0YsQ0FBQztRQStCRCxZQUNxQixrQkFBOEMsRUFDM0MscUJBQTZELEVBQ3JFLGFBQTZDLEVBQ3BDLHNCQUErRDtZQUV2RixLQUFLLEVBQUUsQ0FBQztZQUxvQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQzFCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDbkIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQXZDeEYsV0FBTSxHQUFxQixFQUFFLENBQUM7WUFDOUIscUJBQWdCLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFLOUIscUJBQWdCLEdBQThCLFlBQVksQ0FBQztZQU0xQyw0QkFBdUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUE4QixDQUFDLENBQUM7WUFDNUYsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQUNwRCx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrQixDQUFDLENBQUM7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