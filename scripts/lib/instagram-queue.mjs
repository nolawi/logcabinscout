export function selectQueuePosts(queue, history, ids) {
  if (!Array.isArray(queue.posts) || !Array.isArray(history.posts)) throw new Error('Invalid queue or history.');
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3 || new Set(ids).size !== ids.length) throw new Error('Choose 1–3 distinct queue IDs.');
  const selected = ids.map(id => {
    const post = queue.posts.find(item => item.id === id);
    if (!post) throw new Error(`Unknown queue ID: ${id}`);
    if (history.posts.some(item => item.listingId === post.listing.id)) throw new Error(`Already posted or awaiting reconciliation: ${id}`);
    if (post.slides?.length !== 4 || post.slides.map(x=>x.role).join(',') !== 'cover,exterior,land,interior') throw new Error(`Invalid slide order: ${id}`);
    return post;
  });
  if (new Set(selected.map(x=>x.listing.id)).size !== selected.length) throw new Error('Batch contains the same property more than once.');
  return selected;
}
const fingerprint = url => new URL(url).pathname.match(/\/fp\/([a-f0-9]+)-/)?.[1] ?? url;
export function verifyQueueSource(post, source) {
  if (source.listing.id !== post.listing.id) throw new Error(`Source identity changed: ${post.id}`);
  for (const key of ['price','acreage','bedrooms','bathrooms','squareFeet']) {
    if (post.listing[key] != null && source.listing[key] !== post.listing[key]) throw new Error(`Listing ${key} changed; refresh package: ${post.id}`);
  }
  const available = new Set(source.photos.map(fingerprint));
  if (!post.slides.every(slide=>available.has(fingerprint(slide.sourceUrl)))) throw new Error(`Selected photos changed; refresh package: ${post.id}`);
  return true;
}
export async function publishQueueBatch({posts,history,publish,persist,now=()=>new Date().toISOString()}) {
  const results=[];
  for (const post of posts) {
    if (history.posts.some(item=>item.listingId===post.listing.id)) throw new Error(`Property already claimed: ${post.id}`);
    const entry={queueId:post.id,listingId:post.listing.id,state:'publishing',startedAt:now()};
    history.posts.push(entry);
    // Persist the claim before contacting Meta. Ambiguous failures stay blocked.
    await persist(history);
    let result;
    try { result=await publish(post); }
    catch(error) { entry.state='needs-review';await persist(history);throw error; }
    if (!result.published || !/^\d+$/.test(String(result.mediaId))) { entry.state='needs-review';await persist(history);throw new Error('Publishing outcome was not confirmed.'); }
    Object.assign(entry,{state:'published',publishedAt:now(),mediaId:result.mediaId,permalink:result.permalink,imageCount:result.imageCount});
    await persist(history);
    results.push(entry);
  }
  return results;
}
