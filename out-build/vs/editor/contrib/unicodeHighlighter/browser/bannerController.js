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
    exports.$50 = void 0;
    const BANNER_ELEMENT_HEIGHT = 26;
    let $50 = class $50 extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(this.c.createInstance(Banner));
        }
        hide() {
            this.b.setBanner(null, 0);
            this.a.clear();
        }
        show(item) {
            this.a.show({
                ...item,
                onClose: () => {
                    this.hide();
                    item.onClose?.();
                }
            });
            this.b.setBanner(this.a.element, BANNER_ELEMENT_HEIGHT);
        }
    };
    exports.$50 = $50;
    exports.$50 = $50 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $50);
    // TODO@hediet: Investigate if this can be reused by the workspace banner (bannerPart.ts).
    let Banner = class Banner extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            this.a = this.f.createInstance(markdownRenderer_1.$K2, {});
            this.element = (0, dom_1.$)('div.editor-banner');
            this.element.tabIndex = 0;
        }
        g(item) {
            if (item.ariaLabel) {
                return item.ariaLabel;
            }
            if (typeof item.message === 'string') {
                return item.message;
            }
            return undefined;
        }
        h(message) {
            if (typeof message === 'string') {
                const element = (0, dom_1.$)('span');
                element.innerText = message;
                return element;
            }
            return this.a.render(message).element;
        }
        clear() {
            (0, dom_1.$lO)(this.element);
        }
        show(item) {
            // Clear previous item
            (0, dom_1.$lO)(this.element);
            // Banner aria label
            const ariaLabel = this.g(item);
            if (ariaLabel) {
                this.element.setAttribute('aria-label', ariaLabel);
            }
            // Icon
            const iconContainer = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.icon-container'));
            iconContainer.setAttribute('aria-hidden', 'true');
            if (item.icon) {
                iconContainer.appendChild((0, dom_1.$)(`div${themables_1.ThemeIcon.asCSSSelector(item.icon)}`));
            }
            // Message
            const messageContainer = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.message-container'));
            messageContainer.setAttribute('aria-hidden', 'true');
            messageContainer.appendChild(this.h(item.message));
            // Message Actions
            this.b = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.message-actions-container'));
            if (item.actions) {
                for (const action of item.actions) {
                    this.B(this.f.createInstance(link_1.$40, this.b, { ...action, tabIndex: -1 }, {}));
                }
            }
            // Action
            const actionBarContainer = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.action-container'));
            this.c = this.B(new actionbar_1.$1P(actionBarContainer));
            this.c.push(this.B(new actions_1.$gi('banner.close', 'Close Banner', themables_1.ThemeIcon.asClassName(iconRegistry_1.$_u), true, () => {
                if (typeof item.onClose === 'function') {
                    item.onClose();
                }
            })), { icon: true, label: false });
            this.c.setFocusable(false);
        }
    };
    Banner = __decorate([
        __param(0, instantiation_1.$Ah)
    ], Banner);
});
//# sourceMappingURL=bannerController.js.map