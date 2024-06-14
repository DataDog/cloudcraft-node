import crypto from 'node:crypto';

/**
 * generateUniqueName() returns an unique string that can be used as a resource
 * name for Cloudcraft. The string will be in the format of "Node SDK Test
 * (N)", where N is a random 16 character string.
 *
 * @returns An unique string.
 */
export default function generateUniqueName(): string {
    const randomString = crypto.randomBytes(8).toString('hex');
    return `Node SDK Test (${randomString})`;
}
