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
define(["require", "exports", "vs/nls!vs/workbench/contrib/logs/common/logs.contribution", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/workbench/contrib/logs/common/logsActions", "vs/workbench/common/contributions", "vs/platform/files/common/files", "vs/workbench/services/output/common/output", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/workbench/services/log/common/logConstants", "vs/base/common/async", "vs/base/common/errors", "vs/workbench/contrib/logs/common/defaultLogLevels", "vs/platform/contextkey/common/contextkey", "vs/base/common/map", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/network"], function (require, exports, nls, platform_1, actionCommonCategories_1, actions_1, logsActions_1, contributions_1, files_1, output_1, lifecycle_1, log_1, instantiation_1, event_1, logConstants_1, async_1, errors_1, defaultLogLevels_1, contextkey_1, map_1, uriIdentity_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: logsActions_1.$DLb.ID,
                title: logsActions_1.$DLb.TITLE,
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(servicesAccessor) {
            return servicesAccessor.get(instantiation_1.$Ah).createInstance(logsActions_1.$DLb, logsActions_1.$DLb.ID, logsActions_1.$DLb.TITLE.value).run();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.setDefaultLogLevel',
                title: { value: nls.localize(0, null), original: 'Set Default Log Level' },
                category: actionCommonCategories_1.$Nl.Developer,
            });
        }
        run(servicesAccessor, logLevel, extensionId) {
            return servicesAccessor.get(defaultLogLevels_1.$CLb).setDefaultLogLevel(logLevel, extensionId);
        }
    });
    let LogOutputChannels = class LogOutputChannels extends lifecycle_1.$kc {
        constructor(f, g, h, j, m) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = new map_1.$Di();
            this.b = platform_1.$8m.as(output_1.$fJ.OutputChannels);
            this.c = this.B(new lifecycle_1.$sc());
            const contextKey = log_1.$jj.bindTo(h);
            contextKey.set((0, log_1.$hj)(g.getLogLevel()));
            g.onDidChangeLogLevel(e => {
                if ((0, log_1.$7i)(e)) {
                    contextKey.set((0, log_1.$hj)(g.getLogLevel()));
                }
            });
            this.n(g.getRegisteredLoggers());
            this.B(g.onDidChangeLoggers(({ added, removed }) => {
                this.n(added);
                this.s(removed);
            }));
            this.B(g.onDidChangeVisibility(([resource, visibility]) => {
                const logger = g.getRegisteredLogger(resource);
                if (logger) {
                    if (visibility) {
                        this.t(logger);
                    }
                    else {
                        this.u(logger);
                    }
                }
            }));
            this.y();
            this.B(event_1.Event.filter(h.onDidChangeContext, e => e.affectsSome(this.a))(() => this.r()));
        }
        n(loggers) {
            for (const logger of loggers) {
                if (logger.when) {
                    const contextKeyExpr = contextkey_1.$Ii.deserialize(logger.when);
                    if (contextKeyExpr) {
                        for (const key of contextKeyExpr.keys()) {
                            this.a.add(key);
                        }
                        if (!this.h.contextMatchesRules(contextKeyExpr)) {
                            continue;
                        }
                    }
                }
                if (logger.hidden) {
                    continue;
                }
                this.t(logger);
            }
        }
        r() {
            for (const logger of this.g.getRegisteredLoggers()) {
                if (logger.when) {
                    if (this.h.contextMatchesRules(contextkey_1.$Ii.deserialize(logger.when))) {
                        this.t(logger);
                    }
                    else {
                        this.u(logger);
                    }
                }
            }
        }
        s(loggers) {
            for (const logger of loggers) {
                if (logger.when) {
                    const contextKeyExpr = contextkey_1.$Ii.deserialize(logger.when);
                    if (contextKeyExpr) {
                        for (const key of contextKeyExpr.keys()) {
                            this.a.delete(key);
                        }
                    }
                }
                this.u(logger);
            }
        }
        t(logger) {
            const channel = this.b.getChannel(logger.id);
            if (channel && this.m.extUri.isEqual(channel.file, logger.resource)) {
                return;
            }
            const disposables = new lifecycle_1.$jc();
            const promise = (0, async_1.$ug)(async (token) => {
                await (0, files_1.$zk)(logger.resource, this.j);
                try {
                    await this.w(logger.resource, 1, token);
                    const existingChannel = this.b.getChannel(logger.id);
                    const remoteLogger = existingChannel?.file?.scheme === network_1.Schemas.vscodeRemote ? this.g.getRegisteredLogger(existingChannel.file) : undefined;
                    if (remoteLogger) {
                        this.u(remoteLogger);
                    }
                    const hasToAppendRemote = existingChannel && logger.resource.scheme === network_1.Schemas.vscodeRemote;
                    const id = hasToAppendRemote ? `${logger.id}.remote` : logger.id;
                    const label = hasToAppendRemote ? nls.localize(1, null, logger.name ?? logger.id) : logger.name ?? logger.id;
                    this.b.registerChannel({ id, label, file: logger.resource, log: true, extensionId: logger.extensionId });
                    disposables.add((0, lifecycle_1.$ic)(() => this.b.removeChannel(id)));
                    if (remoteLogger) {
                        this.t(remoteLogger);
                    }
                }
                catch (error) {
                    if (!(0, errors_1.$2)(error)) {
                        this.f.error('Error while registering log channel', logger.resource.toString(), (0, errors_1.$8)(error));
                    }
                }
            });
            disposables.add((0, lifecycle_1.$ic)(() => promise.cancel()));
            this.c.set(logger.resource.toString(), disposables);
        }
        u(logger) {
            this.c.deleteAndDispose(logger.resource.toString());
        }
        async w(file, trial, token) {
            const exists = await this.j.exists(file);
            if (exists) {
                return;
            }
            if (token.isCancellationRequested) {
                throw new errors_1.$3();
            }
            if (trial > 10) {
                throw new Error(`Timed out while waiting for file to be created`);
            }
            this.f.debug(`[Registering Log Channel] File does not exist. Waiting for 1s to retry.`, file.toString());
            await (0, async_1.$Hg)(1000, token);
            await this.w(file, trial + 1, token);
        }
        y() {
            (0, actions_1.$Xu)(class ShowWindowLogAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: logConstants_1.$nhb,
                        title: { value: nls.localize(2, null), original: 'Show Window Log' },
                        category: actionCommonCategories_1.$Nl.Developer,
                        f1: true
                    });
                }
                async run(servicesAccessor) {
                    const outputService = servicesAccessor.get(output_1.$eJ);
                    outputService.showChannel(logConstants_1.$mhb);
                }
            });
        }
    };
    LogOutputChannels = __decorate([
        __param(0, log_1.$5i),
        __param(1, log_1.$6i),
        __param(2, contextkey_1.$3i),
        __param(3, files_1.$6j),
        __param(4, uriIdentity_1.$Ck)
    ], LogOutputChannels);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LogOutputChannels, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=logs.contribution.js.map