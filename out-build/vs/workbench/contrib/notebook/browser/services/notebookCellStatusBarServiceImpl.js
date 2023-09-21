/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, errors_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Eb = void 0;
    class $5Eb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidChangeProviders = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeItems = this.b.event;
            this.c = [];
        }
        registerCellStatusBarItemProvider(provider) {
            this.c.push(provider);
            let changeListener;
            if (provider.onDidChangeStatusBarItems) {
                changeListener = provider.onDidChangeStatusBarItems(() => this.b.fire());
            }
            this.a.fire();
            return (0, lifecycle_1.$ic)(() => {
                changeListener?.dispose();
                const idx = this.c.findIndex(p => p === provider);
                this.c.splice(idx, 1);
            });
        }
        async getStatusBarItemsForCell(docUri, cellIndex, viewType, token) {
            const providers = this.c.filter(p => p.viewType === viewType || p.viewType === '*');
            return await Promise.all(providers.map(async (p) => {
                try {
                    return await p.provideCellStatusBarItems(docUri, cellIndex, token) ?? { items: [] };
                }
                catch (e) {
                    (0, errors_1.$Z)(e);
                    return { items: [] };
                }
            }));
        }
    }
    exports.$5Eb = $5Eb;
});
//# sourceMappingURL=notebookCellStatusBarServiceImpl.js.map