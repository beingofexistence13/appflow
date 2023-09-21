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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorService"], function (require, exports, event_1, instantiation_1, extensions_1, lifecycle_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BD = exports.$AD = void 0;
    exports.$AD = (0, instantiation_1.$Bh)('workingCopyEditorService');
    let $BD = class $BD extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            this.a = this.B(new event_1.$fd());
            this.onDidRegisterHandler = this.a.event;
            this.b = new Set();
        }
        registerHandler(handler) {
            // Add to registry and emit as event
            this.b.add(handler);
            this.a.fire(handler);
            return (0, lifecycle_1.$ic)(() => this.b.delete(handler));
        }
        findEditor(workingCopy) {
            for (const editorIdentifier of this.c.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (this.f(workingCopy, editorIdentifier.editor)) {
                    return editorIdentifier;
                }
            }
            return undefined;
        }
        f(workingCopy, editor) {
            for (const handler of this.b) {
                if (handler.isOpen(workingCopy, editor)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.$BD = $BD;
    exports.$BD = $BD = __decorate([
        __param(0, editorService_1.$9C)
    ], $BD);
    // Register Service
    (0, extensions_1.$mr)(exports.$AD, $BD, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workingCopyEditorService.js.map