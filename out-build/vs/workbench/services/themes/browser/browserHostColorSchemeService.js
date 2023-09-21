/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/browser/browser", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/themes/common/hostColorSchemeService"], function (require, exports, event_1, browser_1, extensions_1, lifecycle_1, hostColorSchemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f4b = void 0;
    class $f4b extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = this.B(new event_1.$fd());
            this.b();
        }
        b() {
            (0, browser_1.$VN)('(prefers-color-scheme: dark)', () => {
                this.a.fire();
            });
            (0, browser_1.$VN)('(forced-colors: active)', () => {
                this.a.fire();
            });
        }
        get onDidChangeColorScheme() {
            return this.a.event;
        }
        get dark() {
            if (window.matchMedia(`(prefers-color-scheme: light)`).matches) {
                return false;
            }
            else if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
                return true;
            }
            return false;
        }
        get highContrast() {
            if (window.matchMedia(`(forced-colors: active)`).matches) {
                return true;
            }
            return false;
        }
    }
    exports.$f4b = $f4b;
    (0, extensions_1.$mr)(hostColorSchemeService_1.$vzb, $f4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=browserHostColorSchemeService.js.map