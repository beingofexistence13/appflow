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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/label/common/label", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/terminal/common/embedderTerminalService"], function (require, exports, lifecycle_1, network_1, label_1, terminal_1, terminal_2, terminalUri_1, terminalStrings_1, editorResolverService_1, embedderTerminalService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qWb = void 0;
    /**
     * The main contribution for the terminal contrib. This contains calls to other components necessary
     * to set up the terminal but don't need to be tracked in the long term (where TerminalService would
     * be more relevant).
     */
    let $qWb = class $qWb extends lifecycle_1.$kc {
        constructor(editorResolverService, embedderTerminalService, labelService, terminalService, terminalEditorService, terminalGroupService, terminalInstanceService) {
            super();
            // Register terminal editors
            editorResolverService.registerEditor(`${network_1.Schemas.vscodeTerminal}:/**`, {
                id: terminal_2.$Sib,
                label: terminalStrings_1.$pVb.terminal,
                priority: editorResolverService_1.RegisteredEditorPriority.exclusive
            }, {
                canSupportResource: uri => uri.scheme === network_1.Schemas.vscodeTerminal,
                singlePerResource: true
            }, {
                createEditorInput: async ({ resource, options }) => {
                    let instance = terminalService.getInstanceFromResource(resource);
                    if (instance) {
                        const sourceGroup = terminalGroupService.getGroupForInstance(instance);
                        sourceGroup?.removeInstance(instance);
                    }
                    else { // Terminal from a different window
                        const terminalIdentifier = (0, terminalUri_1.$OVb)(resource);
                        if (!terminalIdentifier.instanceId) {
                            throw new Error('Terminal identifier without instanceId');
                        }
                        const primaryBackend = terminalService.getPrimaryBackend();
                        if (!primaryBackend) {
                            throw new Error('No terminal primary backend');
                        }
                        const attachPersistentProcess = await primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
                        if (!attachPersistentProcess) {
                            throw new Error('No terminal persistent process to attach');
                        }
                        instance = terminalInstanceService.createInstance({ attachPersistentProcess }, terminal_1.TerminalLocation.Editor);
                    }
                    const resolvedResource = terminalEditorService.resolveResource(instance);
                    const editor = terminalEditorService.getInputFromResource(resolvedResource);
                    return {
                        editor,
                        options: {
                            ...options,
                            pinned: true,
                            forceReload: true,
                            override: terminal_2.$Sib
                        }
                    };
                }
            });
            // Register a resource formatter for terminal URIs
            labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeTerminal,
                formatting: {
                    label: '${path}',
                    separator: ''
                }
            });
            embedderTerminalService.onDidCreateTerminal(async (embedderTerminal) => {
                const terminal = await terminalService.createTerminal({
                    config: embedderTerminal,
                    location: terminal_1.TerminalLocation.Panel
                });
                terminalService.setActiveInstance(terminal);
                await terminalService.revealActiveTerminal();
            });
        }
    };
    exports.$qWb = $qWb;
    exports.$qWb = $qWb = __decorate([
        __param(0, editorResolverService_1.$pbb),
        __param(1, embedderTerminalService_1.$GV),
        __param(2, label_1.$Vz),
        __param(3, terminal_2.$Mib),
        __param(4, terminal_2.$Nib),
        __param(5, terminal_2.$Oib),
        __param(6, terminal_2.$Pib)
    ], $qWb);
});
//# sourceMappingURL=terminalMainContribution.js.map