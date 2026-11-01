export default async function handler(req: any, res: any) {
  try {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHYFmxVNwq3Lf5whBYFgFp_y5yAPZ8cEknfS7i9hDxZdXUwlL-9wYUVWzj6m89ZGsn/exec';
    const API_SECRET = 'POCKET_FINANCE_SECRET_2026';

    const limit = req.query?.limit || '10';
    const url = `${APPS_SCRIPT_URL}?action=recent&limit=${encodeURIComponent(limit)}&secret=${encodeURIComponent(API_SECRET)}`;
    const response = await fetch(url, { redirect: 'follow' });
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=15');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Gagal mengambil riwayat transaksi' });
  }
}
