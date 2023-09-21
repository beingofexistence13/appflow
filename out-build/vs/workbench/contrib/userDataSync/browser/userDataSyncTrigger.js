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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/common/views", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/preferences/browser/keybindingsEditorInput", "vs/workbench/services/preferences/common/preferencesEditorInput"], function (require, exports, event_1, lifecycle_1, platform_1, resources_1, userDataProfile_1, userDataSync_1, views_1, extensions_1, editorService_1, host_1, keybindingsEditorInput_1, preferencesEditorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JZb = void 0;
    let $JZb = class $JZb extends lifecycle_1.$kc {
        constructor(editorService, a, viewsService, userDataAutoSyncService, hostService) {
            super();
            this.a = a;
            const event = event_1.Event.filter(event_1.Event.any(event_1.Event.map(editorService.onDidActiveEditorChange, () => this.b(editorService.activeEditor)), event_1.Event.map(event_1.Event.filter(viewsService.onDidChangeViewContainerVisibility, e => e.id === extensions_1.$Ofb && e.visible), e => e.id)), source => source !== undefined);
            if (platform_1.$o) {
                this.B(event_1.Event.debounce(event_1.Event.any(event_1.Event.map(hostService.onDidChangeFocus, () => 'windowFocus'), event_1.Event.map(event, source => source)), (last, source) => last ? [...last, source] : [source], 1000)(sources => userDataAutoSyncService.triggerSync(sources, true, false)));
            }
            else {
                this.B(event(source => userDataAutoSyncService.triggerSync([source], true, false)));
            }
        }
        b(editorInput) {
            if (!editorInput) {
                return undefined;
            }
            if (editorInput instanceof preferencesEditorInput_1.$Eyb) {
                return 'settingsEditor';
            }
            if (editorInput instanceof keybindingsEditorInput_1.$Dyb) {
                return 'keybindingsEditor';
            }
            const resource = editorInput.resource;
            if ((0, resources_1.$bg)(resource, this.a.defaultProfile.settingsResource)) {
                return 'settingsEditor';
            }
            if ((0, resources_1.$bg)(resource, this.a.defaultProfile.keybindingsResource)) {
                return 'keybindingsEditor';
            }
            return undefined;
        }
    };
    exports.$JZb = $JZb;
    exports.$JZb = $JZb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, userDataProfile_1.$Ek),
        __param(2, views_1.$$E),
        __param(3, userDataSync_1.$Sgb),
        __param(4, host_1.$VT)
    ], $JZb);
});
//# sourceMappingURL=userDataSyncTrigger.js.map