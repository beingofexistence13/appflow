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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/platform/log/common/log", "vs/platform/quickinput/common/quickInput", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/output/common/output", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/contrib/logs/common/defaultLogLevels", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle"], function (require, exports, nls, actions_1, log_1, quickInput_1, uri_1, files_1, environmentService_1, resources_1, editorService_1, output_1, telemetryUtils_1, defaultLogLevels_1, codicons_1, themables_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenWindowSessionLogFileAction = exports.SetLogLevelAction = void 0;
    let SetLogLevelAction = class SetLogLevelAction extends actions_1.Action {
        static { this.ID = 'workbench.action.setLogLevel'; }
        static { this.TITLE = { value: nls.localize('setLogLevel', "Set Log Level..."), original: 'Set Log Level...' }; }
        constructor(id, label, quickInputService, loggerService, outputService, defaultLogLevelsService) {
            super(id, label);
            this.quickInputService = quickInputService;
            this.loggerService = loggerService;
            this.outputService = outputService;
            this.defaultLogLevelsService = defaultLogLevelsService;
        }
        async run() {
            const logLevelOrChannel = await this.selectLogLevelOrChannel();
            if (logLevelOrChannel !== null) {
                if ((0, log_1.isLogLevel)(logLevelOrChannel)) {
                    this.loggerService.setLogLevel(logLevelOrChannel);
                }
                else {
                    await this.setLogLevelForChannel(logLevelOrChannel);
                }
            }
        }
        async selectLogLevelOrChannel() {
            const defaultLogLevels = await this.defaultLogLevelsService.getDefaultLogLevels();
            const extensionLogs = [], logs = [];
            const logLevel = this.loggerService.getLogLevel();
            for (const channel of this.outputService.getChannelDescriptors()) {
                if (!channel.log || !channel.file || channel.id === telemetryUtils_1.telemetryLogId || channel.id === telemetryUtils_1.extensionTelemetryLogChannelId) {
                    continue;
                }
                const channelLogLevel = this.loggerService.getLogLevel(channel.file) ?? logLevel;
                const item = { id: channel.id, resource: channel.file, label: channel.label, description: channelLogLevel !== logLevel ? this.getLabel(channelLogLevel) : undefined, extensionId: channel.extensionId };
                if (channel.extensionId) {
                    extensionLogs.push(item);
                }
                else {
                    logs.push(item);
                }
            }
            const entries = [];
            entries.push({ type: 'separator', label: nls.localize('all', "All") });
            entries.push(...this.getLogLevelEntries(defaultLogLevels.default, this.loggerService.getLogLevel(), true));
            if (extensionLogs.length) {
                entries.push({ type: 'separator', label: nls.localize('extensionLogs', "Extension Logs") });
                entries.push(...extensionLogs.sort((a, b) => a.label.localeCompare(b.label)));
            }
            entries.push({ type: 'separator', label: nls.localize('loggers', "Logs") });
            entries.push(...logs.sort((a, b) => a.label.localeCompare(b.label)));
            return new Promise((resolve, reject) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.placeholder = nls.localize('selectlog', "Set Log Level");
                quickPick.items = entries;
                let selectedItem;
                disposables.add(quickPick.onDidTriggerItemButton(e => {
                    quickPick.hide();
                    this.defaultLogLevelsService.setDefaultLogLevel(e.item.level);
                }));
                disposables.add(quickPick.onDidAccept(e => {
                    selectedItem = quickPick.selectedItems[0];
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    const result = selectedItem ? selectedItem.level ?? selectedItem : null;
                    disposables.dispose();
                    resolve(result);
                }));
                quickPick.show();
            });
        }
        async setLogLevelForChannel(logChannel) {
            const defaultLogLevels = await this.defaultLogLevelsService.getDefaultLogLevels();
            const defaultLogLevel = defaultLogLevels.extensions.find(e => e[0] === logChannel.extensionId?.toLowerCase())?.[1] ?? defaultLogLevels.default;
            const currentLogLevel = this.loggerService.getLogLevel(logChannel.resource) ?? defaultLogLevel;
            const entries = this.getLogLevelEntries(defaultLogLevel, currentLogLevel, !!logChannel.extensionId);
            return new Promise((resolve, reject) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.placeholder = logChannel ? nls.localize('selectLogLevelFor', " {0}: Select log level", logChannel?.label) : nls.localize('selectLogLevel', "Select log level");
                quickPick.items = entries;
                quickPick.activeItems = [entries[this.loggerService.getLogLevel()]];
                let selectedItem;
                disposables.add(quickPick.onDidTriggerItemButton(e => {
                    quickPick.hide();
                    this.defaultLogLevelsService.setDefaultLogLevel(e.item.level, logChannel.extensionId);
                }));
                disposables.add(quickPick.onDidAccept(e => {
                    selectedItem = quickPick.selectedItems[0];
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    if (selectedItem) {
                        this.loggerService.setLogLevel(logChannel.resource, selectedItem.level);
                    }
                    disposables.dispose();
                    resolve();
                }));
                quickPick.show();
            });
        }
        getLogLevelEntries(defaultLogLevel, currentLogLevel, canSetDefaultLogLevel) {
            const button = canSetDefaultLogLevel ? { iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.checkAll), tooltip: nls.localize('resetLogLevel', "Set as Default Log Level") } : undefined;
            return [
                { label: this.getLabel(log_1.LogLevel.Trace, currentLogLevel), level: log_1.LogLevel.Trace, description: this.getDescription(log_1.LogLevel.Trace, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Trace ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Debug, currentLogLevel), level: log_1.LogLevel.Debug, description: this.getDescription(log_1.LogLevel.Debug, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Debug ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Info, currentLogLevel), level: log_1.LogLevel.Info, description: this.getDescription(log_1.LogLevel.Info, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Info ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Warning, currentLogLevel), level: log_1.LogLevel.Warning, description: this.getDescription(log_1.LogLevel.Warning, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Warning ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Error, currentLogLevel), level: log_1.LogLevel.Error, description: this.getDescription(log_1.LogLevel.Error, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Error ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Off, currentLogLevel), level: log_1.LogLevel.Off, description: this.getDescription(log_1.LogLevel.Off, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Off ? [button] : undefined },
            ];
        }
        getLabel(level, current) {
            let label;
            switch (level) {
                case log_1.LogLevel.Trace:
                    label = nls.localize('trace', "Trace");
                    break;
                case log_1.LogLevel.Debug:
                    label = nls.localize('debug', "Debug");
                    break;
                case log_1.LogLevel.Info:
                    label = nls.localize('info', "Info");
                    break;
                case log_1.LogLevel.Warning:
                    label = nls.localize('warn', "Warning");
                    break;
                case log_1.LogLevel.Error:
                    label = nls.localize('err', "Error");
                    break;
                case log_1.LogLevel.Off:
                    label = nls.localize('off', "Off");
                    break;
            }
            return level === current ? `$(check) ${label}` : label;
        }
        getDescription(level, defaultLogLevel) {
            return defaultLogLevel === level ? nls.localize('default', "Default") : undefined;
        }
    };
    exports.SetLogLevelAction = SetLogLevelAction;
    exports.SetLogLevelAction = SetLogLevelAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, log_1.ILoggerService),
        __param(4, output_1.IOutputService),
        __param(5, defaultLogLevels_1.IDefaultLogLevelsService)
    ], SetLogLevelAction);
    let OpenWindowSessionLogFileAction = class OpenWindowSessionLogFileAction extends actions_1.Action {
        static { this.ID = 'workbench.action.openSessionLogFile'; }
        static { this.TITLE = { value: nls.localize('openSessionLogFile', "Open Window Log File (Session)..."), original: 'Open Window Log File (Session)...' }; }
        constructor(id, label, environmentService, fileService, quickInputService, editorService) {
            super(id, label);
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.quickInputService = quickInputService;
            this.editorService = editorService;
        }
        async run() {
            const sessionResult = await this.quickInputService.pick(this.getSessions().then(sessions => sessions.map((s, index) => ({
                id: s.toString(),
                label: (0, resources_1.basename)(s),
                description: index === 0 ? nls.localize('current', "Current") : undefined
            }))), {
                canPickMany: false,
                placeHolder: nls.localize('sessions placeholder', "Select Session")
            });
            if (sessionResult) {
                const logFileResult = await this.quickInputService.pick(this.getLogFiles(uri_1.URI.parse(sessionResult.id)).then(logFiles => logFiles.map(s => ({
                    id: s.toString(),
                    label: (0, resources_1.basename)(s)
                }))), {
                    canPickMany: false,
                    placeHolder: nls.localize('log placeholder', "Select Log file")
                });
                if (logFileResult) {
                    return this.editorService.openEditor({ resource: uri_1.URI.parse(logFileResult.id), options: { pinned: true } }).then(() => undefined);
                }
            }
        }
        async getSessions() {
            const logsPath = this.environmentService.logsHome.with({ scheme: this.environmentService.logFile.scheme });
            const result = [logsPath];
            const stat = await this.fileService.resolve((0, resources_1.dirname)(logsPath));
            if (stat.children) {
                result.push(...stat.children
                    .filter(stat => !(0, resources_1.isEqual)(stat.resource, logsPath) && stat.isDirectory && /^\d{8}T\d{6}$/.test(stat.name))
                    .sort()
                    .reverse()
                    .map(d => d.resource));
            }
            return result;
        }
        async getLogFiles(session) {
            const stat = await this.fileService.resolve(session);
            if (stat.children) {
                return stat.children.filter(stat => !stat.isDirectory).map(stat => stat.resource);
            }
            return [];
        }
    };
    exports.OpenWindowSessionLogFileAction = OpenWindowSessionLogFileAction;
    exports.OpenWindowSessionLogFileAction = OpenWindowSessionLogFileAction = __decorate([
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, editorService_1.IEditorService)
    ], OpenWindowSessionLogFileAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2dzL2NvbW1vbi9sb2dzQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQnpGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsZ0JBQU07aUJBRTVCLE9BQUUsR0FBRyw4QkFBOEIsQUFBakMsQ0FBa0M7aUJBQ3BDLFVBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxBQUEzRixDQUE0RjtRQUVqSCxZQUFZLEVBQVUsRUFBRSxLQUFhLEVBQ0MsaUJBQXFDLEVBQ3pDLGFBQTZCLEVBQzdCLGFBQTZCLEVBQ25CLHVCQUFpRDtZQUU1RixLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBTG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDekMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzdCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNuQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1FBRzdGLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRztZQUNqQixNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDL0QsSUFBSSxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7Z0JBQy9CLElBQUksSUFBQSxnQkFBVSxFQUFDLGlCQUFpQixDQUFDLEVBQUU7b0JBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7aUJBQ2xEO3FCQUFNO29CQUNOLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGlCQUFpQixD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