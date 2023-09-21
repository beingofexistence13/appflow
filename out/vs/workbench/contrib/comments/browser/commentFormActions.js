/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/button/button", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles"], function (require, exports, button_1, lifecycle_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentFormActions = void 0;
    class CommentFormActions {
        constructor(container, actionHandler, maxActions) {
            this.container = container;
            this.actionHandler = actionHandler;
            this.maxActions = maxActions;
            this._buttonElements = [];
            this._toDispose = new lifecycle_1.DisposableStore();
            this._actions = [];
        }
        setActions(menu, hasOnlySecondaryActions = false) {
            this._toDispose.clear();
            this._buttonElements.forEach(b => b.remove());
            this._buttonElements = [];
            const groups = menu.getActions({ shouldForwardArgs: true });
            let isPrimary = !hasOnlySecondaryActions;
            for (const group of groups) {
                const [, actions] = group;
                this._actions = actions;
                for (const action of actions) {
                    const button = new button_1.Button(this.container, { secondary: !isPrimary, ...defaultStyles_1.defaultButtonStyles });
                    isPrimary = false;
                    this._buttonElements.push(button.element);
                    this._toDispose.add(button);
                    this._toDispose.add(button.onDidClick(() => this.actionHandler(action)));
                    button.enabled = action.enabled;
                    button.label = action.label;
                    if ((this.maxActions !== undefined) && (this._buttonElements.length >= this.maxActions)) {
                        console.warn(`An extension has contributed more than the allowable number of actions to a comments menu.`);
                        return;
                    }
                }
            }
        }
        triggerDefaultAction() {
            if (this._actions.length) {
                const lastAction = this._actions[0];
                if (lastAction.enabled) {
                    return this.actionHandler(lastAction);
                }
            }
        }
        dispose() {
            this._toDispose.dispose();
        }
    }
    exports.CommentFormActions = CommentFormActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudEZvcm1BY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50Rm9ybUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsa0JBQWtCO1FBSzlCLFlBQ1MsU0FBc0IsRUFDdEIsYUFBd0MsRUFDL0IsVUFBbUI7WUFGNUIsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixrQkFBYSxHQUFiLGFBQWEsQ0FBMkI7WUFDL0IsZUFBVSxHQUFWLFVBQVUsQ0FBUztZQVA3QixvQkFBZSxHQUFrQixFQUFFLENBQUM7WUFDM0IsZUFBVSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzVDLGFBQVEsR0FBYyxFQUFFLENBQUM7UUFNN0IsQ0FBQztRQUVMLFVBQVUsQ0FBQyxJQUFXLEVBQUUsMEJBQW1DLEtBQUs7WUFDL0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV4QixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBRTFCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzVELElBQUksU0FBUyxHQUFZLENBQUMsdUJBQXVCLENBQUM7WUFDbEQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFFMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7Z0JBQ3hCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO29CQUM3QixNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsbUNBQW1CLEVBQUUsQ0FBQyxDQUFDO29CQUU3RixTQUFTLEdBQUcsS0FBSyxDQUFDO29CQUNsQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRTFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUV6RSxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztvQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQ3hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsNEZBQTRGLENBQUMsQ0FBQzt3QkFDM0csT0FBTztxQkFDUDtpQkFDRDthQUNEO1FBQ0YsQ0FBQztRQUVELG9CQUFvQjtZQUNuQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVwQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7b0JBQ3ZCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDdEM7YUFDRDtRQUNGLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUF2REQsZ0RBdURDIn0=