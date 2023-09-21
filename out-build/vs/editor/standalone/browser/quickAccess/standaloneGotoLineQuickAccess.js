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
define(["require", "exports", "vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/browser/services/codeEditorService", "vs/editor/common/standaloneStrings", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/quickinput/common/quickInput"], function (require, exports, gotoLineQuickAccess_1, platform_1, quickAccess_1, codeEditorService_1, standaloneStrings_1, event_1, editorExtensions_1, editorContextKeys_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$p0b = exports.$o0b = void 0;
    let $o0b = class $o0b extends gotoLineQuickAccess_1.$zMb {
        constructor(t) {
            super();
            this.t = t;
            this.h = event_1.Event.None;
        }
        get i() {
            return this.t.getFocusedCodeEditor() ?? undefined;
        }
    };
    exports.$o0b = $o0b;
    exports.$o0b = $o0b = __decorate([
        __param(0, codeEditorService_1.$nV)
    ], $o0b);
    class $p0b extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.gotoLine'; }
        constructor() {
            super({
                id: $p0b.ID,
                label: standaloneStrings_1.GoToLineNLS.gotoLineActionLabel,
                alias: 'Go to Line/Column...',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 37 /* KeyCode.KeyG */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show($o0b.PREFIX);
        }
    }
    exports.$p0b = $p0b;
    (0, editorExtensions_1.$xV)($p0b);
    platform_1.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: $o0b,
        prefix: $o0b.PREFIX,
        helpEntries: [{ description: standaloneStrings_1.GoToLineNLS.gotoLineActionLabel, commandId: $p0b.ID }]
    });
});
//# sourceMappingURL=standaloneGotoLineQuickAccess.js.map