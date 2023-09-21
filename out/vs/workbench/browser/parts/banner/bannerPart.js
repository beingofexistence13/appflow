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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/browser/part", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/actions", "vs/platform/opener/browser/link", "vs/base/common/event", "vs/workbench/services/banner/browser/bannerService", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/workbench/common/contextkeys", "vs/css!./media/bannerpart"], function (require, exports, nls_1, dom_1, actionbar_1, extensions_1, instantiation_1, storage_1, themeService_1, themables_1, part_1, layoutService_1, actions_1, link_1, event_1, bannerService_1, markdownRenderer_1, actions_2, actionCommonCategories_1, keybindingsRegistry_1, contextkey_1, uri_1, iconRegistry_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BannerPart = void 0;
    // Banner Part
    let BannerPart = class BannerPart extends part_1.Part {
        get minimumHeight() {
            return this.visible ? this.height : 0;
        }
        get maximumHeight() {
            return this.visible ? this.height : 0;
        }
        get onDidChange() { return this._onDidChangeSize.event; }
        constructor(themeService, layoutService, storageService, contextKeyService, instantiationService) {
            super("workbench.parts.banner" /* Parts.BANNER_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            // #region IView
            this.height = 26;
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this._onDidChangeSize = this._register(new event_1.Emitter());
            this.visible = false;
            this.focusedActionIndex = -1;
            this.markdownRenderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
        }
        createContentArea(parent) {
            this.element = parent;
            this.element.tabIndex = 0;
            // Restore focused action if needed
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.FOCUS, () => {
                if (this.focusedActionIndex !== -1) {
                    this.focusActionLink();
                }
            }));
            // Track focus
            const scopedContextKeyService = this.contextKeyService.createScoped(this.element);
            contextkeys_1.BannerFocused.bindTo(scopedContextKeyService).set(true);
            return this.element;
        }
        close(item) {
            // Hide banner
            this.setVisibility(false);
            // Remove from document
            (0, dom_1.clearNode)(this.element);
            // Remember choice
            if (typeof item.onClose === 'function') {
                item.onClose();
            }
            this.item = undefined;
        }
        focusActionLink() {
            const length = this.item?.actions?.length ?? 0;
            if (this.focusedActionIndex < length) {
                const actionLink = this.messageActionsContainer?.children[this.focusedActionIndex];
                if (actionLink instanceof HTMLElement) {
                    this.actionBar?.setFocusable(false);
                    actionLink.focus();
                }
            }
            else {
                this.actionBar?.focus(0);
            }
        }
        getAriaLabel(item) {
            if (item.ariaLabel) {
                return item.ariaLabel;
            }
            if (typeof item.message === 'string') {
                return item.message;
            }
            return undefined;
        }
        getBannerMessage(message) {
            if (typeof message === 'string') {
                const element = (0, dom_1.$)('span');
                element.innerText = message;
                return element;
            }
            return this.markdownRenderer.render(message).element;
        }
        setVisibility(visible) {
            if (visible !== this.visible) {
                this.visible = visible;
                this.focusedActionIndex = -1;
                this.layoutService.setPartHidden(!visible, "workbench.parts.banner" /* Parts.BANNER_PART */);
                this._onDidChangeSize.fire(undefined);
            }
        }
        focus() {
            this.focusedActionIndex = -1;
            this.element.focus();
        }
        focusNextAction() {
            const length = this.item?.actions?.length ?? 0;
            this.focusedActionIndex = this.focusedActionIndex < length ? this.focusedActionIndex + 1 : 0;
            this.focusActionLink();
        }
        focusPreviousAction() {
            const length = this.item?.actions?.length ?? 0;
            this.focusedActionIndex = this.focusedActionIndex > 0 ? this.focusedActionIndex - 1 : length;
            this.focusActionLink();
        }
        hide(id) {
            if (this.item?.id !== id) {
                return;
            }
            this.setVisibility(false);
        }
        show(item) {
            if (item.id === this.item?.id) {
                this.setVisibility(true);
                return;
            }
            // Clear previous item
            (0, dom_1.clearNode)(this.element);
            // Banner aria label
            const ariaLabel = this.getAriaLabel(item);
            if (ariaLabel) {
                this.element.setAttribute('aria-label', ariaLabel);
            }
            // Icon
            const iconContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('div.icon-container'));
            iconContainer.setAttribute('aria-hidden', 'true');
            if (themables_1.ThemeIcon.isThemeIcon(item.icon)) {
                iconContainer.appendChild((0, dom_1.$)(`div${themables_1.ThemeIcon.asCSSSelector(item.icon)}`));
            }
            else {
                iconContainer.classList.add('custom-icon');
                if (uri_1.URI.isUri(item.icon)) {
                    iconContainer.style.backgroundImage = (0, dom_1.asCSSUrl)(item.icon);
                }
            }
            // Message
            const messageContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('div.message-container'));
            messageContainer.setAttribute('aria-hidden', 'true');
            messageContainer.appendChild(this.getBannerMessage(item.message));
            // Message Actions
            this.messageActionsContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('div.message-actions-container'));
            if (item.actions) {
                for (const action of item.actions) {
                    this._register(this.instantiationService.createInstance(link_1.Link, this.messageActionsContainer, { ...action, tabIndex: -1 }, {}));
                }
            }
            // Action
            const actionBarContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('div.action-container'));
            this.actionBar = this._register(new actionbar_1.ActionBar(actionBarContainer));
            const closeAction = this._register(new actions_1.Action('banner.close', 'Close Banner', themables_1.ThemeIcon.asClassName(iconRegistry_1.widgetClose), true, () => this.close(item)));
            this.actionBar.push(closeAction, { icon: true, label: false });
            this.actionBar.setFocusable(false);
            this.setVisibility(true);
            this.item = item;
        }
        toJSON() {
            return {
                type: "workbench.parts.banner" /* Parts.BANNER_PART */
            };
        }
    };
    exports.BannerPart = BannerPart;
    exports.BannerPart = BannerPart = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, layoutService_1.IWorkbenchLayoutService),
        __param(2, storage_1.IStorageService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService)
    ], BannerPart);
    (0, extensions_1.registerSingleton)(bannerService_1.IBannerService, BannerPart, 0 /* InstantiationType.Eager */);
    // Keybindings
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.banner.focusBanner',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 9 /* KeyCode.Escape */,
        when: contextkeys_1.BannerFocused,
        handler: (accessor) => {
            const bannerService = accessor.get(bannerService_1.IBannerService);
            bannerService.focus();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.banner.focusNextAction',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 17 /* KeyCode.RightArrow */,
        secondary: [18 /* KeyCode.DownArrow */],
        when: contextkeys_1.BannerFocused,
        handler: (accessor) => {
            const bannerService = accessor.get(bannerService_1.IBannerService);
            bannerService.focusNextAction();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.banner.focusPreviousAction',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 15 /* KeyCode.LeftArrow */,
        secondary: [16 /* KeyCode.UpArrow */],
        when: contextkeys_1.BannerFocused,
        handler: (accessor) => {
            const bannerService = accessor.get(bannerService_1.IBannerService);
            bannerService.focusPreviousAction();
        }
    });
    // Actions
    class FocusBannerAction extends actions_2.Action2 {
        static { this.ID = 'workbench.action.focusBanner'; }
        static { this.LABEL = (0, nls_1.localize)('focusBanner', "Focus Banner"); }
        constructor() {
            super({
                id: FocusBannerAction.ID,
                title: { value: FocusBannerAction.LABEL, original: 'Focus Banner' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.focusPart("workbench.parts.banner" /* Parts.BANNER_PART */);
        }
    }
    (0, actions_2.registerAction2)(FocusBannerAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFubmVyUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2Jhbm5lci9iYW5uZXJQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRCaEcsY0FBYztJQUVQLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVcsU0FBUSxXQUFJO1FBVW5DLElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFHRCxJQUFhLFdBQVcsS0FBSyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBWWxFLFlBQ2dCLFlBQTJCLEVBQ2pCLGFBQXNDLEVBQzlDLGNBQStCLEVBQzVCLGlCQUFzRCxFQUNuRCxvQkFBNEQ7WUFFbkYsS0FBSyxtREFBb0IsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUh0RCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFoQ3BGLGdCQUFnQjtZQUVQLFdBQU0sR0FBVyxFQUFFLENBQUM7WUFDcEIsaUJBQVksR0FBVyxDQUFDLENBQUM7WUFDekIsaUJBQVksR0FBVyxNQUFNLENBQUMsaUJBQWlCLENBQUM7WUFVakQscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFB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