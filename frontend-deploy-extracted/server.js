const http = require('http');
const next = require('next');

// cPanel/Passenger does not always start the app with the project folder as cwd.
// Force Next.js to resolve the production build from this app directory.
process.chdir(__dirname);

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';
const app = next({
  dev: false,
  dir: __dirname,
  hostname,
  port,
});
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    http.createServer((req, res) => handle(req, res)).listen(port, hostname, (error) => {
      if (error) {
        throw error;
      }

      console.log(`Bouut frontend running on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error('Frontend startup failed:', error);
    process.exit(1);
  });
