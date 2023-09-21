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
define(["require", "exports", "vs/workbench/common/editor/editorInput", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, editorInput_1, files_1, label_1, resources_1, filesConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xbb = void 0;
    /**
     * The base class for all editor inputs that open resources.
     */
    let $xbb = class $xbb extends editorInput_1.$tA {
        get capabilities() {
            let capabilities = 32 /* EditorInputCapabilities.CanSplitInGroup */;
            if (this.m.hasProvider(this.resource)) {
                if (this.n.isReadonly(this.resource)) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
                capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            }
            return capabilities;
        }
        get preferredResource() { return this.c; }
        constructor(resource, preferredResource, j, m, n) {
            super();
            this.resource = resource;
            this.j = j;
            this.m = m;
            this.n = n;
            this.u = undefined;
            this.w = undefined;
            this.z = undefined;
            this.D = undefined;
            this.G = undefined;
            this.I = undefined;
            this.L = undefined;
            this.c = preferredResource || resource;
            this.r();
        }
        r() {
            // Clear our labels on certain label related events
            this.B(this.j.onDidChangeFormatters(e => this.s(e.scheme)));
            this.B(this.m.onDidChangeFileSystemProviderRegistrations(e => this.s(e.scheme)));
            this.B(this.m.onDidChangeFileSystemProviderCapabilities(e => this.s(e.scheme)));
        }
        s(scheme) {
            if (scheme === this.c.scheme) {
                this.t();
            }
        }
        t() {
            // Clear any cached labels from before
            this.u = undefined;
            this.w = undefined;
            this.z = undefined;
            this.D = undefined;
            this.G = undefined;
            this.I = undefined;
            this.L = undefined;
            // Trigger recompute of label
            this.b.fire();
        }
        setPreferredResource(preferredResource) {
            if (!(0, resources_1.$bg)(preferredResource, this.c)) {
                this.c = preferredResource;
                this.t();
            }
        }
        getName() {
            if (typeof this.u !== 'string') {
                this.u = this.j.getUriBasenameLabel(this.c);
            }
            return this.u;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.y;
                case 2 /* Verbosity.LONG */:
                    return this.F;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    return this.C;
            }
        }
        get y() {
            if (typeof this.w !== 'string') {
                this.w = this.j.getUriBasenameLabel((0, resources_1.$hg)(this.c));
            }
            return this.w;
        }
        get C() {
            if (typeof this.z !== 'string') {
                this.z = this.j.getUriLabel((0, resources_1.$hg)(this.c), { relative: true });
            }
            return this.z;
        }
        get F() {
            if (typeof this.D !== 'string') {
                this.D = this.j.getUriLabel((0, resources_1.$hg)(this.c));
            }
            return this.D;
        }
        get H() {
            if (typeof this.G !== 'string') {
                this.G = this.getName();
            }
            return this.G;
        }
        get J() {
            if (typeof this.I !== 'string') {
                this.I = this.j.getUriLabel(this.c, { relative: true });
            }
            return this.I;
        }
        get M() {
            if (typeof this.L !== 'string') {
                this.L = this.j.getUriLabel(this.c);
            }
            return this.L;
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.H;
                case 2 /* Verbosity.LONG */:
                    return this.M;
                default:
                case 1 /* Verbosity.MEDIUM */:
                    return this.J;
            }
        }
        isReadonly() {
            return this.n.isReadonly(this.resource);
        }
    };
    exports.$xbb = $xbb;
    exports.$xbb = $xbb = __decorate([
        __param(2, label_1.$Vz),
        __param(3, files_1.$6j),
        __param(4, filesConfigurationService_1.$yD)
    ], $xbb);
});
//# sourceMappingURL=resourceEditorInput.js.map