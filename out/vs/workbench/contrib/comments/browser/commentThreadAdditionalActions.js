/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/workbench/contrib/comments/browser/commentFormActions"], function (require, exports, dom, lifecycle_1, commentFormActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentThreadAdditionalActions = void 0;
    class CommentThreadAdditionalActions extends lifecycle_1.Disposable {
        constructor(container, _commentThread, _contextKeyService, _commentMenus, _actionRunDelegate) {
            super();
            this._commentThread = _commentThread;
            this._contextKeyService = _contextKeyService;
            this._commentMenus = _commentMenus;
            this._actionRunDelegate = _actionRunDelegate;
            this._container = dom.append(container, dom.$('.comment-additional-actions'));
            dom.append(this._container, dom.$('.section-separator'));
            this._buttonBar = dom.append(this._container, dom.$('.button-bar'));
            this._createAdditionalActions(this._buttonBar);
        }
        _showMenu() {
            this._container?.classList.remove('hidden');
        }
        _hideMenu() {
            this._container?.classList.add('hidden');
        }
        _enableDisableMenu(menu) {
            const groups = menu.getActions({ shouldForwardArgs: true });
            // Show the menu if at least one action is enabled.
            for (const group of groups) {
                const [, actions] = group;
                for (const action of actions) {
                    if (action.enabled) {
                        this._showMenu();
                        return;
                    }
                    for (const subAction of action.actions ?? []) {
                        if (subAction.enabled) {
                            this._showMenu();
                            return;
                        }
                    }
                }
            }
            this._hideMenu();
        }
        _createAdditionalActions(container) {
            const menu = this._commentMenus.getCommentThreadAdditionalActions(this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(() => {
                this._commentFormActions.setActions(menu, /*hasOnlySecondaryActions*/ true);
                this._enableDisableMenu(menu);
            }));
            this._commentFormActions = new commentFormActions_1.CommentFormActions(container, async (action) => {
                this._actionRunDelegate?.();
                action.run({
                    thread: this._commentThread,
                    $mid: 8 /* MarshalledId.CommentThreadInstance */
                });
            }, 4);
            this._register(this._commentFormActions);
            this._commentFormActions.setActions(menu, /*hasOnlySecondaryActions*/ true);
            this._enableDisableMenu(menu);
        }
    }
    exports.CommentThreadAdditionalActions = CommentThreadAdditionalActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZEFkZGl0aW9uYWxBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50VGhyZWFkQWRkaXRpb25hbEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLE1BQWEsOEJBQThELFNBQVEsc0JBQVU7UUFLNUYsWUFDQyxTQUFzQixFQUNkLGNBQTBDLEVBQzFDLGtCQUFzQyxFQUN0QyxhQUEyQixFQUMzQixrQkFBdUM7WUFFL0MsS0FBSyxFQUFFLENBQUM7WUFMQSxtQkFBYyxHQUFkLGNBQWMsQ0FBNEI7WUFDMUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUN0QyxrQkFBYSxHQUFiLGFBQWEsQ0FBYztZQUMzQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBSS9DLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7WUFDOUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBRXpELElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFTyxTQUFTO1lBQ2hCLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU8sU0FBUztZQUNoQixJQUFJLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVPLGtCQUFrQixDQUFDLElBQVc7WUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFNUQsbURBQW1EO1lBQ25ELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO2dCQUMzQixNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQzFCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO29CQUM3QixJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7d0JBQ25CLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDakIsT0FBTztxQkFDUDtvQkFFRCxLQUFLLE1BQU0sU0FBUyxJQUFLLE1BQTRCLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRTt3QkFDcEUsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFOzRCQUN0QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7NEJBQ2pCLE9BQU87eUJBQ1A7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBR08sd0JBQXdCLENBQUMsU0FBc0I7WUFDdEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLHVDQUFrQixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBZSxFQUFFLEVBQUU7Z0JBQ3RGLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUM7Z0JBRTVCLE1BQU0sQ0FBQyxHQUFHLENBQUM7b0JBQ1YsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjO29CQUMzQixJQUFJLDRDQUFvQztpQkFDeEMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRU4sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztLQUNEO0lBM0VELHdFQTJFQyJ9