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
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/registry/common/platform", "vs/workbench/services/output/common/output", "vs/workbench/contrib/output/browser/outputLinkProvider", "vs/editor/common/services/resolverService", "vs/platform/log/common/log", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/common/views", "vs/workbench/contrib/output/common/outputChannelModelService", "vs/editor/common/languages/language", "vs/platform/contextkey/common/contextkey"], function (require, exports, event_1, uri_1, lifecycle_1, instantiation_1, storage_1, platform_1, output_1, outputLinkProvider_1, resolverService_1, log_1, lifecycle_2, views_1, outputChannelModelService_1, language_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogContentProvider = exports.OutputService = void 0;
    const OUTPUT_ACTIVE_CHANNEL_KEY = 'output.activechannel';
    let OutputChannel = class OutputChannel extends lifecycle_1.Disposable {
        constructor(outputChannelDescriptor, outputChannelModelService, languageService) {
            super();
            this.outputChannelDescriptor = outputChannelDescriptor;
            this.scrollLock = false;
            this.id = outputChannelDescriptor.id;
            this.label = outputChannelDescriptor.label;
            this.uri = uri_1.URI.from({ scheme: output_1.OUTPUT_SCHEME, path: this.id });
            this.model = this._register(outputChannelModelService.createOutputChannelModel(this.id, this.uri, outputChannelDescriptor.languageId ? languageService.createById(outputChannelDescriptor.languageId) : languageService.createByMimeType(outputChannelDescriptor.log ? output_1.LOG_MIME : output_1.OUTPUT_MIME), outputChannelDescriptor.file));
        }
        append(output) {
            this.model.append(output);
        }
        update(mode, till) {
            this.model.update(mode, till, true);
        }
        clear() {
            this.model.clear();
        }
        replace(value) {
            this.model.replace(value);
        }
    };
    OutputChannel = __decorate([
        __param(1, outputChannelModelService_1.IOutputChannelModelService),
        __param(2, language_1.ILanguageService)
    ], OutputChannel);
    let OutputService = class OutputService extends lifecycle_1.Disposable {
        constructor(storageService, instantiationService, textModelResolverService, logService, lifecycleService, viewsService, contextKeyService) {
            super();
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.lifecycleService = lifecycleService;
            this.viewsService = viewsService;
            this.channels = new Map();
            this._onActiveOutputChannel = this._register(new event_1.Emitter());
            this.onActiveOutputChannel = this._onActiveOutputChannel.event;
            this.activeChannelIdInStorage = this.storageService.get(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */, '');
            this.activeOutputChannelContext = output_1.ACTIVE_OUTPUT_CHANNEL_CONTEXT.bindTo(contextKeyService);
            this.activeOutputChannelContext.set(this.activeChannelIdInStorage);
            this._register(this.onActiveOutputChannel(channel => this.activeOutputChannelContext.set(channel)));
            this.activeLogOutputChannelContext = output_1.CONTEXT_ACTIVE_LOG_OUTPUT.bindTo(contextKeyService);
            // Register as text model content provider for output
            textModelResolverService.registerTextModelContentProvider(output_1.OUTPUT_SCHEME, this);
            instantiationService.createInstance(outputLinkProvider_1.OutputLinkProvider);
            // Create output channels for already registered channels
            const registry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            for (const channelIdentifier of registry.getChannels()) {
                this.onDidRegisterChannel(channelIdentifier.id);
            }
            this._register(registry.onDidRegisterChannel(this.onDidRegisterChannel, this));
            // Set active channel to first channel if not set
            if (!this.activeChannel) {
                const channels = this.getChannelDescriptors();
                this.setActiveChannel(channels && channels.length > 0 ? this.getChannel(channels[0].id) : undefined);
            }
            this._register(event_1.Event.filter(this.viewsService.onDidChangeViewVisibility, e => e.id === output_1.OUTPUT_VIEW_ID && e.visible)(() => {
                if (this.activeChannel) {
                    this.viewsService.getActiveViewWithId(output_1.OUTPUT_VIEW_ID)?.showChannel(this.activeChannel, true);
                }
            }));
            this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
        }
        provideTextContent(resource) {
            const channel = this.getChannel(resource.path);
            if (channel) {
                return channel.model.loadModel();
            }
            return null;
        }
        async showChannel(id, preserveFocus) {
            const channel = this.getChannel(id);
            if (this.activeChannel?.id !== channel?.id) {
                this.setActiveChannel(channel);
                this._onActiveOutputChannel.fire(id);
            }
            const outputView = await this.viewsService.openView(output_1.OUTPUT_VIEW_ID, !preserveFocus);
            if (outputView && channel) {
                outputView.showChannel(channel, !!preserveFocus);
            }
        }
        getChannel(id) {
            return this.channels.get(id);
        }
        getChannelDescriptor(id) {
            return platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannel(id);
        }
        getChannelDescriptors() {
            return platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels();
        }
        getActiveChannel() {
            return this.activeChannel;
        }
        async onDidRegisterChannel(channelId) {
            const channel = this.createChannel(channelId);
            this.channels.set(channelId, channel);
            if (!this.activeChannel || this.activeChannelIdInStorage === channelId) {
                this.setActiveChannel(channel);
                this._onActiveOutputChannel.fire(channelId);
                const outputView = this.viewsService.getActiveViewWithId(output_1.OUTPUT_VIEW_ID);
                outputView?.showChannel(channel, true);
            }
        }
        createChannel(id) {
            const channelDisposables = [];
            const channel = this.instantiateChannel(id);
            channel.model.onDispose(() => {
                if (this.activeChannel === channel) {
                    const channels = this.getChannelDescriptors();
                    const channel = channels.length ? this.getChannel(channels[0].id) : undefined;
                    if (channel && this.viewsService.isViewVisible(output_1.OUTPUT_VIEW_ID)) {
                        this.showChannel(channel.id);
                    }
                    else {
                        this.setActiveChannel(undefined);
                    }
                }
                platform_1.Registry.as(output_1.Extensions.OutputChannels).removeChannel(id);
                (0, lifecycle_1.dispose)(channelDisposables);
            }, channelDisposables);
            return channel;
        }
        instantiateChannel(id) {
            const channelData = platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannel(id);
            if (!channelData) {
                this.logService.error(`Channel '${id}' is not registered yet`);
                throw new Error(`Channel '${id}' is not registered yet`);
            }
            return this.instantiationService.createInstance(OutputChannel, channelData);
        }
        setActiveChannel(channel) {
            this.activeChannel = channel;
            this.activeLogOutputChannelContext.set(!!channel?.outputChannelDescriptor?.file && channel?.outputChannelDescriptor?.log);
            if (this.activeChannel) {
                this.storageService.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.activeChannel.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
    };
    exports.OutputService = OutputService;
    exports.OutputService = OutputService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, log_1.ILogService),
        __param(4, lifecycle_2.ILifecycleService),
        __param(5, views_1.IViewsService),
        __param(6, contextkey_1.IContextKeyService)
    ], OutputService);
    let LogContentProvider = class LogContentProvider {
        constructor(outputService, outputChannelModelService, languageService) {
            this.outputService = outputService;
            this.outputChannelModelService = outputChannelModelService;
            this.languageService = languageService;
            this.channelModels = new Map();
        }
        provideTextContent(resource) {
            if (resource.scheme === output_1.LOG_SCHEME) {
                const channelModel = this.getChannelModel(resource);
                if (channelModel) {
                    return channelModel.loadModel();
                }
            }
            return null;
        }
        getChannelModel(resource) {
            const channelId = resource.path;
            let channelModel = this.channelModels.get(channelId);
            if (!channelModel) {
                const channelDisposables = [];
                const outputChannelDescriptor = this.outputService.getChannelDescriptors().filter(({ id }) => id === channelId)[0];
                if (outputChannelDescriptor && outputChannelDescriptor.file) {
                    channelModel = this.outputChannelModelService.createOutputChannelModel(channelId, resource, outputChannelDescriptor.languageId ? this.languageService.createById(outputChannelDescriptor.languageId) : this.languageService.createByMimeType(outputChannelDescriptor.log ? output_1.LOG_MIME : output_1.OUTPUT_MIME), outputChannelDescriptor.file);
                    channelModel.onDispose(() => (0, lifecycle_1.dispose)(channelDisposables), channelDisposables);
                    this.channelModels.set(channelId, channelModel);
                }
            }
            return channelModel;
        }
    };
    exports.LogContentProvider = LogContentProvider;
    exports.LogContentProvider = LogContentProvider = __decorate([
        __param(0, output_1.IOutputService),
        __param(1, outputChannelModelService_1.IOutputChannelModelService),
        __param(2, language_1.ILanguageService)
    ], LogContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0U2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9vdXRwdXQvYnJvd3Nlci9vdXRwdXRTZXJ2aWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQmhHLE1BQU0seUJBQXlCLEdBQUcsc0JBQXNCLENBQUM7SUFFekQsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBUXJDLFlBQ1UsdUJBQWlELEVBQzlCLHlCQUFxRCxFQUMvRCxlQUFpQztZQUVuRCxLQUFLLEVBQUUsQ0FBQztZQUpDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFQM0QsZUFBVSxHQUFZLEtBQUssQ0FBQztZQVkzQixJQUFJLENBQUMsRUFBRSxHQUFHLHVCQUF1QixDQUFDLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQUMzQyxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsc0JBQWEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlCQUFRLENBQUMsQ0FBQyxDQUFDLG9CQUFXLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hVLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBYztZQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQTZCLEVBQUUsSUFBYTtZQUNsRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQWE7WUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsQ0FBQztLQUNELENBQUE7SUFuQ0ssYUFBYTtRQVVoQixXQUFBLHNEQUEwQixDQUFBO1FBQzFCLFdBQUEsMkJBQWdCLENBQUE7T0FYYixhQUFhLENBbUNsQjtJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxzQkFBVTtRQWM1QyxZQUNrQixjQUFnRCxFQUMxQyxvQkFBNEQsRUFDaEUsd0JBQTJDLEVBQ2pELFVBQXdDLEVBQ2xDLGdCQUFvRCxFQUN4RCxZQUE0QyxFQUN2QyxpQkFBcUM7WUFFekQsS0FBSyxFQUFFLENBQUM7WUFSMEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3pCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFckQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNqQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBaEJwRCxhQUFRLEdBQStCLElBQUksR0FBRyxFQUF5QixDQUFDO1lBSS9ELDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVUsQ0FBQyxDQUFDO1lBQ3ZFLDBCQUFxQixHQUFrQixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBZWpGLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsa0NBQTBCLEVBQUUsQ0FBQyxDQUFDO1lBQy9HLElBQUksQ0FBQywwQkFBMEIsR0FBRyxzQ0FBNkIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMxRixJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEcsSUFBSSxDQUFDLDZCQUE2QixHQUFHLGtDQUF5QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXpGLHFEQUFxRDtZQUNyRCx3QkFBd0IsQ0FBQyxnQ0FBZ0MsQ0FBQyxzQkFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9FLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsQ0FBQyxDQUFDO1lBRXhELHlEQUF5RDtZQUN6RCxNQUFNLFFBQVEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsbUJBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNoRixLQUFLLE1BQU0saUJBQWlCLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN2RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDaEQ7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUUvRSxpREFBaUQ7WUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDckc7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssdUJBQWMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUN4SCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7b0JBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQWlCLHVCQUFjLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDN0c7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVELGtCQUFrQixDQUFDLFFBQWE7WUFDL0IsTUFBTSxPQUFPLEdBQWtCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELElBQUksT0FBTyxFQUFFO2dCQUNaLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUNqQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBVSxFQUFFLGFBQXVCO1lBQ3BELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsS0FBSyxPQUFPLEVBQUUsRUFBRSxFQUFFO2dCQUMzQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDckM7WUFDRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFpQix1QkFBYyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEcsSUFBSSxVQUFVLElBQUksT0FBTyxFQUFFO2dCQUMxQixVQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDakQ7UUFDRixDQUFDO1FBRUQsVUFBVSxDQUFDLEVBQVU7WUFDcEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsb0JBQW9CLENBQUMsRUFBVTtZQUM5QixPQUFPLG1CQUFRLENBQUMsRUFBRSxDQUF5QixtQkFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQscUJBQXFCO1lBQ3BCLE9BQU8sbUJBQVEsQ0FBQyxFQUFFLENBQXlCLG1CQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckYsQ0FBQztRQUVELGdCQUFnQjtZQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLFNBQWlCO1lBQ25ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBaUIsdUJBQWMsQ0FBQyxDQUFDO2dCQUN6RixVQUFVLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN2QztRQUNGLENBQUM7UUFFTyxhQUFhLENBQUMsRUFBVTtZQUMvQixNQUFNLGtCQUFrQixHQUFrQixFQUFFLENBQUM7WUFDN0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDNUIsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLE9BQU8sRUFBRTtvQkFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQzlDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQzlFLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLHVCQUFjLENBQUMsRUFBRTt3QkFDL0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQzdCO3lCQUFNO3dCQUNOLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDakM7aUJBQ0Q7Z0JBQ0QsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLG1CQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRixJQUFBLG1CQUFPLEVBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM3QixDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUV2QixPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRU8sa0JBQWtCLENBQUMsRUFBVTtZQUNwQyxNQUFNLFdBQVcsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsbUJBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEcsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLHlCQUF5QixDQUFDLENBQUM7Z0JBQy9ELE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLHlCQUF5QixDQUFDLENBQUM7YUFDekQ7WUFDRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxPQUFrQztZQUMxRCxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQztZQUM3QixJQUFJLENBQUMsNkJBQTZCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxJQUFJLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUUxSCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxnRUFBZ0QsQ0FBQzthQUMzSDtpQkFBTTtnQkFDTixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsaUNBQXlCLENBQUM7YUFDOUU7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQS9JWSxzQ0FBYTs0QkFBYixhQUFhO1FBZXZCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxtQ0FBaUIsQ0FBQTtRQUNqQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsK0JBQWtCLENBQUE7T0FyQlIsYUFBYSxDQStJekI7SUFFTSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtRQUk5QixZQUNpQixhQUE4QyxFQUNsQyx5QkFBc0UsRUFDaEYsZUFBa0Q7WUFGbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2pCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBNEI7WUFDL0Qsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBTDdELGtCQUFhLEdBQXFDLElBQUksR0FBRyxFQUErQixDQUFDO1FBT2pHLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxRQUFhO1lBQy9CLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxtQkFBVSxFQUFFO2dCQUNuQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLFlBQVksRUFBRTtvQkFDakIsT0FBTyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUM7aUJBQ2hDO2FBQ0Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTyxlQUFlLENBQUMsUUFBYTtZQUNwQyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2hDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xCLE1BQU0sa0JBQWtCLEdBQWtCLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuSCxJQUFJLHVCQUF1QixJQUFJLHVCQUF1QixDQUFDLElBQUksRUFBRTtvQkFDNUQsWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxpQkFBUSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xVLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBQSxtQkFBTyxFQUFDLGtCQUFrQixDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztvQkFDOUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUNoRDthQUNEO1lBQ0QsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztLQUNELENBQUE7SUFuQ1ksZ0RBQWtCO2lDQUFsQixrQkFBa0I7UUFLNUIsV0FBQSx1QkFBYyxDQUFBO1FBQ2QsV0FBQSxzREFBMEIsQ0FBQTtRQUMxQixXQUFBLDJCQUFnQixDQUFBO09BUE4sa0JBQWtCLENBbUM5QiJ9