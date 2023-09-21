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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/compositeBarActions", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dnd", "vs/platform/keybinding/common/keybinding", "vs/base/common/event", "vs/workbench/browser/dnd", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/services/hover/browser/hover", "vs/base/common/async", "vs/platform/configuration/common/configuration"], function (require, exports, nls_1, actions_1, dom_1, commands_1, lifecycle_1, contextView_1, themeService_1, activity_1, instantiation_1, colorRegistry_1, dnd_1, keybinding_1, event_1, dnd_2, actionViewItems_1, codicons_1, themables_1, hover_1, async_1, configuration_1) {
    "use strict";
    var $Dtb_1, $Gtb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Itb = exports.$Htb = exports.$Gtb = exports.$Ftb = exports.$Etb = exports.$Dtb = exports.$Ctb = void 0;
    class $Ctb extends actions_1.$gi {
        constructor(r) {
            super(r.id, r.name, r.classNames?.join(' '), true);
            this.r = r;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeActivity = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeBadge = this.c.event;
        }
        get activity() {
            return this.r;
        }
        set activity(activity) {
            this.m = activity.name;
            this.r = activity;
            this.b.fire(this);
        }
        activate() {
            if (!this.checked) {
                this.I(true);
            }
        }
        deactivate() {
            if (this.checked) {
                this.I(false);
            }
        }
        getBadge() {
            return this.f;
        }
        getClass() {
            return this.g;
        }
        setBadge(badge, clazz) {
            this.f = badge;
            this.g = clazz;
            this.c.fire(this);
        }
        dispose() {
            this.b.dispose();
            this.c.dispose();
            super.dispose();
        }
    }
    exports.$Ctb = $Ctb;
    let $Dtb = class $Dtb extends actionViewItems_1.$MQ {
        static { $Dtb_1 = this; }
        static { this.b = 0; }
        constructor(action, options, O, P, Q, R, S) {
            super(null, action, options);
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.H = this.B(new lifecycle_1.$lc());
            this.L = this.B(new lifecycle_1.$jc());
            this.N = new async_1.$Sg(() => this.fb(), 0);
            this.m = options;
            this.B(this.P.onDidColorThemeChange(this.X, this));
            this.B(action.onDidChangeActivity(this.Y, this));
            this.B(event_1.Event.filter(S.onDidUpdateKeybindings, () => this.J !== this.db())(() => this.bb()));
            this.B(action.onDidChangeBadge(this.Z, this));
            this.B((0, lifecycle_1.$ic)(() => this.N.cancel()));
        }
        get U() {
            return this._action.activity;
        }
        W() {
            const theme = this.P.getColorTheme();
            const colors = this.m.colors(theme);
            if (this.g) {
                if (this.m.icon) {
                    const foreground = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
                    if (this.U.iconUrl) {
                        // Apply background color to activity bar item provided with iconUrls
                        this.g.style.backgroundColor = foreground ? foreground.toString() : '';
                        this.g.style.color = '';
                    }
                    else {
                        // Apply foreground color to activity bar items provided with codicons
                        this.g.style.color = foreground ? foreground.toString() : '';
                        this.g.style.backgroundColor = '';
                    }
                }
                else {
                    const foreground = this._action.checked ? colors.activeForegroundColor : colors.inactiveForegroundColor;
                    const borderBottomColor = this._action.checked ? colors.activeBorderBottomColor : null;
                    this.g.style.color = foreground ? foreground.toString() : '';
                    this.g.style.borderBottomColor = borderBottomColor ? borderBottomColor.toString() : '';
                }
                this.c.style.setProperty('--insert-border-color', colors.dragAndDropBorder ? colors.dragAndDropBorder.toString() : '');
            }
            // Badge
            if (this.r) {
                const badgeForeground = colors.badgeForeground;
                const badgeBackground = colors.badgeBackground;
                const contrastBorderColor = theme.getColor(colorRegistry_1.$Av);
                this.r.style.color = badgeForeground ? badgeForeground.toString() : '';
                this.r.style.backgroundColor = badgeBackground ? badgeBackground.toString() : '';
                this.r.style.borderStyle = contrastBorderColor ? 'solid' : '';
                this.r.style.borderWidth = contrastBorderColor ? '1px' : '';
                this.r.style.borderColor = contrastBorderColor ? contrastBorderColor.toString() : '';
            }
        }
        render(container) {
            super.render(container);
            this.c = container;
            if (this.m.icon) {
                this.c.classList.add('icon');
            }
            if (this.m.hasPopup) {
                this.c.setAttribute('role', 'button');
                this.c.setAttribute('aria-haspopup', 'true');
            }
            else {
                this.c.setAttribute('role', 'tab');
            }
            // Try hard to prevent keyboard only focus feedback when using mouse
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.MOUSE_DOWN, () => {
                this.c.classList.add('clicked');
            }));
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.MOUSE_UP, () => {
                if (this.I) {
                    clearTimeout(this.I);
                }
                this.I = setTimeout(() => {
                    this.c.classList.remove('clicked');
                }, 800); // delayed to prevent focus feedback from showing on mouse up
            }));
            // Label
            this.g = (0, dom_1.$0O)(container, (0, dom_1.$)('a'));
            // Badge
            this.h = (0, dom_1.$0O)(container, (0, dom_1.$)('.badge'));
            this.r = (0, dom_1.$0O)(this.h, (0, dom_1.$)('.badge-content'));
            // pane composite bar active border + background
            (0, dom_1.$0O)(container, (0, dom_1.$)('.active-item-indicator'));
            (0, dom_1.$eP)(this.h);
            this.Y();
            this.W();
            this.eb();
        }
        X(theme) {
            this.W();
        }
        Y() {
            this.w();
            this.bb();
            this.Z();
            this.W();
        }
        Z() {
            const action = this.action;
            if (!this.h || !this.r || !(action instanceof $Ctb)) {
                return;
            }
            const badge = action.getBadge();
            const clazz = action.getClass();
            this.H.clear();
            (0, dom_1.$lO)(this.r);
            (0, dom_1.$eP)(this.h);
            const shouldRenderBadges = this.O(this.U.id);
            if (badge && shouldRenderBadges) {
                // Number
                if (badge instanceof activity_1.$IV) {
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
                        this.r.textContent = number;
                        (0, dom_1.$dP)(this.h);
                    }
                }
                // Text
                else if (badge instanceof activity_1.$JV) {
                    this.r.textContent = badge.text;
                    (0, dom_1.$dP)(this.h);
                }
                // Icon
                else if (badge instanceof activity_1.$KV) {
                    const clazzList = themables_1.ThemeIcon.asClassNameArray(badge.icon);
                    this.r.classList.add(...clazzList);
                    (0, dom_1.$dP)(this.h);
                }
                // Progress
                else if (badge instanceof activity_1.$LV) {
                    (0, dom_1.$dP)(this.h);
                }
                if (clazz) {
                    const classNames = clazz.split(' ');
                    this.h.classList.add(...classNames);
                    this.H.value = (0, lifecycle_1.$ic)(() => this.h.classList.remove(...classNames));
                }
            }
            this.bb();
        }
        w() {
            this.g.className = 'action-label';
            if (this.U.classNames) {
                this.g.classList.add(...this.U.classNames);
            }
            if (!this.m.icon) {
                this.g.textContent = this.action.label;
            }
        }
        bb() {
            const title = this.cb();
            [this.g, this.h, this.c].forEach(element => {
                if (element) {
                    element.setAttribute('aria-label', title);
                    element.setAttribute('title', '');
                    element.removeAttribute('title');
                }
            });
        }
        cb() {
            this.J = this.db();
            let title = this.J ? (0, nls_1.localize)(0, null, this.U.name, this.J) : this.U.name;
            const badge = this.action.getBadge();
            if (badge?.getDescription()) {
                title = (0, nls_1.localize)(1, null, title, badge.getDescription());
            }
            return title;
        }
        db() {
            const keybinding = this.U.keybindingId ? this.S.lookupKeybinding(this.U.keybindingId) : null;
            return keybinding?.getLabel();
        }
        eb() {
            this.L.clear();
            this.bb();
            this.L.add((0, dom_1.$nO)(this.c, dom_1.$3O.MOUSE_OVER, () => {
                if (!this.N.isScheduled()) {
                    if (Date.now() - $Dtb_1.b < 200) {
                        this.fb(true);
                    }
                    else {
                        this.N.schedule(this.R.getValue('workbench.hover.delay'));
                    }
                }
            }, true));
            this.L.add((0, dom_1.$nO)(this.c, dom_1.$3O.MOUSE_LEAVE, e => {
                if (e.target === this.c) {
                    $Dtb_1.b = Date.now();
                    this.Q.hideHover();
                    this.N.cancel();
                }
            }, true));
            this.L.add((0, lifecycle_1.$ic)(() => {
                this.Q.hideHover();
                this.N.cancel();
            }));
        }
        fb(skipFadeInAnimation = false) {
            if (this.M && !this.M.isDisposed) {
                return;
            }
            const hoverPosition = this.m.hoverOptions.position();
            this.M = this.Q.showHover({
                target: this.c,
                hoverPosition,
                content: this.cb(),
                showPointer: true,
                compact: true,
                hideOnKeyDown: true,
                skipFadeInAnimation,
            });
        }
        dispose() {
            super.dispose();
            if (this.I) {
                clearTimeout(this.I);
            }
            this.h.remove();
        }
    };
    exports.$Dtb = $Dtb;
    exports.$Dtb = $Dtb = $Dtb_1 = __decorate([
        __param(3, themeService_1.$gv),
        __param(4, hover_1.$zib),
        __param(5, configuration_1.$8h),
        __param(6, keybinding_1.$2D)
    ], $Dtb);
    class $Etb extends $Ctb {
        constructor(a) {
            super({
                id: 'additionalComposites.action',
                name: (0, nls_1.localize)(2, null),
                classNames: themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.more)
            });
            this.a = a;
        }
        async run() {
            this.a();
        }
    }
    exports.$Etb = $Etb;
    let $Ftb = class $Ftb extends $Dtb {
        constructor(action, s, gb, hb, ib, colors, hoverOptions, jb, themeService, hoverService, configurationService, keybindingService) {
            super(action, { icon: true, colors, hasPopup: true, hoverOptions }, () => true, themeService, hoverService, configurationService, keybindingService);
            this.s = s;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.a = [];
        }
        showMenu() {
            if (this.a) {
                (0, lifecycle_1.$gc)(this.a);
            }
            this.a = this.kb();
            this.jb.showContextMenu({
                getAnchor: () => this.c,
                getActions: () => this.a,
                getCheckedActionsRepresentation: () => 'radio',
                onHide: () => (0, lifecycle_1.$gc)(this.a)
            });
        }
        kb() {
            return this.s().map(composite => {
                const action = this.ib(composite.id);
                action.checked = this.gb() === action.id;
                const badge = this.hb(composite.id);
                let suffix;
                if (badge instanceof activity_1.$IV) {
                    suffix = badge.number;
                }
                else if (badge instanceof activity_1.$JV) {
                    suffix = badge.text;
                }
                if (suffix) {
                    action.label = (0, nls_1.localize)(3, null, composite.name, suffix);
                }
                else {
                    action.label = composite.name || '';
                }
                return action;
            });
        }
        dispose() {
            super.dispose();
            if (this.a) {
                this.a = (0, lifecycle_1.$gc)(this.a);
            }
        }
    };
    exports.$Ftb = $Ftb;
    exports.$Ftb = $Ftb = __decorate([
        __param(7, contextView_1.$WZ),
        __param(8, themeService_1.$gv),
        __param(9, hover_1.$zib),
        __param(10, configuration_1.$8h),
        __param(11, keybinding_1.$2D)
    ], $Ftb);
    let ManageExtensionAction = class ManageExtensionAction extends actions_1.$gi {
        constructor(a) {
            super('activitybar.manage.extension', (0, nls_1.localize)(4, null));
            this.a = a;
        }
        run(id) {
            return this.a.executeCommand('_extensions.manage', id);
        }
    };
    ManageExtensionAction = __decorate([
        __param(0, commands_1.$Fr)
    ], ManageExtensionAction);
    let $Gtb = class $Gtb extends $Dtb {
        static { $Gtb_1 = this; }
        constructor(options, s, gb, hb, ib, jb, kb, lb, mb, keybindingService, instantiationService, themeService, hoverService, configurationService) {
            super(s, options, lb.areBadgesEnabled.bind(lb), themeService, hoverService, configurationService, keybindingService);
            this.s = s;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            if (!$Gtb_1.a) {
                $Gtb_1.a = instantiationService.createInstance(ManageExtensionAction);
            }
        }
        render(container) {
            super.render(container);
            this.G();
            this.u();
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.CONTEXT_MENU, e => {
                dom_1.$5O.stop(e, true);
                this.ob(container);
            }));
            // Allow to drag
            let insertDropBefore = undefined;
            this.B(dnd_2.$zeb.INSTANCE.registerDraggable(this.c, () => { return { type: 'composite', id: this.U.id }; }, {
                onDragOver: e => {
                    const isValidMove = e.dragAndDropData.getData().id !== this.U.id && this.kb.onDragOver(e.dragAndDropData, this.U.id, e.eventData);
                    (0, dnd_2.$Aeb)(e.eventData.dataTransfer, 'move', isValidMove);
                    insertDropBefore = this.nb(container, isValidMove, e.eventData);
                },
                onDragLeave: e => {
                    insertDropBefore = this.nb(container, false, e.eventData);
                },
                onDragEnd: e => {
                    insertDropBefore = this.nb(container, false, e.eventData);
                },
                onDrop: e => {
                    dom_1.$5O.stop(e.eventData, true);
                    this.kb.drop(e.dragAndDropData, this.U.id, e.eventData, insertDropBefore);
                    insertDropBefore = this.nb(container, false, e.eventData);
                },
                onDragStart: e => {
                    if (e.dragAndDropData.getData().id !== this.U.id) {
                        return;
                    }
                    if (e.eventData.dataTransfer) {
                        e.eventData.dataTransfer.effectAllowed = 'move';
                    }
                    this.blur(); // Remove focus indicator when dragging
                }
            }));
            // Activate on drag over to reveal targets
            [this.h, this.g].forEach(element => this.B(new dnd_1.$BP(element, () => {
                if (!this.action.checked) {
                    this.action.run();
                }
            })));
            this.W();
        }
        nb(element, showFeedback, event) {
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
        ob(container) {
            const actions = [this.gb, this.hb];
            const compositeContextMenuActions = this.ib(this.U.id);
            if (compositeContextMenuActions.length) {
                actions.push(...compositeContextMenuActions);
            }
            if (this.s.activity.extensionId) {
                actions.push(new actions_1.$ii());
                actions.push($Gtb_1.a);
            }
            const isPinned = this.lb.isPinned(this.U.id);
            if (isPinned) {
                this.gb.label = (0, nls_1.localize)(5, null, this.U.name);
                this.gb.checked = false;
            }
            else {
                this.gb.label = (0, nls_1.localize)(6, null, this.U.name);
            }
            const isBadgeEnabled = this.lb.areBadgesEnabled(this.U.id);
            if (isBadgeEnabled) {
                this.hb.label = (0, nls_1.localize)(7, null);
            }
            else {
                this.hb.label = (0, nls_1.localize)(8, null);
            }
            const otherActions = this.jb();
            if (otherActions.length) {
                actions.push(new actions_1.$ii());
                actions.push(...otherActions);
            }
            const elementPosition = (0, dom_1.$FO)(container);
            const anchor = {
                x: Math.floor(elementPosition.left + (elementPosition.width / 2)),
                y: elementPosition.top + elementPosition.height
            };
            this.mb.showContextMenu({
                getAnchor: () => anchor,
                getActions: () => actions,
                getActionsContext: () => this.U.id
            });
        }
        G() {
            if (this.action.checked) {
                this.c.classList.add('checked');
                this.c.setAttribute('aria-label', this.c.title);
                this.c.setAttribute('aria-expanded', 'true');
                this.c.setAttribute('aria-selected', 'true');
            }
            else {
                this.c.classList.remove('checked');
                this.c.setAttribute('aria-label', this.c.title);
                this.c.setAttribute('aria-expanded', 'false');
                this.c.setAttribute('aria-selected', 'false');
            }
            this.W();
        }
        u() {
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
            this.g.remove();
        }
    };
    exports.$Gtb = $Gtb;
    exports.$Gtb = $Gtb = $Gtb_1 = __decorate([
        __param(8, contextView_1.$WZ),
        __param(9, keybinding_1.$2D),
        __param(10, instantiation_1.$Ah),
        __param(11, themeService_1.$gv),
        __param(12, hover_1.$zib),
        __param(13, configuration_1.$8h)
    ], $Gtb);
    class $Htb extends actions_1.$gi {
        constructor(b, c) {
            super('show.toggleCompositePinned', b ? b.name : (0, nls_1.localize)(9, null));
            this.b = b;
            this.c = c;
            this.checked = !!this.b && this.c.isPinned(this.b.id);
        }
        async run(context) {
            const id = this.b ? this.b.id : context;
            if (this.c.isPinned(id)) {
                this.c.unpin(id);
            }
            else {
                this.c.pin(id);
            }
        }
    }
    exports.$Htb = $Htb;
    class $Itb extends actions_1.$gi {
        constructor(b, c) {
            super('show.toggleCompositeBadge', b ? b.name : (0, nls_1.localize)(10, null));
            this.b = b;
            this.c = c;
            this.checked = false;
        }
        async run(context) {
            const id = this.b ? this.b.id : context;
            this.c.toggleBadgeEnablement(id);
        }
    }
    exports.$Itb = $Itb;
});
//# sourceMappingURL=compositeBarActions.js.map