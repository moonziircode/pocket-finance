export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHYFmxVNwq3Lf5whBYFgFp_y5yAPZ8cEknfS7i9hDxZdXUwlL-9wYUVWzj6m89ZGsn/exec';
    const API_SECRET = 'POCKET_FINANCE_SECRET_2026';

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const bodyToSend = {
      action: 'deleteTransaction',
      key: API_SECRET,
      secret: API_SECRET,
      transactionId: payload.transactionId || payload.id,
      id: payload.transactionId || payload.id
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyToSend),
      redirect: 'follow'
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Gagal menghapus transaksi' });
  }
}
