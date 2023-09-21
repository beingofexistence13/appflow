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
define(["require", "exports", "vs/base/common/actions", "vs/nls!vs/workbench/browser/actions/textInputActions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/platform/clipboard/common/clipboardService", "vs/base/browser/mouseEvent"], function (require, exports, actions_1, nls_1, layoutService_1, contextView_1, lifecycle_1, dom_1, contributions_1, platform_1, platform_2, clipboardService_1, mouseEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$utb = void 0;
    let $utb = class $utb extends lifecycle_1.$kc {
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = [];
            this.g();
            this.h();
        }
        g() {
            this.a.push(
            // Undo/Redo
            new actions_1.$gi('undo', (0, nls_1.localize)(0, null), undefined, true, async () => document.execCommand('undo')), new actions_1.$gi('redo', (0, nls_1.localize)(1, null), undefined, true, async () => document.execCommand('redo')), new actions_1.$ii(), 
            // Cut / Copy / Paste
            new actions_1.$gi('editor.action.clipboardCutAction', (0, nls_1.localize)(2, null), undefined, true, async () => document.execCommand('cut')), new actions_1.$gi('editor.action.clipboardCopyAction', (0, nls_1.localize)(3, null), undefined, true, async () => document.execCommand('copy')), new actions_1.$gi('editor.action.clipboardPasteAction', (0, nls_1.localize)(4, null), undefined, true, async (element) => {
                // Native: paste is supported
                if (platform_2.$m) {
                    document.execCommand('paste');
                }
                // Web: paste is not supported due to security reasons
                else {
                    const clipboardText = await this.f.readText();
                    if (element instanceof HTMLTextAreaElement ||
                        element instanceof HTMLInputElement) {
                        const selectionStart = element.selectionStart || 0;
                        const selectionEnd = element.selectionEnd || 0;
                        element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
                        element.selectionStart = selectionStart + clipboardText.length;
                        element.selectionEnd = element.selectionStart;
                    }
                }
            }), new actions_1.$ii(), 
            // Select All
            new actions_1.$gi('editor.action.selectAll', (0, nls_1.localize)(5, null), undefined, true, async () => document.execCommand('selectAll')));
        }
        h() {
            // Context menu support in input/textarea
            this.b.container.addEventListener('contextmenu', e => this.j(e));
        }
        j(e) {
            if (e.defaultPrevented) {
                return; // make sure to not show these actions by accident if component indicated to prevent
            }
            const target = e.target;
            if (!(target instanceof HTMLElement) || (target.nodeName.toLowerCase() !== 'input' && target.nodeName.toLowerCase() !== 'textarea')) {
                return; // only for inputs or textareas
            }
            dom_1.$5O.stop(e, true);
            const event = new mouseEvent_1.$eO(e);
            this.c.showContextMenu({
                getAnchor: () => event,
                getActions: () => this.a,
                getActionsContext: () => target,
            });
        }
    };
    exports.$utb = $utb;
    exports.$utb = $utb = __decorate([
        __param(0, layoutService_1.$Meb),
        __param(1, contextView_1.$WZ),
        __param(2, clipboardService_1.$UZ)
    ], $utb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($utb, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=textInputActions.js.map