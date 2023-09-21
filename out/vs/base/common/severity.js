/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Severity;
    (function (Severity) {
        Severity[Severity["Ignore"] = 0] = "Ignore";
        Severity[Severity["Info"] = 1] = "Info";
        Severity[Severity["Warning"] = 2] = "Warning";
        Severity[Severity["Error"] = 3] = "Error";
    })(Severity || (Severity = {}));
    (function (Severity) {
        const _error = 'error';
        const _warning = 'warning';
        const _warn = 'warn';
        const _info = 'info';
        const _ignore = 'ignore';
        /**
         * Parses 'error', 'warning', 'warn', 'info' in call casings
         * and falls back to ignore.
         */
        function fromValue(value) {
            if (!value) {
                return Severity.Ignore;
            }
            if (strings.equalsIgnoreCase(_error, value)) {
                return Severity.Error;
            }
            if (strings.equalsIgnoreCase(_warning, value) || strings.equalsIgnoreCase(_warn, value)) {
                return Severity.Warning;
            }
            if (strings.equalsIgnoreCase(_info, value)) {
                return Severity.Info;
            }
            return Severity.Ignore;
        }
        Severity.fromValue = fromValue;
        function toString(severity) {
            switch (severity) {
                case Severity.Error: return _error;
                case Severity.Warning: return _warning;
                case Severity.Info: return _info;
                default: return _ignore;
            }
        }
        Severity.toString = toString;
    })(Severity || (Severity = {}));
    exports.default = Severity;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V2ZXJpdHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9zZXZlcml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQUloRyxJQUFLLFFBS0o7SUFMRCxXQUFLLFFBQVE7UUFDWiwyQ0FBVSxDQUFBO1FBQ1YsdUNBQVEsQ0FBQTtRQUNSLDZDQUFXLENBQUE7UUFDWCx5Q0FBUyxDQUFBO0lBQ1YsQ0FBQyxFQUxJLFFBQVEsS0FBUixRQUFRLFFBS1o7SUFFRCxXQUFVLFFBQVE7UUFFakIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQztRQUMzQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDckIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUV6Qjs7O1dBR0c7UUFDSCxTQUFnQixTQUFTLENBQUMsS0FBYTtZQUN0QyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUN2QjtZQUVELElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDNUMsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hGLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQzthQUN4QjtZQUVELElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDM0MsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDO2FBQ3JCO1lBQ0QsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ3hCLENBQUM7UUFqQmUsa0JBQVMsWUFpQnhCLENBQUE7UUFFRCxTQUFnQixRQUFRLENBQUMsUUFBa0I7WUFDMUMsUUFBUSxRQUFRLEVBQUU7Z0JBQ2pCLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDO2dCQUNuQyxLQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLFFBQVEsQ0FBQztnQkFDdkMsS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7Z0JBQ2pDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDO2FBQ3hCO1FBQ0YsQ0FBQztRQVBlLGlCQUFRLFdBT3ZCLENBQUE7SUFDRixDQUFDLEVBdkNTLFFBQVEsS0FBUixRQUFRLFFBdUNqQjtJQUVELGtCQUFlLFFBQVEsQ0FBQyJ9