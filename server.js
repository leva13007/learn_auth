const http = require('http');

const port = 3000; // 1024
const host = '127.0.0.1';

class Router {
  routes = {
    "get": {},
    "post": {},
  };

  get(path, callback) {
    this.routes['get'][path] = callback;
  }

  post(path, callback) {
    this.routes['post'][path] = callback;
  }

  notFound(callback) {
    this.notFoundHandler = callback;
  }

  handle(req, res) {
    const url = req.url;
    const method = req.method.toLowerCase();
    const routeHandler = this.routes[method][url];

    if (routeHandler) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      routeHandler(req, res);
    } else if (this.notFoundHandler) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      this.notFoundHandler(req, res);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end("Path does't found");
    }
  }
}

const router = new Router();

router.get("/", (req, res) => {
  res.end("Public content");
})

router.get("/private", (req, res) => {
  res.end("Private content - get");
})

router.post("/private", (req, res) => {
  res.end("Private content - post");
})

router.notFound((req, res) => {
  res.end("Path does't found - custom");
})

http.createServer((req, res) => {
  router.handle(req, res);
})
  .listen(port, host, () => {
    console.log(`Server running http://${host}:${port}`);
  })