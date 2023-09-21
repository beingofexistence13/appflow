/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme"], function (require, exports, nls, colorRegistry_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jfb = exports.$Ifb = exports.$Hfb = exports.$Gfb = exports.$Ffb = exports.$Efb = exports.$Dfb = exports.$Cfb = exports.$Bfb = exports.$Afb = exports.$zfb = exports.$yfb = exports.$xfb = exports.$wfb = exports.$vfb = exports.$ufb = exports.$tfb = exports.$sfb = exports.$rfb = exports.$qfb = exports.$pfb = exports.$ofb = exports.$nfb = void 0;
    /**
     * The color identifiers for the terminal's ansi colors. The index in the array corresponds to the index
     * of the color in the terminal color table.
     */
    exports.$nfb = [];
    exports.$ofb = (0, colorRegistry_1.$sv)('terminal.background', null, nls.localize(0, null));
    exports.$pfb = (0, colorRegistry_1.$sv)('terminal.foreground', {
        light: '#333333',
        dark: '#CCCCCC',
        hcDark: '#FFFFFF',
        hcLight: '#292929'
    }, nls.localize(1, null));
    exports.$qfb = (0, colorRegistry_1.$sv)('terminalCursor.foreground', null, nls.localize(2, null));
    exports.$rfb = (0, colorRegistry_1.$sv)('terminalCursor.background', null, nls.localize(3, null));
    exports.$sfb = (0, colorRegistry_1.$sv)('terminal.selectionBackground', {
        light: colorRegistry_1.$Nw,
        dark: colorRegistry_1.$Nw,
        hcDark: colorRegistry_1.$Nw,
        hcLight: colorRegistry_1.$Nw
    }, nls.localize(4, null));
    exports.$tfb = (0, colorRegistry_1.$sv)('terminal.inactiveSelectionBackground', {
        light: (0, colorRegistry_1.$1y)(exports.$sfb, 0.5),
        dark: (0, colorRegistry_1.$1y)(exports.$sfb, 0.5),
        hcDark: (0, colorRegistry_1.$1y)(exports.$sfb, 0.7),
        hcLight: (0, colorRegistry_1.$1y)(exports.$sfb, 0.5)
    }, nls.localize(5, null));
    exports.$ufb = (0, colorRegistry_1.$sv)('terminal.selectionForeground', {
        light: null,
        dark: null,
        hcDark: '#000000',
        hcLight: '#ffffff'
    }, nls.localize(6, null));
    exports.$vfb = (0, colorRegistry_1.$sv)('terminalCommandDecoration.defaultBackground', {
        light: '#00000040',
        dark: '#ffffff40',
        hcDark: '#ffffff80',
        hcLight: '#00000040',
    }, nls.localize(7, null));
    exports.$wfb = (0, colorRegistry_1.$sv)('terminalCommandDecoration.successBackground', {
        dark: '#1B81A8',
        light: '#2090D3',
        hcDark: '#1B81A8',
        hcLight: '#007100'
    }, nls.localize(8, null));
    exports.$xfb = (0, colorRegistry_1.$sv)('terminalCommandDecoration.errorBackground', {
        dark: '#F14C4C',
        light: '#E51400',
        hcDark: '#F14C4C',
        hcLight: '#B5200D'
    }, nls.localize(9, null));
    exports.$yfb = (0, colorRegistry_1.$sv)('terminalOverviewRuler.cursorForeground', {
        dark: '#A0A0A0CC',
        light: '#A0A0A0CC',
        hcDark: '#A0A0A0CC',
        hcLight: '#A0A0A0CC'
    }, nls.localize(10, null));
    exports.$zfb = (0, colorRegistry_1.$sv)('terminal.border', {
        dark: theme_1.$M_,
        light: theme_1.$M_,
        hcDark: theme_1.$M_,
        hcLight: theme_1.$M_
    }, nls.localize(11, null));
    exports.$Afb = (0, colorRegistry_1.$sv)('terminal.findMatchBackground', {
        dark: colorRegistry_1.$Sw,
        light: colorRegistry_1.$Sw,
        // Use regular selection background in high contrast with a thick border
        hcDark: null,
        hcLight: '#0F4A85'
    }, nls.localize(12, null));
    exports.$Bfb = (0, colorRegistry_1.$sv)('terminal.hoverHighlightBackground', {
        dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$2w, 0.5),
        light: (0, colorRegistry_1.$1y)(colorRegistry_1.$2w, 0.5),
        hcDark: (0, colorRegistry_1.$1y)(colorRegistry_1.$2w, 0.5),
        hcLight: (0, colorRegistry_1.$1y)(colorRegistry_1.$2w, 0.5)
    }, nls.localize(13, null));
    exports.$Cfb = (0, colorRegistry_1.$sv)('terminal.findMatchBorder', {
        dark: null,
        light: null,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize(14, null));
    exports.$Dfb = (0, colorRegistry_1.$sv)('terminal.findMatchHighlightBackground', {
        dark: colorRegistry_1.$Tw,
        light: colorRegistry_1.$Tw,
        hcDark: null,
        hcLight: null
    }, nls.localize(15, null));
    exports.$Efb = (0, colorRegistry_1.$sv)('terminal.findMatchHighlightBorder', {
        dark: null,
        light: null,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize(16, null));
    exports.$Ffb = (0, colorRegistry_1.$sv)('terminalOverviewRuler.findMatchForeground', {
        dark: colorRegistry_1.$zy,
        light: colorRegistry_1.$zy,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize(17, null));
    exports.$Gfb = (0, colorRegistry_1.$sv)('terminal.dropBackground', {
        dark: theme_1.$F_,
        light: theme_1.$F_,
        hcDark: theme_1.$F_,
        hcLight: theme_1.$F_
    }, nls.localize(18, null));
    exports.$Hfb = (0, colorRegistry_1.$sv)('terminal.tab.activeBorder', {
        dark: theme_1.$n_,
        light: theme_1.$n_,
        hcDark: theme_1.$n_,
        hcLight: theme_1.$n_
    }, nls.localize(19, null));
    exports.$Ifb = {
        'terminal.ansiBlack': {
            index: 0,
            defaults: {
                light: '#000000',
                dark: '#000000',
                hcDark: '#000000',
                hcLight: '#292929'
            }
        },
        'terminal.ansiRed': {
            index: 1,
            defaults: {
                light: '#cd3131',
                dark: '#cd3131',
                hcDark: '#cd0000',
                hcLight: '#cd3131'
            }
        },
        'terminal.ansiGreen': {
            index: 2,
            defaults: {
                light: '#00BC00',
                dark: '#0DBC79',
                hcDark: '#00cd00',
                hcLight: '#00bc00'
            }
        },
        'terminal.ansiYellow': {
            index: 3,
            defaults: {
                light: '#949800',
                dark: '#e5e510',
                hcDark: '#cdcd00',
                hcLight: '#949800'
            }
        },
        'terminal.ansiBlue': {
            index: 4,
            defaults: {
                light: '#0451a5',
                dark: '#2472c8',
                hcDark: '#0000ee',
                hcLight: '#0451a5'
            }
        },
        'terminal.ansiMagenta': {
            index: 5,
            defaults: {
                light: '#bc05bc',
                dark: '#bc3fbc',
                hcDark: '#cd00cd',
                hcLight: '#bc05bc'
            }
        },
        'terminal.ansiCyan': {
            index: 6,
            defaults: {
                light: '#0598bc',
                dark: '#11a8cd',
                hcDark: '#00cdcd',
                hcLight: '#0598bc'
            }
        },
        'terminal.ansiWhite': {
            index: 7,
            defaults: {
                light: '#555555',
                dark: '#e5e5e5',
                hcDark: '#e5e5e5',
                hcLight: '#555555'
            }
        },
        'terminal.ansiBrightBlack': {
            index: 8,
            defaults: {
                light: '#666666',
                dark: '#666666',
                hcDark: '#7f7f7f',
                hcLight: '#666666'
            }
        },
        'terminal.ansiBrightRed': {
            index: 9,
            defaults: {
                light: '#cd3131',
                dark: '#f14c4c',
                hcDark: '#ff0000',
                hcLight: '#cd3131'
            }
        },
        'terminal.ansiBrightGreen': {
            index: 10,
            defaults: {
                light: '#14CE14',
                dark: '#23d18b',
                hcDark: '#00ff00',
                hcLight: '#00bc00'
            }
        },
        'terminal.ansiBrightYellow': {
            index: 11,
            defaults: {
                light: '#b5ba00',
                dark: '#f5f543',
                hcDark: '#ffff00',
                hcLight: '#b5ba00'
            }
        },
        'terminal.ansiBrightBlue': {
            index: 12,
            defaults: {
                light: '#0451a5',
                dark: '#3b8eea',
                hcDark: '#5c5cff',
                hcLight: '#0451a5'
            }
        },
        'terminal.ansiBrightMagenta': {
            index: 13,
            defaults: {
                light: '#bc05bc',
                dark: '#d670d6',
                hcDark: '#ff00ff',
                hcLight: '#bc05bc'
            }
        },
        'terminal.ansiBrightCyan': {
            index: 14,
            defaults: {
                light: '#0598bc',
                dark: '#29b8db',
                hcDark: '#00ffff',
                hcLight: '#0598bc'
            }
        },
        'terminal.ansiBrightWhite': {
            index: 15,
            defaults: {
                light: '#a5a5a5',
                dark: '#e5e5e5',
                hcDark: '#ffffff',
                hcLight: '#a5a5a5'
            }
        }
    };
    function $Jfb() {
        for (const id in exports.$Ifb) {
            const entry = exports.$Ifb[id];
            const colorName = id.substring(13);
            exports.$nfb[entry.index] = (0, colorRegistry_1.$sv)(id, entry.defaults, nls.localize(20, null, colorName));
        }
    }
    exports.$Jfb = $Jfb;
});
//# sourceMappingURL=terminalColorRegistry.js.map