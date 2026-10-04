import { db } from './db.ts';

export const listProperties = db.prepare('SELECT * FROM properties ORDER BY id DESC');
export const getProperty = db.prepare('SELECT * FROM properties WHERE id = ?');
export const insertProperty = db.prepare(
  'INSERT INTO properties (title, type, placeId, area, price, floor, bathrooms, extra_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
);
export const updateProperty = db.prepare(`
  UPDATE properties
  SET title = ?, type = ?, placeId = ?, area= ?, price = ?, floor = ?, bathrooms = ?, extra_description = ?, updated_at = datetime('now')
  WHERE id = ?
  RETURNING *
`);
export const deleteProperty = db.prepare('DELETE FROM properties WHERE id = ?');