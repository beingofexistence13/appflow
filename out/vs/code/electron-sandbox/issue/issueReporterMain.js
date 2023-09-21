/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/platform", "vs/code/electron-sandbox/issue/issueReporterPage", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/issue/common/issue", "vs/platform/native/common/native", "vs/platform/native/electron-sandbox/nativeHostService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/ipc/common/mainProcessService", "./issueReporterService", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/extensions", "vs/platform/ipc/electron-sandbox/services", "vs/css!./media/issueReporter", "vs/base/browser/ui/codicons/codiconStyles"], function (require, exports, dom_1, platform_1, issueReporterPage_1, mainProcessService_1, issue_1, native_1, nativeHostService_1, serviceCollection_1, descriptors_1, mainProcessService_2, issueReporterService_1, instantiationService_1, extensions_1, services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startup = void 0;
    function startup(configuration) {
        const platformClass = platform_1.isWindows ? 'windows' : platform_1.isLinux ? 'linux' : 'mac';
        document.body.classList.add(platformClass); // used by our fonts
        (0, dom_1.safeInnerHtml)(document.body, (0, issueReporterPage_1.default)());
        const instantiationService = initServices(configuration.windowId);
        const issueReporter = instantiationService.createInstance(issueReporterService_1.IssueReporter, configuration);
        issueReporter.render();
        document.body.style.display = 'block';
        issueReporter.setInitialFocus();
    }
    exports.startup = startup;
    function initServices(windowId) {
        const services = new serviceCollection_1.ServiceCollection();
        const contributedServices = (0, extensions_1.getSingletonServiceDescriptors)();
        for (const [id, descriptor] of contributedServices) {
            services.set(id, descriptor);
        }
        services.set(mainProcessService_2.IMainProcessService, new descriptors_1.SyncDescriptor(mainProcessService_1.ElectronIPCMainProcessService, [windowId]));
        services.set(native_1.INativeHostService, new descriptors_1.SyncDescriptor(nativeHostService_1.NativeHostService, [windowId]));
        return new instantiationService_1.InstantiationService(services, true);
    }
    (0, services_1.registerMainProcessRemoteService)(issue_1.IIssueMainService, 'issue');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVSZXBvcnRlck1haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL2VsZWN0cm9uLXNhbmRib3gvaXNzdWUvaXNzdWVSZXBvcnRlck1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxTQUFnQixPQUFPLENBQUMsYUFBK0M7UUFDdEUsTUFBTSxhQUFhLEdBQUcsb0JBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxrQkFBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN4RSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxvQkFBb0I7UUFFaEUsSUFBQSxtQkFBYSxFQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBQSwyQkFBUSxHQUFFLENBQUMsQ0FBQztRQUV6QyxNQUFNLG9CQUFvQixHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbEUsTUFBTSxhQUFhLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG9DQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDeEYsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdEMsYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFaRCwwQkFZQztJQUVELFNBQVMsWUFBWSxDQUFDLFFBQWdCO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQztRQUV6QyxNQUFNLG1CQUFtQixHQUFHLElBQUEsMkNBQThCLEdBQUUsQ0FBQztRQUM3RCxLQUFLLE1BQU0sQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLElBQUksbUJBQW1CLEVBQUU7WUFDbkQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDN0I7UUFFRCxRQUFRLENBQUMsR0FBRyxDQUFDLHdDQUFtQixFQUFFLElBQUksNEJBQWMsQ0FBQyxrREFBNkIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFrQixFQUFFLElBQUksNEJBQWMsQ0FBQyxxQ0FBaUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwRixPQUFPLElBQUksMkNBQW9CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxJQUFBLDJDQUFnQyxFQUFDLHlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDIn0=