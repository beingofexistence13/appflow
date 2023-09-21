/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.zoomLevelToZoomFactor = exports.useWindowControlsOverlay = exports.getTitleBarStyle = exports.getMenuBarVisibility = exports.isFileToOpen = exports.isFolderToOpen = exports.isWorkspaceToOpen = exports.WindowMinimumSize = void 0;
    exports.WindowMinimumSize = {
        WIDTH: 400,
        WIDTH_WITH_VERTICAL_PANEL: 600,
        HEIGHT: 270
    };
    function isWorkspaceToOpen(uriToOpen) {
        return !!uriToOpen.workspaceUri;
    }
    exports.isWorkspaceToOpen = isWorkspaceToOpen;
    function isFolderToOpen(uriToOpen) {
        return !!uriToOpen.folderUri;
    }
    exports.isFolderToOpen = isFolderToOpen;
    function isFileToOpen(uriToOpen) {
        return !!uriToOpen.fileUri;
    }
    exports.isFileToOpen = isFileToOpen;
    function getMenuBarVisibility(configurationService) {
        const titleBarStyle = getTitleBarStyle(configurationService);
        const menuBarVisibility = configurationService.getValue('window.menuBarVisibility');
        if (menuBarVisibility === 'default' || (titleBarStyle === 'native' && menuBarVisibility === 'compact') || (platform_1.isMacintosh && platform_1.isNative)) {
            return 'classic';
        }
        else {
            return menuBarVisibility;
        }
    }
    exports.getMenuBarVisibility = getMenuBarVisibility;
    function getTitleBarStyle(configurationService) {
        if (platform_1.isWeb) {
            return 'custom';
        }
        const configuration = configurationService.getValue('window');
        if (configuration) {
            const useNativeTabs = platform_1.isMacintosh && configuration.nativeTabs === true;
            if (useNativeTabs) {
                return 'native'; // native tabs on sierra do not work with custom title style
            }
            const useSimpleFullScreen = platform_1.isMacintosh && configuration.nativeFullScreen === false;
            if (useSimpleFullScreen) {
                return 'native'; // simple fullscreen does not work well with custom title style (https://github.com/microsoft/vscode/issues/63291)
            }
            const style = configuration.titleBarStyle;
            if (style === 'native' || style === 'custom') {
                return style;
            }
        }
        return platform_1.isLinux ? 'native' : 'custom'; // default to custom on all macOS and Windows
    }
    exports.getTitleBarStyle = getTitleBarStyle;
    function useWindowControlsOverlay(configurationService) {
        if (!platform_1.isWindows || platform_1.isWeb) {
            return false; // only supported on a desktop Windows instance
        }
        if (getTitleBarStyle(configurationService) === 'native') {
            return false; // only supported when title bar is custom
        }
        // Default to true.
        return true;
    }
    exports.useWindowControlsOverlay = useWindowControlsOverlay;
    /**
     * According to Electron docs: `scale := 1.2 ^ level`.
     * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
     */
    function zoomLevelToZoomFactor(zoomLevel = 0) {
        return Math.pow(1.2, zoomLevel);
    }
    exports.zoomLevelToZoomFactor = zoomLevelToZoomFactor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93L2NvbW1vbi93aW5kb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJuRixRQUFBLGlCQUFpQixHQUFHO1FBQ2hDLEtBQUssRUFBRSxHQUFHO1FBQ1YseUJBQXlCLEVBQUUsR0FBRztRQUM5QixNQUFNLEVBQUUsR0FBRztLQUNYLENBQUM7SUFxRUYsU0FBZ0IsaUJBQWlCLENBQUMsU0FBMEI7UUFDM0QsT0FBTyxDQUFDLENBQUUsU0FBOEIsQ0FBQyxZQUFZLENBQUM7SUFDdkQsQ0FBQztJQUZELDhDQUVDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLFNBQTBCO1FBQ3hELE9BQU8sQ0FBQyxDQUFFLFNBQTJCLENBQUMsU0FBUyxDQUFDO0lBQ2pELENBQUM7SUFGRCx3Q0FFQztJQUVELFNBQWdCLFlBQVksQ0FBQyxTQUEwQjtRQUN0RCxPQUFPLENBQUMsQ0FBRSxTQUF5QixDQUFDLE9BQU8sQ0FBQztJQUM3QyxDQUFDO0lBRkQsb0NBRUM7SUFJRCxTQUFnQixvQkFBb0IsQ0FBQyxvQkFBMkM7UUFDL0UsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUM3RCxNQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBZ0MsMEJBQTBCLENBQUMsQ0FBQztRQUVuSCxJQUFJLGlCQUFpQixLQUFLLFNBQVMsSUFBSSxDQUFDLGFBQWEsS0FBSyxRQUFRLElBQUksaUJBQWlCLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBVyxJQUFJLG1CQUFRLENBQUMsRUFBRTtZQUNwSSxPQUFPLFNBQVMsQ0FBQztTQUNqQjthQUFNO1lBQ04sT0FBTyxpQkFBaUIsQ0FBQztTQUN6QjtJQUNGLENBQUM7SUFURCxvREFTQztJQXlCRCxTQUFnQixnQkFBZ0IsQ0FBQyxvQkFBMkM7UUFDM0UsSUFBSSxnQkFBSyxFQUFFO1lBQ1YsT0FBTyxRQUFRLENBQUM7U0FDaEI7UUFFRCxNQUFNLGFBQWEsR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQThCLFFBQVEsQ0FBQyxDQUFDO1FBQzNGLElBQUksYUFBYSxFQUFFO1lBQ2xCLE1BQU0sYUFBYSxHQUFHLHNCQUFXLElBQUksYUFBYSxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUM7WUFDdkUsSUFBSSxhQUFhLEVBQUU7Z0JBQ2xCLE9BQU8sUUFBUSxDQUFDLENBQUMsNERBQTREO2FBQzdFO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxzQkFBVyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsS0FBSyxLQUFLLENBQUM7WUFDcEYsSUFBSSxtQkFBbUIsRUFBRTtnQkFDeEIsT0FBTyxRQUFRLENBQUMsQ0FBQyxrSEFBa0g7YUFDbkk7WUFFRCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDO1lBQzFDLElBQUksS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUM3QyxPQUFPLEtBQUssQ0FBQzthQUNiO1NBQ0Q7UUFFRCxPQUFPLGtCQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsNkNBQTZDO0lBQ3BGLENBQUM7SUF4QkQsNENBd0JDO0lBRUQsU0FBZ0Isd0JBQXdCLENBQUMsb0JBQTJDO1FBQ25GLElBQUksQ0FBQyxvQkFBUyxJQUFJLGdCQUFLLEVBQUU7WUFDeEIsT0FBTyxLQUFLLENBQUMsQ0FBQywrQ0FBK0M7U0FDN0Q7UUFFRCxJQUFJLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ3hELE9BQU8sS0FBSyxDQUFDLENBQUMsMENBQTBDO1NBQ3hEO1FBRUQsbUJBQW1CO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQVhELDREQVdDO0lBMklEOzs7T0FHRztJQUNILFNBQWdCLHFCQUFxQixDQUFDLFNBQVMsR0FBRyxDQUFDO1FBQ2xELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUZELHNEQUVDIn0=