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
    exports.$jWb = void 0;
    let $jWb = class $jWb extends lifecycle_1.$kc {
        get instances() {
            return this.groups.reduce((p, c) => p.concat(c.terminalInstances), []);
        }
        constructor(y, z, C, D) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.groups = [];
            this.activeGroupIndex = -1;
            this.lastAccessedMenu = 'inline-tab';
            this.f = this.B(new event_1.$fd());
            this.onDidChangeActiveGroup = this.f.event;
            this.h = this.B(new event_1.$fd());
            this.onDidDisposeGroup = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeGroups = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidShow = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidDisposeInstance = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidFocusInstance = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeActiveInstance = this.s.event;
            this.t = this.B(new event_1.$fd());
            this.onDidChangeInstances = this.t.event;
            this.u = this.B(new event_1.$fd());
            this.onDidChangeInstanceCapability = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidChangePanelOrientation = this.w.event;
            this.onDidDisposeGroup(group => this.G(group));
            this.a = terminalContextKey_1.TerminalContextKeys.groupCount.bindTo(this.y);
            this.onDidChangeGroups(() => this.a.set(this.groups.length));
            event_1.Event.any(this.onDidChangeActiveGroup, this.onDidChangeInstances)(() => this.updateVisibility());
        }
        hidePanel() {
            // Hide the panel if the terminal is in the panel and it has no sibling views
            const panel = this.D.getViewContainerByViewId(terminal_1.$tM);
            if (panel && this.D.getViewContainerModel(panel).activeViewDescriptors.length === 1) {
                this.C.closeView(terminal_1.$tM);
                terminalContextKey_1.TerminalContextKeys.tabsMouse.bindTo(this.y).set(false);
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
            this.setActiveInstanceByIndex(this.F(instance.instanceId));
        }
        F(terminalId) {
            const terminalIndex = this.instances.findIndex(e => e.instanceId === terminalId);
            if (terminalIndex === -1) {
                throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
            }
            return terminalIndex;
        }
        setContainer(container) {
            this.b = container;
            this.groups.forEach(group => group.attachToElement(container));
        }
        async focusTabs() {
            if (this.instances.length === 0) {
                return;
            }
            await this.showPanel(true);
            const pane = this.C.getActiveViewWithId(terminal_1.$tM);
            pane?.terminalTabbedView?.focusTabs();
        }
        async focusHover() {
            if (this.instances.length === 0) {
                return;
            }
            const pane = this.C.getActiveViewWithId(terminal_1.$tM);
            pane?.terminalTabbedView?.focusHover();
        }
        async focusActiveInstance() {
            return this.showPanel(true);
        }
        createGroup(slcOrInstance) {
            const group = this.z.createInstance(terminalGroup_1.$iWb, this.b, slcOrInstance);
            // TODO: Move panel orientation change into this file so it's not fired many times
            group.onPanelOrientationChanged((orientation) => this.w.fire(orientation));
            this.groups.push(group);
            group.addDisposable(group.onDidDisposeInstance(this.n.fire, this.n));
            group.addDisposable(group.onDidFocusInstance(this.r.fire, this.r));
            group.addDisposable(group.onDidChangeActiveInstance(e => {
                if (group === this.activeGroup) {
                    this.s.fire(e);
                }
            }));
            group.addDisposable(group.onDidChangeInstanceCapability(this.u.fire, this.u));
            group.addDisposable(group.onInstancesChanged(this.t.fire, this.t));
            group.addDisposable(group.onDisposed(this.h.fire, this.h));
            if (group.terminalInstances.length > 0) {
                this.t.fire();
            }
            if (this.instances.length === 1) {
                // It's the first instance so it should be made active automatically, this must fire
                // after onInstancesChanged so consumers can react to the instance being added first
                this.setActiveInstanceByIndex(0);
            }
            this.j.fire();
            return group;
        }
        async showPanel(focus) {
            const pane = this.C.getActiveViewWithId(terminal_1.$tM)
                ?? await this.C.openView(terminal_1.$tM, focus);
            pane?.setExpanded(true);
            if (focus) {
                // Do the focus call asynchronously as going through the
                // command palette will force editor focus
                await (0, async_1.$Hg)(0);
                const instance = this.activeInstance;
                if (instance) {
                    // HACK: Ensure the panel is still visible at this point as there may have been
                    // a request since it was opened to show a different panel
                    if (pane && !pane.isVisible()) {
                        await this.C.openView(terminal_1.$tM, focus);
                    }
                    await instance.focusWhenReady(true);
                }
            }
            this.m.fire();
        }
        getInstanceFromResource(resource) {
            return (0, terminalUri_1.$RVb)(this.instances, resource);
        }
        G(group) {
            // Get the index of the group and remove it from the list
            const activeGroup = this.activeGroup;
            const wasActiveGroup = group === activeGroup;
            const index = this.groups.indexOf(group);
            if (index !== -1) {
                this.groups.splice(index, 1);
                this.j.fire();
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
            this.t.fire();
            this.j.fire();
            if (wasActiveGroup) {
                this.f.fire(this.activeGroup);
                this.s.fire(this.activeInstance);
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
                    this.f.fire(this.activeGroup);
                    this.s.fire(this.activeInstance);
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
                this.f.fire(this.activeGroup);
                this.s.fire(this.activeInstance);
            }
        }
        H(index) {
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
            const instanceLocation = this.H(index);
            const newActiveInstance = instanceLocation?.group.terminalInstances[instanceLocation.instanceIndex];
            if (!instanceLocation || activeInstance === newActiveInstance) {
                return;
            }
            const activeInstanceIndex = instanceLocation.instanceIndex;
            this.activeGroupIndex = instanceLocation.groupIndex;
            this.f.fire(this.activeGroup);
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
            this.t.fire();
        }
        moveGroupToEnd(source) {
            const sourceGroup = this.getGroupForInstance(source);
            if (!sourceGroup) {
                return;
            }
            const sourceGroupIndex = this.groups.indexOf(sourceGroup);
            this.groups.splice(sourceGroupIndex, 1);
            this.groups.push(sourceGroup);
            this.t.fire();
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
            this.t.fire();
            if (!wasActiveGroup) {
                this.f.fire(this.activeGroup);
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
            const visible = this.C.isViewVisible(terminal_1.$tM);
            this.groups.forEach((g, i) => g.setVisible(visible && i === this.activeGroupIndex));
        }
    };
    exports.$jWb = $jWb;
    exports.$jWb = $jWb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, instantiation_1.$Ah),
        __param(2, views_1.$$E),
        __param(3, views_1.$_E)
    ], $jWb);
});
//# sourceMappingURL=terminalGroupService.js.map