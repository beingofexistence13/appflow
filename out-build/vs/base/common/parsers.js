/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zF = exports.$yF = exports.ValidationState = void 0;
    var ValidationState;
    (function (ValidationState) {
        ValidationState[ValidationState["OK"] = 0] = "OK";
        ValidationState[ValidationState["Info"] = 1] = "Info";
        ValidationState[ValidationState["Warning"] = 2] = "Warning";
        ValidationState[ValidationState["Error"] = 3] = "Error";
        ValidationState[ValidationState["Fatal"] = 4] = "Fatal";
    })(ValidationState || (exports.ValidationState = ValidationState = {}));
    class $yF {
        constructor() {
            this.a = 0 /* ValidationState.OK */;
        }
        get state() {
            return this.a;
        }
        set state(value) {
            if (value > this.a) {
                this.a = value;
            }
        }
        isOK() {
            return this.a === 0 /* ValidationState.OK */;
        }
        isFatal() {
            return this.a === 4 /* ValidationState.Fatal */;
        }
    }
    exports.$yF = $yF;
    class $zF {
        constructor(problemReporter) {
            this.a = problemReporter;
        }
        reset() {
            this.a.status.state = 0 /* ValidationState.OK */;
        }
        get problemReporter() {
            return this.a;
        }
        info(message) {
            this.a.info(message);
        }
        warn(message) {
            this.a.warn(message);
        }
        error(message) {
            this.a.error(message);
        }
        fatal(message) {
            this.a.fatal(message);
        }
    }
    exports.$zF = $zF;
});
//# sourceMappingURL=parsers.js.map