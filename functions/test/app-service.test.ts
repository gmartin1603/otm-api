import "mocha";
import { expect } from "chai";
import appService from "../src/services/app-service";

const expectedVersion = require("../src/helpers/constants").API_VERSION;

describe("appService", () => {
  describe("getVersion", () => {
    it("should return the API version", async () => {
      // Arrange

      // Act
      const result = await appService.getVersion();

      // Assert
      expect(result).to.have.property("version", expectedVersion);
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should throw an error when the function is not implemented", async () => {
      // Arrange
      const email = "";
      const link = "http://example.com/reset-password";
      const sendPasswordResetEmail = async () => {
        return await appService.sendPasswordResetEmail(email, link);
      }
      // Act & Assert
      try {
        await sendPasswordResetEmail();
        expect.fail("Expected an error to be thrown");
      } 
      catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.equal("This function is not implemented yet.");
      }
    });
  });
});