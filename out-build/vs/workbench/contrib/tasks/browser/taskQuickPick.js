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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/taskQuickPick", "vs/base/common/objects", "vs/workbench/contrib/tasks/common/tasks", "vs/base/common/types", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/quickinput/common/quickInput", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/notification/common/notification", "vs/base/common/codicons", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/iconRegistry", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/platform/quickinput/browser/quickPickPin", "vs/platform/storage/common/storage"], function (require, exports, nls, Objects, tasks_1, Types, taskService_1, quickInput_1, configuration_1, lifecycle_1, event_1, notification_1, codicons_1, themeService_1, themables_1, iconRegistry_1, dialogs_1, terminalIcon_1, quickPickPin_1, storage_1) {
    "use strict";
    var $KXb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KXb = exports.$JXb = exports.$IXb = exports.$HXb = exports.$GXb = void 0;
    exports.$GXb = 'task.quickOpen.detail';
    exports.$HXb = 'task.quickOpen.skip';
    function $IXb(folder) {
        return 'uri' in folder;
    }
    exports.$IXb = $IXb;
    const SHOW_ALL = nls.localize(0, null);
    exports.$JXb = (0, iconRegistry_1.$9u)('tasks-list-configure', codicons_1.$Pj.gear, nls.localize(1, null));
    const removeTaskIcon = (0, iconRegistry_1.$9u)('tasks-remove', codicons_1.$Pj.close, nls.localize(2, null));
    const runTaskStorageKey = 'runTaskStorageKey';
    let $KXb = $KXb_1 = class $KXb extends lifecycle_1.$kc {
        constructor(g, h, m, n, r, s, u) {
            super();
            this.g = g;
            this.h = h;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.u = u;
            this.c = this.g.createSorter();
        }
        w() {
            // Ensure invalid values get converted into boolean values
            return !!this.h.getValue(exports.$GXb);
        }
        y(task) {
            if (task._label) {
                return task._label;
            }
            if (tasks_1.$fG.is(task)) {
                let label = task.configures.type;
                const configures = Objects.$Vm(task.configures);
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
            return icon.id ? `$(${icon.id}) ${label}` : `$(${codicons_1.$Pj.tools.id}) ${label}`;
        }
        static applyColorStyles(task, entry, themeService) {
            if (task.configurationProperties.icon?.color) {
                const colorTheme = themeService.getColorTheme();
                const styleElement = (0, terminalIcon_1.$Vib)(colorTheme);
                entry.iconClasses = [(0, terminalIcon_1.$Tib)(task.configurationProperties.icon.color)];
                document.body.appendChild(styleElement);
            }
        }
        z(task, extraButtons = []) {
            const buttons = [
                { iconClass: themables_1.ThemeIcon.asClassName(exports.$JXb), tooltip: nls.localize(3, null) },
                ...extraButtons
            ];
            const entry = { label: $KXb_1.getTaskLabelWithIcon(task, this.y(task)), description: this.g.getTaskDescription(task), task, detail: this.w() ? task.configurationProperties.detail : undefined, buttons };
            $KXb_1.applyColorStyles(task, entry, this.r);
            return entry;
        }
        C(entries, tasks, groupLabel, extraButtons = []) {
            entries.push({ type: 'separator', label: groupLabel });
            tasks.forEach(task => {
                if (!task.configurationProperties.hide) {
                    entries.push(this.z(task, extraButtons));
                }
            });
        }
        D(entries, types) {
            entries.push({ type: 'separator', label: nls.localize(4, null) });
            types.forEach(type => {
                entries.push({ label: `$(folder) ${type}`, task: type, ariaLabel: nls.localize(5, null, type) });
            });
            entries.push({ label: SHOW_ALL, task: SHOW_ALL, alwaysShow: true });
        }
        F(result) {
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
        G(recentTasks, configuredTasks) {
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
            dedupedConfiguredTasks = dedupedConfiguredTasks.sort((a, b) => this.c.compare(a, b));
            const prunedRecentTasks = [];
            for (let i = 0; i < recentTasks.length; i++) {
                if (foundRecentTasks[i] || tasks_1.$fG.is(recentTasks[i])) {
                    prunedRecentTasks.push(recentTasks[i]);
                }
            }
            return { configuredTasks: dedupedConfiguredTasks, recentTasks: prunedRecentTasks };
        }
        async getTopLevelEntries(defaultEntry) {
            if (this.f !== undefined) {
                return { entries: this.f };
            }
            let recentTasks = (await this.g.getSavedTasks('historical')).reverse();
            const configuredTasks = this.F(await this.g.getWorkspaceTasks());
            const extensionTaskTypes = this.g.taskTypes();
            this.f = [];
            // Dedupe will update recent tasks if they've changed in tasks.json.
            const dedupeAndPrune = this.G(recentTasks, configuredTasks);
            const dedupedConfiguredTasks = dedupeAndPrune.configuredTasks;
            recentTasks = dedupeAndPrune.recentTasks;
            if (recentTasks.length > 0) {
                const removeRecentButton = {
                    iconClass: themables_1.ThemeIcon.asClassName(removeTaskIcon),
                    tooltip: nls.localize(6, null)
                };
                this.C(this.f, recentTasks, nls.localize(7, null), [removeRecentButton]);
            }
            if (configuredTasks.length > 0) {
                if (dedupedConfiguredTasks.length > 0) {
                    this.C(this.f, dedupedConfiguredTasks, nls.localize(8, null));
                }
            }
            if (defaultEntry && (configuredTasks.length === 0)) {
                this.f.push({ type: 'separator', label: nls.localize(9, null) });
                this.f.push(defaultEntry);
            }
            if (extensionTaskTypes.length > 0) {
                this.D(this.f, extensionTaskTypes);
            }
            return { entries: this.f, isSingleConfigured: configuredTasks.length === 1 ? configuredTasks[0] : undefined };
        }
        async handleSettingOption(selectedType) {
            const { confirmed } = await this.s.confirm({
                type: notification_1.Severity.Warning,
                message: nls.localize(10, null, selectedType),
                cancelButton: nls.localize(11, null)
            });
            if (confirmed) {
                await this.h.updateValue(`${selectedType}.autoDetect`, 'on');
                await new Promise(resolve => setTimeout(() => resolve(), 100));
                return this.show(nls.localize(12, null), undefined, selectedType);
            }
            return undefined;
        }
        async show(placeHolder, defaultEntry, startAtType, name) {
            const picker = this.m.createQuickPick();
            picker.placeholder = placeHolder;
            picker.matchOnDescription = true;
            picker.ignoreFocusOut = false;
            picker.onDidTriggerItemButton(async (context) => {
                const task = context.item.task;
                if (context.button.iconClass === themables_1.ThemeIcon.asClassName(removeTaskIcon)) {
                    const key = (task && !Types.$jf(task)) ? task.getRecentlyUsedKey() : undefined;
                    if (key) {
                        this.g.removeRecentlyUsedTask(key);
                    }
                    const indexToRemove = picker.items.indexOf(context.item);
                    if (indexToRemove >= 0) {
                        picker.items = [...picker.items.slice(0, indexToRemove), ...picker.items.slice(indexToRemove + 1)];
                    }
                }
                else if (context.button.iconClass === themables_1.ThemeIcon.asClassName(exports.$JXb)) {
                    this.m.cancel();
                    if (tasks_1.$gG.is(task)) {
                        this.g.customize(task, undefined, true);
                    }
                    else if (tasks_1.$eG.is(task) || tasks_1.$fG.is(task)) {
                        let canOpenConfig = false;
                        try {
                            canOpenConfig = await this.g.openConfig(task);
                        }
                        catch (e) {
                            // do nothing.
                        }
                        if (!canOpenConfig) {
                            this.g.customize(task, undefined, true);
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
                if (topLevelEntriesResult.isSingleConfigured && this.h.getValue(exports.$HXb)) {
                    picker.dispose();
                    return this.J(topLevelEntriesResult.isSingleConfigured);
                }
                const taskQuickPickEntries = topLevelEntriesResult.entries;
                firstLevelTask = await this.H(picker, taskQuickPickEntries);
            }
            do {
                if (Types.$jf(firstLevelTask)) {
                    if (name) {
                        await this.H(picker, (await this.getTopLevelEntries(defaultEntry)).entries);
                        picker.dispose();
                        return undefined;
                    }
                    const selectedEntry = await this.doPickerSecondLevel(picker, firstLevelTask);
                    // Proceed to second level of quick pick
                    if (selectedEntry && !selectedEntry.settingType && selectedEntry.task === null) {
                        // The user has chosen to go back to the first level
                        picker.value = '';
                        firstLevelTask = await this.H(picker, (await this.getTopLevelEntries(defaultEntry)).entries);
                    }
                    else if (selectedEntry && Types.$jf(selectedEntry.settingType)) {
                        picker.dispose();
                        return this.handleSettingOption(selectedEntry.settingType);
                    }
                    else {
                        picker.dispose();
                        return (selectedEntry?.task && !Types.$jf(selectedEntry?.task)) ? this.J(selectedEntry?.task) : undefined;
                    }
                }
                else if (firstLevelTask) {
                    picker.dispose();
                    return this.J(firstLevelTask);
                }
                else {
                    picker.dispose();
                    return firstLevelTask;
                }
            } while (1);
            return;
        }
        async H(picker, taskQuickPickEntries) {
            picker.items = taskQuickPickEntries;
            (0, quickPickPin_1.$8Vb)(this.u, runTaskStorageKey, picker, true);
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
                const items = (await this.g.tasks()).filter(t => !t.configurationProperties.hide).sort((a, b) => this.c.compare(a, b)).map(task => this.z(task));
                items.push(...$KXb_1.allSettingEntries(this.h));
                picker.items = items;
            }
            else {
                picker.value = name || '';
                picker.items = await this.I(type);
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
            const gruntEntry = $KXb_1.getSettingEntry(configurationService, 'grunt');
            if (gruntEntry) {
                entries.push(gruntEntry);
            }
            const gulpEntry = $KXb_1.getSettingEntry(configurationService, 'gulp');
            if (gulpEntry) {
                entries.push(gulpEntry);
            }
            const jakeEntry = $KXb_1.getSettingEntry(configurationService, 'jake');
            if (jakeEntry) {
                entries.push(jakeEntry);
            }
            return entries;
        }
        static getSettingEntry(configurationService, type) {
            if (configurationService.getValue(`${type}.autoDetect`) === 'off') {
                return {
                    label: nls.localize(13, null, type[0].toUpperCase() + type.slice(1), type),
                    task: null,
                    settingType: type,
                    alwaysShow: true
                };
            }
            return undefined;
        }
        async I(type) {
            const tasks = (await this.g.tasks({ type })).sort((a, b) => this.c.compare(a, b));
            let taskQuickPickEntries = [];
            if (tasks.length > 0) {
                for (const task of tasks) {
                    if (!task.configurationProperties.hide) {
                        taskQuickPickEntries.push(this.z(task));
                    }
                }
                taskQuickPickEntries.push({
                    type: 'separator'
                }, {
                    label: nls.localize(14, null),
                    task: null,
                    alwaysShow: true
                });
            }
            else {
                taskQuickPickEntries = [{
                        label: nls.localize(15, null, type),
                        task: null,
                        alwaysShow: true
                    }];
            }
            const settingEntry = $KXb_1.getSettingEntry(this.h, type);
            if (settingEntry) {
                taskQuickPickEntries.push(settingEntry);
            }
            return taskQuickPickEntries;
        }
        async J(task) {
            if (!tasks_1.$fG.is(task)) {
                return task;
            }
            const resolvedTask = await this.g.tryResolveTask(task);
            if (!resolvedTask) {
                this.n.error(nls.localize(16, null, task.type));
            }
            return resolvedTask;
        }
    };
    exports.$KXb = $KXb;
    exports.$KXb = $KXb = $KXb_1 = __decorate([
        __param(0, taskService_1.$osb),
        __param(1, configuration_1.$8h),
        __param(2, quickInput_1.$Gq),
        __param(3, notification_1.$Yu),
        __param(4, themeService_1.$gv),
        __param(5, dialogs_1.$oA),
        __param(6, storage_1.$Vo)
    ], $KXb);
});
//# sourceMappingURL=taskQuickPick.js.map