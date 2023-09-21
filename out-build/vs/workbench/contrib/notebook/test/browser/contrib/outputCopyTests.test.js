/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/test/common/mock", "assert", "vs/base/common/buffer", "vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard"], function (require, exports, mock_1, assert, buffer_1, cellOutputClipboard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Cell Output Clipboard Tests', () => {
        class ClipboardService {
            constructor() {
                this.a = '';
            }
            get clipboardContent() {
                return this.a;
            }
            async writeText(value) {
                this.a = value;
            }
        }
        const logService = new class extends (0, mock_1.$rT)() {
        };
        function createOutputViewModel(outputs, cellViewModel) {
            const outputViewModel = { model: { outputs: outputs } };
            if (cellViewModel) {
                cellViewModel.outputsViewModels.push(outputViewModel);
                cellViewModel.model.outputs.push(outputViewModel.model);
            }
            else {
                cellViewModel = {
                    outputsViewModels: [outputViewModel],
                    model: { outputs: [outputViewModel.model] }
                };
            }
            outputViewModel.cellViewModel = cellViewModel;
            return outputViewModel;
        }
        test('Copy text/plain output', async () => {
            const mimeType = 'text/plain';
            const clipboard = new ClipboardService();
            const outputDto = { data: buffer_1.$Fd.fromString('output content'), mime: 'text/plain' };
            const output = createOutputViewModel([outputDto]);
            await (0, cellOutputClipboard_1.$Tpb)(mimeType, output, clipboard, logService);
            assert.strictEqual(clipboard.clipboardContent, 'output content');
        });
        test('Nothing copied for invalid mimetype', async () => {
            const clipboard = new ClipboardService();
            const outputDtos = [
                { data: buffer_1.$Fd.fromString('output content'), mime: 'bad' },
                { data: buffer_1.$Fd.fromString('output 2'), mime: 'unknown' }
            ];
            const output = createOutputViewModel(outputDtos);
            await (0, cellOutputClipboard_1.$Tpb)('bad', output, clipboard, logService);
            assert.strictEqual(clipboard.clipboardContent, '');
        });
        test('Text copied if available instead of invalid mime type', async () => {
            const clipboard = new ClipboardService();
            const outputDtos = [
                { data: buffer_1.$Fd.fromString('output content'), mime: 'bad' },
                { data: buffer_1.$Fd.fromString('text content'), mime: 'text/plain' }
            ];
            const output = createOutputViewModel(outputDtos);
            await (0, cellOutputClipboard_1.$Tpb)('bad', output, clipboard, logService);
            assert.strictEqual(clipboard.clipboardContent, 'text content');
        });
        test('Selected mimetype is preferred', async () => {
            const clipboard = new ClipboardService();
            const outputDtos = [
                { data: buffer_1.$Fd.fromString('plain text'), mime: 'text/plain' },
                { data: buffer_1.$Fd.fromString('html content'), mime: 'text/html' }
            ];
            const output = createOutputViewModel(outputDtos);
            await (0, cellOutputClipboard_1.$Tpb)('text/html', output, clipboard, logService);
            assert.strictEqual(clipboard.clipboardContent, 'html content');
        });
        test('copy subsequent output', async () => {
            const clipboard = new ClipboardService();
            const output = createOutputViewModel([{ data: buffer_1.$Fd.fromString('first'), mime: 'text/plain' }]);
            const output2 = createOutputViewModel([{ data: buffer_1.$Fd.fromString('second'), mime: 'text/plain' }], output.cellViewModel);
            const output3 = createOutputViewModel([{ data: buffer_1.$Fd.fromString('third'), mime: 'text/plain' }], output.cellViewModel);
            await (0, cellOutputClipboard_1.$Tpb)('text/plain', output2, clipboard, logService);
            assert.strictEqual(clipboard.clipboardContent, 'second');
            await (0, cellOutputClipboard_1.$Tpb)('text/plain', output3, clipboard, logService);
            assert.strictEqual(clipboard.clipboardContent, 'third');
        });
        test('adjacent stream outputs are concanented', async () => {
            const clipboard = new ClipboardService();
            const output = createOutputViewModel([{ data: buffer_1.$Fd.fromString('stdout'), mime: 'application/vnd.code.notebook.stdout' }]);
            createOutputViewModel([{ data: buffer_1.$Fd.fromString('stderr'), mime: 'application/vnd.code.notebook.stderr' }], output.cellViewModel);
            createOutputViewModel([{ data: buffer_1.$Fd.fromString('text content'), mime: 'text/plain' }], output.cellViewModel);
            createOutputViewModel([{ data: buffer_1.$Fd.fromString('non-adjacent'), mime: 'application/vnd.code.notebook.stdout' }], output.cellViewModel);
            await (0, cellOutputClipboard_1.$Tpb)('application/vnd.code.notebook.stdout', output, clipboard, logService);
            assert.strictEqual(clipboard.clipboardContent, 'stdoutstderr');
        });
    });
});
//# sourceMappingURL=outputCopyTests.test.js.map