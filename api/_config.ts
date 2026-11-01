const rawUrl = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyHYFmxVNwq3Lf5whBYFgFp_y5yAPZ8cEknfS7i9hDxZdXUwlL-9wYUVWzj6m89ZGsn/exec';
const match = rawUrl.match(/(https:\/\/script\.google\.com\/macros\/s\/[^\/]+\/exec)/);

export const APPS_SCRIPT_URL = match ? match[1] : 'https://script.google.com/macros/s/AKfycbyHYFmxVNwq3Lf5whBYFgFp_y5yAPZ8cEknfS7i9hDxZdXUwlL-9wYUVWzj6m89ZGsn/exec';
export const API_SECRET = (process.env.API_SECRET || 'POCKET_FINANCE_SECRET_2026').trim();
