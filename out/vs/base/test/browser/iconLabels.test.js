/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/iconLabel/iconLabels"], function (require, exports, assert, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('renderLabelWithIcons', () => {
        test('no icons', () => {
            const result = (0, iconLabels_1.renderLabelWithIcons)(' hello World .');
            assert.strictEqual(elementsToString(result), ' hello World .');
        });
        test('icons only', () => {
            const result = (0, iconLabels_1.renderLabelWithIcons)('$(alert)');
            assert.strictEqual(elementsToString(result), '<span class="codicon codicon-alert"></span>');
        });
        test('icon and non-icon strings', () => {
            const result = (0, iconLabels_1.renderLabelWithIcons)(` $(alert) Unresponsive`);
            assert.strictEqual(elementsToString(result), ' <span class="codicon codicon-alert"></span> Unresponsive');
        });
        test('multiple icons', () => {
            const result = (0, iconLabels_1.renderLabelWithIcons)('$(check)$(error)');
            assert.strictEqual(elementsToString(result), '<span class="codicon codicon-check"></span><span class="codicon codicon-error"></span>');
        });
        test('escaped icons', () => {
            const result = (0, iconLabels_1.renderLabelWithIcons)('\\$(escaped)');
            assert.strictEqual(elementsToString(result), '$(escaped)');
        });
        test('icon with animation', () => {
            const result = (0, iconLabels_1.renderLabelWithIcons)('$(zip~anim)');
            assert.strictEqual(elementsToString(result), '<span class="codicon codicon-zip codicon-modifier-anim"></span>');
        });
        const elementsToString = (elements) => {
            return elements
                .map(elem => elem instanceof HTMLElement ? elem.outerHTML : elem)
                .reduce((a, b) => a + b, '');
        };
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvaWNvbkxhYmVscy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBS2hHLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7UUFFbEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7WUFDckIsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQ0FBb0IsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXRELE1BQU0sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUEsaUNBQW9CLEVBQUMsVUFBVSxDQUFDLENBQUM7WUFFaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDO1FBQzdGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtZQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFBLGlDQUFvQixFQUFDLHdCQUF3QixDQUFDLENBQUM7WUFFOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSwyREFBMkQsQ0FBQyxDQUFDO1FBQzNHLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtZQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFBLGlDQUFvQixFQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFeEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSx3RkFBd0YsQ0FBQyxDQUFDO1FBQ3hJLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7WUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQ0FBb0IsRUFBQyxjQUFjLENBQUMsQ0FBQztZQUVwRCxNQUFNLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtZQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFBLGlDQUFvQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsaUVBQWlFLENBQUMsQ0FBQztRQUNqSCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxRQUFxQyxFQUFVLEVBQUU7WUFDMUUsT0FBTyxRQUFRO2lCQUNiLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztpQkFDaEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQyJ9