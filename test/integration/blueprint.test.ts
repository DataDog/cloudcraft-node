import { BlueprintFormat, BudgetFormat, Cloudcraft } from '../../lib/cloudcraft';
import CloudcraftError from '../../lib/error';
import generateUniqueName from './util';

test('test /blueprint endpoint', async () => {
    const client = new Cloudcraft();

    const blueprintName = generateUniqueName();
    const giveBlueprint = {
        data: {
            grid: 'standard',
            name: blueprintName,
        },
    };

    const blueprint = await client.blueprint.create(giveBlueprint);

    expect(blueprint.id).toHaveLength(36);
    expect(blueprint.data).toBeInstanceOf(Object);
    expect(blueprint.data.grid).toEqual(giveBlueprint.data.grid);
    expect(blueprint.data.name).toEqual(giveBlueprint.data.name);

    const blueprints = await client.blueprint.list();

    expect(blueprints).toBeInstanceOf(Array);
    expect(blueprints.length).toBeGreaterThan(0);

    // eslint-disable-next-line no-restricted-syntax
    for (const bp of blueprints) {
        expect(bp.id).toHaveLength(36);
    }

    const newBlueprintName = `${blueprint.data.name || 'Undefined'} (Updated)`;
    blueprint.data.name = newBlueprintName;
    blueprint.data.grid = 'infinite';

    await client.blueprint.update(blueprint);

    const updatedBlueprint = await client.blueprint.get(blueprint.id);

    expect(updatedBlueprint.id).toEqual(blueprint.id);
    expect(updatedBlueprint.data.name).toEqual(newBlueprintName);
    expect(updatedBlueprint.data.grid).toEqual('infinite');

    const snapshot = (await client.blueprint.export(blueprint.id, BlueprintFormat.SVG, {
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

    const budget = (await client.budget.export(blueprint.id, BudgetFormat.CSV)) as string;

    expect(typeof budget).toEqual('string');
    expect(budget.length).toBeGreaterThan(0);
    expect(budget).toMatch(/category,.*/);

    await client.blueprint.delete(blueprint.id);

    try {
        await client.blueprint.get(blueprint.id);
        throw new Error('Expected 404 error');
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(404);
        expect(error.message).toBeDefined();
    }
});

test('get blueprint with invalid id', async () => {
    const client = new Cloudcraft();

    try {
        await client.blueprint.get('invalid-id');
        throw new Error('Expected error, but got none');
    } catch (error_) {
        expect(error_).toBeInstanceOf(CloudcraftError);

        const error = error_ as CloudcraftError;

        expect(error.status).toEqual(400);
        expect(error.message).toBeDefined();
    }
});
