# mongo-to-rethink
RethinkDB transfer tool for MongoDB database. It is safer because every transaction is kept in a [promise queue].

## Install
```
npm install mongo-to-rethink -g
```

All collections are transferred unless the collection is defined. To define more than one collection;

```
mongo-to-rethink -db app -c user -c post
```

## Usage

```
Usage: mongo-to-rethink [options]

Options:
  --mongo-host, --mh    MongoDB host        (default localhost)
  --mongo-port, --mp    MongoDB port        (default 27017)
  --database, --db      MongoDB database      
  --collection, -c      MongoDB collection
  --rethink-host, --eh  RethinkDB host      (default localhost)
  --rethink-port, --ep  RethinkDB port      (default 28015)
  --rethink-user, --ru  RethinkDB username
  --rethink-pass, --rp  RethinkDB password
  --concurrency, --con  Promise concurrency (default 250)
  --help                Show help          
```

[promise queue]: https://github.com/sindresorhus/p-queue
