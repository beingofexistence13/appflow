/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/contrib/terminal/browser/terminal", "vs/nls", "vs/base/common/codicons", "vs/base/common/severity", "vs/platform/commands/common/commands", "vs/workbench/services/extensions/common/extensions"], function (require, exports, terminal_1, nls_1, codicons_1, severity_1, commands_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentVariableInfoChangesActive = exports.EnvironmentVariableInfoStale = void 0;
    let EnvironmentVariableInfoStale = class EnvironmentVariableInfoStale {
        constructor(_diff, _terminalId, _collection, _terminalService, _extensionService) {
            this._diff = _diff;
            this._terminalId = _terminalId;
            this._collection = _collection;
            this._terminalService = _terminalService;
            this._extensionService = _extensionService;
            this.requiresAction = true;
        }
        _getInfo(scope) {
            const extSet = new Set();
            addExtensionIdentifiers(extSet, this._diff.added.values());
            addExtensionIdentifiers(extSet, this._diff.removed.values());
            addExtensionIdentifiers(extSet, this._diff.changed.values());
            let message = (0, nls_1.localize)('extensionEnvironmentContributionInfoStale', "The following extensions want to relaunch the terminal to contribute to its environment:");
            message += getMergedDescription(this._collection, scope, this._extensionService, extSet);
            return message;
        }
        _getActions() {
            return [{
                    label: (0, nls_1.localize)('relaunchTerminalLabel', "Relaunch terminal"),
                    run: () => this._terminalService.getInstanceFromId(this._terminalId)?.relaunch(),
                    commandId: "workbench.action.terminal.relaunch" /* TerminalCommandId.Relaunch */
                }];
        }
        getStatus(scope) {
            return {
                id: "relaunch-needed" /* TerminalStatus.RelaunchNeeded */,
                severity: severity_1.default.Warning,
                icon: codicons_1.Codicon.warning,
                tooltip: this._getInfo(scope),
                hoverActions: this._getActions()
            };
        }
    };
    exports.EnvironmentVariableInfoStale = EnvironmentVariableInfoStale;
    exports.EnvironmentVariableInfoStale = EnvironmentVariableInfoStale = __decorate([
        __param(3, terminal_1.ITerminalService),
        __param(4, extensions_1.IExtensionService)
    ], EnvironmentVariableInfoStale);
    let EnvironmentVariableInfoChangesActive = class EnvironmentVariableInfoChangesActive {
        constructor(_collection, _commandService, _extensionService) {
            this._collection = _collection;
            this._commandService = _commandService;
            this._extensionService = _extensionService;
            this.requiresAction = false;
        }
        _getInfo(scope) {
            const extSet = new Set();
            addExtensionIdentifiers(extSet, this._collection.getVariableMap(scope).values());
            let message = (0, nls_1.localize)('extensionEnvironmentContributionInfoActive', "The following extensions have contributed to this terminal's environment:");
            message += getMergedDescription(this._collection, scope, this._extensionService, extSet);
            return message;
        }
        _getActions(scope) {
            return [{
                    label: (0, nls_1.localize)('showEnvironmentContributions', "Show environment contributions"),
                    run: () => this._commandService.executeCommand("workbench.action.terminal.showEnvironmentContributions" /* TerminalCommandId.ShowEnvironmentContributions */, scope),
                    commandId: "workbench.action.terminal.showEnvironmentContributions" /* TerminalCommandId.ShowEnvironmentContributions */
                }];
        }
        getStatus(scope) {
            return {
                id: "env-var-info-changes-active" /* TerminalStatus.EnvironmentVariableInfoChangesActive */,
                severity: severity_1.default.Info,
                tooltip: this._getInfo(scope),
                hoverActions: this._getActions(scope)
            };
        }
    };
    exports.EnvironmentVariableInfoChangesActive = EnvironmentVariableInfoChangesActive;
    exports.EnvironmentVariableInfoChangesActive = EnvironmentVariableInfoChangesActive = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, extensions_1.IExtensionService)
    ], EnvironmentVariableInfoChangesActive);
    function getMergedDescription(collection, scope, extensionService, extSet) {
        const message = ['\n'];
        const globalDescriptions = collection.getDescriptionMap(undefined);
        const workspaceDescriptions = collection.getDescriptionMap(scope);
        for (const ext of extSet) {
            const globalDescription = globalDescriptions.get(ext);
            if (globalDescription) {
                message.push(`\n- \`${getExtensionName(ext, extensionService)}\``);
                message.push(`: ${globalDescription}`);
            }
            const workspaceDescription = workspaceDescriptions.get(ext);
            if (workspaceDescription) {
                // Only show '(workspace)' suffix if there is already a description for the extension.
                const workspaceSuffix = globalDescription ? ` (${(0, nls_1.localize)('ScopedEnvironmentContributionInfo', 'workspace')})` : '';
                message.push(`\n- \`${getExtensionName(ext, extensionService)}${workspaceSuffix}\``);
                message.push(`: ${workspaceDescription}`);
            }
            if (!globalDescription && !workspaceDescription) {
                message.push(`\n- \`${getExtensionName(ext, extensionService)}\``);
            }
        }
        return message.join('');
    }
    function addExtensionIdentifiers(extSet, diff) {
        for (const mutators of diff) {
            for (const mutator of mutators) {
                extSet.add(mutator.extensionIdentifier);
            }
        }
    }
    function getExtensionName(id, extensionService) {
        return extensionService.extensions.find(e => e.id === id)?.displayName || id;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRWYXJpYWJsZUluZm8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL2Vudmlyb25tZW50VmFyaWFibGVJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE0QjtRQUd4QyxZQUNrQixLQUErQyxFQUMvQyxXQUFtQixFQUNuQixXQUFpRCxFQUNoRCxnQkFBbUQsRUFDbEQsaUJBQXFEO1lBSnZELFVBQUssR0FBTCxLQUFLLENBQTBDO1lBQy9DLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQ25CLGdCQUFXLEdBQVgsV0FBVyxDQUFzQztZQUMvQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ2pDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFQaEUsbUJBQWMsR0FBRyxJQUFJLENBQUM7UUFTL0IsQ0FBQztRQUVPLFFBQVEsQ0FBQyxLQUEyQztZQUMzRCxNQUFNLE1BQU0sR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN0Qyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUMzRCx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUM3RCx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUU3RCxJQUFJLE9BQU8sR0FBRyxJQUFBLGNBQVEsRUFBQywyQ0FBMkMsRUFBRSwwRkFBMEYsQ0FBQyxDQUFDO1lBQ2hLLE9BQU8sSUFBSSxvQkFBb0IsQ0FB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