/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/config/editorConfiguration", "vs/editor/common/config/editorOptions", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/test/common/testAccessibilityService"], function (require, exports, editorConfiguration_1, editorOptions_1, fontInfo_1, testAccessibilityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$z0b = void 0;
    class $z0b extends editorConfiguration_1.$DU {
        constructor(opts) {
            super(false, opts, null, new testAccessibilityService_1.$y0b());
        }
        F() {
            return {
                extraEditorClassName: '',
                outerWidth: 100,
                outerHeight: 100,
                emptySelectionClipboard: true,
                pixelRatio: 1,
                accessibilitySupport: 0 /* AccessibilitySupport.Unknown */
            };
        }
        G(styling) {
            return new fontInfo_1.$Tr({
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
    exports.$z0b = $z0b;
});
//# sourceMappingURL=testConfiguration.js.map