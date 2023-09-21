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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/quickaccess/gotoLineQuickAccess", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/platform/configuration/common/configuration", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, nls_1, quickInput_1, editorService_1, gotoLineQuickAccess_1, platform_1, quickAccess_1, configuration_1, actions_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0Xb = void 0;
    let $0Xb = class $0Xb extends gotoLineQuickAccess_1.$zMb {
        constructor(t, u, v) {
            super();
            this.t = t;
            this.u = u;
            this.v = v;
            this.h = this.t.onDidActiveEditorChange;
        }
        get w() {
            const editorConfig = this.v.getValue().workbench?.editor;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview
            };
        }
        get i() {
            return this.t.activeTextEditorControl;
        }
        f(context, options) {
            // Check for sideBySide use
            if ((options.keyMods.alt || (this.w.openEditorPinned && options.keyMods.ctrlCmd) || options.forceSideBySide) && this.t.activeEditor) {
                context.restoreViewState?.(); // since we open to the side, restore view state in this editor
                const editorOptions = {
                    selection: options.range,
                    pinned: options.keyMods.ctrlCmd || this.w.openEditorPinned,
                    preserveFocus: options.preserveFocus
                };
                this.u.sideGroup.openEditor(this.t.activeEditor, editorOptions);
            }
            // Otherwise let parent handle it
            else {
                super.f(context, options);
            }
        }
    };
    exports.$0Xb = $0Xb;
    exports.$0Xb = $0Xb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, editorGroupsService_1.$5C),
        __param(2, configuration_1.$8h)
    ], $0Xb);
    class GotoLineAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.gotoLine'; }
        constructor() {
            super({
                id: GotoLineAction.ID,
                title: { value: (0, nls_1.localize)(0, null), original: 'Go to Line/Column...' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: null,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 37 /* KeyCode.KeyG */ }
                }
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show($0Xb.PREFIX);
        }
    }
    (0, actions_1.$Xu)(GotoLineAction);
    platform_1.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: $0Xb,
        prefix: gotoLineQuickAccess_1.$zMb.PREFIX,
        placeholder: (0, nls_1.localize)(1, null),
        helpEntries: [{ description: (0, nls_1.localize)(2, null), commandId: GotoLineAction.ID }]
    });
});
//# sourceMappingURL=gotoLineQuickAccess.js.map