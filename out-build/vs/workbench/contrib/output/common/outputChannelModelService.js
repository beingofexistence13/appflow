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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/base/common/date", "vs/base/common/resources", "vs/workbench/contrib/output/common/outputChannelModel"], function (require, exports, extensions_1, environmentService_1, instantiation_1, files_1, date_1, resources_1, outputChannelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gVb = exports.$fVb = void 0;
    exports.$fVb = (0, instantiation_1.$Bh)('outputChannelModelService');
    let $gVb = class $gVb {
        constructor(b, c, environmentService) {
            this.b = b;
            this.c = c;
            this.d = null;
            this.a = (0, resources_1.$ig)(environmentService.windowLogsPath, `output_${(0, date_1.$7l)(new Date()).replace(/-|:|\.\d+Z$/g, '')}`);
        }
        createOutputChannelModel(id, modelUri, language, file) {
            return file ? this.c.createInstance(outputChannelModel_1.$dVb, modelUri, language, file) : this.c.createInstance(outputChannelModel_1.$eVb, id, modelUri, language, this.e);
        }
        get e() {
            if (!this.d) {
                this.d = this.b.createFolder(this.a).then(() => this.a);
            }
            return this.d;
        }
    };
    exports.$gVb = $gVb;
    exports.$gVb = $gVb = __decorate([
        __param(0, files_1.$6j),
        __param(1, instantiation_1.$Ah),
        __param(2, environmentService_1.$hJ)
    ], $gVb);
    (0, extensions_1.$mr)(exports.$fVb, $gVb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=outputChannelModelService.js.map