/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/services/modelService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, platform_1, uri_1, modelService_1, configuration_1, testConfigurationService_1, contextkey_1, mockKeybindingService_1, themeService_1, testThemeService_1, notebookEditorServiceImpl_1, editorGroupsService_1, editorService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Tfc = exports.$Sfc = exports.$Rfc = exports.$Qfc = exports.$Pfc = void 0;
    function $Pfc(path) {
        const rootName = $Qfc();
        if (path) {
            return uri_1.URI.file(`${rootName}${path}`);
        }
        else {
            if (platform_1.$i) {
                return uri_1.URI.file(`${rootName}/`);
            }
            else {
                return uri_1.URI.file(rootName);
            }
        }
    }
    exports.$Pfc = $Pfc;
    function $Qfc() {
        if (platform_1.$i) {
            return 'c:';
        }
        else {
            return '';
        }
    }
    exports.$Qfc = $Qfc;
    function $Rfc(instantiationService) {
        instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
        const config = new testConfigurationService_1.$G0b();
        config.setUserConfiguration('search', { searchOnType: true });
        instantiationService.stub(configuration_1.$8h, config);
        return instantiationService.createInstance(modelService_1.$4yb);
    }
    exports.$Rfc = $Rfc;
    function $Sfc(instantiationService) {
        instantiationService.stub(editorGroupsService_1.$5C, new workbenchTestServices_1.$Bec());
        instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
        instantiationService.stub(editorService_1.$9C, new workbenchTestServices_1.$Eec());
        return instantiationService.createInstance(notebookEditorServiceImpl_1.$6Eb);
    }
    exports.$Sfc = $Sfc;
    function $Tfc(searchResult, allRaw, searchInstanceID = '') {
        searchResult.add(allRaw, searchInstanceID);
    }
    exports.$Tfc = $Tfc;
});
//# sourceMappingURL=searchTestCommon.js.map