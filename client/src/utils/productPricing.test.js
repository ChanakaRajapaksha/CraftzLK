import { getDisplayPricing, getDisplayPrice } from "./productPricing";

describe("productPricing", () => {
  it("uses main product price on cards when the product has no variants", () => {
    const product = {
      price: 230,
      oldPrice: 230,
      discount: 0,
    };

    expect(getDisplayPrice(product)).toBe(230);
    expect(getDisplayPricing(product)).toEqual({
      price: 230,
      oldPrice: 230,
      onSale: false,
      discount: 0,
      hasDiscount: false,
    });
  });

  it("uses the default variant price on cards when variants exist", () => {
    const product = {
      price: 120,
      oldPrice: 230,
      discount: 0,
      variants: [
        {
          variantName: "Weight",
          options: [
            { label: "50g", price: 120, isDefault: false },
            { label: "100g", price: 230, isDefault: true },
          ],
        },
      ],
    };

    expect(getDisplayPrice(product)).toBe(230);
    expect(getDisplayPricing(product)).toEqual({
      price: 230,
      oldPrice: 230,
      onSale: false,
      discount: 0,
      hasDiscount: false,
    });
  });

  it("applies parent sale pricing from the Pricing tab for non-variant products", () => {
    const product = {
      price: 120,
      oldPrice: 230,
      discount: 48,
    };

    expect(getDisplayPricing(product)).toEqual({
      price: 120,
      oldPrice: 230,
      onSale: true,
      discount: 48,
      hasDiscount: true,
    });
  });
});
