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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/common/standaloneStrings", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/quickAccess/browser/commandsQuickAccess", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/platform/dialogs/common/dialogs", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/quickinput/common/quickInput"], function (require, exports, platform_1, quickAccess_1, standaloneStrings_1, codeEditorService_1, commandsQuickAccess_1, instantiation_1, keybinding_1, commands_1, telemetry_1, dialogs_1, editorExtensions_1, editorContextKeys_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t0b = exports.$s0b = void 0;
    let $s0b = class $s0b extends commandsQuickAccess_1.$LLb {
        get I() { return this.L.getFocusedCodeEditor() ?? undefined; }
        constructor(instantiationService, L, keybindingService, commandService, telemetryService, dialogService) {
            super({ showAlias: false }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
            this.L = L;
        }
        async F() {
            return this.J();
        }
        G() {
            return false;
        }
        async H() {
            return [];
        }
    };
    exports.$s0b = $s0b;
    exports.$s0b = $s0b = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, codeEditorService_1.$nV),
        __param(2, keybinding_1.$2D),
        __param(3, commands_1.$Fr),
        __param(4, telemetry_1.$9k),
        __param(5, dialogs_1.$oA)
    ], $s0b);
    class $t0b extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.quickCommand'; }
        constructor() {
            super({
                id: $t0b.ID,
                label: standaloneStrings_1.QuickCommandNLS.quickCommandActionLabel,
                alias: 'Command Palette',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 59 /* KeyCode.F1 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: 'z_commands',
                    order: 1
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show($s0b.PREFIX);
        }
    }
    exports.$t0b = $t0b;
    (0, editorExtensions_1.$xV)($t0b);
    platform_1.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: $s0b,
        prefix: $s0b.PREFIX,
        helpEntries: [{ description: standaloneStrings_1.QuickCommandNLS.quickCommandHelp, commandId: $t0b.ID }]
    });
});
//# sourceMappingURL=standaloneCommandsQuickAccess.js.map