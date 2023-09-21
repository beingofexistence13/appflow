/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Uk = exports.$Tk = void 0;
    exports.$Tk = (0, instantiation_1.$Bh)('remoteSocketFactoryService');
    class $Uk {
        constructor() {
            this.a = {};
        }
        register(type, factory) {
            this.a[type] ??= [];
            this.a[type].push(factory);
            return (0, lifecycle_1.$ic)(() => {
                const idx = this.a[type]?.indexOf(factory);
                if (typeof idx === 'number' && idx >= 0) {
                    this.a[type]?.splice(idx, 1);
                }
            });
        }
        b(messagePassing) {
            const factories = (this.a[messagePassing.type] || []);
            return factories.find(factory => factory.supports(messagePassing));
        }
        connect(connectTo, path, query, debugLabel) {
            const socketFactory = this.b(connectTo);
            if (!socketFactory) {
                throw new Error(`No socket factory found for ${connectTo}`);
            }
            return socketFactory.connect(connectTo, path, query, debugLabel);
        }
    }
    exports.$Uk = $Uk;
});
//# sourceMappingURL=remoteSocketFactoryService.js.map