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
    exports.TerminalMainContribution = void 0;
    /**
     * The main contribution for the terminal contrib. This contains calls to other components necessary
     * to set up the terminal but don't need to be tracked in the long term (where TerminalService would
     * be more relevant).
     */
    let TerminalMainContribution = class TerminalMainContribution extends lifecycle_1.Disposable {
        constructor(editorResolverService, embedderTerminalService, labelService, terminalService, terminalEditorService, terminalGroupService, terminalInstanceService) {
            super();
            // Register terminal editors
            editorResolverService.registerEditor(`${network_1.Schemas.vscodeTerminal}:/**`, {
                id: terminal_2.terminalEditorId,
                label: terminalStrings_1.terminalStrings.terminal,
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
                        const terminalIdentifier = (0, terminalUri_1.parseTerminalUri)(resource);
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
                            override: terminal_2.terminalEditorId
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
    exports.TerminalMainContribution = TerminalMainContribution;
    exports.TerminalMainContribution = TerminalMainContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, embedderTerminalService_1.IEmbedderTerminalService),
        __param(2, label_1.ILabelService),
        __param(3, terminal_2.ITerminalService),
        __param(4, terminal_2.ITerminalEditorService),
        __param(5, terminal_2.ITerminalGroupService),
        __param(6, terminal_2.ITerminalInstanceService)
    ], TerminalMainContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxNYWluQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbE1haW5Db250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYWhHOzs7O09BSUc7SUFDSSxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLHNCQUFVO1FBQ3ZELFlBQ3lCLHFCQUE2QyxFQUMzQyx1QkFBaUQsRUFDNUQsWUFBMkIsRUFDeEIsZUFBaUMsRUFDM0IscUJBQTZDLEVBQzlDLG9CQUEyQyxFQUN4Qyx1QkFBaUQ7WUFFM0UsS0FBSyxFQUFFLENBQUM7WUFFUiw0QkFBNEI7WUFDNUIscUJBQXFCLENBQUMsY0FBYyxDQUNuQyxHQUFHLGlCQUFPLENBQUMsY0FBYyxNQUFNLEVBQy9CO2dCQUNDLEVBQUUsRUFBRSwyQkFBZ0I7Z0JBQ3BCLEtBQUssRUFBRSxpQ0FBZSxDQUFDLFFBQVE7Z0JBQy9CLFFBQVEsRUFBRSxnREFBd0IsQ0FBQyxTQUFTO2FBQzVDLEVBQ0Q7Z0JBQ0Msa0JBQWtCLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsY0FBYztnQkFDaEUsaUJBQWlCLEVBQUUsSUFBSTthQUN2QixFQUNEO2dCQUNDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO29CQUNsRCxJQUFJLFFBQVEsR0FBRyxlQUFlLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2pFLElBQUksUUFBUSxFQUFFO3dCQUNiLE1BQU0sV0FBVyxHQUFHLG9CQUFvQixDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN2RSxXQUFXLEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUN0Qzt5QkFBTSxFQUFFLG1DQUFtQzt3QkFDM0MsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLDhCQUFnQixFQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN0RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFOzRCQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7eUJBQzFEO3dCQUVELE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO3dCQUMzRCxJQUFJLENBQUMsY0FBYyxFQUFFOzRCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7eUJBQy9DO3dCQUVELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxjQUFjLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUMxSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7NEJBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzt5QkFDNUQ7d0JBQ0QsUUFBUSxHQUFHLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxFQUFFLHVCQUF1QixFQUFFLEVBQUUsMkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3hHO29CQUVELE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN6RSxNQUFNLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUM1RSxPQUFPO3dCQUNOLE1BQU07d0JBQ04sT0FBTyxFQUFFOzRCQUNSLEdBQUcsT0FBTzs0QkFDVixNQUFNLEVBQUUsSUFBSTs0QkFDWixXQUFXLEVBQUUsSUFBSTs0QkFDakIsUUFBUSxFQUFFLDJCQUFnQjt5QkFDMUI7cUJBQ0QsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FDRCxDQUFDO1lBRUYsa0RBQWtEO1lBQ2xELFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDOUIsTUFBTSxFQUFFLGlCQUFPLENBQUMsY0FBYztnQkFDOUIsVUFBVSxFQUFFO29CQUNYLEtBQUssRUFBRSxTQUFTO29CQUNoQixTQUFTLEVBQUUsRUFBRTtpQkFDYjthQUNELENBQUMsQ0FBQztZQUVILHVCQUF1QixDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBQyxnQkFBZ0IsRUFBQyxFQUFFO2dCQUNwRSxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQWUsQ0FBQyxjQUFjLENBQUM7b0JBQ3JELE1BQU0sRUFBRSxnQkFBZ0I7b0JBQ3hCLFFBQVEsRUFBRSwyQkFBZ0IsQ0FBQyxLQUFLO2lCQUNoQyxDQUFDLENBQUM7Z0JBQ0gsZUFBZSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUFqRlksNERBQXdCO3VDQUF4Qix3QkFBd0I7UUFFbEMsV0FBQSw4Q0FBc0IsQ0FBQTtRQUN0QixXQUFBLGtEQUF3QixDQUFBO1FBQ3hCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSxpQ0FBc0IsQ0FBQTtRQUN0QixXQUFBLGdDQUFxQixDQUFBO1FBQ3JCLFdBQUEsbUNBQXdCLENBQUE7T0FSZCx3QkFBd0IsQ0FpRnBDIn0=