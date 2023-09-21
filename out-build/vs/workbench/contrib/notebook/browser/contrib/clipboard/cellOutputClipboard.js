/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Upb = exports.$Tpb = void 0;
    async function $Tpb(mimeType, outputViewModel, clipboardService, logService) {
        const cellOutput = outputViewModel.model;
        const output = mimeType && exports.$Upb.includes(mimeType) ?
            cellOutput.outputs.find(output => output.mime === mimeType) :
            cellOutput.outputs.find(output => exports.$Upb.includes(output.mime));
        mimeType = output?.mime;
        if (!mimeType || !output) {
            return;
        }
        const decoder = new TextDecoder();
        let text = decoder.decode(output.data.buffer);
        // append adjacent text streams since they are concatenated in the renderer
        if ((0, notebookCommon_1.$9H)(mimeType)) {
            const cellViewModel = outputViewModel.cellViewModel;
            let index = cellViewModel.outputsViewModels.indexOf(outputViewModel) + 1;
            while (index < cellViewModel.model.outputs.length) {
                const nextCellOutput = cellViewModel.model.outputs[index];
                const nextOutput = nextCellOutput.outputs.find(output => (0, notebookCommon_1.$9H)(output.mime));
                if (!nextOutput) {
                    break;
                }
                text = text + decoder.decode(nextOutput.data.buffer);
                index = index + 1;
            }
        }
        if (mimeType.endsWith('error')) {
            text = text.replace(/\\u001b\[[0-9;]*m/gi, '').replaceAll('\\n', '\n');
        }
        try {
            await clipboardService.writeText(text);
        }
        catch (e) {
            logService.error(`Failed to copy content: ${e}`);
        }
    }
    exports.$Tpb = $Tpb;
    exports.$Upb = [
        'text/latex',
        'text/html',
        'application/vnd.code.notebook.error',
        'application/vnd.code.notebook.stdout',
        'application/x.notebook.stdout',
        'application/x.notebook.stream',
        'application/vnd.code.notebook.stderr',
        'application/x.notebook.stderr',
        'text/plain',
        'text/markdown',
        'application/json'
    ];
});
//# sourceMappingURL=cellOutputClipboard.js.map