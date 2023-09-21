/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/config/editorConfiguration", "vs/editor/common/config/editorOptions", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/test/common/testAccessibilityService"], function (require, exports, editorConfiguration_1, editorOptions_1, fontInfo_1, testAccessibilityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestConfiguration = void 0;
    class TestConfiguration extends editorConfiguration_1.EditorConfiguration {
        constructor(opts) {
            super(false, opts, null, new testAccessibilityService_1.TestAccessibilityService());
        }
        _readEnvConfiguration() {
            return {
                extraEditorClassName: '',
                outerWidth: 100,
                outerHeight: 100,
                emptySelectionClipboard: true,
                pixelRatio: 1,
                accessibilitySupport: 0 /* AccessibilitySupport.Unknown */
            };
        }
        _readFontInfo(styling) {
            return new fontInfo_1.FontInfo({
                pixelRatio: 1,
                fontFamily: 'mockFont',
                fontWeight: 'normal',
                fontSize: 14,
                fontFeatureSettings: editorOptions_1.EditorFontLigatures.OFF,
                fontVariationSettings: editorOptions_1.EditorFontVariations.OFF,
                lineHeight: 19,
                letterSpacing: 1.5,
                isMonospace: true,
                typicalHalfwidthCharacterWidth: 10,
                typicalFullwidthCharacterWidth: 20,
                canUseHalfwidthRightwardsArrow: true,
                spaceWidth: 10,
                middotWidth: 10,
                wsmiddotWidth: 10,
                maxDigitWidth: 10,
            }, true);
        }
    }
    exports.TestConfiguration = TestConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9icm93c2VyL2NvbmZpZy90ZXN0Q29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxpQkFBa0IsU0FBUSx5Q0FBbUI7UUFFekQsWUFBWSxJQUFvQjtZQUMvQixLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxtREFBd0IsRUFBRSxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVrQixxQkFBcUI7WUFDdkMsT0FBTztnQkFDTixvQkFBb0IsRUFBRSxFQUFFO2dCQUN4QixVQUFVLEVBQUUsR0FBRztnQkFDZixXQUFXLEVBQUUsR0FBRztnQkFDaEIsdUJBQXVCLEVBQUUsSUFBSTtnQkFDN0IsVUFBVSxFQUFFLENBQUM7Z0JBQ2Isb0JBQW9CLHNDQUE4QjthQUNsRCxDQUFDO1FBQ0gsQ0FBQztRQUVrQixhQUFhLENBQUMsT0FBcUI7WUFDckQsT0FBTyxJQUFJLG1CQUFRLENBQUM7Z0JBQ25CLFVBQVUsRUFBRSxDQUFDO2dCQUNiLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixVQUFVLEVBQUUsUUFBUTtnQkFDcEIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osbUJBQW1CLEVBQUUsbUNBQW1CLENBQUMsR0FBRztnQkFDNUMscUJBQXFCLEVBQUUsb0NBQW9CLENBQUMsR0FBRztnQkFDL0MsVUFBVSxFQUFFLEVBQUU7Z0JBQ2QsYUFBYSxFQUFFLEdBQUc7Z0JBQ2xCLFdBQVcsRUFBRSxJQUFJO2dCQUNqQiw4QkFBOEIsRUFBRSxFQUFFO2dCQUNsQyw4QkFBOEIsRUFBRSxFQUFFO2dCQUNsQyw4QkFBOEIsRUFBRSxJQUFJO2dCQUNwQyxVQUFVLEVBQUUsRUFBRTtnQkFDZCxXQUFXLEVBQUUsRUFBRTtnQkFDZixhQUFhLEVBQUUsRUFBRTtnQkFDakIsYUFBYSxFQUFFLEVBQUU7YUFDakIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQXJDRCw4Q0FxQ0MifQ==