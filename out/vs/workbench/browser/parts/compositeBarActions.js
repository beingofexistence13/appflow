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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dnd", "vs/platform/keybinding/common/keybinding", "vs/base/common/event", "vs/workbench/browser/dnd", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/services/hover/browser/hover", "vs/base/common/async", "vs/platform/configuration/common/configuration"], function (require, exports, nls_1, actions_1, dom_1, commands_1, lifecycle_1, contextView_1, themeService_1, activity_1, instantiation_1, colorRegistry_1, dnd_1, keybinding_1, event_1, dnd_2, actionViewItems_1, codicons_1, themables_1, hover_1, async_1, configuration_1) {
    "use strict";
    var ActivityActionViewItem_1, CompositeActionViewItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleCompositeBadgeAction = exports.ToggleCompositePinnedAction = exports.CompositeActionViewItem = exports.CompositeOverflowActivityActionViewItem = exports.CompositeOverflowActivityAction = exports.ActivityActionViewItem = exports.ActivityAction = void 0;
    class ActivityAction extends actions_1.Action {
        constructor(_activity) {
            super(_activity.id, _activity.name, _activity.classNames?.join(' '), true);
            this._activity = _activity;
            this._onDidChangeActivity = this._register(new event_1.Emitter());
            this.onDidChangeActivity = this._onDidChangeActivity.event;
            this._onDidChangeBadge = this._register(new event_1.Emitter());
            this.onDidChangeBadge = this._onDidChangeBadge.event;
        }
        get activity() {
            return this._activity;
        }
        set activity(activity) {
            this._label = activity.name;
            this._activity = activity;
            this._onDidChangeActivity.fire(this);
        }
        activate() {
            if (!this.checked) {
                this._setChecked(true);
            }
        }
        deactivate() {
            if (this.checked) {
                this._setChecked(false);
            }
        }
        getBadge() {
            return this.badge;
        }
        getClass() {
            return this.clazz;
        }
        setBadge(badge, clazz) {
            this.badge = badge;
            this.clazz = clazz;
            this._onDidChangeBadge.fire(this);
        }
        dispose() {
            this._onDidChangeActivity.dispose();
            this._onDidChangeBadge.dispose();
            super.dispose();
        }
    }
    exports.ActivityAction = ActivityAction;
    let ActivityActionViewItem = class ActivityActionViewItem extends actionViewItems_1.BaseActionViewItem {
        static { ActivityActionViewItem_1 = this; }
        static { this.hoverLeaveTime = 0; }
        constructor(action, options, badgesEnabled, themeService, hoverService, configurationService, keybindingService) {
            super(null, action, options);
            this.badgesEnabled = badgesEnabled;
            this.themeService = themeService;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.badgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.hoverDisposables = this._register(new lifecycle_1.DisposableStore());
            this.showHoverScheduler = new async_1.RunOnceScheduler(() => this.showHover(), 0);
            this.options = options;
            this._register(this.themeService.onDidColorThemeChange(this.onThemeChange, this));
            this._register(action.onDidChangeActivity(this.updateActivity, this));
            this._register(event_1.Event.filter(keybindingService.onDidUpdateKeybindings, () => this.keybindingLabel !== this.computeKeybindingLabel())(() => this.updateTitle()));
            this._register(action.onDidChangeBadge(this.updateBadge, this));
            this._register((0, lifecycle_1.toDisposable)(() => this.showHoverScheduler.cancel()));
        }
        get activity() {
            return this._action.activity;
        }
        updateStyles() {
            const theme = this.themeService.getColorTheme();
            const colors = this.options.colors(theme);
            if (this.label) {
                if (this.options.icon) {
                    const foreground = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
                    if (this.activity.iconUrl) {
                        // Apply background color to activity bar item provided with iconUrls
                        this.label.style.backgroundColor = foreground ? foreground.toString() : '';
                        this.label.style.color = '';
                    }
                    else {
                        // Apply foreground color to activity bar items provided with codicons
                        this.label.style.color = foreground ? foreground.toString() : '';
                        this.label.style.backgroundColor = '';
                    }
                }
                else {
                    const foreground = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
                    const borderBottomColor = this._action.checked ? colors.activeBorderBottomColor : null;
                    this.label.style.color = foreground ? foreground.toString() : '';
                    this.label.style.borderBottomColor = borderBottomColor ? borderBottomColor.toString() : '';
                }
                this.container.style.setProperty('--insert-border-color', colors.dragAndDropBorder ? colors.dragAndDropBorder.toString() : '');
            }
            // Badge
            if (this.badgeContent) {
                const badgeForeground = colors.badgeForeground;
                const badgeBackground = colors.badgeBackground;
                const contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
                this.badgeContent.style.color = badgeForeground ? badgeForeground.toString() : '';
                this.badgeContent.style.backgroundColor = badgeBackground ? badgeBackground.toString() : '';
                this.badgeContent.style.borderStyle = contrastBorderColor ? 'solid' : '';
                this.badgeContent.style.borderWidth = contrastBorderColor ? '1px' : '';
                this.badgeContent.style.borderColor = contrastBorderColor ? contrastBorderColor.toString() : '';
            }
        }
        render(container) {
            super.render(container);
            this.container = container;
            if (this.options.icon) {
                this.container.classList.add('icon');
            }
            if (this.options.hasPopup) {
                this.container.setAttribute('role', 'button');
                this.container.setAttribute('aria-haspopup', 'true');
            }
            else {
                this.container.setAttribute('role', 'tab');
            }
            // Try hard to prevent keyboard only focus feedback when using mouse
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.MOUSE_DOWN, () => {
                this.container.classList.add('clicked');
            }));
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.MOUSE_UP, () => {
                if (this.mouseUpTimeout) {
                    clearTimeout(this.mouseUpTimeout);
                }
                this.mouseUpTimeout = setTimeout(() => {
                    this.container.classList.remove('clicked');
                }, 800); // delayed to prevent focus feedback from showing on mouse up
            }));
            // Label
            this.label = (0, dom_1.append)(container, (0, dom_1.$)('a'));
            // Badge
            this.badge = (0, dom_1.append)(container, (0, dom_1.$)('.badge'));
            this.badgeContent = (0, dom_1.append)(this.badge, (0, dom_1.$)('.badge-content'));
            // pane composite bar active border + background
            (0, dom_1.append)(container, (0, dom_1.$)('.active-item-indicator'));
            (0, dom_1.hide)(this.badge);
            this.updateActivity();
            this.updateStyles();
            this.updateHover();
        }
        onThemeChange(theme) {
            this.updateStyles();
        }
        updateActivity() {
            this.updateLabel();
            this.updateTitle();
            this.updateBadge();
            this.updateStyles();
        }
        updateBadge() {
            const action = this.action;
            if (!this.badge || !this.badgeContent || !(action instanceof ActivityAction)) {
                return;
            }
            const badge = action.getBadge();
            const clazz = action.getClass();
            this.badgeDisposable.clear();
            (0, dom_1.clearNode)(this.badgeContent);
            (0, dom_1.hide)(this.badge);
            const shouldRenderBadges = this.badgesEnabled(this.activity.id);
            if (badge && shouldRenderBadges) {
                // Number
                if (badge instanceof activity_1.NumberBadge) {
                    if (badge.number) {
                        let number = badge.number.toString();
                        if (badge.number > 999) {
                            const noOfThousands = badge.number / 1000;
                            const floor = Math.floor(noOfThousands);
                            if (noOfThousands > floor) {
                                number = `${floor}K+`;
                            }
                            else {
                                number = `${noOfThousands}K`;
                            }
                        }
                        this.badgeContent.textContent = number;
                        (0, dom_1.show)(this.badge);
                    }
                }
                // Text
                else if (badge instanceof activity_1.TextBadge) {
                    this.badgeContent.textContent = badge.text;
                    (0, dom_1.show)(this.badge);
                }
                // Icon
                else if (badge instanceof activity_1.IconBadge) {
                    const clazzList = themables_1.ThemeIcon.asClassNameArray(badge.icon);
                    this.badgeContent.classList.add(...clazzList);
                    (0, dom_1.show)(this.badge);
                }
                // Progress
                else if (badge instanceof activity_1.ProgressBadge) {
                    (0, dom_1.show)(this.badge);
                }
                if (clazz) {
                    const classNames = clazz.split(' ');
                    this.badge.classList.add(...classNames);
                    this.badgeDisposable.value = (0, lifecycle_1.toDisposable)(() => this.badge.classList.remove(...classNames));
                }
            }
            this.updateTitle();
        }
        updateLabel() {
            this.label.className = 'action-label';
            if (this.activity.classNames) {
                this.label.classList.add(...this.activity.classNames);
            }
            if (!this.options.icon) {
                this.label.textContent = this.action.label;
            }
        }
        updateTitle() {
            const title = this.computeTitle();
            [this.label, this.badge, this.container].forEach(element => {
                if (element) {
                    element.setAttribute('aria-label', title);
                    element.setAttribute('title', '');
                    element.removeAttribute('title');
                }
            });
        }
        computeTitle() {
            this.keybindingLabel = this.computeKeybindingLabel();
            let title = this.keybindingLabel ? (0, nls_1.localize)('titleKeybinding', "{0} ({1})", this.activity.name, this.keybindingLabel) : this.activity.name;
            const badge = this.action.getBadge();
            if (badge?.getDescription()) {
                title = (0, nls_1.localize)('badgeTitle', "{0} - {1}", title, badge.getDescription());
            }
            return title;
        }
        computeKeybindingLabel() {
            const keybinding = this.activity.keybindingId ? this.keybindingService.lookupKeybinding(this.activity.keybindingId) : null;
            return keybinding?.getLabel();
        }
        updateHover() {
            this.hoverDisposables.clear();
            this.updateTitle();
            this.hoverDisposables.add((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.MOUSE_OVER, () => {
                if (!this.showHoverScheduler.isScheduled()) {
                    if (Date.now() - ActivityActionViewItem_1.hoverLeaveTime < 200) {
                        this.showHover(true);
                    }
                    else {
                        this.showHoverScheduler.schedule(this.configurationService.getValue('workbench.hover.delay'));
                    }
                }
            }, true));
            this.hoverDisposables.add((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.MOUSE_LEAVE, e => {
                if (e.target === this.container) {
                    ActivityActionViewItem_1.hoverLeaveTime = Date.now();
                    this.hoverService.hideHover();
                    this.showHoverScheduler.cancel();
                }
            }, true));
            this.hoverDisposables.add((0, lifecycle_1.toDisposable)(() => {
                this.hoverService.hideHover();
                this.showHoverScheduler.cancel();
            }));
        }
        showHover(skipFadeInAnimation = false) {
            if (this.lastHover && !this.lastHover.isDisposed) {
                return;
            }
            const hoverPosition = this.options.hoverOptions.position();
            this.lastHover = this.hoverService.showHover({
                target: this.container,
                hoverPosition,
                content: this.computeTitle(),
                showPointer: true,
                compact: true,
                hideOnKeyDown: true,
                skipFadeInAnimation,
            });
        }
        dispose() {
            super.dispose();
            if (this.mouseUpTimeout) {
                clearTimeout(this.mouseUpTimeout);
            }
            this.badge.remove();
        }
    };
    exports.ActivityActionViewItem = ActivityActionViewItem;
    exports.ActivityActionViewItem = ActivityActionViewItem = ActivityActionViewItem_1 = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, hover_1.IHoverService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, keybinding_1.IKeybindingService)
    ], ActivityActionViewItem);
    class CompositeOverflowActivityAction extends ActivityAction {
        constructor(showMenu) {
            super({
                id: 'additionalComposites.action',
                name: (0, nls_1.localize)('additionalViews', "Additional Views"),
                classNames: themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.more)
            });
            this.showMenu = showMenu;
        }
        async run() {
            this.showMenu();
        }
    }
    exports.CompositeOverflowActivityAction = CompositeOverflowActivityAction;
    let CompositeOverflowActivityActionViewItem = class CompositeOverflowActivityActionViewItem extends ActivityActionViewItem {
        constructor(action, getOverflowingComposites, getActiveCompositeId, getBadge, getCompositeOpenAction, colors, hoverOptions, contextMenuService, themeService, hoverService, configurationService, keybindingService) {
            super(action, { icon: true, colors, hasPopup: true, hoverOptions }, () => true, themeService, hoverService, configurationService, keybindingService);
            this.getOverflowingComposites = getOverflowingComposites;
            this.getActiveCompositeId = getActiveCompositeId;
            this.getBadge = getBadge;
            this.getCompositeOpenAction = getCompositeOpenAction;
            this.contextMenuService = contextMenuService;
            this.actions = [];
        }
        showMenu() {
            if (this.actions) {
                (0, lifecycle_1.disposeIfDisposable)(this.actions);
            }
            this.actions = this.getActions();
            this.contextMenuService.showContextMenu({
                getAnchor: () => this.container,
                getActions: () => this.actions,
                getCheckedActionsRepresentation: () => 'radio',
                onHide: () => (0, lifecycle_1.disposeIfDisposable)(this.actions)
            });
        }
        getActions() {
            return this.getOverflowingComposites().map(composite => {
                const action = this.getCompositeOpenAction(composite.id);
                action.checked = this.getActiveCompositeId() === action.id;
                const badge = this.getBadge(composite.id);
                let suffix;
                if (badge instanceof activity_1.NumberBadge) {
                    suffix = badge.number;
                }
                else if (badge instanceof activity_1.TextBadge) {
                    suffix = badge.text;
                }
                if (suffix) {
                    action.label = (0, nls_1.localize)('numberBadge', "{0} ({1})", composite.name, suffix);
                }
                else {
                    action.label = composite.name || '';
                }
                return action;
            });
        }
        dispose() {
            super.dispose();
            if (this.actions) {
                this.actions = (0, lifecycle_1.disposeIfDisposable)(this.actions);
            }
        }
    };
    exports.CompositeOverflowActivityActionViewItem = CompositeOverflowActivityActionViewItem;
    exports.CompositeOverflowActivityActionViewItem = CompositeOverflowActivityActionViewItem = __decorate([
        __param(7, contextView_1.IContextMenuService),
        __param(8, themeService_1.IThemeService),
        __param(9, hover_1.IHoverService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, keybinding_1.IKeybindingService)
    ], CompositeOverflowActivityActionViewItem);
    let ManageExtensionAction = class ManageExtensionAction extends actions_1.Action {
        constructor(commandService) {
            super('activitybar.manage.extension', (0, nls_1.localize)('manageExtension', "Manage Extension"));
            this.commandService = commandService;
        }
        run(id) {
            return this.commandService.executeCommand('_extensions.manage', id);
        }
    };
    ManageExtensionAction = __decorate([
        __param(0, commands_1.ICommandService)
    ], ManageExtensionAction);
    let CompositeActionViewItem = class CompositeActionViewItem extends ActivityActionViewItem {
        static { CompositeActionViewItem_1 = this; }
        constructor(options, compositeActivityAction, toggleCompositePinnedAction, toggleCompositeBadgeAction, compositeContextMenuActionsProvider, contextMenuActionsProvider, dndHandler, compositeBar, contextMenuService, keybindingService, instantiationService, themeService, hoverService, configurationService) {
            super(compositeActivityAction, options, compositeBar.areBadgesEnabled.bind(compositeBar), themeService, hoverService, configurationService, keybindingService);
            this.compositeActivityAction = compositeActivityAction;
            this.toggleCompositePinnedAction = toggleCompositePinnedAction;
            this.toggleCompositeBadgeAction = toggleCompositeBadgeAction;
            this.compositeContextMenuActionsProvider = compositeContextMenuActionsProvider;
            this.contextMenuActionsProvider = contextMenuActionsProvider;
            this.dndHandler = dndHandler;
            this.compositeBar = compositeBar;
            this.contextMenuService = contextMenuService;
            if (!CompositeActionViewItem_1.manageExtensionAction) {
                CompositeActionViewItem_1.manageExtensionAction = instantiationService.createInstance(ManageExtensionAction);
            }
        }
        render(container) {
            super.render(container);
            this.updateChecked();
            this.updateEnabled();
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.CONTEXT_MENU, e => {
                dom_1.EventHelper.stop(e, true);
                this.showContextMenu(container);
            }));
            // Allow to drag
            let insertDropBefore = undefined;
            this._register(dnd_2.CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.container, () => { return { type: 'composite', id: this.activity.id }; }, {
                onDragOver: e => {
                    const isValidMove = e.dragAndDropData.getData().id !== this.activity.id && this.dndHandler.onDragOver(e.dragAndDropData, this.activity.id, e.eventData);
                    (0, dnd_2.toggleDropEffect)(e.eventData.dataTransfer, 'move', isValidMove);
                    insertDropBefore = this.updateFromDragging(container, isValidMove, e.eventData);
                },
                onDragLeave: e => {
                    insertDropBefore = this.updateFromDragging(container, false, e.eventData);
                },
                onDragEnd: e => {
                    insertDropBefore = this.updateFromDragging(container, false, e.eventData);
                },
                onDrop: e => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    this.dndHandler.drop(e.dragAndDropData, this.activity.id, e.eventData, insertDropBefore);
                    insertDropBefore = this.updateFromDragging(container, false, e.eventData);
                },
                onDragStart: e => {
                    if (e.dragAndDropData.getData().id !== this.activity.id) {
                        return;
                    }
                    if (e.eventData.dataTransfer) {
                        e.eventData.dataTransfer.effectAllowed = 'move';
                    }
                    this.blur(); // Remove focus indicator when dragging
                }
            }));
            // Activate on drag over to reveal targets
            [this.badge, this.label].forEach(element => this._register(new dnd_1.DelayedDragHandler(element, () => {
                if (!this.action.checked) {
                    this.action.run();
                }
            })));
            this.updateStyles();
        }
        updateFromDragging(element, showFeedback, event) {
            const rect = element.getBoundingClientRect();
            const posX = event.clientX;
            const posY = event.clientY;
            const height = rect.bottom - rect.top;
            const width = rect.right - rect.left;
            const forceTop = posY <= rect.top + height * 0.4;
            const forceBottom = posY > rect.bottom - height * 0.4;
            const preferTop = posY <= rect.top + height * 0.5;
            const forceLeft = posX <= rect.left + width * 0.4;
            const forceRight = posX > rect.right - width * 0.4;
            const preferLeft = posX <= rect.left + width * 0.5;
            const classes = element.classList;
            const lastClasses = {
                vertical: classes.contains('top') ? 'top' : (classes.contains('bottom') ? 'bottom' : undefined),
                horizontal: classes.contains('left') ? 'left' : (classes.contains('right') ? 'right' : undefined)
            };
            const top = forceTop || (preferTop && !lastClasses.vertical) || (!forceBottom && lastClasses.vertical === 'top');
            const bottom = forceBottom || (!preferTop && !lastClasses.vertical) || (!forceTop && lastClasses.vertical === 'bottom');
            const left = forceLeft || (preferLeft && !lastClasses.horizontal) || (!forceRight && lastClasses.horizontal === 'left');
            const right = forceRight || (!preferLeft && !lastClasses.horizontal) || (!forceLeft && lastClasses.horizontal === 'right');
            element.classList.toggle('top', showFeedback && top);
            element.classList.toggle('bottom', showFeedback && bottom);
            element.classList.toggle('left', showFeedback && left);
            element.classList.toggle('right', showFeedback && right);
            if (!showFeedback) {
                return undefined;
            }
            return { verticallyBefore: top, horizontallyBefore: left };
        }
        showContextMenu(container) {
            const actions = [this.toggleCompositePinnedAction, this.toggleCompositeBadgeAction];
            const compositeContextMenuActions = this.compositeContextMenuActionsProvider(this.activity.id);
            if (compositeContextMenuActions.length) {
                actions.push(...compositeContextMenuActions);
            }
            if (this.compositeActivityAction.activity.extensionId) {
                actions.push(new actions_1.Separator());
                actions.push(CompositeActionViewItem_1.manageExtensionAction);
            }
            const isPinned = this.compositeBar.isPinned(this.activity.id);
            if (isPinned) {
                this.toggleCompositePinnedAction.label = (0, nls_1.localize)('hide', "Hide '{0}'", this.activity.name);
                this.toggleCompositePinnedAction.checked = false;
            }
            else {
                this.toggleCompositePinnedAction.label = (0, nls_1.localize)('keep', "Keep '{0}'", this.activity.name);
            }
            const isBadgeEnabled = this.compositeBar.areBadgesEnabled(this.activity.id);
            if (isBadgeEnabled) {
                this.toggleCompositeBadgeAction.label = (0, nls_1.localize)('hideBadge', "Hide Badge");
            }
            else {
                this.toggleCompositeBadgeAction.label = (0, nls_1.localize)('showBadge', "Show Badge");
            }
            const otherActions = this.contextMenuActionsProvider();
            if (otherActions.length) {
                actions.push(new actions_1.Separator());
                actions.push(...otherActions);
            }
            const elementPosition = (0, dom_1.getDomNodePagePosition)(container);
            const anchor = {
                x: Math.floor(elementPosition.left + (elementPosition.width / 2)),
                y: elementPosition.top + elementPosition.height
            };
            this.contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                getActions: () => actions,
                getActionsContext: () => this.activity.id
            });
        }
        updateChecked() {
            if (this.action.checked) {
                this.container.classList.add('checked');
                this.container.setAttribute('aria-label', this.container.title);
                this.container.setAttribute('aria-expanded', 'true');
                this.container.setAttribute('aria-selected', 'true');
            }
            else {
                this.container.classList.remove('checked');
                this.container.setAttribute('aria-label', this.container.title);
                this.container.setAttribute('aria-expanded', 'false');
                this.container.setAttribute('aria-selected', 'false');
            }
            this.updateStyles();
        }
        updateEnabled() {
            if (!this.element) {
                return;
            }
            if (this.action.enabled) {
                this.element.classList.remove('disabled');
            }
            else {
                this.element.classList.add('disabled');
            }
        }
        dispose() {
            super.dispose();
            this.label.remove();
        }
    };
    exports.CompositeActionViewItem = CompositeActionViewItem;
    exports.CompositeActionViewItem = CompositeActionViewItem = CompositeActionViewItem_1 = __decorate([
        __param(8, contextView_1.IContextMenuService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, themeService_1.IThemeService),
        __param(12, hover_1.IHoverService),
        __param(13, configuration_1.IConfigurationService)
    ], CompositeActionViewItem);
    class ToggleCompositePinnedAction extends actions_1.Action {
        constructor(activity, compositeBar) {
            super('show.toggleCompositePinned', activity ? activity.name : (0, nls_1.localize)('toggle', "Toggle View Pinned"));
            this.activity = activity;
            this.compositeBar = compositeBar;
            this.checked = !!this.activity && this.compositeBar.isPinned(this.activity.id);
        }
        async run(context) {
            const id = this.activity ? this.activity.id : context;
            if (this.compositeBar.isPinned(id)) {
                this.compositeBar.unpin(id);
            }
            else {
                this.compositeBar.pin(id);
            }
        }
    }
    exports.ToggleCompositePinnedAction = ToggleCompositePinnedAction;
    class ToggleCompositeBadgeAction extends actions_1.Action {
        constructor(activity, compositeBar) {
            super('show.toggleCompositeBadge', activity ? activity.name : (0, nls_1.localize)('toggleBadge', "Toggle View Badge"));
            this.activity = activity;
            this.compositeBar = compositeBar;
            this.checked = false;
        }
        async run(context) {
            const id = this.activity ? this.activity.id : context;
            this.compositeBar.toggleBadgeEnablement(id);
        }
    }
    exports.ToggleCompositeBadgeAction = ToggleCompositeBadgeAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9zaXRlQmFyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2NvbXBvc2l0ZUJhckFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1FaEcsTUFBYSxjQUFlLFNBQVEsZ0JBQU07UUFXekMsWUFBb0IsU0FBb0I7WUFDdkMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUR4RCxjQUFTLEdBQVQsU0FBUyxDQUFXO1lBVHZCLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtCLENBQUMsQ0FBQztZQUM3RSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRTlDLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWtCLENBQUMsQ0FBQztZQUMxRSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1FBT3pELENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUksUUFBUSxDQUFDLFFBQW1CO1lBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxRQUFRO1lBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFP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