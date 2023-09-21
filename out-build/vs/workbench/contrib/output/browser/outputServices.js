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
    exports.$mVb = exports.$lVb = void 0;
    const OUTPUT_ACTIVE_CHANNEL_KEY = 'output.activechannel';
    let OutputChannel = class OutputChannel extends lifecycle_1.$kc {
        constructor(outputChannelDescriptor, outputChannelModelService, languageService) {
            super();
            this.outputChannelDescriptor = outputChannelDescriptor;
            this.scrollLock = false;
            this.id = outputChannelDescriptor.id;
            this.label = outputChannelDescriptor.label;
            this.uri = uri_1.URI.from({ scheme: output_1.$8I, path: this.id });
            this.model = this.B(outputChannelModelService.createOutputChannelModel(this.id, this.uri, outputChannelDescriptor.languageId ? languageService.createById(outputChannelDescriptor.languageId) : languageService.createByMimeType(outputChannelDescriptor.log ? output_1.$0I : output_1.$7I), outputChannelDescriptor.file));
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
        __param(1, outputChannelModelService_1.$fVb),
        __param(2, language_1.$ct)
    ], OutputChannel);
    let $lVb = class $lVb extends lifecycle_1.$kc {
        constructor(j, m, textModelResolverService, n, r, s, contextKeyService) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.a = new Map();
            this.f = this.B(new event_1.$fd());
            this.onActiveOutputChannel = this.f.event;
            this.b = this.j.get(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */, '');
            this.g = output_1.$gJ.bindTo(contextKeyService);
            this.g.set(this.b);
            this.B(this.onActiveOutputChannel(channel => this.g.set(channel)));
            this.h = output_1.$cJ.bindTo(contextKeyService);
            // Register as text model content provider for output
            textModelResolverService.registerTextModelContentProvider(output_1.$8I, this);
            m.createInstance(outputLinkProvider_1.$jVb);
            // Create output channels for already registered channels
            const registry = platform_1.$8m.as(output_1.$fJ.OutputChannels);
            for (const channelIdentifier of registry.getChannels()) {
                this.t(channelIdentifier.id);
            }
            this.B(registry.onDidRegisterChannel(this.t, this));
            // Set active channel to first channel if not set
            if (!this.c) {
                const channels = this.getChannelDescriptors();
                this.y(channels && channels.length > 0 ? this.getChannel(channels[0].id) : undefined);
            }
            this.B(event_1.Event.filter(this.s.onDidChangeViewVisibility, e => e.id === output_1.$aJ && e.visible)(() => {
                if (this.c) {
                    this.s.getActiveViewWithId(output_1.$aJ)?.showChannel(this.c, true);
                }
            }));
            this.B(this.r.onDidShutdown(() => this.dispose()));
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
            if (this.c?.id !== channel?.id) {
                this.y(channel);
                this.f.fire(id);
            }
            const outputView = await this.s.openView(output_1.$aJ, !preserveFocus);
            if (outputView && channel) {
                outputView.showChannel(channel, !!preserveFocus);
            }
        }
        getChannel(id) {
            return this.a.get(id);
        }
        getChannelDescriptor(id) {
            return platform_1.$8m.as(output_1.$fJ.OutputChannels).getChannel(id);
        }
        getChannelDescriptors() {
            return platform_1.$8m.as(output_1.$fJ.OutputChannels).getChannels();
        }
        getActiveChannel() {
            return this.c;
        }
        async t(channelId) {
            const channel = this.u(channelId);
            this.a.set(channelId, channel);
            if (!this.c || this.b === channelId) {
                this.y(channel);
                this.f.fire(channelId);
                const outputView = this.s.getActiveViewWithId(output_1.$aJ);
                outputView?.showChannel(channel, true);
            }
        }
        u(id) {
            const channelDisposables = [];
            const channel = this.w(id);
            channel.model.onDispose(() => {
                if (this.c === channel) {
                    const channels = this.getChannelDescriptors();
                    const channel = channels.length ? this.getChannel(channels[0].id) : undefined;
                    if (channel && this.s.isViewVisible(output_1.$aJ)) {
                        this.showChannel(channel.id);
                    }
                    else {
                        this.y(undefined);
                    }
                }
                platform_1.$8m.as(output_1.$fJ.OutputChannels).removeChannel(id);
                (0, lifecycle_1.$fc)(channelDisposables);
            }, channelDisposables);
            return channel;
        }
        w(id) {
            const channelData = platform_1.$8m.as(output_1.$fJ.OutputChannels).getChannel(id);
            if (!channelData) {
                this.n.error(`Channel '${id}' is not registered yet`);
                throw new Error(`Channel '${id}' is not registered yet`);
            }
            return this.m.createInstance(OutputChannel, channelData);
        }
        y(channel) {
            this.c = channel;
            this.h.set(!!channel?.outputChannelDescriptor?.file && channel?.outputChannelDescriptor?.log);
            if (this.c) {
                this.j.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.c.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.j.remove(OUTPUT_ACTIVE_CHANNEL_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
    };
    exports.$lVb = $lVb;
    exports.$lVb = $lVb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, instantiation_1.$Ah),
        __param(2, resolverService_1.$uA),
        __param(3, log_1.$5i),
        __param(4, lifecycle_2.$7y),
        __param(5, views_1.$$E),
        __param(6, contextkey_1.$3i)
    ], $lVb);
    let $mVb = class $mVb {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = new Map();
        }
        provideTextContent(resource) {
            if (resource.scheme === output_1.$$I) {
                const channelModel = this.f(resource);
                if (channelModel) {
                    return channelModel.loadModel();
                }
            }
            return null;
        }
        f(resource) {
            const channelId = resource.path;
            let channelModel = this.a.get(channelId);
            if (!channelModel) {
                const channelDisposables = [];
                const outputChannelDescriptor = this.b.getChannelDescriptors().filter(({ id }) => id === channelId)[0];
                if (outputChannelDescriptor && outputChannelDescriptor.file) {
                    channelModel = this.c.createOutputChannelModel(channelId, resource, outputChannelDescriptor.languageId ? this.d.createById(outputChannelDescriptor.languageId) : this.d.createByMimeType(outputChannelDescriptor.log ? output_1.$0I : output_1.$7I), outputChannelDescriptor.file);
                    channelModel.onDispose(() => (0, lifecycle_1.$fc)(channelDisposables), channelDisposables);
                    this.a.set(channelId, channelModel);
                }
            }
            return channelModel;
        }
    };
    exports.$mVb = $mVb;
    exports.$mVb = $mVb = __decorate([
        __param(0, output_1.$eJ),
        __param(1, outputChannelModelService_1.$fVb),
        __param(2, language_1.$ct)
    ], $mVb);
});
//# sourceMappingURL=outputServices.js.map