// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

export default class CloudcraftError extends Error {
    readonly message: string;

    readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);

        this.status = status;
        this.message = message;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CloudcraftError.prototype);
    }
}
