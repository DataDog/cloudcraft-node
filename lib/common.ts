// Unless explicitly stated otherwise all files in this repository are licensed under the Apache-2.0 License.
// This product includes software developed at Datadog (https://www.datadoghq.com/).
// Copyright 2024-Present Datadog, Inc.

export enum BlueprintFormat {
    JSON = 'json',
    SVG = 'svg',
    PNG = 'png',
    WebP = 'webp',
    PDF = 'pdf',
    mxGraph = 'mxGraph',
}

export enum BudgetFormat {
    CSV = 'csv',
    XLSX = 'xlsx',
}

export enum PaperSize {
    Letter = 'Letter',
    Legal = 'Legal',
    Tabloid = 'Tabloid',
    Ledger = 'Ledger',
    A0 = 'A0',
    A1 = 'A1',
    A2 = 'A2',
    A3 = 'A3',
    A4 = 'A4',
    A5 = 'A5',
}

export enum Projection {
    Isometric = 'isometric',
    TwoDimensional = '2d',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export enum Rate {
    Stated = 'stated',
    Effective = 'effective',
}

export enum Currency {
    USD = 'USD',
    AUD = 'AUD',
    CHF = 'CHF',
    CKK = 'CKK',
    EUR = 'EUR',
    GBP = 'GBP',
    HKD = 'HKD',
    JPY = 'JPY',
    NOK = 'NOK',
    NZD = 'NZD',
    SEK = 'SEK',
    ZAR = 'ZAR',
}

export enum Period {
    Hourly = 'h',
    Daily = 'd',
    Weekly = 'w',
    Monthly = 'm',
    Yearly = 'y',
}
