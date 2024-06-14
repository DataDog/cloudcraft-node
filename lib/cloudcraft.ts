// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

import CloudcraftUserApi from './api/user';
import CloudcraftRestClient from './restclient';
import { ClientConfig } from './clientconfig';
import CloudcraftBlueprintApi from './api/blueprint';
import CloudcraftBudgetApi from './api/budget';
import CloudcraftAWSAccountApi from './api/awsaccount';

const defaultConfig: ClientConfig = {
    maxNetworkRetries: 10,
    timeout: 80_000,
    host: 'api.cloudcraft.co',
    port: 443,
    protocol: 'https',
    basePath: '',
};

interface EnvironmentConfig {
    maxNetworkRetries: number;
    timeout: number;
    host: string;
    port: number;
    protocol: string;
    basePath: string;
}

function getEnvironmentConfig(): Partial<EnvironmentConfig> {
    const {
        CLOUDCRAFT_MAX_NETWORK_RETRIES,
        CLOUDCRAFT_TIMEOUT,
        CLOUDCRAFT_HOST,
        CLOUDCRAFT_PORT,
        CLOUDCRAFT_PROTOCOL,
        CLOUDCRAFT_BASE_PATH,
    } = process.env;

    const environmentConfig: Partial<EnvironmentConfig> = {};

    if (CLOUDCRAFT_MAX_NETWORK_RETRIES) {
        environmentConfig.maxNetworkRetries = Number(CLOUDCRAFT_MAX_NETWORK_RETRIES);
    }
    if (CLOUDCRAFT_TIMEOUT) {
        environmentConfig.timeout = Number(CLOUDCRAFT_TIMEOUT);
    }
    if (CLOUDCRAFT_HOST) {
        environmentConfig.host = CLOUDCRAFT_HOST;
    }
    if (CLOUDCRAFT_PORT) {
        environmentConfig.port = Number(CLOUDCRAFT_PORT);
    }
    if (CLOUDCRAFT_PROTOCOL) {
        environmentConfig.protocol = CLOUDCRAFT_PROTOCOL;
    }
    if (CLOUDCRAFT_BASE_PATH) {
        environmentConfig.basePath = CLOUDCRAFT_BASE_PATH;
    }

    return environmentConfig;
}

export class Cloudcraft {
    private readonly apiKey: string;

    readonly config: ClientConfig;

    readonly user: CloudcraftUserApi;

    readonly blueprint: CloudcraftBlueprintApi;

    readonly budget: CloudcraftBudgetApi;

    readonly awsAccount: CloudcraftAWSAccountApi;

    constructor(apiKey?: string, config?: Partial<ClientConfig>) {
        const { CLOUDCRAFT_API_KEY } = process.env;

        const effectiveConfig: ClientConfig = {
            ...defaultConfig,
            ...getEnvironmentConfig(),
            ...config,
        };

        if (!apiKey && !CLOUDCRAFT_API_KEY) {
            throw new Error('No API key specified');
        }

        this.apiKey = apiKey || CLOUDCRAFT_API_KEY || '';
        this.config = effectiveConfig;

        const restClient = new CloudcraftRestClient(this.apiKey, effectiveConfig);

        this.user = new CloudcraftUserApi(restClient);
        this.blueprint = new CloudcraftBlueprintApi(restClient);
        this.budget = new CloudcraftBudgetApi(restClient);
        this.awsAccount = new CloudcraftAWSAccountApi(restClient);
    }
}

export { BlueprintFormat, BudgetFormat, PaperSize, Projection, Theme, Rate, Currency, Period } from './common';
