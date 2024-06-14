import { Cloudcraft } from '../../lib/cloudcraft';
import { ClientConfig } from '../../lib/clientconfig';

function clearEnvironment() {
    delete process.env.CLOUDCRAFT_HOST;
    delete process.env.CLOUDCRAFT_PORT;
    delete process.env.CLOUDCRAFT_PROTOCOL;
    delete process.env.CLOUDCRAFT_BASE_PATH;
}

test('construct client with default config', () => {
    clearEnvironment();

    const client = new Cloudcraft('test_key');

    expect(client.config.host).toBe('api.cloudcraft.co');
    expect(client.config.port).toBe(443);
    expect(client.config.basePath).toBe('');
});

test('construct client with partial custom config', () => {
    const client = new Cloudcraft('test_key', {
        host: 'customhost',
    });

    expect(client.config.host).toBe('customhost');
    expect(client.config.port).toBe(443);
});

test('construct client with complete custom config', () => {
    const config: ClientConfig = {
        maxNetworkRetries: 1,
        host: 'customhost',
        port: 123,
        timeout: 999,
        protocol: 'http',
        basePath: '/custom',
    };
    const client = new Cloudcraft('test_key', config);

    expect(client.config).toStrictEqual(config);
});
