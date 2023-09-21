/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/platform/theme/common/themeService", "vs/workbench/common/editor/textResourceEditorInput", "vs/base/common/uri", "vs/editor/common/services/resolverService", "vs/workbench/services/output/common/output", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, nls_1, path_1, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, textResourceEditor_1, themeService_1, textResourceEditorInput_1, uri_1, resolverService_1, output_1, editorGroupsService_1, editorService_1, textfiles_1, files_1, label_1, filesConfigurationService_1) {
    "use strict";
    var LogViewerInput_1, LogViewer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogViewer = exports.LogViewerInput = void 0;
    let LogViewerInput = class LogViewerInput extends textResourceEditorInput_1.TextResourceEditorInput {
        static { LogViewerInput_1 = this; }
        static { this.ID = 'workbench.editorinputs.output'; }
        get typeId() {
            return LogViewerInput_1.ID;
        }
        constructor(outputChannelDescriptor, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService) {
            super(uri_1.URI.from({ scheme: output_1.LOG_SCHEME, path: outputChannelDescriptor.id }), (0, path_1.basename)(outputChannelDescriptor.file.path), (0, path_1.dirname)(outputChannelDescriptor.file.path), undefined, undefined, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService);
        }
    };
    exports.LogViewerInput = LogViewerInput;
    exports.LogViewerInput = LogViewerInput = LogViewerInput_1 = __decorate([
        __param(1, resolverService_1.ITextModelService),
        __param(2, textfiles_1.ITextFileService),
        __param(3, editorService_1.IEditorService),
        __param(4, files_1.IFileService),
        __param(5, label_1.ILabelService),
        __param(6, filesConfigurationService_1.IFilesConfigurationService)
    ], LogViewerInput);
    let LogViewer = class LogViewer extends textResourceEditor_1.AbstractTextResourceEditor {
        static { LogViewer_1 = this; }
        static { this.LOG_VIEWER_EDITOR_ID = 'workbench.editors.logViewer'; }
        constructor(telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
            super(LogViewer_1.LOG_VIEWER_EDITOR_ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
        }
        getConfigurationOverrides() {
            const options = super.getConfigurationOverrides();
            options.wordWrap = 'off'; // all log viewers do not wrap
            options.folding = false;
            options.scrollBeyondLastLine = false;
            options.renderValidationDecorations = 'editable';
            return options;
        }
        getAriaLabel() {
            return (0, nls_1.localize)('logViewerAriaLabel', "Log viewer");
        }
    };
    exports.LogViewer = LogViewer;
    exports.LogViewer = LogViewer = LogViewer_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(4, themeService_1.IThemeService),
        __param(5, editorGroupsService_1.IEditorGroupsService),
        __param(6, editorService_1.IEditorService),
        __param(7, files_1.IFileService)
    ], LogViewer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nVmlld2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvb3V0cHV0L2Jyb3dzZXIvbG9nVmlld2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzQnpGLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxpREFBdUI7O2lCQUVqQyxPQUFFLEdBQUcsK0JBQStCLEFBQWxDLENBQW1DO1FBRTlELElBQWEsTUFBTTtZQUNsQixPQUFPLGdCQUFjLENBQUMsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxZQUNDLHVCQUFxRCxFQUNsQyx3QkFBMkMsRUFDNUMsZUFBaUMsRUFDbkMsYUFBNkIsRUFDL0IsV0FBeUIsRUFDeEIsWUFBMkIsRUFDZCx5QkFBcUQ7WUFFakYsS0FBSyxDQUNKLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsbUJBQVUsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDbEUsSUFBQSxlQUFRLEVBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUMzQyxJQUFBLGNBQU8sRUFBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQzFDLFNBQVMsRUFDVCxTQUFTLEVBQ1Qsd0JBQXdCLEVBQ3hCLGVBQWUsRUFDZixhQUFhLEVBQ2IsV0FBVyxFQUNYLFlBQVksRUFDWix5QkFBeUIsQ0FDekIsQ0FBQztRQUNILENBQUM7O0lBOUJXLHdDQUFjOzZCQUFkLGNBQWM7UUFVeEIsV0FBQSxtQ0FBaUIsQ0FBQTtRQUNqQixXQUFBLDRCQUFnQixDQUFBO1FBQ2hCLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsc0RBQTBCLENBQUE7T0FmaEIsY0FBYyxDQStCMUI7SUFFTSxJQUFNLFNBQVMsR0FBZixNQUFNLFNBQVUsU0FBUSwrQ0FBMEI7O2lCQUV4Qyx5QkFBb0IsR0FBRyw2QkFBNkIsQUFBaEMsQ0FBaUM7UUFFckUsWUFDb0IsZ0JBQW1DLEVBQy9CLG9CQUEyQyxFQUNqRCxjQUErQixFQUNiLGdDQUFtRSxFQUN2RixZQUEyQixFQUNwQixrQkFBd0MsRUFDOUMsYUFBNkIsRUFDL0IsV0FBeUI7WUFFdkMsS0FBSyxDQUFDLFdBQVMsQ0FBQyxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsZ0NBQWdDLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMvTCxDQUFDO1FBRWtCLHlCQUF5QjtZQUMzQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNsRCxPQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLDhCQUE4QjtZQUN4RCxPQUFPLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN4QixPQUFPLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQywyQkFBMkIsR0FBRyxVQUFVLENBQUM7WUFDakQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVTLFlBQVk7WUFDckIsT0FBTyxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNyRCxDQUFDOztJQTVCVyw4QkFBUzt3QkFBVCxTQUFTO1FBS25CLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLDZEQUFpQyxDQUFBO1FBQ2pDLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsMENBQW9CLENBQUE7UUFDcEIsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSxvQkFBWSxDQUFBO09BWkYsU0FBUyxDQTZCckIifQ==