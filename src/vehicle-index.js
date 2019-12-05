var net = require("net");
const storage = require("node-persist");

// Keep track of the chat clients
var clients = [];

const port = process.env.PORT || 445;

var server = net.createServer(function(socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort;
  clients.push(socket);

  socket.write("Welcome " + socket.name + "\n");
  broadcast(socket.name + " joined the chat\n", socket);

  socket.on("data", function(data) {
    broadcast(socket.name + "> " + data, socket);
    storage
      .init()
      .then(() => storage.getItem("queries"))
      .then(queries => (Array.isArray(queries) ? queries : []))
      .then(queries => storage.setItem("queries", [...queries, data]))
      .catch(console.log);
  });

  socket.on("end", function() {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " left the chat.\n");
  });

  function broadcast(message, sender) {
    clients.forEach(function(client) {
      if (client === sender) return;
      client.write(message);
    });
    process.stdout.write(message);
  }
});

server.listen(port, () =>
  console.log(`EnRoute TCP Platform successfully started at port ${port}.`)
);
