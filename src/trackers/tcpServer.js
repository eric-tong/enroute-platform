var net = require("net");

var clients = [];
const port = process.env.PORT || 3000;

var server = net.createServer(socket => {
  socket.name = socket.remoteAddress + ":" + socket.remotePort;
  clients.push(socket);

  socket.on("data", function(data) {
    const arr = [...data];
    console.log(arr);
    if (arr[1] > 0) socket.write("\x01");
    else {
      const reply = Buffer.from([0, 0, 0, arr[9]]);
      console.log(reply);
      socket.write(reply);
    }
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
