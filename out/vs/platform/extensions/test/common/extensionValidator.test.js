define(["require", "exports", "assert", "vs/platform/extensions/common/extensionValidator"], function (require, exports, assert, extensionValidator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension Version Validator', () => {
        const productVersion = '2021-05-11T21:54:30.577Z';
        test('isValidVersionStr', () => {
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10.0-dev'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10.0'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10.1'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10.100'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.11.0'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('x.x.x'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.x.x'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10.0'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10.x'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('^0.10.0'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('*'), true);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.x.x.x'), false);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10'), false);
            assert.strictEqual((0, extensionValidator_1.isValidVersionStr)('0.10.'), false);
        });
        test('parseVersion', () => {
            function assertParseVersion(version, hasCaret, hasGreaterEquals, majorBase, majorMustEqual, minorBase, minorMustEqual, patchBase, patchMustEqual, preRelease) {
                const actual = (0, extensionValidator_1.parseVersion)(version);
                const expected = { hasCaret, hasGreaterEquals, majorBase, majorMustEqual, minorBase, minorMustEqual, patchBase, patchMustEqual, preRelease };
                assert.deepStrictEqual(actual, expected, 'parseVersion for ' + version);
            }
            assertParseVersion('0.10.0-dev', false, false, 0, true, 10, true, 0, true, '-dev');
            assertParseVersion('0.10.0', false, false, 0, true, 10, true, 0, true, null);
            assertParseVersion('0.10.1', false, false, 0, true, 10, true, 1, true, null);
            assertParseVersion('0.10.100', false, false, 0, true, 10, true, 100, true, null);
            assertParseVersion('0.11.0', false, false, 0, true, 11, true, 0, true, null);
            assertParseVersion('x.x.x', false, false, 0, false, 0, false, 0, false, null);
            assertParseVersion('0.x.x', false, false, 0, true, 0, false, 0, false, null);
            assertParseVersion('0.10.x', false, false, 0, true, 10, true, 0, false, null);
            assertParseVersion('^0.10.0', true, false, 0, true, 10, true, 0, true, null);
            assertParseVersion('^0.10.2', true, false, 0, true, 10, true, 2, true, null);
            assertParseVersion('^1.10.2', true, false, 1, true, 10, true, 2, true, null);
            assertParseVersion('*', false, false, 0, false, 0, false, 0, false, null);
            assertParseVersion('>=0.0.1', false, true, 0, true, 0, true, 1, true, null);
            assertParseVersion('>=2.4.3', false, true, 2, true, 4, true, 3, true, null);
        });
        test('normalizeVersion', () => {
            function assertNormalizeVersion(version, majorBase, majorMustEqual, minorBase, minorMustEqual, patchBase, patchMustEqual, isMinimum, notBefore = 0) {
                const actual = (0, extensionValidator_1.normalizeVersion)((0, extensionValidator_1.parseVersion)(version));
                const expected = { majorBase, majorMustEqual, minorBase, minorMustEqual, patchBase, patchMustEqual, isMinimum, notBefore };
                assert.deepStrictEqual(actual, expected, 'parseVersion for ' + version);
            }
            assertNormalizeVersion('0.10.0-dev', 0, true, 10, true, 0, true, false, 0);
            assertNormalizeVersion('0.10.0-222222222', 0, true, 10, true, 0, true, false, 0);
            assertNormalizeVersion('0.10.0-20210511', 0, true, 10, true, 0, true, false, new Date('2021-05-11T00:00:00Z').getTime());
            assertNormalizeVersion('0.10.0', 0, true, 10, true, 0, true, false);
            assertNormalizeVersion('0.10.1', 0, true, 10, true, 1, true, false);
            assertNormalizeVersion('0.10.100', 0, true, 10, true, 100, true, false);
            assertNormalizeVersion('0.11.0', 0, true, 11, true, 0, true, false);
            assertNormalizeVersion('x.x.x', 0, false, 0, false, 0, false, false);
            assertNormalizeVersion('0.x.x', 0, true, 0, false, 0, false, false);
            assertNormalizeVersion('0.10.x', 0, true, 10, true, 0, false, false);
            assertNormalizeVersion('^0.10.0', 0, true, 10, true, 0, false, false);
            assertNormalizeVersion('^0.10.2', 0, true, 10, true, 2, false, false);
            assertNormalizeVersion('^1.10.2', 1, true, 10, false, 2, false, false);
            assertNormalizeVersion('*', 0, false, 0, false, 0, false, false);
            assertNormalizeVersion('>=0.0.1', 0, true, 0, true, 1, true, true);
            assertNormalizeVersion('>=2.4.3', 2, true, 4, true, 3, true, true);
            assertNormalizeVersion('>=2.4.3', 2, true, 4, true, 3, true, true);
        });
        test('isValidVersion', () => {
            function testIsValidVersion(version, desiredVersion, expectedResult) {
                const actual = (0, extensionValidator_1.isValidVersion)(version, productVersion, desiredVersion);
                assert.strictEqual(actual, expectedResult, 'extension - vscode: ' + version + ', desiredVersion: ' + desiredVersion + ' should be ' + expectedResult);
            }
            testIsValidVersion('0.10.0-dev', 'x.x.x', true);
            testIsValidVersion('0.10.0-dev', '0.x.x', true);
            testIsValidVersion('0.10.0-dev', '0.10.0', true);
            testIsValidVersion('0.10.0-dev', '0.10.2', false);
            testIsValidVersion('0.10.0-dev', '^0.10.2', false);
            testIsValidVersion('0.10.0-dev', '0.10.x', true);
            testIsValidVersion('0.10.0-dev', '^0.10.0', true);
            testIsValidVersion('0.10.0-dev', '*', true);
            testIsValidVersion('0.10.0-dev', '>=0.0.1', true);
            testIsValidVersion('0.10.0-dev', '>=0.0.10', true);
            testIsValidVersion('0.10.0-dev', '>=0.10.0', true);
            testIsValidVersion('0.10.0-dev', '>=0.10.1', false);
            testIsValidVersion('0.10.0-dev', '>=1.0.0', false);
            testIsValidVersion('0.10.0', 'x.x.x', true);
            testIsValidVersion('0.10.0', '0.x.x', true);
            testIsValidVersion('0.10.0', '0.10.0', true);
            testIsValidVersion('0.10.0', '0.10.2', false);
            testIsValidVersion('0.10.0', '^0.10.2', false);
            testIsValidVersion('0.10.0', '0.10.x', true);
            testIsValidVersion('0.10.0', '^0.10.0', true);
            testIsValidVersion('0.10.0', '*', true);
            testIsValidVersion('0.10.1', 'x.x.x', true);
            testIsValidVersion('0.10.1', '0.x.x', true);
            testIsValidVersion('0.10.1', '0.10.0', false);
            testIsValidVersion('0.10.1', '0.10.2', false);
            testIsValidVersion('0.10.1', '^0.10.2', false);
            testIsValidVersion('0.10.1', '0.10.x', true);
            testIsValidVersion('0.10.1', '^0.10.0', true);
            testIsValidVersion('0.10.1', '*', true);
            testIsValidVersion('0.10.100', 'x.x.x', true);
            testIsValidVersion('0.10.100', '0.x.x', true);
            testIsValidVersion('0.10.100', '0.10.0', false);
            testIsValidVersion('0.10.100', '0.10.2', false);
            testIsValidVersion('0.10.100', '^0.10.2', true);
            testIsValidVersion('0.10.100', '0.10.x', true);
            testIsValidVersion('0.10.100', '^0.10.0', true);
            testIsValidVersion('0.10.100', '*', true);
            testIsValidVersion('0.11.0', 'x.x.x', true);
            testIsValidVersion('0.11.0', '0.x.x', true);
            testIsValidVersion('0.11.0', '0.10.0', false);
            testIsValidVersion('0.11.0', '0.10.2', false);
            testIsValidVersion('0.11.0', '^0.10.2', false);
            testIsValidVersion('0.11.0', '0.10.x', false);
            testIsValidVersion('0.11.0', '^0.10.0', false);
            testIsValidVersion('0.11.0', '*', true);
            // Anything < 1.0.0 is compatible
            testIsValidVersion('1.0.0', 'x.x.x', true);
            testIsValidVersion('1.0.0', '0.x.x', true);
            testIsValidVersion('1.0.0', '0.10.0', false);
            testIsValidVersion('1.0.0', '0.10.2', false);
            testIsValidVersion('1.0.0', '^0.10.2', true);
            testIsValidVersion('1.0.0', '0.10.x', true);
            testIsValidVersion('1.0.0', '^0.10.0', true);
            testIsValidVersion('1.0.0', '1.0.0', true);
            testIsValidVersion('1.0.0', '^1.0.0', true);
            testIsValidVersion('1.0.0', '^2.0.0', false);
            testIsValidVersion('1.0.0', '*', true);
            testIsValidVersion('1.0.0', '>=0.0.1', true);
            testIsValidVersion('1.0.0', '>=0.0.10', true);
            testIsValidVersion('1.0.0', '>=0.10.0', true);
            testIsValidVersion('1.0.0', '>=0.10.1', true);
            testIsValidVersion('1.0.0', '>=1.0.0', true);
            testIsValidVersion('1.0.0', '>=1.1.0', false);
            testIsValidVersion('1.0.0', '>=1.0.1', false);
            testIsValidVersion('1.0.0', '>=2.0.0', false);
            testIsValidVersion('1.0.100', 'x.x.x', true);
            testIsValidVersion('1.0.100', '0.x.x', true);
            testIsValidVersion('1.0.100', '0.10.0', false);
            testIsValidVersion('1.0.100', '0.10.2', false);
            testIsValidVersion('1.0.100', '^0.10.2', true);
            testIsValidVersion('1.0.100', '0.10.x', true);
            testIsValidVersion('1.0.100', '^0.10.0', true);
            testIsValidVersion('1.0.100', '1.0.0', false);
            testIsValidVersion('1.0.100', '^1.0.0', true);
            testIsValidVersion('1.0.100', '^1.0.1', true);
            testIsValidVersion('1.0.100', '^2.0.0', false);
            testIsValidVersion('1.0.100', '*', true);
            testIsValidVersion('1.100.0', 'x.x.x', true);
            testIsValidVersion('1.100.0', '0.x.x', true);
            testIsValidVersion('1.100.0', '0.10.0', false);
            testIsValidVersion('1.100.0', '0.10.2', false);
            testIsValidVersion('1.100.0', '^0.10.2', true);
            testIsValidVersion('1.100.0', '0.10.x', true);
            testIsValidVersion('1.100.0', '^0.10.0', true);
            testIsValidVersion('1.100.0', '1.0.0', false);
            testIsValidVersion('1.100.0', '^1.0.0', true);
            testIsValidVersion('1.100.0', '^1.1.0', true);
            testIsValidVersion('1.100.0', '^1.100.0', true);
            testIsValidVersion('1.100.0', '^2.0.0', false);
            testIsValidVersion('1.100.0', '*', true);
            testIsValidVersion('1.100.0', '>=1.99.0', true);
            testIsValidVersion('1.100.0', '>=1.100.0', true);
            testIsValidVersion('1.100.0', '>=1.101.0', false);
            testIsValidVersion('2.0.0', 'x.x.x', true);
            testIsValidVersion('2.0.0', '0.x.x', false);
            testIsValidVersion('2.0.0', '0.10.0', false);
            testIsValidVersion('2.0.0', '0.10.2', false);
            testIsValidVersion('2.0.0', '^0.10.2', false);
            testIsValidVersion('2.0.0', '0.10.x', false);
            testIsValidVersion('2.0.0', '^0.10.0', false);
            testIsValidVersion('2.0.0', '1.0.0', false);
            testIsValidVersion('2.0.0', '^1.0.0', false);
            testIsValidVersion('2.0.0', '^1.1.0', false);
            testIsValidVersion('2.0.0', '^1.100.0', false);
            testIsValidVersion('2.0.0', '^2.0.0', true);
            testIsValidVersion('2.0.0', '*', true);
        });
        test('isValidExtensionVersion', () => {
            function testExtensionVersion(version, desiredVersion, isBuiltin, hasMain, expectedResult) {
                const manifest = {
                    name: 'test',
                    publisher: 'test',
                    version: '0.0.0',
                    engines: {
                        vscode: desiredVersion
                    },
                    main: hasMain ? 'something' : undefined
                };
                const reasons = [];
                const actual = (0, extensionValidator_1.isValidExtensionVersion)(version, productVersion, manifest, isBuiltin, reasons);
                assert.strictEqual(actual, expectedResult, 'version: ' + version + ', desiredVersion: ' + desiredVersion + ', desc: ' + JSON.stringify(manifest) + ', reasons: ' + JSON.stringify(reasons));
            }
            function testIsInvalidExtensionVersion(version, desiredVersion, isBuiltin, hasMain) {
                testExtensionVersion(version, desiredVersion, isBuiltin, hasMain, false);
            }
            function testIsValidExtensionVersion(version, desiredVersion, isBuiltin, hasMain) {
                testExtensionVersion(version, desiredVersion, isBuiltin, hasMain, true);
            }
            function testIsValidVersion(version, desiredVersion, expectedResult) {
                testExtensionVersion(version, desiredVersion, false, true, expectedResult);
            }
            // builtin are allowed to use * or x.x.x
            testIsValidExtensionVersion('0.10.0-dev', '*', true, true);
            testIsValidExtensionVersion('0.10.0-dev', 'x.x.x', true, true);
            testIsValidExtensionVersion('0.10.0-dev', '0.x.x', true, true);
            testIsValidExtensionVersion('0.10.0-dev', '0.10.x', true, true);
            testIsValidExtensionVersion('1.10.0-dev', '1.x.x', true, true);
            testIsValidExtensionVersion('1.10.0-dev', '1.10.x', true, true);
            testIsValidExtensionVersion('0.10.0-dev', '*', true, false);
            testIsValidExtensionVersion('0.10.0-dev', 'x.x.x', true, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.x.x', true, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.10.x', true, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.x.x', true, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.10.x', true, false);
            // normal extensions are allowed to use * or x.x.x only if they have no main
            testIsInvalidExtensionVersion('0.10.0-dev', '*', false, true);
            testIsInvalidExtensionVersion('0.10.0-dev', 'x.x.x', false, true);
            testIsInvalidExtensionVersion('0.10.0-dev', '0.x.x', false, true);
            testIsValidExtensionVersion('0.10.0-dev', '0.10.x', false, true);
            testIsValidExtensionVersion('1.10.0-dev', '1.x.x', false, true);
            testIsValidExtensionVersion('1.10.0-dev', '1.10.x', false, true);
            testIsValidExtensionVersion('0.10.0-dev', '*', false, false);
            testIsValidExtensionVersion('0.10.0-dev', 'x.x.x', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.x.x', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.10.x', false, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.x.x', false, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.10.x', false, false);
            // extensions without "main" get no version check
            testIsValidExtensionVersion('0.10.0-dev', '>=0.9.1-pre.1', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '*', false, false);
            testIsValidExtensionVersion('0.10.0-dev', 'x.x.x', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.x.x', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.10.x', false, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.x.x', false, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.10.x', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '*', false, false);
            testIsValidExtensionVersion('0.10.0-dev', 'x.x.x', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.x.x', false, false);
            testIsValidExtensionVersion('0.10.0-dev', '0.10.x', false, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.x.x', false, false);
            testIsValidExtensionVersion('1.10.0-dev', '1.10.x', false, false);
            // normal extensions with code
            testIsValidVersion('0.10.0-dev', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.0-dev', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.0-dev', '0.10.0', true);
            testIsValidVersion('0.10.0-dev', '0.10.2', false);
            testIsValidVersion('0.10.0-dev', '^0.10.2', false);
            testIsValidVersion('0.10.0-dev', '0.10.x', true);
            testIsValidVersion('0.10.0-dev', '^0.10.0', true);
            testIsValidVersion('0.10.0-dev', '*', false); // fails due to lack of specificity
            testIsValidVersion('0.10.0', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.0', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.0', '0.10.0', true);
            testIsValidVersion('0.10.0', '0.10.2', false);
            testIsValidVersion('0.10.0', '^0.10.2', false);
            testIsValidVersion('0.10.0', '0.10.x', true);
            testIsValidVersion('0.10.0', '^0.10.0', true);
            testIsValidVersion('0.10.0', '*', false); // fails due to lack of specificity
            testIsValidVersion('0.10.1', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.1', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.1', '0.10.0', false);
            testIsValidVersion('0.10.1', '0.10.2', false);
            testIsValidVersion('0.10.1', '^0.10.2', false);
            testIsValidVersion('0.10.1', '0.10.x', true);
            testIsValidVersion('0.10.1', '^0.10.0', true);
            testIsValidVersion('0.10.1', '*', false); // fails due to lack of specificity
            testIsValidVersion('0.10.100', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.100', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.10.100', '0.10.0', false);
            testIsValidVersion('0.10.100', '0.10.2', false);
            testIsValidVersion('0.10.100', '^0.10.2', true);
            testIsValidVersion('0.10.100', '0.10.x', true);
            testIsValidVersion('0.10.100', '^0.10.0', true);
            testIsValidVersion('0.10.100', '*', false); // fails due to lack of specificity
            testIsValidVersion('0.11.0', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.11.0', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('0.11.0', '0.10.0', false);
            testIsValidVersion('0.11.0', '0.10.2', false);
            testIsValidVersion('0.11.0', '^0.10.2', false);
            testIsValidVersion('0.11.0', '0.10.x', false);
            testIsValidVersion('0.11.0', '^0.10.0', false);
            testIsValidVersion('0.11.0', '*', false); // fails due to lack of specificity
            testIsValidVersion('1.0.0', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.0.0', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.0.0', '0.10.0', false);
            testIsValidVersion('1.0.0', '0.10.2', false);
            testIsValidVersion('1.0.0', '^0.10.2', true);
            testIsValidVersion('1.0.0', '0.10.x', true);
            testIsValidVersion('1.0.0', '^0.10.0', true);
            testIsValidVersion('1.0.0', '*', false); // fails due to lack of specificity
            testIsValidVersion('1.10.0', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.10.0', '1.x.x', true);
            testIsValidVersion('1.10.0', '1.10.0', true);
            testIsValidVersion('1.10.0', '1.10.2', false);
            testIsValidVersion('1.10.0', '^1.10.2', false);
            testIsValidVersion('1.10.0', '1.10.x', true);
            testIsValidVersion('1.10.0', '^1.10.0', true);
            testIsValidVersion('1.10.0', '*', false); // fails due to lack of specificity
            // Anything < 1.0.0 is compatible
            testIsValidVersion('1.0.0', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.0.0', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.0.0', '0.10.0', false);
            testIsValidVersion('1.0.0', '0.10.2', false);
            testIsValidVersion('1.0.0', '^0.10.2', true);
            testIsValidVersion('1.0.0', '0.10.x', true);
            testIsValidVersion('1.0.0', '^0.10.0', true);
            testIsValidVersion('1.0.0', '1.0.0', true);
            testIsValidVersion('1.0.0', '^1.0.0', true);
            testIsValidVersion('1.0.0', '^2.0.0', false);
            testIsValidVersion('1.0.0', '*', false); // fails due to lack of specificity
            testIsValidVersion('1.0.100', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.0.100', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.0.100', '0.10.0', false);
            testIsValidVersion('1.0.100', '0.10.2', false);
            testIsValidVersion('1.0.100', '^0.10.2', true);
            testIsValidVersion('1.0.100', '0.10.x', true);
            testIsValidVersion('1.0.100', '^0.10.0', true);
            testIsValidVersion('1.0.100', '1.0.0', false);
            testIsValidVersion('1.0.100', '^1.0.0', true);
            testIsValidVersion('1.0.100', '^1.0.1', true);
            testIsValidVersion('1.0.100', '^2.0.0', false);
            testIsValidVersion('1.0.100', '*', false); // fails due to lack of specificity
            testIsValidVersion('1.100.0', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.100.0', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('1.100.0', '0.10.0', false);
            testIsValidVersion('1.100.0', '0.10.2', false);
            testIsValidVersion('1.100.0', '^0.10.2', true);
            testIsValidVersion('1.100.0', '0.10.x', true);
            testIsValidVersion('1.100.0', '^0.10.0', true);
            testIsValidVersion('1.100.0', '1.0.0', false);
            testIsValidVersion('1.100.0', '^1.0.0', true);
            testIsValidVersion('1.100.0', '^1.1.0', true);
            testIsValidVersion('1.100.0', '^1.100.0', true);
            testIsValidVersion('1.100.0', '^2.0.0', false);
            testIsValidVersion('1.100.0', '*', false); // fails due to lack of specificity
            testIsValidVersion('2.0.0', 'x.x.x', false); // fails due to lack of specificity
            testIsValidVersion('2.0.0', '0.x.x', false); // fails due to lack of specificity
            testIsValidVersion('2.0.0', '0.10.0', false);
            testIsValidVersion('2.0.0', '0.10.2', false);
            testIsValidVersion('2.0.0', '^0.10.2', false);
            testIsValidVersion('2.0.0', '0.10.x', false);
            testIsValidVersion('2.0.0', '^0.10.0', false);
            testIsValidVersion('2.0.0', '1.0.0', false);
            testIsValidVersion('2.0.0', '^1.0.0', false);
            testIsValidVersion('2.0.0', '^1.1.0', false);
            testIsValidVersion('2.0.0', '^1.100.0', false);
            testIsValidVersion('2.0.0', '^2.0.0', true);
            testIsValidVersion('2.0.0', '*', false); // fails due to lack of specificity
            // date tags
            testIsValidVersion('1.10.0', '^1.10.0-20210511', true); // current date
            testIsValidVersion('1.10.0', '^1.10.0-20210510', true); // before date
            testIsValidVersion('1.10.0', '^1.10.0-20210512', false); // future date
            testIsValidVersion('1.10.1', '^1.10.0-20200101', true); // before date, but ahead version
            testIsValidVersion('1.11.0', '^1.10.0-20200101', true);
        });
        test('isValidExtensionVersion checks browser only extensions', () => {
            const manifest = {
                name: 'test',
                publisher: 'test',
                version: '0.0.0',
                engines: {
                    vscode: '^1.45.0'
                },
                browser: 'something'
            };
            assert.strictEqual((0, extensionValidator_1.isValidExtensionVersion)('1.44.0', undefined, manifest, false, []), false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVmFsaWRhdG9yLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25zL3Rlc3QvY29tbW9uL2V4dGVuc2lvblZhbGlkYXRvci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7UUFDekMsTUFBTSxjQUFjLEdBQUcsMEJBQTBCLENBQUM7UUFFbEQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtZQUM5QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsc0NBQWlCLEVBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHNDQUFpQixFQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxzQ0FBaUIsRUFBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsc0NBQWlCLEVBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHNDQUFpQixFQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXRELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxzQ0FBaUIsRUFBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsc0NBQWlCLEVBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHNDQUFpQixFQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxzQ0FBaUIsRUFBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsc0NBQWlCLEVBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHNDQUFpQixFQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxzQ0FBaUIsRUFBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsc0NBQWlCLEVBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHNDQUFpQixFQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7WUFDekIsU0FBUyxrQkFBa0IsQ0FBQyxPQUFlLEVBQUUsUUFBaUIsRUFBRSxnQkFBeUIsRUFBRSxTQUFpQixFQUFFLGNBQXVCLEVBQUUsU0FBaUIsRUFBRSxjQUF1QixFQUFFLFNBQWlCLEVBQUUsY0FBdUIsRUFBRSxVQUF5QjtnQkFDdlAsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQ0FBWSxFQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLFFBQVEsR0FBbUIsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLENBQUM7Z0JBRTdKLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsQ0FBQztZQUN6RSxDQUFDO1lBRUQsa0JBQWtCLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbkYsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0Usa0JBQWtCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0Usa0JBQWtCLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakYsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFN0Usa0JBQWtCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUUsa0JBQWtCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0Usa0JBQWtCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUUsa0JBQWtCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0Usa0JBQWtCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0Usa0JBQWtCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0Usa0JBQWtCLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFMUUsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUUsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1lBQzdCLFNBQVMsc0JBQXNCLENBQUMsT0FBZSxFQUFFLFNBQWlCLEVBQUUsY0FBdUIsRUFBRSxTQUFpQixFQUFFLGNBQXVCLEVBQUUsU0FBaUIsRUFBRSxjQUF1QixFQUFFLFNBQWtCLEVBQUUsU0FBUyxHQUFHLENBQUM7Z0JBQ3JOLE1BQU0sTUFBTSxHQUFHLElBQUEscUNBQWdCLEVBQUMsSUFBQSxpQ0FBWSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sUUFBUSxHQUF1QixFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQztnQkFDL0ksTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLENBQUM7WUFFRCxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNFLHNCQUFzQixDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRixzQkFBc0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXpILHNCQUFzQixDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRSxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEUsc0JBQXNCLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVwRSxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BFLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRSxzQkFBc0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEUsc0JBQXNCLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RFLHNCQUFzQixDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RSxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtB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