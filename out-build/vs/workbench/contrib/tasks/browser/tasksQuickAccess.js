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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/tasksQuickAccess", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/filters", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/browser/taskQuickPick", "vs/platform/configuration/common/configuration", "vs/base/common/types", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage"], function (require, exports, nls_1, quickInput_1, pickerQuickAccess_1, filters_1, extensions_1, taskService_1, tasks_1, taskQuickPick_1, configuration_1, types_1, notification_1, dialogs_1, themeService_1, storage_1) {
    "use strict";
    var $MXb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MXb = void 0;
    let $MXb = class $MXb extends pickerQuickAccess_1.$sqb {
        static { $MXb_1 = this; }
        static { this.PREFIX = 'task '; }
        constructor(extensionService, a, b, h, j, m, n, r) {
            super($MXb_1.PREFIX, {
                noResultsPick: {
                    label: (0, nls_1.localize)(0, null)
                }
            });
            this.a = a;
            this.b = b;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
        }
        async g(filter, disposables, token) {
            if (token.isCancellationRequested) {
                return [];
            }
            const taskQuickPick = new taskQuickPick_1.$KXb(this.a, this.b, this.h, this.j, this.n, this.m, this.r);
            const topLevelPicks = await taskQuickPick.getTopLevelEntries();
            const taskPicks = [];
            for (const entry of topLevelPicks.entries) {
                const highlights = (0, filters_1.$Ej)(filter, entry.label);
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
                        const key = (task && !(0, types_1.$jf)(task)) ? task.getRecentlyUsedKey() : undefined;
                        if (key) {
                            this.a.removeRecentlyUsedTask(key);
                        }
                        return pickerQuickAccess_1.TriggerAction.REFRESH_PICKER;
                    }
                    else {
                        if (tasks_1.$gG.is(task)) {
                            this.a.customize(task, undefined, true);
                        }
                        else if (tasks_1.$eG.is(task)) {
                            this.a.openConfig(task);
                        }
                        return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                    }
                };
                quickAccessEntry.accept = async () => {
                    if ((0, types_1.$jf)(task)) {
                        // switch to quick pick and show second level
                        const showResult = await taskQuickPick.show((0, nls_1.localize)(1, null), undefined, task);
                        if (showResult) {
                            this.a.run(showResult, { attachProblemMatcher: true });
                        }
                    }
                    else {
                        this.a.run(await this.t(task), { attachProblemMatcher: true });
                    }
                };
                taskPicks.push(quickAccessEntry);
            }
            return taskPicks;
        }
        async t(task) {
            if (!tasks_1.$fG.is(task)) {
                return task;
            }
            return this.a.tryResolveTask(task);
        }
    };
    exports.$MXb = $MXb;
    exports.$MXb = $MXb = $MXb_1 = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, taskService_1.$osb),
        __param(2, configuration_1.$8h),
        __param(3, quickInput_1.$Gq),
        __param(4, notification_1.$Yu),
        __param(5, dialogs_1.$oA),
        __param(6, themeService_1.$gv),
        __param(7, storage_1.$Vo)
    ], $MXb);
});
//# sourceMappingURL=tasksQuickAccess.js.map