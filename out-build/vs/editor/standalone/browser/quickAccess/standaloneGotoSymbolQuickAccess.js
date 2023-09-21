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
define(["require", "exports", "vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/browser/services/codeEditorService", "vs/editor/common/standaloneStrings", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/quickinput/common/quickInput", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/editor/common/services/languageFeatures", "vs/base/browser/ui/codicons/codiconStyles", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, gotoSymbolQuickAccess_1, platform_1, quickAccess_1, codeEditorService_1, standaloneStrings_1, event_1, editorExtensions_1, editorContextKeys_1, quickInput_1, outlineModel_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r0b = exports.$q0b = void 0;
    let $q0b = class $q0b extends gotoSymbolQuickAccess_1.$AMb {
        constructor(z, languageFeaturesService, outlineModelService) {
            super(languageFeaturesService, outlineModelService);
            this.z = z;
            this.h = event_1.Event.None;
        }
        get i() {
            return this.z.getFocusedCodeEditor() ?? undefined;
        }
    };
    exports.$q0b = $q0b;
    exports.$q0b = $q0b = __decorate([
        __param(0, codeEditorService_1.$nV),
        __param(1, languageFeatures_1.$hF),
        __param(2, outlineModel_1.$R8)
    ], $q0b);
    class $r0b extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.quickOutline'; }
        constructor() {
            super({
                id: $r0b.ID,
                label: standaloneStrings_1.QuickOutlineNLS.quickOutlineActionLabel,
                alias: 'Go to Symbol...',
                precondition: editorContextKeys_1.EditorContextKeys.hasDocumentSymbolProvider,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: 'navigation',
                    order: 3
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.$Gq).quickAccess.show(gotoSymbolQuickAccess_1.$AMb.PREFIX, { itemActivation: quickInput_1.ItemActivation.NONE });
        }
    }
    exports.$r0b = $r0b;
    (0, editorExtensions_1.$xV)($r0b);
    platform_1.$8m.as(quickAccess_1.$8p.Quickaccess).registerQuickAccessProvider({
        ctor: $q0b,
        prefix: gotoSymbolQuickAccess_1.$AMb.PREFIX,
        helpEntries: [
            { description: standaloneStrings_1.QuickOutlineNLS.quickOutlineActionLabel, prefix: gotoSymbolQuickAccess_1.$AMb.PREFIX, commandId: $r0b.ID },
            { description: standaloneStrings_1.QuickOutlineNLS.quickOutlineByCategoryActionLabel, prefix: gotoSymbolQuickAccess_1.$AMb.PREFIX_BY_CATEGORY }
        ]
    });
});
//# sourceMappingURL=standaloneGotoSymbolQuickAccess.js.map