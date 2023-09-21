/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/services/resolverService", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/platform/commands/common/commands"], function (require, exports, cancellation_1, types_1, uri_1, resolverService_1, outlineModel_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    commands_1.$Gr.registerCommand('_executeDocumentSymbolProvider', async function (accessor, ...args) {
        const [resource] = args;
        (0, types_1.$tf)(uri_1.URI.isUri(resource));
        const outlineService = accessor.get(outlineModel_1.$R8);
        const modelService = accessor.get(resolverService_1.$uA);
        const reference = await modelService.createModelReference(resource);
        try {
            return (await outlineService.getOrCreate(reference.object.textEditorModel, cancellation_1.CancellationToken.None)).getTopLevelSymbols();
        }
        finally {
            reference.dispose();
        }
    });
});
//# sourceMappingURL=documentSymbols.js.map