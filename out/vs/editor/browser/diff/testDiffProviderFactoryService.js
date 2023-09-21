/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/diff/linesDiffComputers"], function (require, exports, lifecycle_1, linesDiffComputers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SyncDocumentDiffProvider = exports.TestDiffProviderFactoryService = void 0;
    class TestDiffProviderFactoryService {
        createDiffProvider() {
            return new SyncDocumentDiffProvider();
        }
    }
    exports.TestDiffProviderFactoryService = TestDiffProviderFactoryService;
    class SyncDocumentDiffProvider {
        constructor() {
            this.onDidChange = () => (0, lifecycle_1.toDisposable)(() => { });
        }
        computeDiff(original, modified, options, cancellationToken) {
            const result = linesDiffComputers_1.linesDiffComputers.getDefault().computeDiff(original.getLinesContent(), modified.getLinesContent(), options);
            return Promise.resolve({
                changes: result.changes,
                quitEarly: result.hitTimeout,
                identical: original.getValue() === modified.getValue(),
                moves: result.moves,
            });
        }
    }
    exports.SyncDocumentDiffProvider = SyncDocumentDiffProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdERpZmZQcm92aWRlckZhY3RvcnlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvZGlmZi90ZXN0RGlmZlByb3ZpZGVyRmFjdG9yeVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsOEJBQThCO1FBRTFDLGtCQUFrQjtZQUNqQixPQUFPLElBQUksd0JBQXdCLEVBQUUsQ0FBQztRQUN2QyxDQUFDO0tBQ0Q7SUFMRCx3RUFLQztJQUVELE1BQWEsd0JBQXdCO1FBQXJDO1lBV0MsZ0JBQVcsR0FBZ0IsR0FBRyxFQUFFLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFYQSxXQUFXLENBQUMsUUFBb0IsRUFBRSxRQUFvQixFQUFFLE9BQXFDLEVBQUUsaUJBQW9DO1lBQ2xJLE1BQU0sTUFBTSxHQUFHLHVDQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLEVBQUUsUUFBUSxDQUFDLGVBQWUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO2dCQUN2QixTQUFTLEVBQUUsTUFBTSxDQUFDLFVBQVU7Z0JBQzVCLFNBQVMsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssUUFBUSxDQUFDLFFBQVEsRUFBRTtnQkFDdEQsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO2FBQ25CLENBQUMsQ0FBQztRQUNKLENBQUM7S0FHRDtJQVpELDREQVlDIn0=