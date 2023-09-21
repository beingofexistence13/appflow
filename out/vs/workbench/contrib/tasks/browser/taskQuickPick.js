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
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/workbench/contrib/tasks/common/tasks", "vs/base/common/types", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/quickinput/common/quickInput", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/notification/common/notification", "vs/base/common/codicons", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/iconRegistry", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/platform/quickinput/browser/quickPickPin", "vs/platform/storage/common/storage"], function (require, exports, nls, Objects, tasks_1, Types, taskService_1, quickInput_1, configuration_1, lifecycle_1, event_1, notification_1, codicons_1, themeService_1, themables_1, iconRegistry_1, dialogs_1, terminalIcon_1, quickPickPin_1, storage_1) {
    "use strict";
    var TaskQuickPick_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskQuickPick = exports.configureTaskIcon = exports.isWorkspaceFolder = exports.QUICKOPEN_SKIP_CONFIG = exports.QUICKOPEN_DETAIL_CONFIG = void 0;
    exports.QUICKOPEN_DETAIL_CONFIG = 'task.quickOpen.detail';
    exports.QUICKOPEN_SKIP_CONFIG = 'task.quickOpen.skip';
    function isWorkspaceFolder(folder) {
        return 'uri' in folder;
    }
    exports.isWorkspaceFolder = isWorkspaceFolder;
    const SHOW_ALL = nls.localize('taskQuickPick.showAll', "Show All Tasks...");
    exports.configureTaskIcon = (0, iconRegistry_1.registerIcon)('tasks-list-configure', codicons_1.Codicon.gear, nls.localize('configureTaskIcon', 'Configuration icon in the tasks selection list.'));
    const removeTaskIcon = (0, iconRegistry_1.registerIcon)('tasks-remove', codicons_1.Codicon.close, nls.localize('removeTaskIcon', 'Icon for remove in the tasks selection list.'));
    const runTaskStorageKey = 'runTaskStorageKey';
    let TaskQuickPick = TaskQuickPick_1 = class TaskQuickPick extends lifecycle_1.Disposable {
        constructor(_taskService, _configurationService, _quickInputService, _notificationService, _themeService, _dialogService, _storageService) {
            super();
            this._taskService = _taskService;
            this._configurationService = _configurationService;
            this._quickInputService = _quickInputService;
            this._notificationService = _notificationService;
            this._themeService = _themeService;
            this._dialogService = _dialogService;
            this._storageService = _storageService;
            this._sorter = this._taskService.createSorter();
        }
        _showDetail() {
            // Ensure invalid values get converted into boolean values
            return !!this._configurationService.getValue(exports.QUICKOPEN_DETAIL_CONFIG);
        }
        _guessTaskLabel(task) {
            if (task._label) {
                return task._label;
            }
            if (tasks_1.ConfiguringTask.is(task)) {
                let label = task.configures.type;
                const configures = Objects.deepClone(task.configures);
                delete configures['_key'];
                delete configures['type'];
                Object.keys(configures).forEach(key => label += `: ${configures[key]}`);
                return label;
            }
            return '';
        }
        static getTaskLabelWithIcon(task, labelGuess) {
            const label = labelGuess || task._label;
            const icon = task.configurationProperties.icon;
            if (!icon) {
                return `${label}`;
            }
            return icon.id ? `$(${icon.id}) ${label}` : `$(${codicons_1.Codicon.tools.id}) ${label}`;
        }
        static applyColorStyles(task, entry, themeService) {
            if (task.configurationProperties.icon?.color) {
                const colorTheme = themeService.getColorTheme();
                const styleElement = (0, terminalIcon_1.getColorStyleElement)(colorTheme);
                entry.iconClasses = [(0, terminalIcon_1.getColorClass)(task.configurationProperties.icon.color)];
                document.body.appendChild(styleElement);
            }
        }
        _createTaskEntry(task, extraButtons = []) {
            const buttons = [
                { iconClass: themables_1.ThemeIcon.asClassName(exports.configureTaskIcon), tooltip: nls.localize('configureTask', "Configure Task") },
                ...extraButtons
            ];
            const entry = { label: TaskQuickPick_1.getTaskLabelWithIcon(task, this._guessTaskLabel(task)), description: this._taskService.getTaskDescription(task), task, detail: this._showDetail() ? task.configurationProperties.detail : undefined, buttons };
            TaskQuickPick_1.applyColorStyles(task, entry, this._themeService);
            return entry;
        }
        _createEntriesForGroup(entries, tasks, groupLabel, extraButtons = []) {
            entries.push({ type: 'separator', label: groupLabel });
            tasks.forEach(task => {
                if (!task.configurationProperties.hide) {
                    entries.push(this._createTaskEntry(task, extraButtons));
                }
            });
        }
        _createTypeEntries(entries, types) {
            entries.push({ type: 'separator', label: nls.localize('contributedTasks', "contributed") });
            types.forEach(type => {
                entries.push({ label: `$(folder) ${type}`, task: type, ariaLabel: nls.localize('taskType', "All {0} tasks", type) });
            });
            entries.push({ label: SHOW_ALL, task: SHOW_ALL, alwaysShow: true });
        }
        _handleFolderTaskResult(result) {
            const tasks = [];
            Array.from(result).forEach(([key, folderTasks]) => {
                if (folderTasks.set) {
                    tasks.push(...folderTasks.set.tasks);
                }
                if (folderTasks.configurations) {
                    for (const configuration in folderTasks.configurations.byIdentifier) {
                        tasks.push(folderTasks.configurations.byIdentifier[configuration]);
                    }
                }
            });
            return tasks;
        }
        _dedupeConfiguredAndRecent(recentTasks, configuredTasks) {
            let dedupedConfiguredTasks = [];
            const foundRecentTasks = Array(recentTasks.length).fill(false);
            for (let j = 0; j < configuredTasks.length; j++) {
                const workspaceFolder = configuredTasks[j].getWorkspaceFolder()?.uri.toString();
                const definition = configuredTasks[j].getDefinition()?._key;
                const type = configuredTasks[j].type;
                const label = configuredTasks[j]._label;
                const recentKey = configuredTasks[j].getRecentlyUsedKey();
                const findIndex = recentTasks.findIndex((value) => {
                    return (workspaceFolder && definition && value.getWorkspaceFolder()?.uri.toString() === workspaceFolder
                        && ((value.getDefinition()?._key === definition) || (value.type === type && value._label === label)))
                        || (recentKey && value.getRecentlyUsedKey() === recentKey);
                });
                if (findIndex === -1) {
                    dedupedConfiguredTasks.push(configuredTasks[j]);
                }
                else {
                    recentTasks[findIndex] = configuredTasks[j];
                    foundRecentTasks[findIndex] = true;
                }
            }
            dedupedConfiguredTasks = dedupedConfiguredTasks.sort((a, b) => this._sorter.compare(a, b));
            const prunedRecentTasks = [];
            for (let i = 0; i < recentTasks.length; i++) {
                if (foundRecentTasks[i] || tasks_1.ConfiguringTask.is(recentTasks[i])) {
                    prunedRecentTasks.push(recentTasks[i]);
                }
            }
            return { configuredTasks: dedupedConfiguredTasks, recentTasks: prunedRecentTasks };
        }
        async getTopLevelEntries(defaultEntry) {
            if (this._topLevelEntries !== undefined) {
                return { entries: this._topLevelEntries };
            }
            let recentTasks = (await this._taskService.getSavedTasks('historical')).reverse();
            const configuredTasks = this._handleFolderTaskResult(await this._taskService.getWorkspaceTasks());
            const extensionTaskTypes = this._taskService.taskTypes();
            this._topLevelEntries = [];
            // Dedupe will update recent tasks if they've changed in tasks.json.
            const dedupeAndPrune = this._dedupeConfiguredAndRecent(recentTasks, configuredTasks);
            const dedupedConfiguredTasks = dedupeAndPrune.configuredTasks;
            recentTasks = dedupeAndPrune.recentTasks;
            if (recentTasks.length > 0) {
                const removeRecentButton = {
                    iconClass: themables_1.ThemeIcon.asClassName(removeTaskIcon),
                    tooltip: nls.localize('removeRecent', 'Remove Recently Used Task')
                };
                this._createEntriesForGroup(this._topLevelEntries, recentTasks, nls.localize('recentlyUsed', 'recently used'), [removeRecentButton]);
            }
            if (configuredTasks.length > 0) {
                if (dedupedConfiguredTasks.length > 0) {
                    this._createEntriesForGroup(this._topLevelEntries, dedupedConfiguredTasks, nls.localize('configured', 'configured'));
                }
            }
            if (defaultEntry && (configuredTasks.length === 0)) {
                this._topLevelEntries.push({ type: 'separator', label: nls.localize('configured', 'configured') });
                this._topLevelEntries.push(defaultEntry);
            }
            if (extensionTaskTypes.length > 0) {
                this._createTypeEntries(this._topLevelEntries, extensionTaskTypes);
            }
            return { entries: this._topLevelEntries, isSingleConfigured: configuredTasks.length === 1 ? configuredTasks[0] : undefined };
        }
        async handleSettingOption(selectedType) {
            const { confirmed } = await this._dialogService.confirm({
                type: notification_1.Severity.Warning,
                message: nls.localize('TaskQuickPick.changeSettingDetails', "Task detection for {0} tasks causes files in any workspace you open to be run as code. Enabling {0} task detection is a user setting and will apply to any workspace you open. \n\n Do you want to enable {0} task detection for all workspaces?", selectedType),
                cancelButton: nls.localize('TaskQuickPick.changeSettingNo', "No")
            });
            if (confirmed) {
                await this._configurationService.updateValue(`${selectedType}.autoDetect`, 'on');
                await new Promise(resolve => setTimeout(() => resolve(), 100));
                return this.show(nls.localize('TaskService.pickRunTask', 'Select the task to run'), undefined, selectedType);
            }
            return undefined;
        }
        async show(placeHolder, defaultEntry, startAtType, name) {
            const picker = this._quickInputService.createQuickPick();
            picker.placeholder = placeHolder;
            picker.matchOnDescription = true;
            picker.ignoreFocusOut = false;
            picker.onDidTriggerItemButton(async (context) => {
                const task = context.item.task;
                if (context.button.iconClass === themables_1.ThemeIcon.asClassName(removeTaskIcon)) {
                    const key = (task && !Types.isString(task)) ? task.getRecentlyUsedKey() : undefined;
                    if (key) {
                        this._taskService.removeRecentlyUsedTask(key);
                    }
                    const indexToRemove = picker.items.indexOf(context.item);
                    if (indexToRemove >= 0) {
                        picker.items = [...picker.items.slice(0, indexToRemove), ...picker.items.slice(indexToRemove + 1)];
                    }
                }
                else if (context.button.iconClass === themables_1.ThemeIcon.asClassName(exports.configureTaskIcon)) {
                    this._quickInputService.cancel();
                    if (tasks_1.ContributedTask.is(task)) {
                        this._taskService.customize(task, undefined, true);
                    }
                    else if (tasks_1.CustomTask.is(task) || tasks_1.ConfiguringTask.is(task)) {
                        let canOpenConfig = false;
                        try {
                            canOpenConfig = await this._taskService.openConfig(task);
                        }
                        catch (e) {
                            // do nothing.
                        }
                        if (!canOpenConfig) {
                            this._taskService.customize(task, undefined, true);
                        }
                    }
                }
            });
            if (name) {
                picker.value = name;
            }
            let firstLevelTask = startAtType;
            if (!firstLevelTask) {
                // First show recent tasks configured tasks. Other tasks will be available at a second level
                const topLevelEntriesResult = await this.getTopLevelEntries(defaultEntry);
                if (topLevelEntriesResult.isSingleConfigured && this._configurationService.getValue(exports.QUICKOPEN_SKIP_CONFIG)) {
                    picker.dispose();
                    return this._toTask(topLevelEntriesResult.isSingleConfigured);
                }
                const taskQuickPickEntries = topLevelEntriesResult.entries;
                firstLevelTask = await this._doPickerFirstLevel(picker, taskQuickPickEntries);
            }
            do {
                if (Types.isString(firstLevelTask)) {
                    if (name) {
                        await this._doPickerFirstLevel(picker, (await this.getTopLevelEntries(defaultEntry)).entries);
                        picker.dispose();
                        return undefined;
                    }
                    const selectedEntry = await this.doPickerSecondLevel(picker, firstLevelTask);
                    // Proceed to second level of quick pick
                    if (selectedEntry && !selectedEntry.settingType && selectedEntry.task === null) {
                        // The user has chosen to go back to the first level
                        picker.value = '';
                        firstLevelTask = await this._doPickerFirstLevel(picker, (await this.getTopLevelEntries(defaultEntry)).entries);
                    }
                    else if (selectedEntry && Types.isString(selectedEntry.settingType)) {
                        picker.dispose();
                        return this.handleSettingOption(selectedEntry.settingType);
                    }
                    else {
                        picker.dispose();
                        return (selectedEntry?.task && !Types.isString(selectedEntry?.task)) ? this._toTask(selectedEntry?.task) : undefined;
                    }
                }
                else if (firstLevelTask) {
                    picker.dispose();
                    return this._toTask(firstLevelTask);
                }
                else {
                    picker.dispose();
                    return firstLevelTask;
                }
            } while (1);
            return;
        }
        async _doPickerFirstLevel(picker, taskQuickPickEntries) {
            picker.items = taskQuickPickEntries;
            (0, quickPickPin_1.showWithPinnedItems)(this._storageService, runTaskStorageKey, picker, true);
            const firstLevelPickerResult = await new Promise(resolve => {
                event_1.Event.once(picker.onDidAccept)(async () => {
                    resolve(picker.selectedItems ? picker.selectedItems[0] : undefined);
                });
            });
            return firstLevelPickerResult?.task;
        }
        async doPickerSecondLevel(picker, type, name) {
            picker.busy = true;
            if (type === SHOW_ALL) {
                const items = (await this._taskService.tasks()).filter(t => !t.configurationProperties.hide).sort((a, b) => this._sorter.compare(a, b)).map(task => this._createTaskEntry(task));
                items.push(...TaskQuickPick_1.allSettingEntries(this._configurationService));
                picker.items = items;
            }
            else {
                picker.value = name || '';
                picker.items = await this._getEntriesForProvider(type);
            }
            await picker.show();
            picker.busy = false;
            const secondLevelPickerResult = await new Promise(resolve => {
                event_1.Event.once(picker.onDidAccept)(async () => {
                    resolve(picker.selectedItems ? picker.selectedItems[0] : undefined);
                });
            });
            return secondLevelPickerResult;
        }
        static allSettingEntries(configurationService) {
            const entries = [];
            const gruntEntry = TaskQuickPick_1.getSettingEntry(configurationService, 'grunt');
            if (gruntEntry) {
                entries.push(gruntEntry);
            }
            const gulpEntry = TaskQuickPick_1.getSettingEntry(configurationService, 'gulp');
            if (gulpEntry) {
                entries.push(gulpEntry);
            }
            const jakeEntry = TaskQuickPick_1.getSettingEntry(configurationService, 'jake');
            if (jakeEntry) {
                entries.push(jakeEntry);
            }
            return entries;
        }
        static getSettingEntry(configurationService, type) {
            if (configurationService.getValue(`${type}.autoDetect`) === 'off') {
                return {
                    label: nls.localize('TaskQuickPick.changeSettingsOptions', "$(gear) {0} task detection is turned off. Enable {1} task detection...", type[0].toUpperCase() + type.slice(1), type),
                    task: null,
                    settingType: type,
                    alwaysShow: true
                };
            }
            return undefined;
        }
        async _getEntriesForProvider(type) {
            const tasks = (await this._taskService.tasks({ type })).sort((a, b) => this._sorter.compare(a, b));
            let taskQuickPickEntries = [];
            if (tasks.length > 0) {
                for (const task of tasks) {
                    if (!task.configurationProperties.hide) {
                        taskQuickPickEntries.push(this._createTaskEntry(task));
                    }
                }
                taskQuickPickEntries.push({
                    type: 'separator'
                }, {
                    label: nls.localize('TaskQuickPick.goBack', 'Go back ↩'),
                    task: null,
                    alwaysShow: true
                });
            }
            else {
                taskQuickPickEntries = [{
                        label: nls.localize('TaskQuickPick.noTasksForType', 'No {0} tasks found. Go back ↩', type),
                        task: null,
                        alwaysShow: true
                    }];
            }
            const settingEntry = TaskQuickPick_1.getSettingEntry(this._configurationService, type);
            if (settingEntry) {
                taskQuickPickEntries.push(settingEntry);
            }
            return taskQuickPickEntries;
        }
        async _toTask(task) {
            if (!tasks_1.ConfiguringTask.is(task)) {
                return task;
            }
            const resolvedTask = await this._taskService.tryResolveTask(task);
            if (!resolvedTask) {
                this._notificationService.error(nls.localize('noProviderForTask', "There is no task provider registered for tasks of type \"{0}\".", task.type));
            }
            return resolvedTask;
        }
    };
    exports.TaskQuickPick = TaskQuickPick;
    exports.TaskQuickPick = TaskQuickPick = TaskQuickPick_1 = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, notification_1.INotificationService),
        __param(4, themeService_1.IThemeService),
        __param(5, dialogs_1.IDialogService),
        __param(6, storage_1.IStorageService)
    ], TaskQuickPick);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza1F1aWNrUGljay5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2Jyb3dzZXIvdGFza1F1aWNrUGljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUJuRixRQUFBLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQ2xELFFBQUEscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7SUFDM0QsU0FBZ0IsaUJBQWlCLENBQUMsTUFBcUM7UUFDdEUsT0FBTyxLQUFLLElBQUksTUFBTSxDQUFDO0lBQ3hCLENBQUM7SUFGRCw4Q0FFQztJQVdELE1BQU0sUUFBUSxHQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUV2RSxRQUFBLGlCQUFpQixHQUFHLElBQUEsMkJBQVksRUFBQyxzQkFBc0IsRUFBRSxrQkFBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLGlEQUFpRCxDQUFDLENBQUMsQ0FBQztJQUMxSyxNQUFNLGNBQWMsR0FBRyxJQUFBLDJCQUFZLEVBQUMsY0FBYyxFQUFFLGtCQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsOENBQThDLENBQUMsQ0FBQyxDQUFDO0lBRW5KLE1BQU0saUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7SUFFdkMsSUFBTSxhQUFhLHFCQUFuQixNQUFNLGFBQWMsU0FBUSxzQkFBVTtRQUc1QyxZQUN1QixZQUEwQixFQUNqQixxQkFBNEMsRUFDL0Msa0JBQXNDLEVBQ3BDLG9CQUEwQyxFQUNqRCxhQUE0QixFQUMzQixjQUE4QixFQUM3QixlQUFnQztZQUN6RCxLQUFLLEVBQUUsQ0FBQztZQVBjLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ2pCLDBC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