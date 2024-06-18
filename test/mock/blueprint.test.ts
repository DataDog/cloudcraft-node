import { promises as fs } from 'node:fs';
import { http, HttpResponse, JsonBodyType } from 'msw';
import { setupServer } from 'msw/node';
import { Cloudcraft, BlueprintFormat, BudgetFormat } from '../../lib/cloudcraft';
import CloudcraftError from '../../lib/error';

const testBlueprintName = 'Test blueprint';
const testBlueprintId = '0f1a4e20-a887-4467-a37b-1bc7a3deb9a9';
const testNotFoundBlueprintId = '31cf32f5-7241-4588-afdf-e3a8d4b0d50c';
const testInvalidBlueprintId = 'invalid-blueprint-id';
const testInvalidFileFormat = 'invalid-file-format';
const testApiKey = 'api-key';
const testUnauthorizedApiKey = 'unauthorized-api-key';
const testExpectedError = 'Expected error to be thrown';
const testInternalServerError = 'Internal server error';
const testInternalServerReason = 'internal_server_error';
const testBlueprintNotFoundError = 'Blueprint not found';
const testInvalidParameterBlueprintIdError = 'Invalid parameter format: blueprintId';

const blueprintHandlers = [
    http.get('https://api.cloudcraft.co/blueprint', async () => {
        try {
            const data = await fs.readFile('test/mock/testdata/blueprint/list-valid.json', 'utf8');
            const parsedData: unknown = JSON.parse(data);

            return HttpResponse.json(parsedData as JsonBodyType);
        } catch {
            return HttpResponse.json(
                {
                    error: testInternalServerError,
                    reason: testInternalServerReason,
                    code: 500,
                },
                { status: 500 },
            );
        }
    }),
    http.get('https://api.cloudcraft.co/blueprint/:id', async ({ params }) => {
        const { id } = params;
        const blueprintId = id as string;

        if (blueprintId === testNotFoundBlueprintId) {
            return HttpResponse.json(
                {
                    error: testBlueprintNotFoundError,
                    reason: 'not_found',
                    code: 404,
                },
                { status: 404 },
            );
        }

        if (blueprintId === testInvalidBlueprintId) {
            return HttpResponse.json(
                {
                    error: testInvalidParameterBlueprintIdError,
                    reason: 'invalid_property',
                    code: 400,
                },
                { status: 400 },
            );
        }

        try {
            const data = await fs.readFile('test/mock/testdata/blueprint/get-valid.json', 'utf8');
            const parsedData: unknown = JSON.parse(data);

            return HttpResponse.json(parsedData as JsonBodyType);
        } catch {
            return HttpResponse.json(
                {
                    error: testInternalServerError,
                    reason: testInternalServerReason,
                    code: 500,
                },
                { status: 500 },
            );
        }
    }),
    http.get('https://api.cloudcraft.co/blueprint/:id/:format', async ({ params }) => {
        const id = params.id as string;
        const format = params.format as string;

        if (id === testNotFoundBlueprintId) {
            return HttpResponse.json(
                {
                    error: testBlueprintNotFoundError,
                    reason: 'not_found',
                    code: 404,
                },
                { status: 404 },
            );
        }

        if (id === testInvalidBlueprintId) {
            return HttpResponse.json(
                {
                    error: testInvalidParameterBlueprintIdError,
                    reason: 'invalid_property',
                    code: 400,
                },
                { status: 400 },
            );
        }

        if (format === testInvalidFileFormat) {
            return HttpResponse.json(
                {
                    error: 'Invalid parameter: fileFormat. Must be one of: json, svg, png, webp, pdf, mxGraph',
                    reason: 'invalid_parameter',
                    code: 400,
                },
                { status: 400 },
            );
        }

        try {
            const data = await fs.readFile('test/mock/testdata/blueprint/export-image-valid.png', 'binary');

            return new HttpResponse(data, {
                status: 200,
                headers: {
                    'Content-Type': 'image/png',
                },
            });
        } catch {
            return HttpResponse.json(
                {
                    error: testInternalServerError,
                    reason: testInternalServerReason,
                    code: 500,
                },
                { status: 500 },
            );
        }
    }),
    http.get('https://api.cloudcraft.co/blueprint/:id/budget/:format', async ({ params }) => {
        const id = params.id as string;
        const format = params.format as string;

        if (id === testNotFoundBlueprintId) {
            return HttpResponse.json(
                {
                    error: testBlueprintNotFoundError,
                    reason: 'not_found',
                    code: 404,
                },
                { status: 404 },
            );
        }

        if (id === testInvalidBlueprintId) {
            return HttpResponse.json(
                {
                    error: testInvalidParameterBlueprintIdError,
                    reason: 'invalid_property',
                    code: 400,
                },
                { status: 400 },
            );
        }

        if (format === testInvalidFileFormat) {
            return HttpResponse.json(
                {
                    error: 'Invalid parameter: format. Must be one of: csv, xlsx',
                    reason: 'invalid_parameter',
                    code: 400,
                },
                { status: 400 },
            );
        }

        try {
            const data = await fs.readFile('test/mock/testdata/blueprint/export-budget-valid.csv', 'binary');

            return new HttpResponse(data, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                },
            });
        } catch {
            return HttpResponse.json(
                {
                    error: testInternalServerError,
                    reason: testInternalServerReason,
                    code: 500,
                },
                { status: 500 },
            );
        }
    }),
    http.delete('https://api.cloudcraft.co/blueprint/:id', ({ params, request }) => {
        const { id } = params;
        const blueprintId = id as string;
        const apiKey = request.headers.get('Authorization');

        if (apiKey === `Bearer ${testUnauthorizedApiKey}`) {
            return HttpResponse.json(
                {
                    error: 'API key does not have sufficient permissions',
                    reason: 'insufficient_privileges',
                    code: 403,
                },
                { status: 403 },
            );
        }

        if (blueprintId === testNotFoundBlueprintId) {
            return HttpResponse.json(
                {
                    error: testBlueprintNotFoundError,
                    reason: 'not_found',
                    code: 404,
                },
                { status: 404 },
            );
        }

        if (blueprintId === testInvalidBlueprintId) {
            return HttpResponse.json(
                {
                    error: testInvalidParameterBlueprintIdError,
                    reason: 'invalid_property',
                    code: 400,
                },
                { status: 400 },
            );
        }

        return HttpResponse.json(undefined, { status: 204 });
    }),
];

