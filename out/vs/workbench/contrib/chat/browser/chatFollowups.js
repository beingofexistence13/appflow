/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey"], function (require, exports, dom, button_1, htmlContent_1, lifecycle_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatFollowups = void 0;
    const $ = dom.$;
    class ChatFollowups extends lifecycle_1.Disposable {
        constructor(container, followups, options, clickHandler, contextService) {
            super();
            this.options = options;
            this.clickHandler = clickHandler;
            this.contextService = contextService;
            const followupsContainer = dom.append(container, $('.interactive-session-followups'));
            followups.forEach(followup => this.renderFollowup(followupsContainer, followup));
        }
        renderFollowup(container, followup) {
            if (followup.kind === 'command' && followup.when && !this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(followup.when))) {
                return;
            }
            const tooltip = 'tooltip' in followup ? followup.tooltip : undefined;
            const button = this._register(new button_1.Button(container, { ...this.options, supportIcons: true, title: tooltip }));
            if (followup.kind === 'reply') {
                button.element.classList.add('interactive-followup-reply');
            }
            else if (followup.kind === 'command') {
                button.element.classList.add('interactive-followup-command');
            }
            const label = followup.kind === 'reply' ?
                '$(sparkle) ' + (followup.title || followup.message) :
                followup.title;
            button.label = new htmlContent_1.MarkdownString(label, { supportThemeIcons: true });
            this._register(button.onDidClick(() => this.clickHandler(followup)));
        }
    }
    exports.ChatFollowups = ChatFollowups;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEZvbGxvd3Vwcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jaGF0Rm9sbG93dXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLE1BQWEsYUFBdUMsU0FBUSxzQkFBVTtRQUNyRSxZQUNDLFNBQXNCLEVBQ3RCLFNBQWMsRUFDRyxPQUFrQyxFQUNsQyxZQUFtQyxFQUNuQyxjQUFrQztZQUVuRCxLQUFLLEVBQUUsQ0FBQztZQUpTLFlBQU8sR0FBUCxPQUFPLENBQTJCO1lBQ2xDLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtZQUNuQyxtQkFBYyxHQUFkLGNBQWMsQ0FBb0I7WUFJbkQsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVPLGNBQWMsQ0FBQyxTQUFzQixFQUFFLFFBQVc7WUFFekQsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQywyQkFBYyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDeEksT0FBTzthQUNQO1lBRUQsTUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3JFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO2dCQUM5QixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQzthQUMzRDtpQkFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN2QyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQzthQUM3RDtZQUVELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLGFBQWEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDaEIsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLDRCQUFjLENBQUMsS0FBSyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEUsQ0FBQztLQUNEO0lBbkNELHNDQW1DQyJ9