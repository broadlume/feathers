/**
 * @jest-environment jsdom
 */

import * as AdwordsPhoneTag from "./../";

describe("AdwordsPhoneTag", () => {
  describe("replacePhoneNumbers", () => {
    it("replaces the href to the mobile number", () => {
      document.body.innerHTML = `
        <a href="tel:1-800-REAL" class="phone-number--link">
          <span class="phone-number--text">
            <span>1-800-REAL</span>
          </span>
        </a>
      `;

      AdwordsPhoneTag.replacePhoneNumbers("1-800-FORM", "1-800-MOBE");
      const link = document.querySelector<HTMLLinkElement>("a");

      // @ts-ignore
      expect(link.href).toEqual("tel:1-800-MOBE");
    });
  });

  describe("phoneNumber", () => {
    it("references the phone number stored in the meta tag", () => {
      document.body.innerHTML = `
        <meta itemprop="adwords-phone-tag" data-phonenumber="1-800-REAL">
      `;

      expect(AdwordsPhoneTag.getPhoneNumber()).toBe("1-800-REAL");
    });
  });
});
