// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

import { PaperSize, BlueprintFormat } from '../common';
import CloudcraftRestClient from '../restclient';

export interface BlueprintData {
    grid: string;
    name: string;
    text: Array<object>;
    edges: Array<object>;
    icons: Array<object>;
    nodes: Array<object>;
    theme: object;
    groups: Array<object>;
    images: Array<object>;
    version: number;
    surfaces: Array<object>;
    shareDocs: boolean;
    connectors: Array<object>;
    projection: string;
    liveAccount: object;
    liveOptions: object;
    disabledLayers: Array<string>;
}

export interface Blueprint {
    id: string;
    data: Partial<BlueprintData>;
    tags: Array<string>;
    CreatorId: string;
    LastUserId: string;
    readAccess: Array<string>;
    writeAccess: Array<string>;
    createdAt: Date;
    updatedAt: Date;
}

export interface BlueprintListEntry {
    id: string;
    name: string;
    tags: Array<string>;
    CreatorId: string;
    LastUserId: string;
    readAccess: Array<string>;
    writeAccess: Array<string>;
    createdAt: Date;
    updatedAt: Date;
}

export interface BlueprintExportOptions {
    scale: number;
    width: number;
    height: number;
    grid: boolean;
    transparent: boolean;
    landscape: boolean;
    paperSize: PaperSize;
}

class CloudcraftBlueprintApi {
    private client: CloudcraftRestClient;

    constructor(client: CloudcraftRestClient) {
        this.client = client;
    }

    async list(): Promise<Array<BlueprintListEntry>> {
        const response = await this.client.get('blueprint');

        return response.data.blueprints.map((bp: any) => ({
            ...bp,
            createdAt: new Date(bp.createdAt),
            updatedAt: new Date(bp.updatedAt),
        }));
    }

    async get(blueprintId: string): Promise<Blueprint> {
        const response = await this.client.get(`blueprint/${blueprintId}`);

        return {
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
        };
    }

    async create(blueprint: Partial<Blueprint>): Promise<Blueprint> {
        const response = await this.client.post('blueprint', blueprint);

        return response.data;
    }

    async update(blueprint: Blueprint): Promise<Blueprint> {
        const response = await this.client.put(`blueprint/${blueprint.id}`, blueprint);

        return response.data;
    }

    async export(
        blueprintId: string,
        format: BlueprintFormat,
        options?: Partial<BlueprintExportOptions>,
    ): Promise<string | ArrayBuffer | Blueprint> {
        const response = await this.client.get(
            CloudcraftRestClient.generateUrl(`blueprint/${blueprintId}/${format}`, options),
        );

        return response.data;
    }

    async delete(blueprintId: string) {
        await this.client.delete(`blueprint/${blueprintId}`);
    }
}

export default CloudcraftBlueprintApi;
