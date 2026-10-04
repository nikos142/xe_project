import { Router } from 'express';
import {getCachedData, setCachedData} from "../redis.ts" 

const router = Router();
const SEARCH_PARAM_MIN_LENGTH=3
const SEARCH_PARAM_REGEX=/^[\p{L}\p{N}\s\-.,'+]+$/u
const ABORT_REQUEST_TIME=5000


router.get('/:input', async (req, res) => {
  const searchParam = req.params.input.trim() //remove whitespaces 

  if (searchParam.length < SEARCH_PARAM_MIN_LENGTH) {
    return res.status(400).json({ error: 'Input length must be 3 characters or more.' });
  }

  //seach param can not contain special characters
  if(!SEARCH_PARAM_REGEX.test(searchParam)){
    return res.status(400).json({ error: 'Input can not contain special characters.' });
  }

  const cache_key=`areas_${searchParam.toLowerCase()}`
  const cached_data = await getCachedData(cache_key); //check for cached data

  if(cached_data)  return res.json({ places: cached_data })

  try {   
    console.log("No match found in cache. Requesting Places API...")
    const response = await fetch(`${process.env.PLACES_API}${encodeURIComponent(searchParam)}`,{
    signal:AbortSignal.timeout(ABORT_REQUEST_TIME) //abort the request if not response in 5 seconds
    });
    if (!response.ok) {
        console.error('Area API responded with', response.status, await response.text());
        return res.status(502).json({ error: "Error fetching places. Please try again." });
    }

    const data = await response.json();
    await setCachedData(cache_key, data);
    return res.json({ places: data });

  } catch (e) {
    console.error('Area API request failed', e);
    res.status(502).json({ error: "Error fetching places. Please try again." });
  }
});
export default router;