import { withTimeout } from './with-timeout.js';

describe('withTimeout', () => {
  it('resolves with the operation result when it settles in time', async () => {
    await expect(
      withTimeout(Promise.resolve('ok'), 50, 'timed out'),
    ).resolves.toBe('ok');
  });

  it('propagates the operation failure when it settles in time', async () => {
    await expect(
      withTimeout(Promise.reject(new Error('boom')), 50, 'timed out'),
    ).rejects.toThrow('boom');
  });

  it('rejects with the timeout message when the operation hangs', async () => {
    const hanging = new Promise<never>(() => {
      // Never settles: the timeout must be the only way out.
    });

    await expect(
      withTimeout(hanging, 20, 'Redis did not respond in time'),
    ).rejects.toThrow('Redis did not respond in time');
  });
});
