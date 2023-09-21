/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/keyboardLayout/common/keyboardConfig", "vs/base/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, nls, platform_1, configurationRegistry_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m3b = exports.DispatchConfig = void 0;
    var DispatchConfig;
    (function (DispatchConfig) {
        DispatchConfig[DispatchConfig["Code"] = 0] = "Code";
        DispatchConfig[DispatchConfig["KeyCode"] = 1] = "KeyCode";
    })(DispatchConfig || (exports.DispatchConfig = DispatchConfig = {}));
    function $m3b(configurationService) {
        const keyboard = configurationService.getValue('keyboard');
        const dispatch = (keyboard?.dispatch === 'keyCode' ? 1 /* DispatchConfig.KeyCode */ : 0 /* DispatchConfig.Code */);
        const mapAltGrToCtrlAlt = Boolean(keyboard?.mapAltGrToCtrlAlt);
        return { dispatch, mapAltGrToCtrlAlt };
    }
    exports.$m3b = $m3b;
    const configurationRegistry = platform_2.$8m.as(configurationRegistry_1.$an.Configuration);
    const keyboardConfiguration = {
        'id': 'keyboard',
        'order': 15,
        'type': 'object',
        'title': nls.localize(0, null),
        'properties': {
            'keyboard.dispatch': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'string',
                enum: ['code', 'keyCode'],
                default: 'code',
                markdownDescription: nls.localize(1, null),
                included: platform_1.OS === 2 /* OperatingSystem.Macintosh */ || platform_1.OS === 3 /* OperatingSystem.Linux */
            },
            'keyboard.mapAltGrToCtrlAlt': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize(2, null),
                included: platform_1.OS === 1 /* OperatingSystem.Windows */
            }
        }
    };
    configurationRegistry.registerConfiguration(keyboardConfiguration);
});
//# sourceMappingURL=keyboardConfig.js.map