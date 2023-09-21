/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/htmlContent"], function (require, exports, nls_1, arrays_1, htmlContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getShellProcessTooltip = exports.getShellIntegrationTooltip = exports.getInstanceHoverInfo = void 0;
    function getInstanceHoverInfo(instance) {
        let statusString = '';
        const statuses = instance.statusList.statuses;
        const actions = [];
        for (const status of statuses) {
            statusString += `\n\n---\n\n${status.icon ? `$(${status.icon?.id}) ` : ''}${status.tooltip || status.id}`;
            if (status.hoverActions) {
                actions.push(...status.hoverActions);
            }
        }
        const shellProcessString = getShellProcessTooltip(instance, true);
        const shellIntegrationString = getShellIntegrationTooltip(instance, true);
        const content = new htmlContent_1.MarkdownString(instance.title + shellProcessString + shellIntegrationString + statusString, { supportThemeIcons: true });
        return { content, actions };
    }
    exports.getInstanceHoverInfo = getInstanceHoverInfo;
    function getShellIntegrationTooltip(instance, markdown) {
        const shellIntegrationCapabilities = [];
        if (instance.capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            shellIntegrationCapabilities.push(2 /* TerminalCapability.CommandDetection */);
        }
        if (instance.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
            shellIntegrationCapabilities.push(0 /* TerminalCapability.CwdDetection */);
        }
        let shellIntegrationString = '';
        if (shellIntegrationCapabilities.length > 0) {
            shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)('shellIntegration.enabled', "Shell integration activated")}`;
        }
        else {
            if (instance.shellLaunchConfig.ignoreShellIntegration) {
                shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)('launchFailed.exitCodeOnlyShellIntegration', "The terminal process failed to launch. Disabling shell integration with terminal.integrated.shellIntegration.enabled might help.")}`;
            }
            else {
                if (instance.usedShellIntegrationInjection) {
                    shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)('shellIntegration.activationFailed', "Shell integration failed to activate")}`;
                }
            }
        }
        return shellIntegrationString;
    }
    exports.getShellIntegrationTooltip = getShellIntegrationTooltip;
    function getShellProcessTooltip(instance, markdown) {
        const lines = [];
        if (instance.processId) {
            lines.push((0, nls_1.localize)({ key: 'shellProcessTooltip.processId', comment: ['The first arg is "PID" which shouldn\'t be translated'] }, "Process ID ({0}): {1}", 'PID', instance.processId) + '\n');
        }
        if (instance.shellLaunchConfig.executable) {
            let commandLine = instance.shellLaunchConfig.executable;
            const args = (0, arrays_1.asArray)(instance.injectedArgs || instance.shellLaunchConfig.args || []).map(x => `'${x}'`).join(' ');
            if (args) {
                commandLine += ` ${args}`;
            }
            lines.push((0, nls_1.localize)('shellProcessTooltip.commandLine', 'Command line: {0}', commandLine));
        }
        return lines.length ? `${markdown ? '\n\n---\n\n' : '\n\n'}${lines.join('\n')}` : '';
    }
    exports.getShellProcessTooltip = getShellProcessTooltip;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUb29sdGlwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFRvb2x0aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLFNBQWdCLG9CQUFvQixDQUFDLFFBQTJCO1FBQy9ELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUM5QyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUU7WUFDOUIsWUFBWSxJQUFJLGNBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUcsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFO2dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ3JDO1NBQ0Q7UUFFRCxNQUFNLGtCQUFrQixHQUFHLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRSxNQUFNLHNCQUFzQixHQUFHLDBCQUEwQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRSxNQUFNLE9BQU8sR0FBRyxJQUFJLDRCQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxrQkFBa0IsR0FBRyxzQkFBc0IsR0FBRyxZQUFZLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRTdJLE9BQU8sRUFBRSxPQUFP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