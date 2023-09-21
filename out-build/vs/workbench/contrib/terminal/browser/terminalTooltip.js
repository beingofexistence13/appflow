/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminalTooltip", "vs/base/common/arrays", "vs/base/common/htmlContent"], function (require, exports, nls_1, arrays_1, htmlContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UVb = exports.$TVb = exports.$SVb = void 0;
    function $SVb(instance) {
        let statusString = '';
        const statuses = instance.statusList.statuses;
        const actions = [];
        for (const status of statuses) {
            statusString += `\n\n---\n\n${status.icon ? `$(${status.icon?.id}) ` : ''}${status.tooltip || status.id}`;
            if (status.hoverActions) {
                actions.push(...status.hoverActions);
            }
        }
        const shellProcessString = $UVb(instance, true);
        const shellIntegrationString = $TVb(instance, true);
        const content = new htmlContent_1.$Xj(instance.title + shellProcessString + shellIntegrationString + statusString, { supportThemeIcons: true });
        return { content, actions };
    }
    exports.$SVb = $SVb;
    function $TVb(instance, markdown) {
        const shellIntegrationCapabilities = [];
        if (instance.capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            shellIntegrationCapabilities.push(2 /* TerminalCapability.CommandDetection */);
        }
        if (instance.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
            shellIntegrationCapabilities.push(0 /* TerminalCapability.CwdDetection */);
        }
        let shellIntegrationString = '';
        if (shellIntegrationCapabilities.length > 0) {
            shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)(0, null)}`;
        }
        else {
            if (instance.shellLaunchConfig.ignoreShellIntegration) {
                shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)(1, null)}`;
            }
            else {
                if (instance.usedShellIntegrationInjection) {
                    shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)(2, null)}`;
                }
            }
        }
        return shellIntegrationString;
    }
    exports.$TVb = $TVb;
    function $UVb(instance, markdown) {
        const lines = [];
        if (instance.processId) {
            lines.push((0, nls_1.localize)(3, null, 'PID', instance.processId) + '\n');
        }
        if (instance.shellLaunchConfig.executable) {
            let commandLine = instance.shellLaunchConfig.executable;
            const args = (0, arrays_1.$1b)(instance.injectedArgs || instance.shellLaunchConfig.args || []).map(x => `'${x}'`).join(' ');
            if (args) {
                commandLine += ` ${args}`;
            }
            lines.push((0, nls_1.localize)(4, null, commandLine));
        }
        return lines.length ? `${markdown ? '\n\n---\n\n' : '\n\n'}${lines.join('\n')}` : '';
    }
    exports.$UVb = $UVb;
});
//# sourceMappingURL=terminalTooltip.js.map