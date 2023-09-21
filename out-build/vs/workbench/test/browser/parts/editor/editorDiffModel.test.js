/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/editor/textDiffEditorModel", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, textDiffEditorModel_1, diffEditorInput_1, textResourceEditorInput_1, uri_1, workbenchTestServices_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextDiffEditorModel', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
        });
        teardown(() => {
            disposables.clear();
        });
        test('basics', async () => {
            disposables.add(accessor.textModelResolverService.registerTextModelContentProvider('test', {
                provideTextContent: async function (resource) {
                    if (resource.scheme === 'test') {
                        const modelContent = 'Hello Test';
                        const languageSelection = accessor.languageService.createById('json');
                        return disposables.add(accessor.modelService.createModel(modelContent, languageSelection, resource));
                    }
                    return null;
                }
            }));
            const input = disposables.add(instantiationService.createInstance(textResourceEditorInput_1.$7eb, uri_1.URI.from({ scheme: 'test', authority: null, path: 'thePath' }), 'name', 'description', undefined, undefined));
            const otherInput = disposables.add(instantiationService.createInstance(textResourceEditorInput_1.$7eb, uri_1.URI.from({ scheme: 'test', authority: null, path: 'thePath' }), 'name2', 'description', undefined, undefined));
            const diffInput = disposables.add(instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', input, otherInput, undefined));
            let model = disposables.add(await diffInput.resolve());
            assert(model);
            assert(model instanceof textDiffEditorModel_1.$2eb);
            const diffEditorModel = model.textDiffEditorModel;
            assert(diffEditorModel.original);
            assert(diffEditorModel.modified);
            model = disposables.add(await diffInput.resolve());
            assert(model.isResolved());
            assert(diffEditorModel !== model.textDiffEditorModel);
            diffInput.dispose();
            assert(!model.textDiffEditorModel);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=editorDiffModel.test.js.map