module.exports = opts => {
  var r = require("rethinkdb"),
    RethinkClient = {
      db: opts.db,
      host: opts["rethink-host"] || "localhost",
      port: opts["rethink-port"] || 28015,
      user: opts["rethink-user"],
      password: opts["rethink-pass"]
    },
    MongoClient = require("mongodb").MongoClient,
    assert = require("assert"),
    url = `mongodb://${opts["mongo-host"] ||
      "localhost"}:${opts["mongo-port"] ||
      "27017"}/${opts.database}`,
    PQueue = require("p-queue"),
    queue = new PQueue({
      concurrency: opts.concurrency || 250
    }),
    ProgressBar = require("progress"),
    counts = [];

  for (let i in RethinkClient) {
    if (!RethinkClient[i]) delete RethinkClient[i];
  }

  RethinkClient = r.connect(RethinkClient);

  let total = 0;

  queue.onEmpty().then(i => {
    counts[0].then(c => {
      if (!total) {
        console.log(c + " documents transferred.");
        process.exit();  
      }
    });
  });

  MongoClient.connect(url, function(err, db) {
    db.collections().then(collections => {
      // collection filter
      if (
        Array.isArray(opts.collection) ||
          typeof opts.collection === "string"
      ) {
        if (Array.isArray(opts.collection)) {
          collections = collections.filter(
            ({ collectionName }) =>
              opts.collection.indexOf(collectionName) != -1
          );
        } else {
          collections = collections.filter(
            ({ collectionName }) =>
              opts.collection === collectionName
          );
        }
      }

      if (!collections.length) {
        console.error("Collection not found.");
        process.exit();
      }

      // total colletion
      for (let collection of collections) {
        counts.push(
          db.collection(collection.collectionName).count()
        );
      }

      Promise.all(counts).then(counts => {
        total = counts.reduce((a, b) => a + b);

        const bar = new ProgressBar(
          ":bar :current/:total document",
          { total }
        );

        RethinkClient.then(conn => {
          new Promise(resolve => {
            r.dbList().run(conn, (err, dbs) => {
              if (dbs.indexOf(opts.db) === -1) {
                r.dbCreate(opts.db).run(conn, err => {
                  if (!err) resolve();
                });
              } else {
                resolve();
              }
            });
          }).then(() => {
            r
              .db(opts.db)
              .tableList()
              .run(conn, (err, tables) => {
                const tableControl = [];

                collections.map(({ collectionName }) => {
                  if (
                    tables.indexOf(collectionName) == -1
                  ) {
                    tableControl.push(
                      new Promise(resolve => {
                        r
                          .db(opts.db)
                          .tableCreate(collectionName)
                          .run(conn, err => {
                            if (!err) resolve();
                          });
                      })
                    );
                  }
                });

                Promise.all(tableControl).then(() => {
                  collections.map(({ collectionName }) => {
                    db
                      .collection(collectionName)
                      .find()
                      .forEach(doc => {
                        queue.add(() => {
                          bar.tick();

                          const _doc = JSON.parse(
                            JSON.stringify(doc)
                          );

                          delete _doc._id;

                          return new Promise((
                            resolve,
                            reject
                          ) =>
                            {
                              r
                                .table(collectionName)
                                .insert(doc)
                                .run(conn, (err, res) => {
                                  if (err) reject(err);

                                  resolve(res);
                                });
                            });
                        });
                      });
                  });
                });
              });
          });
        });
      });
    });
  });
};
