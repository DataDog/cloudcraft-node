// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

import CloudcraftRestClient from '../restclient';

export interface CloudcraftMyUser {
    id: string;
    name: string;
    email: string;
    settings: any;
    createdAt: Date;
    updatedAt: Date;
    accessedAt: Date;
}

class CloudcraftUserApi {
    private client: CloudcraftRestClient;

    constructor(client: CloudcraftRestClient) {
        this.client = client;
    }

    async me(): Promise<CloudcraftMyUser> {
        const response = await this.client.get('user/me');

        return {
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            accessedAt: new Date(response.data.accessedAt),
        };
    }
}

export default CloudcraftUserApi;
