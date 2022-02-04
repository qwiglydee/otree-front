import { loadImage } from "./dom";

/**
 * Preloading media accorfing to media_fields config of form: `{ field: 'image' }`.
 * Only images supported for now
 * 
 * @param {*} trial 
 * @param {*} media_fields 
 */
export async function preloadMedia(trial, media_fields) {
  for (let [fld, mediatype] of Object.entries(media_fields)) {
    switch (mediatype) {
      case 'image':
        try {
          trial[fld] = await loadImage(trial[fld]);
        } catch {
          throw new Error(`Failed to load media ${trial[fld]}`);
        }
        break;
      default:
        throw new Error("Unsupported media type to preload");
    }      
  }  
}
