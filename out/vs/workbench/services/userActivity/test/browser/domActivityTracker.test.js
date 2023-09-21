/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/services/userActivity/browser/domActivityTracker", "vs/workbench/services/userActivity/common/userActivityService", "sinon", "assert"], function (require, exports, instantiationServiceMock_1, domActivityTracker_1, userActivityService_1, sinon, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DomActivityTracker', () => {
        let uas;
        let dom;
        let insta;
        let clock;
        const maxTimeToBecomeIdle = 3 * 30000; // (MIN_INTERVALS_WITHOUT_ACTIVITY + 1) * CHECK_INTERVAL;
        setup(() => {
            clock = sinon.useFakeTimers();
            insta = new instantiationServiceMock_1.TestInstantiationService();
            uas = new userActivityService_1.UserActivityService(insta);
            dom = new domActivityTracker_1.DomActivityTracker(uas);
        });
        teardown(() => {
            dom.dispose();
            uas.dispose();
            clock.restore();
            insta.dispose();
        });
        test('marks inactive on no input', () => {
            assert.equal(uas.isActive, true);
            clock.tick(maxTimeToBecomeIdle);
            assert.equal(uas.isActive, false);
        });
        test('preserves activity state when active', () => {
            assert.equal(uas.isActive, true);
            const div = 10;
            for (let i = 0; i < div; i++) {
                document.dispatchEvent(new MouseEvent('keydown'));
                clock.tick(maxTimeToBecomeIdle / div);
            }
            assert.equal(uas.isActive, true);
        });
        test('restores active state', () => {
            assert.equal(uas.isActive, true);
            clock.tick(maxTimeToBecomeIdle);
            assert.equal(uas.isActive, false);
            document.dispatchEvent(new MouseEvent('keydown'));
            assert.equal(uas.isActive, true);
            clock.tick(maxTimeToBecomeIdle);
            assert.equal(uas.isActive, false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tQWN0aXZpdHlUcmFja2VyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckFjdGl2aXR5L3Rlc3QvYnJvd3Nlci9kb21BY3Rpdml0eVRyYWNrZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLElBQUksR0FBd0IsQ0FBQztRQUM3QixJQUFJLEdBQXVCLENBQUM7UUFDNUIsSUFBSSxLQUErQixDQUFDO1FBQ3BDLElBQUksS0FBNEIsQ0FBQztRQUNqQyxNQUFNLG1CQUFtQixHQUFHLENBQUMsR0FBRyxLQUFNLENBQUMsQ0FBQyx5REFBeUQ7UUFFakcsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDOUIsS0FBSyxHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUN2QyxHQUFHLEdBQUcsSUFBSSx5Q0FBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxHQUFHLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBR0gsSUFBSSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUN2QyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakMsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7WUFDakQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDbEQsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUN0QztZQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7WUFDbEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFbEMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVqQyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==