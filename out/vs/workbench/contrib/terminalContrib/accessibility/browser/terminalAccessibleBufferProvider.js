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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, lifecycle_1, model_1, configuration_1, contextkey_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalAccessibleBufferProvider = void 0;
    let TerminalAccessibleBufferProvider = class TerminalAccessibleBufferProvider extends lifecycle_1.DisposableStore {
        constructor(_instance, _bufferTracker, _modelService, _configurationService, _contextKeyService, _terminalService, configurationService) {
            super();
            this._instance = _instance;
            this._bufferTracker = _bufferTracker;
            this.options = { type: "view" /* AccessibleViewType.View */, language: 'terminal', positionBottom: true };
            this.verbositySettingKey = "accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */;
        }
        onClose() {
            this._instance.focus();
        }
        registerListeners() {
            if (!this._xterm) {
                return;
            }
        }
        provideContent() {
            this._bufferTracker.update();
            return this._bufferTracker.lines.join('\n');
        }
        getSymbols() {
            const commands = this._getCommandsWithEditorLine() ?? [];
            const symbols = [];
            for (const command of commands) {
                const label = command.command.command;
                if (label) {
                    symbols.push({
                        label,
                        lineNumber: command.lineNumber
                    });
                }
            }
            return symbols;
        }
        _getCommandsWithEditorLine() {
            const capability = this._instance.capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const commands = capability?.commands;
            const currentCommand = capability?.currentCommand;
            if (!commands?.length) {
                return;
            }
            const result = [];
            for (const command of commands) {
                const lineNumber = this._getEditorLineForCommand(command);
                if (lineNumber === undefined) {
                    continue;
                }
                result.push({ command, lineNumber });
            }
            if (currentCommand) {
                const lineNumber = this._getEditorLineForCommand(currentCommand);
                if (lineNumber !== undefined) {
                    result.push({ command: currentCommand, lineNumber });
                }
            }
            return result;
        }
        _getEditorLineForCommand(command) {
            let line;
            if ('marker' in command) {
                line = command.marker?.line;
            }
            else if ('commandStartMarker' in command) {
                line = command.commandStartMarker?.line;
            }
            if (line === undefined || line < 0) {
                return;
            }
            line = this._bufferTracker.bufferToEditorLineMapping.get(line);
            if (line === undefined) {
                return;
            }
            return line + 1;
        }
    };
    exports.TerminalAccessibleBufferProvider = TerminalAccessibleBufferProvider;
    exports.TerminalAccessibleBufferProvider = TerminalAccessibleBufferProvider = __decorate([
        __param(2, model_1.IModelService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, terminal_1.ITerminalService),
        __param(6, configuration_1.IConfigurationService)
    ], TerminalAccessibleBufferProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxBY2Nlc3NpYmxlQnVmZmVyUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvYWNjZXNzaWJpbGl0eS9icm93c2VyL3Rlcm1pbmFsQWNjZXNzaWJsZUJ1ZmZlclByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLGdDQUFnQyxHQUF0QyxNQUFNLGdDQUFpQyxTQUFRLDJCQUFlO1FBSXBFLFlBQ2tCLFNBQThILEVBQ3ZJLGNBQW9DLEVBQzdCLGFBQTRCLEVBQ3BCLHFCQUE0QyxFQUMvQyxrQkFBc0MsRUFDeEMsZ0JBQWtDLEVBQzdCLG9CQUEyQztZQUVsRSxLQUFLLEVBQUUsQ0FBQztZQVJTLGNBQVMsR0FBVCxTQUFTLENBQXFIO1lBQ3ZJLG1CQUFjLEdBQWQsY0FBYyxDQUFzQjtZQUw3QyxZQUFPLEdBQTJCLEVBQUUsSUFBSSxzQ0FBeUIsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUNoSCx3QkFBbUIscUZBQTRDO1FBWS9ELENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBQ0QsaUJBQWlCO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNqQixPQUFPO2FBQ1A7UUFDRixDQUFDO1FBRUQsY0FBYztZQUNiLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELFVBQVU7WUFDVCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsMEJB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