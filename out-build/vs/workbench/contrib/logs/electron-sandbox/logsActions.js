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
define(["require", "exports", "vs/base/common/actions", "vs/nls!vs/workbench/contrib/logs/electron-sandbox/logsActions", "vs/platform/native/common/native", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/files/common/files", "vs/base/common/resources", "vs/base/common/network"], function (require, exports, actions_1, nls, native_1, environmentService_1, files_1, resources_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eac = exports.$dac = void 0;
    let $dac = class $dac extends actions_1.$gi {
        static { this.ID = 'workbench.action.openLogsFolder'; }
        static { this.TITLE = { value: nls.localize(0, null), original: 'Open Logs Folder' }; }
        constructor(id, label, a, b) {
            super(id, label);
            this.a = a;
            this.b = b;
        }
        run() {
            return this.b.showItemInFolder((0, resources_1.$ig)(this.a.logsHome, 'main.log').with({ scheme: network_1.Schemas.file }).fsPath);
        }
    };
    exports.$dac = $dac;
    exports.$dac = $dac = __decorate([
        __param(2, environmentService_1.$1$b),
        __param(3, native_1.$05b)
    ], $dac);
    let $eac = class $eac extends actions_1.$gi {
        static { this.ID = 'workbench.action.openExtensionLogsFolder'; }
        static { this.TITLE = { value: nls.localize(1, null), original: 'Open Extension Logs Folder' }; }
        constructor(id, label, a, b, c) {
            super(id, label);
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async run() {
            const folderStat = await this.b.resolve(this.a.extHostLogsPath);
            if (folderStat.children && folderStat.children[0]) {
                return this.c.showItemInFolder(folderStat.children[0].resource.with({ scheme: network_1.Schemas.file }).fsPath);
            }
        }
    };
    exports.$eac = $eac;
    exports.$eac = $eac = __decorate([
        __param(2, environmentService_1.$1$b),
        __param(3, files_1.$6j),
        __param(4, native_1.$05b)
    ], $eac);
});
//# sourceMappingURL=logsActions.js.map