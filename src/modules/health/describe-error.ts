const MAX_ERROR_DEPTH = 5;

export function describeError(error: unknown): string {
  return findDeepestMessage(error, 0) || 'Unknown error';
}

function findDeepestMessage(error: unknown, depth: number): string {
  if (depth >= MAX_ERROR_DEPTH || !(error instanceof Error)) {
    return '';
  }

  if (error instanceof AggregateError && error.errors.length > 0) {
    return findDeepestMessage(error.errors[0], depth + 1) || error.message;
  }

  return findDeepestMessage(error.cause, depth + 1) || error.message;
}
