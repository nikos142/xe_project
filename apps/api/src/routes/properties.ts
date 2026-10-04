import { Router } from 'express';
import  { type Property, PropertySchema} from '@xe/shared';
import { getCachedData, setCachedData, deleteCachedData } from '../redis.ts';
import { listProperties, getProperty, updateProperty, insertProperty, deleteProperty } from '../queries.ts';

const ALL_PROPERTIES_CACHE_KEY = 'properties_all';
const PROPERTY_CACHE_KEY="property_" 

const router = Router();


router.get('/', async (_req, res) => {
  const cached_data = await getCachedData(ALL_PROPERTIES_CACHE_KEY);
  if (cached_data) return res.json(cached_data);
  
  const properties = listProperties.all() as unknown as Property[];
  await setCachedData(ALL_PROPERTIES_CACHE_KEY, properties);
  res.json(properties);
});

router.get('/:id', async(req, res) => {
  const cache_key=PROPERTY_CACHE_KEY+req.params.id
  const cached_data = await getCachedData(cache_key);
  if(cached_data) return res.json(cached_data);
  
  const item = getProperty.get(req.params.id) as Property | undefined;
  if (!item) return res.status(404).json({ error: 'Property not found' });
  await setCachedData(cache_key, item);
  res.json(item);
});


router.post('/', async (req, res) => {
  const { success, data, error } = PropertySchema.safeParse(req.body);
  if (!success) return res.status(400).json(error.issues);
  const item = insertProperty.get(data.title, data.type, data.placeId,data.area, data.price, data.floor, data.bathrooms, data.extra_description) as unknown as Property;
  // The cached list no longer includes the new property
  await deleteCachedData(ALL_PROPERTIES_CACHE_KEY);
  res.status(201).json(item);
});

// router.put('/:id', (req, res) => {
//   // if ('error' in input) return res.status(400).json(input);
//   const item = updateProperty.get(input.name, input.description, req.params.id) as
//     | Property
//     | undefined;
//   if (!item) return res.status(404).json({ error: 'Item not found' });
//   res.json(item);
// });

router.delete('/:id', async(req, res) => {
  const { changes } = deleteProperty.run(req.params.id);
  if (changes === 0) return res.status(404).json({ error: 'Item not found' });
  await deleteCachedData(ALL_PROPERTIES_CACHE_KEY);
  res.status(204).end();
});

export default router;
