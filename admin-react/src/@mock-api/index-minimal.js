// Minimal mock API - just pass through to real backend
import mock from './mock';

// Allow all requests to pass through to real backend
mock.onAny().passThrough();

export default mock;
