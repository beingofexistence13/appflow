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
define(["require", "exports", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hWb = void 0;
    let $hWb = class $hWb {
        constructor(a) {
            this.a = a;
        }
        canSerialize(editorInput) {
            return !!editorInput.terminalInstance?.persistentProcessId;
        }
        serialize(editorInput) {
            if (!editorInput.terminalInstance?.persistentProcessId || !editorInput.terminalInstance.shouldPersist) {
                return;
            }
            const term = JSON.stringify(this.b(editorInput.terminalInstance));
            return term;
        }
        deserialize(instantiationService, serializedEditorInput) {
            const terminalInstance = JSON.parse(serializedEditorInput);
            return this.a.reviveInput(terminalInstance);
        }
        b(instance) {
            return {
                id: instance.persistentProcessId,
                pid: instance.processId || 0,
                title: instance.title,
                titleSource: instance.titleSource,
                cwd: '',
                icon: instance.icon,
                color: instance.color,
                hasChildProcesses: instance.hasChildProcesses,
                isFeatureTerminal: instance.shellLaunchConfig.isFeatureTerminal,
                hideFromUser: instance.shellLaunchConfig.hideFromUser,
                reconnectionProperties: instance.shellLaunchConfig.reconnectionProperties,
                shellIntegrationNonce: instance.shellIntegrationNonce
            };
        }
    };
    exports.$hWb = $hWb;
    exports.$hWb = $hWb = __decorate([
        __param(0, terminal_1.$Nib)
    ], $hWb);
});
//# sourceMappingURL=terminalEditorSerializer.js.map