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
define(["require", "exports", "vs/nls!vs/workbench/contrib/logs/common/logsActions", "vs/base/common/actions", "vs/platform/log/common/log", "vs/platform/quickinput/common/quickInput", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/output/common/output", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/contrib/logs/common/defaultLogLevels", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle"], function (require, exports, nls, actions_1, log_1, quickInput_1, uri_1, files_1, environmentService_1, resources_1, editorService_1, output_1, telemetryUtils_1, defaultLogLevels_1, codicons_1, themables_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ELb = exports.$DLb = void 0;
    let $DLb = class $DLb extends actions_1.$gi {
        static { this.ID = 'workbench.action.setLogLevel'; }
        static { this.TITLE = { value: nls.localize(0, null), original: 'Set Log Level...' }; }
        constructor(id, label, c, f, g, r) {
            super(id, label);
            this.c = c;
            this.f = f;
            this.g = g;
            this.r = r;
        }
        async run() {
            const logLevelOrChannel = await this.t();
            if (logLevelOrChannel !== null) {
                if ((0, log_1.$7i)(logLevelOrChannel)) {
                    this.f.setLogLevel(logLevelOrChannel);
                }
                else {
                    await this.y(logLevelOrChannel);
                }
            }
        }
        async t() {
            const defaultLogLevels = await this.r.getDefaultLogLevels();
            const extensionLogs = [], logs = [];
            const logLevel = this.f.getLogLevel();
            for (const channel of this.g.getChannelDescriptors()) {
                if (!channel.log || !channel.file || channel.id === telemetryUtils_1.$do || channel.id === telemetryUtils_1.$eo) {
                    continue;
                }
                const channelLogLevel = this.f.getLogLevel(channel.file) ?? logLevel;
                const item = { id: channel.id, resource: channel.file, label: channel.label, description: channelLogLevel !== logLevel ? this.L(channelLogLevel) : undefined, extensionId: channel.extensionId };
                if (channel.extensionId) {
                    extensionLogs.push(item);
                }
                else {
                    logs.push(item);
                }
            }
            const entries = [];
            entries.push({ type: 'separator', label: nls.localize(1, null) });
            entries.push(...this.J(defaultLogLevels.default, this.f.getLogLevel(), true));
            if (extensionLogs.length) {
                entries.push({ type: 'separator', label: nls.localize(2, null) });
                entries.push(...extensionLogs.sort((a, b) => a.label.localeCompare(b.label)));
            }
            entries.push({ type: 'separator', label: nls.localize(3, null) });
            entries.push(...logs.sort((a, b) => a.label.localeCompare(b.label)));
            return new Promise((resolve, reject) => {
                const disposables = new lifecycle_1.$jc();
                const quickPick = this.c.createQuickPick();
                quickPick.placeholder = nls.localize(4, null);
                quickPick.items = entries;
                let selectedItem;
                disposables.add(quickPick.onDidTriggerItemButton(e => {
                    quickPick.hide();
                    this.r.setDefaultLogLevel(e.item.level);
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
        async y(logChannel) {
            const defaultLogLevels = await this.r.getDefaultLogLevels();
            const defaultLogLevel = defaultLogLevels.extensions.find(e => e[0] === logChannel.extensionId?.toLowerCase())?.[1] ?? defaultLogLevels.default;
            const currentLogLevel = this.f.getLogLevel(logChannel.resource) ?? defaultLogLevel;
            const entries = this.J(defaultLogLevel, currentLogLevel, !!logChannel.extensionId);
            return new Promise((resolve, reject) => {
                const disposables = new lifecycle_1.$jc();
                const quickPick = this.c.createQuickPick();
                quickPick.placeholder = logChannel ? nls.localize(5, null, logChannel?.label) : nls.localize(6, null);
                quickPick.items = entries;
                quickPick.activeItems = [entries[this.f.getLogLevel()]];
                let selectedItem;
                disposables.add(quickPick.onDidTriggerItemButton(e => {
                    quickPick.hide();
                    this.r.setDefaultLogLevel(e.item.level, logChannel.extensionId);
                }));
                disposables.add(quickPick.onDidAccept(e => {
                    selectedItem = quickPick.selectedItems[0];
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    if (selectedItem) {
                        this.f.setLogLevel(logChannel.resource, selectedItem.level);
                    }
                    disposables.dispose();
                    resolve();
                }));
                quickPick.show();
            });
        }
        J(defaultLogLevel, currentLogLevel, canSetDefaultLogLevel) {
            const button = canSetDefaultLogLevel ? { iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.checkAll), tooltip: nls.localize(7, null) } : undefined;
            return [
                { label: this.L(log_1.LogLevel.Trace, currentLogLevel), level: log_1.LogLevel.Trace, description: this.M(log_1.LogLevel.Trace, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Trace ? [button] : undefined },
                { label: this.L(log_1.LogLevel.Debug, currentLogLevel), level: log_1.LogLevel.Debug, description: this.M(log_1.LogLevel.Debug, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Debug ? [button] : undefined },
                { label: this.L(log_1.LogLevel.Info, currentLogLevel), level: log_1.LogLevel.Info, description: this.M(log_1.LogLevel.Info, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Info ? [button] : undefined },
                { label: this.L(log_1.LogLevel.Warning, currentLogLevel), level: log_1.LogLevel.Warning, description: this.M(log_1.LogLevel.Warning, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Warning ? [button] : undefined },
                { label: this.L(log_1.LogLevel.Error, currentLogLevel), level: log_1.LogLevel.Error, description: this.M(log_1.LogLevel.Error, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Error ? [button] : undefined },
                { label: this.L(log_1.LogLevel.Off, currentLogLevel), level: log_1.LogLevel.Off, description: this.M(log_1.LogLevel.Off, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Off ? [button] : undefined },
            ];
        }
        L(level, current) {
            let label;
            switch (level) {
                case log_1.LogLevel.Trace:
                    label = nls.localize(8, null);
                    break;
                case log_1.LogLevel.Debug:
                    label = nls.localize(9, null);
                    break;
                case log_1.LogLevel.Info:
                    label = nls.localize(10, null);
                    break;
                case log_1.LogLevel.Warning:
                    label = nls.localize(11, null);
                    break;
                case log_1.LogLevel.Error:
                    label = nls.localize(12, null);
                    break;
                case log_1.LogLevel.Off:
                    label = nls.localize(13, null);
                    break;
            }
            return level === current ? `$(check) ${label}` : label;
        }
        M(level, defaultLogLevel) {
            return defaultLogLevel === level ? nls.localize(14, null) : undefined;
        }
    };
    exports.$DLb = $DLb;
    exports.$DLb = $DLb = __decorate([
        __param(2, quickInput_1.$Gq),
        __param(3, log_1.$6i),
        __param(4, output_1.$eJ),
        __param(5, defaultLogLevels_1.$CLb)
    ], $DLb);
    let $ELb = class $ELb extends actions_1.$gi {
        static { this.ID = 'workbench.action.openSessionLogFile'; }
        static { this.TITLE = { value: nls.localize(15, null), original: 'Open Window Log File (Session)...' }; }
        constructor(id, label, c, f, g, r) {
            super(id, label);
            this.c = c;
            this.f = f;
            this.g = g;
            this.r = r;
        }
        async run() {
            const sessionResult = await this.g.pick(this.t().then(sessions => sessions.map((s, index) => ({
                id: s.toString(),
                label: (0, resources_1.$fg)(s),
                description: index === 0 ? nls.localize(16, null) : undefined
            }))), {
                canPickMany: false,
                placeHolder: nls.localize(17, null)
            });
            if (sessionResult) {
                const logFileResult = await this.g.pick(this.y(uri_1.URI.parse(sessionResult.id)).then(logFiles => logFiles.map(s => ({
                    id: s.toString(),
                    label: (0, resources_1.$fg)(s)
                }))), {
                    canPickMany: false,
                    placeHolder: nls.localize(18, null)
                });
                if (logFileResult) {
                    return this.r.openEditor({ resource: uri_1.URI.parse(logFileResult.id), options: { pinned: true } }).then(() => undefined);
                }
            }
        }
        async t() {
            const logsPath = this.c.logsHome.with({ scheme: this.c.logFile.scheme });
            const result = [logsPath];
            const stat = await this.f.resolve((0, resources_1.$hg)(logsPath));
            if (stat.children) {
                result.push(...stat.children
                    .filter(stat => !(0, resources_1.$bg)(stat.resource, logsPath) && stat.isDirectory && /^\d{8}T\d{6}$/.test(stat.name))
                    .sort()
                    .reverse()
                    .map(d => d.resource));
            }
            return result;
        }
        async y(session) {
            const stat = await this.f.resolve(session);
            if (stat.children) {
                return stat.children.filter(stat => !stat.isDirectory).map(stat => stat.resource);
            }
            return [];
        }
    };
    exports.$ELb = $ELb;
    exports.$ELb = $ELb = __decorate([
        __param(2, environmentService_1.$hJ),
        __param(3, files_1.$6j),
        __param(4, quickInput_1.$Gq),
        __param(5, editorService_1.$9C)
    ], $ELb);
});
//# sourceMappingURL=logsActions.js.map