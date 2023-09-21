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
    exports.$Ikb = void 0;
    function reviveIconPathUris(iconPath) {
        iconPath.dark = uri_1.URI.revive(iconPath.dark);
        if (iconPath.light) {
            iconPath.light = uri_1.URI.revive(iconPath.light);
        }
    }
    let $Ikb = class $Ikb {
        constructor(extHostContext, quickInputService) {
            this.c = {};
            // ---- QuickInput
            this.d = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostQuickOpen);
            this.b = quickInputService;
        }
        dispose() {
        }
        $show(instance, options, token) {
            const contents = new Promise((resolve, reject) => {
                this.c[instance] = { resolve, reject };
            });
            options = {
                ...options,
                onDidFocus: el => {
                    if (el) {
                        this.a.$onItemSelected(el.handle);
                    }
                }
            };
            if (options.canPickMany) {
                return this.b.pick(contents, options, token).then(items => {
                    if (items) {
                        return items.map(item => item.handle);
                    }
                    return undefined;
                });
            }
            else {
                return this.b.pick(contents, options, token).then(item => {
                    if (item) {
                        return item.handle;
                    }
                    return undefined;
                });
            }
        }
        $setItems(instance, items) {
            if (this.c[instance]) {
                this.c[instance].resolve(items);
                delete this.c[instance];
            }
            return Promise.resolve();
        }
        $setError(instance, error) {
            if (this.c[instance]) {
                this.c[instance].reject(error);
                delete this.c[instance];
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
                    return this.a.$validateInput(value);
                };
            }
            return this.b.input(inputOptions, token);
        }
        $createOrUpdate(params) {
            const sessionId = params.id;
            let session = this.d.get(sessionId);
            if (!session) {
                const input = params.type === 'quickPick' ? this.b.createQuickPick() : this.b.createInputBox();
                input.onDidAccept(() => {
                    this.a.$onDidAccept(sessionId);
                });
                input.onDidTriggerButton(button => {
                    this.a.$onDidTriggerButton(sessionId, button.handle);
                });
                input.onDidChangeValue(value => {
                    this.a.$onDidChangeValue(sessionId, value);
                });
                input.onDidHide(() => {
                    this.a.$onDidHide(sessionId);
                });
                if (params.type === 'quickPick') {
                    // Add extra events specific for quickpick
                    const quickpick = input;
                    quickpick.onDidChangeActive(items => {
                        this.a.$onDidChangeActive(sessionId, items.map(item => item.handle));
                    });
                    quickpick.onDidChangeSelection(items => {
                        this.a.$onDidChangeSelection(sessionId, items.map(item => item.handle));
                    });
                    quickpick.onDidTriggerItemButton((e) => {
                        this.a.$onDidTriggerItemButton(sessionId, e.item.handle, e.button.handle);
                    });
                }
                session = {
                    input,
                    handlesToItems: new Map()
                };
                this.d.set(sessionId, session);
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
                            return this.b.backButton;
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
            const session = this.d.get(sessionId);
            if (session) {
                session.input.dispose();
                this.d.delete(sessionId);
            }
            return Promise.resolve(undefined);
        }
    };
    exports.$Ikb = $Ikb;
    exports.$Ikb = $Ikb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadQuickOpen),
        __param(1, quickInput_1.$Gq)
    ], $Ikb);
});
//# sourceMappingURL=mainThreadQuickOpen.js.map