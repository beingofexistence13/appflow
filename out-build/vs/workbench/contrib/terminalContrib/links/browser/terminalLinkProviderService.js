/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WWb = void 0;
    class $WWb {
        constructor() {
            this.a = new Set();
            this.b = new event_1.$fd();
            this.c = new event_1.$fd();
        }
        get linkProviders() { return this.a; }
        get onDidAddLinkProvider() { return this.b.event; }
        get onDidRemoveLinkProvider() { return this.c.event; }
        registerLinkProvider(linkProvider) {
            const disposables = [];
            this.a.add(linkProvider);
            this.b.fire(linkProvider);
            return {
                dispose: () => {
                    for (const disposable of disposables) {
                        disposable.dispose();
                    }
                    this.a.delete(linkProvider);
                    this.c.fire(linkProvider);
                }
            };
        }
    }
    exports.$WWb = $WWb;
});
//# sourceMappingURL=terminalLinkProviderService.js.map