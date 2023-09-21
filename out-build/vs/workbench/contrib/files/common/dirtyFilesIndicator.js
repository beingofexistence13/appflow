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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/common/dirtyFilesIndicator", "vs/workbench/contrib/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/lifecycle", "vs/workbench/services/activity/common/activity", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, nls, files_1, lifecycle_1, lifecycle_2, activity_1, workingCopyService_1, filesConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0Lb = void 0;
    let $0Lb = class $0Lb extends lifecycle_2.$kc {
        constructor(c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = this.B(new lifecycle_2.$lc());
            this.b = 0;
            this.n();
            this.j();
        }
        j() {
            // Working copy dirty indicator
            this.B(this.g.onDidChangeDirty(workingCopy => this.m(workingCopy)));
            // Lifecycle
            this.c.onDidShutdown(() => this.dispose());
        }
        m(workingCopy) {
            const gotDirty = workingCopy.isDirty();
            if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.h.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                return; // do not indicate dirty of working copies that are auto saved after short delay
            }
            if (gotDirty || this.b > 0) {
                this.n();
            }
        }
        n() {
            const dirtyCount = this.b = this.g.dirtyCount;
            // Indicate dirty count in badge if any
            if (dirtyCount > 0) {
                this.a.value = this.f.showViewContainerActivity(files_1.$Mdb, {
                    badge: new activity_1.$IV(dirtyCount, num => num === 1 ? nls.localize(0, null) : nls.localize(1, null, dirtyCount)),
                    clazz: 'explorer-viewlet-label'
                });
            }
            else {
                this.a.clear();
            }
        }
    };
    exports.$0Lb = $0Lb;
    exports.$0Lb = $0Lb = __decorate([
        __param(0, lifecycle_1.$7y),
        __param(1, activity_1.$HV),
        __param(2, workingCopyService_1.$TC),
        __param(3, filesConfigurationService_1.$yD)
    ], $0Lb);
});
//# sourceMappingURL=dirtyFilesIndicator.js.map