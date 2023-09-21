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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/toggleMultiCursorModifier", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, nls_1, platform_1, actions_1, configuration_1, contextkey_1, platform_2, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fYb = void 0;
    class $fYb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.toggleMultiCursorModifier'; }
        static { this.a = 'editor.multiCursorModifier'; }
        constructor() {
            super({
                id: $fYb.ID,
                title: { value: (0, nls_1.localize)(0, null), original: 'Toggle Multi-Cursor Modifier' },
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const editorConf = configurationService.getValue('editor');
            const newValue = (editorConf.multiCursorModifier === 'ctrlCmd' ? 'alt' : 'ctrlCmd');
            return configurationService.updateValue($fYb.a, newValue);
        }
    }
    exports.$fYb = $fYb;
    const multiCursorModifier = new contextkey_1.$2i('multiCursorModifier', 'altKey');
    let MultiCursorModifierContextKeyController = class MultiCursorModifierContextKeyController {
        constructor(b, contextKeyService) {
            this.b = b;
            this.a = multiCursorModifier.bindTo(contextKeyService);
            this.c();
            b.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('editor.multiCursorModifier')) {
                    this.c();
                }
            });
        }
        c() {
            const editorConf = this.b.getValue('editor');
            const value = (editorConf.multiCursorModifier === 'ctrlCmd' ? 'ctrlCmd' : 'altKey');
            this.a.set(value);
        }
    };
    MultiCursorModifierContextKeyController = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, contextkey_1.$3i)
    ], MultiCursorModifierContextKeyController);
    platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(MultiCursorModifierContextKeyController, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.$Xu)($fYb);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSelectionMenu, {
        group: '4_config',
        command: {
            id: $fYb.ID,
            title: (0, nls_1.localize)(1, null)
        },
        when: multiCursorModifier.isEqualTo('ctrlCmd'),
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSelectionMenu, {
        group: '4_config',
        command: {
            id: $fYb.ID,
            title: (platform_1.$j
                ? (0, nls_1.localize)(2, null)
                : (0, nls_1.localize)(3, null))
        },
        when: multiCursorModifier.isEqualTo('altKey'),
        order: 1
    });
});
//# sourceMappingURL=toggleMultiCursorModifier.js.map