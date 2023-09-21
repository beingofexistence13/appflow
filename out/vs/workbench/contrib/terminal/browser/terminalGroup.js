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
    exports.TerminalGroup = void 0;
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
    let SplitPaneContainer = class SplitPaneContainer extends lifecycle_1.Disposable {
        get onDidChange() { return this._onDidChange; }
        constructor(_container, orientation, _layoutService) {
            super();
            this._container = _container;
            this.orientation = orientation;
            this._layoutService = _layoutService;
            this._splitViewDisposables = this._register(new lifecycle_1.DisposableStore());
            this._children = [];
            this._terminalToPane = new Map();
            this._onDidChange = event_1.Event.None;
            this._width = this._container.offsetWidth;
            this._height = this._container.offsetHeight;
            this._createSplitView();
            this._splitView.layout(this.orientation === 1 /* Orientation.HORIZONTAL */ ? this._width : this._height);
        }
        _createSplitView() {
            this._splitView = new splitview_1.SplitView(this._container, { orientation: this.orientation });
            this._splitViewDisposables.clear();
            this._splitViewDisposables.add(this._splitView.onDidSashReset(() => this._splitView.distributeViewSizes()));
        }
        split(instance, index) {
            this._addChild(instance, index);
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
                this._layoutService.resizePart(part, amount, amount);
                return;
            }
            // Resize left/right in horizontal or up/down in vertical
            // Only resize when there is more than one pane
            if (this._children.length <= 1) {
                return;
            }
            // Get sizes
            const sizes = [];
            for (let i = 0; i < this._splitView.length; i++) {
                sizes.push(this._splitView.getViewSize(i));
            }
            // Remove size from right pane, unless index is the last pane in which case use left pane
            const isSizingEndPane = index !== this._children.length - 1;
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
            for (let i = 0; i < this._splitView.length - 1; i++) {
                this._splitView.resizeView(i, sizes[i]);
            }
        }
        resizePanes(relativeSizes) {
            if (this._children.length <= 1) {
                return;
            }
            // assign any extra size to last terminal
            relativeSizes[relativeSizes.length - 1] += 1 - relativeSizes.reduce((totalValue, currentValue) => totalValue + currentValue, 0);
            let totalSize = 0;
            for (let i = 0; i < this._splitView.length; i++) {
                totalSize += this._splitView.getViewSize(i);
            }
            for (let i = 0; i < this._splitView.length; i++) {
                this._splitView.resizeView(i, totalSize * relativeSizes[i]);
            }
        }
        getPaneSize(instance) {
            const paneForInstance = this._terminalToPane.get(instance);
            if (!paneForInstance) {
                return 0;
            }
            const index = this._children.indexOf(paneForInstance);
            return this._splitView.getViewSize(index);
        }
        _addChild(instance, index) {
            const child = new SplitPane(instance, this.orientation === 1 /* Orientation.HORIZONTAL */ ? this._height : this._width);
            child.orientation = this.orientation;
            if (typeof index === 'number') {
                this._children.splice(index, 0, child);
            }
            else {
                this._children.push(child);
            }
            this._terminalToPane.set(instance, this._children[this._children.indexOf(child)]);
            this._withDisabledLayout(() => this._splitView.addView(child, splitview_1.Sizing.Distribute, index));
            this.layout(this._width, this._height);
            this._onDidChange = event_1.Event.any(...this._children.map(c => c.onDidChange));
        }
        remove(instance) {
            let index = null;
            for (let i = 0; i < this._children.length; i++) {
                if (this._children[i].instance === instance) {
                    index = i;
                }
            }
            if (index !== null) {
                this._children.splice(index, 1);
                this._terminalToPane.delete(instance);
                this._splitView.removeView(index, splitview_1.Sizing.Distribute);
                instance.detachFromElement();
            }
        }
        layout(width, height) {
            this._width = width;
            this._height = height;
            if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                this._children.forEach(c => c.orthogonalLayout(height));
                this._splitView.layout(width);
            }
            else {
                this._children.forEach(c => c.orthogonalLayout(width));
                this._splitView.layout(height);
            }
        }
        setOrientation(orientation) {
            if (this.orientation === orientation) {
                return;
            }
            this.orientation = orientation;
            // Remove old split view
            while (this._container.children.length > 0) {
                this._container.removeChild(this._container.children[0]);
            }
            this._splitViewDisposables.clear();
            this._splitView.dispose();
            // Create new split view with updated orientation
            this._createSplitView();
            this._withDisabledLayout(() => {
                this._children.forEach(child => {
                    child.orientation = orientation;
                    this._splitView.addView(child, 1);
                });
            });
        }
        _withDisabledLayout(innerFunction) {
            // Whenever manipulating views that are going to be changed immediately, disabling
            // layout/resize events in the terminal prevent bad dimensions going to the pty.
            this._children.forEach(c => c.instance.disableLayout = true);
            innerFunction();
            this._children.forEach(c => c.instance.disableLayout = false);
        }
    };
    SplitPaneContainer = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService)
    ], SplitPaneContainer);
    class SplitPane {
        get onDidChange() { return this._onDidChange; }
        constructor(instance, orthogonalSize) {
            this.instance = instance;
            this.orthogonalSize = orthogonalSize;
            this.minimumSize = 80 /* Constants.SplitPaneMinSize */;
            this.maximumSize = Number.MAX_VALUE;
            this._onDidChange = event_1.Event.None;
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
    let TerminalGroup = class TerminalGroup extends lifecycle_1.Disposable {
        get terminalInstances() { return this._terminalInstances; }
        constructor(_container, shellLaunchConfigOrInstance, _terminalService, _terminalInstanceService, _layoutService, _viewDescriptorService, _instantiationService) {
            super();
            this._container = _container;
            this._terminalService = _terminalService;
            this._terminalInstanceService = _terminalInstanceService;
            this._layoutService = _layoutService;
            this._viewDescriptorService = _viewDescriptorService;
            this._instantiationService = _instantiationService;
            this._terminalInstances = [];
            this._panelPosition = 2 /* Position.BOTTOM */;
            this._terminalLocation = 1 /* ViewContainerLocation.Panel */;
            this._instanceDisposables = new Map();
            this._activeInstanceIndex = -1;
            this._visible = false;
            this._onDidDisposeInstance = this._register(new event_1.Emitter());
            this.onDidDisposeInstance = this._onDidDisposeInstance.event;
            this._onDidFocusInstance = this._register(new event_1.Emitter());
            this.onDidFocusInstance = this._onDidFocusInstance.event;
            this._onDidChangeInstanceCapability = this._register(new event_1.Emitter());
            this.onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
            this._onDisposed = this._register(new event_1.Emitter());
            this.onDisposed = this._onDisposed.event;
            this._onInstancesChanged = this._register(new event_1.Emitter());
            this.onInstancesChanged = this._onInstancesChanged.event;
            this._onDidChangeActiveInstance = this._register(new event_1.Emitter());
            this.onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
            this._onPanelOrientationChanged = this._register(new event_1.Emitter());
            this.onPanelOrientationChanged = this._onPanelOrientationChanged.event;
            if (shellLaunchConfigOrInstance) {
                this.addInstance(shellLaunchConfigOrInstance);
            }
            if (this._container) {
                this.attachToElement(this._container);
            }
            this._onPanelOrientationChanged.fire(this._terminalLocation === 1 /* ViewContainerLocation.Panel */ && this._panelPosition === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */);
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this._container && this._groupElement) {
                    this._container.removeChild(this._groupElement);
                    this._groupElement = undefined;
                }
            }));
        }
        addInstance(shellLaunchConfigOrInstance, parentTerminalId) {
            let instance;
            // if a parent terminal is provided, find it
            // otherwise, parent is the active terminal
            const parentIndex = parentTerminalId ? this._terminalInstances.findIndex(t => t.instanceId === parentTerminalId) : this._activeInstanceIndex;
            if ('instanceId' in shellLaunchConfigOrInstance) {
                instance = shellLaunchConfigOrInstance;
            }
            else {
                instance = this._terminalInstanceService.createInstance(shellLaunchConfigOrInstance, terminal_3.TerminalLocation.Panel);
            }
            if (this._terminalInstances.length === 0) {
                this._terminalInstances.push(instance);
                this._activeInstanceIndex = 0;
            }
            else {
                this._terminalInstances.splice(parentIndex + 1, 0, instance);
            }
            this._initInstanceListeners(instance);
            if (this._splitPaneContainer) {
                this._splitPaneContainer.split(instance, parentIndex + 1);
            }
            this._onInstancesChanged.fire();
        }
        dispose() {
            this._terminalInstances = [];
            this._onInstancesChanged.fire();
            super.dispose();
        }
        get activeInstance() {
            if (this._terminalInstances.length === 0) {
                return undefined;
            }
            return this._terminalInstances[this._activeInstanceIndex];
        }
        getLayoutInfo(isActive) {
            const instances = this.terminalInstances.filter(instance => typeof instance.persistentProcessId === 'number' && instance.shouldPersist);
            const totalSize = instances.map(t => this._splitPaneContainer?.getPaneSize(t) || 0).reduce((total, size) => total += size, 0);
            return {
                isActive: isActive,
                activePersistentProcessId: this.activeInstance ? this.activeInstance.persistentProcessId : undefined,
                terminals: instances.map(t => {
                    return {
                        relativeSize: totalSize > 0 ? this._splitPaneContainer.getPaneSize(t) / totalSize : 0,
                        terminal: t.persistentProcessId || 0
                    };
                })
            };
        }
        _initInstanceListeners(instance) {
            this._instanceDisposables.set(instance.instanceId, [
                instance.onDisposed(instance => {
                    this._onDidDisposeInstance.fire(instance);
                    this._handleOnDidDisposeInstance(instance);
                }),
                instance.onDidFocus(instance => {
                    this._setActiveInstance(instance);
                    this._onDidFocusInstance.fire(instance);
                }),
                instance.capabilities.onDidAddCapabilityType(() => this._onDidChangeInstanceCapability.fire(instance)),
                instance.capabilities.onDidRemoveCapabilityType(() => this._onDidChangeInstanceCapability.fire(instance)),
            ]);
        }
        _handleOnDidDisposeInstance(instance) {
            this._removeInstance(instance);
        }
        removeInstance(instance) {
            this._removeInstance(instance);
        }
        _removeInstance(instance) {
            const index = this._terminalInstances.indexOf(instance);
            if (index === -1) {
                return;
            }
            const wasActiveInstance = instance === this.activeInstance;
            this._terminalInstances.splice(index, 1);
            // Adjust focus if the instance was active
            if (wasActiveInstance && this._terminalInstances.length > 0) {
                const newIndex = index < this._terminalInstances.length ? index : this._terminalInstances.length - 1;
                this.setActiveInstanceByIndex(newIndex);
                // TODO: Only focus the new instance if the group had focus?
                this.activeInstance?.focus(true);
            }
            else if (index < this._activeInstanceIndex) {
                // Adjust active instance index if needed
                this._activeInstanceIndex--;
            }
            this._splitPaneContainer?.remove(instance);
            // Fire events and dispose group if it was the last instance
            if (this._terminalInstances.length === 0) {
                this._onDisposed.fire(this);
                this.dispose();
            }
            else {
                this._onInstancesChanged.fire();
            }
            // Dispose instance event listeners
            const disposables = this._instanceDisposables.get(instance.instanceId);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
                this._instanceDisposables.delete(instance.instanceId);
            }
        }
        moveInstance(instance, index) {
            const sourceIndex = this.terminalInstances.indexOf(instance);
            if (sourceIndex === -1) {
                return;
            }
            this._terminalInstances.splice(sourceIndex, 1);
            this._terminalInstances.splice(index, 0, instance);
            if (this._splitPaneContainer) {
                this._splitPaneContainer.remove(instance);
                this._splitPaneContainer.split(instance, index);
            }
            this._onInstancesChanged.fire();
        }
        _setActiveInstance(instance) {
            this.setActiveInstanceByIndex(this._getIndexFromId(instance.instanceId));
        }
        _getIndexFromId(terminalId) {
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
            if (index < 0 || index >= this._terminalInstances.length) {
                return;
            }
            const oldActiveInstance = this.activeInstance;
            this._activeInstanceIndex = index;
            if (oldActiveInstance !== this.activeInstance || force) {
                this._onInstancesChanged.fire();
                this._onDidChangeActiveInstance.fire(this.activeInstance);
            }
        }
        attachToElement(element) {
            this._container = element;
            // If we already have a group element, we can reparent it
            if (!this._groupElement) {
                this._groupElement = document.createElement('div');
                this._groupElement.classList.add('terminal-group');
            }
            this._container.appendChild(this._groupElement);
            if (!this._splitPaneContainer) {
                this._panelPosition = this._layoutService.getPanelPosition();
                this._terminalLocation = this._viewDescriptorService.getViewLocationById(terminal_1.TERMINAL_VIEW_ID);
                const orientation = this._terminalLocation === 1 /* ViewContainerLocation.Panel */ && this._panelPosition === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
                this._splitPaneContainer = this._instantiationService.createInstance(SplitPaneContainer, this._groupElement, orientation);
                this.terminalInstances.forEach(instance => this._splitPaneContainer.split(instance, this._activeInstanceIndex + 1));
            }
        }
        get title() {
            if (this._terminalInstances.length === 0) {
                // Normally consumers should not call into title at all after the group is disposed but
                // this is required when the group is used as part of a tree.
                return '';
            }
            let title = this.terminalInstances[0].title + this._getBellTitle(this.terminalInstances[0]);
            if (this.terminalInstances[0].description) {
                title += ` (${this.terminalInstances[0].description})`;
            }
            for (let i = 1; i < this.terminalInstances.length; i++) {
                const instance = this.terminalInstances[i];
                if (instance.title) {
                    title += `, ${instance.title + this._getBellTitle(instance)}`;
                    if (instance.description) {
                        title += ` (${instance.description})`;
                    }
                }
            }
            return title;
        }
        _getBellTitle(instance) {
            if (this._terminalService.configHelper.config.enableBell && instance.statusList.statuses.some(e => e.id === "bell" /* TerminalStatus.Bell */)) {
                return '*';
            }
            return '';
        }
        setVisible(visible) {
            this._visible = visible;
            if (this._groupElement) {
                this._groupElement.style.display = visible ? '' : 'none';
            }
            this.terminalInstances.forEach(i => i.setVisible(visible));
        }
        split(shellLaunchConfig) {
            const instance = this._terminalInstanceService.createInstance(shellLaunchConfig, terminal_3.TerminalLocation.Panel);
            this.addInstance(instance, shellLaunchConfig.parentTerminalId);
            this._setActiveInstance(instance);
            return instance;
        }
        addDisposable(disposable) {
            this._register(disposable);
        }
        layout(width, height) {
            if (this._splitPaneContainer) {
                // Check if the panel position changed and rotate panes if so
                const newPanelPosition = this._layoutService.getPanelPosition();
                const newTerminalLocation = this._viewDescriptorService.getViewLocationById(terminal_1.TERMINAL_VIEW_ID);
                const terminalPositionChanged = newPanelPosition !== this._panelPosition || newTerminalLocation !== this._terminalLocation;
                if (terminalPositionChanged) {
                    const newOrientation = newTerminalLocation === 1 /* ViewContainerLocation.Panel */ && newPanelPosition === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
                    this._splitPaneContainer.setOrientation(newOrientation);
                    this._panelPosition = newPanelPosition;
                    this._terminalLocation = newTerminalLocation;
                    this._onPanelOrientationChanged.fire(this._splitPaneContainer.orientation);
                }
                this._splitPaneContainer.layout(width, height);
                if (this._initialRelativeSizes && this._visible) {
                    this.resizePanes(this._initialRelativeSizes);
                    this._initialRelativeSizes = undefined;
                }
            }
        }
        focusPreviousPane() {
            const newIndex = this._activeInstanceIndex === 0 ? this._terminalInstances.length - 1 : this._activeInstanceIndex - 1;
            this.setActiveInstanceByIndex(newIndex);
        }
        focusNextPane() {
            const newIndex = this._activeInstanceIndex === this._terminalInstances.length - 1 ? 0 : this._activeInstanceIndex + 1;
            this.setActiveInstanceByIndex(newIndex);
        }
        resizePane(direction) {
            if (!this._splitPaneContainer) {
                return;
            }
            const isHorizontal = (direction === 0 /* Direction.Left */ || direction === 1 /* Direction.Right */);
            const font = this._terminalService.configHelper.getFont();
            // TODO: Support letter spacing and line height
            const charSize = (isHorizontal ? font.charWidth : font.charHeight);
            if (charSize) {
                this._splitPaneContainer.resizePane(this._activeInstanceIndex, direction, charSize * 4 /* Constants.ResizePartCellCount */, (0, viewsService_1.getPartByLocation)(this._terminalLocation));
            }
        }
        resizePanes(relativeSizes) {
            if (!this._splitPaneContainer) {
                this._initialRelativeSizes = relativeSizes;
                return;
            }
            this._splitPaneContainer.resizePanes(relativeSizes);
        }
    };
    exports.TerminalGroup = TerminalGroup;
    exports.TerminalGroup = TerminalGroup = __decorate([
        __param(2, terminal_2.ITerminalService),
        __param(3, terminal_2.ITerminalInstanceService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService)
    ], TerminalGroup);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxHcm91cC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxHcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjaEcsSUFBVyxTQVVWO0lBVkQsV0FBVyxTQUFTO1FBQ25COztXQUVHO1FBQ0gsa0VBQXFCLENBQUE7UUFDckI7OztXQUdHO1FBQ0gsdUVBQXVCLENBQUE7SUFDeEIsQ0FBQyxFQVZVLFNBQVMsS0FBVCxTQUFTLFFBVW5CO0lBRUQsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQVMxQyxJQUFJLFdBQVcsS0FBZ0MsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUUxRSxZQUNTLFVBQXVCLEVBQ3hCLFdBQXdCLEVBQ04sY0FBd0Q7WUFFakYsS0FBSyxFQUFFLENBQUM7WUFKQSxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3hCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ1csbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBVmpFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUN2RSxjQUFTLEdBQWdCLEVBQUUsQ0FBQztZQUM1QixvQkFBZSxHQUFzQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRS9ELGlCQUFZLEdBQThCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFTNUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO1lBQzVDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FB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