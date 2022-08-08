const { createClient } = require('redis');

const connectRedis = async () => {
  const client = createClient();

  client.on('connect', () => {
    console.log('Connected to Redis!');
  });
  client.on('error', (err) => {
    console.log('Redis Client Error', err)
  });

  await client.connect();

  return client;
}

const performRedis = async (client) => {

  // Value
  console.log("VALUE");
  // await client.set('hello', 'hello world');
  await client.sendCommand(['set', 'hello', 'hello world']);
  const value = await client.get('hello');
  console.log(value);

  // Hashmap
  console.log("HASHMAP")
  await client.hSet("library", {
    movie: "Harry Potter",
    duration: 2 * 60
  });
  let object = await client.hGetAll("library");
  console.log(JSON.stringify(object, 0, 2))
  await client.hDel("library", ["movie", "duration"])
  object = await client.hGetAll("library");
  console.log(JSON.stringify(object, 0, 2))

  // List
  console.log("LIST")
  await client.rPush("movies", ["Harry Potter 1", "Harry Potter 2"]);
  const list = await client.lRange("movies", 0, -1)
  console.log(list)
  await client.sendCommand(['RPOP', 'movies', "2"])

  // Set
  console.log("SET")
  await client.sAdd("directors", ["Jack", "Jack", "Ben"]);
  let set = await client.sMembers("directors");
  console.log(set);
  await client.sPop("directors", "Jack")
  set = await client.sMembers("directors");
  console.log(set);

  // check if a key exists
  let exists = await client.EXISTS("directors");
  if (exists === 1) console.log("key 'directors' exists")
  else console.log("key 'directors' doesn't exist")

  // delete a key
  await client.del("directors");
  exists = await client.EXISTS("directors");
  if (exists === 1) console.log("key 'directors' exists")
  else console.log("key 'directors' doesn't exist")

  // increment a key
  console.log("INCREMENT\n5")
  await client.set('working_days', 5);
  await client.incr('working_days');
  const incremented = await client.get("working_days");
  console.log(incremented);

  // TTL
  console.log("Key with TTL")
  await client.set("ephemeral", "hi");
  await client.expire("ephemeral", 3);
  setTimeout(async () => {
    const ttl = await client.TTL("ephemeral");
    const eph = await client.get("ephemeral");
    console.log(`ttl: ${ttl}, value: ${eph}`);
    done = true;
  }, 10 * 1000)

  await client.set("node:key1", "value");
  const key = await client.get("node:key1");
  console.log(key)

}
(async () => {
  const client = await connectRedis();
  await performRedis(client);
})();

