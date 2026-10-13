const { syncOrders } = require('../lib/syncOrders');

syncOrders()
  .then((result) => {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
