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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/issue/common/issue"], function (require, exports, lifecycle_1, uri_1, extHost_protocol_1, extHostCustomers_1, issue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$stb = void 0;
    let $stb = class $stb extends lifecycle_1.$kc {
        constructor(context, c) {
            super();
            this.c = c;
            this.b = this.B(new lifecycle_1.$sc());
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostIssueReporter);
        }
        $registerIssueUriRequestHandler(extensionId) {
            const handler = {
                provideIssueUrl: async (token) => {
                    const parts = await this.a.$getIssueReporterUri(extensionId, token);
                    return uri_1.URI.from(parts);
                }
            };
            this.b.set(extensionId, this.c.registerIssueUriRequestHandler(extensionId, handler));
        }
        $unregisterIssueUriRequestHandler(extensionId) {
            this.b.deleteAndDispose(extensionId);
        }
    };
    exports.$stb = $stb;
    exports.$stb = $stb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadIssueReporter),
        __param(1, issue_1.$rtb)
    ], $stb);
});
//# sourceMappingURL=mainThreadIssueReporter.js.map