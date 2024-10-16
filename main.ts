import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { bodyLimit } from "hono/body-limit";

let idx = 1;
const chat = [] as {
  u: string;
  m: string;
  i: number;
}[];

const app = new Hono();
app.use(logger());

app.get("/", serveStatic({ path: "./index.html" }));

app.post(
  "/api/new_message",
  bodyLimit({
    maxSize: 10 * 1024, // 50kb
    onError: (c) => {
      return c.text("overflow :(", 413);
    },
  }),
  async (c) => {
    const data = await c.req.json() as { m: string; u: string };

    if (data.u == "") {
      data.u = "unknown";
    }
    chat.push({
      u: data.u,
      m: data.m,
      i: idx++,
    });

    console.log(chat);

    return c.body(null, 200);
  },
);

app.get("/api/get_messages/:since", (c) => {
  const { since } = c.req.param();

  let msgs;
  if (Number(since) > 0) {
    msgs = chat.slice(Number(since));
  } else {
    msgs = chat;
  }
  return c.json(msgs);
});

export default app;
