/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IUpdateService = exports.State = exports.DisablementReason = exports.UpdateType = exports.StateType = void 0;
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
    exports.State = {
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
    exports.IUpdateService = (0, instantiation_1.createDecorator)('updateService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXBkYXRlL2NvbW1vbi91cGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JHO0lBRUgsSUFBa0IsU0FVakI7SUFWRCxXQUFrQixTQUFTO1FBQzFCLDRDQUErQixDQUFBO1FBQy9CLDBCQUFhLENBQUE7UUFDYixrQ0FBcUIsQ0FBQTtRQUNyQix3REFBMkMsQ0FBQTtRQUMzQyw0REFBK0MsQ0FBQTtRQUMvQyx3Q0FBMkIsQ0FBQTtRQUMzQixzQ0FBeUIsQ0FBQTtRQUN6QixrQ0FBcUIsQ0FBQTtRQUNyQiw0QkFBZSxDQUFBO0lBQ2hCLENBQUMsRUFWaUIsU0FBUyx5QkFBVCxTQUFTLFFBVTFCO0lBRUQsSUFBa0IsVUFJakI7SUFKRCxXQUFrQixVQUFVO1FBQzNCLDZDQUFLLENBQUE7UUFDTCxpREFBTyxDQUFBO1FBQ1AsMkNBQUksQ0FBQTtJQUNMLENBQUMsRUFKaUIsVUFBVSwwQkFBVixVQUFVLFFBSTNCO0lBRUQsSUFBa0IsaUJBT2pCO0lBUEQsV0FBa0IsaUJBQWlCO1FBQ2xDLGlFQUFRLENBQUE7UUFDUiwyRkFBcUIsQ0FBQTtRQUNyQixpRkFBZ0IsQ0FBQTtRQUNoQix5RkFBb0IsQ0FBQTtRQUNwQix5RkFBb0IsQ0FBQTtRQUNwQiw2RUFBYyxDQUFBO0lBQ2YsQ0FBQyxFQVBpQixpQkFBaUIsaUNBQWpCLGlCQUFpQixRQU9sQztJQWNZLFFBQUEsS0FBSyxHQUFHO1FBQ3BCLGFBQWEsRUFBRSxFQUFFLElBQUksK0NBQXlCLEVBQW1CO1FBQ2pFLFFBQVEsRUFBRSxDQUFDLE1BQXlCLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFDQUFvQixFQUFFLE1BQU0sRUFBRSxDQUFhO1FBQzNGLElBQUksRUFBRSxDQUFDLFVBQXNCLEVBQUUsS0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSw2QkFBZ0IsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQVM7UUFDdkcsa0JBQWtCLEVBQUUsQ0FBQyxRQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSwyREFBOEIsRUFBRSxRQUFRLEVBQXlCLENBQUE7UUFDbkgsb0JBQW9CLEVBQUUsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLCtEQUFnQyxFQUFFLE1BQU0sRUFBMkIsQ0FBQTtRQUNySCxXQUFXLEVBQUUsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLDJDQUF1QixFQUFFLE1BQU0sRUFBa0IsQ0FBQTtRQUMxRixVQUFVLEVBQUUsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHlDQUFzQixFQUFFLE1BQU0sRUFBaUIsQ0FBQTtRQUN2RixRQUFRLEVBQUUsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFDQUFvQixFQUFFLE1BQU0sRUFBZSxDQUFBO1FBQ2pGLEtBQUssRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksK0JBQWlCLEVBQUUsTUFBTSxFQUFZLENBQUE7S0FDeEUsQ0FBQztJQVNXLFFBQUEsY0FBYyxHQUFHLElBQUEsK0JBQWUsRUFBaUIsZUFBZSxDQUFDLENBQUMifQ==