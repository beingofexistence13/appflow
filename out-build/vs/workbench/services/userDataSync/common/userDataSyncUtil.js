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
define(["require", "exports", "vs/platform/keybinding/common/keybinding", "vs/platform/userDataSync/common/userDataSync", "vs/platform/instantiation/common/extensions", "vs/editor/common/services/resolverService", "vs/editor/common/services/textResourceConfiguration"], function (require, exports, keybinding_1, userDataSync_1, extensions_1, resolverService_1, textResourceConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let UserDataSyncUtilService = class UserDataSyncUtilService {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        async resolveDefaultIgnoredSettings() {
            return (0, userDataSync_1.$wgb)();
        }
        async resolveUserBindings(userBindings) {
            const keys = {};
            for (const userbinding of userBindings) {
                keys[userbinding] = this.a.resolveUserBinding(userbinding).map(part => part.getUserSettingsLabel()).join(' ');
            }
            return keys;
        }
        async resolveFormattingOptions(resource) {
            try {
                const modelReference = await this.b.createModelReference(resource);
                const { insertSpaces, tabSize } = modelReference.object.textEditorModel.getOptions();
                const eol = modelReference.object.textEditorModel.getEOL();
                modelReference.dispose();
                return { eol, insertSpaces, tabSize };
            }
            catch (e) {
            }
            return {
                eol: this.c.getEOL(resource),
                insertSpaces: !!this.d.getValue(resource, 'editor.insertSpaces'),
                tabSize: this.d.getValue(resource, 'editor.tabSize')
            };
        }
    };
    UserDataSyncUtilService = __decorate([
        __param(0, keybinding_1.$2D),
        __param(1, resolverService_1.$uA),
        __param(2, textResourceConfiguration_1.$GA),
        __param(3, textResourceConfiguration_1.$FA)
    ], UserDataSyncUtilService);
    (0, extensions_1.$mr)(userDataSync_1.$Tgb, UserDataSyncUtilService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userDataSyncUtil.js.map