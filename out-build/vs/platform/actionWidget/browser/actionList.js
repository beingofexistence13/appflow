var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/list/listWidget", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/themables", "vs/nls!vs/platform/actionWidget/browser/actionList", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/css!./actionWidget"], function (require, exports, dom, keybindingLabel_1, listWidget_1, cancellation_1, codicons_1, lifecycle_1, platform_1, themables_1, nls_1, contextView_1, keybinding_1, defaultStyles_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H2 = exports.ActionListItemKind = exports.$G2 = exports.$F2 = void 0;
    exports.$F2 = 'acceptSelectedCodeAction';
    exports.$G2 = 'previewSelectedCodeAction';
    var ActionListItemKind;
    (function (ActionListItemKind) {
        ActionListItemKind["Action"] = "action";
        ActionListItemKind["Header"] = "header";
    })(ActionListItemKind || (exports.ActionListItemKind = ActionListItemKind = {}));
    class HeaderRenderer {
        get templateId() { return "header" /* ActionListItemKind.Header */; }
        renderTemplate(container) {
            container.classList.add('group-header');
            const text = document.createElement('span');
            container.append(text);
            return { container, text };
        }
        renderElement(element, _index, templateData) {
            templateData.text.textContent = element.group?.title ?? '';
        }
        disposeTemplate(_templateData) {
            // noop
        }
    }
    let ActionItemRenderer = class ActionItemRenderer {
        get templateId() { return "action" /* ActionListItemKind.Action */; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        renderTemplate(container) {
            container.classList.add(this.templateId);
            const icon = document.createElement('div');
            icon.className = 'icon';
            container.append(icon);
            const text = document.createElement('span');
            text.className = 'title';
            container.append(text);
            const keybinding = new keybindingLabel_1.$TR(container, platform_1.OS);
            return { container, icon, text, keybinding };
        }
        renderElement(element, _index, data) {
            if (element.group?.icon) {
                data.icon.className = themables_1.ThemeIcon.asClassName(element.group.icon);
                if (element.group.icon.color) {
                    data.icon.style.color = (0, colorRegistry_1.$pv)(element.group.icon.color.id);
                }
            }
            else {
                data.icon.className = themables_1.ThemeIcon.asClassName(codicons_1.$Pj.lightBulb);
                data.icon.style.color = 'var(--vscode-editorLightBulb-foreground)';
            }
            if (!element.item || !element.label) {
                return;
            }
            data.text.textContent = stripNewlines(element.label);
            data.keybinding.set(element.keybinding);
            dom.$cP(!!element.keybinding, data.keybinding.element);
            const actionTitle = this.b.lookupKeybinding(exports.$F2)?.getLabel();
            const previewTitle = this.b.lookupKeybinding(exports.$G2)?.getLabel();
            data.container.classList.toggle('option-disabled', element.disabled);
            if (element.disabled) {
                data.container.title = element.label;
            }
            else if (actionTitle && previewTitle) {
                if (this.a && element.canPreview) {
                    data.container.title = (0, nls_1.localize)(0, null, actionTitle, previewTitle);
                }
                else {
                    data.container.title = (0, nls_1.localize)(1, null, actionTitle);
                }
            }
            else {
                data.container.title = '';
            }
        }
        disposeTemplate(_templateData) {
            // noop
        }
    };
    ActionItemRenderer = __decorate([
        __param(1, keybinding_1.$2D)
    ], ActionItemRenderer);
    class AcceptSelectedEvent extends UIEvent {
        constructor() { super('acceptSelectedAction'); }
    }
    class PreviewSelectedEvent extends UIEvent {
        constructor() { super('previewSelectedAction'); }
    }
    function getKeyboardNavigationLabel(item) {
        // Filter out header vs. action
        if (item.kind === 'action') {
            return item.label;
        }
        return undefined;
    }
    let $H2 = class $H2 extends lifecycle_1.$kc {
        constructor(user, preview, items, h, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = 24;
            this.c = 26;
            this.g = this.B(new cancellation_1.$pd());
            this.domNode = document.createElement('div');
            this.domNode.classList.add('actionList');
            const virtualDelegate = {
                getHeight: element => element.kind === "header" /* ActionListItemKind.Header */ ? this.c : this.b,
                getTemplateId: element => element.kind
            };
            this.a = this.B(new listWidget_1.$wQ(user, this.domNode, virtualDelegate, [
                new ActionItemRenderer(preview, this.m),
                new HeaderRenderer(),
            ], {
                keyboardSupport: false,
                typeNavigationEnabled: true,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel },
                accessibilityProvider: {
                    getAriaLabel: element => {
                        if (element.kind === "action" /* ActionListItemKind.Action */) {
                            let label = element.label ? stripNewlines(element?.label) : '';
                            if (element.disabled) {
                                label = (0, nls_1.localize)(2, null, label, element.disabled);
                            }
                            return label;
                        }
                        return null;
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)(3, null),
                    getRole: (e) => e.kind === "action" /* ActionListItemKind.Action */ ? 'option' : 'separator',
                    getWidgetRole: () => 'listbox',
                },
            }));
            this.a.style(defaultStyles_1.$z2);
            this.B(this.a.onMouseClick(e => this.t(e)));
            this.B(this.a.onMouseOver(e => this.s(e)));
            this.B(this.a.onDidChangeFocus(() => this.a.domFocus()));
            this.B(this.a.onDidChangeSelection(e => this.r(e)));
            this.f = items;
            this.a.splice(0, this.a.length, this.f);
            if (this.a.length) {
                this.focusNext();
            }
        }
        n(element) {
            return !element.disabled && element.kind === "action" /* ActionListItemKind.Action */;
        }
        hide(didCancel) {
            this.h.onHide(didCancel);
            this.g.cancel();
            this.j.hideContextView();
        }
        layout(minWidth) {
            // Updating list height, depending on how many separators and headers there are.
            const numHeaders = this.f.filter(item => item.kind === 'header').length;
            const itemsHeight = this.f.length * this.b;
            const heightWithHeaders = itemsHeight + numHeaders * this.c - numHeaders * this.b;
            this.a.layout(heightWithHeaders);
            // For finding width dynamically (not using resize observer)
            const itemWidths = this.f.map((_, index) => {
                const element = document.getElementById(this.a.getElementID(index));
                if (element) {
                    element.style.width = 'auto';
                    const width = element.getBoundingClientRect().width;
                    element.style.width = '';
                    return width;
                }
                return 0;
            });
            // resize observer - can be used in the future since list widget supports dynamic height but not width
            const width = Math.max(...itemWidths, minWidth);
            const maxVhPrecentage = 0.7;
            const height = Math.min(heightWithHeaders, document.body.clientHeight * maxVhPrecentage);
            this.a.layout(height, width);
            this.domNode.style.height = `${height}px`;
            this.a.domFocus();
            return width;
        }
        focusPrevious() {
            this.a.focusPrevious(1, true, undefined, this.n);
        }
        focusNext() {
            this.a.focusNext(1, true, undefined, this.n);
        }
        acceptSelected(preview) {
            const focused = this.a.getFocus();
            if (focused.length === 0) {
                return;
            }
            const focusIndex = focused[0];
            const element = this.a.element(focusIndex);
            if (!this.n(element)) {
                return;
            }
            const event = preview ? new PreviewSelectedEvent() : new AcceptSelectedEvent();
            this.a.setSelection([focusIndex], event);
        }
        r(e) {
            if (!e.elements.length) {
                return;
            }
            const element = e.elements[0];
            if (element.item && this.n(element)) {
                this.h.onSelect(element.item, e.browserEvent instanceof PreviewSelectedEvent);
            }
            else {
                this.a.setSelection([]);
            }
        }
        async s(e) {
            const element = e.element;
            if (element && element.item && this.n(element)) {
                if (this.h.onFocus && !element.disabled && element.kind === "action" /* ActionListItemKind.Action */) {
                    const result = await this.h.onFocus(element.item, this.g.token);
                    element.canPreview = result ? result.canPreview : undefined;
                }
                if (e.index) {
                    this.a.splice(e.index, 1, [element]);
                }
            }
            this.a.setFocus(typeof e.index === 'number' ? [e.index] : []);
        }
        t(e) {
            if (e.element && this.n(e.element)) {
                this.a.setFocus([]);
            }
        }
    };
    exports.$H2 = $H2;
    exports.$H2 = $H2 = __decorate([
        __param(4, contextView_1.$VZ),
        __param(5, keybinding_1.$2D)
    ], $H2);
    function stripNewlines(str) {
        return str.replace(/\r\n|\r|\n/g, ' ');
    }
});
//# sourceMappingURL=actionList.js.map