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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/contrib/performance/browser/perfviewEditor", "vs/workbench/services/extensions/common/extensions", "vs/platform/clipboard/common/clipboardService", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/platform/files/common/files", "vs/platform/label/common/label"], function (require, exports, nls_1, resources_1, resolverService_1, dialogs_1, environmentService_1, lifecycle_1, perfviewEditor_1, extensions_1, clipboardService_1, uri_1, opener_1, native_1, productService_1, files_1, label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartupProfiler = void 0;
    let StartupProfiler = class StartupProfiler {
        constructor(_dialogService, _environmentService, _textModelResolverService, _clipboardService, lifecycleService, extensionService, _openerService, _nativeHostService, _productService, _fileService, _labelService) {
            this._dialogService = _dialogService;
            this._environmentService = _environmentService;
            this._textModelResolverService = _textModelResolverService;
            this._clipboardService = _clipboardService;
            this._openerService = _openerService;
            this._nativeHostService = _nativeHostService;
            this._productService = _productService;
            this._fileService = _fileService;
            this._labelService = _labelService;
            // wait for everything to be ready
            Promise.all([
                lifecycleService.when(4 /* LifecyclePhase.Eventually */),
                extensionService.whenInstalledExtensionsRegistered()
            ]).then(() => {
                this._stopProfiling();
            });
        }
        _stopProfiling() {
            if (!this._environmentService.args['prof-startup-prefix']) {
                return;
            }
            const profileFilenamePrefix = uri_1.URI.file(this._environmentService.args['prof-startup-prefix']);
            const dir = (0, resources_1.dirname)(profileFilenamePrefix);
            const prefix = (0, resources_1.basename)(profileFilenamePrefix);
            const removeArgs = ['--prof-startup'];
            const markerFile = this._fileService.readFile(profileFilenamePrefix).then(value => removeArgs.push(...value.toString().split('|')))
                .then(() => this._fileService.del(profileFilenamePrefix, { recursive: true })) // (1) delete the file to tell the main process to stop profiling
                .then(() => new Promise(resolve => {
                const check = () => {
                    this._fileService.exists(profileFilenamePrefix).then(exists => {
                        if (exists) {
                            resolve();
                        }
                        else {
                            setTimeout(check, 500);
                        }
                    });
                };
                check();
            }))
                .then(() => this._fileService.del(profileFilenamePrefix, { recursive: true })); // (3) finally delete the file again
            markerFile.then(() => {
                return this._fileService.resolve(dir).then(stat => {
                    return (stat.children ? stat.children.filter(value => value.resource.path.includes(prefix)) : []).map(stat => stat.resource);
                });
            }).then(files => {
                const profileFiles = files.reduce((prev, cur) => `${prev}${this._labelService.getUriLabel(cur)}\n`, '\n');
                return this._dialogService.confirm({
                    type: 'info',
                    message: (0, nls_1.localize)('prof.message', "Successfully created profiles."),
                    detail: (0, nls_1.localize)('prof.detail', "Please create an issue and manually attach the following files:\n{0}", profileFiles),
                    primaryButton: (0, nls_1.localize)({ key: 'prof.restartAndFileIssue', comment: ['&& denotes a mnemonic'] }, "&&Create Issue and Restart"),
                    cancelButton: (0, nls_1.localize)('prof.restart', "Restart")
                }).then(res => {
                    if (res.confirmed) {
                        Promise.all([
                            this._nativeHostService.showItemInFolder(files[0].fsPath),
                            this._createPerfIssue(files.map(file => (0, resources_1.basename)(file)))
                        ]).then(() => {
                            // keep window stable until restart is selected
                            return this._dialogService.confirm({
                                type: 'info',
                                message: (0, nls_1.localize)('prof.thanks', "Thanks for helping us."),
                                detail: (0, nls_1.localize)('prof.detail.restart', "A final restart is required to continue to use '{0}'. Again, thank you for your contribution.", this._productService.nameLong),
                                primaryButton: (0, nls_1.localize)({ key: 'prof.restart.button', comment: ['&& denotes a mnemonic'] }, "&&Restart")
                            }).then(res => {
                                // now we are ready to restart
                                if (res.confirmed) {
                                    this._nativeHostService.relaunch({ removeArgs });
                                }
                            });
                        });
                    }
                    else {
                        // simply restart
                        this._nativeHostService.relaunch({ removeArgs });
                    }
                });
            });
        }
        async _createPerfIssue(files) {
            const reportIssueUrl = this._productService.reportIssueUrl;
            if (!reportIssueUrl) {
                return;
            }
            const ref = await this._textModelResolverService.createModelReference(perfviewEditor_1.PerfviewInput.Uri);
            try {
                await this._clipboardService.writeText(ref.object.textEditorModel.getValue());
            }
            finally {
                ref.dispose();
            }
            const body = `
1. :warning: We have copied additional data to your clipboard. Make sure to **paste** here. :warning:
1. :warning: Make sure to **attach** these files from your *home*-directory: :warning:\n${files.map(file => `-\`${file}\``).join('\n')}
`;
            const baseUrl = reportIssueUrl;
            const queryStringPrefix = baseUrl.indexOf('?') === -1 ? '?' : '&';
            this._openerService.open(uri_1.URI.parse(`${baseUrl}${queryStringPrefix}body=${encodeURIComponent(body)}`));
        }
    };
    exports.StartupProfiler = StartupProfiler;
    exports.StartupProfiler = StartupProfiler = __decorate([
        __param(0, dialogs_1.IDialogService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(2, resolverService_1.ITextModelService),
        __param(3, clipboardService_1.IClipboardService),
        __param(4, lifecycle_1.ILifecycleService),
        __param(5, extensions_1.IExtensionService),
        __param(6, opener_1.IOpenerService),
        __param(7, native_1.INativeHostService),
        __param(8, productService_1.IProductService),
        __param(9, files_1.IFileService),
        __param(10, label_1.ILabelService)
    ], StartupProfiler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cFByb2ZpbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcGVyZm9ybWFuY2UvZWxlY3Ryb24tc2FuZGJveC9zdGFydHVwUHJvZmlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO1FBRTNCLFlBQ2tDLGNBQThCLEVBQ1YsbUJBQXVELEVBQ3hFLHlCQUE0QyxFQUM1QyxpQkFBb0MsRUFDckQsZ0JBQW1DLEVBQ25DLGdCQUFtQyxFQUNyQixjQUE4QixFQUMxQixrQkFBc0MsRUFDekMsZUFBZ0MsRUFDbkMsWUFBMEIsRUFDekIsYUFBNEI7WUFWM0IsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ1Ysd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvQztZQUN4RSw4QkFBeUIsR0FBekIseUJBQXlCLENBQW1CO1lBQzVDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFHdkMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDekMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ25DLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ3pCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBRTVELGtDQUFrQztZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNYLGdCQUFnQixDQUFDLElBQUksbUNBQTJCO2dCQUNoRCxnQkFBZ0IsQ0FBQyxpQ0FBaUMsRUFBRTthQUNwRCxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sY0FBYztZQUVyQixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFt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