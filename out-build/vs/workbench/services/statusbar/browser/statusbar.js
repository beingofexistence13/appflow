/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0$ = exports.$9$ = exports.$8$ = exports.$7$ = exports.StatusbarAlignment = exports.$6$ = void 0;
    exports.$6$ = (0, instantiation_1.$Bh)('statusbarService');
    var StatusbarAlignment;
    (function (StatusbarAlignment) {
        StatusbarAlignment[StatusbarAlignment["LEFT"] = 0] = "LEFT";
        StatusbarAlignment[StatusbarAlignment["RIGHT"] = 1] = "RIGHT";
    })(StatusbarAlignment || (exports.StatusbarAlignment = StatusbarAlignment = {}));
    function $7$(thing) {
        const candidate = thing;
        return typeof candidate?.id === 'string' && typeof candidate.alignment === 'number';
    }
    exports.$7$ = $7$;
    function $8$(thing) {
        const candidate = thing;
        return (typeof candidate?.primary === 'number' || $7$(candidate?.primary)) && typeof candidate?.secondary === 'number';
    }
    exports.$8$ = $8$;
    exports.$9$ = {
        id: 'statusBar.entry.showTooltip',
        title: ''
    };
    exports.$0$ = ['standard', 'warning', 'error', 'prominent', 'remote', 'offline'];
});
//# sourceMappingURL=statusbar.js.map