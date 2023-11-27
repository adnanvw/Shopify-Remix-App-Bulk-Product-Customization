import { authenticate } from "../shopify.server";

export async function action({ request }) {
    const { admin } = await authenticate.admin(request);
    const { type, condition, value } = JSON.parse(await request.text());
    console.log("payload", type, condition, value);
    try {
        let hasNextPage = true;
        let nextPageCursor = "";
        let query = `${type}:${value}`;
        console.log("query", query);
        const products = [];

        let response = await handlePagination(admin, hasNextPage, nextPageCursor, query);
        hasNextPage = response.pageInfo.hasNextPage;
        nextPageCursor = response.pageInfo.endCursor;
        products.push(...response.edges);

        while (hasNextPage == true) {
            let response = await handlePagination(admin, hasNextPage, nextPageCursor, query);
            hasNextPage = response.pageInfo.hasNextPage;
            nextPageCursor = response.pageInfo.endCursor;
            products.push(...response.edges);
        }

        return { success: true, data: products };
    } catch (error) {
        console.log("error", error);
    }
}

async function handlePagination(admin, hasNextPage, nextPageCursor, query) {
    try {
        if (hasNextPage == true && nextPageCursor == "") {

            const response = await admin.graphql(
                `#graphql
                query {
                    products(first: 10, query: "${query}") {
                        edges {
                            node {
                                id
                                title
                                vendor
                                status
                                featuredImage {
                                    url
                                }
                                variants(first: 1) {
                                    edges {
                                        node {
                                            id
                                            price
                                        }
                                    }
                                }
                            }
                        }
                        pageInfo {
                          hasNextPage
                            endCursor
                        }
                }
            }`);

            const responseJson = await response.json();
            return responseJson.data.products;
        } else {
            const response = await admin.graphql(
                `#graphql
                query {
                    products(first: 3, query: "${query}", after: "${nextPageCursor}") {
                        edges {
                            node {
                                id
                                title
                                vendor
                                status
                                featuredImage {
                                    url
                                }
                                variants(first: 1) {
                                    edges {
                                        node {
                                            id
                                            price
                                        }
                                    }
                                }
                            }
                        }
                        pageInfo {
                          hasNextPage
                            endCursor
                        }
                }
            }`);

            const responseJson = await response.json();
            return responseJson.data.products;
        }
    } catch (error) {
        console.log("ERROR", error);
    }
}