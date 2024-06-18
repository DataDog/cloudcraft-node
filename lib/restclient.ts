// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

import { ClientConfig } from './clientconfig';
import CloudcraftError from './error';

export interface RestResponse {
    readonly status: number;
    readonly error?: string;
    readonly data?: any;
}

class CloudcraftRestClient {
    private readonly apiKey: string;

    private readonly config: ClientConfig;

    constructor(apiKey: string, config: ClientConfig) {
        this.apiKey = apiKey;
        this.config = config;
    }

    private get baseUrl() {
        const { protocol, host, port, basePath } = this.config;

        return `${protocol}://${host}:${port.toString()}${basePath}`;
    }

    async get(url: string): Promise<RestResponse> {
        let response;
        try {
            response = await fetch(`${this.baseUrl}/${url}`, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
        } catch (error) {
            if (error instanceof TypeError) {
                throw new CloudcraftError(error.message);
            }

            throw error;
        }

        let data;
        let error;
        const contentType = response.headers.get('content-type')?.split(';')[0];
        switch (contentType) {
            case 'application/json': {
                data = await response.json();
                error = data.error;
                break;
            }
            case 'application/xml':
            case 'image/svg+xml':
            case 'text/csv': {
                data = await response.text();
                break;
            }
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'image/png':
            case 'application/pdf': {
                data = await response.arrayBuffer();
                break;
            }
            default: {
                const actualContentType = contentType ?? 'unknown';

                throw new CloudcraftError(`Unsupported content type ${actualContentType}`, response.status);
            }
        }

        if (!response.ok) {
            throw new CloudcraftError(data.error, response.status);
        }

        return {
            status: response.status,
            error,
            data,
        };
    }

    async post(url: string, body: object): Promise<RestResponse> {
        let response;
        try {
            response = await fetch(`${this.baseUrl}/${url}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(body),
            });
        } catch (error) {
            if (error instanceof TypeError) {
                throw new CloudcraftError(error.message);
            }

            throw error;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new CloudcraftError(data.error, response.status);
        }

        return {
            status: response.status,
            error: data.error,
            data,
        };
    }

    async put(url: string, body: object): Promise<RestResponse> {
        let response;
        try {
            response = await fetch(`${this.baseUrl}/${url}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                method: 'PUT',
                body: JSON.stringify(body),
            });
        } catch (error) {
            if (error instanceof TypeError) {
                throw new CloudcraftError(error.message);
            }

            throw error;
        }

        let data;
        let error;
        const contentType = response.headers.get('content-type')?.split(';')[0];
        if (contentType === 'application/json') {
            data = await response.json();
            error = data.error;
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new CloudcraftError(data, response.status);
        }

        return {
            status: response.status,
            error,
            data,
        };
    }

    async delete(url: string): Promise<RestResponse> {
        let response;
        try {
            response = await fetch(`${this.baseUrl}/${url}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                method: 'DELETE',
            });
        } catch (error) {
            if (error instanceof TypeError) {
                throw new CloudcraftError(error.message);
            }

            throw error;
        }

        const data = await response.text();

        if (!response.ok) {
            throw new CloudcraftError(data, response.status);
        }

        return {
            status: response.status,
            error: data,
        };
    }

    static generateUrl(path: string, queryParameters: any): string {
        if (queryParameters) {
            const parameterArray = Object.keys(queryParameters).map(
                (key) => `${key}=${encodeURIComponent(queryParameters[key])}`,
            );
            if (parameterArray.length > 0) {
                return `${path}?${parameterArray.join('&')}`;
            }
        }
        return path;
    }
}

export default CloudcraftRestClient;
