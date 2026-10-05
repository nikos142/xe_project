import { Router } from 'express';
import  { type Property, PropertySchema} from '@xe/shared';
import { getCachedData, setCachedData, deleteCachedData } from '../redis.ts';
import { listProperties, updateProperty, insertProperty, deleteProperty } from '../queries.ts';

const ALL_PROPERTIES_CACHE_KEY = 'properties_all';

const router = Router();


router.get('/', async (_req, res) => {
  const cachedData = await getCachedData(ALL_PROPERTIES_CACHE_KEY);
  if (cachedData) return res.json(cachedData);
  
  const properties = listProperties.all() as unknown as Property[];
  await setCachedData(ALL_PROPERTIES_CACHE_KEY, properties);
  res.json(properties);
});

router.post('/', async (req, res) => {
  const { success, data, error } = PropertySchema.safeParse(req.body);
  if (!success) return res.status(400).json(error.issues);
  const item = insertProperty.get(data.title, data.type, data.placeId,data.area, data.price, data.floor, data.bathrooms, data.extra_description) as unknown as Property;
  await deleteCachedData(ALL_PROPERTIES_CACHE_KEY);
  res.status(201).json(item);
});

router.put('/:id', async (req, res) => {
 const { success, data, error } = PropertySchema.safeParse(req.body);
 if (!success) return res.status(400).json(error.issues);
  const item = updateProperty.get(data.title, data.type, data.placeId, data.area, data.price, data.floor, data.bathrooms, data.extra_description, req.params.id) as unknown as Property;
  if (!item) return res.status(404).json({ error: 'Item not found' });
   await deleteCachedData(ALL_PROPERTIES_CACHE_KEY);
  res.json(item);
});

router.delete('/:id', async(req, res) => {
  const { changes } = deleteProperty.run(req.params.id);
  if (changes === 0) return res.status(404).json({ error: 'Item not found' });
  await deleteCachedData(ALL_PROPERTIES_CACHE_KEY);
  res.status(204).end();
});

export default router;
