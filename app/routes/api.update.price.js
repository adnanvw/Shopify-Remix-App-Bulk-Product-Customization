import { authenticate } from "../shopify.server";

export async function action({ request }) {
    const { admin } = await authenticate.admin(request);
    try {
        const payload = JSON.parse(await request.text());

        for (let i = 0; i < payload.variants_arr.length; i++) {
            await UpdateProductPrice(payload.variants_arr[i], payload.price, admin);
        }

        return { success: true };
    } catch (error) {
        console.log("ERROR", error);
        return false;
    }
}

async function UpdateProductPrice(variant_id, price, admin) {
    try {

        let response = await admin.graphql(`#graphql
        mutation productVariantUpdate($input: ProductVariantInput!) {
            productVariantUpdate(input: $input) {
                userErrors {
                    field
                    message
                }
                productVariant {
                  id
                }
            }
        }
        `, {
            variables: {
                input: {
                    id: variant_id,
                    price: Number(price)
                }
            }
        });

        const responseJson = await response.json();
    } catch (error) {
        console.log("ERROR", error);
    }
}