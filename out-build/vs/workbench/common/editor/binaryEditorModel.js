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
define(["require", "exports", "vs/workbench/common/editor/editorModel", "vs/platform/files/common/files", "vs/base/common/mime"], function (require, exports, editorModel_1, files_1, mime_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fvb = void 0;
    /**
     * An editor model that just represents a resource that can be loaded.
     */
    let $Fvb = class $Fvb extends editorModel_1.$xA {
        constructor(resource, g, m) {
            super();
            this.resource = resource;
            this.g = g;
            this.m = m;
            this.a = mime_1.$Hr.binary;
        }
        /**
         * The name of the binary resource.
         */
        getName() {
            return this.g;
        }
        /**
         * The size of the binary resource if known.
         */
        getSize() {
            return this.b;
        }
        /**
         * The mime of the binary resource if known.
         */
        getMime() {
            return this.a;
        }
        /**
         * The etag of the binary resource if known.
         */
        getETag() {
            return this.c;
        }
        async resolve() {
            // Make sure to resolve up to date stat for file resources
            if (this.m.hasProvider(this.resource)) {
                const stat = await this.m.stat(this.resource);
                this.c = stat.etag;
                if (typeof stat.size === 'number') {
                    this.b = stat.size;
                }
            }
            return super.resolve();
        }
    };
    exports.$Fvb = $Fvb;
    exports.$Fvb = $Fvb = __decorate([
        __param(2, files_1.$6j)
    ], $Fvb);
});
//# sourceMappingURL=binaryEditorModel.js.map