/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTerminalChannelRequest = exports.RemoteTerminalChannelEvent = exports.REMOTE_TERMINAL_CHANNEL_NAME = void 0;
    exports.REMOTE_TERMINAL_CHANNEL_NAME = 'remoteterminal';
    var RemoteTerminalChannelEvent;
    (function (RemoteTerminalChannelEvent) {
        RemoteTerminalChannelEvent["OnPtyHostExitEvent"] = "$onPtyHostExitEvent";
        RemoteTerminalChannelEvent["OnPtyHostStartEvent"] = "$onPtyHostStartEvent";
        RemoteTerminalChannelEvent["OnPtyHostUnresponsiveEvent"] = "$onPtyHostUnresponsiveEvent";
        RemoteTerminalChannelEvent["OnPtyHostResponsiveEvent"] = "$onPtyHostResponsiveEvent";
        RemoteTerminalChannelEvent["OnPtyHostRequestResolveVariablesEvent"] = "$onPtyHostRequestResolveVariablesEvent";
        RemoteTerminalChannelEvent["OnProcessDataEvent"] = "$onProcessDataEvent";
        RemoteTerminalChannelEvent["OnProcessReadyEvent"] = "$onProcessReadyEvent";
        RemoteTerminalChannelEvent["OnProcessExitEvent"] = "$onProcessExitEvent";
        RemoteTerminalChannelEvent["OnProcessReplayEvent"] = "$onProcessReplayEvent";
        RemoteTerminalChannelEvent["OnProcessOrphanQuestion"] = "$onProcessOrphanQuestion";
        RemoteTerminalChannelEvent["OnExecuteCommand"] = "$onExecuteCommand";
        RemoteTerminalChannelEvent["OnDidRequestDetach"] = "$onDidRequestDetach";
        RemoteTerminalChannelEvent["OnDidChangeProperty"] = "$onDidChangeProperty";
    })(RemoteTerminalChannelEvent || (exports.RemoteTerminalChannelEvent = RemoteTerminalChannelEvent = {}));
    var RemoteTerminalChannelRequest;
    (function (RemoteTerminalChannelRequest) {
        RemoteTerminalChannelRequest["RestartPtyHost"] = "$restartPtyHost";
        RemoteTerminalChannelRequest["CreateProcess"] = "$createProcess";
        RemoteTerminalChannelRequest["AttachToProcess"] = "$attachToProcess";
        RemoteTerminalChannelRequest["DetachFromProcess"] = "$detachFromProcess";
        RemoteTerminalChannelRequest["ListProcesses"] = "$listProcesses";
        RemoteTerminalChannelRequest["GetLatency"] = "$getLatency";
        RemoteTerminalChannelRequest["GetPerformanceMarks"] = "$getPerformanceMarks";
        RemoteTerminalChannelRequest["OrphanQuestionReply"] = "$orphanQuestionReply";
        RemoteTerminalChannelRequest["AcceptPtyHostResolvedVariables"] = "$acceptPtyHostResolvedVariables";
        RemoteTerminalChannelRequest["Start"] = "$start";
        RemoteTerminalChannelRequest["Input"] = "$input";
        RemoteTerminalChannelRequest["AcknowledgeDataEvent"] = "$acknowledgeDataEvent";
        RemoteTerminalChannelRequest["Shutdown"] = "$shutdown";
        RemoteTerminalChannelRequest["Resize"] = "$resize";
        RemoteTerminalChannelRequest["ClearBuffer"] = "$clearBuffer";
        RemoteTerminalChannelRequest["GetInitialCwd"] = "$getInitialCwd";
        RemoteTerminalChannelRequest["GetCwd"] = "$getCwd";
        RemoteTerminalChannelRequest["ProcessBinary"] = "$processBinary";
        RemoteTerminalChannelRequest["SendCommandResult"] = "$sendCommandResult";
        RemoteTerminalChannelRequest["InstallAutoReply"] = "$installAutoReply";
        RemoteTerminalChannelRequest["UninstallAllAutoReplies"] = "$uninstallAllAutoReplies";
        RemoteTerminalChannelRequest["GetDefaultSystemShell"] = "$getDefaultSystemShell";
        RemoteTerminalChannelRequest["GetProfiles"] = "$getProfiles";
        RemoteTerminalChannelRequest["GetEnvironment"] = "$getEnvironment";
        RemoteTerminalChannelRequest["GetWslPath"] = "$getWslPath";
        RemoteTerminalChannelRequest["GetTerminalLayoutInfo"] = "$getTerminalLayoutInfo";
        RemoteTerminalChannelRequest["SetTerminalLayoutInfo"] = "$setTerminalLayoutInfo";
        RemoteTerminalChannelRequest["SerializeTerminalState"] = "$serializeTerminalState";
        RemoteTerminalChannelRequest["ReviveTerminalProcesses"] = "$reviveTerminalProcesses";
        RemoteTerminalChannelRequest["GetRevivedPtyNewId"] = "$getRevivedPtyNewId";
        RemoteTerminalChannelRequest["SetUnicodeVersion"] = "$setUnicodeVersion";
        RemoteTerminalChannelRequest["ReduceConnectionGraceTime"] = "$reduceConnectionGraceTime";
        RemoteTerminalChannelRequest["UpdateIcon"] = "$updateIcon";
        RemoteTerminalChannelRequest["UpdateTitle"] = "$updateTitle";
        RemoteTerminalChannelRequest["UpdateProperty"] = "$updateProperty";
        RemoteTerminalChannelRequest["RefreshProperty"] = "$refreshProperty";
        RemoteTerminalChannelRequest["RequestDetachInstance"] = "$requestDetachInstance";
        RemoteTerminalChannelRequest["AcceptDetachInstanceReply"] = "$acceptDetachInstanceReply";
        RemoteTerminalChannelRequest["AcceptDetachedInstance"] = "$acceptDetachedInstance";
        RemoteTerminalChannelRequest["FreePortKillProcess"] = "$freePortKillProcess";
    })(RemoteTerminalChannelRequest || (exports.RemoteTerminalChannelRequest = RemoteTerminalChannelRequest = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9jb21tb24vcmVtb3RlL3Rlcm1pbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9uRixRQUFBLDRCQUE0QixHQUFHLGdCQUFnQixDQUFDO0lBaUM3RCxJQUFrQiwwQkFjakI7SUFkRCxXQUFrQiwwQkFBMEI7UUFDM0Msd0VBQTBDLENBQUE7UUFDMUMsMEVBQTRDLENBQUE7UUFDNUMsd0ZBQTBELENBQUE7UUFDMUQsb0ZBQXNELENBQUE7UUFDdEQsOEdBQWdGLENBQUE7UUFDaEYsd0VBQTBDLENBQUE7UUFDMUMsMEVBQTRDLENBQUE7UUFDNUMsd0VBQTBDLENBQUE7UUFDMUMsNEVBQThDLENBQUE7UUFDOUMsa0ZBQW9ELENBQUE7UUFDcEQsb0VBQXNDLENBQUE7UUFDdEMsd0VBQTBDLENBQUE7UUFDMUMsMEVBQTRDLENBQUE7SUFDN0MsQ0FBQyxFQWRpQiwwQkFBMEIsMENBQTFCLDBCQUEwQixRQWMzQztJQUVELElBQWtCLDRCQXlDakI7SUF6Q0QsV0FBa0IsNEJBQTRCO1FBQzdDLGtFQUFrQyxDQUFBO1FBQ2xDLGdFQUFnQyxDQUFBO1FBQ2hDLG9FQUFvQyxDQUFBO1FBQ3BDLHdFQUF3QyxDQUFBO1FBQ3hDLGdFQUFnQyxDQUFBO1FBQ2hDLDBEQUEwQixDQUFBO1FBQzFCLDRFQUE0QyxDQUFBO1FBQzVDLDRFQUE0QyxDQUFBO1FBQzVDLGtHQUFrRSxDQUFBO1FBQ2xFLGdEQUFnQixDQUFBO1FBQ2hCLGdEQUFnQixDQUFBO1FBQ2hCLDhFQUE4QyxDQUFBO1FBQzlDLHNEQUFzQixDQUFBO1FBQ3RCLGtEQUFrQixDQUFBO1FBQ2xCLDREQUE0QixDQUFBO1FBQzVCLGdFQUFnQyxDQUFBO1FBQ2hDLGtEQUFrQixDQUFBO1FBQ2xCLGdFQUFnQyxDQUFBO1FBQ2hDLHdFQUF3QyxDQUFBO1FBQ3hDLHNFQUFzQyxDQUFBO1FBQ3RDLG9GQUFvRCxDQUFBO1FBQ3BELGdGQUFnRCxDQUFBO1FBQ2hELDREQUE0QixDQUFBO1FBQzVCLGtFQUFrQyxDQUFBO1FBQ2xDLDBEQUEwQixDQUFBO1FBQzFCLGdGQUFnRCxDQUFBO1FBQ2hELGdGQUFnRCxDQUFBO1FBQ2hELGtGQUFrRCxDQUFBO1FBQ2xELG9GQUFvRCxDQUFBO1FBQ3BELDBFQUEwQyxDQUFBO1FBQzFDLHdFQUF3QyxDQUFBO1FBQ3hDLHdGQUF3RCxDQUFBO1FBQ3hELDBEQUEwQixDQUFBO1FBQzFCLDREQUE0QixDQUFBO1FBQzVCLGtFQUFrQyxDQUFBO1FBQ2xDLG9FQUFvQyxDQUFBO1FBQ3BDLGdGQUFnRCxDQUFBO1FBQ2hELHdGQUF3RCxDQUFBO1FBQ3hELGtGQUFrRCxDQUFBO1FBQ2xELDRFQUE0QyxDQUFBO0lBQzdDLENBQUMsRUF6Q2lCLDRCQUE0Qiw0Q0FBNUIsNEJBQTRCLFFBeUM3QyJ9