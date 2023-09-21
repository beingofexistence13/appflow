/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, iconLabels_1, DOM, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionViewWithLabel = exports.CodiconActionViewItem = void 0;
    class CodiconActionViewItem extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        updateLabel() {
            if (this.options.label && this.label) {
                DOM.reset(this.label, ...(0, iconLabels_1.renderLabelWithIcons)(this._commandAction.label ?? ''));
            }
        }
    }
    exports.CodiconActionViewItem = CodiconActionViewItem;
    class ActionViewWithLabel extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        render(container) {
            super.render(container);
            container.classList.add('notebook-action-view-item');
            this._actionLabel = document.createElement('a');
            container.appendChild(this._actionLabel);
            this.updateLabel();
        }
        updateLabel() {
            if (this._actionLabel) {
                this._actionLabel.classList.add('notebook-label');
                this._actionLabel.innerText = this._action.label;
                this._actionLabel.title = this._action.tooltip.length ? this._action.tooltip : this._action.label;
            }
        }
    }
    exports.ActionViewWithLabel = ActionViewWithLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEFjdGlvblZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NlbGxBY3Rpb25WaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLHFCQUFzQixTQUFRLGlEQUF1QjtRQUU5QyxXQUFXO1lBQzdCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBQSxpQ0FBb0IsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2hGO1FBQ0YsQ0FBQztLQUNEO0lBUEQsc0RBT0M7SUFFRCxNQUFhLG1CQUFvQixTQUFRLGlEQUF1QjtRQUd0RCxNQUFNLENBQUMsU0FBc0I7WUFDckMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUVrQixXQUFXO1lBQzdCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzthQUNsRztRQUNGLENBQUM7S0FDRDtJQWxCRCxrREFrQkMifQ==