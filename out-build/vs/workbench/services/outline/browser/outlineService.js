/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/platform/instantiation/common/extensions", "vs/workbench/services/outline/browser/outline", "vs/base/common/event"], function (require, exports, lifecycle_1, linkedList_1, extensions_1, outline_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OutlineService {
        constructor() {
            this.a = new linkedList_1.$tc();
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
        }
        canCreateOutline(pane) {
            for (const factory of this.a) {
                if (factory.matches(pane)) {
                    return true;
                }
            }
            return false;
        }
        async createOutline(pane, target, token) {
            for (const factory of this.a) {
                if (factory.matches(pane)) {
                    return await factory.createOutline(pane, target, token);
                }
            }
            return undefined;
        }
        registerOutlineCreator(creator) {
            const rm = this.a.push(creator);
            this.b.fire();
            return (0, lifecycle_1.$ic)(() => {
                rm();
                this.b.fire();
            });
        }
    }
    (0, extensions_1.$mr)(outline_1.$trb, OutlineService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=outlineService.js.map