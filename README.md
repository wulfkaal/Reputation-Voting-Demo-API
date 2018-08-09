## Setup

```
npm install
npm run dev
```

Hot module reloading is not enabled on the API. Changes will require stopping the service
and restarting.

```
CTRL+C
npm run dev
```

NOTE: Only the endpoint /proposals/:id works right now, and I hard coded a response.

### Debugging

Install the [Node V8 Chrome extension](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj?hl=en)
After starting the service, click the Inspector button in Chrome, connect to port 9228.
Port 9228 is configured in package.json.

### Patterns

## Controller/Service

/controllers folder contains Express routing. This is the layer where additional 
Express middleware can be embedded such as role checks on endpoints.

/services folder contains code that handles the request and response. This is where
you will access a database, and send the response.

### Security

Security is not handled right now. The standard is to use a JavaScript Web Token
to secure calls to the API. We can deal with this later to keep it simple for now.

### Database

I stubbed out a MYSQL utility in /utils/mysql.js
We don't need to use this and could use Postgres or something else.

### Config

NODE_ENV is set in package.json which is how the API knows which config file to use. 

