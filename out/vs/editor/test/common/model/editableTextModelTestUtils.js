/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/position", "vs/editor/common/model/mirrorTextModel", "vs/editor/test/common/testTextModel"], function (require, exports, assert, position_1, mirrorTextModel_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertSyncedModels = exports.testApplyEditsWithSyncedModels = void 0;
    function testApplyEditsWithSyncedModels(original, edits, expected, inputEditsAreInvalid = false) {
        const originalStr = original.join('\n');
        const expectedStr = expected.join('\n');
        assertSyncedModels(originalStr, (model, assertMirrorModels) => {
            // Apply edits & collect inverse edits
            const inverseEdits = model.applyEdits(edits, true);
            // Assert edits produced expected result
            assert.deepStrictEqual(model.getValue(1 /* EndOfLinePreference.LF */), expectedStr);
            assertMirrorModels();
            // Apply the inverse edits
            const inverseInverseEdits = model.applyEdits(inverseEdits, true);
            // Assert the inverse edits brought back model to original state
            assert.deepStrictEqual(model.getValue(1 /* EndOfLinePreference.LF */), originalStr);
            if (!inputEditsAreInvalid) {
                const simplifyEdit = (edit) => {
                    return {
                        range: edit.range,
                        text: edit.text,
                        forceMoveMarkers: edit.forceMoveMarkers || false
                    };
                };
                // Assert the inverse of the inverse edits are the original edits
                assert.deepStrictEqual(inverseInverseEdits.map(simplifyEdit), edits.map(simplifyEdit));
            }
            assertMirrorModels();
        });
    }
    exports.testApplyEditsWithSyncedModels = testApplyEditsWithSyncedModels;
    var AssertDocumentLineMappingDirection;
    (function (AssertDocumentLineMappingDirection) {
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["OffsetToPosition"] = 0] = "OffsetToPosition";
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["PositionToOffset"] = 1] = "PositionToOffset";
    })(AssertDocumentLineMappingDirection || (AssertDocumentLineMappingDirection = {}));
    function assertOneDirectionLineMapping(model, direction, msg) {
        const allText = model.getValue();
        let line = 1, column = 1, previousIsCarriageReturn = false;
        for (let offset = 0; offset <= allText.length; offset++) {
            // The position coordinate system cannot express the position between \r and \n
            const position = new position_1.Position(line, column + (previousIsCarriageReturn ? -1 : 0));
            if (direction === 0 /* AssertDocumentLineMappingDirection.OffsetToPosition */) {
                const actualPosition = model.getPositionAt(offset);
                assert.strictEqual(actualPosition.toString(), position.toString(), msg + ' - getPositionAt mismatch for offset ' + offset);
            }
            else {
                // The position coordinate system cannot express the position between \r and \n
                const expectedOffset = offset + (previousIsCarriageReturn ? -1 : 0);
                const actualOffset = model.getOffsetAt(position);
                assert.strictEqual(actualOffset, expectedOffset, msg + ' - getOffsetAt mismatch for position ' + position.toString());
            }
            if (allText.charAt(offset) === '\n') {
                line++;
                column = 1;
            }
            else {
                column++;
            }
            previousIsCarriageReturn = (allText.charAt(offset) === '\r');
        }
    }
    function assertLineMapping(model, msg) {
        assertOneDirectionLineMapping(model, 1 /* AssertDocumentLineMappingDirection.PositionToOffset */, msg);
        assertOneDirectionLineMapping(model, 0 /* AssertDocumentLineMappingDirection.OffsetToPosition */, msg);
    }
    function assertSyncedModels(text, callback, setup = null) {
        const model = (0, testTextModel_1.createTextModel)(text);
        model.setEOL(0 /* EndOfLineSequence.LF */);
        assertLineMapping(model, 'model');
        if (setup) {
            setup(model);
            assertLineMapping(model, 'model');
        }
        const mirrorModel2 = new mirrorTextModel_1.MirrorTextModel(null, model.getLinesContent(), model.getEOL(), model.getVersionId());
        let mirrorModel2PrevVersionId = model.getVersionId();
        const disposable = model.onDidChangeContent((e) => {
            const versionId = e.versionId;
            if (versionId < mirrorModel2PrevVersionId) {
                console.warn('Model version id did not advance between edits (2)');
            }
            mirrorModel2PrevVersionId = versionId;
            mirrorModel2.onEvents(e);
        });
        const assertMirrorModels = () => {
            assertLineMapping(model, 'model');
            assert.strictEqual(mirrorModel2.getText(), model.getValue(), 'mirror model 2 text OK');
            assert.strictEqual(mirrorModel2.version, model.getVersionId(), 'mirror model 2 version OK');
        };
        callback(model, assertMirrorModels);
        disposable.dispose();
        model.dispose();
        mirrorModel2.dispose();
    }
    exports.assertSyncedModels = assertSyncedModels;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdGFibGVUZXh0TW9kZWxUZXN0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZWwvZWRpdGFibGVUZXh0TW9kZWxUZXN0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLFNBQWdCLDhCQUE4QixDQUFDLFFBQWtCLEVBQUUsS0FBNkIsRUFBRSxRQUFrQixFQUFFLHVCQUFnQyxLQUFLO1FBQzFKLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsRUFBRTtZQUM3RCxzQ0FBc0M7WUFDdEMsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbkQsd0NBQXdDO1lBQ3hDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsZ0NBQXdCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFNUUsa0JBQWtCLEVBQUUsQ0FBQztZQUVyQiwwQkFBMEI7WUFDMUIsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVqRSxnRUFBZ0U7WUFDaEUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsUUFBUSxnQ0FBd0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUU1RSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzFCLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBMEIsRUFBRSxFQUFFO29CQUNuRCxPQUFPO3dCQUNOLEtBQUssRUFBRSxJQUFJ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