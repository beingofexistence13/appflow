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
define(["require", "exports", "vs/workbench/contrib/terminal/browser/terminal", "vs/nls!vs/workbench/contrib/terminal/browser/environmentVariableInfo", "vs/base/common/codicons", "vs/base/common/severity", "vs/platform/commands/common/commands", "vs/workbench/services/extensions/common/extensions"], function (require, exports, terminal_1, nls_1, codicons_1, severity_1, commands_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6Vb = exports.$5Vb = void 0;
    let $5Vb = class $5Vb {
        constructor(a, b, c, d, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.requiresAction = true;
        }
        g(scope) {
            const extSet = new Set();
            addExtensionIdentifiers(extSet, this.a.added.values());
            addExtensionIdentifiers(extSet, this.a.removed.values());
            addExtensionIdentifiers(extSet, this.a.changed.values());
            let message = (0, nls_1.localize)(0, null);
            message += getMergedDescription(this.c, scope, this.f, extSet);
            return message;
        }
        h() {
            return [{
                    label: (0, nls_1.localize)(1, null),
                    run: () => this.d.getInstanceFromId(this.b)?.relaunch(),
                    commandId: "workbench.action.terminal.relaunch" /* TerminalCommandId.Relaunch */
                }];
        }
        getStatus(scope) {
            return {
                id: "relaunch-needed" /* TerminalStatus.RelaunchNeeded */,
                severity: severity_1.default.Warning,
                icon: codicons_1.$Pj.warning,
                tooltip: this.g(scope),
                hoverActions: this.h()
            };
        }
    };
    exports.$5Vb = $5Vb;
    exports.$5Vb = $5Vb = __decorate([
        __param(3, terminal_1.$Mib),
        __param(4, extensions_1.$MF)
    ], $5Vb);
    let $6Vb = class $6Vb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.requiresAction = false;
        }
        d(scope) {
            const extSet = new Set();
            addExtensionIdentifiers(extSet, this.a.getVariableMap(scope).values());
            let message = (0, nls_1.localize)(2, null);
            message += getMergedDescription(this.a, scope, this.c, extSet);
            return message;
        }
        f(scope) {
            return [{
                    label: (0, nls_1.localize)(3, null),
                    run: () => this.b.executeCommand("workbench.action.terminal.showEnvironmentContributions" /* TerminalCommandId.ShowEnvironmentContributions */, scope),
                    commandId: "workbench.action.terminal.showEnvironmentContributions" /* TerminalCommandId.ShowEnvironmentContributions */
                }];
        }
        getStatus(scope) {
            return {
                id: "env-var-info-changes-active" /* TerminalStatus.EnvironmentVariableInfoChangesActive */,
                severity: severity_1.default.Info,
                tooltip: this.d(scope),
                hoverActions: this.f(scope)
            };
        }
    };
    exports.$6Vb = $6Vb;
    exports.$6Vb = $6Vb = __decorate([
        __param(1, commands_1.$Fr),
        __param(2, extensions_1.$MF)
    ], $6Vb);
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
                const workspaceSuffix = globalDescription ? ` (${(0, nls_1.localize)(4, null)})` : '';
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
//# sourceMappingURL=environmentVariableInfo.js.map