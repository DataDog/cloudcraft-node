# Cloudcraft Node.js Library

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache2.0-yellow.svg)](LICENSE.md)
[![Build Status](https://github.com/DataDog/cloudcraft-node/actions/workflows/ci.yml/badge.svg?branch=trunk)](https://github.com/DataDog/cloudcraft-node/actions?query=branch%3Atrunk)

![Cloudcraft diagram](https://static.cloudcraft.co/sdk/cloudcraft-sdk-example-1.svg)

Visualize your cloud architecture with Cloudcraft by Datadog,
[the best way to create smart AWS and Azure diagrams](https://www.cloudcraft.co/).

Cloudcraft supports both manual and programmatic diagramming, as well as automatic reverse engineering of existing cloud
environments into beautiful system architecture diagrams.

This `cloudcraft` Node library provides an easy-to-use native Node SDK for interacting with
[the Cloudcraft API](https://docs.datadoghq.com/cloudcraft/api/).

Use case examples:

-   Snapshot and visually compare your live AWS or Azure environment before and after a deployment, in your app or as
    part of your automated CI pipeline
-   Download an inventory of all your cloud resources from a linked account as JSON
-   Write a converter from a third party data format to Cloudcraft diagrams
-   Backup, export & import your Cloudcraft data
-   Programmatically create Cloudcraft diagrams

This SDK requires a [Cloudcraft API key](https://docs.datadoghq.com/cloudcraft/getting-started/generate-api-key/) to
use. A [free trial of Cloudcraft Pro](https://www.cloudcraft.co/pricing) with API access is available.

## Requirements

Node 22 or higher.

## Installation

To install `cloudcraft`, run:

```console
npm install cloudcraft --save
```

Or, if you prefer `yarn`:

```console
yarn add cloudcraft
```

## Usage

The API is accessed through the `Cloudcraft` class. An API key available through the Cloudcraft user interface is
required when instantiating `Cloudcraft`. It can be passed to the class as an argument or through the
`CLOUDCRAFT_API_KEY` environment variable:

```js
import { Cloudcraft } from 'Cloudcraft';

const client = new Cloudcraft('api_key...');

(async () => {
    const user = await client.user.me();

    console.log(user.name);
})();
```

### Configuration

#### Initialize with config object

The package can be initialized with several options:

```js
import { Cloudcraft } from 'Cloudcraft';

const client = new Cloudcraft('api_key...', {
    host: 'customhost',
});
```

| Option              | Default               | Description                                      |
| ------------------- | --------------------- | ------------------------------------------------ |
| `maxNetworkRetries` | 10                    | The amount of times a request should be retried. |
| `timeout`           | 80_000                | Maximum time each request can take in ms.        |
| `host`              | `'api.cloudcraft.co'` | Host that requests are made to.                  |
| `port`              | 443                   | Port that requests are made to.                  |
| `protocol`          | `'https'`             | `'https'` or `'http'`.                           |

### Blueprints

#### List my blueprints

```js
const client = new Cloudcraft();

const blueprints = await client.blueprint.list();
```

#### Retrieve blueprint

```js
const client = new Cloudcraft();

const blueprint = await client.blueprint.get('id');
```

#### Create blueprint

```js
const client = new Cloudcraft();

const blueprint = await client.blueprint.create({
    data: {
        grid: 'standard',
        name: 'My new blueprint',
    },
});
```

#### Update blueprint

```js
const client = new Cloudcraft();

const blueprint = await client.blueprint.get('id');
blueprint.data.name = 'My updated blueprint';

await client.blueprint.update(blueprint);
```

#### Export blueprint as image

```js
const client = new Cloudcraft();

const blueprint = await client.blueprint.get('id');
const svg = (await client.blueprint.export(
  blueprint.id,
  Cloudcraft.BlueprintFormat.SVG
)) as string;
```

#### Delete blueprint

```js
const client = new Cloudcraft();

const blueprint = await client.blueprint.get('id');
await client.blueprint.delete(blueprint.id);
```

### AWS Accounts

#### Add AWS account

```js
const client = new Cloudcraft();

const awsAccount = await client.awsAccount.create(
    {
        name: 'Test account',
        roleArn: 'arn:...',
    },
    'us-east-1',
);
```

#### List my AWS accounts

```js
const client = new Cloudcraft();

const awsAccounts = await client.awsAccount.list();
```

#### Snapshot AWS account

```js
const client = new Cloudcraft();

const awsAccounts = await client.awsAccount.list();
const awsAccount = awsAccounts.find(
  (awsAccount) => awsAccount.id === 'id'
) as any;
const svg = (await client.awsAccount.snapshot(
  awsAccount.id,
  'us-east-1',
  Cloudcraft.BlueprintFormat.SVG
)) as string;
```

#### Update AWS account

```js
const client = new Cloudcraft();

const awsAccounts = await client.awsAccount.list();
const awsAccount = awsAccounts.find(
  (awsAccount) => awsAccount.id === 'id'
) as any;
awsAccount.name = 'Updated account';

const updatedAWSAccount = await client.awsAccount.update(awsAccount);
```

#### Delete AWS account

```js
const client = new Cloudcraft();

const awsAccounts = await client.awsAccount.list();
const awsAccount = awsAccounts.find(
  (awsAccount) => awsAccount.id === 'id'
) as any;
await client.awsAccount.delete(awsAccount.id);
```

#### Get my AWS IAM Role parameters

```js
const client = new Cloudcraft();

const iamParameters = await client.awsAccount.iamParameters();
```

### Budgets

#### Export budget for a blueprint

```js
const client = new Cloudcraft();

const blueprint = await client.blueprint.create(testBlueprint);

const csv = (await client.budget.export(
  blueprint.id,
  Cloudcraft.BudgetFormat.CSV
)) as string;
```

### Users

#### Get my information

```js
const client = new Cloudcraft();

const user = await client.user.me();
```

## Contributing

Anyone can help make `cloudcraft` better. Check out [the contribution guidelines](CONTRIBUTING.md) for more information.

---

Released under the [Apache-2.0 License](LICENSE.md).
