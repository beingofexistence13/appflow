/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalDataTransfers = exports.LinuxDistro = exports.XtermTerminalConstants = exports.$Sib = exports.$Rib = exports.$Qib = exports.TerminalConnectionState = exports.Direction = exports.$Pib = exports.$Oib = exports.$Nib = exports.$Mib = void 0;
    exports.$Mib = (0, instantiation_1.$Bh)('terminalService');
    exports.$Nib = (0, instantiation_1.$Bh)('terminalEditorService');
    exports.$Oib = (0, instantiation_1.$Bh)('terminalGroupService');
    exports.$Pib = (0, instantiation_1.$Bh)('terminalInstanceService');
    var Direction;
    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
        Direction[Direction["Up"] = 2] = "Up";
        Direction[Direction["Down"] = 3] = "Down";
    })(Direction || (exports.Direction = Direction = {}));
    var TerminalConnectionState;
    (function (TerminalConnectionState) {
        TerminalConnectionState[TerminalConnectionState["Connecting"] = 0] = "Connecting";
        TerminalConnectionState[TerminalConnectionState["Connected"] = 1] = "Connected";
    })(TerminalConnectionState || (exports.TerminalConnectionState = TerminalConnectionState = {}));
    const $Qib = (t) => typeof t.instanceId !== 'number';
    exports.$Qib = $Qib;
    class $Rib extends MouseEvent {
    }
    exports.$Rib = $Rib;
    exports.$Sib = 'terminalEditor';
    var XtermTerminalConstants;
    (function (XtermTerminalConstants) {
        XtermTerminalConstants[XtermTerminalConstants["SearchHighlightLimit"] = 1000] = "SearchHighlightLimit";
    })(XtermTerminalConstants || (exports.XtermTerminalConstants = XtermTerminalConstants = {}));
    var LinuxDistro;
    (function (LinuxDistro) {
        LinuxDistro[LinuxDistro["Unknown"] = 1] = "Unknown";
        LinuxDistro[LinuxDistro["Fedora"] = 2] = "Fedora";
        LinuxDistro[LinuxDistro["Ubuntu"] = 3] = "Ubuntu";
    })(LinuxDistro || (exports.LinuxDistro = LinuxDistro = {}));
    var TerminalDataTransfers;
    (function (TerminalDataTransfers) {
        TerminalDataTransfers["Terminals"] = "Terminals";
    })(TerminalDataTransfers || (exports.TerminalDataTransfers = TerminalDataTransfers = {}));
});
//# sourceMappingURL=terminal.js.map