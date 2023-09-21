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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/platform/layout/browser/layoutService", "vs/editor/browser/services/codeEditorService", "vs/platform/instantiation/common/extensions"], function (require, exports, dom, event_1, layoutService_1, codeEditorService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H8b = void 0;
    let StandaloneLayoutService = class StandaloneLayoutService {
        get dimension() {
            if (!this.a) {
                this.a = dom.$AO(window.document.body);
            }
            return this.a;
        }
        get hasContainer() {
            return false;
        }
        get container() {
            // On a page, multiple editors can be created. Therefore, there are multiple containers, not
            // just a single one. Please use `ICodeEditorService` to get the current focused code editor
            // and use its container if necessary. You can also instantiate `EditorScopedLayoutService`
            // which implements `ILayoutService` but is not a part of the service collection because
            // it is code editor instance specific.
            throw new Error(`ILayoutService.container is not available in the standalone editor!`);
        }
        focus() {
            this.b.getFocusedCodeEditor()?.focus();
        }
        constructor(b) {
            this.b = b;
            this.onDidLayout = event_1.Event.None;
            this.offset = { top: 0, quickPickTop: 0 };
        }
    };
    StandaloneLayoutService = __decorate([
        __param(0, codeEditorService_1.$nV)
    ], StandaloneLayoutService);
    let $H8b = class $H8b extends StandaloneLayoutService {
        get hasContainer() {
            return false;
        }
        get container() {
            return this.c;
        }
        constructor(c, codeEditorService) {
            super(codeEditorService);
            this.c = c;
        }
    };
    exports.$H8b = $H8b;
    exports.$H8b = $H8b = __decorate([
        __param(1, codeEditorService_1.$nV)
    ], $H8b);
    (0, extensions_1.$mr)(layoutService_1.$XT, StandaloneLayoutService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=standaloneLayoutService.js.map