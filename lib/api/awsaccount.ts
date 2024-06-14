// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

import { PaperSize, Projection, Theme, BlueprintFormat } from '../common';
import CloudcraftRestClient from '../restclient';

export interface AWSAccount {
    id: string;
    name: string;
    roleArn: string;
    externalId: string;
    CreatorId: string;
    readAccess: Array<string>;
    writeAccess: Array<string>;
    createdAt: Date;
    updatedAt: Date;
}

export interface AWSAccountSnapshotOptions {
    filter: string;
    exclude: Array<string>;
    label: boolean;
    autoconnect: boolean;
    scale: number;
    width: number;
    height: number;
    grid: boolean;
    transparent: boolean;
    landscape: boolean;
    paperSize: PaperSize;
    projection: Projection;
    theme: Theme;
}

export interface IAMParameters {
    accountId: string;
    externalId: string;
    awsConsoleUrl: string;
}

class CloudcraftAWSAccountApi {
    private client: CloudcraftRestClient;

    constructor(client: CloudcraftRestClient) {
        this.client = client;
    }

    async list(): Promise<Array<AWSAccount>> {
        const response = await this.client.get('aws/account');

        return response.data.accounts.map((awsAccount: any) => ({
            ...awsAccount,
            createdAt: new Date(awsAccount.createdAt),
            updatedAt: new Date(awsAccount.updatedAt),
        }));
    }

    async create(awsAccount: Partial<AWSAccount>, region?: string): Promise<AWSAccount> {
        const response = await this.client.post('aws/account', { region, ...awsAccount });

        return response.data;
    }

    async update(awsAccount: AWSAccount): Promise<AWSAccount> {
        const response = await this.client.put(`aws/account/${awsAccount.id}`, awsAccount);

        return response.data;
    }

    async snapshot(
        awsAccountId: string,
        region: string,
        format: BlueprintFormat,
        options?: Partial<AWSAccountSnapshotOptions>,
    ): Promise<string | ArrayBuffer> {
        const response = await this.client.get(
            CloudcraftRestClient.generateUrl(`aws/account/${awsAccountId}/${region}/${format}`, options),
        );

        return response.data;
    }

    async delete(awsAccountId: string) {
        await this.client.delete(`aws/account/${awsAccountId}`);
    }

    async iamParameters(): Promise<IAMParameters> {
        const response = await this.client.get('aws/account/iamParameters');

        return response.data;
    }
}

export default CloudcraftAWSAccountApi;
