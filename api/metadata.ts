const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyHYFmxVNwq3Lf5whBYFgFp_y5yAPZ8cEknfS7i9hDxZdXUwlL-9wYUVWzj6m89ZGsn/exec';
const API_SECRET = process.env.API_SECRET || 'POCKET_FINANCE_SECRET_2026';

export default async function handler(req: any, res: any) {
  try {
    const url = `${APPS_SCRIPT_URL}?action=metadata&secret=${encodeURIComponent(API_SECRET)}`;
    const response = await fetch(url, { redirect: 'follow' });
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Gagal menghubungi Apps Script' });
  }
}
