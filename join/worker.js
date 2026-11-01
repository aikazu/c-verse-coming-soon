// join.c-verse.co: redirect plain HTTP to HTTPS, then serve the static deck.
// The zone's HTTPS redirect ruleset covers only the apex, and the Wrangler
// OAuth token cannot edit zone rulesets, so the Worker owns this redirect.
// run_worker_first in wrangler.join.jsonc makes it run before asset matching.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 308);
    }
    return env.ASSETS.fetch(request);
  },
};
