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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/workbench/contrib/logs/common/logsActions", "vs/workbench/common/contributions", "vs/platform/files/common/files", "vs/workbench/services/output/common/output", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/workbench/services/log/common/logConstants", "vs/base/common/async", "vs/base/common/errors", "vs/workbench/contrib/logs/common/defaultLogLevels", "vs/platform/contextkey/common/contextkey", "vs/base/common/map", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/network"], function (require, exports, nls, platform_1, actionCommonCategories_1, actions_1, logsActions_1, contributions_1, files_1, output_1, lifecycle_1, log_1, instantiation_1, event_1, logConstants_1, async_1, errors_1, defaultLogLevels_1, contextkey_1, map_1, uriIdentity_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: logsActions_1.SetLogLevelAction.ID,
                title: logsActions_1.SetLogLevelAction.TITLE,
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(servicesAccessor) {
            return servicesAccessor.get(instantiation_1.IInstantiationService).createInstance(logsActions_1.SetLogLevelAction, logsActions_1.SetLogLevelAction.ID, logsActions_1.SetLogLevelAction.TITLE.value).run();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.setDefaultLogLevel',
                title: { value: nls.localize('setDefaultLogLevel', "Set Default Log Level"), original: 'Set Default Log Level' },
                category: actionCommonCategories_1.Categories.Developer,
            });
        }
        run(servicesAccessor, logLevel, extensionId) {
            return servicesAccessor.get(defaultLogLevels_1.IDefaultLogLevelsService).setDefaultLogLevel(logLevel, extensionId);
        }
    });
    let LogOutputChannels = class LogOutputChannels extends lifecycle_1.Disposable {
        constructor(logService, loggerService, contextKeyService, fileService, uriIdentityService) {
            super();
            this.logService = logService;
            this.loggerService = loggerService;
            this.contextKeyService = contextKeyService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.contextKeys = new map_1.CounterSet();
            this.outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            this.loggerDisposables = this._register(new lifecycle_1.DisposableMap());
            const contextKey = log_1.CONTEXT_LOG_LEVEL.bindTo(contextKeyService);
            contextKey.set((0, log_1.LogLevelToString)(loggerService.getLogLevel()));
            loggerService.onDidChangeLogLevel(e => {
                if ((0, log_1.isLogLevel)(e)) {
                    contextKey.set((0, log_1.LogLevelToString)(loggerService.getLogLevel()));
                }
            });
            this.onDidAddLoggers(loggerService.getRegisteredLoggers());
            this._register(loggerService.onDidChangeLoggers(({ added, removed }) => {
                this.onDidAddLoggers(added);
                this.onDidRemoveLoggers(removed);
            }));
            this._register(loggerService.onDidChangeVisibility(([resource, visibility]) => {
                const logger = loggerService.getRegisteredLogger(resource);
                if (logger) {
                    if (visibility) {
                        this.registerLogChannel(logger);
                    }
                    else {
                        this.deregisterLogChannel(logger);
                    }
                }
            }));
            this.registerShowWindowLogAction();
            this._register(event_1.Event.filter(contextKeyService.onDidChangeContext, e => e.affectsSome(this.contextKeys))(() => this.onDidChangeContext()));
        }
        onDidAddLoggers(loggers) {
            for (const logger of loggers) {
                if (logger.when) {
                    const contextKeyExpr = contextkey_1.ContextKeyExpr.deserialize(logger.when);
                    if (contextKeyExpr) {
                        for (const key of contextKeyExpr.keys()) {
                            this.contextKeys.add(key);
                        }
                        if (!this.contextKeyService.contextMatchesRules(contextKeyExpr)) {
                            continue;
                        }
                    }
                }
                if (logger.hidden) {
                    continue;
                }
                this.registerLogChannel(logger);
            }
        }
        onDidChangeContext() {
            for (const logger of this.loggerService.getRegisteredLoggers()) {
                if (logger.when) {
                    if (this.contextKeyService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(logger.when))) {
                        this.registerLogChannel(logger);
                    }
                    else {
                        this.deregisterLogChannel(logger);
                    }
                }
            }
        }
        onDidRemoveLoggers(loggers) {
            for (const logger of loggers) {
                if (logger.when) {
                    const contextKeyExpr = contextkey_1.ContextKeyExpr.deserialize(logger.when);
                    if (contextKeyExpr) {
                        for (const key of contextKeyExpr.keys()) {
                            this.contextKeys.delete(key);
                        }
                    }
                }
                this.deregisterLogChannel(logger);
            }
        }
        registerLogChannel(logger) {
            const channel = this.outputChannelRegistry.getChannel(logger.id);
            if (channel && this.uriIdentityService.extUri.isEqual(channel.file, logger.resource)) {
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            const promise = (0, async_1.createCancelablePromise)(async (token) => {
                await (0, files_1.whenProviderRegistered)(logger.resource, this.fileService);
                try {
                    await this.whenFileExists(logger.resource, 1, token);
                    const existingChannel = this.outputChannelRegistry.getChannel(logger.id);
                    const remoteLogger = existingChannel?.file?.scheme === network_1.Schemas.vscodeRemote ? this.loggerService.getRegisteredLogger(existingChannel.file) : undefined;
                    if (remoteLogger) {
                        this.deregisterLogChannel(remoteLogger);
                    }
                    const hasToAppendRemote = existingChannel && logger.resource.scheme === network_1.Schemas.vscodeRemote;
                    const id = hasToAppendRemote ? `${logger.id}.remote` : logger.id;
                    const label = hasToAppendRemote ? nls.localize('remote name', "{0} (Remote)", logger.name ?? logger.id) : logger.name ?? logger.id;
                    this.outputChannelRegistry.registerChannel({ id, label, file: logger.resource, log: true, extensionId: logger.extensionId });
                    disposables.add((0, lifecycle_1.toDisposable)(() => this.outputChannelRegistry.removeChannel(id)));
                    if (remoteLogger) {
                        this.registerLogChannel(remoteLogger);
                    }
                }
                catch (error) {
                    if (!(0, errors_1.isCancellationError)(error)) {
                        this.logService.error('Error while registering log channel', logger.resource.toString(), (0, errors_1.getErrorMessage)(error));
                    }
                }
            });
            disposables.add((0, lifecycle_1.toDisposable)(() => promise.cancel()));
            this.loggerDisposables.set(logger.resource.toString(), disposables);
        }
        deregisterLogChannel(logger) {
            this.loggerDisposables.deleteAndDispose(logger.resource.toString());
        }
        async whenFileExists(file, trial, token) {
            const exists = await this.fileService.exists(file);
            if (exists) {
                return;
            }
            if (token.isCancellationRequested) {
                throw new errors_1.CancellationError();
            }
            if (trial > 10) {
                throw new Error(`Timed out while waiting for file to be created`);
            }
            this.logService.debug(`[Registering Log Channel] File does not exist. Waiting for 1s to retry.`, file.toString());
            await (0, async_1.timeout)(1000, token);
            await this.whenFileExists(file, trial + 1, token);
        }
        registerShowWindowLogAction() {
            (0, actions_1.registerAction2)(class ShowWindowLogAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: logConstants_1.showWindowLogActionId,
                        title: { value: nls.localize('show window log', "Show Window Log"), original: 'Show Window Log' },
                        category: actionCommonCategories_1.Categories.Developer,
                        f1: true
                    });
                }
                async run(servicesAccessor) {
                    const outputService = servicesAccessor.get(output_1.IOutputService);
                    outputService.showChannel(logConstants_1.windowLogId);
                }
            });
        }
    };
    LogOutputChannels = __decorate([
        __param(0, log_1.ILogService),
        __param(1, log_1.ILoggerService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, files_1.IFileService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], LogOutputChannels);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LogOutputChannels, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ncy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2dzL2NvbW1vbi9sb2dzLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQTBCaEcsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsK0JBQWlCLENBQUMsRUFBRTtnQkFDeEIsS0FBSyxFQUFFLCtCQUFpQixDQUFDLEtBQUs7Z0JBQzlCLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLFNBQVM7Z0JBQzlCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELEdBQUcsQ0FBQyxnQkFBa0M7WUFDckMsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQyxjQUFjLENBQUMsK0JBQWlCLEVBQUUsK0JBQWlCLENBQUMsRUFBRSxFQUFFLCtCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNqSixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUscUNBQXFDO2dCQUN6QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBRTtnQkFDaEgsUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUzthQUM5QixDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsR0FBRyxDQUFDLGdCQUFrQyxFQUFFLFFBQWtCLEVBQUUsV0FBb0I7WUFDL0Us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