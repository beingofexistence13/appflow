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
define(["require", "exports", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/ui/splitview/splitview", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/common/views", "vs/platform/terminal/common/terminal", "vs/workbench/browser/parts/views/viewsService"], function (require, exports, terminal_1, event_1, lifecycle_1, splitview_1, layoutService_1, instantiation_1, terminal_2, views_1, terminal_3, viewsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iWb = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The minimum size in pixels of a split pane.
         */
        Constants[Constants["SplitPaneMinSize"] = 80] = "SplitPaneMinSize";
        /**
         * The number of cells the terminal gets added or removed when asked to increase or decrease
         * the view size.
         */
        Constants[Constants["ResizePartCellCount"] = 4] = "ResizePartCellCount";
    })(Constants || (Constants = {}));
    let SplitPaneContainer = class SplitPaneContainer extends lifecycle_1.$kc {
        get onDidChange() { return this.m; }
        constructor(n, orientation, r) {
            super();
            this.n = n;
            this.orientation = orientation;
            this.r = r;
            this.g = this.B(new lifecycle_1.$jc());
            this.h = [];
            this.j = new Map();
            this.m = event_1.Event.None;
            this.b = this.n.offsetWidth;
            this.a = this.n.offsetHeight;
            this.s();
            this.f.layout(this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.b : this.a);
        }
        s() {
            this.f = new splitview_1.$bR(this.n, { orientation: this.orientation });
            this.g.clear();
            this.g.add(this.f.onDidSashReset(() => this.f.distributeViewSizes()));
        }
        split(instance, index) {
            this.u(instance, index);
        }
        resizePane(index, direction, amount, part) {
            const isHorizontal = (direction === 0 /* Direction.Left */) || (direction === 1 /* Direction.Right */);
            if ((isHorizontal && this.orientation !== 1 /* Orientation.HORIZONTAL */) ||
                (!isHorizontal && this.orientation !== 0 /* Orientation.VERTICAL */)) {
                // Resize the entire pane as a whole
                if ((this.orientation === 1 /* Orientation.HORIZONTAL */ && direction === 3 /* Direction.Down */) ||
                    (this.orientation === 0 /* Orientation.VERTICAL */ && direction === 1 /* Direction.Right */)) {
                    amount *= -1;
                }
                this.r.resizePart(part, amount, amount);
                return;
            }
            // Resize left/right in horizontal or up/down in vertical
            // Only resize when there is more than one pane
            if (this.h.length <= 1) {
                return;
            }
            // Get sizes
            const sizes = [];
            for (let i = 0; i < this.f.length; i++) {
                sizes.push(this.f.getViewSize(i));
            }
            // Remove size from right pane, unless index is the last pane in which case use left pane
            const isSizingEndPane = index !== this.h.length - 1;
            const indexToChange = isSizingEndPane ? index + 1 : index - 1;
            if (isSizingEndPane && direction === 0 /* Direction.Left */) {
                amount *= -1;
            }
            else if (!isSizingEndPane && direction === 1 /* Direction.Right */) {
                amount *= -1;
            }
            else if (isSizingEndPane && direction === 2 /* Direction.Up */) {
                amount *= -1;
            }
            else if (!isSizingEndPane && direction === 3 /* Direction.Down */) {
                amount *= -1;
            }
            // Ensure the size is not reduced beyond the minimum, otherwise weird things can happen
            if (sizes[index] + amount < 80 /* Constants.SplitPaneMinSize */) {
                amount = 80 /* Constants.SplitPaneMinSize */ - sizes[index];
            }
            else if (sizes[indexToChange] - amount < 80 /* Constants.SplitPaneMinSize */) {
                amount = sizes[indexToChange] - 80 /* Constants.SplitPaneMinSize */;
            }
            // Apply the size change
            sizes[index] += amount;
            sizes[indexToChange] -= amount;
            for (let i = 0; i < this.f.length - 1; i++) {
                this.f.resizeView(i, sizes[i]);
            }
        }
        resizePanes(relativeSizes) {
            if (this.h.length <= 1) {
                return;
            }
            // assign any extra size to last terminal
            relativeSizes[relativeSizes.length - 1] += 1 - relativeSizes.reduce((totalValue, currentValue) => totalValue + currentValue, 0);
            let totalSize = 0;
            for (let i = 0; i < this.f.length; i++) {
                totalSize += this.f.getViewSize(i);
            }
            for (let i = 0; i < this.f.length; i++) {
                this.f.resizeView(i, totalSize * relativeSizes[i]);
            }
        }
        getPaneSize(instance) {
            const paneForInstance = this.j.get(instance);
            if (!paneForInstance) {
                return 0;
            }
            const index = this.h.indexOf(paneForInstance);
            return this.f.getViewSize(index);
        }
        u(instance, index) {
            const child = new SplitPane(instance, this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.a : this.b);
            child.orientation = this.orientation;
            if (typeof index === 'number') {
                this.h.splice(index, 0, child);
            }
            else {
                this.h.push(child);
            }
            this.j.set(instance, this.h[this.h.indexOf(child)]);
            this.w(() => this.f.addView(child, splitview_1.Sizing.Distribute, index));
            this.layout(this.b, this.a);
            this.m = event_1.Event.any(...this.h.map(c => c.onDidChange));
        }
        remove(instance) {
            let index = null;
            for (let i = 0; i < this.h.length; i++) {
                if (this.h[i].instance === instance) {
                    index = i;
                }
            }
            if (index !== null) {
                this.h.splice(index, 1);
                this.j.delete(instance);
                this.f.removeView(index, splitview_1.Sizing.Distribute);
                instance.detachFromElement();
            }
        }
        layout(width, height) {
            this.b = width;
            this.a = height;
            if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                this.h.forEach(c => c.orthogonalLayout(height));
                this.f.layout(width);
            }
            else {
                this.h.forEach(c => c.orthogonalLayout(width));
                this.f.layout(height);
            }
        }
        setOrientation(orientation) {
            if (this.orientation === orientation) {
                return;
            }
            this.orientation = orientation;
            // Remove old split view
            while (this.n.children.length > 0) {
                this.n.removeChild(this.n.children[0]);
            }
            this.g.clear();
            this.f.dispose();
            // Create new split view with updated orientation
            this.s();
            this.w(() => {
                this.h.forEach(child => {
                    child.orientation = orientation;
                    this.f.addView(child, 1);
                });
            });
        }
        w(innerFunction) {
            // Whenever manipulating views that are going to be changed immediately, disabling
            // layout/resize events in the terminal prevent bad dimensions going to the pty.
            this.h.forEach(c => c.instance.disableLayout = true);
            innerFunction();
            this.h.forEach(c => c.instance.disableLayout = false);
        }
    };
    SplitPaneContainer = __decorate([
        __param(2, layoutService_1.$Meb)
    ], SplitPaneContainer);
    class SplitPane {
        get onDidChange() { return this.a; }
        constructor(instance, orthogonalSize) {
            this.instance = instance;
            this.orthogonalSize = orthogonalSize;
            this.minimumSize = 80 /* Constants.SplitPaneMinSize */;
            this.maximumSize = Number.MAX_VALUE;
            this.a = event_1.Event.None;
            this.element = document.createElement('div');
            this.element.className = 'terminal-split-pane';
            this.instance.attachToElement(this.element);
        }
        layout(size) {
            // Only layout when both sizes are known
            if (!size || !this.orthogonalSize) {
                return;
            }
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                this.instance.layout({ width: this.orthogonalSize, height: size });
            }
            else {
                this.instance.layout({ width: size, height: this.orthogonalSize });
            }
        }
        orthogonalLayout(size) {
            this.orthogonalSize = size;
        }
    }
    let $iWb = class $iWb extends lifecycle_1.$kc {
        get terminalInstances() { return this.a; }
        constructor(F, shellLaunchConfigOrInstance, G, H, I, J, L) {
            super();
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.a = [];
            this.g = 2 /* Position.BOTTOM */;
            this.h = 1 /* ViewContainerLocation.Panel */;
            this.j = new Map();
            this.m = -1;
            this.r = false;
            this.s = this.B(new event_1.$fd());
            this.onDidDisposeInstance = this.s.event;
            this.u = this.B(new event_1.$fd());
            this.onDidFocusInstance = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidChangeInstanceCapability = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onDisposed = this.y.event;
            this.z = this.B(new event_1.$fd());
            this.onInstancesChanged = this.z.event;
            this.C = this.B(new event_1.$fd());
            this.onDidChangeActiveInstance = this.C.event;
            this.D = this.B(new event_1.$fd());
            this.onPanelOrientationChanged = this.D.event;
            if (shellLaunchConfigOrInstance) {
                this.addInstance(shellLaunchConfigOrInstance);
            }
            if (this.F) {
                this.attachToElement(this.F);
            }
            this.D.fire(this.h === 1 /* ViewContainerLocation.Panel */ && this.g === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */);
            this.B((0, lifecycle_1.$ic)(() => {
                if (this.F && this.f) {
                    this.F.removeChild(this.f);
                    this.f = undefined;
                }
            }));
        }
        addInstance(shellLaunchConfigOrInstance, parentTerminalId) {
            let instance;
            // if a parent terminal is provided, find it
            // otherwise, parent is the active terminal
            const parentIndex = parentTerminalId ? this.a.findIndex(t => t.instanceId === parentTerminalId) : this.m;
            if ('instanceId' in shellLaunchConfigOrInstance) {
                instance = shellLaunchConfigOrInstance;
            }
            else {
                instance = this.H.createInstance(shellLaunchConfigOrInstance, terminal_3.TerminalLocation.Panel);
            }
            if (this.a.length === 0) {
                this.a.push(instance);
                this.m = 0;
            }
            else {
                this.a.splice(parentIndex + 1, 0, instance);
            }
            this.M(instance);
            if (this.b) {
                this.b.split(instance, parentIndex + 1);
            }
            this.z.fire();
        }
        dispose() {
            this.a = [];
            this.z.fire();
            super.dispose();
        }
        get activeInstance() {
            if (this.a.length === 0) {
                return undefined;
            }
            return this.a[this.m];
        }
        getLayoutInfo(isActive) {
            const instances = this.terminalInstances.filter(instance => typeof instance.persistentProcessId === 'number' && instance.shouldPersist);
            const totalSize = instances.map(t => this.b?.getPaneSize(t) || 0).reduce((total, size) => total += size, 0);
            return {
                isActive: isActive,
                activePersistentProcessId: this.activeInstance ? this.activeInstance.persistentProcessId : undefined,
                terminals: instances.map(t => {
                    return {
                        relativeSize: totalSize > 0 ? this.b.getPaneSize(t) / totalSize : 0,
                        terminal: t.persistentProcessId || 0
                    };
                })
            };
        }
        M(instance) {
            this.j.set(instance.instanceId, [
                instance.onDisposed(instance => {
                    this.s.fire(instance);
                    this.N(instance);
                }),
                instance.onDidFocus(instance => {
                    this.P(instance);
                    this.u.fire(instance);
                }),
                instance.capabilities.onDidAddCapabilityType(() => this.w.fire(instance)),
                instance.capabilities.onDidRemoveCapabilityType(() => this.w.fire(instance)),
            ]);
        }
        N(instance) {
            this.O(instance);
        }
        removeInstance(instance) {
            this.O(instance);
        }
        O(instance) {
            const index = this.a.indexOf(instance);
            if (index === -1) {
                return;
            }
            const wasActiveInstance = instance === this.activeInstance;
            this.a.splice(index, 1);
            // Adjust focus if the instance was active
            if (wasActiveInstance && this.a.length > 0) {
                const newIndex = index < this.a.length ? index : this.a.length - 1;
                this.setActiveInstanceByIndex(newIndex);
                // TODO: Only focus the new instance if the group had focus?
                this.activeInstance?.focus(true);
            }
            else if (index < this.m) {
                // Adjust active instance index if needed
                this.m--;
            }
            this.b?.remove(instance);
            // Fire events and dispose group if it was the last instance
            if (this.a.length === 0) {
                this.y.fire(this);
                this.dispose();
            }
            else {
                this.z.fire();
            }
            // Dispose instance event listeners
            const disposables = this.j.get(instance.instanceId);
            if (disposables) {
                (0, lifecycle_1.$fc)(disposables);
                this.j.delete(instance.instanceId);
            }
        }
        moveInstance(instance, index) {
            const sourceIndex = this.terminalInstances.indexOf(instance);
            if (sourceIndex === -1) {
                return;
            }
            this.a.splice(sourceIndex, 1);
            this.a.splice(index, 0, instance);
            if (this.b) {
                this.b.remove(instance);
                this.b.split(instance, index);
            }
            this.z.fire();
        }
        P(instance) {
            this.setActiveInstanceByIndex(this.Q(instance.instanceId));
        }
        Q(terminalId) {
            let terminalIndex = -1;
            this.terminalInstances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    terminalIndex = i;
                }
            });
            if (terminalIndex === -1) {
                throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
            }
            return terminalIndex;
        }
        setActiveInstanceByIndex(index, force) {
            // Check for invalid value
            if (index < 0 || index >= this.a.length) {
                return;
            }
            const oldActiveInstance = this.activeInstance;
            this.m = index;
            if (oldActiveInstance !== this.activeInstance || force) {
                this.z.fire();
                this.C.fire(this.activeInstance);
            }
        }
        attachToElement(element) {
            this.F = element;
            // If we already have a group element, we can reparent it
            if (!this.f) {
                this.f = document.createElement('div');
                this.f.classList.add('terminal-group');
            }
            this.F.appendChild(this.f);
            if (!this.b) {
                this.g = this.I.getPanelPosition();
                this.h = this.J.getViewLocationById(terminal_1.$tM);
                const orientation = this.h === 1 /* ViewContainerLocation.Panel */ && this.g === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
                this.b = this.L.createInstance(SplitPaneContainer, this.f, orientation);
                this.terminalInstances.forEach(instance => this.b.split(instance, this.m + 1));
            }
        }
        get title() {
            if (this.a.length === 0) {
                // Normally consumers should not call into title at all after the group is disposed but
                // this is required when the group is used as part of a tree.
                return '';
            }
            let title = this.terminalInstances[0].title + this.R(this.terminalInstances[0]);
            if (this.terminalInstances[0].description) {
                title += ` (${this.terminalInstances[0].description})`;
            }
            for (let i = 1; i < this.terminalInstances.length; i++) {
                const instance = this.terminalInstances[i];
                if (instance.title) {
                    title += `, ${instance.title + this.R(instance)}`;
                    if (instance.description) {
                        title += ` (${instance.description})`;
                    }
                }
            }
            return title;
        }
        R(instance) {
            if (this.G.configHelper.config.enableBell && instance.statusList.statuses.some(e => e.id === "bell" /* TerminalStatus.Bell */)) {
                return '*';
            }
            return '';
        }
        setVisible(visible) {
            this.r = visible;
            if (this.f) {
                this.f.style.display = visible ? '' : 'none';
            }
            this.terminalInstances.forEach(i => i.setVisible(visible));
        }
        split(shellLaunchConfig) {
            const instance = this.H.createInstance(shellLaunchConfig, terminal_3.TerminalLocation.Panel);
            this.addInstance(instance, shellLaunchConfig.parentTerminalId);
            this.P(instance);
            return instance;
        }
        addDisposable(disposable) {
            this.B(disposable);
        }
        layout(width, height) {
            if (this.b) {
                // Check if the panel position changed and rotate panes if so
                const newPanelPosition = this.I.getPanelPosition();
                const newTerminalLocation = this.J.getViewLocationById(terminal_1.$tM);
                const terminalPositionChanged = newPanelPosition !== this.g || newTerminalLocation !== this.h;
                if (terminalPositionChanged) {
                    const newOrientation = newTerminalLocation === 1 /* ViewContainerLocation.Panel */ && newPanelPosition === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
                    this.b.setOrientation(newOrientation);
                    this.g = newPanelPosition;
                    this.h = newTerminalLocation;
                    this.D.fire(this.b.orientation);
                }
                this.b.layout(width, height);
                if (this.n && this.r) {
                    this.resizePanes(this.n);
                    this.n = undefined;
                }
            }
        }
        focusPreviousPane() {
            const newIndex = this.m === 0 ? this.a.length - 1 : this.m - 1;
            this.setActiveInstanceByIndex(newIndex);
        }
        focusNextPane() {
            const newIndex = this.m === this.a.length - 1 ? 0 : this.m + 1;
            this.setActiveInstanceByIndex(newIndex);
        }
        resizePane(direction) {
            if (!this.b) {
                return;
            }
            const isHorizontal = (direction === 0 /* Direction.Left */ || direction === 1 /* Direction.Right */);
            const font = this.G.configHelper.getFont();
            // TODO: Support letter spacing and line height
            const charSize = (isHorizontal ? font.charWidth : font.charHeight);
            if (charSize) {
                this.b.resizePane(this.m, direction, charSize * 4 /* Constants.ResizePartCellCount */, (0, viewsService_1.$hyb)(this.h));
            }
        }
        resizePanes(relativeSizes) {
            if (!this.b) {
                this.n = relativeSizes;
                return;
            }
            this.b.resizePanes(relativeSizes);
        }
    };
    exports.$iWb = $iWb;
    exports.$iWb = $iWb = __decorate([
        __param(2, terminal_2.$Mib),
        __param(3, terminal_2.$Pib),
        __param(4, layoutService_1.$Meb),
        __param(5, views_1.$_E),
        __param(6, instantiation_1.$Ah)
    ], $iWb);
});
//# sourceMappingURL=terminalGroup.js.map