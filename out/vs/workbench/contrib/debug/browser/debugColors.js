/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/common/color", "vs/nls", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/theme/common/theme"], function (require, exports, colorRegistry_1, themeService_1, themables_1, color_1, nls_1, icons, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerColors = exports.debugIconStartForeground = exports.debugToolBarBorder = exports.debugToolBarBackground = void 0;
    exports.debugToolBarBackground = (0, colorRegistry_1.registerColor)('debugToolBar.background', {
        dark: '#333333',
        light: '#F3F3F3',
        hcDark: '#000000',
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)('debugToolBarBackground', "Debug toolbar background color."));
    exports.debugToolBarBorder = (0, colorRegistry_1.registerColor)('debugToolBar.border', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('debugToolBarBorder', "Debug toolbar border color."));
    exports.debugIconStartForeground = (0, colorRegistry_1.registerColor)('debugIcon.startForeground', {
        dark: '#89D185',
        light: '#388A34',
        hcDark: '#89D185',
        hcLight: '#388A34'
    }, (0, nls_1.localize)('debugIcon.startForeground', "Debug toolbar icon for start debugging."));
    function registerColors() {
        const debugTokenExpressionName = (0, colorRegistry_1.registerColor)('debugTokenExpression.name', { dark: '#c586c0', light: '#9b46b0', hcDark: colorRegistry_1.foreground, hcLight: colorRegistry_1.foreground }, 'Foreground color for the token names shown in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionValue = (0, colorRegistry_1.registerColor)('debugTokenExpression.value', { dark: '#cccccc99', light: '#6c6c6ccc', hcDark: colorRegistry_1.foreground, hcLight: colorRegistry_1.foreground }, 'Foreground color for the token values shown in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionString = (0, colorRegistry_1.registerColor)('debugTokenExpression.string', { dark: '#ce9178', light: '#a31515', hcDark: '#f48771', hcLight: '#a31515' }, 'Foreground color for strings in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionBoolean = (0, colorRegistry_1.registerColor)('debugTokenExpression.boolean', { dark: '#4e94ce', light: '#0000ff', hcDark: '#75bdfe', hcLight: '#0000ff' }, 'Foreground color for booleans in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionNumber = (0, colorRegistry_1.registerColor)('debugTokenExpression.number', { dark: '#b5cea8', light: '#098658', hcDark: '#89d185', hcLight: '#098658' }, 'Foreground color for numbers in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionError = (0, colorRegistry_1.registerColor)('debugTokenExpression.error', { dark: '#f48771', light: '#e51400', hcDark: '#f48771', hcLight: '#e51400' }, 'Foreground color for expression errors in the debug views (ie. the Variables or Watch view) and for error logs shown in the debug console.');
        const debugViewExceptionLabelForeground = (0, colorRegistry_1.registerColor)('debugView.exceptionLabelForeground', { dark: colorRegistry_1.foreground, light: '#FFF', hcDark: colorRegistry_1.foreground, hcLight: colorRegistry_1.foreground }, 'Foreground color for a label shown in the CALL STACK view when the debugger breaks on an exception.');
        const debugViewExceptionLabelBackground = (0, colorRegistry_1.registerColor)('debugView.exceptionLabelBackground', { dark: '#6C2022', light: '#A31515', hcDark: '#6C2022', hcLight: '#A31515' }, 'Background color for a label shown in the CALL STACK view when the debugger breaks on an exception.');
        const debugViewStateLabelForeground = (0, colorRegistry_1.registerColor)('debugView.stateLabelForeground', { dark: colorRegistry_1.foreground, light: colorRegistry_1.foreground, hcDark: colorRegistry_1.foreground, hcLight: colorRegistry_1.foreground }, 'Foreground color for a label in the CALL STACK view showing the current session\'s or thread\'s state.');
        const debugViewStateLabelBackground = (0, colorRegistry_1.registerColor)('debugView.stateLabelBackground', { dark: '#88888844', light: '#88888844', hcDark: '#88888844', hcLight: '#88888844' }, 'Background color for a label in the CALL STACK view showing the current session\'s or thread\'s state.');
        const debugViewValueChangedHighlight = (0, colorRegistry_1.registerColor)('debugView.valueChangedHighlight', { dark: '#569CD6', light: '#569CD6', hcDark: '#569CD6', hcLight: '#569CD6' }, 'Color used to highlight value changes in the debug views (ie. in the Variables view).');
        const debugConsoleInfoForeground = (0, colorRegistry_1.registerColor)('debugConsole.infoForeground', { dark: colorRegistry_1.editorInfoForeground, light: colorRegistry_1.editorInfoForeground, hcDark: colorRegistry_1.foreground, hcLight: colorRegistry_1.foreground }, 'Foreground color for info messages in debug REPL console.');
        const debugConsoleWarningForeground = (0, colorRegistry_1.registerColor)('debugConsole.warningForeground', { dark: colorRegistry_1.editorWarningForeground, light: colorRegistry_1.editorWarningForeground, hcDark: '#008000', hcLight: colorRegistry_1.editorWarningForeground }, 'Foreground color for warning messages in debug REPL console.');
        const debugConsoleErrorForeground = (0, colorRegistry_1.registerColor)('debugConsole.errorForeground', { dark: colorRegistry_1.errorForeground, light: colorRegistry_1.errorForeground, hcDark: colorRegistry_1.errorForeground, hcLight: colorRegistry_1.errorForeground }, 'Foreground color for error messages in debug REPL console.');
        const debugConsoleSourceForeground = (0, colorRegistry_1.registerColor)('debugConsole.sourceForeground', { dark: colorRegistry_1.foreground, light: colorRegistry_1.foreground, hcDark: colorRegistry_1.foreground, hcLight: colorRegistry_1.foreground }, 'Foreground color for source filenames in debug REPL console.');
        const debugConsoleInputIconForeground = (0, colorRegistry_1.registerColor)('debugConsoleInputIcon.foreground', { dark: colorRegistry_1.foreground, light: colorRegistry_1.foreground, hcDark: colorRegistry_1.foreground, hcLight: colorRegistry_1.foreground }, 'Foreground color for debug console input marker icon.');
        const debugIconPauseForeground = (0, colorRegistry_1.registerColor)('debugIcon.pauseForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hcDark: '#75BEFF',
            hcLight: '#007ACC'
        }, (0, nls_1.localize)('debugIcon.pauseForeground', "Debug toolbar icon for pause."));
        const debugIconStopForeground = (0, colorRegistry_1.registerColor)('debugIcon.stopForeground', {
            dark: '#F48771',
            light: '#A1260D',
            hcDark: '#F48771',
            hcLight: '#A1260D'
        }, (0, nls_1.localize)('debugIcon.stopForeground', "Debug toolbar icon for stop."));
        const debugIconDisconnectForeground = (0, colorRegistry_1.registerColor)('debugIcon.disconnectForeground', {
            dark: '#F48771',
            light: '#A1260D',
            hcDark: '#F48771',
            hcLight: '#A1260D'
        }, (0, nls_1.localize)('debugIcon.disconnectForeground', "Debug toolbar icon for disconnect."));
        const debugIconRestartForeground = (0, colorRegistry_1.registerColor)('debugIcon.restartForeground', {
            dark: '#89D185',
            light: '#388A34',
            hcDark: '#89D185',
            hcLight: '#388A34'
        }, (0, nls_1.localize)('debugIcon.restartForeground', "Debug toolbar icon for restart."));
        const debugIconStepOverForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepOverForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hcDark: '#75BEFF',
            hcLight: '#007ACC'
        }, (0, nls_1.localize)('debugIcon.stepOverForeground', "Debug toolbar icon for step over."));
        const debugIconStepIntoForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepIntoForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hcDark: '#75BEFF',
            hcLight: '#007ACC'
        }, (0, nls_1.localize)('debugIcon.stepIntoForeground', "Debug toolbar icon for step into."));
        const debugIconStepOutForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepOutForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hcDark: '#75BEFF',
            hcLight: '#007ACC'
        }, (0, nls_1.localize)('debugIcon.stepOutForeground', "Debug toolbar icon for step over."));
        const debugIconContinueForeground = (0, colorRegistry_1.registerColor)('debugIcon.continueForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hcDark: '#75BEFF',
            hcLight: '#007ACC'
        }, (0, nls_1.localize)('debugIcon.continueForeground', "Debug toolbar icon for continue."));
        const debugIconStepBackForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepBackForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hcDark: '#75BEFF',
            hcLight: '#007ACC'
        }, (0, nls_1.localize)('debugIcon.stepBackForeground', "Debug toolbar icon for step back."));
        (0, themeService_1.registerThemingParticipant)((theme, collector) => {
            // All these colours provide a default value so they will never be undefined, hence the `!`
            const badgeBackgroundColor = theme.getColor(colorRegistry_1.badgeBackground);
            const badgeForegroundColor = theme.getColor(colorRegistry_1.badgeForeground);
            const listDeemphasizedForegroundColor = theme.getColor(colorRegistry_1.listDeemphasizedForeground);
            const debugViewExceptionLabelForegroundColor = theme.getColor(debugViewExceptionLabelForeground);
            const debugViewExceptionLabelBackgroundColor = theme.getColor(debugViewExceptionLabelBackground);
            const debugViewStateLabelForegroundColor = theme.getColor(debugViewStateLabelForeground);
            const debugViewStateLabelBackgroundColor = theme.getColor(debugViewStateLabelBackground);
            const debugViewValueChangedHighlightColor = theme.getColor(debugViewValueChangedHighlight);
            const toolbarHoverBackgroundColor = theme.getColor(colorRegistry_1.toolbarHoverBackground);
            collector.addRule(`
			/* Text colour of the call stack row's filename */
			.debug-pane .debug-call-stack .monaco-list-row:not(.selected) .stack-frame > .file .file-name {
				color: ${listDeemphasizedForegroundColor}
			}

			/* Line & column number "badge" for selected call stack row */
			.debug-pane .monaco-list-row.selected .line-number {
				background-color: ${badgeBackgroundColor};
				color: ${badgeForegroundColor};
			}

			/* Line & column number "badge" for unselected call stack row (basically all other rows) */
			.debug-pane .line-number {
				background-color: ${badgeBackgroundColor.transparent(0.6)};
				color: ${badgeForegroundColor.transparent(0.6)};
			}

			/* State "badge" displaying the active session's current state.
			* Only visible when there are more active debug sessions/threads running.
			*/
			.debug-pane .debug-call-stack .thread > .state.label,
			.debug-pane .debug-call-stack .session > .state.label {
				background-color: ${debugViewStateLabelBackgroundColor};
				color: ${debugViewStateLabelForegroundColor};
			}

			/* State "badge" displaying the active session's current state.
			* Only visible when there are more active debug sessions/threads running
			* and thread paused due to a thrown exception.
			*/
			.debug-pane .debug-call-stack .thread > .state.label.exception,
			.debug-pane .debug-call-stack .session > .state.label.exception {
				background-color: ${debugViewExceptionLabelBackgroundColor};
				color: ${debugViewExceptionLabelForegroundColor};
			}

			/* Info "badge" shown when the debugger pauses due to a thrown exception. */
			.debug-pane .call-stack-state-message > .label.exception {
				background-color: ${debugViewExceptionLabelBackgroundColor};
				color: ${debugViewExceptionLabelForegroundColor};
			}

			/* Animation of changed values in Debug viewlet */
			@keyframes debugViewletValueChanged {
				0%   { background-color: ${debugViewValueChangedHighlightColor.transparent(0)} }
				5%   { background-color: ${debugViewValueChangedHighlightColor.transparent(0.9)} }
				100% { background-color: ${debugViewValueChangedHighlightColor.transparent(0.3)} }
			}

			.debug-pane .monaco-list-row .expression .value.changed {
				background-color: ${debugViewValueChangedHighlightColor.transparent(0.3)};
				animation-name: debugViewletValueChanged;
				animation-duration: 1s;
				animation-fill-mode: forwards;
			}

			.monaco-list-row .expression .lazy-button:hover {
				background-color: ${toolbarHoverBackgroundColor}
			}
		`);
            const contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
            if (contrastBorderColor) {
                collector.addRule(`
			.debug-pane .line-number {
				border: 1px solid ${contrastBorderColor};
			}
			`);
            }
            // Use fully-opaque colors for line-number badges
            if ((0, theme_1.isHighContrast)(theme.type)) {
                collector.addRule(`
			.debug-pane .line-number {
				background-color: ${badgeBackgroundColor};
				color: ${badgeForegroundColor};
			}`);
            }
            const tokenNameColor = theme.getColor(debugTokenExpressionName);
            const tokenValueColor = theme.getColor(debugTokenExpressionValue);
            const tokenStringColor = theme.getColor(debugTokenExpressionString);
            const tokenBooleanColor = theme.getColor(debugTokenExpressionBoolean);
            const tokenErrorColor = theme.getColor(debugTokenExpressionError);
            const tokenNumberColor = theme.getColor(debugTokenExpressionNumber);
            collector.addRule(`
			.monaco-workbench .monaco-list-row .expression .name {
				color: ${tokenNameColor};
			}

			.monaco-workbench .monaco-list-row .expression .value,
			.monaco-workbench .debug-hover-widget .value {
				color: ${tokenValueColor};
			}

			.monaco-workbench .monaco-list-row .expression .value.string,
			.monaco-workbench .debug-hover-widget .value.string {
				color: ${tokenStringColor};
			}

			.monaco-workbench .monaco-list-row .expression .value.boolean,
			.monaco-workbench .debug-hover-widget .value.boolean {
				color: ${tokenBooleanColor};
			}

			.monaco-workbench .monaco-list-row .expression .error,
			.monaco-workbench .debug-hover-widget .error,
			.monaco-workbench .debug-pane .debug-variables .scope .error {
				color: ${tokenErrorColor};
			}

			.monaco-workbench .monaco-list-row .expression .value.number,
			.monaco-workbench .debug-hover-widget .value.number {
				color: ${tokenNumberColor};
			}
		`);
            const debugConsoleInputBorderColor = theme.getColor(colorRegistry_1.inputBorder) || color_1.Color.fromHex('#80808060');
            const debugConsoleInfoForegroundColor = theme.getColor(debugConsoleInfoForeground);
            const debugConsoleWarningForegroundColor = theme.getColor(debugConsoleWarningForeground);
            const debugConsoleErrorForegroundColor = theme.getColor(debugConsoleErrorForeground);
            const debugConsoleSourceForegroundColor = theme.getColor(debugConsoleSourceForeground);
            const debugConsoleInputIconForegroundColor = theme.getColor(debugConsoleInputIconForeground);
            collector.addRule(`
			.repl .repl-input-wrapper {
				border-top: 1px solid ${debugConsoleInputBorderColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.info {
				color: ${debugConsoleInfoForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.warn {
				color: ${debugConsoleWarningForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.error {
				color: ${debugConsoleErrorForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .source {
				color: ${debugConsoleSourceForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .monaco-tl-contents .arrow {
				color: ${debugConsoleInputIconForegroundColor};
			}
		`);
            if (!theme.defines(debugConsoleInputIconForeground)) {
                collector.addRule(`
				.monaco-workbench.vs .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.25;
				}

				.monaco-workbench.vs-dark .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.4;
				}

				.monaco-workbench.hc-black .repl .repl-tree .monaco-tl-contents .arrow,
				.monaco-workbench.hc-light .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 1;
				}
			`);
            }
            const debugIconStartColor = theme.getColor(exports.debugIconStartForeground);
            if (debugIconStartColor) {
                collector.addRule(`.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStart)} { color: ${debugIconStartColor}; }`);
            }
            const debugIconPauseColor = theme.getColor(debugIconPauseForeground);
            if (debugIconPauseColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugPause)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugPause)} { color: ${debugIconPauseColor}; }`);
            }
            const debugIconStopColor = theme.getColor(debugIconStopForeground);
            if (debugIconStopColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugStop)},.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStop)} { color: ${debugIconStopColor}; }`);
            }
            const debugIconDisconnectColor = theme.getColor(debugIconDisconnectForeground);
            if (debugIconDisconnectColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugDisconnect)},.monaco-workbench .debug-view-content ${themables_1.ThemeIcon.asCSSSelector(icons.debugDisconnect)}, .monaco-workbench .debug-toolbar ${themables_1.ThemeIcon.asCSSSelector(icons.debugDisconnect)} { color: ${debugIconDisconnectColor}; }`);
            }
            const debugIconRestartColor = theme.getColor(debugIconRestartForeground);
            if (debugIconRestartColor) {
                collector.addRule(`.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugRestart)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugRestartFrame)}, .monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugRestart)}, .monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugRestartFrame)} { color: ${debugIconRestartColor}; }`);
            }
            const debugIconStepOverColor = theme.getColor(debugIconStepOverForeground);
            if (debugIconStepOverColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugStepOver)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStepOver)} { color: ${debugIconStepOverColor}; }`);
            }
            const debugIconStepIntoColor = theme.getColor(debugIconStepIntoForeground);
            if (debugIconStepIntoColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugStepInto)}, .monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugStepInto)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStepInto)} { color: ${debugIconStepIntoColor}; }`);
            }
            const debugIconStepOutColor = theme.getColor(debugIconStepOutForeground);
            if (debugIconStepOutColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugStepOut)}, .monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugStepOut)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStepOut)} { color: ${debugIconStepOutColor}; }`);
            }
            const debugIconContinueColor = theme.getColor(debugIconContinueForeground);
            if (debugIconContinueColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugContinue)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugContinue)}, .monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugReverseContinue)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugReverseContinue)} { color: ${debugIconContinueColor}; }`);
            }
            const debugIconStepBackColor = theme.getColor(debugIconStepBackForeground);
            if (debugIconStepBackColor) {
                collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${themables_1.ThemeIcon.asCSSSelector(icons.debugStepBack)}, .monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icons.debugStepBack)} { color: ${debugIconStepBackColor}; }`);
            }
        });
    }
    exports.registerColors = registerColors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb2xvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnQ29sb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVuRixRQUFBLHNCQUFzQixHQUFHLElBQUEsNkJBQWEsRUFBQyx5QkFBeUIsRUFBRTtRQUM5RSxJQUFJLEVBQUUsU0FBUztRQUNmLEtBQUssRUFBRSxTQUFTO1FBQ2hCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE9BQU8sRUFBRSxTQUFTO0tBQ2xCLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO0lBRTdELFFBQUEsa0JBQWtCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLHFCQUFxQixFQUFFO1FBQ3RFLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLElBQUk7UUFDWCxNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxJQUFJO0tBQ2IsRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7SUFFckQsUUFBQSx3QkFBd0IsR0FBRyxJQUFBLDZCQUFhLEVBQUMsMkJBQTJCLEVBQUU7UUFDbEYsSUFBSSxFQUFFLFNBQVM7UUFDZixLQUFLLEVBQUUsU0FBUztRQUNoQixNQUFNLEVBQUUsU0FBUztRQUNqQixPQUFPLEVBQUUsU0FBUztLQUNsQixFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLHlDQUF5QyxDQUFDLENBQUMsQ0FBQztJQUVyRixTQUFnQixjQUFjO1FBRTdCLE1BQU0sd0JBQXdCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLDJCQUEyQixFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSwwQkFBVSxFQUFF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