/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, lifecycle_1, uri_1, utils_1, editorService_1, editorGroupsService_1, untitledTextEditorInput_1, workingCopyEditorService_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WorkingCopyEditorService', () => {
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Xec)());
        });
        teardown(() => {
            disposables.clear();
        });
        test('registry - basics', () => {
            const service = disposables.add(new workingCopyEditorService_1.$BD(new workbenchTestServices_1.$Eec()));
            let handlerEvent = undefined;
            disposables.add(service.onDidRegisterHandler(handler => {
                handlerEvent = handler;
            }));
            const editorHandler = {
                handles: workingCopy => false,
                isOpen: () => false,
                createEditor: workingCopy => { throw new Error(); }
            };
            disposables.add(service.registerHandler(editorHandler));
            assert.strictEqual(handlerEvent, editorHandler);
        });
        test('findEditor', async () => {
            const disposables = new lifecycle_1.$jc();
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_1.$Lyb));
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            const service = disposables.add(new workingCopyEditorService_1.$BD(editorService));
            const resource = uri_1.URI.parse('custom://some/folder/custom.txt');
            const testWorkingCopy = disposables.add(new workbenchTestServices_2.$9dc(resource, false, 'testWorkingCopyTypeId1'));
            assert.strictEqual(service.findEditor(testWorkingCopy), undefined);
            const editorHandler = {
                handles: workingCopy => workingCopy === testWorkingCopy,
                isOpen: (workingCopy, editor) => workingCopy === testWorkingCopy,
                createEditor: workingCopy => { throw new Error(); }
            };
            disposables.add(service.registerHandler(editorHandler));
            const editor1 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, accessor.untitledTextEditorService.create({ initialValue: 'foo' })));
            const editor2 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, accessor.untitledTextEditorService.create({ initialValue: 'foo' })));
            await editorService.openEditors([{ editor: editor1 }, { editor: editor2 }]);
            assert.ok(service.findEditor(testWorkingCopy));
            disposables.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workingCopyEditorService.test.js.map