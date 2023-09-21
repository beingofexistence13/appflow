/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UT = exports.$TT = exports.DisablementReason = exports.UpdateType = exports.StateType = void 0;
    /**
     * Updates are run as a state machine:
     *
     *      Uninitialized
     *           ↓
     *          Idle
     *          ↓  ↑
     *   Checking for Updates  →  Available for Download
     *         ↓
     *     Downloading  →   Ready
     *         ↓               ↑
     *     Downloaded   →  Updating
     *
     * Available: There is an update available for download (linux).
     * Ready: Code will be updated as soon as it restarts (win32, darwin).
     * Downloaded: There is an update ready to be installed in the background (win32).
     */
    var StateType;
    (function (StateType) {
        StateType["Uninitialized"] = "uninitialized";
        StateType["Idle"] = "idle";
        StateType["Disabled"] = "disabled";
        StateType["CheckingForUpdates"] = "checking for updates";
        StateType["AvailableForDownload"] = "available for download";
        StateType["Downloading"] = "downloading";
        StateType["Downloaded"] = "downloaded";
        StateType["Updating"] = "updating";
        StateType["Ready"] = "ready";
    })(StateType || (exports.StateType = StateType = {}));
    var UpdateType;
    (function (UpdateType) {
        UpdateType[UpdateType["Setup"] = 0] = "Setup";
        UpdateType[UpdateType["Archive"] = 1] = "Archive";
        UpdateType[UpdateType["Snap"] = 2] = "Snap";
    })(UpdateType || (exports.UpdateType = UpdateType = {}));
    var DisablementReason;
    (function (DisablementReason) {
        DisablementReason[DisablementReason["NotBuilt"] = 0] = "NotBuilt";
        DisablementReason[DisablementReason["DisabledByEnvironment"] = 1] = "DisabledByEnvironment";
        DisablementReason[DisablementReason["ManuallyDisabled"] = 2] = "ManuallyDisabled";
        DisablementReason[DisablementReason["MissingConfiguration"] = 3] = "MissingConfiguration";
        DisablementReason[DisablementReason["InvalidConfiguration"] = 4] = "InvalidConfiguration";
        DisablementReason[DisablementReason["RunningAsAdmin"] = 5] = "RunningAsAdmin";
    })(DisablementReason || (exports.DisablementReason = DisablementReason = {}));
    exports.$TT = {
        Uninitialized: { type: "uninitialized" /* StateType.Uninitialized */ },
        Disabled: (reason) => ({ type: "disabled" /* StateType.Disabled */, reason }),
        Idle: (updateType, error) => ({ type: "idle" /* StateType.Idle */, updateType, error }),
        CheckingForUpdates: (explicit) => ({ type: "checking for updates" /* StateType.CheckingForUpdates */, explicit }),
        AvailableForDownload: (update) => ({ type: "available for download" /* StateType.AvailableForDownload */, update }),
        Downloading: (update) => ({ type: "downloading" /* StateType.Downloading */, update }),
        Downloaded: (update) => ({ type: "downloaded" /* StateType.Downloaded */, update }),
        Updating: (update) => ({ type: "updating" /* StateType.Updating */, update }),
        Ready: (update) => ({ type: "ready" /* StateType.Ready */, update }),
    };
    exports.$UT = (0, instantiation_1.$Bh)('updateService');
});
//# sourceMappingURL=update.js.map