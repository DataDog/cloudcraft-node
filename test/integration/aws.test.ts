import { AWSAccount } from '../../lib/api/awsaccount';
import { BlueprintFormat, Cloudcraft } from '../../lib/cloudcraft';
import CloudcraftError from '../../lib/error';
import generateUniqueName from './util';

jest.setTimeout(10_000);

test('test /aws endpoint', async () => {
    const client = new Cloudcraft();

    const accountName = generateUniqueName();
    const giveAccount = {
        name: accountName,
        roleArn: process.env.CLOUDCRAFT_AWS_ROLE_ARN,
    };

    const account = await client.awsAccount.create(giveAccount);

    expect(account.id).toHaveLength(36);
    expect(account.name).toEqual(giveAccount.name);
    expect(account.roleArn).toEqual(giveAccount.roleArn);

    let accounts = await client.awsAccount.list();

    expect(accounts.length).toBeGreaterThan(0);

    // eslint-disable-next-line no-restricted-syntax
    for (const accont of accounts) {
        expect(accont.id).toHaveLength(36);
        expect(accont.name).toBeDefined();
        expect(accont.roleArn).toBeDefined();
    }

    account.name = `${account.name || 'Undefined'} (Updated)`;

    await client.awsAccount.update(account);

    accounts = await client.awsAccount.list();

    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts.find((a) => a.id === account.id)?.name).toEqual(account.name);

    const snapshot = (await client.awsAccount.snapshot(account.id, 'us-east-1', BlueprintFormat.SVG, {
        width: 30,
        height: 20,
        grid: true,
        transparent: true,
    })) as string;

    expect(typeof snapshot).toEqual('string');
    expect(snapshot.length).toBeGreaterThan(0);
    expect(snapshot).toContain('<svg');
    expect(snapshot).toMatch(/width="30"/);
    expect(snapshot).toMatch(/height="20"/);
    expect(snapshot).toMatch(/fill="url\(#gridPatternMajor\)"/);
    expect(snapshot).toMatch(/fill="none" id="interactionLayer"/);

    await client.awsAccount.delete(account.id);

    const iamParameters = await client.awsAccount.iamParameters();

    expect(iamParameters.accountId).toBeDefined();
    expect(iamParameters.externalId).toBeDefined();
    expect(iamParameters.awsConsoleUrl).toBeDefined();
});

test('get AWS create account invalid arn error', async () => {
    const client = new Cloudcraft();

    const accountName = generateUniqueName();
    const giveAccount = {
        name: accountName,
        roleArn: 'arn:invalid-arn',
    };

    try {
        await client.awsAccount.create(giveAccount);
        throw new Error('Expected error, but got none');
    } catch (_error) {
        expect(_error).toBeInstanceOf(CloudcraftError);

        const error = _error as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});

test('get AWS update account not found error', async () => {
    const client = new Cloudcraft();

    const accountName = generateUniqueName();
    const giveAccount = {
        id: 'bda0b4ad-6d0a-4765-b77c-131734e21542',
        name: accountName,
        roleArn: process.env.CLOUDCRAFT_AWS_ROLE_ARN,
    } as AWSAccount;

    try {
        await client.awsAccount.update(giveAccount);
        throw new Error('Expected error, but got none');
    } catch (_error) {
        expect(_error).toBeInstanceOf(CloudcraftError);

        const error = _error as CloudcraftError;

        expect(error.status).toEqual(404);
        expect(error.message).toBeDefined();
    }
});
