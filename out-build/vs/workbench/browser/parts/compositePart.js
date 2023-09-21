/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/compositePart", "vs/base/common/idGenerator", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/errors", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/progressbar/progressbar", "vs/workbench/browser/part", "vs/platform/instantiation/common/serviceCollection", "vs/platform/progress/common/progress", "vs/base/browser/dom", "vs/base/common/types", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/services/progress/browser/progressIndicator", "vs/platform/actions/browser/toolbar", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/compositepart"], function (require, exports, nls_1, idGenerator_1, lifecycle_1, event_1, errors_1, actionbar_1, progressbar_1, part_1, serviceCollection_1, progress_1, dom_1, types_1, menuEntryActionViewItem_1, progressIndicator_1, toolbar_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5xb = void 0;
    class $5xb extends part_1.Part {
        constructor(db, eb, fb, layoutService, gb, hb, themeService, ib, jb, kb, lb, mb, nb, id, options) {
            super(id, options, themeService, eb, layoutService);
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.a = this.B(new event_1.$fd());
            this.b = this.B(new event_1.$fd());
            this.Q = new Map();
            this.R = new Map();
            this.W = new Map();
            this.ab = this.B(new lifecycle_1.$lc());
            this.U = eb.get(jb, 1 /* StorageScope.WORKSPACE */, this.kb);
        }
        ob(id, focus) {
            // Check if composite already visible and just focus in that case
            if (this.S?.getId() === id) {
                if (focus) {
                    this.S.focus();
                }
                // Fullfill promise with composite that is being opened
                return this.S;
            }
            // We cannot open the composite if we have not been created yet
            if (!this.element) {
                return;
            }
            // Open
            return this.pb(id, focus);
        }
        pb(id, focus = false) {
            // Use a generated token to avoid race conditions from long running promises
            const currentCompositeOpenToken = idGenerator_1.$8L.nextId();
            this.bb = currentCompositeOpenToken;
            // Hide current
            if (this.S) {
                this.xb();
            }
            // Update Title
            this.tb(id);
            // Create composite
            const composite = this.qb(id, true);
            // Check if another composite opened meanwhile and return in that case
            if ((this.bb !== currentCompositeOpenToken) || (this.S && this.S.getId() !== composite.getId())) {
                return undefined;
            }
            // Check if composite already visible and just focus in that case
            if (this.S?.getId() === composite.getId()) {
                if (focus) {
                    composite.focus();
                }
                this.a.fire({ composite, focus });
                return composite;
            }
            // Show Composite and Focus
            this.rb(composite);
            if (focus) {
                composite.focus();
            }
            // Return with the composite that is being opened
            if (composite) {
                this.a.fire({ composite, focus });
            }
            return composite;
        }
        qb(id, isActive) {
            // Check if composite is already created
            const compositeItem = this.W.get(id);
            if (compositeItem) {
                return compositeItem.composite;
            }
            // Instantiate composite from registry otherwise
            const compositeDescriptor = this.ib.getComposite(id);
            if (compositeDescriptor) {
                const that = this;
                const compositeProgressIndicator = new progressIndicator_1.$Deb((0, types_1.$uf)(this.Y), new class extends progressIndicator_1.$Eeb {
                    constructor() {
                        super(compositeDescriptor.id, !!isActive);
                        this.B(that.a.event(e => this.f(e.composite.getId())));
                        this.B(that.b.event(e => this.g(e.getId())));
                    }
                }());
                const compositeInstantiationService = this.hb.createChild(new serviceCollection_1.$zh([progress_1.$7u, compositeProgressIndicator] // provide the editor progress service for any editors instantiated within the composite
                ));
                const composite = compositeDescriptor.instantiate(compositeInstantiationService);
                const disposable = new lifecycle_1.$jc();
                // Remember as Instantiated
                this.W.set(id, { composite, disposable, progress: compositeProgressIndicator });
                // Register to title area update events from the composite
                disposable.add(composite.onTitleAreaUpdate(() => this.sb(composite.getId()), this));
                return composite;
            }
            throw new Error(`Unable to find composite with id ${id}`);
        }
        rb(composite) {
            // Remember Composite
            this.S = composite;
            // Store in preferences
            const id = this.S.getId();
            if (id !== this.kb) {
                this.eb.store(this.jb, id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.eb.remove(this.jb, 1 /* StorageScope.WORKSPACE */);
            }
            // Remember
            this.U = this.S.getId();
            // Composites created for the first time
            let compositeContainer = this.Q.get(composite.getId());
            if (!compositeContainer) {
                // Build Container off-DOM
                compositeContainer = (0, dom_1.$)('.composite');
                compositeContainer.classList.add(...this.mb.split(' '));
                compositeContainer.id = composite.getId();
                composite.create(compositeContainer);
                composite.updateStyles();
                // Remember composite container
                this.Q.set(composite.getId(), compositeContainer);
            }
            // Fill Content and Actions
            // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
            if (!this.S || composite.getId() !== this.S.getId()) {
                return undefined;
            }
            // Take Composite on-DOM and show
            const contentArea = this.M();
            contentArea?.appendChild(compositeContainer);
            (0, dom_1.$dP)(compositeContainer);
            // Setup action runner
            const toolBar = (0, types_1.$uf)(this.y);
            toolBar.actionRunner = composite.getActionRunner();
            // Update title with composite title if it differs from descriptor
            const descriptor = this.ib.getComposite(composite.getId());
            if (descriptor && descriptor.name !== composite.getTitle()) {
                this.tb(composite.getId(), composite.getTitle());
            }
            // Handle Composite Actions
            let actionsBinding = this.R.get(composite.getId());
            if (!actionsBinding) {
                actionsBinding = this.ub(composite);
                this.R.set(composite.getId(), actionsBinding);
            }
            actionsBinding();
            // Action Run Handling
            this.ab.value = toolBar.actionRunner.onDidRun(e => {
                // Check for Error
                if (e.error && !(0, errors_1.$2)(e.error)) {
                    this.db.error(e.error);
                }
            });
            // Indicate to composite that it is now visible
            composite.setVisible(true);
            // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
            if (!this.S || composite.getId() !== this.S.getId()) {
                return;
            }
            // Make sure the composite is layed out
            if (this.Z) {
                composite.layout(this.Z);
            }
            // Make sure boundary sashes are propagated
            if (this.cb) {
                composite.setBoundarySashes(this.cb);
            }
        }
        sb(compositeId) {
            // Title
            const composite = this.W.get(compositeId);
            if (composite) {
                this.tb(compositeId, composite.composite.getTitle());
            }
            // Active Composite
            if (this.S?.getId() === compositeId) {
                // Actions
                const actionsBinding = this.ub(this.S);
                this.R.set(this.S.getId(), actionsBinding);
                actionsBinding();
            }
            // Otherwise invalidate actions binding for next time when the composite becomes visible
            else {
                this.R.delete(compositeId);
            }
        }
        tb(compositeId, compositeTitle) {
            const compositeDescriptor = this.ib.getComposite(compositeId);
            if (!compositeDescriptor || !this.X) {
                return;
            }
            if (!compositeTitle) {
                compositeTitle = compositeDescriptor.name;
            }
            const keybinding = this.gb.lookupKeybinding(compositeId);
            this.X.updateTitle(compositeId, compositeTitle, keybinding?.getLabel() ?? undefined);
            const toolBar = (0, types_1.$uf)(this.y);
            toolBar.setAriaLabel((0, nls_1.localize)(0, null, compositeTitle));
        }
        ub(composite) {
            // From Composite
            const menuIds = composite?.getMenuIds();
            const primaryActions = composite?.getActions().slice(0) || [];
            const secondaryActions = composite?.getSecondaryActions().slice(0) || [];
            // Update context
            const toolBar = (0, types_1.$uf)(this.y);
            toolBar.context = this.Bb();
            // Return fn to set into toolbar
            return () => toolBar.setActions((0, actionbar_1.$2P)(primaryActions), (0, actionbar_1.$2P)(secondaryActions), menuIds);
        }
        vb() {
            return this.S;
        }
        wb() {
            return this.U;
        }
        xb() {
            if (!this.S) {
                return undefined; // Nothing to do
            }
            const composite = this.S;
            this.S = undefined;
            const compositeContainer = this.Q.get(composite.getId());
            // Indicate to Composite
            composite.setVisible(false);
            // Take Container Off-DOM and hide
            if (compositeContainer) {
                compositeContainer.remove();
                (0, dom_1.$eP)(compositeContainer);
            }
            // Clear any running Progress
            this.Y?.stop().hide();
            // Empty Actions
            if (this.y) {
                this.ub()();
            }
            this.b.fire(composite);
            return composite;
        }
        I(parent) {
            // Title Area Container
            const titleArea = (0, dom_1.$0O)(parent, (0, dom_1.$)('.composite'));
            titleArea.classList.add('title');
            // Left Title Label
            this.X = this.zb(titleArea);
            // Right Actions Container
            const titleActionsContainer = (0, dom_1.$0O)(titleArea, (0, dom_1.$)('.title-actions'));
            // Toolbar
            this.y = this.B(this.hb.createInstance(toolbar_1.$L6, titleActionsContainer, {
                actionViewItemProvider: action => this.Ab(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                getKeyBinding: action => this.gb.lookupKeybinding(action.id),
                anchorAlignmentProvider: () => this.Db(),
                toggleMenuTitle: (0, nls_1.localize)(1, null),
                telemetrySource: this.lb
            }));
            this.ub()();
            return titleArea;
        }
        zb(parent) {
            const titleContainer = (0, dom_1.$0O)(parent, (0, dom_1.$)('.title-label'));
            const titleLabel = (0, dom_1.$0O)(titleContainer, (0, dom_1.$)('h2'));
            this.P = titleLabel;
            const $this = this;
            return {
                updateTitle: (id, title, keybinding) => {
                    // The title label is shared for all composites in the base CompositePart
                    if (!this.S || this.S.getId() === id) {
                        titleLabel.innerText = title;
                        titleLabel.title = keybinding ? (0, nls_1.localize)(2, null, title, keybinding) : title;
                    }
                },
                updateStyles: () => {
                    titleLabel.style.color = $this.nb ? $this.z($this.nb) || '' : '';
                }
            };
        }
        updateStyles() {
            super.updateStyles();
            // Forward to title label
            const titleLabel = (0, types_1.$uf)(this.X);
            titleLabel.updateStyles();
        }
        Ab(action) {
            // Check Active Composite
            if (this.S) {
                return this.S.getActionViewItem(action);
            }
            return (0, menuEntryActionViewItem_1.$F3)(this.hb, action);
        }
        Bb() {
            // Check Active Composite
            if (this.S) {
                return this.S.getActionsContext();
            }
            return null;
        }
        L(parent) {
            const contentContainer = (0, dom_1.$0O)(parent, (0, dom_1.$)('.content'));
            this.Y = this.B(new progressbar_1.$YR(contentContainer, defaultStyles_1.$k2));
            this.Y.hide();
            return contentContainer;
        }
        getProgressIndicator(id) {
            const compositeItem = this.W.get(id);
            return compositeItem ? compositeItem.progress : undefined;
        }
        Db() {
            return 1 /* AnchorAlignment.RIGHT */;
        }
        layout(width, height, top, left) {
            super.layout(width, height, top, left);
            // Layout contents
            this.Z = dom_1.$BO.lift(super.N(width, height).contentSize);
            // Layout composite
            this.S?.layout(this.Z);
        }
        setBoundarySashes(sashes) {
            this.cb = sashes;
            this.S?.setBoundarySashes(sashes);
        }
        Eb(compositeId) {
            if (this.S?.getId() === compositeId) {
                return false; // do not remove active composite
            }
            this.Q.delete(compositeId);
            this.R.delete(compositeId);
            const compositeItem = this.W.get(compositeId);
            if (compositeItem) {
                compositeItem.composite.dispose();
                (0, lifecycle_1.$fc)(compositeItem.disposable);
                this.W.delete(compositeId);
            }
            return true;
        }
        dispose() {
            this.Q.clear();
            this.R.clear();
            this.W.forEach(compositeItem => {
                compositeItem.composite.dispose();
                (0, lifecycle_1.$fc)(compositeItem.disposable);
            });
            this.W.clear();
            super.dispose();
        }
    }
    exports.$5xb = $5xb;
});
//# sourceMappingURL=compositePart.js.map