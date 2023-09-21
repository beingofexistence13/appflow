/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/platform/theme/common/colorRegistry", "vs/editor/common/core/editorColorRegistry"], function (require, exports, color_1, colorRegistry, editorColorRegistry) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7yb = void 0;
    const settingToColorIdMapping = {};
    function addSettingMapping(settingId, colorId) {
        let colorIds = settingToColorIdMapping[settingId];
        if (!colorIds) {
            settingToColorIdMapping[settingId] = colorIds = [];
        }
        colorIds.push(colorId);
    }
    function $7yb(oldSettings, result) {
        for (const rule of oldSettings) {
            result.textMateRules.push(rule);
            if (!rule.scope) {
                const settings = rule.settings;
                if (!settings) {
                    rule.settings = {};
                }
                else {
                    for (const settingKey in settings) {
                        const key = settingKey;
                        const mappings = settingToColorIdMapping[key];
                        if (mappings) {
                            const colorHex = settings[key];
                            if (typeof colorHex === 'string') {
                                const color = color_1.$Os.fromHex(colorHex);
                                for (const colorId of mappings) {
                                    result.colors[colorId] = color;
                                }
                            }
                        }
                        if (key !== 'foreground' && key !== 'background' && key !== 'fontStyle') {
                            delete settings[key];
                        }
                    }
                }
            }
        }
    }
    exports.$7yb = $7yb;
    addSettingMapping('background', colorRegistry.$ww);
    addSettingMapping('foreground', colorRegistry.$xw);
    addSettingMapping('selection', colorRegistry.$Nw);
    addSettingMapping('inactiveSelection', colorRegistry.$Pw);
    addSettingMapping('selectionHighlightColor', colorRegistry.$Qw);
    addSettingMapping('findMatchHighlight', colorRegistry.$Tw);
    addSettingMapping('currentFindMatchHighlight', colorRegistry.$Sw);
    addSettingMapping('hoverHighlight', colorRegistry.$2w);
    addSettingMapping('wordHighlight', 'editor.wordHighlightBackground'); // inlined to avoid editor/contrib dependenies
    addSettingMapping('wordHighlightStrong', 'editor.wordHighlightStrongBackground');
    addSettingMapping('findRangeHighlight', colorRegistry.$Uw);
    addSettingMapping('findMatchHighlight', 'peekViewResult.matchHighlightBackground');
    addSettingMapping('referenceHighlight', 'peekViewEditor.matchHighlightBackground');
    addSettingMapping('lineHighlight', editorColorRegistry.$RA);
    addSettingMapping('rangeHighlight', editorColorRegistry.$TA);
    addSettingMapping('caret', editorColorRegistry.$XA);
    addSettingMapping('invisibles', editorColorRegistry.$ZA);
    addSettingMapping('guide', editorColorRegistry.$4A);
    addSettingMapping('activeGuide', editorColorRegistry.$0A);
    const ansiColorMap = ['ansiBlack', 'ansiRed', 'ansiGreen', 'ansiYellow', 'ansiBlue', 'ansiMagenta', 'ansiCyan', 'ansiWhite',
        'ansiBrightBlack', 'ansiBrightRed', 'ansiBrightGreen', 'ansiBrightYellow', 'ansiBrightBlue', 'ansiBrightMagenta', 'ansiBrightCyan', 'ansiBrightWhite'
    ];
    for (const color of ansiColorMap) {
        addSettingMapping(color, 'terminal.' + color);
    }
});
//# sourceMappingURL=themeCompatibility.js.map