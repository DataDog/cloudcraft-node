import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Cloudcraft } from '../../lib/cloudcraft';

const userHandlers = [
    http.get('https://api.cloudcraft.co/user/me', () => {
        return HttpResponse.json({
            id: 'b92570ba-8969-4e41-b6a3-3d672b44f9f5',
            name: 'TypeScript SDK',
            email: 'hi@example.com',
            settings: {
                currency: 'USD',
                firstTime: false,
            },
            createdAt: '2022-10-10T16:52:40.771Z',
            updatedAt: '2023-11-08T14:44:28.872Z',
            accessedAt: '2023-11-08T14:44:28.872Z',
        });
    }),
];

const userServer = setupServer(...userHandlers);

beforeAll(() => {
    userServer.listen();
});
afterEach(() => {
    userServer.resetHandlers();
});
afterAll(() => {
    userServer.close();
});

test('get user information', async () => {
    const client = new Cloudcraft('api-key');
    const user = await client.user.me();

    expect(user.id).toHaveLength(36);
    expect(user.name).toBeDefined();
    expect(user.settings).toBeInstanceOf(Object);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.accessedAt).toBeInstanceOf(Date);
});
