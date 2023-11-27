import * as P from "@shopify/polaris";
import * as React from "react";
import { SearchMajor } from '@shopify/polaris-icons';

export default function AdditionalPage() {
  const [getProductsData, setProductsData] = React.useState([]);
  const [textFieldValue, setTextFieldValue] = React.useState('');
  const [selectTypeValue, setSelectTypeValue] = React.useState('title');
  const [selectConditionValue, setSelectConditionValue] = React.useState('is equal to');
  const [active, setActive] = React.useState(false);
  const [value, setValue] = React.useState('0');
  const [loader1, setLoader1] = React.useState(false);
  const [loader2, setLoader2] = React.useState(false);

  const resourceName = { singular: 'product', plural: 'products' };
  const { selectedResources, allResourcesSelected, handleSelectionChange } = P.useIndexResourceState(getProductsData);

  const handleTextFieldValueChange = React.useCallback((value) => setTextFieldValue(value), []);
  const handleSelectTypeChange = React.useCallback((value) => setSelectTypeValue(value), []);
  const handleSelectConditionChange = React.useCallback((value) => setSelectConditionValue(value), []);
  const handleChange = React.useCallback(() => setActive(!active), [active]);
  const handleChangePrice = React.useCallback((newValue) => setValue(newValue), []);

  return (
    <P.Page>
      <ui-title-bar title="Product Price Customize page" />

      <P.Layout>
        <P.Layout.Section>
          <P.LegacyStack wrap={false} alignment="leading" spacing="loose">
            <P.LegacyStack.Item fill>
              <P.FormLayout>
                <P.FormLayout.Group condensed>
                  <P.Select
                    labelHidden
                    label="Collection rule type"
                    options={['id', 'title', 'vendor', 'price', 'status']}
                    value={selectTypeValue}
                    onChange={handleSelectTypeChange}
                  />
                  <P.Select
                    labelHidden
                    label="Collection rule condition"
                    options={['is equal to']}
                    value={selectConditionValue}
                    onChange={handleSelectConditionChange}
                  />
                  <P.TextField
                    labelHidden
                    label="Collection rule content"
                    value={textFieldValue}
                    onChange={handleTextFieldValueChange}
                    autoComplete="off"
                  />
                </P.FormLayout.Group>
              </P.FormLayout>
            </P.LegacyStack.Item>
            <P.Button icon={SearchMajor} onClick={handleFetchProducts} loading={loader1} accessibilityLabel="Search item" />
          </P.LegacyStack>
        </P.Layout.Section>

        {
          getProductsData.length > 0 && <P.Layout.Section>
            <P.ButtonGroup>
              <P.Button onClick={handleChange} variant="primary">Change price for {getProductsData.length} products</P.Button>
            </P.ButtonGroup>
          </P.Layout.Section>
        }

        <P.Layout.Section>
          <P.Card title="Online store dashboard" sectioned>
            {/* <P.IndexFilters
              primaryAction={primaryAction}
            /> */}
            <P.IndexTable
              selectable={false}
              resourceName={resourceName}
              itemCount={getProductsData.length}
              // selectedItemsCount={
              //   allResourcesSelected ? 'All' : selectedResources.length
              // }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: 'Sr. no' },
                { title: 'Product Image' },
                { title: 'Product ID' },
                { title: 'Product Title' },
                { title: 'Product Price' },
                { title: 'Product Status' },
                { title: 'Product Vendor' },
              ]}
            >
              {
                getProductsData.length > 0 ?
                  getProductsData.map((product, index) => {
                    return <P.IndexTable.Row
                      id={index}
                      key={index}
                      selected={selectedResources.includes(product.node.id)}
                      position={index}
                    >
                      <P.IndexTable.Cell>
                        {index + 1}
                      </P.IndexTable.Cell>
                      <P.IndexTable.Cell>
                        <img alt="alt" width={100} height={100} src={product.node.featuredImage?.url} />
                      </P.IndexTable.Cell>
                      <P.IndexTable.Cell>
                        <P.Text variant="bodyMd" fontWeight="bold" as="span">
                          {product.node.id.replace("gid://shopify/Product/", "")}
                        </P.Text>
                      </P.IndexTable.Cell>
                      <P.IndexTable.Cell>
                        {product.node.title}
                      </P.IndexTable.Cell>
                      <P.IndexTable.Cell>
                        {product.node.variants.edges.map((variant) => variant.node.price)}
                      </P.IndexTable.Cell>
                      <P.IndexTable.Cell>
                        {product.node.status}
                      </P.IndexTable.Cell>
                      <P.IndexTable.Cell>
                        {product.node.vendor}
                      </P.IndexTable.Cell>
                    </P.IndexTable.Row>
                  })
                  :
                  <P.Spinner />
              }

            </P.IndexTable>
          </P.Card>
        </P.Layout.Section>
      </P.Layout>
      <P.Frame>
        <P.Modal
          open={active}
          onClose={handleChange}
          title="Enter the Product Price"
          primaryAction={{
            content: 'Change Price',
            onAction: handleSubmit,
            loading: loader2
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleChange,
            },
          ]}
        >
          <P.Modal.Section>
            <P.TextContainer>
              <p>Enter the new price below:</p>
              <P.TextField
                label="Price Change"
                type="number"
                value={value}
                onChange={handleChangePrice}
                autoComplete="off"
              />
            </P.TextContainer>
          </P.Modal.Section>
        </P.Modal>
      </P.Frame>
    </P.Page>
  );

  async function handleFetchProducts() {
    try {
      setLoader1(true);
      const response = await fetch("/api/fetch/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: selectTypeValue,
          condition: selectConditionValue,
          value: textFieldValue
        })
      }).then(response => response.json());

      console.log("response", response);

      if (response.success == true) {
        setProductsData(response.data);
        if (response.data.length == 0) alert("No products found, try searching for something else");
      }
      setLoader1(false);
    } catch (error) {
      console.log("ERROR", error);
    }
  }

  async function handleSubmit() {
    try {
      setLoader2(true);
      const arr = [];
      for (let i = 0; i < getProductsData.length; i++) {
        arr.push(getProductsData[i].node.variants.edges[0].node.id);
      }

      const response = await fetch("/api/update/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          variants_arr: arr,
          price: value
        })
      }).then(response => response.json());

      setLoader2(false);
      handleChange();

      await handleFetchProducts();

      console.log("arr", arr);
    } catch (error) {
      console.log("ERROR", error);
    }
  }
}