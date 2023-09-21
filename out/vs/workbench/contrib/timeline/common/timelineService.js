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
define(["require", "exports", "vs/base/common/event", "vs/platform/log/common/log", "./timeline", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, event_1, log_1, timeline_1, views_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimelineService = exports.TimelineHasProviderContext = void 0;
    exports.TimelineHasProviderContext = new contextkey_1.RawContextKey('timelineHasProvider', false);
    let TimelineService = class TimelineService {
        constructor(logService, viewsService, configurationService, contextKeyService) {
            this.logService = logService;
            this.viewsService = viewsService;
            this.configurationService = configurationService;
            this.contextKeyService = contextKeyService;
            this._onDidChangeProviders = new event_1.Emitter();
            this.onDidChangeProviders = this._onDidChangeProviders.event;
            this._onDidChangeTimeline = new event_1.Emitter();
            this.onDidChangeTimeline = this._onDidChangeTimeline.event;
            this._onDidChangeUri = new event_1.Emitter();
            this.onDidChangeUri = this._onDidChangeUri.event;
            this.providers = new Map();
            this.providerSubscriptions = new Map();
            this.hasProviderContext = exports.TimelineHasProviderContext.bindTo(this.contextKeyService);
            this.updateHasProviderContext();
        }
        getSources() {
            return [...this.providers.values()].map(p => ({ id: p.id, label: p.label }));
        }
        getTimeline(id, uri, options, tokenSource) {
            this.logService.trace(`TimelineService#getTimeline(${id}): uri=${uri.toString()}`);
            const provider = this.providers.get(id);
            if (provider === undefined) {
                return undefined;
            }
            if (typeof provider.scheme === 'string') {
                if (provider.scheme !== '*' && provider.scheme !== uri.scheme) {
                    return undefined;
                }
            }
            else if (!provider.scheme.includes(uri.scheme)) {
                return undefined;
            }
            return {
                result: provider.provideTimeline(uri, options, tokenSource.token)
                    .then(result => {
                    if (result === undefined) {
                        return undefined;
                    }
                    result.items = result.items.map(item => ({ ...item, source: provider.id }));
                    result.items.sort((a, b) => (b.timestamp - a.timestamp) || b.source.localeCompare(a.source, undefined, { numeric: true, sensitivity: 'base' }));
                    return result;
                }),
                options: options,
                source: provider.id,
                tokenSource: tokenSource,
                uri: uri
            };
        }
        registerTimelineProvider(provider) {
            this.logService.trace(`TimelineService#registerTimelineProvider: id=${provider.id}`);
            const id = provider.id;
            const existing = this.providers.get(id);
            if (existing) {
                // For now to deal with https://github.com/microsoft/vscode/issues/89553 allow any overwritting here (still will be blocked in the Extension Host)
                // TODO@eamodio: Ultimately will need to figure out a way to unregister providers when the Extension Host restarts/crashes
                // throw new Error(`Timeline Provider ${id} already exists.`);
                try {
                    existing?.dispose();
                }
                catch { }
            }
            this.providers.set(id, provider);
            this.updateHasProviderContext();
            if (provider.onDidChange) {
                this.providerSubscriptions.set(id, provider.onDidChange(e => this._onDidChangeTimeline.fire(e)));
            }
            this._onDidChangeProviders.fire({ added: [id] });
            return {
                dispose: () => {
                    this.providers.delete(id);
                    this._onDidChangeProviders.fire({ removed: [id] });
                }
            };
        }
        unregisterTimelineProvider(id) {
            this.logService.trace(`TimelineService#unregisterTimelineProvider: id=${id}`);
            if (!this.providers.has(id)) {
                return;
            }
            this.providers.delete(id);
            this.providerSubscriptions.delete(id);
            this.updateHasProviderContext();
            this._onDidChangeProviders.fire({ removed: [id] });
        }
        setUri(uri) {
            this.viewsService.openView(timeline_1.TimelinePaneId, true);
            this._onDidChangeUri.fire(uri);
        }
        updateHasProviderContext() {
            this.hasProviderContext.set(this.providers.size !== 0);
        }
    };
    exports.TimelineService = TimelineService;
    exports.TimelineService = TimelineService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, views_1.IViewsService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, contextkey_1.IContextKeyService)
    ], TimelineService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGltZWxpbmUvY29tbW9uL3RpbWVsaW5lU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZbkYsUUFBQSwwQkFBMEIsR0FBRyxJQUFJLDBCQUFhLENBQVUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFNUYsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtRQWUzQixZQUNjLFVBQXdDLEVBQ3RDLFlBQXFDLEVBQzdCLG9CQUFxRCxFQUN4RCxpQkFBK0M7WUFIckMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUM1QixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNuQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFoQm5ELDBCQUFxQixHQUFHLElBQUksZUFBTyxFQUFnQyxDQUFDO1lBQzVFLHlCQUFvQixHQUF3QyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBRXJGLHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUF1QixDQUFDO1lBQ2xFLHdCQUFtQixHQUErQixJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBQzFFLG9CQUFlLEdBQUcsSUFBSSxlQUFPLEVBQU8sQ0FBQztZQUM3QyxtQkFBYyxHQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBR2hELGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztZQUNoRCwwQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztZQVF2RSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0NBQTBCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3BG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