const blueprintServer = setupServer(...blueprintHandlers);

beforeAll(() => {
    blueprintServer.listen();
});
afterEach(() => {
    blueprintServer.resetHandlers();
});
afterAll(() => {
    blueprintServer.close();
});

test('successfully list blueprints', async () => {
    const client = new Cloudcraft(testApiKey);
    const blueprints = await client.blueprint.list();

    // eslint-disable-next-line no-restricted-syntax
    for (const blueprint of blueprints) {
        expect(blueprint.id).toHaveLength(36);
        expect(blueprint.name).toBeDefined();
    }
});

test('successfully get blueprint', async () => {
    const client = new Cloudcraft(testApiKey);
    const blueprint = await client.blueprint.get(testBlueprintId);

    expect(blueprint.id).toEqual(testBlueprintId);
    expect(blueprint.data.name).toEqual(testBlueprintName);
});

test('get blueprint not found error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.blueprint.get(testNotFoundBlueprintId);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(404);
        expect(error.message).toBeDefined();
    }
});

test('get blueprint invalid id error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.blueprint.get(testInvalidBlueprintId);
        throw new Error('Expected error to be thrown');
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});

test('successfully delete blueprint', async () => {
    const client = new Cloudcraft(testApiKey);
    await client.blueprint.delete(testBlueprintId);
});

test('get unauthorized delete blueprint error', async () => {
    const client = new Cloudcraft(testUnauthorizedApiKey);

    try {
        await client.blueprint.delete(testBlueprintId);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(403);
        expect(error.message).toBeDefined();
    }
});

test('get delete blueprint not found error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.blueprint.delete(testNotFoundBlueprintId);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(404);
        expect(error.message).toBeDefined();
    }
});

test('get delete blueprint invalid id error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.blueprint.delete(testInvalidBlueprintId);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});

test('successfully export blueprint image', async () => {
    const client = new Cloudcraft(testApiKey);
    const image = await client.blueprint.export(testBlueprintId, BlueprintFormat.PNG);

    expect(typeof image).toEqual('object');
    expect(image).toBeInstanceOf(ArrayBuffer);
});

test('get export image blueprint not found error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.blueprint.export(testNotFoundBlueprintId, BlueprintFormat.PNG);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(404);
        expect(error.message).toBeDefined();
    }
});

test('get export image blueprint invalid id error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.blueprint.export(testInvalidBlueprintId, BlueprintFormat.PNG);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});

test('get export image blueprint invalid file format error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.blueprint.export(testBlueprintId, testInvalidFileFormat as BlueprintFormat);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});

test('successfully export blueprint budget', async () => {
    const client = new Cloudcraft(testApiKey);
    const budget = await client.budget.export(testBlueprintId, BudgetFormat.CSV);

    expect(typeof budget).toEqual('string');
    expect(budget).toMatch(/category,.*/);
});

test('get export budget blueprint not found error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.budget.export(testNotFoundBlueprintId, BudgetFormat.CSV);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(404);
        expect(error.message).toBeDefined();
    }
});

test('get export budget blueprint invalid id error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.budget.export(testInvalidBlueprintId, BudgetFormat.CSV);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});

test('get export budget blueprint invalid file format error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.budget.export(testBlueprintId, testInvalidFileFormat as BudgetFormat);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});
