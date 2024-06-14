// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

import { Currency, Period, Rate, BudgetFormat } from '../common';
import CloudcraftRestClient from '../restclient';

export interface BudgetExportOptions {
    currency: Currency;
    period: Period;
    rate: Rate;
}

class CloudcraftBudgetApi {
    private client: CloudcraftRestClient;

    constructor(client: CloudcraftRestClient) {
        this.client = client;
    }

    async export(
        blueprintId: string,
        format: BudgetFormat,
        options?: Partial<BudgetExportOptions>,
    ): Promise<string | ArrayBuffer> {
        const response = await this.client.get(
            CloudcraftRestClient.generateUrl(`blueprint/${blueprintId}/budget/${format}`, options),
        );

        return response.data;
    }
}

export default CloudcraftBudgetApi;
