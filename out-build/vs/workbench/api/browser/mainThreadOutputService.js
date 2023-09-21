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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/services/output/common/output", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/common/views", "vs/base/common/types"], function (require, exports, platform_1, output_1, extHost_protocol_1, extHostCustomers_1, uri_1, lifecycle_1, event_1, views_1, types_1) {
    "use strict";
    var $Fkb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fkb = void 0;
    let $Fkb = class $Fkb extends lifecycle_1.$kc {
        static { $Fkb_1 = this; }
        static { this.a = new Map(); }
        constructor(extHostContext, outputService, viewsService) {
            super();
            this.c = outputService;
            this.f = viewsService;
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostOutputService);
            const setVisibleChannel = () => {
                const visibleChannel = this.f.isViewVisible(output_1.$aJ) ? this.c.getActiveChannel() : undefined;
                this.b.$setVisibleChannel(visibleChannel ? visibleChannel.id : null);
            };
            this.B(event_1.Event.any(this.c.onActiveOutputChannel, event_1.Event.filter(this.f.onDidChangeViewVisibility, ({ id }) => id === output_1.$aJ))(() => setVisibleChannel()));
            setVisibleChannel();
        }
        async $register(label, file, languageId, extensionId) {
            const idCounter = ($Fkb_1.a.get(extensionId) || 0) + 1;
            $Fkb_1.a.set(extensionId, idCounter);
            const id = `extension-output-${extensionId}-#${idCounter}-${label}`;
            const resource = uri_1.URI.revive(file);
            platform_1.$8m.as(output_1.$fJ.OutputChannels).registerChannel({ id, label, file: resource, log: false, languageId, extensionId });
            this.B((0, lifecycle_1.$ic)(() => this.$dispose(id)));
            return id;
        }
        async $update(channelId, mode, till) {
            const channel = this.g(channelId);
            if (channel) {
                if (mode === output_1.OutputChannelUpdateMode.Append) {
                    channel.update(mode);
                }
                else if ((0, types_1.$nf)(till)) {
                    channel.update(mode, till);
                }
            }
        }
        async $reveal(channelId, preserveFocus) {
            const channel = this.g(channelId);
            if (channel) {
                this.c.showChannel(channel.id, preserveFocus);
            }
        }
        async $close(channelId) {
            if (this.f.isViewVisible(output_1.$aJ)) {
                const activeChannel = this.c.getActiveChannel();
                if (activeChannel && channelId === activeChannel.id) {
                    this.f.closeView(output_1.$aJ);
                }
            }
        }
        async $dispose(channelId) {
            const channel = this.g(channelId);
            channel?.dispose();
        }
        g(channelId) {
            return this.c.getChannel(channelId);
        }
    };
    exports.$Fkb = $Fkb;
    exports.$Fkb = $Fkb = $Fkb_1 = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadOutputService),
        __param(1, output_1.$eJ),
        __param(2, views_1.$$E)
    ], $Fkb);
});
//# sourceMappingURL=mainThreadOutputService.js.map