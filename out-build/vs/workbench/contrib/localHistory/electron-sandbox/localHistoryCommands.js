/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/localHistory/electron-sandbox/localHistoryCommands", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/platform/actions/common/actions", "vs/workbench/contrib/localHistory/browser/localHistory", "vs/workbench/contrib/localHistory/browser/localHistoryCommands", "vs/base/common/platform", "vs/platform/native/common/native", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/workbench/common/contextkeys"], function (require, exports, nls_1, workingCopyHistory_1, actions_1, localHistory_1, localHistoryCommands_1, platform_1, native_1, contextkey_1, network_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Delete
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.localHistory.revealInOS',
                title: {
                    value: platform_1.$i ? (0, nls_1.localize)(0, null) : platform_1.$j ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null),
                    original: platform_1.$i ? 'Reveal in File Explorer' : platform_1.$j ? 'Reveal in Finder' : 'Open Containing Folder'
                },
                menu: {
                    id: actions_1.$Ru.TimelineItemContext,
                    group: '4_reveal',
                    order: 1,
                    when: contextkey_1.$Ii.and(localHistory_1.$A1b, contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.file))
                }
            });
        }
        async run(accessor, item) {
            const workingCopyHistoryService = accessor.get(workingCopyHistory_1.$v1b);
            const nativeHostService = accessor.get(native_1.$05b);
            const { entry } = await (0, localHistoryCommands_1.$F1b)(workingCopyHistoryService, item);
            if (entry) {
                await nativeHostService.showItemInFolder(entry.location.with({ scheme: network_1.Schemas.file }).fsPath);
            }
        }
    });
});
//#endregion
//# sourceMappingURL=localHistoryCommands.js.map