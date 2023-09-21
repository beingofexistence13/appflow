/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/idGenerator", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/errors", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/progressbar/progressbar", "vs/workbench/browser/part", "vs/platform/instantiation/common/serviceCollection", "vs/platform/progress/common/progress", "vs/base/browser/dom", "vs/base/common/types", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/services/progress/browser/progressIndicator", "vs/platform/actions/browser/toolbar", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/compositepart"], function (require, exports, nls_1, idGenerator_1, lifecycle_1, event_1, errors_1, actionbar_1, progressbar_1, part_1, serviceCollection_1, progress_1, dom_1, types_1, menuEntryActionViewItem_1, progressIndicator_1, toolbar_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositePart = void 0;
    class CompositePart extends part_1.Part {
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, registry, activeCompositeSettingsKey, defaultCompositeId, nameForTelemetry, compositeCSSClass, titleForegroundColor, id, options) {
            super(id, options, themeService, storageService, layoutService);
            this.notificationService = notificationService;
            this.storageService = storageService;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.instantiationService = instantiationService;
            this.registry = registry;
            this.activeCompositeSettingsKey = activeCompositeSettingsKey;
            this.defaultCompositeId = defaultCompositeId;
            this.nameForTelemetry = nameForTelemetry;
            this.compositeCSSClass = compositeCSSClass;
            this.titleForegroundColor = titleForegroundColor;
            this.onDidCompositeOpen = this._register(new event_1.Emitter());
            this.onDidCompositeClose = this._register(new event_1.Emitter());
            this.mapCompositeToCompositeContainer = new Map();
            this.mapActionsBindingToComposite = new Map();
            this.instantiatedCompositeItems = new Map();
            this.actionsListener = this._register(new lifecycle_1.MutableDisposable());
            this.lastActiveCompositeId = storageService.get(activeCompositeSettingsKey, 1 /* StorageScope.WORKSPACE */, this.defaultCompositeId);
        }
        openComposite(id, focus) {
            // Check if composite already visible and just focus in that case
            if (this.activeComposite?.getId() === id) {
                if (focus) {
                    this.activeComposite.focus();
                }
                // Fullfill promise with composite that is being opened
                return this.activeComposite;
            }
            // We cannot open the composite if we have not been created yet
            if (!this.element) {
                return;
            }
            // Open
            return this.doOpenComposite(id, focus);
        }
        doOpenComposite(id, focus = false) {
            // Use a generated token to avoid race conditions from long running promises
            const currentCompositeOpenToken = idGenerator_1.defaultGenerator.nextId();
            this.currentCompositeOpenToken = currentCompositeOpenToken;
            // Hide current
            if (this.activeComposite) {
                this.hideActiveComposite();
            }
            // Update Title
            this.updateTitle(id);
            // Create composite
            const composite = this.createComposite(id, true);
            // Check if another composite opened meanwhile and return in that case
            if ((this.currentCompositeOpenToken !== currentCompositeOpenToken) || (this.activeComposite && this.activeComposite.getId() !== composite.getId())) {
                return undefined;
            }
            // Check if composite already visible and just focus in that case
            if (this.activeComposite?.getId() === composite.getId()) {
                if (focus) {
                    composite.focus();
                }
                this.onDidCompositeOpen.fire({ composite, focus });
                return composite;
            }
            // Show Composite and Focus
            this.showComposite(composite);
            if (focus) {
                composite.focus();
            }
            // Return with the composite that is being opened
            if (composite) {
                this.onDidCompositeOpen.fire({ composite, focus });
            }
            return composite;
        }
        createComposite(id, isActive) {
            // Check if composite is already created
            const compositeItem = this.instantiatedCompositeItems.get(id);
            if (compositeItem) {
                return compositeItem.composite;
            }
            // Instantiate composite from registry otherwise
            const compositeDescriptor = this.registry.getComposite(id);
            if (compositeDescriptor) {
                const that = this;
                const compositeProgressIndicator = new progressIndicator_1.ScopedProgressIndicator((0, types_1.assertIsDefined)(this.progressBar), new class extends progressIndicator_1.AbstractProgressScope {
                    constructor() {
                        super(compositeDescriptor.id, !!isActive);
                        this._register(that.onDidCompositeOpen.event(e => this.onScopeOpened(e.composite.getId())));
                        this._register(that.onDidCompositeClose.event(e => this.onScopeClosed(e.getId())));
                    }
                }());
                const compositeInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([progress_1.IEditorProgressService, compositeProgressIndicator] // provide the editor progress service for any editors instantiated within the composite
                ));
                const composite = compositeDescriptor.instantiate(compositeInstantiationService);
                const disposable = new lifecycle_1.DisposableStore();
                // Remember as Instantiated
                this.instantiatedCompositeItems.set(id, { composite, disposable, progress: compositeProgressIndicator });
                // Register to title area update events from the composite
                disposable.add(composite.onTitleAreaUpdate(() => this.onTitleAreaUpdate(composite.getId()), this));
                return composite;
            }
            throw new Error(`Unable to find composite with id ${id}`);
        }
        showComposite(composite) {
            // Remember Composite
            this.activeComposite = composite;
            // Store in preferences
            const id = this.activeComposite.getId();
            if (id !== this.defaultCompositeId) {
                this.storageService.store(this.activeCompositeSettingsKey, id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(this.activeCompositeSettingsKey, 1 /* StorageScope.WORKSPACE */);
            }
            // Remember
            this.lastActiveCompositeId = this.activeComposite.getId();
            // Composites created for the first time
            let compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
            if (!compositeContainer) {
                // Build Container off-DOM
                compositeContainer = (0, dom_1.$)('.composite');
                compositeContainer.classList.add(...this.compositeCSSClass.split(' '));
                compositeContainer.id = composite.getId();
                composite.create(compositeContainer);
                composite.updateStyles();
                // Remember composite container
                this.mapCompositeToCompositeContainer.set(composite.getId(), compositeContainer);
            }
            // Fill Content and Actions
            // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
            if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
                return undefined;
            }
            // Take Composite on-DOM and show
            const contentArea = this.getContentArea();
            contentArea?.appendChild(compositeContainer);
            (0, dom_1.show)(compositeContainer);
            // Setup action runner
            const toolBar = (0, types_1.assertIsDefined)(this.toolBar);
            toolBar.actionRunner = composite.getActionRunner();
            // Update title with composite title if it differs from descriptor
            const descriptor = this.registry.getComposite(composite.getId());
            if (descriptor && descriptor.name !== composite.getTitle()) {
                this.updateTitle(composite.getId(), composite.getTitle());
            }
            // Handle Composite Actions
            let actionsBinding = this.mapActionsBindingToComposite.get(composite.getId());
            if (!actionsBinding) {
                actionsBinding = this.collectCompositeActions(composite);
                this.mapActionsBindingToComposite.set(composite.getId(), actionsBinding);
            }
            actionsBinding();
            // Action Run Handling
            this.actionsListener.value = toolBar.actionRunner.onDidRun(e => {
                // Check for Error
                if (e.error && !(0, errors_1.isCancellationError)(e.error)) {
                    this.notificationService.error(e.error);
                }
            });
            // Indicate to composite that it is now visible
            composite.setVisible(true);
            // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
            if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
                return;
            }
            // Make sure the composite is layed out
            if (this.contentAreaSize) {
                composite.layout(this.contentAreaSize);
            }
            // Make sure boundary sashes are propagated
            if (this.boundarySashes) {
                composite.setBoundarySashes(this.boundarySashes);
            }
        }
        onTitleAreaUpdate(compositeId) {
            // Title
            const composite = this.instantiatedCompositeItems.get(compositeId);
            if (composite) {
                this.updateTitle(compositeId, composite.composite.getTitle());
            }
            // Active Composite
            if (this.activeComposite?.getId() === compositeId) {
                // Actions
                const actionsBinding = this.collectCompositeActions(this.activeComposite);
                this.mapActionsBindingToComposite.set(this.activeComposite.getId(), actionsBinding);
                actionsBinding();
            }
            // Otherwise invalidate actions binding for next time when the composite becomes visible
            else {
                this.mapActionsBindingToComposite.delete(compositeId);
            }
        }
        updateTitle(compositeId, compositeTitle) {
            const compositeDescriptor = this.registry.getComposite(compositeId);
            if (!compositeDescriptor || !this.titleLabel) {
                return;
            }
            if (!compositeTitle) {
                compositeTitle = compositeDescriptor.name;
            }
            const keybinding = this.keybindingService.lookupKeybinding(compositeId);
            this.titleLabel.updateTitle(compositeId, compositeTitle, keybinding?.getLabel() ?? undefined);
            const toolBar = (0, types_1.assertIsDefined)(this.toolBar);
            toolBar.setAriaLabel((0, nls_1.localize)('ariaCompositeToolbarLabel', "{0} actions", compositeTitle));
        }
        collectCompositeActions(composite) {
            // From Composite
            const menuIds = composite?.getMenuIds();
            const primaryActions = composite?.getActions().slice(0) || [];
            const secondaryActions = composite?.getSecondaryActions().slice(0) || [];
            // Update context
            const toolBar = (0, types_1.assertIsDefined)(this.toolBar);
            toolBar.context = this.actionsContextProvider();
            // Return fn to set into toolbar
            return () => toolBar.setActions((0, actionbar_1.prepareActions)(primaryActions), (0, actionbar_1.prepareActions)(secondaryActions), menuIds);
        }
        getActiveComposite() {
            return this.activeComposite;
        }
        getLastActiveCompositeId() {
            return this.lastActiveCompositeId;
        }
        hideActiveComposite() {
            if (!this.activeComposite) {
                return undefined; // Nothing to do
            }
            const composite = this.activeComposite;
            this.activeComposite = undefined;
            const compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
            // Indicate to Composite
            composite.setVisible(false);
            // Take Container Off-DOM and hide
            if (compositeContainer) {
                compositeContainer.remove();
                (0, dom_1.hide)(compositeContainer);
            }
            // Clear any running Progress
            this.progressBar?.stop().hide();
            // Empty Actions
            if (this.toolBar) {
                this.collectCompositeActions()();
            }
            this.onDidCompositeClose.fire(composite);
            return composite;
        }
        createTitleArea(parent) {
            // Title Area Container
            const titleArea = (0, dom_1.append)(parent, (0, dom_1.$)('.composite'));
            titleArea.classList.add('title');
            // Left Title Label
            this.titleLabel = this.createTitleLabel(titleArea);
            // Right Actions Container
            const titleActionsContainer = (0, dom_1.append)(titleArea, (0, dom_1.$)('.title-actions'));
            // Toolbar
            this.toolBar = this._register(this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, titleActionsContainer, {
                actionViewItemProvider: action => this.actionViewItemProvider(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                anchorAlignmentProvider: () => this.getTitleAreaDropDownAnchorAlignment(),
                toggleMenuTitle: (0, nls_1.localize)('viewsAndMoreActions', "Views and More Actions..."),
                telemetrySource: this.nameForTelemetry
            }));
            this.collectCompositeActions()();
            return titleArea;
        }
        createTitleLabel(parent) {
            const titleContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.title-label'));
            const titleLabel = (0, dom_1.append)(titleContainer, (0, dom_1.$)('h2'));
            this.titleLabelElement = titleLabel;
            const $this = this;
            return {
                updateTitle: (id, title, keybinding) => {
                    // The title label is shared for all composites in the base CompositePart
                    if (!this.activeComposite || this.activeComposite.getId() === id) {
                        titleLabel.innerText = title;
                        titleLabel.title = keybinding ? (0, nls_1.localize)('titleTooltip', "{0} ({1})", title, keybinding) : title;
                    }
                },
                updateStyles: () => {
                    titleLabel.style.color = $this.titleForegroundColor ? $this.getColor($this.titleForegroundColor) || '' : '';
                }
            };
        }
        updateStyles() {
            super.updateStyles();
            // Forward to title label
            const titleLabel = (0, types_1.assertIsDefined)(this.titleLabel);
            titleLabel.updateStyles();
        }
        actionViewItemProvider(action) {
            // Check Active Composite
            if (this.activeComposite) {
                return this.activeComposite.getActionViewItem(action);
            }
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
        }
        actionsContextProvider() {
            // Check Active Composite
            if (this.activeComposite) {
                return this.activeComposite.getActionsContext();
            }
            return null;
        }
        createContentArea(parent) {
            const contentContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.content'));
            this.progressBar = this._register(new progressbar_1.ProgressBar(contentContainer, defaultStyles_1.defaultProgressBarStyles));
            this.progressBar.hide();
            return contentContainer;
        }
        getProgressIndicator(id) {
            const compositeItem = this.instantiatedCompositeItems.get(id);
            return compositeItem ? compositeItem.progress : undefined;
        }
        getTitleAreaDropDownAnchorAlignment() {
            return 1 /* AnchorAlignment.RIGHT */;
        }
        layout(width, height, top, left) {
            super.layout(width, height, top, left);
            // Layout contents
            this.contentAreaSize = dom_1.Dimension.lift(super.layoutContents(width, height).contentSize);
            // Layout composite
            this.activeComposite?.layout(this.contentAreaSize);
        }
        setBoundarySashes(sashes) {
            this.boundarySashes = sashes;
            this.activeComposite?.setBoundarySashes(sashes);
        }
        removeComposite(compositeId) {
            if (this.activeComposite?.getId() === compositeId) {
                return false; // do not remove active composite
            }
            this.mapCompositeToCompositeContainer.delete(compositeId);
            this.mapActionsBindingToComposite.delete(compositeId);
            const compositeItem = this.instantiatedCompositeItems.get(compositeId);
            if (compositeItem) {
                compositeItem.composite.dispose();
                (0, lifecycle_1.dispose)(compositeItem.disposable);
                this.instantiatedCompositeItems.delete(compositeId);
            }
            return true;
        }
        dispose() {
            this.mapCompositeToCompositeContainer.clear();
            this.mapActionsBindingToComposite.clear();
            this.instantiatedCompositeItems.forEach(compositeItem => {
                compositeItem.composite.dispose();
                (0, lifecycle_1.dispose)(compositeItem.disposable);
            });
            this.instantiatedCompositeItems.clear();
            super.dispose();
        }
    }
    exports.CompositePart = CompositePart;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9zaXRlUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2NvbXBvc2l0ZVBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbURoRyxNQUFzQixhQUFtQyxTQUFRLFdBQUk7UUFvQnBFLFlBQ2tCLG1CQUF5QyxFQUN2QyxjQUErQixFQUMvQixrQkFBdUMsRUFDMUQsYUFBc0MsRUFDbkIsaUJBQXFDLEVBQ3JDLG9CQUEyQyxFQUM5RCxZQUEyQixFQUNSLFFBQThCLEVBQ2hDLDBCQUFrQyxFQUNsQyxrQkFBMEIsRUFDMUIsZ0JBQXdCLEVBQ3hCLGlCQUF5QixFQUN6QixvQkFBd0MsRUFDekQsRUFBVSxFQUNWLE9BQXFCO1lBRXJCLEtBQUssQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFoQi9DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDdkMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFFdkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNyQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRTNDLGFBQVEsR0FBUixRQUFRLENBQXNCO1lBQ2hDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBUTtZQUNsQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7WUFDMUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1lBQ3hCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUTtZQUN6Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQW9CO1lBL0J2Qyx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUE2QyxDQUFDLENBQUM7WUFDOUYsd0JBQW1CLEdBQUcs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