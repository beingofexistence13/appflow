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
    exports.$vac = void 0;
    let $vac = class $vac {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async start() {
            const id = await this.c.startProfiling({ port: this.a });
            return {
                stop: (0, functional_1.$bb)(async () => {
                    const profile = await this.c.stopProfiling(id);
                    await this.b.whenInstalledExtensionsRegistered();
                    const extensions = this.b.extensions;
                    return this.d(profile, extensions);
                })
            };
        }
        d(profile, extensions) {
            const searchTree = ternarySearchTree_1.$Hh.forUris();
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
    exports.$vac = $vac;
    exports.$vac = $vac = __decorate([
        __param(1, extensions_1.$MF),
        __param(2, profiling_1.$CF)
    ], $vac);
});
//# sourceMappingURL=extensionHostProfiler.js.map