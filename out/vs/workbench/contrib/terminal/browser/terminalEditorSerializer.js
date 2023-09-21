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
    exports.TerminalInputSerializer = void 0;
    let TerminalInputSerializer = class TerminalInputSerializer {
        constructor(_terminalEditorService) {
            this._terminalEditorService = _terminalEditorService;
        }
        canSerialize(editorInput) {
            return !!editorInput.terminalInstance?.persistentProcessId;
        }
        serialize(editorInput) {
            if (!editorInput.terminalInstance?.persistentProcessId || !editorInput.terminalInstance.shouldPersist) {
                return;
            }
            const term = JSON.stringify(this._toJson(editorInput.terminalInstance));
            return term;
        }
        deserialize(instantiationService, serializedEditorInput) {
            const terminalInstance = JSON.parse(serializedEditorInput);
            return this._terminalEditorService.reviveInput(terminalInstance);
        }
        _toJson(instance) {
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
    exports.TerminalInputSerializer = TerminalInputSerializer;
    exports.TerminalInputSerializer = TerminalInputSerializer = __decorate([
        __param(0, terminal_1.ITerminalEditorService)
    ], TerminalInputSerializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFZGl0b3JTZXJpYWxpemVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbEVkaXRvclNlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBUXpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO1FBQ25DLFlBQzBDLHNCQUE4QztZQUE5QywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQ3BGLENBQUM7UUFFRSxZQUFZLENBQUMsV0FBZ0M7WUFDbkQsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLG1CQUFtQixDQUFDO1FBQzVELENBQUM7UUFFTSxTQUFTLENBQUMsV0FBZ0M7WUFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3RHLE9BQU87YUFDUDtZQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLFdBQVcsQ0FBQyxvQkFBMkMsRUFBRSxxQkFBNkI7WUFDNUYsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDM0QsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVPLE9BQU8sQ0FBQyxRQUEyQjtZQUMxQyxPQUFPO2dCQUNOLEVBQUUsRUFBRSxRQUFRLENBQUMsbUJBQW9CO2dCQUNqQyxHQUFHLEVBQUUsUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDO2dCQUM1QixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7Z0JBQ3JCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztnQkFDakMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO2dCQUNuQixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7Z0JBQ3JCLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxpQkFBaUI7Z0JBQzdDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUI7Z0JBQy9ELFlBQVksRUFBRSxRQUFRLENBQUMsaUJBQWlCLENBQUMsWUFBWTtnQkFDckQsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixDQUFDLHNCQUFzQjtnQkFDekUscUJBQXFCLEVBQUUsUUFBUSxDQUFDLHFCQUFxQjthQUNyRCxDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUE7SUF0Q1ksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFFakMsV0FBQSxpQ0FBc0IsQ0FBQTtPQUZaLHVCQUF1QixDQXNDbkMifQ==