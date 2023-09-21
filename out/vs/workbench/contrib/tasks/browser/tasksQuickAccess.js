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
define(["require", "exports", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/filters", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/browser/taskQuickPick", "vs/platform/configuration/common/configuration", "vs/base/common/types", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage"], function (require, exports, nls_1, quickInput_1, pickerQuickAccess_1, filters_1, extensions_1, taskService_1, tasks_1, taskQuickPick_1, configuration_1, types_1, notification_1, dialogs_1, themeService_1, storage_1) {
    "use strict";
    var TasksQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TasksQuickAccessProvider = void 0;
    let TasksQuickAccessProvider = class TasksQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { TasksQuickAccessProvider_1 = this; }
        static { this.PREFIX = 'task '; }
        constructor(extensionService, _taskService, _configurationService, _quickInputService, _notificationService, _dialogService, _themeService, _storageService) {
            super(TasksQuickAccessProvider_1.PREFIX, {
                noResultsPick: {
                    label: (0, nls_1.localize)('noTaskResults', "No matching tasks")
                }
            });
            this._taskService = _taskService;
            this._configurationService = _configurationService;
            this._quickInputService = _quickInputService;
            this._notificationService = _notificationService;
            this._dialogService = _dialogService;
            this._themeService = _themeService;
            this._storageService = _storageService;
        }
        async _getPicks(filter, disposables, token) {
            if (token.isCancellationRequested) {
                return [];
            }
            const taskQuickPick = new taskQuickPick_1.TaskQuickPick(this._taskService, this._configurationService, this._quickInputService, this._notificationService, this._themeService, this._dialogService, this._storageService);
            const topLevelPicks = await taskQuickPick.getTopLevelEntries();
            const taskPicks = [];
            for (const entry of topLevelPicks.entries) {
                const highlights = (0, filters_1.matchesFuzzy)(filter, entry.label);
                if (!highlights) {
                    continue;
                }
                if (entry.type === 'separator') {
                    taskPicks.push(entry);
                }
                const task = entry.task;
                const quickAccessEntry = entry;
                quickAccessEntry.highlights = { label: highlights };
                quickAccessEntry.trigger = (index) => {
                    if ((index === 1) && (quickAccessEntry.buttons?.length === 2)) {
                        const key = (task && !(0, types_1.isString)(task)) ? task.getRecentlyUsedKey() : undefined;
                        if (key) {
                            this._taskService.removeRecentlyUsedTask(key);
                        }
                        return pickerQuickAccess_1.TriggerAction.REFRESH_PICKER;
                    }
                    else {
                        if (tasks_1.ContributedTask.is(task)) {
                            this._taskService.customize(task, undefined, true);
                        }
                        else if (tasks_1.CustomTask.is(task)) {
                            this._taskService.openConfig(task);
                        }
                        return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                    }
                };
                quickAccessEntry.accept = async () => {
                    if ((0, types_1.isString)(task)) {
                        // switch to quick pick and show second level
                        const showResult = await taskQuickPick.show((0, nls_1.localize)('TaskService.pickRunTask', 'Select the task to run'), undefined, task);
                        if (showResult) {
                            this._taskService.run(showResult, { attachProblemMatcher: true });
                        }
                    }
                    else {
                        this._taskService.run(await this._toTask(task), { attachProblemMatcher: true });
                    }
                };
                taskPicks.push(quickAccessEntry);
            }
            return taskPicks;
        }
        async _toTask(task) {
            if (!tasks_1.ConfiguringTask.is(task)) {
                return task;
            }
            return this._taskService.tryResolveTask(task);
        }
    };
    exports.TasksQuickAccessProvider = TasksQuickAccessProvider;
    exports.TasksQuickAccessProvider = TasksQuickAccessProvider = TasksQuickAccessProvider_1 = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, taskService_1.ITaskService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, notification_1.INotificationService),
        __param(5, dialogs_1.IDialogService),
        __param(6, themeService_1.IThemeService),
        __param(7, storage_1.IStorageService)
    ], TasksQuickAccessProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3NRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2Jyb3dzZXIvdGFza3NRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLDZDQUFpRDs7aUJBRXZGLFdBQU0sR0FBRyxPQUFPLEFBQVYsQ0FBVztRQUV4QixZQUNvQixnQkFBbUMsRUFDaEMsWUFBMEIsRUFDakIscUJBQTRDLEVBQy9DLGtCQUFzQyxFQUNwQyxvQkFBMEMsRUFDaEQsY0FBOEIsRUFDL0IsYUFBNEIsRUFDMUIsZUFBZ0M7WUFFekQsS0FBSyxDQUFDLDBCQUF3QixDQUFDLE1BQU0sRUFBRTtnQkFDdEMsYUFBYSxFQUFFO29CQUNkLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsbUJBQW1CLENBQUM7aUJBQ3JEO2FBQ0QsQ0FBQyxDQUFDO1lBWm1CLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDL0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNwQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUMvQixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUMxQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFPMUQsQ0FBQztRQUVTLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBYyxFQUFFLFdBQTRCLEVBQUUsS0FBd0I7WUFDL0YsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ2xDLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsSUFBSSxDQUFD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