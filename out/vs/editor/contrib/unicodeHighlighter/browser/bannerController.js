var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/browser/link", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/css!./bannerController"], function (require, exports, dom_1, actionbar_1, actions_1, lifecycle_1, markdownRenderer_1, instantiation_1, link_1, iconRegistry_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BannerController = void 0;
    const BANNER_ELEMENT_HEIGHT = 26;
    let BannerController = class BannerController extends lifecycle_1.Disposable {
        constructor(_editor, instantiationService) {
            super();
            this._editor = _editor;
            this.instantiationService = instantiationService;
            this.banner = this._register(this.instantiationService.createInstance(Banner));
        }
        hide() {
            this._editor.setBanner(null, 0);
            this.banner.clear();
        }
        show(item) {
            this.banner.show({
                ...item,
                onClose: () => {
                    this.hide();
                    item.onClose?.();
                }
            });
            this._editor.setBanner(this.banner.element, BANNER_ELEMENT_HEIGHT);
        }
    };
    exports.BannerController = BannerController;
    exports.BannerController = BannerController = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], BannerController);
    // TODO@hediet: Investigate if this can be reused by the workspace banner (bannerPart.ts).
    let Banner = class Banner extends lifecycle_1.Disposable {
        constructor(instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this.markdownRenderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
            this.element = (0, dom_1.$)('div.editor-banner');
            this.element.tabIndex = 0;
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
        clear() {
            (0, dom_1.clearNode)(this.element);
        }
        show(item) {
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
            if (item.icon) {
                iconContainer.appendChild((0, dom_1.$)(`div${themables_1.ThemeIcon.asCSSSelector(item.icon)}`));
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
            this.actionBar.push(this._register(new actions_1.Action('banner.close', 'Close Banner', themables_1.ThemeIcon.asClassName(iconRegistry_1.widgetClose), true, () => {
                if (typeof item.onClose === 'function') {
                    item.onClose();
                }
            })), { icon: true, label: false });
            this.actionBar.setFocusable(false);
        }
    };
    Banner = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], Banner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFubmVyQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3VuaWNvZGVIaWdobGlnaHRlci9icm93c2VyL2Jhbm5lckNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWlCQSxNQUFNLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztJQUUxQixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHNCQUFVO1FBRy9DLFlBQ2tCLE9BQW9CLEVBQ0csb0JBQTJDO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBSFMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNHLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFJbkYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRU0sSUFBSTtZQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFTSxJQUFJLENBQUMsSUFBaUI7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLEdBQUcsSUFBSTtnQkFDUCxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQzthQUNELENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFD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