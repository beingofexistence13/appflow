/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WD = exports.$VD = exports.$UD = exports.$TD = exports.$SD = exports.$RD = exports.$QD = exports.$PD = void 0;
    exports.$PD = {
        WIDTH: 400,
        WIDTH_WITH_VERTICAL_PANEL: 600,
        HEIGHT: 270
    };
    function $QD(uriToOpen) {
        return !!uriToOpen.workspaceUri;
    }
    exports.$QD = $QD;
    function $RD(uriToOpen) {
        return !!uriToOpen.folderUri;
    }
    exports.$RD = $RD;
    function $SD(uriToOpen) {
        return !!uriToOpen.fileUri;
    }
    exports.$SD = $SD;
    function $TD(configurationService) {
        const titleBarStyle = $UD(configurationService);
        const menuBarVisibility = configurationService.getValue('window.menuBarVisibility');
        if (menuBarVisibility === 'default' || (titleBarStyle === 'native' && menuBarVisibility === 'compact') || (platform_1.$j && platform_1.$m)) {
            return 'classic';
        }
        else {
            return menuBarVisibility;
        }
    }
    exports.$TD = $TD;
    function $UD(configurationService) {
        if (platform_1.$o) {
            return 'custom';
        }
        const configuration = configurationService.getValue('window');
        if (configuration) {
            const useNativeTabs = platform_1.$j && configuration.nativeTabs === true;
            if (useNativeTabs) {
                return 'native'; // native tabs on sierra do not work with custom title style
            }
            const useSimpleFullScreen = platform_1.$j && configuration.nativeFullScreen === false;
            if (useSimpleFullScreen) {
                return 'native'; // simple fullscreen does not work well with custom title style (https://github.com/microsoft/vscode/issues/63291)
            }
            const style = configuration.titleBarStyle;
            if (style === 'native' || style === 'custom') {
                return style;
            }
        }
        return platform_1.$k ? 'native' : 'custom'; // default to custom on all macOS and Windows
    }
    exports.$UD = $UD;
    function $VD(configurationService) {
        if (!platform_1.$i || platform_1.$o) {
            return false; // only supported on a desktop Windows instance
        }
        if ($UD(configurationService) === 'native') {
            return false; // only supported when title bar is custom
        }
        // Default to true.
        return true;
    }
    exports.$VD = $VD;
    /**
     * According to Electron docs: `scale := 1.2 ^ level`.
     * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
     */
    function $WD(zoomLevel = 0) {
        return Math.pow(1.2, zoomLevel);
    }
    exports.$WD = $WD;
});
//# sourceMappingURL=window.js.map