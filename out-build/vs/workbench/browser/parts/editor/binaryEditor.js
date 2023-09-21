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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/binaryEditor", "vs/base/common/event", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/storage/common/storage", "vs/platform/files/common/files", "vs/workbench/browser/parts/editor/editorPlaceholder"], function (require, exports, nls_1, event_1, binaryEditorModel_1, storage_1, files_1, editorPlaceholder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jvb = void 0;
    /*
     * This class is only intended to be subclassed and not instantiated.
     */
    let $Jvb = class $Jvb extends editorPlaceholder_1.$Gvb {
        constructor(id, y, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            this.y = y;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeMetadata = this.r.event;
            this.s = this.B(new event_1.$fd());
            this.onDidOpenInPlace = this.s.event;
        }
        getTitle() {
            return this.input ? this.input.getName() : (0, nls_1.localize)(0, null);
        }
        async m(input, options) {
            const model = await input.resolve(options);
            // Assert Model instance
            if (!(model instanceof binaryEditorModel_1.$Fvb)) {
                throw new Error('Unable to open file as binary');
            }
            // Update metadata
            const size = model.getSize();
            this.fb(typeof size === 'number' ? files_1.$Ak.formatSize(size) : '');
            return {
                icon: '$(warning)',
                label: (0, nls_1.localize)(1, null),
                actions: [
                    {
                        label: (0, nls_1.localize)(2, null),
                        run: async () => {
                            // Open in place
                            await this.y.openInternal(input, options);
                            // Signal to listeners that the binary editor has been opened in-place
                            this.s.fire();
                        }
                    }
                ]
            };
        }
        fb(meta) {
            this.u = meta;
            this.r.fire();
        }
        getMetadata() {
            return this.u;
        }
    };
    exports.$Jvb = $Jvb;
    exports.$Jvb = $Jvb = __decorate([
        __param(4, storage_1.$Vo)
    ], $Jvb);
});
//# sourceMappingURL=binaryEditor.js.map