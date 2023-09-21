/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/ternarySearchTree", "vs/workbench/services/extensions/common/extensions", "vs/base/common/network", "vs/base/common/uri", "vs/platform/profiling/common/profiling", "vs/base/common/functional"], function (require, exports, ternarySearchTree_1, extensions_1, network_1, uri_1, profiling_1, functional_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostProfiler = void 0;
    let ExtensionHostProfiler = class ExtensionHostProfiler {
        constructor(_port, _extensionService, _profilingService) {
            this._port = _port;
            this._extensionService = _extensionService;
            this._profilingService = _profilingService;
        }
        async start() {
            const id = await this._profilingService.startProfiling({ port: this._port });
            return {
                stop: (0, functional_1.once)(async () => {
                    const profile = await this._profilingService.stopProfiling(id);
                    await this._extensionService.whenInstalledExtensionsRegistered();
                    const extensions = this._extensionService.extensions;
                    return this._distill(profile, extensions);
                })
            };
        }
        _distill(profile, extensions) {
            const searchTree = ternarySearchTree_1.TernarySearchTree.forUris();
            for (const extension of extensions) {
                if (extension.extensionLocation.scheme === network_1.Schemas.file) {
                    searchTree.set(uri_1.URI.file(extension.extensionLocation.fsPath), extension);
                }
            }
            const nodes = profile.nodes;
            const idsToNodes = new Map();
            const idsToSegmentId = new Map();
            for (const node of nodes) {
                idsToNodes.set(node.id, node);
            }
            function visit(node, segmentId) {
                if (!segmentId) {
                    switch (node.callFrame.functionName) {
                        case '(root)':
                            break;
                        case '(program)':
                            segmentId = 'program';
                            break;
                        case '(garbage collector)':
                            segmentId = 'gc';
                            break;
                        default:
                            segmentId = 'self';
                            break;
                    }
                }
                else if (segmentId === 'self' && node.callFrame.url) {
                    let extension;
                    try {
                        extension = searchTree.findSubstr(uri_1.URI.parse(node.callFrame.url));
                    }
                    catch {
                        // ignore
                    }
                    if (extension) {
                        segmentId = extension.identifier.value;
                    }
                }
                idsToSegmentId.set(node.id, segmentId);
                if (node.children) {
                    for (const child of node.children) {
                        const childNode = idsToNodes.get(child);
                        if (childNode) {
                            visit(childNode, segmentId);
                        }
                    }
                }
            }
            visit(nodes[0], null);
            const samples = profile.samples || [];
            const timeDeltas = profile.timeDeltas || [];
            const distilledDeltas = [];
            const distilledIds = [];
            let currSegmentTime = 0;
            let currSegmentId;
            for (let i = 0; i < samples.length; i++) {
                const id = samples[i];
                const segmentId = idsToSegmentId.get(id);
                if (segmentId !== currSegmentId) {
                    if (currSegmentId) {
                        distilledIds.push(currSegmentId);
                        distilledDeltas.push(currSegmentTime);
                    }
                    currSegmentId = segmentId ?? undefined;
                    currSegmentTime = 0;
                }
                currSegmentTime += timeDeltas[i];
            }
            if (currSegmentId) {
                distilledIds.push(currSegmentId);
                distilledDeltas.push(currSegmentTime);
            }
            return {
                startTime: profile.startTime,
                endTime: profile.endTime,
                deltas: distilledDeltas,
                ids: distilledIds,
                data: profile,
                getAggregatedTimes: () => {
                    const segmentsToTime = new Map();
                    for (let i = 0; i < distilledIds.length; i++) {
                        const id = distilledIds[i];
                        segmentsToTime.set(id, (segmentsToTime.get(id) || 0) + distilledDeltas[i]);
                    }
                    return segmentsToTime;
                }
            };
        }
    };
    exports.ExtensionHostProfiler = ExtensionHostProfiler;
    exports.ExtensionHostProfiler = ExtensionHostProfiler = __decorate([
        __param(1, extensions_1.IExtensionService),
        __param(2, profiling_1.IV8InspectProfilingService)
    ], ExtensionHostProfiler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFByb2ZpbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvZWxlY3Ryb24tc2FuZGJveC9leHRlbnNpb25Ib3N0UHJvZmlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO1FBRWpDLFlBQ2tCLEtBQWEsRUFDTSxpQkFBb0MsRUFDM0IsaUJBQTZDO1lBRnpFLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDTSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBNEI7UUFFM0YsQ0FBQztRQUVNLEtBQUssQ0FBQyxLQUFLO1lBRWpCLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUU3RSxPQUFPO2dCQUNOLElBQUksRUFBRSxJQUFBLGlCQUFJLEVBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQ3JCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0QsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztvQkFDakUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQztvQkFDckQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDM0MsQ0FBQyxDQUFDO2FBQ0YsQ0FBQztRQUNILENBQUM7UUFFTyxRQUFRLENBQUMsT0FBbUIsRUFBRSxVQUE0QztZQUNq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