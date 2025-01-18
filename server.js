const http = require('http');
const https = require('https');

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

  if (rateLimits[ip] > 10) {
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

router.get("/set-cookie", (req, res) => {
  res.setHeader('Set-Cookie', [
    'sessionId=secure123; Secure'
  ]);
  res.end('Cookies set!');
});

router.get("/read-cookie", (req, res) => {
  const cookies = req.headers.cookie || 'No cookies';
  console.log("cookie", cookies.split(';').map(str => str.trim()));

  res.setHeader('Content-Type', 'text/html');

  const html = `
    <html>
      <head>
        <title>Cookies</title>
      </head>
      <body>
        <h1>Cookies from Client</h1>
        ${
          cookies.split(';').map(cookie => {
            const [name, value] = cookie.split('=');
            return `<p>${name.trim()}: ${value}</p>`;
          }).join('')
        }
      </body>
    </html>
  `;

  res.end(html);
});

router.get('/ten-sec-cookie', (req, res) => {
  res.setHeader('Set-Cookie', 'ten_sec_cookie=done; Max-Age=10');
  res.end('Cookies set!');
});

router.get('/fifteen-sec-cookie', (req, res) => {
  const now = new Date();
  const fifteenSecondsLater = new Date(now.getTime() + 15 * 1000);
  res.setHeader('Set-Cookie', `fifteen_sec_cookie=${fifteenSecondsLater.toUTCString()}; Expires=${fifteenSecondsLater.toUTCString()}`);
  res.end('Cookies set!');
});

router.get("/set-domain-cookie", (req, res) => {
  const hostWithoutPort = req.headers.host.split(':')[0];
  res.setHeader('Set-Cookie', `domain_cookie=${hostWithoutPort}; Domain=${hostWithoutPort}`);
  res.end('Cookies set!');
});

router.get("/read-cookie/sub-route", (req, res) => {
  const cookies = req.headers.cookie || 'No cookies';

  res.setHeader('Content-Type', 'text/html');

  const html = `
    <html>
      <head>
        <title>Cookies</title>
      </head>
      <body>
        <h1>Cookies from Client</h1>
        ${
          cookies.split(';').map(cookie => {
            const [name, value] = cookie.split('=');
            return `<p>${name.trim()}: ${value}</p>`;
          }).join('')
        }
      </body>
    </html>
  `;

  res.end(html);
});

const generateLargeCookie = (size) => `test_large=${'a'.repeat(size)}`;
  
const largeCookie = generateLargeCookie(4000);
router.get('/large-cookie', (req, res) => {
  res.setHeader('Set-Cookie', largeCookie);
  res.end('Cookies set!');
});


const generateManyCookies = (count) => {
  const cookies = [];
  for (let i = 1; i <= count; i++) {
    cookies.push(`cookie_many${i.toString().padStart(3, '0')}=value${i.toString().repeat(10)}`);
  }
  return cookies;
};

const manyCookies = generateManyCookies(185);
router.get('/many-cookies', (req, res) => {
  res.setHeader('Set-Cookie', manyCookies);
  res.end('Cookies set!');
});

// const port = 3443; // 3000 1024
const fs = require('fs');
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// https.createServer(options, (req, res) => {
//   router.handle(req, res);
// })
//   .listen(port, host, () => {
//     console.log(`Server running https://${host}:${port}`);
//   });

http.createServer((req, res) => {
  router.handle(req, res);
})
  .listen(port, host, () => {
    console.log(`Server running http://${host}:${port}`);
  })