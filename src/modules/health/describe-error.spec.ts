import { describeError } from './describe-error.js';

describe('describeError', () => {
  it('returns the message of a plain error', () => {
    expect(describeError(new Error('Redis did not respond in time'))).toBe(
      'Redis did not respond in time',
    );
  });

  it('returns the deepest message of a wrapped error', () => {
    const error = new Error('Failed query: select 1', {
      cause: new Error(
        'password authentication failed for user "url_shortener"',
      ),
    });

    expect(describeError(error)).toBe(
      'password authentication failed for user "url_shortener"',
    );
  });

  it('unwraps the empty-message AggregateError pg-pool uses for connection failures', () => {
    const error = new Error('Failed query: select 1', {
      cause: new AggregateError([new Error('connect ECONNREFUSED ::1:5433')]),
    });

    expect(describeError(error)).toBe('connect ECONNREFUSED ::1:5433');
  });

  it('keeps the wrapper message when the cause has none', () => {
    const error = new Error('Failed query: select 1', {
      cause: new AggregateError([]),
    });

    expect(describeError(error)).toBe('Failed query: select 1');
  });

  it('stops walking a self-referencing cause chain', () => {
    const error = new Error('boom');
    error.cause = error;

    expect(describeError(error)).toBe('boom');
  });

  it('falls back when the thrown value is not an error', () => {
    expect(describeError('something odd')).toBe('Unknown error');
    expect(describeError(undefined)).toBe('Unknown error');
  });
});
