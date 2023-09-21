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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testingUri"], function (require, exports, buffer_1, lifecycle_1, strings_1, language_1, model_1, resolverService_1, nls_1, testResultService_1, testingUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingContentProvider = void 0;
    /**
     * A content provider that returns various outputs for tests. This is used
     * in the inline peek view.
     */
    let TestingContentProvider = class TestingContentProvider {
        constructor(textModelResolverService, languageService, modelService, resultService) {
            this.languageService = languageService;
            this.modelService = modelService;
            this.resultService = resultService;
            textModelResolverService.registerTextModelContentProvider(testingUri_1.TEST_DATA_SCHEME, this);
        }
        /**
         * @inheritdoc
         */
        async provideTextContent(resource) {
            const existing = this.modelService.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            const parsed = (0, testingUri_1.parseTestUri)(resource);
            if (!parsed) {
                return null;
            }
            const result = this.resultService.getResult(parsed.resultId);
            if (!result) {
                return null;
            }
            if (parsed.type === 0 /* TestUriType.TaskOutput */) {
                const task = result.tasks[parsed.taskIndex];
                const model = this.modelService.createModel('', null, resource, false);
                const append = (text) => model.applyEdits([{
                        range: { startColumn: 1, endColumn: 1, startLineNumber: Infinity, endLineNumber: Infinity },
                        text,
                    }]);
                const init = buffer_1.VSBuffer.concat(task.output.buffers, task.output.length).toString();
                append((0, strings_1.removeAnsiEscapeCodes)(init));
                let hadContent = init.length > 0;
                const dispose = new lifecycle_1.DisposableStore();
                dispose.add(task.output.onDidWriteData(d => {
                    hadContent ||= d.byteLength > 0;
                    append((0, strings_1.removeAnsiEscapeCodes)(d.toString()));
                }));
                task.output.endPromise.then(() => {
                    if (dispose.isDisposed) {
                        return;
                    }
                    if (!hadContent) {
                        append((0, nls_1.localize)('runNoOutout', 'The test run did not record any output.'));
                        dispose.dispose();
                    }
                });
                model.onWillDispose(() => dispose.dispose());
                return model;
            }
            const test = result?.getStateById(parsed.testExtId);
            if (!test) {
                return null;
            }
            let text;
            let language = null;
            switch (parsed.type) {
                case 3 /* TestUriType.ResultActualOutput */: {
                    const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
                    if (message?.type === 0 /* TestMessageType.Error */) {
                        text = message.actual;
                    }
                    break;
                }
                case 1 /* TestUriType.TestOutput */: {
                    text = '';
                    const output = result.tasks[parsed.taskIndex].output;
                    for (const message of test.tasks[parsed.taskIndex].messages) {
                        if (message.type === 1 /* TestMessageType.Output */) {
                            text += (0, strings_1.removeAnsiEscapeCodes)(output.getRange(message.offset, message.length).toString());
                        }
                    }
                    break;
                }
                case 4 /* TestUriType.ResultExpectedOutput */: {
                    const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
                    if (message?.type === 0 /* TestMessageType.Error */) {
                        text = message.expected;
                    }
                    break;
                }
                case 2 /* TestUriType.ResultMessage */: {
                    const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
                    if (!message) {
                        break;
                    }
                    if (message.type === 1 /* TestMessageType.Output */) {
                        const content = result.tasks[parsed.taskIndex].output.getRange(message.offset, message.length);
                        text = (0, strings_1.removeAnsiEscapeCodes)(content.toString());
                    }
                    else if (typeof message.message === 'string') {
                        text = message.message;
                    }
                    else {
                        text = message.message.value;
                        language = this.languageService.createById('markdown');
                    }
                }
            }
            if (text === undefined) {
                return null;
            }
            return this.modelService.createModel(text, language, resource, false);
        }
    };
    exports.TestingContentProvider = TestingContentProvider;
    exports.TestingContentProvider = TestingContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, language_1.ILanguageService),
        __param(2, model_1.IModelService),
        __param(3, testResultService_1.ITestResultService)
    ], TestingContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0NvbnRlbnRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvY29tbW9uL3Rlc3RpbmdDb250ZW50UHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0JoRzs7O09BR0c7SUFDSSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUFzQjtRQUNsQyxZQUNvQix3QkFBMkMsRUFDM0IsZUFBaUMsRUFDcEMsWUFBMkIsRUFDdEIsYUFBaUM7WUFGbkMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3BDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3RCLGtCQUFhLEdBQWIsYUFBYSxDQUFvQjtZQUV0RSx3QkFBd0IsQ0FBQyxnQ0FBZ0MsQ0FBQyw2QkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBYTtZQUM1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0RCxJQUFJLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDdkMsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFBLHlCQUFZLEVBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElB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