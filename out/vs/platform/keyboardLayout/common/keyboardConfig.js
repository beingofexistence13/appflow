/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, nls, platform_1, configurationRegistry_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readKeyboardConfig = exports.DispatchConfig = void 0;
    var DispatchConfig;
    (function (DispatchConfig) {
        DispatchConfig[DispatchConfig["Code"] = 0] = "Code";
        DispatchConfig[DispatchConfig["KeyCode"] = 1] = "KeyCode";
    })(DispatchConfig || (exports.DispatchConfig = DispatchConfig = {}));
    function readKeyboardConfig(configurationService) {
        const keyboard = configurationService.getValue('keyboard');
        const dispatch = (keyboard?.dispatch === 'keyCode' ? 1 /* DispatchConfig.KeyCode */ : 0 /* DispatchConfig.Code */);
        const mapAltGrToCtrlAlt = Boolean(keyboard?.mapAltGrToCtrlAlt);
        return { dispatch, mapAltGrToCtrlAlt };
    }
    exports.readKeyboardConfig = readKeyboardConfig;
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const keyboardConfiguration = {
        'id': 'keyboard',
        'order': 15,
        'type': 'object',
        'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
        'properties': {
            'keyboard.dispatch': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'string',
                enum: ['code', 'keyCode'],
                default: 'code',
                markdownDescription: nls.localize('dispatch', "Controls the dispatching logic for key presses to use either `code` (recommended) or `keyCode`."),
                included: platform_1.OS === 2 /* OperatingSystem.Macintosh */ || platform_1.OS === 3 /* OperatingSystem.Linux */
            },
            'keyboard.mapAltGrToCtrlAlt': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize('mapAltGrToCtrlAlt', "Controls if the AltGraph+ modifier should be treated as Ctrl+Alt+."),
                included: platform_1.OS === 1 /* OperatingSystem.Windows */
            }
        }
    };
    configurationRegistry.registerConfiguration(keyboardConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRDb25maWcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9rZXlib2FyZExheW91dC9jb21tb24va2V5Ym9hcmRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLElBQWtCLGNBR2pCO0lBSEQsV0FBa0IsY0FBYztRQUMvQixtREFBSSxDQUFBO1FBQ0oseURBQU8sQ0FBQTtJQUNSLENBQUMsRUFIaUIsY0FBYyw4QkFBZCxjQUFjLFFBRy9CO0lBT0QsU0FBZ0Isa0JBQWtCLENBQUMsb0JBQTJDO1FBQzdFLE1BQU0sUUFBUSxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBd0QsVUFBVSxDQUFDLENBQUM7UUFDbEgsTUFBTSxRQUFRLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLGdDQUF3QixDQUFDLDRCQUFvQixDQUFDLENBQUM7UUFDbkcsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFMRCxnREFLQztJQUVELE1BQU0scUJBQXFCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2xHLE1BQU0scUJBQXFCLEdBQXVCO1FBQ2pELElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sRUFBRSxFQUFFO1FBQ1gsTUFBTSxFQUFFLFFBQVE7UUFDaEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsVUFBVSxDQUFDO1FBQy9ELFlBQVksRUFBRTtZQUNiLG1CQUFtQixFQUFFO2dCQUNwQixLQUFLLHdDQUFnQztnQkFDckMsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztnQkFDekIsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsaUdBQWlHLENBQUM7Z0JBQ2hKLFFBQVEsRUFBRSxhQUFFLHNDQUE4QixJQUFJLGFBQUUsa0NBQTBCO2FBQzFFO1lBQ0QsNEJBQTRCLEVBQUU7Z0JBQzdCLEtBQUssd0NBQWdDO2dCQUNyQyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLG9FQUFvRSxDQUFDO2dCQUM1SCxRQUFRLEVBQUUsYUFBRSxvQ0FBNEI7YUFDeEM7U0FDRDtLQUNELENBQUM7SUFFRixxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDIn0=