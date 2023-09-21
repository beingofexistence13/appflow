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
define(["require", "exports", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, actions_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Glb = void 0;
    let $Glb = class $Glb {
        constructor(a) {
            this.a = a;
        }
        getCommentThreadTitleActions(contextKeyService) {
            return this.b(actions_1.$Ru.CommentThreadTitle, contextKeyService);
        }
        getCommentThreadActions(contextKeyService) {
            return this.b(actions_1.$Ru.CommentThreadActions, contextKeyService);
        }
        getCommentEditorActions(contextKeyService) {
            return this.b(actions_1.$Ru.CommentEditorActions, contextKeyService);
        }
        getCommentThreadAdditionalActions(contextKeyService) {
            return this.b(actions_1.$Ru.CommentThreadAdditionalActions, contextKeyService);
        }
        getCommentTitleActions(comment, contextKeyService) {
            return this.b(actions_1.$Ru.CommentTitle, contextKeyService);
        }
        getCommentActions(comment, contextKeyService) {
            return this.b(actions_1.$Ru.CommentActions, contextKeyService);
        }
        getCommentThreadTitleContextActions(contextKeyService) {
            return this.b(actions_1.$Ru.CommentThreadTitleContext, contextKeyService);
        }
        b(menuId, contextKeyService) {
            const menu = this.a.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true }, result, 'inline');
            return menu;
        }
        dispose() {
        }
    };
    exports.$Glb = $Glb;
    exports.$Glb = $Glb = __decorate([
        __param(0, actions_1.$Su)
    ], $Glb);
});
//# sourceMappingURL=commentMenus.js.map