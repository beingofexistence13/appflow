/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/uri", "vs/base/browser/ui/actionbar/actionViewItems"], function (require, exports, nls, dom, actions_1, uri_1, actionViewItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReactionAction = exports.ReactionActionViewItem = exports.ToggleReactionsAction = void 0;
    class ToggleReactionsAction extends actions_1.Action {
        static { this.ID = 'toolbar.toggle.pickReactions'; }
        constructor(toggleDropdownMenu, title) {
            super(ToggleReactionsAction.ID, title || nls.localize('pickReactions', "Pick Reactions..."), 'toggle-reactions', true);
            this._menuActions = [];
            this.toggleDropdownMenu = toggleDropdownMenu;
        }
        run() {
            this.toggleDropdownMenu();
            return Promise.resolve(true);
        }
        get menuActions() {
            return this._menuActions;
        }
        set menuActions(actions) {
            this._menuActions = actions;
        }
    }
    exports.ToggleReactionsAction = ToggleReactionsAction;
    class ReactionActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action) {
            super(null, action, {});
        }
        updateLabel() {
            if (!this.label) {
                return;
            }
            const action = this.action;
            if (action.class) {
                this.label.classList.add(action.class);
            }
            if (!action.icon) {
                const reactionLabel = dom.append(this.label, dom.$('span.reaction-label'));
                reactionLabel.innerText = action.label;
            }
            else {
                const reactionIcon = dom.append(this.label, dom.$('.reaction-icon'));
                const uri = uri_1.URI.revive(action.icon);
                reactionIcon.style.backgroundImage = dom.asCSSUrl(uri);
                reactionIcon.title = action.label;
            }
            if (action.count) {
                const reactionCount = dom.append(this.label, dom.$('span.reaction-count'));
                reactionCount.innerText = `${action.count}`;
            }
        }
        getTooltip() {
            const action = this.action;
            const toggleMessage = action.enabled ? nls.localize('comment.toggleableReaction', "Toggle reaction, ") : '';
            if (action.count === undefined) {
                return nls.localize({
                    key: 'comment.reactionLabelNone', comment: [
                        'This is a tooltip for an emoji button so that the current user can toggle their reaction to a comment.',
                        'The first arg is localized message "Toggle reaction" or empty if the user doesn\'t have permission to toggle the reaction, the second is the name of the reaction.'
                    ]
                }, "{0}{1} reaction", toggleMessage, action.label);
            }
            else if (action.count === 1) {
                return nls.localize({
                    key: 'comment.reactionLabelOne', comment: [
                        'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is 1.',
                        'The emoji is also a button so that the current user can also toggle their own emoji reaction.',
                        'The first arg is localized message "Toggle reaction" or empty if the user doesn\'t have permission to toggle the reaction, the second is the name of the reaction.'
                    ]
                }, "{0}1 reaction with {1}", toggleMessage, action.label);
            }
            else if (action.count > 1) {
                return nls.localize({
                    key: 'comment.reactionLabelMany', comment: [
                        'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is greater than 1.',
                        'The emoji is also a button so that the current user can also toggle their own emoji reaction.',
                        'The first arg is localized message "Toggle reaction" or empty if the user doesn\'t have permission to toggle the reaction, the second is number of users who have reacted with that reaction, and the third is the name of the reaction.'
                    ]
                }, "{0}{1} reactions with {2}", toggleMessage, action.count, action.label);
            }
            return undefined;
        }
    }
    exports.ReactionActionViewItem = ReactionActionViewItem;
    class ReactionAction extends actions_1.Action {
        static { this.ID = 'toolbar.toggle.reaction'; }
        constructor(id, label = '', cssClass = '', enabled = true, actionCallback, icon, count) {
            super(ReactionAction.ID, label, cssClass, enabled, actionCallback);
            this.icon = icon;
            this.count = count;
        }
    }
    exports.ReactionAction = ReactionAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3Rpb25zQWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9yZWFjdGlvbnNBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEscUJBQXNCLFNBQVEsZ0JBQU07aUJBQ2hDLE9BQUUsR0FBRyw4QkFBOEIsQUFBakMsQ0FBa0M7UUFHcEQsWUFBWSxrQkFBOEIsRUFBRSxLQUFjO1lBQ3pELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLG1CQUFtQixDQUFDLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFIaEgsaUJBQVksR0FBYyxFQUFFLENBQUM7WUFJcEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1FBQzlDLENBQUM7UUFDUSxHQUFHO1lBQ1gsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksV0FBVyxDQUFDLE9BQWtCO1lBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDO1FBQzdCLENBQUM7O0lBakJGLHNEQWtCQztJQUNELE1BQWEsc0JBQXVCLFNBQVEsZ0NBQWM7UUFDekQsWUFBWSxNQUFzQjtZQUNqQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ2tCLFdBQVc7WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hCLE9BQU87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