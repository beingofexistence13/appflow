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
define(["require", "exports", "vs/base/common/event", "./extHost.protocol", "vs/base/common/uri", "vs/base/common/network", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostRpcService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, event_1, extHost_protocol_1, uri_1, network_1, strings_1, instantiation_1, extHostRpcService_1, extensions_1) {
    "use strict";
    var $ccc_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dcc = exports.$ccc = void 0;
    let $ccc = class $ccc {
        static { $ccc_1 = this; }
        static { this.a = {
            focused: true,
            active: true,
        }; }
        getState(extension) {
            // todo@connor4312: this can be changed to just return this._state after proposed api is finalized
            const state = this.d;
            return {
                get focused() {
                    return state.focused;
                },
                get active() {
                    (0, extensions_1.$QF)(extension, 'windowActivity');
                    return state.active;
                },
            };
        }
        constructor(extHostRpc) {
            this.c = new event_1.$fd();
            this.onDidChangeWindowState = this.c.event;
            this.d = $ccc_1.a;
            this.b = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadWindow);
            this.b.$getInitialState().then(({ isFocused, isActive }) => {
                this.onDidChangeWindowProperty('focused', isFocused);
                this.onDidChangeWindowProperty('active', isActive);
            });
        }
        $onDidChangeWindowFocus(value) {
            this.onDidChangeWindowProperty('focused', value);
        }
        $onDidChangeWindowActive(value) {
            this.onDidChangeWindowProperty('active', value);
        }
        onDidChangeWindowProperty(property, value) {
            if (value === this.d[property]) {
                return;
            }
            this.d = { ...this.d, [property]: value };
            this.c.fire(this.d);
        }
        openUri(stringOrUri, options) {
            let uriAsString;
            if (typeof stringOrUri === 'string') {
                uriAsString = stringOrUri;
                try {
                    stringOrUri = uri_1.URI.parse(stringOrUri);
                }
                catch (e) {
                    return Promise.reject(`Invalid uri - '${stringOrUri}'`);
                }
            }
            if ((0, strings_1.$me)(stringOrUri.scheme)) {
                return Promise.reject('Invalid scheme - cannot be empty');
            }
            else if (stringOrUri.scheme === network_1.Schemas.command) {
                return Promise.reject(`Invalid scheme '${stringOrUri.scheme}'`);
            }
            return this.b.$openUri(stringOrUri, uriAsString, options);
        }
        async asExternalUri(uri, options) {
            if ((0, strings_1.$me)(uri.scheme)) {
                return Promise.reject('Invalid scheme - cannot be empty');
            }
            const result = await this.b.$asExternalUri(uri, options);
            return uri_1.URI.from(result);
        }
    };
    exports.$ccc = $ccc;
    exports.$ccc = $ccc = $ccc_1 = __decorate([
        __param(0, extHostRpcService_1.$2L)
    ], $ccc);
    exports.$dcc = (0, instantiation_1.$Bh)('IExtHostWindow');
});
//# sourceMappingURL=extHostWindow.js.map