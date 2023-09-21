/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, editorInput_1, diffEditorInput_1, workbenchTestServices_1, editor_1, uri_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Diff editor input', () => {
        class MyEditorInput extends editorInput_1.$tA {
            constructor(resource = undefined) {
                super();
                this.resource = resource;
            }
            get typeId() { return 'myEditorInput'; }
            resolve() { return null; }
            toUntyped() {
                return { resource: this.resource, options: { override: this.typeId } };
            }
            matches(otherInput) {
                if (super.matches(otherInput)) {
                    return true;
                }
                const resource = editor_1.$3E.getCanonicalUri(otherInput);
                return resource?.toString() === this.resource?.toString();
            }
        }
        const disposables = new lifecycle_1.$jc();
        teardown(() => {
            disposables.clear();
        });
        test('basics', () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            let counter = 0;
            const input = disposables.add(new MyEditorInput());
            disposables.add(input.onWillDispose(() => {
                assert(true);
                counter++;
            }));
            const otherInput = disposables.add(new MyEditorInput());
            disposables.add(otherInput.onWillDispose(() => {
                assert(true);
                counter++;
            }));
            const diffInput = instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', input, otherInput, undefined);
            assert.ok((0, editor_1.$WE)(diffInput));
            assert.ok(!(0, editor_1.$WE)(input));
            assert.strictEqual(diffInput.original, input);
            assert.strictEqual(diffInput.modified, otherInput);
            assert(diffInput.matches(diffInput));
            assert(!diffInput.matches(otherInput));
            diffInput.dispose();
            assert.strictEqual(counter, 0);
        });
        test('toUntyped', () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const input = disposables.add(new MyEditorInput(uri_1.URI.file('foo/bar1')));
            const otherInput = disposables.add(new MyEditorInput(uri_1.URI.file('foo/bar2')));
            const diffInput = instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', input, otherInput, undefined);
            const untypedDiffInput = diffInput.toUntyped();
            assert.ok((0, editor_1.$OE)(untypedDiffInput));
            assert.ok(!(0, editor_1.$PE)(untypedDiffInput));
            assert.ok(diffInput.matches(untypedDiffInput));
        });
        test('disposes when input inside disposes', function () {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            let counter = 0;
            let input = disposables.add(new MyEditorInput());
            let otherInput = disposables.add(new MyEditorInput());
            const diffInput = disposables.add(instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', input, otherInput, undefined));
            disposables.add(diffInput.onWillDispose(() => {
                counter++;
                assert(true);
            }));
            input.dispose();
            input = disposables.add(new MyEditorInput());
            otherInput = disposables.add(new MyEditorInput());
            const diffInput2 = disposables.add(instantiationService.createInstance(diffEditorInput_1.$3eb, 'name', 'description', input, otherInput, undefined));
            disposables.add(diffInput2.onWillDispose(() => {
                counter++;
                assert(true);
            }));
            otherInput.dispose();
            assert.strictEqual(counter, 2);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=diffEditorInput.test.js.map