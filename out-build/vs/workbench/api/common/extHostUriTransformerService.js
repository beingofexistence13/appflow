/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hbc = exports.$gbc = void 0;
    exports.$gbc = (0, instantiation_1.$Bh)('IURITransformerService');
    class $hbc {
        constructor(delegate) {
            if (!delegate) {
                this.transformIncoming = arg => arg;
                this.transformOutgoing = arg => arg;
                this.transformOutgoingURI = arg => arg;
                this.transformOutgoingScheme = arg => arg;
            }
            else {
                this.transformIncoming = delegate.transformIncoming.bind(delegate);
                this.transformOutgoing = delegate.transformOutgoing.bind(delegate);
                this.transformOutgoingURI = delegate.transformOutgoingURI.bind(delegate);
                this.transformOutgoingScheme = delegate.transformOutgoingScheme.bind(delegate);
            }
        }
    }
    exports.$hbc = $hbc;
});
//# sourceMappingURL=extHostUriTransformerService.js.map