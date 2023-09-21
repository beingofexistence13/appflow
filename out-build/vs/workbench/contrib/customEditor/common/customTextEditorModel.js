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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, event_1, lifecycle_1, resources_1, resolverService_1, textfiles_1) {
    "use strict";
    var $tlb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tlb = void 0;
    let $tlb = $tlb_1 = class $tlb extends lifecycle_1.$kc {
        static async create(instantiationService, viewType, resource) {
            return instantiationService.invokeFunction(async (accessor) => {
                const textModelResolverService = accessor.get(resolverService_1.$uA);
                const model = await textModelResolverService.createModelReference(resource);
                return instantiationService.createInstance($tlb_1, viewType, resource, model);
            });
        }
        constructor(viewType, f, g, h) {
            super();
            this.viewType = viewType;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeOrphaned = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeReadonly = this.c.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidChangeContent = this.m.event;
            this.B(g);
            this.a = this.h.files.get(f);
            if (this.a) {
                this.B(this.a.onDidChangeOrphaned(() => this.b.fire()));
                this.B(this.a.onDidChangeReadonly(() => this.c.fire()));
            }
            this.B(this.h.files.onDidChangeDirty(e => {
                if ((0, resources_1.$bg)(this.resource, e.resource)) {
                    this.j.fire();
                    this.m.fire();
                }
            }));
        }
        get resource() {
            return this.f;
        }
        isReadonly() {
            return this.g.object.isReadonly();
        }
        get backupId() {
            return undefined;
        }
        isDirty() {
            return this.h.isDirty(this.resource);
        }
        isOrphaned() {
            return !!this.a?.hasState(4 /* TextFileEditorModelState.ORPHAN */);
        }
        async revert(options) {
            return this.h.revert(this.resource, options);
        }
        saveCustomEditor(options) {
            return this.h.save(this.resource, options);
        }
        async saveCustomEditorAs(resource, targetResource, options) {
            return !!await this.h.saveAs(resource, targetResource, options);
        }
    };
    exports.$tlb = $tlb;
    exports.$tlb = $tlb = $tlb_1 = __decorate([
        __param(3, textfiles_1.$JD)
    ], $tlb);
});
//# sourceMappingURL=customTextEditorModel.js.map