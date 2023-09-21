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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/dialogs/dialogHandler", "vs/platform/dialogs/common/dialogs", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/base/common/severity", "vs/base/browser/ui/dialog/dialog", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/product/common/productService", "vs/platform/clipboard/common/clipboardService", "vs/base/common/date", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/platform/theme/browser/defaultStyles"], function (require, exports, nls_1, dialogs_1, layoutService_1, log_1, severity_1, dialog_1, lifecycle_1, dom_1, keybinding_1, productService_1, clipboardService_1, date_1, instantiation_1, markdownRenderer_1, defaultStyles_1) {
    "use strict";
    var $W1b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$W1b = void 0;
    let $W1b = class $W1b extends dialogs_1.$pA {
        static { $W1b_1 = this; }
        static { this.g = [
            'copy',
            'cut',
            'editor.action.selectAll',
            'editor.action.clipboardCopyAction',
            'editor.action.clipboardCutAction',
            'editor.action.clipboardPasteAction'
        ]; }
        constructor(i, j, k, l, m, n) {
            super();
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.h = this.l.createInstance(markdownRenderer_1.$K2, {});
        }
        async prompt(prompt) {
            this.i.trace('DialogService#prompt', prompt.message);
            const buttons = this.b(prompt);
            const { button, checkboxChecked } = await this.o(prompt.type, prompt.message, buttons, prompt.detail, prompt.cancelButton ? buttons.length - 1 : -1 /* Disabled */, prompt.checkbox, undefined, typeof prompt?.custom === 'object' ? prompt.custom : undefined);
            return this.f(prompt, button, checkboxChecked);
        }
        async confirm(confirmation) {
            this.i.trace('DialogService#confirm', confirmation.message);
            const buttons = this.a(confirmation);
            const { button, checkboxChecked } = await this.o(confirmation.type ?? 'question', confirmation.message, buttons, confirmation.detail, buttons.length - 1, confirmation.checkbox, undefined, typeof confirmation?.custom === 'object' ? confirmation.custom : undefined);
            return { confirmed: button === 0, checkboxChecked };
        }
        async input(input) {
            this.i.trace('DialogService#input', input.message);
            const buttons = this.c(input);
            const { button, checkboxChecked, values } = await this.o(input.type ?? 'question', input.message, buttons, input.detail, buttons.length - 1, input?.checkbox, input.inputs, typeof input.custom === 'object' ? input.custom : undefined);
            return { confirmed: button === 0, checkboxChecked, values };
        }
        async about() {
            const detailString = (useAgo) => {
                return (0, nls_1.localize)(0, null, this.m.version || 'Unknown', this.m.commit || 'Unknown', this.m.date ? `${this.m.date}${useAgo ? ' (' + (0, date_1.$6l)(new Date(this.m.date), true) + ')' : ''}` : 'Unknown', navigator.userAgent);
            };
            const detail = detailString(true);
            const detailToCopy = detailString(false);
            const { button } = await this.o(severity_1.default.Info, this.m.nameLong, [
                (0, nls_1.localize)(1, null),
                (0, nls_1.localize)(2, null)
            ], detail, 1);
            if (button === 0) {
                this.n.writeText(detailToCopy);
            }
        }
        async o(type, message, buttons, detail, cancelId, checkbox, inputs, customOptions) {
            const dialogDisposables = new lifecycle_1.$jc();
            const renderBody = customOptions ? (parent) => {
                parent.classList.add(...(customOptions.classes || []));
                customOptions.markdownDetails?.forEach(markdownDetail => {
                    const result = this.h.render(markdownDetail.markdown);
                    parent.appendChild(result.element);
                    result.element.classList.add(...(markdownDetail.classes || []));
                    dialogDisposables.add(result);
                });
            } : undefined;
            const dialog = new dialog_1.$uR(this.j.container, message, buttons, {
                detail,
                cancelId,
                type: this.e(type),
                keyEventProcessor: (event) => {
                    const resolved = this.k.softDispatch(event, this.j.container);
                    if (resolved.kind === 2 /* ResultKind.KbFound */ && resolved.commandId) {
                        if ($W1b_1.g.indexOf(resolved.commandId) === -1) {
                            dom_1.$5O.stop(event, true);
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
                buttonStyles: defaultStyles_1.$i2,
                checkboxStyles: defaultStyles_1.$o2,
                inputBoxStyles: defaultStyles_1.$s2,
                dialogStyles: defaultStyles_1.$q2
            });
            dialogDisposables.add(dialog);
            const result = await dialog.show();
            dialogDisposables.dispose();
            return result;
        }
    };
    exports.$W1b = $W1b;
    exports.$W1b = $W1b = $W1b_1 = __decorate([
        __param(0, log_1.$5i),
        __param(1, layoutService_1.$XT),
        __param(2, keybinding_1.$2D),
        __param(3, instantiation_1.$Ah),
        __param(4, productService_1.$kj),
        __param(5, clipboardService_1.$UZ)
    ], $W1b);
});
//# sourceMappingURL=dialogHandler.js.map