/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/workbench/api/common/extHostDecorations", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, async_1, cancellation_1, uri_1, mock_1, utils_1, log_1, extHostDecorations_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDecorations', function () {
        let mainThreadShape;
        let extHostDecorations;
        const providers = new Set();
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(function () {
            providers.clear();
            mainThreadShape = new class extends (0, mock_1.mock)() {
                $registerDecorationProvider(handle) {
                    providers.add(handle);
                }
            };
            extHostDecorations = new extHostDecorations_1.ExtHostDecorations(new class extends (0, mock_1.mock)() {
                getProxy() {
                    return mainThreadShape;
                }
            }, new log_1.NullLogService());
        });
        test('SCM Decorations missing #100524', async function () {
            let calledA = false;
            let calledB = false;
            // never returns
            extHostDecorations.registerFileDecorationProvider({
                provideFileDecoration() {
                    calledA = true;
                    return new Promise(() => { });
                }
            }, extensions_1.nullExtensionDescription);
            // always returns
            extHostDecorations.registerFileDecorationProvider({
                provideFileDecoration() {
                    calledB = true;
                    return new Promise(resolve => resolve({ badge: 'H', tooltip: 'Hello' }));
                }
            }, extensions_1.nullExtensionDescription);
            const requests = [...providers.values()].map((handle, idx) => {
                return extHostDecorations.$provideDecorations(handle, [{ id: idx, uri: uri_1.URI.parse('test:///file') }], cancellation_1.CancellationToken.None);
            });
            assert.strictEqual(calledA, true);
            assert.strictEqual(calledB, true);
            assert.strictEqual(requests.length, 2);
            const [first, second] = requests;
            const firstResult = await Promise.race([first, (0, async_1.timeout)(30).then(() => false)]);
            assert.strictEqual(typeof firstResult, 'boolean'); // never finishes...
            const secondResult = await Promise.race([second, (0, async_1.timeout)(30).then(() => false)]);
            assert.strictEqual(typeof secondResult, 'object');
            await (0, async_1.timeout)(30);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERlY29yYXRpb25zLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0RGVjb3JhdGlvbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxLQUFLLENBQUMsb0JBQW9CLEVBQUU7UUFFM0IsSUFBSSxlQUEyQyxDQUFDO1FBQ2hELElBQUksa0JBQXNDLENBQUM7UUFDM0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUVwQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDO1lBRUwsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWxCLGVBQWUsR0FBRyxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBOEI7Z0JBQzVELDJCQUEyQixDQUFDLE1BQWM7b0JBQ2xELFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRCxDQUFDO1lBRUYsa0JBQWtCLEdBQUcsSUFBSSx1Q0FBa0IsQ0FDMUMsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXNCO2dCQUNsQyxRQUFRO29CQUNoQixPQUFPLGVBQWUsQ0FBQztnQkFDeEIsQ0FBQzthQUNELEVBQ0QsSUFBSSxvQkFBYyxFQUFFLENBQ3BCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxLQUFLO1lBRTVDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFFcEIsZ0JBQWdCO1lBQ2hCLGtCQUFrQixDQUFDLDhCQUE4QixDQUFDO2dCQUVqRCxxQkFBcUI7b0JBQ3BCLE9BQU8sR0FBRyxJQUFJLENBQUM7b0JBQ2YsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsQ0FBQzthQUNELEVBQUUscUNBQXdCLENBQUMsQ0FBQztZQUU3QixpQkFBaUI7WUFDakIsa0JBQWtCLENBQUMsOEJBQThCLENBQUM7Z0JBRWpELHFCQUFxQjtvQkFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDZixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxDQUFDO2FBQ0QsRUFBRSxxQ0FBd0IsQ0FBQyxDQUFDO1lBRzdCLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQzVELE9BQU8sa0JBQWtCLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5SCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWxDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUVqQyxNQUFNLFdBQVcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBQSxlQUFPLEVBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CO1lBRXZFLE1BQU0sWUFBWSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFBLGVBQU8sRUFBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFHbEQsTUFBTSxJQUFBLGVBQU8sRUFBQyxFQUFFLENBQUMsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUVKLENBQUMsQ0FBQyxDQUFDIn0=