import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

// setting connection with mongodb server
const connectionURI = `mongodb://127.0.0.1:27017?retryWrites=true&w=majority`;

// initialise the client
const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true
    }
});

// setting the collections
const db = client.db('Zen');

export const collections = {
    users: db.collection('Users'),
    posts: db.collection('Posts'),
    comments: db.collection('Comments')
}

// function to get a collection's entries
export async function find(aCollection, query) {
    // connect to db
    await client.connect();

    // get the data in an array
    const result = await aCollection.find(query).toArray();

    // close connection
    await client.close();

    return result;
}

// function to insert a new entry in a collection
export async function insert(aCollection, newEntry) {
    // connect to db
    await client.connect();

    // enter a new entry in the desired collection
    let insertion = await aCollection.insertOne(newEntry);

    // close connection
    await client.close();

    return insertion.insertedId;
}

export async function replace(aColletion, entry) {
    await client.connect();

    try{
        const result = await aColletion.replaceOne({"_id": new ObjectId(entry._id)}, entry);

        console.log(`Modified ${result.modifiedCount} document/s.`);
    } catch(err) {
        console.error(`Failed to replace document, error ${err}`);
    }

    await client.close();
}

export async function update(aCollection, query, updatedDoc) {
    await client.connect();

    const result = await aCollection.updateOne(query, updatedDoc);

    await client.close();
}