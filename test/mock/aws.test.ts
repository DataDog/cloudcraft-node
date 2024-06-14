import { promises as fs } from 'node:fs';
import { http, HttpResponse, JsonBodyType } from 'msw';
import { setupServer } from 'msw/node';
import { Cloudcraft, BlueprintFormat } from '../../lib/cloudcraft';
import CloudcraftError from '../../lib/error';

const testAccountId = '0f1a4e20-a887-4467-a37b-1bc7a3deb9a9';
const testNotFoundAccountId = '31cf32f5-7241-4588-afdf-e3a8d4b0d50c';
const testInvalidAccountId = 'invalid-account-id';
const testInvalidRegion = 'invalid-region';
const testInvalidFileFormat = 'invalid-file-format';
const testApiKey = 'api-key';
const testUnauthorizedApiKey = 'unauthorized-api-key';
const testExpectedError = 'Expected error to be thrown';
const testInternalServerError = 'Internal server error';
const testInternalServerReason = 'internal_server_error';

const awsHandlers = [
    http.get('https://api.cloudcraft.co/aws/account', async () => {
        try {
            const data = await fs.readFile('test/mock/testdata/aws/list-valid.json', 'utf8');
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
    http.get('https://api.cloudcraft.co/aws/account/iamParameters', async () => {
        try {
            const data = await fs.readFile('test/mock/testdata/aws/iam-parameters-valid.json', 'utf8');
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
    http.get('https://api.cloudcraft.co/aws/account/:id/:region/:format', async ({ params }) => {
        const id = params.id as string;
        const region = params.region as string;
        const format = params.format as string;

        if (id === testNotFoundAccountId) {
            return HttpResponse.json(
                {
                    error: 'AwsAccount not found',
                    reason: 'not_found',
                    code: 404,
                },
                { status: 404 },
            );
        }

        if (id === testInvalidAccountId) {
            return HttpResponse.json(
                {
                    error: 'Invalid parameter format: accountId',
                    reason: 'invalid_property',
                    code: 400,
                },
                { status: 400 },
            );
        }

        if (region === testInvalidRegion) {
            return HttpResponse.json(
                {
                    error: 'Invalid region parameter: invalid-region',
                    reason: 'invalid_parameter',
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
            const data = await fs.readFile(`test/mock/testdata/aws/snapshot-valid.png`, 'binary');

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
    http.delete('https://api.cloudcraft.co/aws/account/:id', ({ params, request }) => {
        const { id } = params;
        const accountId = id as string;
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

        if (accountId === testNotFoundAccountId) {
            return HttpResponse.json(
                {
                    error: 'AwsAccount not found',
                    reason: 'not_found',
                    code: 404,
                },
                { status: 404 },
            );
        }

        if (accountId === testInvalidAccountId) {
            return HttpResponse.json(
                {
                    error: 'Invalid parameter format: accountId',
                    reason: 'invalid_property',
                    code: 400,
                },
                { status: 400 },
            );
        }

        return HttpResponse.json(undefined, { status: 204 });
    }),
];

const awsServer = setupServer(...awsHandlers);

beforeAll(() => {
    awsServer.listen();
});
afterEach(() => {
    awsServer.resetHandlers();
});
afterAll(() => {
    awsServer.close();
});

test('successfully list AWS accounts', async () => {
    const client = new Cloudcraft(testApiKey);
    const accounts = await client.awsAccount.list();

    expect(accounts).toBeInstanceOf(Array);

    // eslint-disable-next-line no-restricted-syntax
    for (const account of accounts) {
        expect(account.id).toHaveLength(36);
        expect(account.name).toBeDefined();
    }
});

test('successfully get IAM parameters', async () => {
    const client = new Cloudcraft(testApiKey);
    const iamParameters = await client.awsAccount.iamParameters();

    expect(iamParameters).toBeInstanceOf(Object);
    expect(iamParameters.accountId).toBeDefined();
    expect(iamParameters.externalId).toBeDefined();
    expect(iamParameters.awsConsoleUrl).toBeDefined();
});

test('successfully delete AWS account', async () => {
    const client = new Cloudcraft(testApiKey);
    await client.awsAccount.delete(testAccountId);
});

test('get unauthorized delete AWS account error', async () => {
    const client = new Cloudcraft(testUnauthorizedApiKey);

    try {
        await client.awsAccount.delete(testAccountId);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toBe(403);
        expect(error.message).toBeDefined();
    }
});

test('get delete AWS account not found error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.awsAccount.delete(testNotFoundAccountId);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toBe(404);
        expect(error.message).toBeDefined();
    }
});

test('get delete AWS account invalid id error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.awsAccount.delete(testInvalidAccountId);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toBe(400);
        expect(error.message).toBeDefined();
    }
});

test('successfully get AWS account snapshot', async () => {
    const client = new Cloudcraft(testApiKey);
    const snapshot = await client.awsAccount.snapshot(testAccountId, 'us-east-1', BlueprintFormat.PNG);

    expect(typeof snapshot).toBe('object');
    expect(snapshot).toBeInstanceOf(ArrayBuffer);
});

test('get AWS snapshot account not found error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.awsAccount.snapshot(testNotFoundAccountId, 'us-east-1', BlueprintFormat.PNG);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toBe(404);
        expect(error.message).toBeDefined();
    }
});

test('get AWS snapshot account invalid id error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.awsAccount.snapshot(testInvalidAccountId, 'us-east-1', BlueprintFormat.PNG);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toBe(400);
        expect(error.message).toBeDefined();
    }
});

test('get AWS snapshot invalid region error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.awsAccount.snapshot(testAccountId, testInvalidRegion, BlueprintFormat.PNG);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toBe(400);
        expect(error.message).toBeDefined();
    }
});

test('get AWS snapshot invalid file format error', async () => {
    const client = new Cloudcraft(testApiKey);

    try {
        await client.awsAccount.snapshot(testAccountId, 'us-east-1', testInvalidFileFormat as BlueprintFormat);
        throw new Error(testExpectedError);
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toBe(400);
        expect(error.message).toBeDefined();
    }
});
