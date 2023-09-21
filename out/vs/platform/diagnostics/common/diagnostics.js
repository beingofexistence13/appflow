/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NullDiagnosticsService = exports.isRemoteDiagnosticError = exports.IDiagnosticsService = exports.ID = void 0;
    exports.ID = 'diagnosticsService';
    exports.IDiagnosticsService = (0, instantiation_1.createDecorator)(exports.ID);
    function isRemoteDiagnosticError(x) {
        return !!x.hostName && !!x.errorMessage;
    }
    exports.isRemoteDiagnosticError = isRemoteDiagnosticError;
    class NullDiagnosticsService {
        async getPerformanceInfo(mainProcessInfo, remoteInfo) {
            return {};
        }
        async getSystemInfo(mainProcessInfo, remoteInfo) {
            return {
                processArgs: 'nullProcessArgs',
                gpuStatus: 'nullGpuStatus',
                screenReader: 'nullScreenReader',
                remoteData: [],
                os: 'nullOs',
                memory: 'nullMemory',
                vmHint: 'nullVmHint',
            };
        }
        async getDiagnostics(mainProcessInfo, remoteInfo) {
            return '';
        }
        async getWorkspaceFileExtensions(workspace) {
            return { extensions: [] };
        }
        async reportWorkspaceStats(workspace) { }
    }
    exports.NullDiagnosticsService = NullDiagnosticsService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9kaWFnbm9zdGljcy9jb21tb24vZGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUW5GLFFBQUEsRUFBRSxHQUFHLG9CQUFvQixDQUFDO0lBQzFCLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwrQkFBZSxFQUFzQixVQUFFLENBQUMsQ0FBQztJQWtGNUUsU0FBZ0IsdUJBQXVCLENBQUMsQ0FBTTtRQUM3QyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO0lBQ3pDLENBQUM7SUFGRCwwREFFQztJQUVELE1BQWEsc0JBQXNCO1FBR2xDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxlQUF3QyxFQUFFLFVBQThEO1lBQ2hJLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsZUFBd0MsRUFBRSxVQUE4RDtZQUMzSCxPQUFPO2dCQUNOLFdBQVcsRUFBRSxpQkFBaUI7Z0JBQzlCLFNBQVMsRUFBRSxlQUFlO2dCQUMxQixZQUFZLEVBQUUsa0JBQWtCO2dCQUNoQyxVQUFVLEVBQUUsRUFBRTtnQkFDZCxFQUFFLEVBQUUsUUFBUTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsTUFBTSxFQUFFLFlBQVk7YUFDcEIsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQXdDLEVBQUUsVUFBOEQ7WUFDNUgsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsS0FBSyxDQUFDLDBCQUEwQixDQUFDLFNBQXFCO1lBQ3JELE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxTQUFnQyxJQUFtQixDQUFDO0tBRS9FO0lBN0JELHdEQTZCQyJ9