# Tests

This directory contains both mock tests and tests against the live
[Cloudcraft API](https://docs.datadoghq.com/cloudcraft/api/).

Tests against the live API are optional. You can run them manually by creating an `.env` file with the required
environment variables and invoking `yarn`.

The `.env` should be located at [../](../) and look like this:

```
export CLOUDCRAFT_API_KEY=XXXX
export CLOUDCRAFT_AWS_ROLE_ARN=XXXX
```

Then you can run the integration tests with:

```bash
yarn test:integration
```

Keep in mind that the integration tests will not run if the `.env` file is not present. Also, tests against the live API
will create and delete resources in your Cloudcraft account.

The mock tests can be run with `yarn test` and do not require any environment variables.
