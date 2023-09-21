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
define(["require", "exports", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/base/common/severity", "vs/base/browser/ui/dialog/dialog", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/product/common/productService", "vs/platform/clipboard/common/clipboardService", "vs/base/common/date", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/platform/theme/browser/defaultStyles"], function (require, exports, nls_1, dialogs_1, layoutService_1, log_1, severity_1, dialog_1, lifecycle_1, dom_1, keybinding_1, productService_1, clipboardService_1, date_1, instantiation_1, markdownRenderer_1, defaultStyles_1) {
    "use strict";
    var BrowserDialogHandler_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserDialogHandler = void 0;
    let BrowserDialogHandler = class BrowserDialogHandler extends dialogs_1.AbstractDialogHandler {
        static { BrowserDialogHandler_1 = this; }
        static { this.ALLOWABLE_COMMANDS = [
            'copy',
            'cut',
            'editor.action.selectAll',
            'editor.action.clipboardCopyAction',
            'editor.action.clipboardCutAction',
            'editor.action.clipboardPasteAction'
        ]; }
        constructor(logService, layoutService, keybindingService, instantiationService, productService, clipboardService) {
            super();
            this.logService = logService;
            this.layoutService = layoutService;
            this.keybindingService = keybindingService;
            this.instantiationService = instantiationService;
            this.productService = productService;
            this.clipboardService = clipboardService;
            this.markdownRenderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
        }
        async prompt(prompt) {
            this.logService.trace('DialogService#prompt', prompt.message);
            const buttons = this.getPromptButtons(prompt);
            const { button, checkboxChecked } = await this.doShow(prompt.type, prompt.message, buttons, prompt.detail, prompt.cancelButton ? buttons.length - 1 : -1 /* Disabled */, prompt.checkbox, undefined, typeof prompt?.custom === 'object' ? prompt.custom : undefined);
            return this.getPromptResult(prompt, button, checkboxChecked);
        }
        async confirm(confirmation) {
            this.logService.trace('DialogService#confirm', confirmation.message);
            const buttons = this.getConfirmationButtons(confirmation);
            const { button, checkboxChecked } = await this.doShow(confirmation.type ?? 'question', confirmation.message, buttons, confirmation.detail, buttons.length - 1, confirmation.checkbox, undefined, typeof confirmation?.custom === 'object' ? confirmation.custom : undefined);
            return { confirmed: button === 0, checkboxChecked };
        }
        async input(input) {
            this.logService.trace('DialogService#input', input.message);
            const buttons = this.getInputButtons(input);
            const { button, checkboxChecked, values } = await this.doShow(input.type ?? 'question', input.message, buttons, input.detail, buttons.length - 1, input?.checkbox, input.inputs, typeof input.custom === 'object' ? input.custom : undefined);
            return { confirmed: button === 0, checkboxChecked, values };
        }
        async about() {
            const detailString = (useAgo) => {
                return (0, nls_1.localize)('aboutDetail', "Version: {0}\nCommit: {1}\nDate: {2}\nBrowser: {3}", this.productService.version || 'Unknown', this.productService.commit || 'Unknown', this.productService.date ? `${this.productService.date}${useAgo ? ' (' + (0, date_1.fromNow)(new Date(this.productService.date), true) + ')' : ''}` : 'Unknown', navigator.userAgent);
            };
            const detail = detailString(true);
            const detailToCopy = detailString(false);
            const { button } = await this.doShow(severity_1.default.Info, this.productService.nameLong, [
                (0, nls_1.localize)({ key: 'copy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
                (0, nls_1.localize)('ok', "OK")
            ], detail, 1);
            if (button === 0) {
                this.clipboardService.writeText(detailToCopy);
            }
        }
        async doShow(type, message, buttons, detail, cancelId, checkbox, inputs, customOptions) {
            const dialogDisposables = new lifecycle_1.DisposableStore();
            const renderBody = customOptions ? (parent) => {
                parent.classList.add(...(customOptions.classes || []));
                customOptions.markdownDetails?.forEach(markdownDetail => {
                    const result = this.markdownRenderer.render(markdownDetail.markdown);
                    parent.appendChild(result.element);
                    result.element.classList.add(...(markdownDetail.classes || []));
                    dialogDisposables.add(result);
                });
            } : undefined;
            const dialog = new dialog_1.Dialog(this.layoutService.container, message, buttons, {
                detail,
                cancelId,
                type: this.getDialogType(type),
                keyEventProcessor: (event) => {
                    const resolved = this.keybindingService.softDispatch(event, this.layoutService.container);
                    if (resolved.kind === 2 /* ResultKind.KbFound */ && resolved.commandId) {
                        if (BrowserDialogHandler_1.ALLOWABLE_COMMANDS.indexOf(resolved.commandId) === -1) {
                            dom_1.EventHelper.stop(event, true);
                        }
                    }
                },
                renderBody,
                icon: customOptions?.icon,
                disableCloseAction: customOptions?.disableCloseAction,
                buttonDetails: customOptions?.buttonDetails,
                checkboxLabel: checkbox?.label,
                checkboxChecked: checkbox?.checked,
                inputs,
                buttonStyles: defaultStyles_1.defaultButtonStyles,
                checkboxStyles: defaultStyles_1.defaultCheckboxStyles,
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles,
                dialogStyles: defaultStyles_1.defaultDialogStyles
            });
            dialogDisposables.add(dialog);
            const result = await dialog.show();
            dialogDisposables.dispose();
            return result;
        }
    };
    exports.BrowserDialogHandler = BrowserDialogHandler;
    exports.BrowserDialogHandler = BrowserDialogHandler = BrowserDialogHandler_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, layoutService_1.ILayoutService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, productService_1.IProductService),
        __param(5, clipboardService_1.IClipboardService)
    ], BrowserDialogHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2RpYWxvZ3MvZGlhbG9nSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLCtCQUFxQjs7aUJBRXRDLHVCQUFrQixHQUFHO1lBQzVDLE1BQU07WUFDTixLQUFLO1lBQ0wseUJBQXlCO1lBQ3pCLG1DQUFtQztZQUNuQyxrQ0FBa0M7WUFDbEMsb0NBQW9DO1NBQ3BDLEFBUHlDLENBT3hDO1FBSUYsWUFDYyxVQUF3QyxFQUNyQyxhQUE4QyxFQUMxQyxpQkFBc0QsRUFDbkQsb0JBQTRELEVBQ2xFLGNBQWdELEVBQzlDLGdCQUFvRDtZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQVBzQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3BCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN6QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDakQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFSdkQscUJBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQVduRyxDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBSSxNQUFrQjtZQUNqQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTlDLE1BQU0s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