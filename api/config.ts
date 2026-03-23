import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { randomBytes } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'POST') {
        const id = randomBytes(4).toString('hex');
        const { data } = req.body;

        if (!data) return res.status(400).json({ error: 'No data provided' });

        await kv.set(`config:${id}`, data);
        
        const fullUrl = `https://${req.headers.host}/api/config?id=${id}`;
        return res.status(200).json({ url: fullUrl, id: id });
    }

    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id) return res.status(400).send('Missing ID');

        const data = await kv.get(`config:${id as string}`);
        if (!data) return res.status(404).send('Config not found or expired');
        
        return res.status(200).send(data);
    }
}
