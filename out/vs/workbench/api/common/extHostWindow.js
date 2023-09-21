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
    var ExtHostWindow_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostWindow = exports.ExtHostWindow = void 0;
    let ExtHostWindow = class ExtHostWindow {
        static { ExtHostWindow_1 = this; }
        static { this.InitialState = {
            focused: true,
            active: true,
        }; }
        getState(extension) {
            // todo@connor4312: this can be changed to just return this._state after proposed api is finalized
            const state = this._state;
            return {
                get focused() {
                    return state.focused;
                },
                get active() {
                    (0, extensions_1.checkProposedApiEnabled)(extension, 'windowActivity');
                    return state.active;
                },
            };
        }
        constructor(extHostRpc) {
            this._onDidChangeWindowState = new event_1.Emitter();
            this.onDidChangeWindowState = this._onDidChangeWindowState.event;
            this._state = ExtHostWindow_1.InitialState;
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadWindow);
            this._proxy.$getInitialState().then(({ isFocused, isActive }) => {
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
            if (value === this._state[property]) {
                return;
            }
            this._state = { ...this._state, [property]: value };
            this._onDidChangeWindowState.fire(this._state);
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
            if ((0, strings_1.isFalsyOrWhitespace)(stringOrUri.scheme)) {
                return Promise.reject('Invalid scheme - cannot be empty');
            }
            else if (stringOrUri.scheme === network_1.Schemas.command) {
                return Promise.reject(`Invalid scheme '${stringOrUri.scheme}'`);
            }
            return this._proxy.$openUri(stringOrUri, uriAsString, options);
        }
        async asExternalUri(uri, options) {
            if ((0, strings_1.isFalsyOrWhitespace)(uri.scheme)) {
                return Promise.reject('Invalid scheme - cannot be empty');
            }
            const result = await this._proxy.$asExternalUri(uri, options);
            return uri_1.URI.from(result);
        }
    };
    exports.ExtHostWindow = ExtHostWindow;
    exports.ExtHostWindow = ExtHostWindow = ExtHostWindow_1 = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostWindow);
    exports.IExtHostWindow = (0, instantiation_1.createDecorator)('IExtHostWindow');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdpbmRvdy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RXaW5kb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhOztpQkFFVixpQkFBWSxHQUFnQjtZQUMxQyxPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxJQUFJO1NBQ1osQUFIMEIsQ0FHekI7UUFTRixRQUFRLENBQUMsU0FBaUQ7WUFDekQsa0dBQWtHO1lBQ2xHLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFFMUIsT0FBTztnQkFDTixJQUFJLE9BQU87b0JBQ1YsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO2dCQUN0QixDQUFDO2dCQUNELElBQUksTUFBTTtvQkFDVCxJQUFBLG9DQUF1QixFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNyRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3JCLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVELFlBQWdDLFVBQThCO1lBcEI3Qyw0QkFBdUIsR0FBRyxJQUFJLGVBQU8sRUFBZSxDQUFDO1lBQzdELDJCQUFzQixHQUF1QixJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDO1lBRWpGLFdBQU0sR0FBRyxlQUFhLENBQUMsWUFBWSxDQUFDO1lBa0IzQyxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO2dCQUMvRCxJQUFJLENB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