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
    exports.CommentMenus = void 0;
    let CommentMenus = class CommentMenus {
        constructor(menuService) {
            this.menuService = menuService;
        }
        getCommentThreadTitleActions(contextKeyService) {
            return this.getMenu(actions_1.MenuId.CommentThreadTitle, contextKeyService);
        }
        getCommentThreadActions(contextKeyService) {
            return this.getMenu(actions_1.MenuId.CommentThreadActions, contextKeyService);
        }
        getCommentEditorActions(contextKeyService) {
            return this.getMenu(actions_1.MenuId.CommentEditorActions, contextKeyService);
        }
        getCommentThreadAdditionalActions(contextKeyService) {
            return this.getMenu(actions_1.MenuId.CommentThreadAdditionalActions, contextKeyService);
        }
        getCommentTitleActions(comment, contextKeyService) {
            return this.getMenu(actions_1.MenuId.CommentTitle, contextKeyService);
        }
        getCommentActions(comment, contextKeyService) {
            return this.getMenu(actions_1.MenuId.CommentActions, contextKeyService);
        }
        getCommentThreadTitleContextActions(contextKeyService) {
            return this.getMenu(actions_1.MenuId.CommentThreadTitleContext, contextKeyService);
        }
        getMenu(menuId, contextKeyService) {
            const menu = this.menuService.createMenu(menuId, contextKeyService);
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, result, 'inline');
            return menu;
        }
        dispose() {
        }
    };
    exports.CommentMenus = CommentMenus;
    exports.CommentMenus = CommentMenus = __decorate([
        __param(0, actions_1.IMenuService)
    ], CommentMenus);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudE1lbnVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50TWVudXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU3pGLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7UUFDeEIsWUFDZ0MsV0FBeUI7WUFBekIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFDckQsQ0FBQztRQUVMLDRCQUE0QixDQUFDLGlCQUFxQztZQUNqRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQU0sQ0FBQyxrQkFBa0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCx1QkFBdUIsQ0FBQyxpQkFBcUM7WUFDNUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFNLENBQUMsb0JBQW9CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsdUJBQXVCLENBQUMsaUJBQXFDO1lBQzVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBTSxDQUFDLG9CQUFvQixFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDckUsQ0FBQztRQUVELGlDQUFpQyxDQUFDLGlCQUFxQztZQUN0RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQU0sQ0FBQyw4QkFBOEIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxzQkFBc0IsQ0FBQyxPQUFnQixFQUFFLGlCQUFxQztZQUM3RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQU0sQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsaUJBQWlCLENBQUMsT0FBZ0IsRUFBRSxpQkFBcUM7WUFDeEUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFNLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELG1DQUFtQyxDQUFDLGlCQUFxQztZQUN4RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQU0sQ0FBQyx5QkFBeUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFTyxPQUFPLENBQUMsTUFBYyxFQUFFLGlCQUFxQztZQUNwRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUVwRSxNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7WUFDOUIsTUFBTSxTQUFTLEdBQWMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBRXRDLElBQUEsMkRBQWlDLEVBQUMsSUFBSSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRXZGLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE9BQU87UUFFUCxDQUFDO0tBQ0QsQ0FBQTtJQWhEWSxvQ0FBWTsyQkFBWixZQUFZO1FBRXRCLFdBQUEsc0JBQVksQ0FBQTtPQUZGLFlBQVksQ0FnRHhCIn0=