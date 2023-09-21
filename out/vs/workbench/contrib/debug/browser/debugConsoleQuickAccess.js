var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/filters", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/common/debug"], function (require, exports, filters_1, nls_1, commands_1, pickerQuickAccess_1, views_1, debugCommands_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugConsoleQuickAccess = void 0;
    let DebugConsoleQuickAccess = class DebugConsoleQuickAccess extends pickerQuickAccess_1.PickerQuickAccessProvider {
        constructor(_debugService, _viewsService, _commandService) {
            super(debugCommands_1.DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, { canAcceptInBackground: true });
            this._debugService = _debugService;
            this._viewsService = _viewsService;
            this._commandService = _commandService;
        }
        _getPicks(filter, disposables, token) {
            const debugConsolePicks = [];
            this._debugService.getModel().getSessions(true).filter(s => s.hasSeparateRepl()).forEach((session, index) => {
                const pick = this._createPick(session, index, filter);
                if (pick) {
                    debugConsolePicks.push(pick);
                }
            });
            if (debugConsolePicks.length > 0) {
                debugConsolePicks.push({ type: 'separator' });
            }
            const createTerminalLabel = (0, nls_1.localize)("workbench.action.debug.startDebug", "Start a New Debug Session");
            debugConsolePicks.push({
                label: `$(plus) ${createTerminalLabel}`,
                ariaLabel: createTerminalLabel,
                accept: () => this._commandService.executeCommand(debugCommands_1.SELECT_AND_START_ID)
            });
            return debugConsolePicks;
        }
        _createPick(session, sessionIndex, filter) {
            const label = session.name;
            const highlights = (0, filters_1.matchesFuzzy)(filter, label, true);
            if (highlights) {
                return {
                    label,
                    highlights: { label: highlights },
                    accept: (keyMod, event) => {
                        this._debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
                        if (!this._viewsService.isViewVisible(debug_1.REPL_VIEW_ID)) {
                            this._viewsService.openView(debug_1.REPL_VIEW_ID, true);
                        }
                    }
                };
            }
            return undefined;
        }
    };
    exports.DebugConsoleQuickAccess = DebugConsoleQuickAccess;
    exports.DebugConsoleQuickAccess = DebugConsoleQuickAccess = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, views_1.IViewsService),
        __param(2, commands_1.ICommandService)
    ], DebugConsoleQuickAccess);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb25zb2xlUXVpY2tBY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnQ29uc29sZVF1aWNrQWNjZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFlTyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLDZDQUFpRDtRQUU3RixZQUNpQyxhQUE0QixFQUM1QixhQUE0QixFQUMxQixlQUFnQztZQUVsRSxLQUFLLENBQUMsaURBQWlDLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBSjFDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQzVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQzFCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUduRSxDQUFDO1FBRVMsU0FBUyxDQUFDLE1BQWMsRUFBRSxXQUE0QixFQUFFLEtBQXdCO1lBQ3pGLE1BQU0saUJBQWlCLEdBQXdELEVBQUUsQ0FBQztZQUVsRixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzNHLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM3QjtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBR0gsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNqQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQzthQUM5QztZQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBQSxjQUFRLEVBQUMsbUNBQW1DLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztZQUN2RyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLEtBQUssRUFBRSxXQUFXLG1CQUFtQixFQUFFO2dCQUN2QyxTQUFTLEVBQUUsbUJBQW1CO2dCQUM5QixNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsbUNBQW1CLENBQUM7YUFDdEUsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxpQkFBaUIsQ0FBQztRQUMxQixDQUFDO1FBRU8sV0FBVyxDQUFDLE9BQXNCLEVBQUUsWUFBb0IsRUFBRSxNQUFjO1lBQy9FLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFFM0IsTUFBTSxVQUFVLEdBQUcsSUFBQSxzQkFBWSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsT0FBTztvQkFDTixLQUFLO29CQUNMLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUU7b0JBQ2pDLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTt3QkFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDdEYsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLG9CQUFZLENBQUMsRUFBRTs0QkFDcEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsb0JBQVksRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDaEQ7b0JBQ0YsQ0FBQztpQkFDRCxDQUFDO2FBQ0Y7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0tBQ0QsQ0FBQTtJQXBEWSwwREFBdUI7c0NBQXZCLHVCQUF1QjtRQUdqQyxXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLDBCQUFlLENBQUE7T0FMTCx1QkFBdUIsQ0FvRG5DIn0=