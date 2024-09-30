import * as mongoDB from '../mongodb.js';

import * as chai from 'chai';
let should = chai.should();
let expect = chai.expect;

describe("mongoDB", function() {
    describe("find", function () {
        it("Should return an array of all users", async function() {
            let users = await mongoDB.find(mongoDB.collections.users, {});

            users.should.be.a('array');

            if(users > 0) {
                users[0].should.have.property('personalDetails');
                users[0].should.have.property('following');
                users[0].should.have.property('followers');
                users[0].should.have.property('posts');
                users[0].should.have.property('biography');
            }
        })
    })

    describe("insert", function () {
        it("Should insert a new entry in database", async function() {
            let result = await mongoDB.insert(mongoDB.collections.comments, {"text": "this is a comment"});

            result.should.be.a('object');
        })
    })

    describe("update", function () {
        it("Should return update an user data", async function() {
            let users = await mongoDB.find(mongoDB.collections.users, {"personalDetails.username": "scott"});
            if(users > 0) {
                let user = users[0];
                user.personalDetails.middleName.should.equal("");
                await mongoDB.update(mongoDB.collections.users,
                    {"personalDetails.username": "scott"},
                    {$set: {"personalDetails.middleName": "Rolfe"}});
                user.personalDetails.middleName.should.equal("Rolfe");
            }
        })
    })
})