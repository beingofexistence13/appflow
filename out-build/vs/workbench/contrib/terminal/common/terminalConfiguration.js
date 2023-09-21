/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configurationRegistry", "vs/nls!vs/workbench/contrib/terminal/common/terminalConfiguration", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/platform", "vs/platform/registry/common/platform", "vs/base/common/codicons", "vs/platform/terminal/common/terminalPlatformConfiguration"], function (require, exports, configurationRegistry_1, nls_1, terminal_1, platform_1, platform_2, codicons_1, terminalPlatformConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dWb = void 0;
    const terminalDescriptors = '\n- ' + [
        '`\${cwd}`: ' + (0, nls_1.localize)(0, null),
        '`\${cwdFolder}`: ' + (0, nls_1.localize)(1, null),
        '`\${workspaceFolder}`: ' + (0, nls_1.localize)(2, null),
        '`\${local}`: ' + (0, nls_1.localize)(3, null),
        '`\${process}`: ' + (0, nls_1.localize)(4, null),
        '`\${separator}`: ' + (0, nls_1.localize)(5, null, '(` - `)'),
        '`\${sequence}`: ' + (0, nls_1.localize)(6, null),
        '`\${task}`: ' + (0, nls_1.localize)(7, null),
    ].join('\n- '); // intentionally concatenated to not produce a string that is too long for translations
    let terminalTitle = (0, nls_1.localize)(8, null);
    terminalTitle += terminalDescriptors;
    let terminalDescription = (0, nls_1.localize)(9, null);
    terminalDescription += terminalDescriptors;
    const terminalConfiguration = {
        id: 'terminal',
        order: 100,
        title: (0, nls_1.localize)(10, null),
        type: 'object',
        properties: {
            ["terminal.integrated.sendKeybindingsToShell" /* TerminalSettingId.SendKeybindingsToShell */]: {
                markdownDescription: (0, nls_1.localize)(11, null, '`#terminal.integrated.commandsToSkipShell#`'),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.tabs.defaultColor" /* TerminalSettingId.TabsDefaultColor */]: {
                description: (0, nls_1.localize)(12, null),
                ...terminalPlatformConfiguration_1.$9q,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            ["terminal.integrated.tabs.defaultIcon" /* TerminalSettingId.TabsDefaultIcon */]: {
                description: (0, nls_1.localize)(13, null),
                ...terminalPlatformConfiguration_1.$0q,
                default: codicons_1.$Pj.terminal.id,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            ["terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */]: {
                description: (0, nls_1.localize)(14, null),
                type: 'boolean',
                default: true,
            },
            ["terminal.integrated.tabs.enableAnimation" /* TerminalSettingId.TabsEnableAnimation */]: {
                description: (0, nls_1.localize)(15, null),
                type: 'boolean',
                default: true,
            },
            ["terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */]: {
                description: (0, nls_1.localize)(16, null),
                type: 'string',
                enum: ['never', 'singleTerminal', 'singleGroup'],
                enumDescriptions: [
                    (0, nls_1.localize)(17, null),
                    (0, nls_1.localize)(18, null),
                    (0, nls_1.localize)(19, null),
                ],
                default: 'singleTerminal',
            },
            ["terminal.integrated.tabs.showActiveTerminal" /* TerminalSettingId.TabsShowActiveTerminal */]: {
                description: (0, nls_1.localize)(20, null),
                type: 'string',
                enum: ['always', 'singleTerminal', 'singleTerminalOrNarrow', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)(21, null),
                    (0, nls_1.localize)(22, null),
                    (0, nls_1.localize)(23, null),
                    (0, nls_1.localize)(24, null),
                ],
                default: 'singleTerminalOrNarrow',
            },
            ["terminal.integrated.tabs.showActions" /* TerminalSettingId.TabsShowActions */]: {
                description: (0, nls_1.localize)(25, null),
                type: 'string',
                enum: ['always', 'singleTerminal', 'singleTerminalOrNarrow', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)(26, null),
                    (0, nls_1.localize)(27, null),
                    (0, nls_1.localize)(28, null),
                    (0, nls_1.localize)(29, null),
                ],
                default: 'singleTerminalOrNarrow',
            },
            ["terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */]: {
                type: 'string',
                enum: ['left', 'right'],
                enumDescriptions: [
                    (0, nls_1.localize)(30, null),
                    (0, nls_1.localize)(31, null)
                ],
                default: 'right',
                description: (0, nls_1.localize)(32, null)
            },
            ["terminal.integrated.defaultLocation" /* TerminalSettingId.DefaultLocation */]: {
                type: 'string',
                enum: ["editor" /* TerminalLocationString.Editor */, "view" /* TerminalLocationString.TerminalView */],
                enumDescriptions: [
                    (0, nls_1.localize)(33, null),
                    (0, nls_1.localize)(34, null)
                ],
                default: 'view',
                description: (0, nls_1.localize)(35, null)
            },
            ["terminal.integrated.tabs.focusMode" /* TerminalSettingId.TabsFocusMode */]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                enumDescriptions: [
                    (0, nls_1.localize)(36, null),
                    (0, nls_1.localize)(37, null)
                ],
                default: 'doubleClick',
                description: (0, nls_1.localize)(38, null)
            },
            ["terminal.integrated.macOptionIsMeta" /* TerminalSettingId.MacOptionIsMeta */]: {
                description: (0, nls_1.localize)(39, null),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.macOptionClickForcesSelection" /* TerminalSettingId.MacOptionClickForcesSelection */]: {
                description: (0, nls_1.localize)(40, null),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.altClickMovesCursor" /* TerminalSettingId.AltClickMovesCursor */]: {
                markdownDescription: (0, nls_1.localize)(41, null, '`#editor.multiCursorModifier#`', '`\'alt\'`'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.copyOnSelection" /* TerminalSettingId.CopyOnSelection */]: {
                description: (0, nls_1.localize)(42, null),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.enableMultiLinePasteWarning" /* TerminalSettingId.EnableMultiLinePasteWarning */]: {
                markdownDescription: (0, nls_1.localize)(43, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.drawBoldTextInBrightColors" /* TerminalSettingId.DrawBoldTextInBrightColors */]: {
                description: (0, nls_1.localize)(44, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */]: {
                markdownDescription: (0, nls_1.localize)(45, null, '`#editor.fontFamily#`'),
                type: 'string'
            },
            // TODO: Support font ligatures
            // 'terminal.integrated.fontLigatures': {
            // 	'description': localize('terminal.integrated.fontLigatures', "Controls whether font ligatures are enabled in the terminal."),
            // 	'type': 'boolean',
            // 	'default': false
            // },
            ["terminal.integrated.fontSize" /* TerminalSettingId.FontSize */]: {
                description: (0, nls_1.localize)(46, null),
                type: 'number',
                default: platform_1.$j ? 12 : 14,
                minimum: 6,
                maximum: 100
            },
            ["terminal.integrated.letterSpacing" /* TerminalSettingId.LetterSpacing */]: {
                description: (0, nls_1.localize)(47, null),
                type: 'number',
                default: terminal_1.$wM
            },
            ["terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */]: {
                description: (0, nls_1.localize)(48, null),
                type: 'number',
                default: terminal_1.$yM
            },
            ["terminal.integrated.minimumContrastRatio" /* TerminalSettingId.MinimumContrastRatio */]: {
                markdownDescription: (0, nls_1.localize)(49, null),
                type: 'number',
                default: 4.5,
                tags: ['accessibility']
            },
            ["terminal.integrated.tabStopWidth" /* TerminalSettingId.TabStopWidth */]: {
                markdownDescription: (0, nls_1.localize)(50, null),
                type: 'number',
                minimum: 1,
                default: 8
            },
            ["terminal.integrated.fastScrollSensitivity" /* TerminalSettingId.FastScrollSensitivity */]: {
                markdownDescription: (0, nls_1.localize)(51, null),
                type: 'number',
                default: 5
            },
            ["terminal.integrated.mouseWheelScrollSensitivity" /* TerminalSettingId.MouseWheelScrollSensitivity */]: {
                markdownDescription: (0, nls_1.localize)(52, null),
                type: 'number',
                default: 1
            },
            ["terminal.integrated.bellDuration" /* TerminalSettingId.BellDuration */]: {
                markdownDescription: (0, nls_1.localize)(53, null),
                type: 'number',
                default: 1000
            },
            ["terminal.integrated.fontWeight" /* TerminalSettingId.FontWeight */]: {
                'anyOf': [
                    {
                        type: 'number',
                        minimum: terminal_1.$zM,
                        maximum: terminal_1.$AM,
                        errorMessage: (0, nls_1.localize)(54, null)
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: terminal_1.$DM,
                    }
                ],
                description: (0, nls_1.localize)(55, null),
                default: 'normal'
            },
            ["terminal.integrated.fontWeightBold" /* TerminalSettingId.FontWeightBold */]: {
                'anyOf': [
                    {
                        type: 'number',
                        minimum: terminal_1.$zM,
                        maximum: terminal_1.$AM,
                        errorMessage: (0, nls_1.localize)(56, null)
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: terminal_1.$DM,
                    }
                ],
                description: (0, nls_1.localize)(57, null),
                default: 'bold'
            },
            ["terminal.integrated.cursorBlinking" /* TerminalSettingId.CursorBlinking */]: {
                description: (0, nls_1.localize)(58, null),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.cursorStyle" /* TerminalSettingId.CursorStyle */]: {
                description: (0, nls_1.localize)(59, null),
                enum: ['block', 'line', 'underline'],
                default: 'block'
            },
            ["terminal.integrated.cursorStyleInactive" /* TerminalSettingId.CursorStyleInactive */]: {
                description: (0, nls_1.localize)(60, null),
                enum: ['outline', 'block', 'line', 'underline', 'none'],
                default: 'outline'
            },
            ["terminal.integrated.cursorWidth" /* TerminalSettingId.CursorWidth */]: {
                markdownDescription: (0, nls_1.localize)(61, null, '`#terminal.integrated.cursorStyle#`', '`line`'),
                type: 'number',
                default: 1
            },
            ["terminal.integrated.scrollback" /* TerminalSettingId.Scrollback */]: {
                description: (0, nls_1.localize)(62, null),
                type: 'number',
                default: 1000
            },
            ["terminal.integrated.detectLocale" /* TerminalSettingId.DetectLocale */]: {
                markdownDescription: (0, nls_1.localize)(63, null),
                type: 'string',
                enum: ['auto', 'off', 'on'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(64, null),
                    (0, nls_1.localize)(65, null),
                    (0, nls_1.localize)(66, null)
                ],
                default: 'auto'
            },
            ["terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */]: {
                type: 'string',
                enum: ['auto', 'on', 'off', 'canvas'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(67, null),
                    (0, nls_1.localize)(68, null),
                    (0, nls_1.localize)(69, null),
                    (0, nls_1.localize)(70, null)
                ],
                default: 'auto',
                description: (0, nls_1.localize)(71, null)
            },
            ["terminal.integrated.tabs.separator" /* TerminalSettingId.TerminalTitleSeparator */]: {
                'type': 'string',
                'default': ' - ',
                'markdownDescription': (0, nls_1.localize)(72, null, `\`#${"terminal.integrated.tabs.title" /* TerminalSettingId.TerminalTitle */}#\``, `\`#${"terminal.integrated.tabs.description" /* TerminalSettingId.TerminalDescription */}#\``)
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
                    (0, nls_1.localize)(73, null),
                    (0, nls_1.localize)(74, null),
                    (0, nls_1.localize)(75, null),
                    (0, nls_1.localize)(76, null),
                    (0, nls_1.localize)(77, null)
                ],
                default: platform_1.$j ? 'selectWord' : platform_1.$i ? 'copyPaste' : 'default',
                description: (0, nls_1.localize)(78, null)
            },
            ["terminal.integrated.cwd" /* TerminalSettingId.Cwd */]: {
                restricted: true,
                description: (0, nls_1.localize)(79, null),
                type: 'string',
                default: undefined,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            ["terminal.integrated.confirmOnExit" /* TerminalSettingId.ConfirmOnExit */]: {
                description: (0, nls_1.localize)(80, null),
                type: 'string',
                enum: ['never', 'always', 'hasChildProcesses'],
                enumDescriptions: [
                    (0, nls_1.localize)(81, null),
                    (0, nls_1.localize)(82, null),
                    (0, nls_1.localize)(83, null),
                ],
                default: 'never'
            },
            ["terminal.integrated.confirmOnKill" /* TerminalSettingId.ConfirmOnKill */]: {
                description: (0, nls_1.localize)(84, null),
                type: 'string',
                enum: ['never', 'editor', 'panel', 'always'],
                enumDescriptions: [
                    (0, nls_1.localize)(85, null),
                    (0, nls_1.localize)(86, null),
                    (0, nls_1.localize)(87, null),
                    (0, nls_1.localize)(88, null),
                ],
                default: 'editor'
            },
            ["terminal.integrated.enableBell" /* TerminalSettingId.EnableBell */]: {
                description: (0, nls_1.localize)(89, null),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.commandsToSkipShell" /* TerminalSettingId.CommandsToSkipShell */]: {
                markdownDescription: (0, nls_1.localize)(90, null, terminal_1.$KM.sort().map(command => `- ${command}`).join('\n'), `[${(0, nls_1.localize)(91, null)}](command:workbench.action.openRawDefaultSettings '${(0, nls_1.localize)(92, null)}')`),
                type: 'array',
                items: {
                    type: 'string'
                },
                default: []
            },
            ["terminal.integrated.allowChords" /* TerminalSettingId.AllowChords */]: {
                markdownDescription: (0, nls_1.localize)(93, null, '`#terminal.integrated.commandsToSkipShell#`'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.allowMnemonics" /* TerminalSettingId.AllowMnemonics */]: {
                markdownDescription: (0, nls_1.localize)(94, null),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.env.osx" /* TerminalSettingId.EnvMacOs */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(95, null),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            ["terminal.integrated.env.linux" /* TerminalSettingId.EnvLinux */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(96, null),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            ["terminal.integrated.env.windows" /* TerminalSettingId.EnvWindows */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(97, null),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            ["terminal.integrated.environmentChangesIndicator" /* TerminalSettingId.EnvironmentChangesIndicator */]: {
                markdownDescription: (0, nls_1.localize)(98, null),
                type: 'string',
                enum: ['off', 'on', 'warnonly'],
                enumDescriptions: [
                    (0, nls_1.localize)(99, null),
                    (0, nls_1.localize)(100, null),
                    (0, nls_1.localize)(101, null),
                ],
                default: 'warnonly'
            },
            ["terminal.integrated.environmentChangesRelaunch" /* TerminalSettingId.EnvironmentChangesRelaunch */]: {
                markdownDescription: (0, nls_1.localize)(102, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.showExitAlert" /* TerminalSettingId.ShowExitAlert */]: {
                description: (0, nls_1.localize)(103, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.splitCwd" /* TerminalSettingId.SplitCwd */]: {
                description: (0, nls_1.localize)(104, null),
                type: 'string',
                enum: ['workspaceRoot', 'initial', 'inherited'],
                enumDescriptions: [
                    (0, nls_1.localize)(105, null),
                    (0, nls_1.localize)(106, null),
                    (0, nls_1.localize)(107, null),
                ],
                default: 'inherited'
            },
            ["terminal.integrated.windowsEnableConpty" /* TerminalSettingId.WindowsEnableConpty */]: {
                description: (0, nls_1.localize)(108, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.wordSeparators" /* TerminalSettingId.WordSeparators */]: {
                markdownDescription: (0, nls_1.localize)(109, null),
                type: 'string',
                // allow-any-unicode-next-line
                default: ' ()[]{}\',"`─‘’|'
            },
            ["terminal.integrated.enableFileLinks" /* TerminalSettingId.EnableFileLinks */]: {
                description: (0, nls_1.localize)(110, null),
                type: 'string',
                enum: ['off', 'on', 'notRemote'],
                enumDescriptions: [
                    (0, nls_1.localize)(111, null),
                    (0, nls_1.localize)(112, null),
                    (0, nls_1.localize)(113, null)
                ],
                default: 'on'
            },
            ["terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */]: {
                type: 'string',
                enum: ['6', '11'],
                enumDescriptions: [
                    (0, nls_1.localize)(114, null),
                    (0, nls_1.localize)(115, null)
                ],
                default: '11',
                description: (0, nls_1.localize)(116, null)
            },
            ["terminal.integrated.localEchoLatencyThreshold" /* TerminalSettingId.LocalEchoLatencyThreshold */]: {
                description: (0, nls_1.localize)(117, null),
                type: 'integer',
                minimum: -1,
                default: 30,
            },
            ["terminal.integrated.localEchoEnabled" /* TerminalSettingId.LocalEchoEnabled */]: {
                markdownDescription: (0, nls_1.localize)(118, null, '`#terminal.integrated.localEchoLatencyThreshold#`'),
                type: 'string',
                enum: ['on', 'off', 'auto'],
                enumDescriptions: [
                    (0, nls_1.localize)(119, null),
                    (0, nls_1.localize)(120, null),
                    (0, nls_1.localize)(121, null)
                ],
                default: 'auto'
            },
            ["terminal.integrated.localEchoExcludePrograms" /* TerminalSettingId.LocalEchoExcludePrograms */]: {
                description: (0, nls_1.localize)(122, null),
                type: 'array',
                items: {
                    type: 'string',
                    uniqueItems: true
                },
                default: terminal_1.$HM,
            },
            ["terminal.integrated.localEchoStyle" /* TerminalSettingId.LocalEchoStyle */]: {
                description: (0, nls_1.localize)(123, null),
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
                description: (0, nls_1.localize)(124, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.persistentSessionReviveProcess" /* TerminalSettingId.PersistentSessionReviveProcess */]: {
                markdownDescription: (0, nls_1.localize)(125, null),
                type: 'string',
                enum: ['onExit', 'onExitAndWindowClose', 'never'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(126, null),
                    (0, nls_1.localize)(127, null),
                    (0, nls_1.localize)(128, null)
                ],
                default: 'onExit'
            },
            ["terminal.integrated.hideOnStartup" /* TerminalSettingId.HideOnStartup */]: {
                description: (0, nls_1.localize)(129, null),
                type: 'string',
                enum: ['never', 'whenEmpty', 'always'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(130, null),
                    (0, nls_1.localize)(131, null),
                    (0, nls_1.localize)(132, null)
                ],
                default: 'never'
            },
            ["terminal.integrated.customGlyphs" /* TerminalSettingId.CustomGlyphs */]: {
                markdownDescription: (0, nls_1.localize)(133, null, `\`#${"terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */}#\``),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.autoReplies" /* TerminalSettingId.AutoReplies */]: {
                markdownDescription: (0, nls_1.localize)(134, null, '`"Terminate batch job (Y/N)": "Y\\r"`', '`"\\r"`'),
                type: 'object',
                additionalProperties: {
                    oneOf: [{
                            type: 'string',
                            description: (0, nls_1.localize)(135, null)
                        },
                        { type: 'null' }]
                },
                default: {}
            },
            ["terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(136, null, '`#terminal.integrated.shellIntegrations.decorationsEnabled#`', '`#editor.accessibilitySupport#`'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(137, null),
                type: 'string',
                enum: ['both', 'gutter', 'overviewRuler', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)(138, null),
                    (0, nls_1.localize)(139, null),
                    (0, nls_1.localize)(140, null),
                    (0, nls_1.localize)(141, null),
                ],
                default: 'both'
            },
            ["terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(142, null),
                type: 'number',
                default: 100
            },
            ["terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(143, null, '`#terminal.integrated.shellIntegration.enabled#`', '`true`', '`VSCODE_SUGGEST`', '`1`'),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.smoothScrolling" /* TerminalSettingId.SmoothScrolling */]: {
                markdownDescription: (0, nls_1.localize)(144, null),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.ignoreBracketedPasteMode" /* TerminalSettingId.IgnoreBracketedPasteMode */]: {
                markdownDescription: (0, nls_1.localize)(145, null, '`\\x1b[200~`', '`\\x1b[201~`'),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.enableImages" /* TerminalSettingId.EnableImages */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(146, null, `\`#${"terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */}#\``),
                type: 'boolean',
                default: false
            },
            ["terminal.integrated.focusAfterRun" /* TerminalSettingId.FocusAfterRun */]: {
                markdownDescription: (0, nls_1.localize)(147, null),
                enum: ['terminal', 'accessible-buffer', 'none'],
                default: 'none',
                tags: ['accessibility'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(148, null),
                    (0, nls_1.localize)(149, null),
                    (0, nls_1.localize)(150, null),
                ]
            }
        }
    };
    function $dWb() {
        const configurationRegistry = platform_2.$8m.as(configurationRegistry_1.$an.Configuration);
        configurationRegistry.registerConfiguration(terminalConfiguration);
    }
    exports.$dWb = $dWb;
});
//# sourceMappingURL=terminalConfiguration.js.map