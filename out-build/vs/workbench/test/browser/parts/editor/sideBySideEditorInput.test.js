/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, lifecycle_1, uri_1, utils_1, editor_1, editorInput_1, sideBySideEditorInput_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SideBySideEditorInput', () => {
        const disposables = new lifecycle_1.$jc();
        teardown(() => {
            disposables.clear();
        });
        class MyEditorInput extends editorInput_1.$tA {
            constructor(resource = undefined) {
                super();
                this.resource = resource;
            }
            fireCapabilitiesChangeEvent() {
                this.f.fire();
            }
            fireDirtyChangeEvent() {
                this.a.fire();
            }
            fireLabelChangeEvent() {
                this.b.fire();
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
        test('basics', () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            let counter = 0;
            const input = disposables.add(new MyEditorInput(uri_1.URI.file('/fake')));
            disposables.add(input.onWillDispose(() => {
                assert(true);
                counter++;
            }));
            const otherInput = disposables.add(new MyEditorInput(uri_1.URI.file('/fake2')));
            disposables.add(otherInput.onWillDispose(() => {
                assert(true);
                counter++;
            }));
            const sideBySideInput = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.$VC, 'name', 'description', input, otherInput));
            assert.strictEqual(sideBySideInput.getName(), 'name');
            assert.strictEqual(sideBySideInput.getDescription(), 'description');
            assert.ok((0, editor_1.$VE)(sideBySideInput));
            assert.ok(!(0, editor_1.$VE)(input));
            assert.strictEqual(sideBySideInput.secondary, input);
            assert.strictEqual(sideBySideInput.primary, otherInput);
            assert(sideBySideInput.matches(sideBySideInput));
            assert(!sideBySideInput.matches(otherInput));
            sideBySideInput.dispose();
            assert.strictEqual(counter, 0);
            const sideBySideInputSame = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.$VC, undefined, undefined, input, input));
            assert.strictEqual(sideBySideInputSame.getName(), input.getName());
            assert.strictEqual(sideBySideInputSame.getDescription(), input.getDescription());
            assert.strictEqual(sideBySideInputSame.getTitle(), input.getTitle());
            assert.strictEqual(sideBySideInputSame.resource?.toString(), input.resource?.toString());
        });
        test('events dispatching', () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const input = disposables.add(new MyEditorInput());
            const otherInput = disposables.add(new MyEditorInput());
            const sideBySideInut = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.$VC, 'name', 'description', otherInput, input));
            assert.ok((0, editor_1.$VE)(sideBySideInut));
            let capabilitiesChangeCounter = 0;
            disposables.add(sideBySideInut.onDidChangeCapabilities(() => capabilitiesChangeCounter++));
            let dirtyChangeCounter = 0;
            disposables.add(sideBySideInut.onDidChangeDirty(() => dirtyChangeCounter++));
            let labelChangeCounter = 0;
            disposables.add(sideBySideInut.onDidChangeLabel(() => labelChangeCounter++));
            input.fireCapabilitiesChangeEvent();
            assert.strictEqual(capabilitiesChangeCounter, 1);
            otherInput.fireCapabilitiesChangeEvent();
            assert.strictEqual(capabilitiesChangeCounter, 2);
            input.fireDirtyChangeEvent();
            otherInput.fireDirtyChangeEvent();
            assert.strictEqual(dirtyChangeCounter, 1);
            input.fireLabelChangeEvent();
            otherInput.fireLabelChangeEvent();
            assert.strictEqual(labelChangeCounter, 2);
        });
        test('toUntyped', () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const primaryInput = disposables.add(new MyEditorInput(uri_1.URI.file('/fake')));
            const secondaryInput = disposables.add(new MyEditorInput(uri_1.URI.file('/fake2')));
            const sideBySideInput = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.$VC, 'Side By Side Test', undefined, secondaryInput, primaryInput));
            const untypedSideBySideInput = sideBySideInput.toUntyped();
            assert.ok((0, editor_1.$PE)(untypedSideBySideInput));
        });
        test('untyped matches', () => {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const primaryInput = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.file('/fake'), 'primaryId'));
            const secondaryInput = disposables.add(new workbenchTestServices_1.$Zec(uri_1.URI.file('/fake2'), 'secondaryId'));
            const sideBySideInput = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.$VC, 'Side By Side Test', undefined, secondaryInput, primaryInput));
            const primaryUntypedInput = { resource: uri_1.URI.file('/fake'), options: { override: 'primaryId' } };
            const secondaryUntypedInput = { resource: uri_1.URI.file('/fake2'), options: { override: 'secondaryId' } };
            const sideBySideUntyped = { primary: primaryUntypedInput, secondary: secondaryUntypedInput };
            assert.ok(sideBySideInput.matches(sideBySideUntyped));
            const primaryUntypedInput2 = { resource: uri_1.URI.file('/fake'), options: { override: 'primaryIdWrong' } };
            const secondaryUntypedInput2 = { resource: uri_1.URI.file('/fake2'), options: { override: 'secondaryId' } };
            const sideBySideUntyped2 = { primary: primaryUntypedInput2, secondary: secondaryUntypedInput2 };
            assert.ok(!sideBySideInput.matches(sideBySideUntyped2));
            const primaryUntypedInput3 = { resource: uri_1.URI.file('/fake'), options: { override: 'primaryId' } };
            const secondaryUntypedInput3 = { resource: uri_1.URI.file('/fake2Wrong'), options: { override: 'secondaryId' } };
            const sideBySideUntyped3 = { primary: primaryUntypedInput3, secondary: secondaryUntypedInput3 };
            assert.ok(!sideBySideInput.matches(sideBySideUntyped3));
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=sideBySideEditorInput.test.js.map