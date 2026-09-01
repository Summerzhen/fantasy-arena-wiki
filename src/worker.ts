type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

const CANONICAL_HOST = "fantasyarena.wiki";

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.protocol !== "https:" || url.hostname !== CANONICAL_HOST) {
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
