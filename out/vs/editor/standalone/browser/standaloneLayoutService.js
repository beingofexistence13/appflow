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
    exports.EditorScopedLayoutService = void 0;
    let StandaloneLayoutService = class StandaloneLayoutService {
        get dimension() {
            if (!this._dimension) {
                this._dimension = dom.getClientArea(window.document.body);
            }
            return this._dimension;
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
            this._codeEditorService.getFocusedCodeEditor()?.focus();
        }
        constructor(_codeEditorService) {
            this._codeEditorService = _codeEditorService;
            this.onDidLayout = event_1.Event.None;
            this.offset = { top: 0, quickPickTop: 0 };
        }
    };
    StandaloneLayoutService = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService)
    ], StandaloneLayoutService);
    let EditorScopedLayoutService = class EditorScopedLayoutService extends StandaloneLayoutService {
        get hasContainer() {
            return false;
        }
        get container() {
            return this._container;
        }
        constructor(_container, codeEditorService) {
            super(codeEditorService);
            this._container = _container;
        }
    };
    exports.EditorScopedLayoutService = EditorScopedLayoutService;
    exports.EditorScopedLayoutService = EditorScopedLayoutService = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService)
    ], EditorScopedLayoutService);
    (0, extensions_1.registerSingleton)(layoutService_1.ILayoutService, StandaloneLayoutService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUxheW91dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3Ivc3RhbmRhbG9uZS9icm93c2VyL3N0YW5kYWxvbmVMYXlvdXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVFoRyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQU01QixJQUFJLFNBQVM7WUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDMUQ7WUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksWUFBWTtZQUNmLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksU0FBUztZQUNaLDRGQUE0RjtZQUM1Riw0RkFBNEY7WUFDNUYsMkZBQTJGO1lBQzNGLHdGQUF3RjtZQUN4Rix1Q0FBdUM7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFRCxLQUFLO1lBQ0osSUFBSSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDekQsQ0FBQztRQUlELFlBQ3FCLGtCQUE4QztZQUF0Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBL0I1RCxnQkFBVyxHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUE0QnZCLFdBQU0sR0FBc0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUk3RCxDQUFDO0tBRUwsQ0FBQTtJQXJDSyx1QkFBdUI7UUFrQzFCLFdBQUEsc0NBQWtCLENBQUE7T0FsQ2YsdUJBQXVCLENBcUM1QjtJQUVNLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQTBCLFNBQVEsdUJBQXVCO1FBQ3JFLElBQWEsWUFBWTtZQUN4QixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFhLFNBQVM7WUFDckIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxZQUNTLFVBQXVCLEVBQ1gsaUJBQXFDO1lBRXpELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBSGpCLGVBQVUsR0FBVixVQUFVLENBQWE7UUFJaEMsQ0FBQztLQUNELENBQUE7SUFiWSw4REFBeUI7d0NBQXpCLHlCQUF5QjtRQVNuQyxXQUFBLHNDQUFrQixDQUFBO09BVFIseUJBQXlCLENBYXJDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyw4QkFBYyxFQUFFLHVCQUF1QixvQ0FBNEIsQ0FBQyJ9