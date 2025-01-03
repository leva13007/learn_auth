const http = require('http');

const port = 3000; // 1024
const host = '127.0.0.1';

const reqestLoggerHandler = (req,res,next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`Request ${req.method} ${req.url} completed in ${duration}ms`);
  });
  next();
}

const rateLimits = {};
const reteLimmitHandler = (req,res,next) => {
  const ip = req.socket.remoteAddress;
  console.log(`IP: ${ip}`);
  if (!rateLimits[ip]) {
    rateLimits[ip] = 1;
  } else {
    rateLimits[ip]++;
  }

  console.log("rateLimits[ip]", rateLimits[ip])

  if (rateLimits[ip] > 3) {
    res.statusCode = 429;
    res.end('Too Many Requests');
    return;
  }
  next();
}

const authorizationHandler = (req,res,next) => {
  if (!req.headers.authorization) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;
  }
  next();
}

const asyncMiddleware = (req, res, next) => {
  setTimeout(() => {
    console.log('Async middleware executed');
    next();
  }, 1000);
}

class Router {
  routes = {
    "get": {},
    "post": {},
  };

  middlewares = [];

  use(middleware) {
    this.middlewares.push(middleware);
  }

  get(path, ...callbacks) {
    this.routes.get[path] = callbacks;
  }

  post(path, ...callbacks) {
    this.routes.post[path] = callbacks;
  }

  notFound(callback) {
    this.notFoundHandler = callback;
  }

  handle(req, res) {
    const url = req.url;
    const method = req.method.toLowerCase();
    const handlers = this.routes[method][url];

    const allHandlers = [...this.middlewares, ...(handlers || [])];

    if (handlers && handlers.length > 0) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      this.runHandlers(allHandlers, req, res);
    } else if (this.notFoundHandler) {
      this.runHandlers(allHandlers, req, res);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      this.notFoundHandler(req, res);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end("Path does't found");
    }
  }

  async runHandlers(allHandlers, req, res){
    let i = 0;
    let doNext;
    do{
      doNext = false;
      const handler = allHandlers[i];
      if(typeof handler !== 'function') break;
      await new Promise(resolve => {
        handler(req, res, () => {
          doNext = true;
          resolve();
        });

        if (res.writableEnded) resolve();
      })
      
      i++;
    }while(doNext)
  }
}

const router = new Router();

router.use(reqestLoggerHandler);
router.use(reteLimmitHandler);
router.use(asyncMiddleware);

router.get("/", (req, res) => {
  res.end("Public content");
})

router.get("/private", authorizationHandler, (req, res) => {
  res.end("Private content - get");
})

router.post("/private", authorizationHandler, (req, res) => {
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