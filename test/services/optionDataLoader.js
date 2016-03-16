"use strict";

const expect = require("chai").expect;

const simplifiedOptionGroups = require("../resources/metadata_simplified.json");
const imageDirectory = __dirname + "/../resources/charParts/img200x200";
const imageExtension = ".png";

const optionDataLoader = require("../../services/optionDataLoader");


describe("optionDataLoader", function () {

    describe("module", function () {
        it("should fail when no option data passed", function () {
            expect(function () {
                optionDataLoader();
            }).to.throw(Error);
        });

        it("should fail when empty option data passed", function () {
            expect(function () {
                optionDataLoader({});
            }).to.throw(Error);
        });

        it("should fail when no image directory passed", function () {
            expect(function () {
                optionDataLoader(simplifiedOptionGroups);
            }).to.throw(Error);
        });


        it("should fail when image directory passed doesn't exist", function () {
            expect(function () {
                optionDataLoader(simplifiedOptionGroups, "/tmp/somewhere");
            }).to.throw(Error);
        });

        it("should fail when no image extension passed", function () {
            expect(function () {
                optionDataLoader(simplifiedOptionGroups, imageDirectory);
            }).to.throw(Error);
        });
    });

    describe("Option groups map", function () {
        it("should be created correctly from simplified metadata", function () {
            const loader = optionDataLoader(simplifiedOptionGroups, imageDirectory, imageExtension);
            const optionGroupsMap = loader.createOptionGroupsMap();
            expect(optionGroupsMap).to.have.all.keys("1", "2", "7");

            const skinGroup = optionGroupsMap["1"];
            expect(skinGroup.id).to.equal(1);
            expect(skinGroup.name).to.equal("Skin");
            expect(skinGroup).to.deep.equal(simplifiedOptionGroups[0]);

            const eyeGroup = optionGroupsMap["2"];
            expect(eyeGroup.id).to.equal(2);
            expect(eyeGroup.name).to.equal("Eye");
            expect(eyeGroup).to.deep.equal(simplifiedOptionGroups[1]);
        });
    });

    describe("Options map", function () {
        it("should be created correctly from simplified metadata", function () {
            const loader = optionDataLoader(simplifiedOptionGroups, imageDirectory, imageExtension);
            const optionsMap = loader.createOptionsMap();
            expect(optionsMap).to.have.all.keys("1000", "2000", "2001", "7000", "7001", "7002");

            const skinOption = optionsMap["1000"];
            expect(skinOption.id).to.equal(1000);
            expect(skinOption.name).to.equal("Skin");
            expect(skinOption).to.deep.equal(simplifiedOptionGroups[0].options[0]);

            const eyeAnimeOption = optionsMap["2001"];
            expect(eyeAnimeOption.id).to.equal(2001);
            expect(eyeAnimeOption.name).to.equal("Anime");
            expect(eyeAnimeOption).to.deep.equal(simplifiedOptionGroups[1].options[1]);
        });
    });

    describe("Option images map", function () {
        it("should be created correctly from simplified metadata", function () {
            const loader = optionDataLoader(simplifiedOptionGroups, imageDirectory, imageExtension);
            const optionImagesMap = loader.createOptionImagesMap();
            expect(optionImagesMap).to.have.all.keys("1000", "2000", "2001", "7000", "7001", "7002");

            // with colors
            const skinOptionImages = optionImagesMap["1000"];
            expect(skinOptionImages).to.have.all.keys("#27160E", "#935837");
            expect(skinOptionImages["#27160E"]).to.be.an.instanceOf(Buffer);

            // without colors
            const futureEmployerHatImage = optionImagesMap["7002"];
            expect(futureEmployerHatImage).to.be.an.instanceOf(Buffer);
        });
    });
});
