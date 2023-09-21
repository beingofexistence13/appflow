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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/nls", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/base/common/resources"], function (require, exports, lifecycle_1, event_1, nls_1, log_1, workspace_1, environment_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLogService = void 0;
    let TerminalLogService = class TerminalLogService extends lifecycle_1.Disposable {
        get onDidChangeLogLevel() { return this._logger.onDidChangeLogLevel; }
        constructor(_loggerService, workspaceContextService, environmentService) {
            super();
            this._loggerService = _loggerService;
            this._logger = this._loggerService.createLogger((0, resources_1.joinPath)(environmentService.logsHome, 'terminal.log'), { id: 'terminal', name: (0, nls_1.localize)('terminalLoggerName', 'Terminal') });
            this._register(event_1.Event.runAndSubscribe(workspaceContextService.onDidChangeWorkspaceFolders, () => {
                this._workspaceId = workspaceContextService.getWorkspace().id.substring(0, 7);
            }));
        }
        getLevel() { return this._logger.getLevel(); }
        setLevel(level) { this._logger.setLevel(level); }
        flush() { this._logger.flush(); }
        trace(message, ...args) { this._logger.trace(this._formatMessage(message), args); }
        debug(message, ...args) { this._logger.debug(this._formatMessage(message), args); }
        info(message, ...args) { this._logger.info(this._formatMessage(message), args); }
        warn(message, ...args) { this._logger.warn(this._formatMessage(message), args); }
        error(message, ...args) {
            if (message instanceof Error) {
                this._logger.error(this._formatMessage(''), message, args);
                return;
            }
            this._logger.error(this._formatMessage(message), args);
        }
        _formatMessage(message) {
            if (this._logger.getLevel() === log_1.LogLevel.Trace) {
                return `[${this._workspaceId}] ${message}`;
            }
            return message;
        }
    };
    exports.TerminalLogService = TerminalLogService;
    exports.TerminalLogService = TerminalLogService = __decorate([
        __param(0, log_1.ILoggerService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, environment_1.IEnvironmentService)
    ], TerminalLogService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMb2dTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsTG9nU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQVFqRCxJQUFJLG1CQUFtQixLQUFzQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBRXZGLFlBQ2tDLGNBQThCLEVBQ3JDLHVCQUFpRCxFQUN0RCxrQkFBdUM7WUFFNUQsS0FBSyxFQUFFLENBQUM7WUFKeUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBSy9ELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBQSxvQkFBUSxFQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3SyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxlQUFlLENBQUMsdUJBQXVCLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO2dCQUM5RixJQUFJLENBQUMsWUFBWSxHQUFHLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsUUFBUSxLQUFlLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEQsUUFBUSxDQUFDLEtBQWUsSUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsS0FBSyxLQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXZDLEtBQUssQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXLElBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEcsS0FBSyxDQUFDLE9BQWUsRUFBRSxHQUFHLElBQVcsSUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RyxJQUFJLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVyxJQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXLElBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEcsS0FBSyxDQUFDLE9BQXVCLEVBQUUsR0FBRyxJQUFXO1lBQzVDLElBQUksT0FBTyxZQUFZLEtBQUssRUFBRTtnQkFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNELE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVPLGNBQWMsQ0FBQyxPQUFlO1lBQ3JDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxjQUFRLENBQUMsS0FBSyxFQUFFO2dCQUMvQyxPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxPQUFPLEVBQUUsQ0FBQzthQUMzQztZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7S0FDRCxDQUFBO0lBNUNZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBVzVCLFdBQUEsb0JBQWMsQ0FBQTtRQUNkLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSxpQ0FBbUIsQ0FBQTtPQWJULGtCQUFrQixDQTRDOUIifQ==