/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalQuickFixType = exports.ITerminalQuickFixService = void 0;
    exports.ITerminalQuickFixService = (0, instantiation_1.createDecorator)('terminalQuickFixService');
    var TerminalQuickFixType;
    (function (TerminalQuickFixType) {
        TerminalQuickFixType[TerminalQuickFixType["TerminalCommand"] = 0] = "TerminalCommand";
        TerminalQuickFixType[TerminalQuickFixType["Opener"] = 1] = "Opener";
        TerminalQuickFixType[TerminalQuickFixType["Port"] = 2] = "Port";
        TerminalQuickFixType[TerminalQuickFixType["VscodeCommand"] = 3] = "VscodeCommand";
    })(TerminalQuickFixType || (exports.TerminalQuickFixType = TerminalQuickFixType = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tGaXguanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvcXVpY2tGaXgvYnJvd3Nlci9xdWlja0ZpeC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXbkYsUUFBQSx3QkFBd0IsR0FBRyxJQUFBLCtCQUFlLEVBQTJCLHlCQUF5QixDQUFDLENBQUM7SUErQjdHLElBQVksb0JBS1g7SUFMRCxXQUFZLG9CQUFvQjtRQUMvQixxRkFBbUIsQ0FBQTtRQUNuQixtRUFBVSxDQUFBO1FBQ1YsK0RBQVEsQ0FBQTtRQUNSLGlGQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFMVyxvQkFBb0Isb0NBQXBCLG9CQUFvQixRQUsvQiJ9