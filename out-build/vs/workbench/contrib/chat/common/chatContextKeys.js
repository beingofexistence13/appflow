/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/chat/common/chatContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LGb = exports.$KGb = exports.$JGb = exports.$IGb = exports.$HGb = exports.$GGb = exports.$FGb = exports.$EGb = exports.$DGb = exports.$CGb = exports.$BGb = void 0;
    exports.$BGb = new contextkey_1.$2i('chatSessionResponseHasProviderId', false, { type: 'boolean', description: (0, nls_1.localize)(0, null) });
    exports.$CGb = new contextkey_1.$2i('chatSessionResponseVote', '', { type: 'string', description: (0, nls_1.localize)(1, null) });
    exports.$DGb = new contextkey_1.$2i('chatSessionResponseFiltered', false, { type: 'boolean', description: (0, nls_1.localize)(2, null) });
    exports.$EGb = new contextkey_1.$2i('chatSessionRequestInProgress', false, { type: 'boolean', description: (0, nls_1.localize)(3, null) });
    exports.$FGb = new contextkey_1.$2i('chatResponse', false, { type: 'boolean', description: (0, nls_1.localize)(4, null) });
    exports.$GGb = new contextkey_1.$2i('chatRequest', false, { type: 'boolean', description: (0, nls_1.localize)(5, null) });
    exports.$HGb = new contextkey_1.$2i('chatInputHasText', false, { type: 'boolean', description: (0, nls_1.localize)(6, null) });
    exports.$IGb = new contextkey_1.$2i('inChatInput', false, { type: 'boolean', description: (0, nls_1.localize)(7, null) });
    exports.$JGb = new contextkey_1.$2i('inChat', false, { type: 'boolean', description: (0, nls_1.localize)(8, null) });
    exports.$KGb = new contextkey_1.$2i('chatListFocused', false, { type: 'boolean', description: (0, nls_1.localize)(9, null) });
    exports.$LGb = new contextkey_1.$2i('hasChatProvider', false, { type: 'boolean', description: (0, nls_1.localize)(10, null) });
});
//# sourceMappingURL=chatContextKeys.js.map