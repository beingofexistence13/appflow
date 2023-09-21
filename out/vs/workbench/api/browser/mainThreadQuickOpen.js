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
define(["require", "exports", "vs/platform/quickinput/common/quickInput", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/uri"], function (require, exports, quickInput_1, extHost_protocol_1, extHostCustomers_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadQuickOpen = void 0;
    function reviveIconPathUris(iconPath) {
        iconPath.dark = uri_1.URI.revive(iconPath.dark);
        if (iconPath.light) {
            iconPath.light = uri_1.URI.revive(iconPath.light);
        }
    }
    let MainThreadQuickOpen = class MainThreadQuickOpen {
        constructor(extHostContext, quickInputService) {
            this._items = {};
            // ---- QuickInput
            this.sessions = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostQuickOpen);
            this._quickInputService = quickInputService;
        }
        dispose() {
        }
        $show(instance, options, token) {
            const contents = new Promise((resolve, reject) => {
                this._items[instance] = { resolve, reject };
            });
            options = {
                ...options,
                onDidFocus: el => {
                    if (el) {
                        this._proxy.$onItemSelected(el.handle);
                    }
                }
            };
            if (options.canPickMany) {
                return this._quickInputService.pick(contents, options, token).then(items => {
                    if (items) {
                        return items.map(item => item.handle);
                    }
                    return undefined;
                });
            }
            else {
                return this._quickInputService.pick(contents, options, token).then(item => {
                    if (item) {
                        return item.handle;
                    }
                    return undefined;
                });
            }
        }
        $setItems(instance, items) {
            if (this._items[instance]) {
                this._items[instance].resolve(items);
                delete this._items[instance];
            }
            return Promise.resolve();
        }
        $setError(instance, error) {
            if (this._items[instance]) {
                this._items[instance].reject(error);
                delete this._items[instance];
            }
            return Promise.resolve();
        }
        // ---- input
        $input(options, validateInput, token) {
            const inputOptions = Object.create(null);
            if (options) {
                inputOptions.title = options.title;
                inputOptions.password = options.password;
                inputOptions.placeHolder = options.placeHolder;
                inputOptions.valueSelection = options.valueSelection;
                inputOptions.prompt = options.prompt;
                inputOptions.value = options.value;
                inputOptions.ignoreFocusLost = options.ignoreFocusOut;
            }
            if (validateInput) {
                inputOptions.validateInput = (value) => {
                    return this._proxy.$validateInput(value);
                };
            }
            return this._quickInputService.input(inputOptions, token);
        }
        $createOrUpdate(params) {
            const sessionId = params.id;
            let session = this.sessions.get(sessionId);
            if (!session) {
                const input = params.type === 'quickPick' ? this._quickInputService.createQuickPick() : this._quickInputService.createInputBox();
                input.onDidAccept(() => {
                    this._proxy.$onDidAccept(sessionId);
                });
                input.onDidTriggerButton(button => {
                    this._proxy.$onDidTriggerButton(sessionId, button.handle);
                });
                input.onDidChangeValue(value => {
                    this._proxy.$onDidChangeValue(sessionId, value);
                });
                input.onDidHide(() => {
                    this._proxy.$onDidHide(sessionId);
                });
                if (params.type === 'quickPick') {
                    // Add extra events specific for quickpick
                    const quickpick = input;
                    quickpick.onDidChangeActive(items => {
                        this._proxy.$onDidChangeActive(sessionId, items.map(item => item.handle));
                    });
                    quickpick.onDidChangeSelection(items => {
                        this._proxy.$onDidChangeSelection(sessionId, items.map(item => item.handle));
                    });
                    quickpick.onDidTriggerItemButton((e) => {
                        this._proxy.$onDidTriggerItemButton(sessionId, e.item.handle, e.button.handle);
                    });
                }
                session = {
                    input,
                    handlesToItems: new Map()
                };
                this.sessions.set(sessionId, session);
            }
            const { input, handlesToItems } = session;
            for (const param in params) {
                if (param === 'id' || param === 'type') {
                    continue;
                }
                if (param === 'visible') {
                    if (params.visible) {
                        input.show();
                    }
                    else {
                        input.hide();
                    }
                }
                else if (param === 'items') {
                    handlesToItems.clear();
                    params[param].forEach((item) => {
                        if (item.type === 'separator') {
                            return;
                        }
                        if (item.buttons) {
                            item.buttons = item.buttons.map((button) => {
                                if (button.iconPath) {
                                    reviveIconPathUris(button.iconPath);
                                }
                                return button;
                            });
                        }
                        handlesToItems.set(item.handle, item);
                    });
                    input[param] = params[param];
                }
                else if (param === 'activeItems' || param === 'selectedItems') {
                    input[param] = params[param]
                        .filter((handle) => handlesToItems.has(handle))
                        .map((handle) => handlesToItems.get(handle));
                }
                else if (param === 'buttons') {
                    input[param] = params.buttons.map(button => {
                        if (button.handle === -1) {
                            return this._quickInputService.backButton;
                        }
                        if (button.iconPath) {
                            reviveIconPathUris(button.iconPath);
                        }
                        return button;
                    });
                }
                else {
                    input[param] = params[param];
                }
            }
            return Promise.resolve(undefined);
        }
        $dispose(sessionId) {
            const session = this.sessions.get(sessionId);
            if (session) {
                session.input.dispose();
                this.sessions.delete(sessionId);
            }
            return Promise.resolve(undefined);
        }
    };
    exports.MainThreadQuickOpen = MainThreadQuickOpen;
    exports.MainThreadQuickOpen = MainThreadQuickOpen = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadQuickOpen),
        __param(1, quickInput_1.IQuickInputService)
    ], MainThreadQuickOpen);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFF1aWNrT3Blbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkUXVpY2tPcGVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFoRyxTQUFTLGtCQUFrQixDQUFDLFFBQWdEO1FBQzNFLFFBQVEsQ0FBQyxJQUFJLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO1lBQ25CLFFBQVEsQ0FBQyxLQUFLLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUM7SUFDRixDQUFDO0lBR00sSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBbUI7UUFTL0IsWUFDQyxjQUErQixFQUNYLGlCQUFxQztZQVB6QyxXQUFNLEdBR2xCLEVBQUUsQ0FBQztZQW9GUixrQkFBa0I7WUFFVixhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7WUFoRnZELElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzdDLENBQUM7UUFFTSxPQUFPO1FBQ2QsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFnQixFQUFFLE9BQTRDLEVBQUUsS0FBd0I7WUFDN0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQXFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNwRixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQzdDLENBQUMs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