/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/base/browser/mouseEvent"], function (require, exports, dom, actionbar_1, actions_1, codicons_1, lifecycle_1, strings, nls, menuEntryActionViewItem_1, iconRegistry_1, themables_1, mouseEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentThreadHeader = void 0;
    const collapseIcon = (0, iconRegistry_1.registerIcon)('review-comment-collapse', codicons_1.Codicon.chevronUp, nls.localize('collapseIcon', 'Icon to collapse a review comment.'));
    const COLLAPSE_ACTION_CLASS = 'expand-review-action ' + themables_1.ThemeIcon.asClassName(collapseIcon);
    class CommentThreadHeader extends lifecycle_1.Disposable {
        constructor(container, _delegate, _commentMenus, _commentThread, _contextKeyService, instantiationService, _contextMenuService) {
            super();
            this._delegate = _delegate;
            this._commentMenus = _commentMenus;
            this._commentThread = _commentThread;
            this._contextKeyService = _contextKeyService;
            this.instantiationService = instantiationService;
            this._contextMenuService = _contextMenuService;
            this._headElement = dom.$('.head');
            container.appendChild(this._headElement);
            this._fillHead();
        }
        _fillHead() {
            const titleElement = dom.append(this._headElement, dom.$('.review-title'));
            this._headingLabel = dom.append(titleElement, dom.$('span.filename'));
            this.createThreadLabel();
            const actionsContainer = dom.append(this._headElement, dom.$('.review-actions'));
            this._actionbarWidget = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService)
            });
            this._register(this._actionbarWidget);
            this._collapseAction = new actions_1.Action('review.expand', nls.localize('label.collapse', "Collapse"), COLLAPSE_ACTION_CLASS, true, () => this._delegate.collapse());
            const menu = this._commentMenus.getCommentThreadTitleActions(this._contextKeyService);
            this.setActionBarActions(menu);
            this._register(menu);
            this._register(menu.onDidChange(e => {
                this.setActionBarActions(menu);
            }));
            this._register(dom.addDisposableListener(this._headElement, dom.EventType.CONTEXT_MENU, e => {
                return this.onContextMenu(e);
            }));
            this._actionbarWidget.context = this._commentThread;
        }
        setActionBarActions(menu) {
            const groups = menu.getActions({ shouldForwardArgs: true }).reduce((r, [, actions]) => [...r, ...actions], []);
            this._actionbarWidget.clear();
            this._actionbarWidget.push([...groups, this._collapseAction], { label: false, icon: true });
        }
        updateCommentThread(commentThread) {
            this._commentThread = commentThread;
            this._actionbarWidget.context = this._commentThread;
            this.createThreadLabel();
        }
        createThreadLabel() {
            let label;
            label = this._commentThread.label;
            if (label === undefined) {
                if (!(this._commentThread.comments && this._commentThread.comments.length)) {
                    label = nls.localize('startThread', "Start discussion");
                }
            }
            if (label) {
                this._headingLabel.textContent = strings.escape(label);
                this._headingLabel.setAttribute('aria-label', label);
            }
        }
        updateHeight(headHeight) {
            this._headElement.style.height = `${headHeight}px`;
            this._headElement.style.lineHeight = this._headElement.style.height;
        }
        onContextMenu(e) {
            const actions = this._commentMenus.getCommentThreadTitleContextActions(this._contextKeyService).getActions({ shouldForwardArgs: true }).map((value) => value[1]).flat();
            if (!actions.length) {
                return;
            }
            const event = new mouseEvent_1.StandardMouseEvent(e);
            this._contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => actions,
                actionRunner: new actions_1.ActionRunner(),
                getActionsContext: () => {
                    return {
                        commentControlHandle: this._commentThread.controllerHandle,
                        commentThreadHandle: this._commentThread.commentThreadHandle,
                        $mid: 7 /* MarshalledId.CommentThread */
                    };
                },
            });
        }
    }
    exports.CommentThreadHeader = CommentThreadHeader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZEhlYWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvY29tbWVudFRocmVhZEhlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQmhHLE1BQU0sWUFBWSxHQUFHLElBQUEsMkJBQVksRUFBQyx5QkFBeUIsRUFBRSxrQkFBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUM7SUFDcEosTUFBTSxxQkFBcUIsR0FBRyx1QkFBdUIsR0FBRyxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUc1RixNQUFhLG1CQUFnQyxTQUFRLHNCQUFVO1FBTTlELFlBQ0MsU0FBc0IsRUFDZCxTQUFtQyxFQUNuQyxhQUEyQixFQUMzQixjQUEwQyxFQUMxQyxrQkFBc0MsRUFDdEMsb0JBQTJDLEVBQzNDLG1CQUF3QztZQUVoRCxLQUFLLEVBQUUsQ0FBQztZQVBBLGNBQVMsR0FBVCxTQUFTLENBQTBCO1lBQ25DLGtCQUFhLEdBQWIsYUFBYSxDQUFjO1lBQzNCLG1CQUFjLEdBQWQsY0FBYyxDQUE0QjtZQUMxQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0Msd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUdoRCxJQUFJLENBQUMsWUFBWSxHQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBRVMsU0FBUztZQUNsQixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBRTNFLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRXpCLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHFCQUFTLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3ZELHNCQUFzQixFQUFFLDhDQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDO2FBQ3ZGLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFdEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGdCQUFNLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUU3SixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUMzRixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUNyRCxDQUFDO1FBRU8sbUJBQW1CLENBQUMsSUFBVztZQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQTBDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZKLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRUQsbUJBQW1CLENBQUMsYUFBeUM7WUFDNUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFFcEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ3BELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxpQkFBaUI7WUFDaEIsSUFBSSxLQUF5QixDQUFDO1lBQzlCLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQUVsQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUMzRSxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztpQkFDeEQ7YUFDRDtZQUVELElBQUksS0FBSyxFQUFFO2dCQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNyRDtRQUNGLENBQUM7UUFFRCxZQUFZLENBQUMsVUFBa0I7WUFDOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsVUFBVSxJQUFJLENBQUM7WUFDbkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNyRSxDQUFDO1FBRU8sYUFBYSxDQUFDLENBQWE7WUFDbEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEssSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUNELE1BQU0sS0FBSyxHQUFHLElBQUksK0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQztnQkFDeEMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUs7Z0JBQ3RCLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPO2dCQUN6QixZQUFZLEVBQUUsSUFBSSxzQkFBWSxFQUFFO2dCQUNoQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7b0JBQ3ZCLE9BQU87d0JBQ04sb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0I7d0JBQzFELG1CQUFtQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CO3dCQUM1RCxJQUFJLG9DQUE0QjtxQkFDaEMsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBeEdELGtEQXdHQyJ9