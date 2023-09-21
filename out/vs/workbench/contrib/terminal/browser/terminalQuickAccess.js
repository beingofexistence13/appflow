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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/filters", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/commands/common/commands", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/platform/terminal/common/terminal", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, pickerQuickAccess_1, filters_1, terminal_1, commands_1, themeService_1, themables_1, terminalIcons_1, terminalIcon_1, terminalStrings_1, terminal_2, editorService_1, instantiation_1) {
    "use strict";
    var TerminalQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalQuickAccessProvider = void 0;
    let terminalPicks = [];
    let TerminalQuickAccessProvider = class TerminalQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { TerminalQuickAccessProvider_1 = this; }
        static { this.PREFIX = 'term '; }
        constructor(_editorService, _terminalService, _terminalEditorService, _terminalGroupService, _commandService, _themeService, _instantiationService) {
            super(TerminalQuickAccessProvider_1.PREFIX, { canAcceptInBackground: true });
            this._editorService = _editorService;
            this._terminalService = _terminalService;
            this._terminalEditorService = _terminalEditorService;
            this._terminalGroupService = _terminalGroupService;
            this._commandService = _commandService;
            this._themeService = _themeService;
            this._instantiationService = _instantiationService;
        }
        _getPicks(filter) {
            terminalPicks = [];
            terminalPicks.push({ type: 'separator', label: 'panel' });
            const terminalGroups = this._terminalGroupService.groups;
            for (let groupIndex = 0; groupIndex < terminalGroups.length; groupIndex++) {
                const terminalGroup = terminalGroups[groupIndex];
                for (let terminalIndex = 0; terminalIndex < terminalGroup.terminalInstances.length; terminalIndex++) {
                    const terminal = terminalGroup.terminalInstances[terminalIndex];
                    const pick = this._createPick(terminal, terminalIndex, filter, { groupIndex, groupSize: terminalGroup.terminalInstances.length });
                    if (pick) {
                        terminalPicks.push(pick);
                    }
                }
            }
            if (terminalPicks.length > 0) {
                terminalPicks.push({ type: 'separator', label: 'editor' });
            }
            const terminalEditors = this._terminalEditorService.instances;
            for (let editorIndex = 0; editorIndex < terminalEditors.length; editorIndex++) {
                const term = terminalEditors[editorIndex];
                term.target = terminal_2.TerminalLocation.Editor;
                const pick = this._createPick(term, editorIndex, filter);
                if (pick) {
                    terminalPicks.push(pick);
                }
            }
            if (terminalPicks.length > 0) {
                terminalPicks.push({ type: 'separator' });
            }
            const createTerminalLabel = (0, nls_1.localize)("workbench.action.terminal.newplus", "Create New Terminal");
            terminalPicks.push({
                label: `$(plus) ${createTerminalLabel}`,
                ariaLabel: createTerminalLabel,
                accept: () => this._commandService.executeCommand("workbench.action.terminal.new" /* TerminalCommandId.New */)
            });
            const createWithProfileLabel = (0, nls_1.localize)("workbench.action.terminal.newWithProfilePlus", "Create New Terminal With Profile");
            terminalPicks.push({
                label: `$(plus) ${createWithProfileLabel}`,
                ariaLabel: createWithProfileLabel,
                accept: () => this._commandService.executeCommand("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */)
            });
            return terminalPicks;
        }
        _createPick(terminal, terminalIndex, filter, groupInfo) {
            const iconId = this._instantiationService.invokeFunction(terminalIcon_1.getIconId, terminal);
            const index = groupInfo
                ? (groupInfo.groupSize > 1
                    ? `${groupInfo.groupIndex + 1}.${terminalIndex + 1}`
                    : `${groupInfo.groupIndex + 1}`)
                : `${terminalIndex + 1}`;
            const label = `$(${iconId}) ${index}: ${terminal.title}`;
            const iconClasses = [];
            const colorClass = (0, terminalIcon_1.getColorClass)(terminal);
            if (colorClass) {
                iconClasses.push(colorClass);
            }
            const uriClasses = (0, terminalIcon_1.getUriClasses)(terminal, this._themeService.getColorTheme().type);
            if (uriClasses) {
                iconClasses.push(...uriClasses);
            }
            const highlights = (0, filters_1.matchesFuzzy)(filter, label, true);
            if (highlights) {
                return {
                    label,
                    description: terminal.description,
                    highlights: { label: highlights },
                    buttons: [
                        {
                            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.renameTerminalIcon),
                            tooltip: (0, nls_1.localize)('renameTerminal', "Rename Terminal")
                        },
                        {
                            iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.killTerminalIcon),
                            tooltip: terminalStrings_1.terminalStrings.kill.value
                        }
                    ],
                    iconClasses,
                    trigger: buttonIndex => {
                        switch (buttonIndex) {
                            case 0:
                                this._commandService.executeCommand("workbench.action.terminal.rename" /* TerminalCommandId.Rename */, terminal);
                                return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                            case 1:
                                this._terminalService.safeDisposeTerminal(terminal);
                                return pickerQuickAccess_1.TriggerAction.REMOVE_ITEM;
                        }
                        return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                    },
                    accept: (keyMod, event) => {
                        if (terminal.target === terminal_2.TerminalLocation.Editor) {
                            const existingEditors = this._editorService.findEditors(terminal.resource);
                            this._terminalEditorService.openEditor(terminal, { viewColumn: existingEditors?.[0].groupId });
                            this._terminalEditorService.setActiveInstance(terminal);
                        }
                        else {
                            this._terminalGroupService.showPanel(!event.inBackground);
                            this._terminalGroupService.setActiveInstance(terminal);
                        }
                    }
                };
            }
            return undefined;
        }
    };
    exports.TerminalQuickAccessProvider = TerminalQuickAccessProvider;
    exports.TerminalQuickAccessProvider = TerminalQuickAccessProvider = TerminalQuickAccessProvider_1 = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, terminal_1.ITerminalEditorService),
        __param(2, terminal_1.ITerminalEditorService),
        __param(3, terminal_1.ITerminalGroupService),
        __param(4, commands_1.ICommandService),
        __param(5, themeService_1.IThemeService),
        __param(6, instantiation_1.IInstantiationService)
    ], TerminalQuickAccessProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBaUJoRyxJQUFJLGFBQWEsR0FBd0QsRUFBRSxDQUFDO0lBRXJFLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsNkNBQWlEOztpQkFFMUYsV0FBTSxHQUFHLE9BQU8sQUFBVixDQUFXO1FBRXhCLFlBQ2tDLGNBQThCLEVBQ3RCLGdCQUFrQyxFQUNsQyxzQkFBOEMsRUFDL0MscUJBQTRDLEVBQ2xELGVBQWdDLEVBQ2xDLGFBQTRCLEVBQ3BCLHFCQUE0QztZQUVwRixLQUFLLENBQUMsNkJBQTJCLENBQUMsTUFBTSxFQUFFLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQVIxQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDdEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNsQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBQy9DLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDbEQsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2xDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ3BCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFHckYsQ0FBQztRQUNTLFNBQVMsQ0FBQyxNQUFjO1lBQ2pDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDbkIsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDMUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQztZQUN6RCxLQUFLLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFDMUUsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRCxLQUFLLElBQUksYUFBYSxHQUFHLENBQUMsRUFBRSxhQUFhLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsRUFBRTtvQkFDcEcsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNoRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDbEksSUFBSSxJQUFJLEVBQUU7d0JBQ1QsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDekI7aUJBQ0Q7YUFDRDtZQUVELElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQztZQUM5RCxLQUFLLElBQUksV0FBVyxHQUFHLENBQUMsRUFBRSxXQUFXLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRTtnQkFDOUUsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxHQUFHLDJCQUFnQixDQUFDLE1BQU0sQ0FBQztnQkFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLElBQUksRUFBRTtvQkFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6QjthQUNEO1lBRUQsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDN0IsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO2FBQzFDO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxJQUFBLGNBQVEsRUFBQyxtQ0FBbUMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2pHLGFBQWEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xCLEtBQUssRUFBRSxXQUFXLG1CQUFtQixFQUFFO2dCQUN2QyxTQUFTLEVBQUUsbUJBQW1CO2dCQUM5QixNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLDZEQUF1QjthQUN4RSxDQUFDLENBQUM7WUFDSCxNQUFNLHNCQUFzQixHQUFHLElBQUEsY0FBUSxFQUFDLDhDQUE4QyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFDNUgsYUFBYSxDQUFDLElBQUksQ0FBQztnQkFDbEIsS0FBSyxFQUFFLFdBQVcsc0JBQXNCLEVBQUU7Z0JBQzFDLFNBQVMsRUFBRSxzQkFBc0I7Z0JBQ2pDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsbUZBQWtDO2FBQ25GLENBQUMsQ0FBQztZQUNILE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFTyxXQUFXLENBQUMsUUFBMkIsRUFBRSxhQUFxQixFQUFFLE1BQWMsRUFBRSxTQUFxRDtZQUM1SSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLHdCQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUUsTUFBTSxLQUFLLEdBQUcsU0FBUztnQkFDdEIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDO29CQUN6QixDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxFQUFFO29CQUNwRCxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsR0FBRyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDMUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxNQUFNLEtBQUssS0FBSyxLQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6RCxNQUFNLFdBQVcsR0FBYSxFQUFFLENBQUM7WUFDakMsTUFBTSxVQUFVLEdBQUcsSUFBQSw0QkFBYSxFQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLElBQUksVUFBVSxFQUFFO2dCQUNmLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDN0I7WUFDRCxNQUFNLFVBQVUsR0FBRyxJQUFBLDRCQUFhLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEYsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO2FBQ2hDO1lBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBQSxzQkFBWSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsT0FBTztvQkFDTixLQUFLO29CQUNMLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztvQkFDakMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRTtvQkFDakMsT0FBTyxFQUFFO3dCQUNSOzRCQUNDLFNBQVMsRUFBRSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxrQ0FBa0IsQ0FBQzs0QkFDcEQsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDO3lCQUN0RDt3QkFDRDs0QkFDQyxTQUFTLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsZ0NBQWdCLENBQUM7NEJBQ2xELE9BQU8sRUFBRSxpQ0FBZSxDQUFDLElBQUksQ0FBQyxLQUFLO3lCQUNuQztxQkFDRDtvQkFDRCxXQUFXO29CQUNYLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRTt3QkFDdEIsUUFBUSxXQUFXLEVBQUU7NEJBQ3BCLEtBQUssQ0FBQztnQ0FDTCxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsb0VBQTJCLFFBQVEsQ0FBQyxDQUFDO2dDQUN4RSxPQUFPLGlDQUFhLENBQUMsU0FBUyxDQUFDOzRCQUNoQyxLQUFLLENBQUM7Z0NBQ0wsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUNwRCxPQUFPLGlDQUFhLENBQUMsV0FBVyxDQUFDO3lCQUNsQzt3QkFFRCxPQUFPLGlDQUFhLENBQUMsU0FBUyxDQUFDO29CQUNoQyxDQUFDO29CQUNELE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTt3QkFDekIsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLDJCQUFnQixDQUFDLE1BQU0sRUFBRTs0QkFDaEQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUMzRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDOzRCQUMvRixJQUFJLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7eUJBQ3hEOzZCQUFNOzRCQUNOLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQzFELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDdkQ7b0JBQ0YsQ0FBQztpQkFDRCxDQUFDO2FBQ0Y7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDOztJQTFIVyxrRUFBMkI7MENBQTNCLDJCQUEyQjtRQUtyQyxXQUFBLDhCQUFjLENBQUE7UUFDZCxXQUFBLGlDQUFzQixDQUFBO1FBQ3RCLFdBQUEsaUNBQXNCLENBQUE7UUFDdEIsV0FBQSxnQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDBCQUFlLENBQUE7UUFDZixXQUFBLDRCQUFhLENBQUE7UUFDYixXQUFBLHFDQUFxQixDQUFBO09BWFgsMkJBQTJCLENBMkh2QyJ9