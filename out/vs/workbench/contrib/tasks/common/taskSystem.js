/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskExecuteKind = exports.Triggers = exports.TaskError = exports.TaskErrors = void 0;
    var TaskErrors;
    (function (TaskErrors) {
        TaskErrors[TaskErrors["NotConfigured"] = 0] = "NotConfigured";
        TaskErrors[TaskErrors["RunningTask"] = 1] = "RunningTask";
        TaskErrors[TaskErrors["NoBuildTask"] = 2] = "NoBuildTask";
        TaskErrors[TaskErrors["NoTestTask"] = 3] = "NoTestTask";
        TaskErrors[TaskErrors["ConfigValidationError"] = 4] = "ConfigValidationError";
        TaskErrors[TaskErrors["TaskNotFound"] = 5] = "TaskNotFound";
        TaskErrors[TaskErrors["NoValidTaskRunner"] = 6] = "NoValidTaskRunner";
        TaskErrors[TaskErrors["UnknownError"] = 7] = "UnknownError";
    })(TaskErrors || (exports.TaskErrors = TaskErrors = {}));
    class TaskError {
        constructor(severity, message, code) {
            this.severity = severity;
            this.message = message;
            this.code = code;
        }
    }
    exports.TaskError = TaskError;
    var Triggers;
    (function (Triggers) {
        Triggers.shortcut = 'shortcut';
        Triggers.command = 'command';
        Triggers.reconnect = 'reconnect';
    })(Triggers || (exports.Triggers = Triggers = {}));
    var TaskExecuteKind;
    (function (TaskExecuteKind) {
        TaskExecuteKind[TaskExecuteKind["Started"] = 1] = "Started";
        TaskExecuteKind[TaskExecuteKind["Active"] = 2] = "Active";
    })(TaskExecuteKind || (exports.TaskExecuteKind = TaskExecuteKind = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza1N5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2NvbW1vbi90YXNrU3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxJQUFrQixVQVNqQjtJQVRELFdBQWtCLFVBQVU7UUFDM0IsNkRBQWEsQ0FBQTtRQUNiLHlEQUFXLENBQUE7UUFDWCx5REFBVyxDQUFBO1FBQ1gsdURBQVUsQ0FBQTtRQUNWLDZFQUFxQixDQUFBO1FBQ3JCLDJEQUFZLENBQUE7UUFDWixxRUFBaUIsQ0FBQTtRQUNqQiwyREFBWSxDQUFBO0lBQ2IsQ0FBQyxFQVRpQixVQUFVLDBCQUFWLFVBQVUsUUFTM0I7SUFFRCxNQUFhLFNBQVM7UUFLckIsWUFBWSxRQUFrQixFQUFFLE9BQWUsRUFBRSxJQUFnQjtZQUNoRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixDQUFDO0tBQ0Q7SUFWRCw4QkFVQztJQUVELElBQWlCLFFBQVEsQ0FJeEI7SUFKRCxXQUFpQixRQUFRO1FBQ1gsaUJBQVEsR0FBVyxVQUFVLENBQUM7UUFDOUIsZ0JBQU8sR0FBVyxTQUFTLENBQUM7UUFDNUIsa0JBQVMsR0FBVyxXQUFXLENBQUM7SUFDOUMsQ0FBQyxFQUpnQixRQUFRLHdCQUFSLFFBQVEsUUFJeEI7SUFTRCxJQUFrQixlQUdqQjtJQUhELFdBQWtCLGVBQWU7UUFDaEMsMkRBQVcsQ0FBQTtRQUNYLHlEQUFVLENBQUE7SUFDWCxDQUFDLEVBSGlCLGVBQWUsK0JBQWYsZUFBZSxRQUdoQyJ9