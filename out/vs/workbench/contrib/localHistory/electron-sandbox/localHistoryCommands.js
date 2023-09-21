/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/platform/actions/common/actions", "vs/workbench/contrib/localHistory/browser/localHistory", "vs/workbench/contrib/localHistory/browser/localHistoryCommands", "vs/base/common/platform", "vs/platform/native/common/native", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/workbench/common/contextkeys"], function (require, exports, nls_1, workingCopyHistory_1, actions_1, localHistory_1, localHistoryCommands_1, platform_1, native_1, contextkey_1, network_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Delete
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.localHistory.revealInOS',
                title: {
                    value: platform_1.isWindows ? (0, nls_1.localize)('revealInWindows', "Reveal in File Explorer") : platform_1.isMacintosh ? (0, nls_1.localize)('revealInMac', "Reveal in Finder") : (0, nls_1.localize)('openContainer', "Open Containing Folder"),
                    original: platform_1.isWindows ? 'Reveal in File Explorer' : platform_1.isMacintosh ? 'Reveal in Finder' : 'Open Containing Folder'
                },
                menu: {
                    id: actions_1.MenuId.TimelineItemContext,
                    group: '4_reveal',
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.and(localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_KEY, contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file))
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.IWorkingCopyHistoryService);
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const { entry } = await (0, localHistoryCommands_1.findLocalHistoryEntry)(workingCopyHistoryService, item);
            if (entry) {
                await nativeHostService.showItemInFolder(entry.location.with({ scheme: network_1.Schemas.file }).fsPath);
            }
        }
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxIaXN0b3J5Q29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2NhbEhpc3RvcnkvZWxlY3Ryb24tc2FuZGJveC9sb2NhbEhpc3RvcnlDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxnQkFBZ0I7SUFFaEIsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUNwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMENBQTBDO2dCQUM5QyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLG9CQUFTLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFXLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsd0JBQXdCLENBQUM7b0JBQzNMLFFBQVEsRUFBRSxvQkFBUyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtpQkFDN0c7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLG1CQUFtQjtvQkFDOUIsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLEtBQUssRUFBRSxDQUFDO29CQUNSLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyw2Q0FBOEIsRUFBRSxnQ0FBa0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzNHO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxJQUE4QjtZQUNuRSxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0NBQTBCLENBQUMsQ0FBQztZQUMzRSxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkJBQWtCLENBQUMsQ0FBQztZQUUzRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxJQUFBLDRDQUFxQixFQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9FLElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0saUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQy9GO1FBQ0YsQ0FBQztLQUNELENBQUMsQ0FBQzs7QUFFSCxZQUFZIn0=