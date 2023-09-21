var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/list/listWidget", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/themables", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/css!./actionWidget"], function (require, exports, dom, keybindingLabel_1, listWidget_1, cancellation_1, codicons_1, lifecycle_1, platform_1, themables_1, nls_1, contextView_1, keybinding_1, defaultStyles_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionList = exports.ActionListItemKind = exports.previewSelectedActionCommand = exports.acceptSelectedActionCommand = void 0;
    exports.acceptSelectedActionCommand = 'acceptSelectedCodeAction';
    exports.previewSelectedActionCommand = 'previewSelectedCodeAction';
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
        constructor(_supportsPreview, _keybindingService) {
            this._supportsPreview = _supportsPreview;
            this._keybindingService = _keybindingService;
        }
        renderTemplate(container) {
            container.classList.add(this.templateId);
            const icon = document.createElement('div');
            icon.className = 'icon';
            container.append(icon);
            const text = document.createElement('span');
            text.className = 'title';
            container.append(text);
            const keybinding = new keybindingLabel_1.KeybindingLabel(container, platform_1.OS);
            return { container, icon, text, keybinding };
        }
        renderElement(element, _index, data) {
            if (element.group?.icon) {
                data.icon.className = themables_1.ThemeIcon.asClassName(element.group.icon);
                if (element.group.icon.color) {
                    data.icon.style.color = (0, colorRegistry_1.asCssVariable)(element.group.icon.color.id);
                }
            }
            else {
                data.icon.className = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.lightBulb);
                data.icon.style.color = 'var(--vscode-editorLightBulb-foreground)';
            }
            if (!element.item || !element.label) {
                return;
            }
            data.text.textContent = stripNewlines(element.label);
            data.keybinding.set(element.keybinding);
            dom.setVisibility(!!element.keybinding, data.keybinding.element);
            const actionTitle = this._keybindingService.lookupKeybinding(exports.acceptSelectedActionCommand)?.getLabel();
            const previewTitle = this._keybindingService.lookupKeybinding(exports.previewSelectedActionCommand)?.getLabel();
            data.container.classList.toggle('option-disabled', element.disabled);
            if (element.disabled) {
                data.container.title = element.label;
            }
            else if (actionTitle && previewTitle) {
                if (this._supportsPreview && element.canPreview) {
                    data.container.title = (0, nls_1.localize)({ key: 'label-preview', comment: ['placeholders are keybindings, e.g "F2 to apply, Shift+F2 to preview"'] }, "{0} to apply, {1} to preview", actionTitle, previewTitle);
                }
                else {
                    data.container.title = (0, nls_1.localize)({ key: 'label', comment: ['placeholder is a keybinding, e.g "F2 to apply"'] }, "{0} to apply", actionTitle);
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
        __param(1, keybinding_1.IKeybindingService)
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
    let ActionList = class ActionList extends lifecycle_1.Disposable {
        constructor(user, preview, items, _delegate, _contextViewService, _keybindingService) {
            super();
            this._delegate = _delegate;
            this._contextViewService = _contextViewService;
            this._keybindingService = _keybindingService;
            this._actionLineHeight = 24;
            this._headerLineHeight = 26;
            this.cts = this._register(new cancellation_1.CancellationTokenSource());
            this.domNode = document.createElement('div');
            this.domNode.classList.add('actionList');
            const virtualDelegate = {
                getHeight: element => element.kind === "header" /* ActionListItemKind.Header */ ? this._headerLineHeight : this._actionLineHeight,
                getTemplateId: element => element.kind
            };
            this._list = this._register(new listWidget_1.List(user, this.domNode, virtualDelegate, [
                new ActionItemRenderer(preview, this._keybindingService),
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
                                label = (0, nls_1.localize)({ key: 'customQuickFixWidget.labels', comment: [`Action widget labels for accessibility.`] }, "{0}, Disabled Reason: {1}", label, element.disabled);
                            }
                            return label;
                        }
                        return null;
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)({ key: 'customQuickFixWidget', comment: [`An action widget option`] }, "Action Widget"),
                    getRole: (e) => e.kind === "action" /* ActionListItemKind.Action */ ? 'option' : 'separator',
                    getWidgetRole: () => 'listbox',
                },
            }));
            this._list.style(defaultStyles_1.defaultListStyles);
            this._register(this._list.onMouseClick(e => this.onListClick(e)));
            this._register(this._list.onMouseOver(e => this.onListHover(e)));
            this._register(this._list.onDidChangeFocus(() => this._list.domFocus()));
            this._register(this._list.onDidChangeSelection(e => this.onListSelection(e)));
            this._allMenuItems = items;
            this._list.splice(0, this._list.length, this._allMenuItems);
            if (this._list.length) {
                this.focusNext();
            }
        }
        focusCondition(element) {
            return !element.disabled && element.kind === "action" /* ActionListItemKind.Action */;
        }
        hide(didCancel) {
            this._delegate.onHide(didCancel);
            this.cts.cancel();
            this._contextViewService.hideContextView();
        }
        layout(minWidth) {
            // Updating list height, depending on how many separators and headers there are.
            const numHeaders = this._allMenuItems.filter(item => item.kind === 'header').length;
            const itemsHeight = this._allMenuItems.length * this._actionLineHeight;
            const heightWithHeaders = itemsHeight + numHeaders * this._headerLineHeight - numHeaders * this._actionLineHeight;
            this._list.layout(heightWithHeaders);
            // For finding width dynamically (not using resize observer)
            const itemWidths = this._allMenuItems.map((_, index) => {
                const element = document.getElementById(this._list.getElementID(index));
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
            this._list.layout(height, width);
            this.domNode.style.height = `${height}px`;
            this._list.domFocus();
            return width;
        }
        focusPrevious() {
            this._list.focusPrevious(1, true, undefined, this.focusCondition);
        }
        focusNext() {
            this._list.focusNext(1, true, undefined, this.focusCondition);
        }
        acceptSelected(preview) {
            const focused = this._list.getFocus();
            if (focused.length === 0) {
                return;
            }
            const focusIndex = focused[0];
            const element = this._list.element(focusIndex);
            if (!this.focusCondition(element)) {
                return;
            }
            const event = preview ? new PreviewSelectedEvent() : new AcceptSelectedEvent();
            this._list.setSelection([focusIndex], event);
        }
        onListSelection(e) {
            if (!e.elements.length) {
                return;
            }
            const element = e.elements[0];
            if (element.item && this.focusCondition(element)) {
                this._delegate.onSelect(element.item, e.browserEvent instanceof PreviewSelectedEvent);
            }
            else {
                this._list.setSelection([]);
            }
        }
        async onListHover(e) {
            const element = e.element;
            if (element && element.item && this.focusCondition(element)) {
                if (this._delegate.onFocus && !element.disabled && element.kind === "action" /* ActionListItemKind.Action */) {
                    const result = await this._delegate.onFocus(element.item, this.cts.token);
                    element.canPreview = result ? result.canPreview : undefined;
                }
                if (e.index) {
                    this._list.splice(e.index, 1, [element]);
                }
            }
            this._list.setFocus(typeof e.index === 'number' ? [e.index] : []);
        }
        onListClick(e) {
            if (e.element && this.focusCondition(e.element)) {
                this._list.setFocus([]);
            }
        }
    };
    exports.ActionList = ActionList;
    exports.ActionList = ActionList = __decorate([
        __param(4, contextView_1.IContextViewService),
        __param(5, keybinding_1.IKeybindingService)
    ], ActionList);
    function stripNewlines(str) {
        return str.replace(/\r\n|\r|\n/g, ' ');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uTGlzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2FjdGlvbldpZGdldC9icm93c2VyL2FjdGlvbkxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQXFCYSxRQUFBLDJCQUEyQixHQUFHLDBCQUEwQixDQUFDO0lBQ3pELFFBQUEsNEJBQTRCLEdBQUcsMkJBQTJCLENBQUM7SUF5QnhFLElBQWtCLGtCQUdqQjtJQUhELFdBQWtCLGtCQUFrQjtRQUNuQyx1Q0FBaUIsQ0FBQTtRQUNqQix1Q0FBaUIsQ0FBQTtJQUNsQixDQUFDLEVBSGlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBR25DO0lBT0QsTUFBTSxjQUFjO1FBRW5CLElBQUksVUFBVSxLQUFhLGdEQUFpQyxDQUFDLENBQUM7UUFFOUQsY0FBYyxDQUFDLFNBQXNCO1lBQ3BDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRXhDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QixPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBMkIsRUFBRSxNQUFjLEVBQUUsWUFBaUM7WUFDM0YsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzVELENBQUM7UUFFRCxlQUFlLENBQUMsYUFBa0M7WUFDakQsT0FBTztRQUNSLENBQUM7S0FDRDtJQUVELElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO1FBRXZCLElBQUksVUFBVSxLQUFhLGdEQUFpQyxDQUFDLENBQUM7UUFFOUQsWUFD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