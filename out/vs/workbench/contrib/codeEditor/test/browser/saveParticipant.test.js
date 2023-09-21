/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/codeEditor/browser/saveParticipants", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/lifecycle"], function (require, exports, assert, saveParticipants_1, testConfigurationService_1, workbenchTestServices_1, utils_1, range_1, selection_1, textFileEditorModel_1, textfiles_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Save Participants', function () {
        const disposables = new lifecycle_1.DisposableStore();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            disposables.add(accessor.textFileService.files);
        });
        teardown(() => {
            disposables.clear();
        });
        test('insert final new line', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/final_new_line.txt'), 'utf8', undefined));
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'insertFinalNewline': true });
            const participant = new saveParticipants_1.FinalNewLineParticipant(configService, undefined);
            // No new line for empty lines
            let lineContent = '';
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // No new line if last line already empty
            lineContent = `Hello New Line${model.textEditorModel.getEOL()}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // New empty line added (single line)
            lineContent = 'Hello New Line';
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${lineContent}${model.textEditorModel.getEOL()}`);
            // New empty line added (multi line)
            lineContent = `Hello New Line${model.textEditorModel.getEOL()}Hello New Line${model.textEditorModel.getEOL()}Hello New Line`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${lineContent}${model.textEditorModel.getEOL()}`);
        });
        test('trim final new lines', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined));
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
            const participant = new saveParticipants_1.TrimFinalNewLinesParticipant(configService, undefined);
            const textContent = 'Trim New Line';
            const eol = `${model.textEditorModel.getEOL()}`;
            // No new line removal if last line is not new line
            let lineContent = `${textContent}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // No new line removal if last line is single new line
            lineContent = `${textContent}${eol}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // Remove new line (single line with two new lines)
            lineContent = `${textContent}${eol}${eol}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}`);
            // Remove new lines (multiple lines with multiple new lines)
            lineContent = `${textContent}${eol}${textContent}${eol}${eol}${eol}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}${textContent}${eol}`);
        });
        test('trim final new lines bug#39750', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined));
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
            const participant = new saveParticipants_1.TrimFinalNewLinesParticipant(configService, undefined);
            const textContent = 'Trim New Line';
            // single line
            const lineContent = `${textContent}`;
            model.textEditorModel.setValue(lineContent);
            // apply edits and push to undo stack.
            const textEdits = [{ range: new range_1.Range(1, 14, 1, 14), text: '.', forceMoveMarkers: false }];
            model.textEditorModel.pushEditOperations([new selection_1.Selection(1, 14, 1, 14)], textEdits, () => { return [new selection_1.Selection(1, 15, 1, 15)]; });
            // undo
            await model.textEditorModel.undo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}`);
            // trim final new lines should not mess the undo stack
            await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            await model.textEditorModel.redo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}.`);
        });
        test('trim final new lines bug#46075', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined));
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
            const participant = new saveParticipants_1.TrimFinalNewLinesParticipant(configService, undefined);
            const textContent = 'Test';
            const eol = `${model.textEditorModel.getEOL()}`;
            const content = `${textContent}${eol}${eol}`;
            model.textEditorModel.setValue(content);
            // save many times
            for (let i = 0; i < 10; i++) {
                await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            }
            // confirm trimming
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}`);
            // undo should go back to previous content immediately
            await model.textEditorModel.undo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}${eol}`);
            await model.textEditorModel.redo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}`);
        });
        test('trim whitespace', async function () {
            const model = disposables.add(instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined));
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimTrailingWhitespace': true });
            const participant = new saveParticipants_1.TrimWhitespaceParticipant(configService, undefined);
            const textContent = 'Test';
            const content = `${textContent} 	`;
            model.textEditorModel.setValue(content);
            // save many times
            for (let i = 0; i < 10; i++) {
                await participant.participate(model, { reason: 1 /* SaveReason.EXPLICIT */ });
            }
            // confirm trimming
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}`);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZVBhcnRpY2lwYW50LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlRWRpdG9yL3Rlc3QvYnJvd3Nlci9zYXZlUGFydGljaXBhbnQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWdCaEcsS0FBSyxDQUFDLG1CQUFtQixFQUFFO1FBRTFCLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzFDLElBQUksb0JBQTJDLENBQUM7UUFDaEQsSUFBSSxRQUE2QixDQUFDO1FBRWxDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixvQkFBb0IsR0FBRyxJQUFBLHFEQUE2QixFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM3RSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJDQUFtQixDQUFDLENBQUM7WUFDcEUsV0FBVyxDQUFDLEdBQUcsQ0FBNkIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsS0FBSztZQUNsQyxNQUFNLEtBQUssR0FBaUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUNBQW1CLEVBQUUsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDBCQUEwQixDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBaUMsQ0FBQyxDQUFDO1lBRTVOLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RCLE1BQU0sYUFBYSxHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUNy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