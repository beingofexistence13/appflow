/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IF = exports.$HF = exports.$GF = void 0;
    class $GF {
        constructor(affinity) {
            this.affinity = affinity;
            this.kind = 1 /* ExtensionHostKind.LocalProcess */;
        }
        equals(other) {
            return (this.kind === other.kind && this.affinity === other.affinity);
        }
        asString() {
            if (this.affinity === 0) {
                return 'LocalProcess';
            }
            return `LocalProcess${this.affinity}`;
        }
    }
    exports.$GF = $GF;
    class $HF {
        constructor(affinity) {
            this.affinity = affinity;
            this.kind = 2 /* ExtensionHostKind.LocalWebWorker */;
        }
        equals(other) {
            return (this.kind === other.kind && this.affinity === other.affinity);
        }
        asString() {
            if (this.affinity === 0) {
                return 'LocalWebWorker';
            }
            return `LocalWebWorker${this.affinity}`;
        }
    }
    exports.$HF = $HF;
    class $IF {
        constructor() {
            this.kind = 3 /* ExtensionHostKind.Remote */;
            this.affinity = 0;
        }
        equals(other) {
            return (this.kind === other.kind);
        }
        asString() {
            return 'Remote';
        }
    }
    exports.$IF = $IF;
});
//# sourceMappingURL=extensionRunningLocation.js.map