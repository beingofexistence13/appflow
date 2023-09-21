/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, lifecycle_1, uri_1, utils_1, editor_1, editorInput_1, sideBySideEditorInput_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SideBySideEditorInput', () => {
        const disposables = new lifecycle_1.DisposableStore();
        teardown(() => {
            disposables.clear();
        });
        class MyEditorInput extends editorInput_1.EditorInput {
            constructor(resource = undefined) {
                super();
                this.resource = resource;
            }
            fireCapabilitiesChangeEvent() {
                this._onDidChangeCapabilities.fire();
            }
            fireDirtyChangeEvent() {
                this._onDidChangeDirty.fire();
            }
            fireLabelChangeEvent() {
                this._onDidChangeLabel.fire();
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
                const resource = editor_1.EditorResourceAccessor.getCanonicalUri(otherInput);
                return resource?.toString() === this.resource?.toString();
            }
        }
        test('basics', () => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
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
            const sideBySideInput = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, 'name', 'description', input, otherInput));
            assert.strictEqual(sideBySideInput.getName(), 'name');
            assert.strictEqual(sideBySideInput.getDescription(), 'description');
            assert.ok((0, editor_1.isSideBySideEditorInput)(sideBySideInput));
            assert.ok(!(0, editor_1.isSideBySideEditorInput)(input));
            assert.strictEqual(sideBySideInput.secondary, input);
            assert.strictEqual(sideBySideInput.primary, otherInput);
            assert(sideBySideInput.matches(sideBySideInput));
            assert(!sideBySideInput.matches(otherInput));
            sideBySideInput.dispose();
            assert.strictEqual(counter, 0);
            const sideBySideInputSame = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, undefined, undefined, input, input));
            assert.strictEqual(sideBySideInputSame.getName(), input.getName());
            assert.strictEqual(sideBySideInputSame.getDescription(), input.getDescription());
            assert.strictEqual(sideBySideInputSame.getTitle(), input.getTitle());
            assert.strictEqual(sideBySideInputSame.resource?.toString(), input.resource?.toString());
        });
        test('events dispatching', () => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const input = disposables.add(new MyEditorInput());
            const otherInput = disposables.add(new MyEditorInput());
            const sideBySideInut = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, 'name', 'description', otherInput, input));
            assert.ok((0, editor_1.isSideBySideEditorInput)(sideBySideInut));
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
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const primaryInput = disposables.add(new MyEditorInput(uri_1.URI.file('/fake')));
            const secondaryInput = disposables.add(new MyEditorInput(uri_1.URI.file('/fake2')));
            const sideBySideInput = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, 'Side By Side Test', undefined, secondaryInput, primaryInput));
            const untypedSideBySideInput = sideBySideInput.toUntyped();
            assert.ok((0, editor_1.isResourceSideBySideEditorInput)(untypedSideBySideInput));
        });
        test('untyped matches', () => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const primaryInput = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('/fake'), 'primaryId'));
            const secondaryInput = disposables.add(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('/fake2'), 'secondaryId'));
            const sideBySideInput = disposables.add(instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, 'Side By Side Test', undefined, secondaryInput, primaryInput));
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJ5U2lkZUVkaXRvcklucHV0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvdGVzdC9icm93c2VyL3BhcnRzL2VkaXRvci9zaWRlQnlTaWRlRWRpdG9ySW5wdXQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBRW5DLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLGFBQWMsU0FBUSx5QkFBVztZQUV0QyxZQUFtQixXQUE0QixTQUFTO2dCQUN2RCxLQUFLLEVBQUUsQ0FBQztnQkFEVSxhQUFRLEdBQVIsUUFBUSxDQUE2QjtZQUV4RCxDQUFDO1lBRUQsMkJBQTJCO2dCQUMxQixJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEMsQ0FBQztZQUVELG9CQUFvQjtnQkFDbkIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLENBQUM7WUFFRCxvQkFBb0I7Z0JBQ25CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixDQUFDO1lBRUQsSUFBYSxNQUFNLEtBQWEsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sS0FBVSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFL0IsU0FBUztnQkFDakIsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUN4RSxDQUFDO1lB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