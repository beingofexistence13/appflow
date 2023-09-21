/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/services/modelService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, platform_1, uri_1, modelService_1, configuration_1, testConfigurationService_1, contextkey_1, mockKeybindingService_1, themeService_1, testThemeService_1, notebookEditorServiceImpl_1, editorGroupsService_1, editorService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addToSearchResult = exports.stubNotebookEditorService = exports.stubModelService = exports.getRootName = exports.createFileUriFromPathFromRoot = void 0;
    function createFileUriFromPathFromRoot(path) {
        const rootName = getRootName();
        if (path) {
            return uri_1.URI.file(`${rootName}${path}`);
        }
        else {
            if (platform_1.isWindows) {
                return uri_1.URI.file(`${rootName}/`);
            }
            else {
                return uri_1.URI.file(rootName);
            }
        }
    }
    exports.createFileUriFromPathFromRoot = createFileUriFromPathFromRoot;
    function getRootName() {
        if (platform_1.isWindows) {
            return 'c:';
        }
        else {
            return '';
        }
    }
    exports.getRootName = getRootName;
    function stubModelService(instantiationService) {
        instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        const config = new testConfigurationService_1.TestConfigurationService();
        config.setUserConfiguration('search', { searchOnType: true });
        instantiationService.stub(configuration_1.IConfigurationService, config);
        return instantiationService.createInstance(modelService_1.ModelService);
    }
    exports.stubModelService = stubModelService;
    function stubNotebookEditorService(instantiationService) {
        instantiationService.stub(editorGroupsService_1.IEditorGroupsService, new workbenchTestServices_1.TestEditorGroupsService());
        instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
        instantiationService.stub(editorService_1.IEditorService, new workbenchTestServices_1.TestEditorService());
        return instantiationService.createInstance(notebookEditorServiceImpl_1.NotebookEditorWidgetService);
    }
    exports.stubNotebookEditorService = stubNotebookEditorService;
    function addToSearchResult(searchResult, allRaw, searchInstanceID = '') {
        searchResult.add(allRaw, searchInstanceID);
    }
    exports.addToSearchResult = addToSearchResult;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoVGVzdENvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC90ZXN0L2Jyb3dzZXIvc2VhcmNoVGVzdENvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLFNBQWdCLDZCQUE2QixDQUFDLElBQWE7UUFDMUQsTUFBTSxRQUFRLEdBQUcsV0FBVyxFQUFFLENBQUM7UUFDL0IsSUFBSSxJQUFJLEVBQUU7WUFDVCxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN0QzthQUFNO1lBQ04sSUFBSSxvQkFBUyxFQUFFO2dCQUNkLE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUM7YUFDaEM7aUJBQU07Z0JBQ04sT0FBTyxTQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzFCO1NBQ0Q7SUFDRixDQUFDO0lBWEQsc0VBV0M7SUFFRCxTQUFnQixXQUFXO1FBQzFCLElBQUksb0JBQVMsRUFBRTtZQUNkLE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTTtZQUNOLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7SUFDRixDQUFDO0lBTkQsa0NBTUM7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxvQkFBOEM7UUFDOUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDRCQUFhLEVBQUUsSUFBSSxtQ0FBZ0IsRUFBRSxDQUFDLENBQUM7UUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM5RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUNBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkJBQVksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFORCw0Q0FNQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLG9CQUE4QztRQUN2RixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsMENBQW9CLEVBQUUsSUFBSSwrQ0FBdUIsRUFBRSxDQUFDLENBQUM7UUFDL0Usb0JBQW9CLENBQUMsSUFBSSxDQUFDLCtCQUFrQixFQUFFLElBQUksNkNBQXFCLEVBQUUsQ0FBQyxDQUFDO1FBQzNFLG9CQUFvQixDQUFDLElBQUksQ0FBQyw4QkFBYyxFQUFFLElBQUkseUNBQWlCLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVEQUEyQixDQUFDLENBQUM7SUFDekUsQ0FBQztJQUxELDhEQUtDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUMsWUFBMEIsRUFBRSxNQUFvQixFQUFFLGdCQUFnQixHQUFHLEVBQUU7UUFDeEcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRkQsOENBRUMifQ==