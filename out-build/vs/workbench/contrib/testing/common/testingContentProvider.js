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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/testing/common/testingContentProvider", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testingUri"], function (require, exports, buffer_1, lifecycle_1, strings_1, language_1, model_1, resolverService_1, nls_1, testResultService_1, testingUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BLb = void 0;
    /**
     * A content provider that returns various outputs for tests. This is used
     * in the inline peek view.
     */
    let $BLb = class $BLb {
        constructor(textModelResolverService, a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            textModelResolverService.registerTextModelContentProvider(testingUri_1.$lKb, this);
        }
        /**
         * @inheritdoc
         */
        async provideTextContent(resource) {
            const existing = this.b.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            const parsed = (0, testingUri_1.$mKb)(resource);
            if (!parsed) {
                return null;
            }
            const result = this.c.getResult(parsed.resultId);
            if (!result) {
                return null;
            }
            if (parsed.type === 0 /* TestUriType.TaskOutput */) {
                const task = result.tasks[parsed.taskIndex];
                const model = this.b.createModel('', null, resource, false);
                const append = (text) => model.applyEdits([{
                        range: { startColumn: 1, endColumn: 1, startLineNumber: Infinity, endLineNumber: Infinity },
                        text,
                    }]);
                const init = buffer_1.$Fd.concat(task.output.buffers, task.output.length).toString();
                append((0, strings_1.$8e)(init));
                let hadContent = init.length > 0;
                const dispose = new lifecycle_1.$jc();
                dispose.add(task.output.onDidWriteData(d => {
                    hadContent ||= d.byteLength > 0;
                    append((0, strings_1.$8e)(d.toString()));
                }));
                task.output.endPromise.then(() => {
                    if (dispose.isDisposed) {
                        return;
                    }
                    if (!hadContent) {
                        append((0, nls_1.localize)(0, null));
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
                            text += (0, strings_1.$8e)(output.getRange(message.offset, message.length).toString());
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
                        text = (0, strings_1.$8e)(content.toString());
                    }
                    else if (typeof message.message === 'string') {
                        text = message.message;
                    }
                    else {
                        text = message.message.value;
                        language = this.a.createById('markdown');
                    }
                }
            }
            if (text === undefined) {
                return null;
            }
            return this.b.createModel(text, language, resource, false);
        }
    };
    exports.$BLb = $BLb;
    exports.$BLb = $BLb = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, language_1.$ct),
        __param(2, model_1.$yA),
        __param(3, testResultService_1.$ftb)
    ], $BLb);
});
//# sourceMappingURL=testingContentProvider.js.map