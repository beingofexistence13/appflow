/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/async"], function (require, exports, instantiation_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.remoteConnectionLatencyMeasurer = exports.IRemoteAgentService = void 0;
    exports.IRemoteAgentService = (0, instantiation_1.createDecorator)('remoteAgentService');
    exports.remoteConnectionLatencyMeasurer = new class {
        constructor() {
            this.maxSampleCount = 5;
            this.sampleDelay = 2000;
            this.initial = [];
            this.maxInitialCount = 3;
            this.average = [];
            this.maxAverageCount = 100;
            this.highLatencyMultiple = 2;
            this.highLatencyMinThreshold = 500;
            this.highLatencyMaxThreshold = 1500;
            this.lastMeasurement = undefined;
        }
        get latency() { return this.lastMeasurement; }
        async measure(remoteAgentService) {
            let currentLatency = Infinity;
            // Measure up to samples count
            for (let i = 0; i < this.maxSampleCount; i++) {
                const rtt = await remoteAgentService.getRoundTripTime();
                if (rtt === undefined) {
                    return undefined;
                }
                currentLatency = Math.min(currentLatency, rtt / 2 /* we want just one way, not round trip time */);
                await (0, async_1.timeout)(this.sampleDelay);
            }
            // Keep track of average latency
            this.average.push(currentLatency);
            if (this.average.length > this.maxAverageCount) {
                this.average.shift();
            }
            // Keep track of initial latency
            let initialLatency = undefined;
            if (this.initial.length < this.maxInitialCount) {
                this.initial.push(currentLatency);
            }
            else {
                initialLatency = this.initial.reduce((sum, value) => sum + value, 0) / this.initial.length;
            }
            // Remember as last measurement
            this.lastMeasurement = {
                initial: initialLatency,
                current: currentLatency,
                average: this.average.reduce((sum, value) => sum + value, 0) / this.average.length,
                high: (() => {
                    // based on the initial, average and current latency, try to decide
                    // if the connection has high latency
                    // Some rules:
                    // - we require the initial latency to be computed
                    // - we only consider latency above highLatencyMinThreshold as potentially high
                    // - we require the current latency to be above the average latency by a factor of highLatencyMultiple
                    // - but not if the latency is actually above highLatencyMaxThreshold
                    if (typeof initialLatency === 'undefined') {
                        return false;
                    }
                    if (currentLatency > this.highLatencyMaxThreshold) {
                        return true;
                    }
                    if (currentLatency > this.highLatencyMinThreshold && currentLatency > initialLatency * this.highLatencyMultiple) {
                        return true;
                    }
                    return false;
                })()
            };
            return this.lastMeasurement;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQWdlbnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3JlbW90ZS9jb21tb24vcmVtb3RlQWdlbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVduRixRQUFBLG1CQUFtQixHQUFHLElBQUEsK0JBQWUsRUFBc0Isb0JBQW9CLENBQUMsQ0FBQztJQTBEakYsUUFBQSwrQkFBK0IsR0FBRyxJQUFJO1FBQUE7WUFFekMsbUJBQWMsR0FBRyxDQUFDLENBQUM7WUFDbkIsZ0JBQVcsR0FBRyxJQUFJLENBQUM7WUFFbkIsWUFBTyxHQUFhLEVBQUUsQ0FBQztZQUN2QixvQkFBZSxHQUFHLENBQUMsQ0FBQztZQUVwQixZQUFPLEdBQWEsRUFBRSxDQUFDO1lBQ3ZCLG9CQUFlLEdBQUcsR0FBRyxDQUFDO1lBRXRCLHdCQUFtQixHQUFHLENBQUMsQ0FBQztZQUN4Qiw0QkFBdUIsR0FBRyxHQUFHLENBQUM7WUFDOUIsNEJBQXVCLEdBQUcsSUFBSSxDQUFDO1lBRXhDLG9CQUFlLEdBQW9ELFNBQVMsQ0FBQztRQWdFOUUsQ0FBQztRQS9EQSxJQUFJLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBRTlDLEtBQUssQ0FBQyxPQUFPLENBQUMsa0JBQXVDO1lBQ3BELElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQztZQUU5Qiw4QkFBOEI7WUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUN0QixPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBRUQsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsK0NBQStDLENBQUMsQ0FBQztnQkFDbkcsTUFBTSxJQUFBLGVBQU8sRUFBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDaEM7WUFFRCxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3JCO1lBRUQsZ0NBQWdDO1lBQ2hDLElBQUksY0FBYyxHQUF1QixTQUFTLENBQUM7WUFDbkQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUNsQztpQkFBTTtnQkFDTixjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQzNGO1lBRUQsK0JBQStCO1lBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUc7Z0JBQ3RCLE9BQU8sRUFBRSxjQUFjO2dCQUN2QixPQUFPLEVBQUUsY0FBYztnQkFDdkIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07Z0JBQ2xGLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRTtvQkFFWCxtRUFBbUU7b0JBQ25FLHFDQUFxQztvQkFDckMsY0FBYztvQkFDZCxrREFBa0Q7b0JBQ2xELCtFQUErRTtvQkFDL0Usc0dBQXNHO29CQUN0RyxxRUFBcUU7b0JBRXJFLElBQUksT0FBTyxjQUFjLEtBQUssV0FBVyxFQUFFO3dCQUMxQyxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7d0JBQ2xELE9BQU8sSUFBSSxDQUFDO3FCQUNaO29CQUVELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxjQUFjLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRTt3QkFDaEgsT0FBTyxJQUFJLENBQUM7cUJBQ1o7b0JBRUQsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLEVBQUU7YUFDSixDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7S0FDRCxDQUFDIn0=