/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UCb = exports.$TCb = exports.$SCb = exports.$RCb = exports.$QCb = exports.$PCb = exports.$OCb = exports.$NCb = exports.$MCb = exports.$LCb = exports.$KCb = exports.$JCb = exports.$ICb = exports.$HCb = exports.$GCb = exports.$FCb = exports.$ECb = exports.$DCb = exports.$CCb = exports.$BCb = exports.$ACb = exports.$zCb = exports.$yCb = exports.$xCb = exports.$wCb = exports.$vCb = exports.$uCb = exports.$tCb = exports.$sCb = exports.$rCb = exports.$qCb = exports.$pCb = exports.$oCb = exports.$nCb = exports.$mCb = exports.$lCb = exports.$kCb = exports.$jCb = exports.$iCb = exports.$hCb = exports.$gCb = exports.$fCb = exports.$eCb = exports.$dCb = exports.$cCb = exports.$bCb = void 0;
    exports.$bCb = (0, instantiation_1.$Bh)('preferencesSearchService');
    exports.$cCb = 'settings.action.clearSearchResults';
    exports.$dCb = 'settings.action.showContextMenu';
    exports.$eCb = 'settings.action.suggestFilters';
    exports.$fCb = new contextkey_1.$2i('inSettingsEditor', false);
    exports.$gCb = new contextkey_1.$2i('inSettingsJSONEditor', false);
    exports.$hCb = new contextkey_1.$2i('inSettingsSearch', false);
    exports.$iCb = new contextkey_1.$2i('settingsTocRowFocus', false);
    exports.$jCb = new contextkey_1.$2i('settingRowFocus', false);
    exports.$kCb = new contextkey_1.$2i('inKeybindings', false);
    exports.$lCb = new contextkey_1.$2i('inKeybindingsSearch', false);
    exports.$mCb = new contextkey_1.$2i('keybindingFocus', false);
    exports.$nCb = new contextkey_1.$2i('whenFocus', false);
    exports.$oCb = 'keybindings.editor.searchKeybindings';
    exports.$pCb = 'keybindings.editor.clearSearchResults';
    exports.$qCb = 'keybindings.editor.clearSearchHistory';
    exports.$rCb = 'keybindings.editor.recordSearchKeys';
    exports.$sCb = 'keybindings.editor.toggleSortByPrecedence';
    exports.$tCb = 'keybindings.editor.defineKeybinding';
    exports.$uCb = 'keybindings.editor.addKeybinding';
    exports.$vCb = 'keybindings.editor.defineWhenExpression';
    exports.$wCb = 'keybindings.editor.acceptWhenExpression';
    exports.$xCb = 'keybindings.editor.rejectWhenExpression';
    exports.$yCb = 'keybindings.editor.removeKeybinding';
    exports.$zCb = 'keybindings.editor.resetKeybinding';
    exports.$ACb = 'keybindings.editor.copyKeybindingEntry';
    exports.$BCb = 'keybindings.editor.copyCommandKeybindingEntry';
    exports.$CCb = 'keybindings.editor.copyCommandTitle';
    exports.$DCb = 'keybindings.editor.showConflicts';
    exports.$ECb = 'keybindings.editor.focusKeybindings';
    exports.$FCb = 'keybindings.editor.showDefaultKeybindings';
    exports.$GCb = 'keybindings.editor.showUserKeybindings';
    exports.$HCb = 'keybindings.editor.showExtensionKeybindings';
    exports.$ICb = 'modified';
    exports.$JCb = 'ext:';
    exports.$KCb = 'feature:';
    exports.$LCb = 'id:';
    exports.$MCb = 'lang:';
    exports.$NCb = 'tag:';
    exports.$OCb = 'hasPolicy';
    exports.$PCb = 'workspaceTrust';
    exports.$QCb = 'requireTrustedWorkspace';
    exports.$RCb = 'workbench.action.openKeyboardLayoutPicker';
    exports.$SCb = true;
    exports.$TCb = true;
    let cachedExtensionToggleData;
    async function $UCb(workbenchAssignmentService, environmentService, productService) {
        if (!exports.$TCb) {
            return undefined;
        }
        if (cachedExtensionToggleData) {
            return cachedExtensionToggleData;
        }
        const isTreatment = await workbenchAssignmentService.getTreatment('ExtensionToggleSettings');
        if ((isTreatment || !environmentService.isBuilt) && productService.extensionRecommendations && productService.commonlyUsedSettings) {
            const settingsEditorRecommendedExtensions = {};
            Object.keys(productService.extensionRecommendations).forEach(extensionId => {
                const extensionInfo = productService.extensionRecommendations[extensionId];
                if (extensionInfo.onSettingsEditorOpen) {
                    settingsEditorRecommendedExtensions[extensionId] = extensionInfo;
                }
            });
            cachedExtensionToggleData = {
                settingsEditorRecommendedExtensions,
                commonlyUsed: productService.commonlyUsedSettings
            };
            return cachedExtensionToggleData;
        }
        return undefined;
    }
    exports.$UCb = $UCb;
});
//# sourceMappingURL=preferences.js.map