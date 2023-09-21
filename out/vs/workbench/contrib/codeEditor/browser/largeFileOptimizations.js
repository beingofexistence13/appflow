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
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification"], function (require, exports, nls, path, lifecycle_1, editorExtensions_1, configuration_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LargeFileOptimizationsWarner = void 0;
    /**
     * Shows a message when opening a large file which has been memory optimized (and features disabled).
     */
    let LargeFileOptimizationsWarner = class LargeFileOptimizationsWarner extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.largeFileOptimizationsWarner'; }
        constructor(_editor, _notificationService, _configurationService) {
            super();
            this._editor = _editor;
            this._notificationService = _notificationService;
            this._configurationService = _configurationService;
            this._register(this._editor.onDidChangeModel((e) => this._update()));
            this._update();
        }
        _update() {
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            if (model.isTooLargeForTokenization()) {
                const message = nls.localize({
                    key: 'largeFile',
                    comment: [
                        'Variable 0 will be a file name.'
                    ]
                }, "{0}: tokenization, wrapping, folding, codelens, word highlighting and sticky scroll have been turned off for this large file in order to reduce memory usage and avoid freezing or crashing.", path.basename(model.uri.path));
                this._notificationService.prompt(notification_1.Severity.Info, message, [
                    {
                        label: nls.localize('removeOptimizations', "Forcefully Enable Features"),
                        run: () => {
                            this._configurationService.updateValue(`editor.largeFileOptimizations`, false).then(() => {
                                this._notificationService.info(nls.localize('reopenFilePrompt', "Please reopen file in order for this setting to take effect."));
                            }, (err) => {
                                this._notificationService.error(err);
                            });
                        }
                    }
                ], { neverShowAgain: { id: 'editor.contrib.largeFileOptimizationsWarner' } });
            }
        }
    };
    exports.LargeFileOptimizationsWarner = LargeFileOptimizationsWarner;
    exports.LargeFileOptimizationsWarner = LargeFileOptimizationsWarner = __decorate([
        __param(1, notification_1.INotificationService),
        __param(2, configuration_1.IConfigurationService)
    ], LargeFileOptimizationsWarner);
    (0, editorExtensions_1.registerEditorContribution)(LargeFileOptimizationsWarner.ID, LargeFileOptimizationsWarner, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFyZ2VGaWxlT3B0aW1pemF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9sYXJnZUZpbGVPcHRpbWl6YXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVdoRzs7T0FFRztJQUNJLElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7aUJBRXBDLE9BQUUsR0FBRyw2Q0FBNkMsQUFBaEQsQ0FBaUQ7UUFFMUUsWUFDa0IsT0FBb0IsRUFDRSxvQkFBMEMsRUFDekMscUJBQTRDO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBSlMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNFLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDekMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUlwRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxPQUFPO1lBQ2QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE9BQU87YUFDUDtZQUVELElBQUksS0FBSyxDQUFDLHlCQUF5QixFQUFFLEVBQUU7Z0JBQ3RDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQzNCO29CQUNDLEdBQUcsRUFBRSxXQUFXO29CQUNoQixPQUFPLEVBQUU7d0JBQ1IsaUNBQWlDO3FCQUNqQztpQkFDRCxFQUNELDhMQUE4TCxFQUM5TCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQzdCLENBQUM7Z0JBRUYsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyx1QkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7b0JBQ3hEO3dCQUNDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLDRCQUE0QixDQUFDO3dCQUN4RSxHQUFHLEVBQUUsR0FBRyxFQUFFOzRCQUNULElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQ0FDeEYsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLDhEQUE4RCxDQUFDLENBQUMsQ0FBQzs0QkFDbEksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0NBQ1YsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDdEMsQ0FBQyxDQUFDLENBQUM7d0JBQ0osQ0FBQztxQkFDRDtpQkFDRCxFQUFFLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLDZDQUE2QyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzlFO1FBQ0YsQ0FBQzs7SUE5Q1csb0VBQTRCOzJDQUE1Qiw0QkFBNEI7UUFNdEMsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLHFDQUFxQixDQUFBO09BUFgsNEJBQTRCLENBK0N4QztJQUVELElBQUEsNkNBQTBCLEVBQUMsNEJBQTRCLENBQUMsRUFBRSxFQUFFLDRCQUE0QiwyREFBbUQsQ0FBQyJ9