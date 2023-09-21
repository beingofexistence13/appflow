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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/banner/bannerPart", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/part", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/actions", "vs/platform/opener/browser/link", "vs/base/common/event", "vs/workbench/services/banner/browser/bannerService", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/workbench/common/contextkeys", "vs/css!./media/bannerpart"], function (require, exports, nls_1, dom_1, actionbar_1, extensions_1, instantiation_1, storage_1, themeService_1, themables_1, part_1, layoutService_1, actions_1, link_1, event_1, bannerService_1, markdownRenderer_1, actions_2, actionCommonCategories_1, keybindingsRegistry_1, contextkey_1, uri_1, iconRegistry_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ayb = void 0;
    // Banner Part
    let $ayb = class $ayb extends part_1.Part {
        get minimumHeight() {
            return this.y ? this.height : 0;
        }
        get maximumHeight() {
            return this.y ? this.height : 0;
        }
        get onDidChange() { return this.a.event; }
        constructor(themeService, layoutService, storageService, S, U) {
            super("workbench.parts.banner" /* Parts.BANNER_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.S = S;
            this.U = U;
            // #region IView
            this.height = 26;
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.a = this.B(new event_1.$fd());
            this.y = false;
            this.R = -1;
            this.c = this.U.createInstance(markdownRenderer_1.$K2, {});
        }
        L(parent) {
            this.element = parent;
            this.element.tabIndex = 0;
            // Restore focused action if needed
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.FOCUS, () => {
                if (this.R !== -1) {
                    this.Y();
                }
            }));
            // Track focus
            const scopedContextKeyService = this.S.createScoped(this.element);
            contextkeys_1.$udb.bindTo(scopedContextKeyService).set(true);
            return this.element;
        }
        X(item) {
            // Hide banner
            this.bb(false);
            // Remove from document
            (0, dom_1.$lO)(this.element);
            // Remember choice
            if (typeof item.onClose === 'function') {
                item.onClose();
            }
            this.b = undefined;
        }
        Y() {
            const length = this.b?.actions?.length ?? 0;
            if (this.R < length) {
                const actionLink = this.Q?.children[this.R];
                if (actionLink instanceof HTMLElement) {
                    this.P?.setFocusable(false);
                    actionLink.focus();
                }
            }
            else {
                this.P?.focus(0);
            }
        }
        Z(item) {
            if (item.ariaLabel) {
                return item.ariaLabel;
            }
            if (typeof item.message === 'string') {
                return item.message;
            }
            return undefined;
        }
        ab(message) {
            if (typeof message === 'string') {
                const element = (0, dom_1.$)('span');
                element.innerText = message;
                return element;
            }
            return this.c.render(message).element;
        }
        bb(visible) {
            if (visible !== this.y) {
                this.y = visible;
                this.R = -1;
                this.u.setPartHidden(!visible, "workbench.parts.banner" /* Parts.BANNER_PART */);
                this.a.fire(undefined);
            }
        }
        focus() {
            this.R = -1;
            this.element.focus();
        }
        focusNextAction() {
            const length = this.b?.actions?.length ?? 0;
            this.R = this.R < length ? this.R + 1 : 0;
            this.Y();
        }
        focusPreviousAction() {
            const length = this.b?.actions?.length ?? 0;
            this.R = this.R > 0 ? this.R - 1 : length;
            this.Y();
        }
        hide(id) {
            if (this.b?.id !== id) {
                return;
            }
            this.bb(false);
        }
        show(item) {
            if (item.id === this.b?.id) {
                this.bb(true);
                return;
            }
            // Clear previous item
            (0, dom_1.$lO)(this.element);
            // Banner aria label
            const ariaLabel = this.Z(item);
            if (ariaLabel) {
                this.element.setAttribute('aria-label', ariaLabel);
            }
            // Icon
            const iconContainer = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.icon-container'));
            iconContainer.setAttribute('aria-hidden', 'true');
            if (themables_1.ThemeIcon.isThemeIcon(item.icon)) {
                iconContainer.appendChild((0, dom_1.$)(`div${themables_1.ThemeIcon.asCSSSelector(item.icon)}`));
            }
            else {
                iconContainer.classList.add('custom-icon');
                if (uri_1.URI.isUri(item.icon)) {
                    iconContainer.style.backgroundImage = (0, dom_1.$nP)(item.icon);
                }
            }
            // Message
            const messageContainer = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.message-container'));
            messageContainer.setAttribute('aria-hidden', 'true');
            messageContainer.appendChild(this.ab(item.message));
            // Message Actions
            this.Q = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.message-actions-container'));
            if (item.actions) {
                for (const action of item.actions) {
                    this.B(this.U.createInstance(link_1.$40, this.Q, { ...action, tabIndex: -1 }, {}));
                }
            }
            // Action
            const actionBarContainer = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.action-container'));
            this.P = this.B(new actionbar_1.$1P(actionBarContainer));
            const closeAction = this.B(new actions_1.$gi('banner.close', 'Close Banner', themables_1.ThemeIcon.asClassName(iconRegistry_1.$_u), true, () => this.X(item)));
            this.P.push(closeAction, { icon: true, label: false });
            this.P.setFocusable(false);
            this.bb(true);
            this.b = item;
        }
        toJSON() {
            return {
                type: "workbench.parts.banner" /* Parts.BANNER_PART */
            };
        }
    };
    exports.$ayb = $ayb;
    exports.$ayb = $ayb = __decorate([
        __param(0, themeService_1.$gv),
        __param(1, layoutService_1.$Meb),
        __param(2, storage_1.$Vo),
        __param(3, contextkey_1.$3i),
        __param(4, instantiation_1.$Ah)
    ], $ayb);
    (0, extensions_1.$mr)(bannerService_1.$_xb, $ayb, 0 /* InstantiationType.Eager */);
    // Keybindings
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.banner.focusBanner',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 9 /* KeyCode.Escape */,
        when: contextkeys_1.$udb,
        handler: (accessor) => {
            const bannerService = accessor.get(bannerService_1.$_xb);
            bannerService.focus();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.banner.focusNextAction',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 17 /* KeyCode.RightArrow */,
        secondary: [18 /* KeyCode.DownArrow */],
        when: contextkeys_1.$udb,
        handler: (accessor) => {
            const bannerService = accessor.get(bannerService_1.$_xb);
            bannerService.focusNextAction();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.banner.focusPreviousAction',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 15 /* KeyCode.LeftArrow */,
        secondary: [16 /* KeyCode.UpArrow */],
        when: contextkeys_1.$udb,
        handler: (accessor) => {
            const bannerService = accessor.get(bannerService_1.$_xb);
            bannerService.focusPreviousAction();
        }
    });
    // Actions
    class FocusBannerAction extends actions_2.$Wu {
        static { this.ID = 'workbench.action.focusBanner'; }
        static { this.LABEL = (0, nls_1.localize)(0, null); }
        constructor() {
            super({
                id: FocusBannerAction.ID,
                title: { value: FocusBannerAction.LABEL, original: 'Focus Banner' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            layoutService.focusPart("workbench.parts.banner" /* Parts.BANNER_PART */);
        }
    }
    (0, actions_2.$Xu)(FocusBannerAction);
});
//# sourceMappingURL=bannerPart.js.map