import { APPS_SCRIPT_URL, API_SECRET } from './_config';

export default async function handler(req: any, res: any) {
  try {
    const url = `${APPS_SCRIPT_URL}?action=metadata&secret=${encodeURIComponent(API_SECRET)}`;
    const response = await fetch(url, { 
      redirect: 'follow',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Gagal menghubungi Apps Script' });
  }
}
