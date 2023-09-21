/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme"], function (require, exports, nls, colorRegistry_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerColors = exports.ansiColorMap = exports.TERMINAL_TAB_ACTIVE_BORDER = exports.TERMINAL_DRAG_AND_DROP_BACKGROUND = exports.TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR = exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR = exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR = exports.TERMINAL_FIND_MATCH_BORDER_COLOR = exports.TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR = exports.TERMINAL_FIND_MATCH_BACKGROUND_COLOR = exports.TERMINAL_BORDER_COLOR = exports.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR = exports.TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR = exports.TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR = exports.TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR = exports.TERMINAL_SELECTION_FOREGROUND_COLOR = exports.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR = exports.TERMINAL_SELECTION_BACKGROUND_COLOR = exports.TERMINAL_CURSOR_BACKGROUND_COLOR = exports.TERMINAL_CURSOR_FOREGROUND_COLOR = exports.TERMINAL_FOREGROUND_COLOR = exports.TERMINAL_BACKGROUND_COLOR = exports.ansiColorIdentifiers = void 0;
    /**
     * The color identifiers for the terminal's ansi colors. The index in the array corresponds to the index
     * of the color in the terminal color table.
     */
    exports.ansiColorIdentifiers = [];
    exports.TERMINAL_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.background', null, nls.localize('terminal.background', 'The background color of the terminal, this allows coloring the terminal differently to the panel.'));
    exports.TERMINAL_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.foreground', {
        light: '#333333',
        dark: '#CCCCCC',
        hcDark: '#FFFFFF',
        hcLight: '#292929'
    }, nls.localize('terminal.foreground', 'The foreground color of the terminal.'));
    exports.TERMINAL_CURSOR_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCursor.foreground', null, nls.localize('terminalCursor.foreground', 'The foreground color of the terminal cursor.'));
    exports.TERMINAL_CURSOR_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCursor.background', null, nls.localize('terminalCursor.background', 'The background color of the terminal cursor. Allows customizing the color of a character overlapped by a block cursor.'));
    exports.TERMINAL_SELECTION_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.selectionBackground', {
        light: colorRegistry_1.editorSelectionBackground,
        dark: colorRegistry_1.editorSelectionBackground,
        hcDark: colorRegistry_1.editorSelectionBackground,
        hcLight: colorRegistry_1.editorSelectionBackground
    }, nls.localize('terminal.selectionBackground', 'The selection background color of the terminal.'));
    exports.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.inactiveSelectionBackground', {
        light: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5),
        dark: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5),
        hcDark: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.7),
        hcLight: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5)
    }, nls.localize('terminal.inactiveSelectionBackground', 'The selection background color of the terminal when it does not have focus.'));
    exports.TERMINAL_SELECTION_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.selectionForeground', {
        light: null,
        dark: null,
        hcDark: '#000000',
        hcLight: '#ffffff'
    }, nls.localize('terminal.selectionForeground', 'The selection foreground color of the terminal. When this is null the selection foreground will be retained and have the minimum contrast ratio feature applied.'));
    exports.TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCommandDecoration.defaultBackground', {
        light: '#00000040',
        dark: '#ffffff40',
        hcDark: '#ffffff80',
        hcLight: '#00000040',
    }, nls.localize('terminalCommandDecoration.defaultBackground', 'The default terminal command decoration background color.'));
    exports.TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCommandDecoration.successBackground', {
        dark: '#1B81A8',
        light: '#2090D3',
        hcDark: '#1B81A8',
        hcLight: '#007100'
    }, nls.localize('terminalCommandDecoration.successBackground', 'The terminal command decoration background color for successful commands.'));
    exports.TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCommandDecoration.errorBackground', {
        dark: '#F14C4C',
        light: '#E51400',
        hcDark: '#F14C4C',
        hcLight: '#B5200D'
    }, nls.localize('terminalCommandDecoration.errorBackground', 'The terminal command decoration background color for error commands.'));
    exports.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalOverviewRuler.cursorForeground', {
        dark: '#A0A0A0CC',
        light: '#A0A0A0CC',
        hcDark: '#A0A0A0CC',
        hcLight: '#A0A0A0CC'
    }, nls.localize('terminalOverviewRuler.cursorForeground', 'The overview ruler cursor color.'));
    exports.TERMINAL_BORDER_COLOR = (0, colorRegistry_1.registerColor)('terminal.border', {
        dark: theme_1.PANEL_BORDER,
        light: theme_1.PANEL_BORDER,
        hcDark: theme_1.PANEL_BORDER,
        hcLight: theme_1.PANEL_BORDER
    }, nls.localize('terminal.border', 'The color of the border that separates split panes within the terminal. This defaults to panel.border.'));
    exports.TERMINAL_FIND_MATCH_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchBackground', {
        dark: colorRegistry_1.editorFindMatch,
        light: colorRegistry_1.editorFindMatch,
        // Use regular selection background in high contrast with a thick border
        hcDark: null,
        hcLight: '#0F4A85'
    }, nls.localize('terminal.findMatchBackground', 'Color of the current search match in the terminal. The color must not be opaque so as not to hide underlying terminal content.'));
    exports.TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.hoverHighlightBackground', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5),
        hcDark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5),
        hcLight: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5)
    }, nls.localize('terminal.findMatchHighlightBorder', 'Border color of the other search matches in the terminal.'));
    exports.TERMINAL_FIND_MATCH_BORDER_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchBorder', {
        dark: null,
        light: null,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize('terminal.findMatchBorder', 'Border color of the current search match in the terminal.'));
    exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchHighlightBackground', {
        dark: colorRegistry_1.editorFindMatchHighlight,
        light: colorRegistry_1.editorFindMatchHighlight,
        hcDark: null,
        hcLight: null
    }, nls.localize('terminal.findMatchHighlightBackground', 'Color of the other search matches in the terminal. The color must not be opaque so as not to hide underlying terminal content.'));
    exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchHighlightBorder', {
        dark: null,
        light: null,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize('terminal.findMatchHighlightBorder', 'Border color of the other search matches in the terminal.'));
    exports.TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalOverviewRuler.findMatchForeground', {
        dark: colorRegistry_1.overviewRulerFindMatchForeground,
        light: colorRegistry_1.overviewRulerFindMatchForeground,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize('terminalOverviewRuler.findMatchHighlightForeground', 'Overview ruler marker color for find matches in the terminal.'));
    exports.TERMINAL_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('terminal.dropBackground', {
        dark: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND,
        light: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcDark: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcLight: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND
    }, nls.localize('terminal.dragAndDropBackground', "Background color when dragging on top of terminals. The color should have transparency so that the terminal contents can still shine through."));
    exports.TERMINAL_TAB_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('terminal.tab.activeBorder', {
        dark: theme_1.TAB_ACTIVE_BORDER,
        light: theme_1.TAB_ACTIVE_BORDER,
        hcDark: theme_1.TAB_ACTIVE_BORDER,
        hcLight: theme_1.TAB_ACTIVE_BORDER
    }, nls.localize('terminal.tab.activeBorder', 'Border on the side of the terminal tab in the panel. This defaults to tab.activeBorder.'));
    exports.ansiColorMap = {
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
    function registerColors() {
        for (const id in exports.ansiColorMap) {
            const entry = exports.ansiColorMap[id];
            const colorName = id.substring(13);
            exports.ansiColorIdentifiers[entry.index] = (0, colorRegistry_1.registerColor)(id, entry.defaults, nls.localize('terminal.ansiColor', '\'{0}\' ANSI color in the terminal.', colorName));
        }
    }
    exports.registerColors = registerColors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb2xvclJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsQ29sb3JSZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEc7OztPQUdHO0lBQ1UsUUFBQSxvQkFBb0IsR0FBc0IsRUFBRSxDQUFDO0lBRTdDLFFBQUEseUJBQXlCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLHFCQUFxQixFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLG1HQUFtRyxDQUFDLENBQUMsQ0FBQztJQUNqTixRQUFBLHlCQUF5QixHQUFHLElBQUEsNkJBQWEsRUFBQyxxQkFBcUIsRUFBRTtRQUM3RSxLQUFLLEVBQUUsU0FBUztRQUNoQixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE9BQU8sRUFBRSxTQUFTO0tBQ2xCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7SUFDcEUsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLDZCQUFhLEVBQUMsMkJBQTJCLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsOENBQThDLENBQUMsQ0FBQyxDQUFDO0lBQy9LLFFBQUEsZ0NBQWdDLEdBQUcsSUFBQSw2QkFBYSxFQUFDLDJCQUEyQixFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLHdIQUF3SCxDQUFDLENBQUMsQ0FBQztJQUN6UCxRQUFBLG1DQUFtQyxHQUFHLElBQUEsNkJBQWEsRUFBQyw4QkFBOEIsRUFBRTtRQUNoRyxLQUFLLEVBQUUseUNBQXlCO1FBQ2hDLElBQUksRUFBRSx5Q0FBeUI7UUFD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S0FBSyxFQUFFLENBQUM7WUFDUixRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0QsMEJBQTBCLEVBQUU7WUFDM0IsS0FBSyxFQUFFLENBQUM7WUFDUixRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0Qsd0JBQXdCLEVBQUU7WUFDekIsS0FBSyxFQUFFLENBQUM7WUFDUixRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0QsMEJBQTBCLEVBQUU7WUFDM0IsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0QsMkJBQTJCLEVBQUU7WUFDNUIsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0QseUJBQXlCLEVBQUU7WUFDMUIsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0QsNEJBQTRCLEVBQUU7WUFDN0IsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0QseUJBQXlCLEVBQUU7WUFDMUIsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO1FBQ0QsMEJBQTBCLEVBQUU7WUFDM0IsS0FBSyxFQUFFLEVBQUU7WUFDVCxRQUFRLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixPQUFPLEVBQUUsU0FBUzthQUNsQjtTQUNEO0tBQ0QsQ0FBQztJQUVGLFNBQWdCLGNBQWM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxvQkFBWSxFQUFFO1lBQzlCLE1BQU0sS0FBSyxHQUFHLG9CQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0IsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQyw0QkFBb0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBQSw2QkFBYSxFQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUscUNBQXFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUM1SjtJQUNGLENBQUM7SUFORCx3Q0FNQyJ9