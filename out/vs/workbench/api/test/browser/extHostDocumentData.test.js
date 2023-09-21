/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostDocumentData", "vs/workbench/api/common/extHostTypes", "vs/editor/common/core/range", "vs/base/test/common/mock", "./extHostDocumentData.test.perf-data", "vs/editor/common/core/wordHelper", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, extHostDocumentData_1, extHostTypes_1, range_1, mock_1, perfData, wordHelper_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDocumentData', () => {
        let data;
        function assertPositionAt(offset, line, character) {
            const position = data.document.positionAt(offset);
            assert.strictEqual(position.line, line);
            assert.strictEqual(position.character, character);
        }
        function assertOffsetAt(line, character, offset) {
            const pos = new extHostTypes_1.Position(line, character);
            const actual = data.document.offsetAt(pos);
            assert.strictEqual(actual, offset);
        }
        setup(function () {
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ], '\n', 1, 'text', false);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('readonly-ness', () => {
            assert.throws(() => data.document.uri = null);
            assert.throws(() => data.document.fileName = 'foofile');
            assert.throws(() => data.document.isDirty = false);
            assert.throws(() => data.document.isUntitled = false);
            assert.throws(() => data.document.languageId = 'dddd');
            assert.throws(() => data.document.lineCount = 9);
        });
        test('save, when disposed', function () {
            let saved;
            const data = new extHostDocumentData_1.ExtHostDocumentData(new class extends (0, mock_1.mock)() {
                $trySaveDocument(uri) {
                    assert.ok(!saved);
                    saved = uri;
                    return Promise.resolve(true);
                }
            }, uri_1.URI.parse('foo:bar'), [], '\n', 1, 'text', true);
            return data.document.save().then(() => {
                assert.strictEqual(saved.toString(), 'foo:bar');
                data.dispose();
                return data.document.save().then(() => {
                    assert.ok(false, 'expected failure');
                }, err => {
                    assert.ok(err);
                });
            });
        });
        test('read, when disposed', function () {
            data.dispose();
            const { document } = data;
            assert.strictEqual(document.lineCount, 4);
            assert.strictEqual(document.lineAt(0).text, 'This is line one');
        });
        test('lines', () => {
            assert.strictEqual(data.document.lineCount, 4);
            assert.throws(() => data.document.lineAt(-1));
            assert.throws(() => data.document.lineAt(data.document.lineCount));
            assert.throws(() => data.document.lineAt(Number.MAX_VALUE));
            assert.throws(() => data.document.lineAt(Number.MIN_VALUE));
            assert.throws(() => data.document.lineAt(0.8));
            let line = data.document.lineAt(0);
            assert.strictEqual(line.lineNumber, 0);
            assert.strictEqual(line.text.length, 16);
            assert.strictEqual(line.text, 'This is line one');
            assert.strictEqual(line.isEmptyOrWhitespace, false);
            assert.strictEqual(line.firstNonWhitespaceCharacterIndex, 0);
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
                        rangeOffset: undefined,
                        rangeLength: undefined,
                        text: '\t '
                    }],
                eol: undefined,
                versionId: undefined,
                isRedoing: false,
                isUndoing: false,
            });
            // line didn't change
            assert.strictEqual(line.text, 'This is line one');
            assert.strictEqual(line.firstNonWhitespaceCharacterIndex, 0);
            // fetch line again
            line = data.document.lineAt(0);
            assert.strictEqual(line.text, '\t This is line one');
            assert.strictEqual(line.firstNonWhitespaceCharacterIndex, 2);
        });
        test('line, issue #5704', function () {
            let line = data.document.lineAt(0);
            let { range, rangeIncludingLineBreak } = line;
            assert.strictEqual(range.end.line, 0);
            assert.strictEqual(range.end.character, 16);
            assert.strictEqual(rangeIncludingLineBreak.end.line, 1);
            assert.strictEqual(rangeIncludingLineBreak.end.character, 0);
            line = data.document.lineAt(data.document.lineCount - 1);
            range = line.range;
            rangeIncludingLineBreak = line.rangeIncludingLineBreak;
            assert.strictEqual(range.end.line, 3);
            assert.strictEqual(range.end.character, 29);
            assert.strictEqual(rangeIncludingLineBreak.end.line, 3);
            assert.strictEqual(rangeIncludingLineBreak.end.character, 29);
        });
        test('offsetAt', () => {
            assertOffsetAt(0, 0, 0);
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 16, 16);
            assertOffsetAt(1, 0, 17);
            assertOffsetAt(1, 3, 20);
            assertOffsetAt(2, 0, 45);
            assertOffsetAt(4, 29, 95);
            assertOffsetAt(4, 30, 95);
            assertOffsetAt(4, Number.MAX_VALUE, 95);
            assertOffsetAt(5, 29, 95);
            assertOffsetAt(Number.MAX_VALUE, 29, 95);
            assertOffsetAt(Number.MAX_VALUE, Number.MAX_VALUE, 95);
        });
        test('offsetAt, after remove', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                        rangeOffset: undefined,
                        rangeLength: undefined,
                        text: ''
                    }],
                eol: undefined,
                versionId: undefined,
                isRedoing: false,
                isUndoing: false,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 13, 13);
            assertOffsetAt(1, 0, 14);
        });
        test('offsetAt, after replace', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                        rangeOffset: undefined,
                        rangeLength: undefined,
                        text: 'is could be'
                    }],
                eol: undefined,
                versionId: undefined,
                isRedoing: false,
                isUndoing: false,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 24, 24);
            assertOffsetAt(1, 0, 25);
        });
        test('offsetAt, after insert line', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                        rangeOffset: undefined,
                        rangeLength: undefined,
                        text: 'is could be\na line with number'
                    }],
                eol: undefined,
                versionId: undefined,
                isRedoing: false,
                isUndoing: false,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 13, 13);
            assertOffsetAt(1, 0, 14);
            assertOffsetAt(1, 18, 13 + 1 + 18);
            assertOffsetAt(1, 29, 13 + 1 + 29);
            assertOffsetAt(2, 0, 13 + 1 + 29 + 1);
        });
        test('offsetAt, after remove line', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 2, endColumn: 6 },
                        rangeOffset: undefined,
                        rangeLength: undefined,
                        text: ''
                    }],
                eol: undefined,
                versionId: undefined,
                isRedoing: false,
                isUndoing: false,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 2, 2);
            assertOffsetAt(1, 0, 25);
        });
        test('positionAt', () => {
            assertPositionAt(0, 0, 0);
            assertPositionAt(Number.MIN_VALUE, 0, 0);
            assertPositionAt(1, 0, 1);
            assertPositionAt(16, 0, 16);
            assertPositionAt(17, 1, 0);
            assertPositionAt(20, 1, 3);
            assertPositionAt(45, 2, 0);
            assertPositionAt(95, 3, 29);
            assertPositionAt(96, 3, 29);
            assertPositionAt(99, 3, 29);
            assertPositionAt(Number.MAX_VALUE, 3, 29);
        });
        test('getWordRangeAtPosition', () => {
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
                'aaaa bbbb+cccc abc'
            ], '\n', 1, 'text', false);
            let range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 2));
            assert.strictEqual(range.start.line, 0);
            assert.strictEqual(range.start.character, 0);
            assert.strictEqual(range.end.line, 0);
            assert.strictEqual(range.end.character, 4);
            // ignore bad regular expresson /.*/
            assert.throws(() => data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 2), /.*/));
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 5), /[a-z+]+/);
            assert.strictEqual(range.start.line, 0);
            assert.strictEqual(range.start.character, 5);
            assert.strictEqual(range.end.line, 0);
            assert.strictEqual(range.end.character, 14);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 17), /[a-z+]+/);
            assert.strictEqual(range.start.line, 0);
            assert.strictEqual(range.start.character, 15);
            assert.strictEqual(range.end.line, 0);
            assert.strictEqual(range.end.character, 18);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 11), /yy/);
            assert.strictEqual(range, undefined);
        });
        test('getWordRangeAtPosition doesn\'t quite use the regex as expected, #29102', function () {
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
                'some text here',
                '/** foo bar */',
                'function() {',
                '	"far boo"',
                '}'
            ], '\n', 1, 'text', false);
            let range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 0), /\/\*.+\*\//);
            assert.strictEqual(range, undefined);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(1, 0), /\/\*.+\*\//);
            assert.strictEqual(range.start.line, 1);
            assert.strictEqual(range.start.character, 0);
            assert.strictEqual(range.end.line, 1);
            assert.strictEqual(range.end.character, 14);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(3, 0), /("|').*\1/);
            assert.strictEqual(range, undefined);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(3, 1), /("|').*\1/);
            assert.strictEqual(range.start.line, 3);
            assert.strictEqual(range.start.character, 1);
            assert.strictEqual(range.end.line, 3);
            assert.strictEqual(range.end.character, 10);
        });
        test('getWordRangeAtPosition can freeze the extension host #95319', function () {
            const regex = /(https?:\/\/github\.com\/(([^\s]+)\/([^\s]+))\/([^\s]+\/)?(issues|pull)\/([0-9]+))|(([^\s]+)\/([^\s]+))?#([1-9][0-9]*)($|[\s\:\;\-\(\=])/;
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
                perfData._$_$_expensive
            ], '\n', 1, 'text', false);
            // this test only ensures that we eventually give and timeout (when searching "funny" words and long lines)
            // for the sake of speedy tests we lower the timeBudget here
            const config = (0, wordHelper_1.setDefaultGetWordAtTextConfig)({ maxLen: 1000, windowSize: 15, timeBudget: 30 });
            try {
                let range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 1177170), regex);
                assert.strictEqual(range, undefined);
                const pos = new extHostTypes_1.Position(0, 1177170);
                range = data.document.getWordRangeAtPosition(pos);
                assert.ok(range);
                assert.ok(range.contains(pos));
                assert.strictEqual(data.document.getText(range), 'TaskDefinition');
            }
            finally {
                config.dispose();
            }
        });
        test('Rename popup sometimes populates with text on the left side omitted #96013', function () {
            const regex = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g;
            const line = 'int abcdefhijklmnopqwvrstxyz;';
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
                line
            ], '\n', 1, 'text', false);
            const range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 27), regex);
            assert.strictEqual(range.start.line, 0);
            assert.strictEqual(range.end.line, 0);
            assert.strictEqual(range.start.character, 4);
            assert.strictEqual(range.end.character, 28);
        });
        test('Custom snippet $TM_SELECTED_TEXT not show suggestion #108892', function () {
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
                `        <p><span xml:lang="en">Sheldon</span>, soprannominato "<span xml:lang="en">Shelly</span> dalla madre e dalla sorella, è nato a <span xml:lang="en">Galveston</span>, in <span xml:lang="en">Texas</span>, il 26 febbraio 1980 in un supermercato. È stato un bambino prodigio, come testimoniato dal suo quoziente d'intelligenza (187, di molto superiore alla norma) e dalla sua rapida carriera scolastica: si è diplomato all'eta di 11 anni approdando alla stessa età alla formazione universitaria e all'età di 16 anni ha ottenuto il suo primo dottorato di ricerca. All'inizio della serie e per gran parte di essa vive con il coinquilino Leonard nell'appartamento 4A al 2311 <span xml:lang="en">North Los Robles Avenue</span> di <span xml:lang="en">Pasadena</span>, per poi trasferirsi nell'appartamento di <span xml:lang="en">Penny</span> con <span xml:lang="en">Amy</span> nella decima stagione. Come più volte afferma lui stesso possiede una memoria eidetica e un orecchio assoluto. È stato educato da una madre estremamente religiosa e, in più occasioni, questo aspetto contrasta con il rigore scientifico di <span xml:lang="en">Sheldon</span>; tuttavia la donna sembra essere l'unica persona in grado di comandarlo a bacchetta.</p>`
            ], '\n', 1, 'text', false);
            const pos = new extHostTypes_1.Position(0, 55);
            const range = data.document.getWordRangeAtPosition(pos);
            assert.strictEqual(range.start.line, 0);
            assert.strictEqual(range.end.line, 0);
            assert.strictEqual(range.start.character, 47);
            assert.strictEqual(range.end.character, 61);
            assert.strictEqual(data.document.getText(range), 'soprannominato');
        });
    });
    var AssertDocumentLineMappingDirection;
    (function (AssertDocumentLineMappingDirection) {
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["OffsetToPosition"] = 0] = "OffsetToPosition";
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["PositionToOffset"] = 1] = "PositionToOffset";
    })(AssertDocumentLineMappingDirection || (AssertDocumentLineMappingDirection = {}));
    suite('ExtHostDocumentData updates line mapping', () => {
        function positionToStr(position) {
            return '(' + position.line + ',' + position.character + ')';
        }
        function assertDocumentLineMapping(doc, direction) {
            const allText = doc.getText();
            let line = 0, character = 0, previousIsCarriageReturn = false;
            for (let offset = 0; offset <= allText.length; offset++) {
                // The position coordinate system cannot express the position between \r and \n
                const position = new extHostTypes_1.Position(line, character + (previousIsCarriageReturn ? -1 : 0));
                if (direction === AssertDocumentLineMappingDirection.OffsetToPosition) {
                    const actualPosition = doc.document.positionAt(offset);
                    assert.strictEqual(positionToStr(actualPosition), positionToStr(position), 'positionAt mismatch for offset ' + offset);
                }
                else {
                    // The position coordinate system cannot express the position between \r and \n
                    const expectedOffset = offset + (previousIsCarriageReturn ? -1 : 0);
                    const actualOffset = doc.document.offsetAt(position);
                    assert.strictEqual(actualOffset, expectedOffset, 'offsetAt mismatch for position ' + positionToStr(position));
                }
                if (allText.charAt(offset) === '\n') {
                    line++;
                    character = 0;
                }
                else {
                    character++;
                }
                previousIsCarriageReturn = (allText.charAt(offset) === '\r');
            }
        }
        function createChangeEvent(range, text, eol) {
            return {
                changes: [{
                        range: range,
                        rangeOffset: undefined,
                        rangeLength: undefined,
                        text: text
                    }],
                eol: eol,
                versionId: undefined,
                isRedoing: false,
                isUndoing: false,
            };
        }
        function testLineMappingDirectionAfterEvents(lines, eol, direction, e) {
            const myDocument = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), lines.slice(0), eol, 1, 'text', false);
            assertDocumentLineMapping(myDocument, direction);
            myDocument.onEvents(e);
            assertDocumentLineMapping(myDocument, direction);
        }
        function testLineMappingAfterEvents(lines, e) {
            testLineMappingDirectionAfterEvents(lines, '\n', AssertDocumentLineMappingDirection.PositionToOffset, e);
            testLineMappingDirectionAfterEvents(lines, '\n', AssertDocumentLineMappingDirection.OffsetToPosition, e);
            testLineMappingDirectionAfterEvents(lines, '\r\n', AssertDocumentLineMappingDirection.PositionToOffset, e);
            testLineMappingDirectionAfterEvents(lines, '\r\n', AssertDocumentLineMappingDirection.OffsetToPosition, e);
        }
        test('line mapping', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], { changes: [], eol: undefined, versionId: 7, isRedoing: false, isUndoing: false });
        });
        test('after remove', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), ''));
        });
        test('after replace', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be'));
        });
        test('after insert line', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be\na line with number'));
        });
        test('after insert two lines', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be\na line with number\nyet another line'));
        });
        test('after remove line', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 2, 6), ''));
        });
        test('after remove two lines', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 3, 6), ''));
        });
        test('after deleting entire content', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 4, 30), ''));
        });
        test('after replacing entire content', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 4, 30), 'some new text\nthat\nspans multiple lines'));
        });
        test('after changing EOL to CRLF', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 1, 1, 1), '', '\r\n'));
        });
        test('after changing EOL to LF', () => {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 1, 1, 1), '', '\n'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERvY3VtZW50RGF0YS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdERvY3VtZW50RGF0YS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBY2hHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7UUFFakMsSUFBSSxJQUF5QixDQUFDO1FBRTlCLFNBQVMsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLElBQVksRUFBRSxTQUFpQjtZQUN4RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFZLEVBQUUsU0FBaUIsRUFBRSxNQUFjO1lBQ3RFLE1BQU0sR0FBRyxHQUFHLElBQUksdUJBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELEtBQUssQ0FBQztZQUNMLElBQUksR0FBRyxJQUFJLHlDQUFtQixDQUFDLFNBQVUsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN4RCxrQkFBa0I7Z0JBQ2xCLDZCQUE2QjtnQkFDN0Isc0JBQXNCO2dCQUN0QiwrQkFBK0Is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