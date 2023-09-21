/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformationService", "vs/platform/log/common/log", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation", "vs/base/common/cancellation", "vs/base/test/common/utils"], function (require, exports, assert, aiRelatedInformationService_1, log_1, aiRelatedInformation_1, cancellation_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('AiRelatedInformationService', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let service;
        setup(() => {
            service = new aiRelatedInformationService_1.AiRelatedInformationService(store.add(new log_1.NullLogService()));
        });
        test('should check if providers are registered', () => {
            assert.equal(service.isEnabled(), false);
            store.add(service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, { provideAiRelatedInformation: () => Promise.resolve([]) }));
            assert.equal(service.isEnabled(), true);
        });
        test('should register and unregister providers', () => {
            const provider = { provideAiRelatedInformation: () => Promise.resolve([]) };
            const disposable = service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, provider);
            assert.strictEqual(service.isEnabled(), true);
            disposable.dispose();
            assert.strictEqual(service.isEnabled(), false);
        });
        test('should get related information', async () => {
            const command = 'command';
            const provider = {
                provideAiRelatedInformation: () => Promise.resolve([{ type: aiRelatedInformation_1.RelatedInformationType.CommandInformation, command, weight: 1 }])
            };
            service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, provider);
            const result = await service.getRelatedInformation('query', [aiRelatedInformation_1.RelatedInformationType.CommandInformation], cancellation_1.CancellationToken.None);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].command, command);
        });
        test('should get different types of related information', async () => {
            const command = 'command';
            const commandProvider = {
                provideAiRelatedInformation: () => Promise.resolve([{ type: aiRelatedInformation_1.RelatedInformationType.CommandInformation, command, weight: 1 }])
            };
            service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.CommandInformation, commandProvider);
            const setting = 'setting';
            const settingProvider = {
                provideAiRelatedInformation: () => Promise.resolve([{ type: aiRelatedInformation_1.RelatedInformationType.SettingInformation, setting, weight: 1 }])
            };
            service.registerAiRelatedInformationProvider(aiRelatedInformation_1.RelatedInformationType.SettingInformation, settingProvider);
            const result = await service.getRelatedInformation('query', [
                aiRelatedInformation_1.RelatedInformationType.CommandInformation,
                aiRelatedInformation_1.RelatedInformationType.SettingInformation
            ], cancellation_1.CancellationToken.None);
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0].command, command);
            assert.strictEqual(result[1].setting, setting);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWlSZWxhdGVkSW5mb3JtYXRpb25TZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvYWlSZWxhdGVkSW5mb3JtYXRpb24vdGVzdC9jb21tb24vYWlSZWxhdGVkSW5mb3JtYXRpb25TZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtRQUN6QyxNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFDeEQsSUFBSSxPQUFvQyxDQUFDO1FBRXpDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixPQUFPLEdBQUcsSUFBSSx5REFBMkIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7WUFDckQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsNkNBQXNCLENBQUMsa0JBQWtCLEVBQUUsRUFBRSwyQkFBMkIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9KLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtZQUNyRCxNQUFNLFFBQVEsR0FBa0MsRUFBRSwyQkFBMkIsRUFB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