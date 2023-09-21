/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "path", "vs/base/test/node/testUtils", "vs/server/node/serverConnectionToken"], function (require, exports, assert, fs, os, path, testUtils_1, serverConnectionToken_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('parseServerConnectionToken', () => {
        function isError(r) {
            return (r instanceof serverConnectionToken_1.ServerConnectionTokenParseError);
        }
        function assertIsError(r) {
            assert.strictEqual(isError(r), true);
        }
        test('no arguments generates a token that is mandatory', async () => {
            const result = await (0, serverConnectionToken_1.parseServerConnectionToken)({}, async () => 'defaultTokenValue');
            assert.ok(!(result instanceof serverConnectionToken_1.ServerConnectionTokenParseError));
            assert.ok(result.type === 2 /* ServerConnectionTokenType.Mandatory */);
        });
        test('--without-connection-token', async () => {
            const result = await (0, serverConnectionToken_1.parseServerConnectionToken)({ 'without-connection-token': true }, async () => 'defaultTokenValue');
            assert.ok(!(result instanceof serverConnectionToken_1.ServerConnectionTokenParseError));
            assert.ok(result.type === 0 /* ServerConnectionTokenType.None */);
        });
        test('--without-connection-token --connection-token results in error', async () => {
            assertIsError(await (0, serverConnectionToken_1.parseServerConnectionToken)({ 'without-connection-token': true, 'connection-token': '0' }, async () => 'defaultTokenValue'));
        });
        test('--without-connection-token --connection-token-file results in error', async () => {
            assertIsError(await (0, serverConnectionToken_1.parseServerConnectionToken)({ 'without-connection-token': true, 'connection-token-file': '0' }, async () => 'defaultTokenValue'));
        });
        test('--connection-token-file --connection-token results in error', async () => {
            assertIsError(await (0, serverConnectionToken_1.parseServerConnectionToken)({ 'connection-token-file': '0', 'connection-token': '0' }, async () => 'defaultTokenValue'));
        });
        test('--connection-token-file', async function () {
            this.timeout(10000);
            const testDir = (0, testUtils_1.getRandomTestPath)(os.tmpdir(), 'vsctests', 'server-connection-token');
            fs.mkdirSync(testDir, { recursive: true });
            const filename = path.join(testDir, 'connection-token-file');
            const connectionToken = `12345-123-abc`;
            fs.writeFileSync(filename, connectionToken);
            const result = await (0, serverConnectionToken_1.parseServerConnectionToken)({ 'connection-token-file': filename }, async () => 'defaultTokenValue');
            assert.ok(!(result instanceof serverConnectionToken_1.ServerConnectionTokenParseError));
            assert.ok(result.type === 2 /* ServerConnectionTokenType.Mandatory */);
            assert.strictEqual(result.value, connectionToken);
            fs.rmSync(testDir, { recursive: true, force: true });
        });
        test('--connection-token', async () => {
            const connectionToken = `12345-123-abc`;
            const result = await (0, serverConnectionToken_1.parseServerConnectionToken)({ 'connection-token': connectionToken }, async () => 'defaultTokenValue');
            assert.ok(!(result instanceof serverConnectionToken_1.ServerConnectionTokenParseError));
            assert.ok(result.type === 2 /* ServerConnectionTokenType.Mandatory */);
            assert.strictEqual(result.value, connectionToken);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyQ29ubmVjdGlvblRva2VuLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvdGVzdC9ub2RlL3NlcnZlckNvbm5lY3Rpb25Ub2tlbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7UUFFeEMsU0FBUyxPQUFPLENBQUMsQ0FBMEQ7WUFDMUUsT0FBTyxDQUFDLENBQUMsWUFBWSx1REFBK0IsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxTQUFTLGFBQWEsQ0FBQyxDQUEwRDtZQUNoRixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBSSxDQUFDLGtEQUFrRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ25FLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxrREFBMEIsRUFBQyxFQUFzQixFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN6RyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLFlBQVksdURBQStCLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksZ0RBQXdDLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM3QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsa0RBQTBCLEVBQUMsRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQXNCLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzNJLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0s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