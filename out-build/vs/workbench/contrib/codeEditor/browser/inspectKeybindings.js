/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/inspectKeybindings", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/editor/common/editorService", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions"], function (require, exports, nls_1, keybinding_1, editorService_1, actionCommonCategories_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InspectKeyMap extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.inspectKeyMappings',
                title: { value: (0, nls_1.localize)(0, null), original: 'Inspect Key Mappings' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor, editor) {
            const keybindingService = accessor.get(keybinding_1.$2D);
            const editorService = accessor.get(editorService_1.$9C);
            editorService.openEditor({ resource: undefined, contents: keybindingService._dumpDebugInfo(), options: { pinned: true } });
        }
    }
    (0, actions_1.$Xu)(InspectKeyMap);
    class InspectKeyMapJSON extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.inspectKeyMappingsJSON',
                title: { value: (0, nls_1.localize)(1, null), original: 'Inspect Key Mappings (JSON)' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const keybindingService = accessor.get(keybinding_1.$2D);
            await editorService.openEditor({ resource: undefined, contents: keybindingService._dumpDebugInfoJSON(), options: { pinned: true } });
        }
    }
    (0, actions_1.$Xu)(InspectKeyMapJSON);
});
//# sourceMappingURL=inspectKeybindings.js.map