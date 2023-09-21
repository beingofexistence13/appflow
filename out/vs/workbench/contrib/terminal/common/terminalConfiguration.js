/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configurationRegistry", "vs/nls", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/platform", "vs/platform/registry/common/platform", "vs/base/common/codicons", "vs/platform/terminal/common/terminalPlatformConfiguration"], function (require, exports, configurationRegistry_1, nls_1, terminal_1, platform_1, platform_2, codicons_1, terminalPlatformConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerTerminalConfiguration = void 0;
    const terminalDescriptors = '\n- ' + [
        '`\${cwd}`: ' + (0, nls_1.localize)("cwd", "the terminal's current working directory"),
        '`\${cwdFolder}`: ' + (0, nls_1.localize)('cwdFolder', "the terminal's current working directory, displayed for multi-root workspaces or in a single root workspace when the value differs from the initial working directory. On Windows, this will only be displayed when shell integration is enabled."),
        '`\${workspaceFolder}`: ' + (0, nls_1.localize)('workspaceFolder', "the workspace in which the terminal was launched"),
        '`\${local}`: ' + (0, nls_1.localize)('local', "indicates a local terminal in a remote workspace"),
        '`\${process}`: ' + (0, nls_1.localize)('process', "the name of the terminal process"),
        '`\${separator}`: ' + (0, nls_1.localize)('separator', "a conditional separator {0} that only shows when surrounded by variables with values or static text.", '(` - `)'),
        '`\${sequence}`: ' + (0, nls_1.localize)('sequence', "the name provided to the terminal by the process"),
        '`\${task}`: ' + (0, nls_1.localize)('task', "indicates this terminal is associated with a task"),
    ].join('\n- '); // intentionally concatenated to not produce a string that is too long for translations
    let terminalTitle = (0, nls_1.localize)('terminalTitle', "Controls the terminal title. Variables are substituted based on the context:");
    terminalTitle += terminalDescriptors;
    let terminalDescription = (0, nls_1.localize)('terminalDescription', "Controls the terminal description, which appears to the right of the title. Variables are substituted based on the context:");
    terminalDescription += terminalDescriptors;
    const terminalConfiguration = {
        id: 'terminal',
        order: 100,
        title: (0, nls_1.localize)('terminalIntegratedConfigurationTitle', "Integrated Terminal"),
        type: 'object',
        properties: {
            ["terminal.integrated.sendKeybindingsToShell" /* TerminalSettingId.SendKeybindingsToShell */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.sendKeybindingsToShell', "Dispatches most keybindings to the terminal instead of the workbench, overriding {0}, which can be used alternatively for fine tuning.", '`#terminal.integrated.commandsToSkipShell#`'),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.tabs.defaultColor" /* TerminalSettingId.TabsDefaultColor */]: {
                description: (0, nls_1.localize)('terminal.integrated.tabs.defaultColor', "A theme color ID to associate with terminal icons by default."),
                ...terminalPlatformConfiguration_1.terminalColorSchema,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            ["terminal.integrated.tabs.defaultIcon" /* TerminalSettingId.TabsDefaultIcon */]: {
                description: (0, nls_1.localize)('terminal.integrated.tabs.defaultIcon', "A codicon ID to associate with terminal icons by default."),
                ...terminalPlatformConfiguration_1.terminalIconSchema,
                default: codicons_1.Codicon.terminal.id,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            ["terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */]: {
                description: (0, nls_1.localize)('terminal.integrated.tabs.enabled', 'Controls whether terminal tabs display as a list to the side of the terminal. When this is disabled a dropdown will display instead.'),
                type: 'boolean',
                default: true,
            },
            ["terminal.integrated.tabs.enableAnimation" /* TerminalSettingId.TabsEnableAnimation */]: {
                description: (0, nls_1.localize)('terminal.integrated.tabs.enableAnimation', 'Controls whether terminal tab statuses support animation (eg. in progress tasks).'),
                type: 'boolean',
                default: true,
            },
            ["terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */]: {
                description: (0, nls_1.localize)('terminal.integrated.tabs.hideCondition', 'Controls whether the terminal tabs view will hide under certain conditions.'),
                type: 'string',
                enum: ['never', 'singleTerminal', 'singleGroup'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.tabs.hideCondition.never', "Never hide the terminal tabs view"),
                    (0, nls_1.localize)('terminal.integrated.tabs.hideCondition.singleTerminal', "Hide the terminal tabs view when there is only a single terminal opened"),
                    (0, nls_1.localize)('terminal.integrated.tabs.hideCondition.singleGroup', "Hide the terminal tabs view when there is only a single terminal group opened"),
                ],
                default: 'singleTerminal',
            },
            ["terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */]: {
                description: (0, nls_1.localize)('terminal.integrated.tabs.showActiveTerminal', 'Shows the active terminal information in the view. This is particularly useful when the title within the tabs aren\'t visible.'),
                type: 'string',
                enum: ['always', 'singleTerminal', 'singleTerminalOrNarrow', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.tabs.showActiveTerminal.always', "Always show the active terminal"),
                    (0, nls_1.localize)('terminal.integrated.tabs.showActiveTerminal.singleTerminal', "Show the active terminal when it is the only terminal opened"),
                    (0, nls_1.localize)('terminal.integrated.tabs.showActiveTerminal.singleTerminalOrNarrow', "Show the active terminal when it is the only terminal opened or when the tabs view is in its narrow textless state"),
                    (0, nls_1.localize)('terminal.integrated.tabs.showActiveTerminal.never', "Never show the active terminal"),
                ],
                default: 'singleTerminalOrNarrow',
            },
            ["terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */]: {
                description: (0, nls_1.localize)('terminal.integrated.tabs.showActions', 'Controls whether terminal split and kill buttons are displays next to the new terminal button.'),
                type: 'string',
                enum: ['always', 'singleTerminal', 'singleTerminalOrNarrow', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.tabs.showActions.always', "Always show the actions"),
                    (0, nls_1.localize)('terminal.integrated.tabs.showActions.singleTerminal', "Show the actions when it is the only terminal opened"),
                    (0, nls_1.localize)('terminal.integrated.tabs.showActions.singleTerminalOrNarrow', "Show the actions when it is the only terminal opened or when the tabs view is in its narrow textless state"),
                    (0, nls_1.localize)('terminal.integrated.tabs.showActions.never', "Never show the actions"),
                ],
                default: 'singleTerminalOrNarrow',
            },
            ["terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */]: {
                type: 'string',
                enum: ['left', 'right'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.tabs.location.left', "Show the terminal tabs view to the left of the terminal"),
                    (0, nls_1.localize)('terminal.integrated.tabs.location.right', "Show the terminal tabs view to the right of the terminal")
                ],
                default: 'right',
                description: (0, nls_1.localize)('terminal.integrated.tabs.location', "Controls the location of the terminal tabs, either to the left or right of the actual terminal(s).")
            },
            ["terminal.integrated.defaultLocation" /* TerminalSettingId.DefaultLocation */]: {
                type: 'string',
                enum: ["editor" /* TerminalLocationString.Editor */, "view" /* TerminalLocationString.TerminalView */],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.defaultLocation.editor', "Create terminals in the editor"),
                    (0, nls_1.localize)('terminal.integrated.defaultLocation.view', "Create terminals in the terminal view")
                ],
                default: 'view',
                description: (0, nls_1.localize)('terminal.integrated.defaultLocation', "Controls where newly created terminals will appear.")
            },
            ["terminal.integrated.tabs.focusMode" /* TerminalSettingId.TabsFocusMode */]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.tabs.focusMode.singleClick', "Focus the terminal when clicking a terminal tab"),
                    (0, nls_1.localize)('terminal.integrated.tabs.focusMode.doubleClick', "Focus the terminal when double-clicking a terminal tab")
                ],
                default: 'doubleClick',
                description: (0, nls_1.localize)('terminal.integrated.tabs.focusMode', "Controls whether focusing the terminal of a tab happens on double or single click.")
            },
            ["terminal.integrated.macOptionIsMeta" /* TerminalSettingId.MacOptionIsMeta */]: {
                description: (0, nls_1.localize)('terminal.integrated.macOptionIsMeta', "Controls whether to treat the option key as the meta key in the terminal on macOS."),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.macOptionClickForcesSelection" /* TerminalSettingId.MacOptionClickForcesSelection */]: {
                description: (0, nls_1.localize)('terminal.integrated.macOptionClickForcesSelection', "Controls whether to force selection when using Option+click on macOS. This will force a regular (line) selection and disallow the use of column selection mode. This enables copying and pasting using the regular terminal selection, for example, when mouse mode is enabled in tmux."),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.altClickMovesCursor" /* TerminalSettingId.AltClickMovesCursor */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.altClickMovesCursor', "If enabled, alt/option + click will reposition the prompt cursor to underneath the mouse when {0} is set to {1} (the default value). This may not work reliably depending on your shell.", '`#editor.multiCursorModifier#`', '`\'alt\'`'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.copyOnSelection" /* TerminalSettingId.CopyOnSelection */]: {
                description: (0, nls_1.localize)('terminal.integrated.copyOnSelection', "Controls whether text selected in the terminal will be copied to the clipboard."),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.enableMultiLinePasteWarning" /* TerminalSettingId.EnableMultiLinePasteWarning */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.enableMultiLinePasteWarning', "Show a warning dialog when pasting multiple lines into the terminal. The dialog does not show when:\n\n- Bracketed paste mode is enabled (the shell supports multi-line paste natively)\n- The paste is handled by the shell's readline (in the case of pwsh)"),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.drawBoldTextInBrightColors" /* TerminalSettingId.DrawBoldTextInBrightColors */]: {
                description: (0, nls_1.localize)('terminal.integrated.drawBoldTextInBrightColors', "Controls whether bold text in the terminal will always use the \"bright\" ANSI color variant."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.fontFamily', "Controls the font family of the terminal. Defaults to {0}'s value.", '`#editor.fontFamily#`'),
                type: 'string'
            },
            // TODO: Support font ligatures
            // 'terminal.integrated.fontLigatures': {
            // 	'description': localize('terminal.integrated.fontLigatures', "Controls whether font ligatures are enabled in the terminal."),
            // 	'type': 'boolean',
            // 	'default': false
            // },
            ["terminal.integrated.fontSize" /* TerminalSettingId.FontSize */]: {
                description: (0, nls_1.localize)('terminal.integrated.fontSize', "Controls the font size in pixels of the terminal."),
                type: 'number',
                default: platform_1.isMacintosh ? 12 : 14,
                minimum: 6,
                maximum: 100
            },
            ["terminal.integrated.letterSpacing" /* TerminalSettingId.LetterSpacing */]: {
                description: (0, nls_1.localize)('terminal.integrated.letterSpacing', "Controls the letter spacing of the terminal. This is an integer value which represents the number of additional pixels to add between characters."),
                type: 'number',
                default: terminal_1.DEFAULT_LETTER_SPACING
            },
            ["terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */]: {
                description: (0, nls_1.localize)('terminal.integrated.lineHeight', "Controls the line height of the terminal. This number is multiplied by the terminal font size to get the actual line-height in pixels."),
                type: 'number',
                default: terminal_1.DEFAULT_LINE_HEIGHT
            },
            ["terminal.integrated.minimumContrastRatio" /* TerminalSettingId.MinimumContrastRatio */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.minimumContrastRatio', "When set, the foreground color of each cell will change to try meet the contrast ratio specified. Note that this will not apply to `powerline` characters per #146406. Example values:\n\n- 1: Do nothing and use the standard theme colors.\n- 4.5: [WCAG AA compliance (minimum)](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html) (default).\n- 7: [WCAG AAA compliance (enhanced)](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast7.html).\n- 21: White on black or black on white."),
                type: 'number',
                default: 4.5,
                tags: ['accessibility']
            },
            ["terminal.integrated.tabStopWidth" /* TerminalSettingId.TabStopWidth */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.tabStopWidth', "The number of cells in a tab stop."),
                type: 'number',
                minimum: 1,
                default: 8
            },
            ["terminal.integrated.fastScrollSensitivity" /* TerminalSettingId.FastScrollSensitivity */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.fastScrollSensitivity', "Scrolling speed multiplier when pressing `Alt`."),
                type: 'number',
                default: 5
            },
            ["terminal.integrated.mouseWheelScrollSensitivity" /* TerminalSettingId.MouseWheelScrollSensitivity */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.mouseWheelScrollSensitivity', "A multiplier to be used on the `deltaY` of mouse wheel scroll events."),
                type: 'number',
                default: 1
            },
            ["terminal.integrated.bellDuration" /* TerminalSettingId.BellDuration */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.bellDuration', "The number of milliseconds to show the bell within a terminal tab when triggered."),
                type: 'number',
                default: 1000
            },
            ["terminal.integrated.fontWeight" /* TerminalSettingId.FontWeight */]: {
                'anyOf': [
                    {
                        type: 'number',
                        minimum: terminal_1.MINIMUM_FONT_WEIGHT,
                        maximum: terminal_1.MAXIMUM_FONT_WEIGHT,
                        errorMessage: (0, nls_1.localize)('terminal.integrated.fontWeightError', "Only \"normal\" and \"bold\" keywords or numbers between 1 and 1000 are allowed.")
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: terminal_1.SUGGESTIONS_FONT_WEIGHT,
                    }
                ],
                description: (0, nls_1.localize)('terminal.integrated.fontWeight', "The font weight to use within the terminal for non-bold text. Accepts \"normal\" and \"bold\" keywords or numbers between 1 and 1000."),
                default: 'normal'
            },
            ["terminal.integrated.fontWeightBold" /* TerminalSettingId.FontWeightBold */]: {
                'anyOf': [
                    {
                        type: 'number',
                        minimum: terminal_1.MINIMUM_FONT_WEIGHT,
                        maximum: terminal_1.MAXIMUM_FONT_WEIGHT,
                        errorMessage: (0, nls_1.localize)('terminal.integrated.fontWeightError', "Only \"normal\" and \"bold\" keywords or numbers between 1 and 1000 are allowed.")
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: terminal_1.SUGGESTIONS_FONT_WEIGHT,
                    }
                ],
                description: (0, nls_1.localize)('terminal.integrated.fontWeightBold', "The font weight to use within the terminal for bold text. Accepts \"normal\" and \"bold\" keywords or numbers between 1 and 1000."),
                default: 'bold'
            },
            ["terminal.integrated.cursorBlinking" /* TerminalSettingId.CursorBlinking */]: {
                description: (0, nls_1.localize)('terminal.integrated.cursorBlinking', "Controls whether the terminal cursor blinks."),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.cursorStyle" /* TerminalSettingId.CursorStyle */]: {
                description: (0, nls_1.localize)('terminal.integrated.cursorStyle', "Controls the style of terminal cursor when the terminal is focused."),
                enum: ['block', 'line', 'underline'],
                default: 'block'
            },
            ["terminal.integrated.cursorStyleInactive" /* TerminalSettingId.CursorStyleInactive */]: {
                description: (0, nls_1.localize)('terminal.integrated.cursorStyleInactive', "Controls the style of terminal cursor when the terminal is not focused."),
                enum: ['outline', 'block', 'line', 'underline', 'none'],
                default: 'outline'
            },
            ["terminal.integrated.cursorWidth" /* TerminalSettingId.CursorWidth */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.cursorWidth', "Controls the width of the cursor when {0} is set to {1}.", '`#terminal.integrated.cursorStyle#`', '`line`'),
                type: 'number',
                default: 1
            },
            ["terminal.integrated.scrollback" /* TerminalSettingId.Scrollback */]: {
                description: (0, nls_1.localize)('terminal.integrated.scrollback', "Controls the maximum number of lines the terminal keeps in its buffer. We pre-allocate memory based on this value in order to ensure a smooth experience. As such, as the value increases, so will the amount of memory."),
                type: 'number',
                default: 1000
            },
            ["terminal.integrated.detectLocale" /* TerminalSettingId.DetectLocale */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.detectLocale', "Controls whether to detect and set the `$LANG` environment variable to a UTF-8 compliant option since VS Code's terminal only supports UTF-8 encoded data coming from the shell."),
                type: 'string',
                enum: ['auto', 'off', 'on'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.detectLocale.auto', "Set the `$LANG` environment variable if the existing variable does not exist or it does not end in `'.UTF-8'`."),
                    (0, nls_1.localize)('terminal.integrated.detectLocale.off', "Do not set the `$LANG` environment variable."),
                    (0, nls_1.localize)('terminal.integrated.detectLocale.on', "Always set the `$LANG` environment variable.")
                ],
                default: 'auto'
            },
            ["terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */]: {
                type: 'string',
                enum: ['auto', 'on', 'off', 'canvas'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.gpuAcceleration.auto', "Let VS Code detect which renderer will give the best experience."),
                    (0, nls_1.localize)('terminal.integrated.gpuAcceleration.on', "Enable GPU acceleration within the terminal."),
                    (0, nls_1.localize)('terminal.integrated.gpuAcceleration.off', "Disable GPU acceleration within the terminal. The terminal will render much slower when GPU acceleration is off but it should reliably work on all systems."),
                    (0, nls_1.localize)('terminal.integrated.gpuAcceleration.canvas', "Use the terminal's fallback canvas renderer which uses a 2d context instead of webgl which may perform better on some systems. Note that some features are limited in the canvas renderer like opaque selection.")
                ],
                default: 'auto',
                description: (0, nls_1.localize)('terminal.integrated.gpuAcceleration', "Controls whether the terminal will leverage the GPU to do its rendering.")
            },
            ["terminal.integrated.tabs.separator" /* TerminalSettingId.TerminalTitleSeparator */]: {
                'type': 'string',
                'default': ' - ',
                'markdownDescription': (0, nls_1.localize)("terminal.integrated.tabs.separator", "Separator used by {0} and {1}.", `\`#${"terminal.integrated.tabs.title" /* TerminalSettingId.TerminalTitle */}#\``, `\`#${"terminal.integrated.tabs.description" /* TerminalSettingId.TerminalDescription */}#\``)
            },
            ["terminal.integrated.tabs.title" /* TerminalSettingId.TerminalTitle */]: {
                'type': 'string',
                'default': '${process}',
                'markdownDescription': terminalTitle
            },
            ["terminal.integrated.tabs.description" /* TerminalSettingId.TerminalDescription */]: {
                'type': 'string',
                'default': '${task}${separator}${local}${separator}${cwdFolder}',
                'markdownDescription': terminalDescription
            },
            ["terminal.integrated.rightClickBehavior" /* TerminalSettingId.RightClickBehavior */]: {
                type: 'string',
                enum: ['default', 'copyPaste', 'paste', 'selectWord', 'nothing'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.rightClickBehavior.default', "Show the context menu."),
                    (0, nls_1.localize)('terminal.integrated.rightClickBehavior.copyPaste', "Copy when there is a selection, otherwise paste."),
                    (0, nls_1.localize)('terminal.integrated.rightClickBehavior.paste', "Paste on right click."),
                    (0, nls_1.localize)('terminal.integrated.rightClickBehavior.selectWord', "Select the word under the cursor and show the context menu."),
                    (0, nls_1.localize)('terminal.integrated.rightClickBehavior.nothing', "Do nothing and pass event to terminal.")
                ],
                default: platform_1.isMacintosh ? 'selectWord' : platform_1.isWindows ? 'copyPaste' : 'default',
                description: (0, nls_1.localize)('terminal.integrated.rightClickBehavior', "Controls how terminal reacts to right click.")
            },
            ["terminal.integrated.cwd" /* TerminalSettingId.Cwd */]: {
                restricted: true,
                description: (0, nls_1.localize)('terminal.integrated.cwd', "An explicit start path where the terminal will be launched, this is used as the current working directory (cwd) for the shell process. This may be particularly useful in workspace settings if the root directory is not a convenient cwd."),
                type: 'string',
                default: undefined,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            ["terminal.integrated.confirmOnExit" /* TerminalSettingId.ConfirmOnExit */]: {
                description: (0, nls_1.localize)('terminal.integrated.confirmOnExit', "Controls whether to confirm when the window closes if there are active terminal sessions."),
                type: 'string',
                enum: ['never', 'always', 'hasChildProcesses'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.confirmOnExit.never', "Never confirm."),
                    (0, nls_1.localize)('terminal.integrated.confirmOnExit.always', "Always confirm if there are terminals."),
                    (0, nls_1.localize)('terminal.integrated.confirmOnExit.hasChildProcesses', "Confirm if there are any terminals that have child processes."),
                ],
                default: 'never'
            },
            ["terminal.integrated.confirmOnKill" /* TerminalSettingId.ConfirmOnKill */]: {
                description: (0, nls_1.localize)('terminal.integrated.confirmOnKill', "Controls whether to confirm killing terminals when they have child processes. When set to editor, terminals in the editor area will be marked as changed when they have child processes. Note that child process detection may not work well for shells like Git Bash which don't run their processes as child processes of the shell."),
                type: 'string',
                enum: ['never', 'editor', 'panel', 'always'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.confirmOnKill.never', "Never confirm."),
                    (0, nls_1.localize)('terminal.integrated.confirmOnKill.editor', "Confirm if the terminal is in the editor."),
                    (0, nls_1.localize)('terminal.integrated.confirmOnKill.panel', "Confirm if the terminal is in the panel."),
                    (0, nls_1.localize)('terminal.integrated.confirmOnKill.always', "Confirm if the terminal is either in the editor or panel."),
                ],
                default: 'editor'
            },
            ["terminal.integrated.enableBell" /* TerminalSettingId.EnableBell */]: {
                description: (0, nls_1.localize)('terminal.integrated.enableBell', "Controls whether the terminal bell is enabled. This shows up as a visual bell next to the terminal's name."),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.commandsToSkipShell" /* TerminalSettingId.CommandsToSkipShell */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.commandsToSkipShell', "A set of command IDs whose keybindings will not be sent to the shell but instead always be handled by VS Code. This allows keybindings that would normally be consumed by the shell to act instead the same as when the terminal is not focused, for example `Ctrl+P` to launch Quick Open.\n\n&nbsp;\n\nMany commands are skipped by default. To override a default and pass that command's keybinding to the shell instead, add the command prefixed with the `-` character. For example add `-workbench.action.quickOpen` to allow `Ctrl+P` to reach the shell.\n\n&nbsp;\n\nThe following list of default skipped commands is truncated when viewed in Settings Editor. To see the full list, {1} and search for the first command from the list below.\n\n&nbsp;\n\nDefault Skipped Commands:\n\n{0}", terminal_1.DEFAULT_COMMANDS_TO_SKIP_SHELL.sort().map(command => `- ${command}`).join('\n'), `[${(0, nls_1.localize)('openDefaultSettingsJson', "open the default settings JSON")}](command:workbench.action.openRawDefaultSettings '${(0, nls_1.localize)('openDefaultSettingsJson.capitalized', "Open Default Settings (JSON)")}')`),
                type: 'array',
                items: {
                    type: 'string'
                },
                default: []
            },
            ["terminal.integrated.allowChords" /* TerminalSettingId.AllowChords */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.allowChords', "Whether or not to allow chord keybindings in the terminal. Note that when this is true and the keystroke results in a chord it will bypass {0}, setting this to false is particularly useful when you want ctrl+k to go to your shell (not VS Code).", '`#terminal.integrated.commandsToSkipShell#`'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.allowMnemonics" /* TerminalSettingId.AllowMnemonics */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.allowMnemonics', "Whether to allow menubar mnemonics (for example Alt+F) to trigger the open of the menubar. Note that this will cause all alt keystrokes to skip the shell when true. This does nothing on macOS."),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.env.osx" /* TerminalSettingId.EnvMacOs */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.env.osx', "Object with environment variables that will be added to the VS Code process to be used by the terminal on macOS. Set to `null` to delete the environment variable."),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            ["terminal.integrated.env.linux" /* TerminalSettingId.EnvLinux */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.env.linux', "Object with environment variables that will be added to the VS Code process to be used by the terminal on Linux. Set to `null` to delete the environment variable."),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            ["terminal.integrated.env.windows" /* TerminalSettingId.EnvWindows */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.env.windows', "Object with environment variables that will be added to the VS Code process to be used by the terminal on Windows. Set to `null` to delete the environment variable."),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            ["terminal.integrated.environmentChangesIndicator" /* TerminalSettingId.EnvironmentChangesIndicator */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.environmentChangesIndicator', "Whether to display the environment changes indicator on each terminal which explains whether extensions have made, or want to make changes to the terminal's environment."),
                type: 'string',
                enum: ['off', 'on', 'warnonly'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.environmentChangesIndicator.off', "Disable the indicator."),
                    (0, nls_1.localize)('terminal.integrated.environmentChangesIndicator.on', "Enable the indicator."),
                    (0, nls_1.localize)('terminal.integrated.environmentChangesIndicator.warnonly', "Only show the warning indicator when a terminal's environment is 'stale', not the information indicator that shows a terminal has had its environment modified by an extension."),
                ],
                default: 'warnonly'
            },
            ["terminal.integrated.environmentChangesRelaunch" /* TerminalSettingId.EnvironmentChangesRelaunch */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.environmentChangesRelaunch', "Whether to relaunch terminals automatically if extensions want to contribute to their environment and have not been interacted with yet."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.showExitAlert" /* TerminalSettingId.ShowExitAlert */]: {
                description: (0, nls_1.localize)('terminal.integrated.showExitAlert', "Controls whether to show the alert \"The terminal process terminated with exit code\" when exit code is non-zero."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.splitCwd" /* TerminalSettingId.SplitCwd */]: {
                description: (0, nls_1.localize)('terminal.integrated.splitCwd', "Controls the working directory a split terminal starts with."),
                type: 'string',
                enum: ['workspaceRoot', 'initial', 'inherited'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.splitCwd.workspaceRoot', "A new split terminal will use the workspace root as the working directory. In a multi-root workspace a choice for which root folder to use is offered."),
                    (0, nls_1.localize)('terminal.integrated.splitCwd.initial', "A new split terminal will use the working directory that the parent terminal started with."),
                    (0, nls_1.localize)('terminal.integrated.splitCwd.inherited', "On macOS and Linux, a new split terminal will use the working directory of the parent terminal. On Windows, this behaves the same as initial."),
                ],
                default: 'inherited'
            },
            ["terminal.integrated.windowsEnableConpty" /* TerminalSettingId.WindowsEnableConpty */]: {
                description: (0, nls_1.localize)('terminal.integrated.windowsEnableConpty', "Whether to use ConPTY for Windows terminal process communication (requires Windows 10 build number 18309+). Winpty will be used if this is false."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.wordSeparators" /* TerminalSettingId.WordSeparators */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.wordSeparators', "A string containing all characters to be considered word separators when double-clicking to select word and in the fallback 'word' link detection. Since this is used for link detection, including characters such as `:` that are used when detecting links will cause the line and column part of links like `file:10:5` to be ignored."),
                type: 'string',
                // allow-any-unicode-next-line
                default: ' ()[]{}\',"`─‘’|'
            },
            ["terminal.integrated.enableFileLinks" /* TerminalSettingId.EnableFileLinks */]: {
                description: (0, nls_1.localize)('terminal.integrated.enableFileLinks', "Whether to enable file links in terminals. Links can be slow when working on a network drive in particular because each file link is verified against the file system. Changing this will take effect only in new terminals."),
                type: 'string',
                enum: ['off', 'on', 'notRemote'],
                enumDescriptions: [
                    (0, nls_1.localize)('enableFileLinks.off', "Always off."),
                    (0, nls_1.localize)('enableFileLinks.on', "Always on."),
                    (0, nls_1.localize)('enableFileLinks.notRemote', "Enable only when not in a remote workspace.")
                ],
                default: 'on'
            },
            ["terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */]: {
                type: 'string',
                enum: ['6', '11'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.unicodeVersion.six', "Version 6 of Unicode. This is an older version which should work better on older systems."),
                    (0, nls_1.localize)('terminal.integrated.unicodeVersion.eleven', "Version 11 of Unicode. This version provides better support on modern systems that use modern versions of Unicode.")
                ],
                default: '11',
                description: (0, nls_1.localize)('terminal.integrated.unicodeVersion', "Controls what version of Unicode to use when evaluating the width of characters in the terminal. If you experience emoji or other wide characters not taking up the right amount of space or backspace either deleting too much or too little then you may want to try tweaking this setting.")
            },
            ["terminal.integrated.localEchoLatencyThreshold" /* TerminalSettingId.LocalEchoLatencyThreshold */]: {
                description: (0, nls_1.localize)('terminal.integrated.localEchoLatencyThreshold', "Length of network delay, in milliseconds, where local edits will be echoed on the terminal without waiting for server acknowledgement. If '0', local echo will always be on, and if '-1' it will be disabled."),
                type: 'integer',
                minimum: -1,
                default: 30,
            },
            ["terminal.integrated.localEchoEnabled" /* TerminalSettingId.LocalEchoEnabled */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.localEchoEnabled', "When local echo should be enabled. This will override {0}", '`#terminal.integrated.localEchoLatencyThreshold#`'),
                type: 'string',
                enum: ['on', 'off', 'auto'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.localEchoEnabled.on', "Always enabled"),
                    (0, nls_1.localize)('terminal.integrated.localEchoEnabled.off', "Always disabled"),
                    (0, nls_1.localize)('terminal.integrated.localEchoEnabled.auto', "Enabled only for remote workspaces")
                ],
                default: 'auto'
            },
            ["terminal.integrated.localEchoExcludePrograms" /* TerminalSettingId.LocalEchoExcludePrograms */]: {
                description: (0, nls_1.localize)('terminal.integrated.localEchoExcludePrograms', "Local echo will be disabled when any of these program names are found in the terminal title."),
                type: 'array',
                items: {
                    type: 'string',
                    uniqueItems: true
                },
                default: terminal_1.DEFAULT_LOCAL_ECHO_EXCLUDE,
            },
            ["terminal.integrated.localEchoStyle" /* TerminalSettingId.LocalEchoStyle */]: {
                description: (0, nls_1.localize)('terminal.integrated.localEchoStyle', "Terminal style of locally echoed text; either a font style or an RGB color."),
                default: 'dim',
                anyOf: [
                    {
                        enum: ['bold', 'dim', 'italic', 'underlined', 'inverted', '#ff0000'],
                    },
                    {
                        type: 'string',
                        format: 'color-hex',
                    }
                ]
            },
            ["terminal.integrated.enablePersistentSessions" /* TerminalSettingId.EnablePersistentSessions */]: {
                description: (0, nls_1.localize)('terminal.integrated.enablePersistentSessions', "Persist terminal sessions/history for the workspace across window reloads."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.persistentSessionReviveProcess" /* TerminalSettingId.PersistentSessionReviveProcess */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.persistentSessionReviveProcess', "When the terminal process must be shut down (for example on window or application close), this determines when the previous terminal session contents/history should be restored and processes be recreated when the workspace is next opened.\n\nCaveats:\n\n- Restoring of the process current working directory depends on whether it is supported by the shell.\n- Time to persist the session during shutdown is limited, so it may be aborted when using high-latency remote connections."),
                type: 'string',
                enum: ['onExit', 'onExitAndWindowClose', 'never'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.persistentSessionReviveProcess.onExit', "Revive the processes after the last window is closed on Windows/Linux or when the `workbench.action.quit` command is triggered (command palette, keybinding, menu)."),
                    (0, nls_1.localize)('terminal.integrated.persistentSessionReviveProcess.onExitAndWindowClose', "Revive the processes after the last window is closed on Windows/Linux or when the `workbench.action.quit` command is triggered (command palette, keybinding, menu), or when the window is closed."),
                    (0, nls_1.localize)('terminal.integrated.persistentSessionReviveProcess.never', "Never restore the terminal buffers or recreate the process.")
                ],
                default: 'onExit'
            },
            ["terminal.integrated.hideOnStartup" /* TerminalSettingId.HideOnStartup */]: {
                description: (0, nls_1.localize)('terminal.integrated.hideOnStartup', "Whether to hide the terminal view on startup, avoiding creating a terminal when there are no persistent sessions."),
                type: 'string',
                enum: ['never', 'whenEmpty', 'always'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('hideOnStartup.never', "Never hide the terminal view on startup."),
                    (0, nls_1.localize)('hideOnStartup.whenEmpty', "Only hide the terminal when there are no persistent sessions restored."),
                    (0, nls_1.localize)('hideOnStartup.always', "Always hide the terminal, even when there are persistent sessions restored.")
                ],
                default: 'never'
            },
            ["terminal.integrated.customGlyphs" /* TerminalSettingId.CustomGlyphs */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.customGlyphs', "Whether to draw custom glyphs for block element and box drawing characters instead of using the font, which typically yields better rendering with continuous lines. Note that this doesn't work when {0} is disabled.", `\`#${"terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */}#\``),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.autoReplies" /* TerminalSettingId.AutoReplies */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.autoReplies', "A set of messages that, when encountered in the terminal, will be automatically responded to. Provided the message is specific enough, this can help automate away common responses.\n\nRemarks:\n\n- Use {0} to automatically respond to the terminate batch job prompt on Windows.\n- The message includes escape sequences so the reply might not happen with styled text.\n- Each reply can only happen once every second.\n- Use {1} in the reply to mean the enter key.\n- To unset a default key, set the value to null.\n- Restart VS Code if new don't apply.", '`"Terminate batch job (Y/N)": "Y\\r"`', '`"\\r"`'),
                type: 'object',
                additionalProperties: {
                    oneOf: [{
                            type: 'string',
                            description: (0, nls_1.localize)('terminal.integrated.autoReplies.reply', "The reply to send to the process.")
                        },
                        { type: 'null' }]
                },
                default: {}
            },
            ["terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.shellIntegration.enabled', "Determines whether or not shell integration is auto-injected to support features like enhanced command tracking and current working directory detection. \n\nShell integration works by injecting the shell with a startup script. The script gives VS Code insight into what is happening within the terminal.\n\nSupported shells:\n\n- Linux/macOS: bash, fish, pwsh, zsh\n - Windows: pwsh\n\nThis setting applies only when terminals are created, so you will need to restart your terminals for it to take effect.\n\n Note that the script injection may not work if you have custom arguments defined in the terminal profile, have enabled {1}, have a [complex bash `PROMPT_COMMAND`](https://code.visualstudio.com/docs/editor/integrated-terminal#_complex-bash-promptcommand), or other unsupported setup. To disable decorations, see {0}", '`#terminal.integrated.shellIntegrations.decorationsEnabled#`', '`#editor.accessibilitySupport#`'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.shellIntegration.decorationsEnabled', "When shell integration is enabled, adds a decoration for each command."),
                type: 'string',
                enum: ['both', 'gutter', 'overviewRuler', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.shellIntegration.decorationsEnabled.both', "Show decorations in the gutter (left) and overview ruler (right)"),
                    (0, nls_1.localize)('terminal.integrated.shellIntegration.decorationsEnabled.gutter', "Show gutter decorations to the left of the terminal"),
                    (0, nls_1.localize)('terminal.integrated.shellIntegration.decorationsEnabled.overviewRuler', "Show overview ruler decorations to the right of the terminal"),
                    (0, nls_1.localize)('terminal.integrated.shellIntegration.decorationsEnabled.never', "Do not show decorations"),
                ],
                default: 'both'
            },
            ["terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.shellIntegration.history', "Controls the number of recently used commands to keep in the terminal command history. Set to 0 to disable terminal command history."),
                type: 'number',
                default: 100
            },
            ["terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.shellIntegration.suggestEnabled', "Enables experimental terminal Intellisense suggestions for supported shells when {0} is set to {1}. If shell integration is installed manually, {2} needs to be set to {3} before calling the script.", '`#terminal.integrated.shellIntegration.enabled#`', '`true`', '`VSCODE_SUGGEST`', '`1`'),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.smoothScrolling" /* TerminalSettingId.SmoothScrolling */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.smoothScrolling', "Controls whether the terminal will scroll using an animation."),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.ignoreBracketedPasteMode" /* TerminalSettingId.IgnoreBracketedPasteMode */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.ignoreBracketedPasteMode', "Controls whether the terminal will ignore bracketed paste mode even if the terminal was put into the mode, omitting the {0} and {1} sequences when pasting. This is useful when the shell is not respecting the mode which can happen in sub-shells for example.", '`\\x1b[200~`', '`\\x1b[201~`'),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.enableImages" /* TerminalSettingId.EnableImages */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.enableImages', "Enables image support in the terminal, this will only work when {0} is enabled. Both sixel and iTerm's inline image protocol are supported on Linux and macOS, Windows support will light up automatically when ConPTY passes through the sequences. Images will currently not be restored between window reloads/reconnects.", `\`#${"terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */}#\``),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.focusAfterRun" /* TerminalSettingId.FocusAfterRun */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.focusAfterRun', "Controls whether the terminal, accessible buffer, or neither will be focused after `Terminal: Run Selected Text In Active Terminal` has been run."),
                enum: ['terminal', 'accessible-buffer', 'none'],
                default: 'none',
                tags: ['accessibility'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('terminal.integrated.focusAfterRun.terminal', "Always focus the terminal."),
                    (0, nls_1.localize)('terminal.integrated.focusAfterRun.accessible-buffer', "Always focus the accessible buffer."),
                    (0, nls_1.localize)('terminal.integrated.focusAfterRun.none', "Do nothing."),
                ]
            }
        }
    };
    function registerTerminalConfiguration() {
        const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
        configurationRegistry.registerConfiguration(terminalConfiguration);
    }
    exports.registerTerminalConfiguration = registerTerminalConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb25maWd1cmF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsQ29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLEdBQUc7UUFDcEMsYUFBYSxHQUFHLElBQUEsY0FBUSxFQUFDLEtBQUssRUFBRSwwQ0FBMEMsQ0FBQztRQUMzRSxtQkFBbUIsR0FBRyxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsbVBBQW1QLENBQUM7UUFDaFMseUJBQXlCLEdBQUcsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsa0RBQWtELENBQUM7UUFDM0csZUFBZSxHQUFHLElBQUEsY0FBUSxFQUFDLE9BQU8sRUFBRSxrREFBa0QsQ0FBQztRQUN2RixpQkFBaUIsR0FBRyxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsa0NBQWtDLENBQUM7UUFDM0UsbUJBQW1CLEdBQUcsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLHNHQUFzRyxFQUFFLFNBQVMsQ0FBQztRQUM5SixrQkFBa0IsR0FBRyxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsa0RBQWtELENBQUM7UUFDN0YsY0FBYyxHQUFHLElBQUEsY0FBUSxFQUFDLE1BQU0sRUFBRSxtREFBbUQsQ0FBQztLQUN0RixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHVGQUF1RjtJQUV2RyxJQUFJLGFBQWEsR0FBRyxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsOEVBQThFLENBQUMsQ0FBQztJQUM5SCxhQUFhLElBQUksbUJBQW1CLENBQUM7SUFFckMsSUFBSSxtQkFBbUIsR0FBRyxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSw2SEFBNkgsQ0FBQyxDQUFDO0lBQ3pM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