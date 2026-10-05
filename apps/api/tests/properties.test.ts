import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory replacement for Redis, shared between the mock and the tests
const cache = vi.hoisted(() => new Map<string, unknown>());

vi.mock('../src/redis.ts', () => ({
  getCachedData: vi.fn(async (key: string) => cache.get(key) ?? null),
  setCachedData: vi.fn(async (key: string, value: unknown) => { cache.set(key, value); }),
  deleteCachedData: vi.fn(async (key: string) => { cache.delete(key); }),
}));

import { app } from '../src/app.ts';
import { db } from '../src/db.ts';

const validProperty = {
  title: 'Bright 2-bedroom apartment',
  type: 'Rent',
  price: 750,
  placeId: 'abc123',
  area: 'Nafplio, Ελλάδα',
  floor: 2,
  bathrooms: 1,
  extra_description: 'Close to the old town',
};

const changes = {
  type: 'Buy',
  price: 100000,
};


beforeEach(() => {
  db.exec('DELETE FROM properties');   // empty table
  cache.clear();                        // empty fake Redis
});


describe('GET /api/properties', () => {
  it('returns an empty list when there are no properties', async () => {
    const res = await request(app).get('/api/properties');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns the saved properties', async () => {
    await request(app).post('/api/properties').send(validProperty);

    const res = await request(app).get('/api/properties');

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject(validProperty);
  });
});

describe('POST /api/properties', () => {
  // A normal success case
  it('creates a property and returns it with an id', async () => {
    const res = await request(app).post('/api/properties').send(validProperty);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(validProperty);
    expect(res.body.id).toEqual(expect.any(Number));
  });

  // Testing a side effect: the cache gets cleared
  it('clears the cached list so the new property shows up', async () => {
    cache.set('properties_all', []);

    await request(app).post('/api/properties').send(validProperty);

    expect(cache.has('properties_all')).toBe(false);
  });

  // it.each: one test, many inputs. Each row becomes its own test
  it.each([
    ['title', { title: '' }],
    ['title', { title: 'x'.repeat(156) }],
    ['type', { type: 'Lease' }],
    ['price', { price: -1 }],
    ['placeId', { placeId: '' }],
    ['area', { area:""}],
    ['floor', { floor: 7 }],
    ['floor', { floor: 1.5 }],
    ['bathrooms', { bathrooms: 0 }],
  ])('rejects an invalid %s with 400', async (field, override) => {
    const res = await request(app)
      .post('/api/properties')
      .send({ ...validProperty, ...override });   // valid property with ONE bad field

    expect(res.status).toBe(400);
    expect(res.body[0].path).toEqual([field]);     // zod says which field failed
  });
});

describe("PUT /api/properties/:id" , ()=>{
  it("updatse type and price of a property and returns the updated object", async ()=>{
    const created = await request(app).post('/api/properties').send(validProperty);

    const updateRes = await request(app).put(`/api/properties/${created.body.id}`)
      .send({ ...validProperty, ...changes });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toMatchObject({ ...validProperty, ...changes, id: created.body.id });
  })

   it('clears the cached list to show the updated data in the UI ', async () => {
    const created = await request(app).post('/api/properties').send(validProperty);
    cache.set('properties_all', []);

    await request(app).put(`/api/properties/${created.body.id}`).send(validProperty);

    expect(cache.has('properties_all')).toBe(false);
  });

  it('returns 404 for a property that does not exist', async () => {
    const res = await request(app).put('/api/properties/9999').send(validProperty);

    expect(res.status).toBe(404);
  });


  it('returns 400 for invalid data and keeps the property unchanged', async () => {
    const created = await request(app).post('/api/properties').send(validProperty);

    const res = await request(app)
      .put(`/api/properties/${created.body.id}`)
      .send({ ...validProperty, title: '' });

    expect(res.status).toBe(400);
    const list = await request(app).get('/api/properties');
    expect(list.body[0].title).toBe(validProperty.title);
  });

})


describe("DELETE /api/properties/:id", ()=>{ 
  it("delete a property", async()=>{
     const created = await request(app).post('/api/properties').send(validProperty);
     const res = await request(app).delete(`/api/properties/${created.body.id}`);

     expect(res.status).toBe(204)
     const list = await request(app).get('/api/properties');
     expect(list.body).toEqual([]);
  })

  it('deletes only the requested property', async () => {
  const keep = await request(app).post('/api/properties').send({ ...validProperty, title: 'Keep me' });
  const remove = await request(app).post('/api/properties').send({ ...validProperty, title: 'Delete me' });

  await request(app).delete(`/api/properties/${remove.body.id}`);

  const list = await request(app).get('/api/properties');
  expect(list.body).toHaveLength(1);
  expect(list.body[0].id).toBe(keep.body.id);
});

   it('clears the cached data to delete the property also from the cache', async () => {
    const created = await request(app).post('/api/properties').send(validProperty);
    cache.set('properties_all', []);

    await request(app).delete(`/api/properties/${created.body.id}`)

    expect(cache.has('properties_all')).toBe(false);
  });

  it("returns 404 for a property that does not exist", async()=>{
     const res = await request(app).delete('/api/properties/9999');

    expect(res.status).toBe(404);
  })
})