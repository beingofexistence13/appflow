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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/workbench/services/host/browser/host", "vs/workbench/services/userActivity/common/userActivityService"], function (require, exports, event_1, lifecycle_1, uri_1, opener_1, extHostCustomers_1, extHost_protocol_1, host_1, userActivityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$llb = void 0;
    let $llb = class $llb {
        constructor(extHostContext, c, d, e) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.b = new lifecycle_1.$jc();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostWindow);
            event_1.Event.latch(c.onDidChangeFocus)(this.a.$onDidChangeWindowFocus, this.a, this.b);
            e.onDidChangeIsActive(this.a.$onDidChangeWindowActive, this.a, this.b);
        }
        dispose() {
            this.b.dispose();
        }
        $getInitialState() {
            return Promise.resolve({
                isFocused: this.c.hasFocus,
                isActive: this.e.isActive,
            });
        }
        async $openUri(uriComponents, uriString, options) {
            const uri = uri_1.URI.from(uriComponents);
            let target;
            if (uriString && uri_1.URI.parse(uriString).toString() === uri.toString()) {
                // called with string and no transformation happened -> keep string
                target = uriString;
            }
            else {
                // called with URI or transformed -> use uri
                target = uri;
            }
            return this.d.open(target, {
                openExternal: true,
                allowTunneling: options.allowTunneling,
                allowContributedOpeners: options.allowContributedOpeners,
            });
        }
        async $asExternalUri(uriComponents, options) {
            const result = await this.d.resolveExternalUri(uri_1.URI.revive(uriComponents), options);
            return result.resolved;
        }
    };
    exports.$llb = $llb;
    exports.$llb = $llb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadWindow),
        __param(1, host_1.$VT),
        __param(2, opener_1.$NT),
        __param(3, userActivityService_1.$jlb)
    ], $llb);
});
//# sourceMappingURL=mainThreadWindow.js.map