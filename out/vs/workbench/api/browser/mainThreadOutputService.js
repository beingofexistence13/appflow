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
    var MainThreadOutputService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadOutputService = void 0;
    let MainThreadOutputService = class MainThreadOutputService extends lifecycle_1.Disposable {
        static { MainThreadOutputService_1 = this; }
        static { this._extensionIdPool = new Map(); }
        constructor(extHostContext, outputService, viewsService) {
            super();
            this._outputService = outputService;
            this._viewsService = viewsService;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostOutputService);
            const setVisibleChannel = () => {
                const visibleChannel = this._viewsService.isViewVisible(output_1.OUTPUT_VIEW_ID) ? this._outputService.getActiveChannel() : undefined;
                this._proxy.$setVisibleChannel(visibleChannel ? visibleChannel.id : null);
            };
            this._register(event_1.Event.any(this._outputService.onActiveOutputChannel, event_1.Event.filter(this._viewsService.onDidChangeViewVisibility, ({ id }) => id === output_1.OUTPUT_VIEW_ID))(() => setVisibleChannel()));
            setVisibleChannel();
        }
        async $register(label, file, languageId, extensionId) {
            const idCounter = (MainThreadOutputService_1._extensionIdPool.get(extensionId) || 0) + 1;
            MainThreadOutputService_1._extensionIdPool.set(extensionId, idCounter);
            const id = `extension-output-${extensionId}-#${idCounter}-${label}`;
            const resource = uri_1.URI.revive(file);
            platform_1.Registry.as(output_1.Extensions.OutputChannels).registerChannel({ id, label, file: resource, log: false, languageId, extensionId });
            this._register((0, lifecycle_1.toDisposable)(() => this.$dispose(id)));
            return id;
        }
        async $update(channelId, mode, till) {
            const channel = this._getChannel(channelId);
            if (channel) {
                if (mode === output_1.OutputChannelUpdateMode.Append) {
                    channel.update(mode);
                }
                else if ((0, types_1.isNumber)(till)) {
                    channel.update(mode, till);
                }
            }
        }
        async $reveal(channelId, preserveFocus) {
            const channel = this._getChannel(channelId);
            if (channel) {
                this._outputService.showChannel(channel.id, preserveFocus);
            }
        }
        async $close(channelId) {
            if (this._viewsService.isViewVisible(output_1.OUTPUT_VIEW_ID)) {
                const activeChannel = this._outputService.getActiveChannel();
                if (activeChannel && channelId === activeChannel.id) {
                    this._viewsService.closeView(output_1.OUTPUT_VIEW_ID);
                }
            }
        }
        async $dispose(channelId) {
            const channel = this._getChannel(channelId);
            channel?.dispose();
        }
        _getChannel(channelId) {
            return this._outputService.getChannel(channelId);
        }
    };
    exports.MainThreadOutputService = MainThreadOutputService;
    exports.MainThreadOutputService = MainThreadOutputService = MainThreadOutputService_1 = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadOutputService),
        __param(1, output_1.IOutputService),
        __param(2, views_1.IViewsService)
    ], MainThreadOutputService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE91dHB1dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZE91dHB1dFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVOztpQkFFdkMscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQWtCLEFBQTVCLENBQTZCO1FBTTVELFlBQ0MsY0FBK0IsRUFDZixhQUE2QixFQUM5QixZQUEyQjtZQUUxQyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1lBRWxDLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFM0UsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7Z0JBQzlCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLHVCQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQzdILElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRSxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRSxhQUFLLENBQUMsTUFBTSxDQUFDLElB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