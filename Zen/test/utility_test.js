import * as utilities from '../utility.js';
import * as mongoDB from "../mongodb.js";

import * as chai from "chai";
let should = chai.should();
let expect = chai.expect;

describe("utilities", function() {
    describe("isImageFile", function () {
        it("Should return a boolean wheter the extension is image or not", function() {
            let goodFiles = ["one.jpeg", "two.jpg", "three.png"];
            let badFiles = ["one.docx", "two.pdf", "three.zip"];

            for (let file of goodFiles) {
                let result = utilities.isImageFile(file);
                expect(result).to.equal(true);
            }

            for (let file of badFiles) {
                let result = utilities.isImageFile(file);
                expect(result).to.equal(false);
            }
        })
    })

    describe("getFollowingData", function () {
        it("Should return the data of people following", async function() {
            let arrayOfIDs = ["66184174f5f8d777060f5972",
                "66158454778fc72752e32d9e",
                "661442073159be7c5c6151ba",
                "66184058651f13b58a18eef1",
                "661842883b2f5de45a8f5483"]

            let result = await utilities.getFollowingData(arrayOfIDs);
            result.should.be.a('array');
            for (let user of result){
                user.should.be.a('object');
                user.should.have.property('name');
                user.should.have.property('profilePicture');
                user.should.have.property('_id');
            }
        })
    })

    describe("getNameFormat", function () {
        it("Should return the full name format of a user", async function() {
            let users = await mongoDB.find(mongoDB.collections.users, {"personalDetails.username": "florinhasna"});
            if(users > 0) {
                let user = users[0];
                let name = utilities.getNameFormat(user);
                name.should.be.a('string');
                expect(name).to.contain(user.personalDetails.firstName);
                expect(name).to.contain(user.personalDetails.lastName);
                if(user.personalDetails.middleName !== ""){
                    expect(name).to.contain(user.personalDetails.middleName.charAt(0) + ".");
                }
            }
        })
    })
})