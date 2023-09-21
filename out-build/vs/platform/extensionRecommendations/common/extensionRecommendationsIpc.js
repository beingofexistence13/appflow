/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$i8b = exports.$h8b = void 0;
    class $h8b {
        constructor(a) {
            this.a = a;
        }
        get ignoredRecommendations() { throw new Error('not supported'); }
        promptImportantExtensionsInstallNotification(extensionRecommendations) {
            return this.a.call('promptImportantExtensionsInstallNotification', [extensionRecommendations]);
        }
        promptWorkspaceRecommendations(recommendations) {
            throw new Error('not supported');
        }
        hasToIgnoreRecommendationNotifications() {
            throw new Error('not supported');
        }
    }
    exports.$h8b = $h8b;
    class $i8b {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, args) {
            switch (command) {
                case 'promptImportantExtensionsInstallNotification': return this.a.promptImportantExtensionsInstallNotification(args[0]);
            }
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.$i8b = $i8b;
});
//# sourceMappingURL=extensionRecommendationsIpc.js.map