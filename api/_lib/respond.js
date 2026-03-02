// Response helper functions for API endpoints
export const ok       = (res, data, status = 200) => res.status(status).json({ success: true,  ...data });
export const fail     = (res, message, status = 400) => res.status(status).json({ success: false, error: message });
export const notFound = (res) => fail(res, 'Not found', 404);
export const denied   = (res) => fail(res, 'Unauthorized', 401);
