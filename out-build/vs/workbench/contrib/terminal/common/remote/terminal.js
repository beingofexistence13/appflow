/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTerminalChannelRequest = exports.RemoteTerminalChannelEvent = exports.$MM = void 0;
    exports.$MM = 'remoteterminal';
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
//# sourceMappingURL=terminal.js.map