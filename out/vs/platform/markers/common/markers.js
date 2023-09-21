/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/severity", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, severity_1, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IMarkerService = exports.IMarkerData = exports.MarkerSeverity = exports.MarkerTag = void 0;
    var MarkerTag;
    (function (MarkerTag) {
        MarkerTag[MarkerTag["Unnecessary"] = 1] = "Unnecessary";
        MarkerTag[MarkerTag["Deprecated"] = 2] = "Deprecated";
    })(MarkerTag || (exports.MarkerTag = MarkerTag = {}));
    var MarkerSeverity;
    (function (MarkerSeverity) {
        MarkerSeverity[MarkerSeverity["Hint"] = 1] = "Hint";
        MarkerSeverity[MarkerSeverity["Info"] = 2] = "Info";
        MarkerSeverity[MarkerSeverity["Warning"] = 4] = "Warning";
        MarkerSeverity[MarkerSeverity["Error"] = 8] = "Error";
    })(MarkerSeverity || (exports.MarkerSeverity = MarkerSeverity = {}));
    (function (MarkerSeverity) {
        function compare(a, b) {
            return b - a;
        }
        MarkerSeverity.compare = compare;
        const _displayStrings = Object.create(null);
        _displayStrings[MarkerSeverity.Error] = (0, nls_1.localize)('sev.error', "Error");
        _displayStrings[MarkerSeverity.Warning] = (0, nls_1.localize)('sev.warning', "Warning");
        _displayStrings[MarkerSeverity.Info] = (0, nls_1.localize)('sev.info', "Info");
        function toString(a) {
            return _displayStrings[a] || '';
        }
        MarkerSeverity.toString = toString;
        function fromSeverity(severity) {
            switch (severity) {
                case severity_1.default.Error: return MarkerSeverity.Error;
                case severity_1.default.Warning: return MarkerSeverity.Warning;
                case severity_1.default.Info: return MarkerSeverity.Info;
                case severity_1.default.Ignore: return MarkerSeverity.Hint;
            }
        }
        MarkerSeverity.fromSeverity = fromSeverity;
        function toSeverity(severity) {
            switch (severity) {
                case MarkerSeverity.Error: return severity_1.default.Error;
                case MarkerSeverity.Warning: return severity_1.default.Warning;
                case MarkerSeverity.Info: return severity_1.default.Info;
                case MarkerSeverity.Hint: return severity_1.default.Ignore;
            }
        }
        MarkerSeverity.toSeverity = toSeverity;
    })(MarkerSeverity || (exports.MarkerSeverity = MarkerSeverity = {}));
    var IMarkerData;
    (function (IMarkerData) {
        const emptyString = '';
        function makeKey(markerData) {
            return makeKeyOptionalMessage(markerData, true);
        }
        IMarkerData.makeKey = makeKey;
        function makeKeyOptionalMessage(markerData, useMessage) {
            const result = [emptyString];
            if (markerData.source) {
                result.push(markerData.source.replace('¦', '\\¦'));
            }
            else {
                result.push(emptyString);
            }
            if (markerData.code) {
                if (typeof markerData.code === 'string') {
                    result.push(markerData.code.replace('¦', '\\¦'));
                }
                else {
                    result.push(markerData.code.value.replace('¦', '\\¦'));
                }
            }
            else {
                result.push(emptyString);
            }
            if (markerData.severity !== undefined && markerData.severity !== null) {
                result.push(MarkerSeverity.toString(markerData.severity));
            }
            else {
                result.push(emptyString);
            }
            // Modifed to not include the message as part of the marker key to work around
            // https://github.com/microsoft/vscode/issues/77475
            if (markerData.message && useMessage) {
                result.push(markerData.message.replace('¦', '\\¦'));
            }
            else {
                result.push(emptyString);
            }
            if (markerData.startLineNumber !== undefined && markerData.startLineNumber !== null) {
                result.push(markerData.startLineNumber.toString());
            }
            else {
                result.push(emptyString);
            }
            if (markerData.startColumn !== undefined && markerData.startColumn !== null) {
                result.push(markerData.startColumn.toString());
            }
            else {
                result.push(emptyString);
            }
            if (markerData.endLineNumber !== undefined && markerData.endLineNumber !== null) {
                result.push(markerData.endLineNumber.toString());
            }
            else {
                result.push(emptyString);
            }
            if (markerData.endColumn !== undefined && markerData.endColumn !== null) {
                result.push(markerData.endColumn.toString());
            }
            else {
                result.push(emptyString);
            }
            result.push(emptyString);
            return result.join('¦');
        }
        IMarkerData.makeKeyOptionalMessage = makeKeyOptionalMessage;
    })(IMarkerData || (exports.IMarkerData = IMarkerData = {}));
    exports.IMarkerService = (0, instantiation_1.createDecorator)('markerService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL21hcmtlcnMvY29tbW9uL21hcmtlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0NoRyxJQUFrQixTQUdqQjtJQUhELFdBQWtCLFNBQVM7UUFDMUIsdURBQWUsQ0FBQTtRQUNmLHFEQUFjLENBQUE7SUFDZixDQUFDLEVBSGlCLFNBQVMseUJBQVQsU0FBUyxRQUcxQjtJQUVELElBQVksY0FLWDtJQUxELFdBQVksY0FBYztRQUN6QixtREFBUSxDQUFBO1FBQ1IsbURBQVEsQ0FBQTtRQUNSLHlEQUFXLENBQUE7UUFDWCxxREFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUxXLGNBQWMsOEJBQWQsY0FBYyxRQUt6QjtJQUVELFdBQWlCLGNBQWM7UUFFOUIsU0FBZ0IsT0FBTyxDQUFDLENBQWlCLEVBQUUsQ0FBaUI7WUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsQ0FBQztRQUZlLHNCQUFPLFVBRXRCLENBQUE7UUFFRCxNQUFNLGVBQWUsR0FBZ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RSxlQUFlLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSxlQUFlLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3RSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVwRSxTQUFnQixRQUFRLENBQUMsQ0FBaUI7WUFDekMsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFD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