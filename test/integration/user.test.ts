import { Cloudcraft } from '../../lib/cloudcraft';

test('test /user endpoint', async () => {
    const client = new Cloudcraft();
    const user = await client.user.me();

    expect(user.id).toHaveLength(36);
    expect(user.name).toBeDefined();
    expect(user.settings).toBeInstanceOf(Object);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.accessedAt).toBeInstanceOf(Date);
});
