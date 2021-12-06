
const http = require('http');
const PORT = 8080;

// //a function which handles requests and sends responses to the server
const requestHandler = function(request, response) {
  response.end(`Requested path: ${request.url}\nRequest Method: ${request.method}`);
  if (request.url === '/') {
    response.end('Welcome!');
    console.log(`A user has entered ${request.url}`);
  
  } else if (request.url === '/urls') {
    response.end(`${request.url}`);
    console.log(`A user has entered ${request.url}`);
    
  } else {
    response.end('404 Page Not Found');
  }
};

const server = http.createServer(requestHandler);

console.log('Server created');

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

console.log('Last line (after .listen call)');

