/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode"], function (require, exports, fastDomNode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vU = void 0;
    function $vU(domNode, fontInfo) {
        if (domNode instanceof fastDomNode_1.$FP) {
            domNode.setFontFamily(fontInfo.getMassagedFontFamily());
            domNode.setFontWeight(fontInfo.fontWeight);
            domNode.setFontSize(fontInfo.fontSize);
            domNode.setFontFeatureSettings(fontInfo.fontFeatureSettings);
            domNode.setFontVariationSettings(fontInfo.fontVariationSettings);
            domNode.setLineHeight(fontInfo.lineHeight);
            domNode.setLetterSpacing(fontInfo.letterSpacing);
        }
        else {
            domNode.style.fontFamily = fontInfo.getMassagedFontFamily();
            domNode.style.fontWeight = fontInfo.fontWeight;
            domNode.style.fontSize = fontInfo.fontSize + 'px';
            domNode.style.fontFeatureSettings = fontInfo.fontFeatureSettings;
            domNode.style.fontVariationSettings = fontInfo.fontVariationSettings;
            domNode.style.lineHeight = fontInfo.lineHeight + 'px';
            domNode.style.letterSpacing = fontInfo.letterSpacing + 'px';
        }
    }
    exports.$vU = $vU;
});
//# sourceMappingURL=domFontInfo.js.map