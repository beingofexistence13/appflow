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
define(["require", "exports", "vs/platform/progress/common/progress", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/actions", "vs/platform/commands/common/commands", "vs/nls!vs/workbench/api/browser/mainThreadProgress"], function (require, exports, progress_1, extHost_protocol_1, extHostCustomers_1, actions_1, commands_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gkb = void 0;
    class ManageExtensionAction extends actions_1.$gi {
        constructor(extensionId, label, commandService) {
            super(extensionId, label, undefined, true, () => {
                return commandService.executeCommand('_extensions.manage', extensionId);
            });
        }
    }
    let $Gkb = class $Gkb {
        constructor(extHostContext, progressService, d) {
            this.d = d;
            this.b = new Map();
            this.c = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostProgress);
            this.a = progressService;
        }
        dispose() {
            this.b.forEach(handle => handle.resolve());
            this.b.clear();
        }
        async $startProgress(handle, options, extensionId) {
            const task = this.e(handle);
            if (options.location === 15 /* ProgressLocation.Notification */ && extensionId) {
                const notificationOptions = {
                    ...options,
                    location: 15 /* ProgressLocation.Notification */,
                    secondaryActions: [new ManageExtensionAction(extensionId, (0, nls_1.localize)(0, null), this.d)]
                };
                options = notificationOptions;
            }
            this.a.withProgress(options, task, () => this.c.$acceptProgressCanceled(handle));
        }
        $progressReport(handle, message) {
            const entry = this.b.get(handle);
            entry?.progress.report(message);
        }
        $progressEnd(handle) {
            const entry = this.b.get(handle);
            if (entry) {
                entry.resolve();
                this.b.delete(handle);
            }
        }
        e(handle) {
            return (progress) => {
                return new Promise(resolve => {
                    this.b.set(handle, { resolve, progress });
                });
            };
        }
    };
    exports.$Gkb = $Gkb;
    exports.$Gkb = $Gkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadProgress),
        __param(1, progress_1.$2u),
        __param(2, commands_1.$Fr)
    ], $Gkb);
});
//# sourceMappingURL=mainThreadProgress.js.map