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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/browser/mainThreadCustomEditors", "vs/workbench/api/browser/mainThreadWebviewPanels", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/browser/mainThreadWebviewViews", "vs/workbench/api/common/extHost.protocol", "../../services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, instantiation_1, mainThreadCustomEditors_1, mainThreadWebviewPanels_1, mainThreadWebviews_1, mainThreadWebviewViews_1, extHostProtocol, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ylb = void 0;
    let $ylb = class $ylb extends lifecycle_1.$kc {
        constructor(context, instantiationService) {
            super();
            const webviews = this.B(instantiationService.createInstance(mainThreadWebviews_1.$acb, context));
            context.set(extHostProtocol.$1J.MainThreadWebviews, webviews);
            const webviewPanels = this.B(instantiationService.createInstance(mainThreadWebviewPanels_1.$mlb, context, webviews));
            context.set(extHostProtocol.$1J.MainThreadWebviewPanels, webviewPanels);
            const customEditors = this.B(instantiationService.createInstance(mainThreadCustomEditors_1.$ulb, context, webviews, webviewPanels));
            context.set(extHostProtocol.$1J.MainThreadCustomEditors, customEditors);
            const webviewViews = this.B(instantiationService.createInstance(mainThreadWebviewViews_1.$xlb, context, webviews));
            context.set(extHostProtocol.$1J.MainThreadWebviewViews, webviewViews);
        }
    };
    exports.$ylb = $ylb;
    exports.$ylb = $ylb = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, instantiation_1.$Ah)
    ], $ylb);
});
//# sourceMappingURL=mainThreadWebviewManager.js.map