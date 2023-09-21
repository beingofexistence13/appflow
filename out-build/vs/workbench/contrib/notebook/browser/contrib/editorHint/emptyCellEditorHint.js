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
define(["require", "exports", "vs/base/common/network", "vs/editor/browser/editorExtensions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, network_1, editorExtensions_1, commands_1, configuration_1, keybinding_1, productService_1, telemetry_1, emptyTextEditorHint_1, inlineChatSession_1, inlineChat_1, notebookBrowser_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eFb = void 0;
    let $eFb = class $eFb extends emptyTextEditorHint_1.$dFb {
        static { this.CONTRIB_ID = 'notebook.editor.contrib.emptyCellEditorHint'; }
        constructor(editor, o, editorGroupsService, commandService, configurationService, keybindingService, inlineChatSessionService, inlineChatService, telemetryService, productService) {
            super(editor, editorGroupsService, commandService, configurationService, keybindingService, inlineChatSessionService, inlineChatService, telemetryService, productService);
            this.o = o;
            const activeEditor = (0, notebookBrowser_1.$Zbb)(this.o.activeEditorPane);
            if (!activeEditor) {
                return;
            }
            this.a.push(activeEditor.onDidChangeActiveCell(() => this.n()));
        }
        m() {
            const shouldRenderHint = super.m();
            if (!shouldRenderHint) {
                return false;
            }
            const model = this.c.getModel();
            if (!model) {
                return false;
            }
            const isNotebookCell = model?.uri.scheme === network_1.Schemas.vscodeNotebookCell;
            if (!isNotebookCell) {
                return false;
            }
            const activeEditor = (0, notebookBrowser_1.$Zbb)(this.o.activeEditorPane);
            if (!activeEditor) {
                return false;
            }
            const activeCell = activeEditor.getActiveCell();
            if (activeCell?.uri.fragment !== model.uri.fragment) {
                return false;
            }
            return true;
        }
    };
    exports.$eFb = $eFb;
    exports.$eFb = $eFb = __decorate([
        __param(1, editorService_1.$9C),
        __param(2, editorGroupsService_1.$5C),
        __param(3, commands_1.$Fr),
        __param(4, configuration_1.$8h),
        __param(5, keybinding_1.$2D),
        __param(6, inlineChatSession_1.$bqb),
        __param(7, inlineChat_1.$dz),
        __param(8, telemetry_1.$9k),
        __param(9, productService_1.$kj)
    ], $eFb);
    (0, editorExtensions_1.$AV)($eFb.CONTRIB_ID, $eFb, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to render a help message
});
//# sourceMappingURL=emptyCellEditorHint.js.map