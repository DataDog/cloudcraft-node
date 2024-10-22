// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

export interface ClientConfig {
    readonly maxNetworkRetries: number;
    readonly timeout: number;
    readonly host: string;
    readonly port: number;
    readonly protocol: string;
    readonly basePath: string;
}
