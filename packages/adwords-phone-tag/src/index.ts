import DOMDataset from "@adhawk/dom-dataset";

declare const gtag: (...args: any[]) => void;

export function install(
  conversionId: string | null,
  conversionLabel: string | null,
) {
  try {
    gtag("config", `${conversionId}/${conversionLabel}`, {
      phone_conversion_callback: replacePhoneNumbers,
      phone_conversion_number: getPhoneNumber(),
    });
  } catch (e) {
    console.error(e);
  }
}

export function getPhoneNumber() {
  const domDataset = new DOMDataset("adwords-phone-tag");

  if (!domDataset.dataset.phonenumber) {
    throw new Error("data-phonenumber attribute was not attached to meta node");
  }

  return domDataset.dataset.phonenumber;
}

export function replacePhoneNumbers(
  formattedNumber: string,
  mobileNumber: string,
) {
  const elements = document.querySelectorAll<HTMLLinkElement>(
    ".phone-number--link",
  );

  for (var i = 0; i < elements.length; ++i) {
    const e = elements[i];
    e.href = "tel:" + mobileNumber;
    const textEl = e.querySelector<HTMLSpanElement>(".phone-number--text span");
    if (textEl) {
      textEl.innerText = formattedNumber;
    }
  }
}
