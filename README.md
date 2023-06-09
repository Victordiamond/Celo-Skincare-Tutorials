---
title: Skincare Movie Ticketing Smart Contract on the Celo Blockchain
description: In this tutorial, you'll learn how to create a skincare product on Celo Blockchain
authors:
  - name: Victor Ubah (Victordiamond)
---

## Introduction

In this tutorial, we will be explaining a Solidity smart contract called "SkincareProduct". The contract allows users to add skincare products and order them using a custom token called "cUSD". We'll go through each section of the code, explain its purpose, and provide additional information where necessary
## Prerequisites

To follow along with this tutorial, you should have a basic understanding of Solidity, smart contracts and.

Also a basic understanding of web development, which should comprise of Javascript and React.

You should also have an environment set up to deploy and interact with:

- smart contracts, such as Remix
- Node.js and npm installed on your machine
- A Celo wallet or Celo-compatible wallet extension installed in your browser (e.g., Celo Extension Wallet)
- A Visual Studio Code

## SmartContract

Let's get started writing out our smart contract in Remix IDE

This is the complete code.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract SkincareProduct {
    uint internal productsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        address payable owner;
        string brand;
        string image;
        string category;
        string deliveredWithin;
        uint numberOfStock;
        uint amount;
        uint sales;
    }
    
    struct ProductRating {
        mapping(address => uint8) ratings;
    }
    
    struct ProductRefund {
        mapping(address => bool) refunds;
    }

    mapping (uint => Product) private products;
    mapping (uint => ProductRating) private productRatings;
    mapping (uint => ProductRefund) private productRefunds;

    event ProductOrdered (
        address _from,
        uint productId
    );
    event ProductReviewed (
        uint productId,
        uint8 rating
    );
    event ProductRefunded (
        uint productId,
        address refundAddress
    );

    function addProduct(
        string calldata _brand,
        string calldata _image,
        string calldata _category, 
        string calldata _deliveredWithin,
        uint _numberOfStock,
        uint _amount
    ) public {
        require(bytes(_brand).length > 0, "Empty brand");
        require(bytes(_image).length > 0, "Empty image");
        require(bytes(_category).length > 0, "Empty category");
        require(bytes(_deliveredWithin).length > 0, "Empty delivery date");
        require(_numberOfStock > 0, "Please enter a valid number of stock ");
        require(_amount > 0, "Please enter a valid amount");
        
        products[productsLength] = Product(
            payable(msg.sender),
            _brand,
            _image,
            _category,
            _deliveredWithin,
            _numberOfStock,
            _amount,
            0
        );
        productsLength++;
    }

    function getProduct(uint _index) public view returns (
        address payable,
        string memory, 
        string memory, 
        string memory, 
        string memory,
        uint, 
        uint,
        uint
    ) {
        Product storage p = products[_index];
        return (
            p.owner,
            p.brand, 
            p.image, 
            p.category, 
            p.deliveredWithin,
            p.numberOfStock, 
            p.amount,
            p.sales
        );
    }
    
    function orderProduct(uint _index) public payable {
        Product storage currentProduct = products[_index];
        require(currentProduct.numberOfStock > 0, "Not enough products in stock to fulfill this order");
        require(currentProduct.owner != msg.sender, "You can't purchase your own products");
        currentProduct.numberOfStock--;
        currentProduct.sales++;
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                currentProduct.owner,
                currentProduct.amount
            ),
            "Transfer failed."
        );
        emit ProductOrdered(msg.sender, _index);
    }
    
    function reviewProduct(uint _index, uint8 _rating) public {
        require(_rating >= 0 && _rating <= 5, "Invalid rating value");
        ProductRating storage rating = productRatings[_index];
        require(rating.ratings[msg.sender] == 0, "You have already reviewed this product");
        rating.ratings[msg.sender] = _rating;
        emit ProductReviewed(_index, _rating);
    }
    
    function refundProduct(uint _index) public {
        ProductRefund storage refund = productRefunds[_index];
        require(!refund.refunds[msg.sender], "You have already refunded this product");
        refund.refunds[msg.sender] = true;
        emit ProductRefunded(_index, msg.sender);
    }
    
    function getProductRating(uint _index, address _user) public view returns (uint8) {
        ProductRating storage rating = productRatings[_index];
        return rating.ratings[_user];
    }
    
    function hasRefunded(uint _index, address _user) public view returns (bool) {
        ProductRefund storage refund = productRefunds[_index];
        return refund.refunds[_user];
    }
    
    function getProductLength() public view returns (uint) {
        return productsLength;
    }
    
    function refundBuyer(uint _index, address _buyer) public {
        require(productsLength > _index, "Invalid product index");
        Product storage product = products[_index];
        require(msg.sender == product.owner, "Only the owner can initiate a refund");
        require(productRefunds[_index].refunds[_buyer], "Buyer has not requested a refund");
        
        product.numberOfStock++;
        product.sales--;
        
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                product.owner,
                _buyer,
                product.amount
            ),
            "Refund failed."
        );
        
        delete productRefunds[_index].refunds[_buyer];
    }
}

```

The `contract` declaration defines the SkincareProduct contract. It encapsulates all the variables, mappings, functions, and events defined within it.


**Contract Overview**

```solidity
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    // Interface for interacting with ERC20 tokens
    // ...
}

contract SkincareProduct {
    // Contract variables and mappings
    // ...
    
    // Contract events
    // ...
    
    // Contract functions
    // ...
}

```
#### Explanation

- We begin by defining the SPDX license identifier and specifying the Solidity compiler version.
- The `IERC20Token` interface represents the standard ERC20 token interface. It defines the functions required to interact with ERC20 tokens.
- The `SkincareProduct` contract is our main contract that implements the skincare product marketplace. It contains variables, mappings, events, and functions related to managing products, orders, reviews, and refunds.

**Contract Variables and Mappings**

Next, let's explore the variables and mappings used within the contract.

```solidity
contract SkincareProduct {
    uint internal productsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        // Product details
        // ...
    }
    
    struct ProductRating {
        // Mapping to store product ratings
        // ...
    }
    
    struct ProductRefund {
        // Mapping to track product refunds
        // ...
    }

    mapping (uint => Product) private products;
    mapping (uint => ProductRating) private productRatings;
    mapping (uint => ProductRefund) private productRefunds;

    // Events declaration
    // ...
    
    // Contract functions
    // ...
}

```

#### Explanation

- `productsLength  is an internal counter that keeps track of the number of products added to the marketplace.
- `cUsdTokenAddress` is the Ethereum address of an ERC20 token called "cUSD," which will be used for payment transactions within the marketplace.
- The `Product` struct represents a skincare product and stores its details such as owner, brand, image, category, delivery time, stock count, price, and sales.
- The `ProductRating` struct is used to store ratings given by users for each product.
- The `ProductRefund` struct keeps track of product refund requests made by users.
- The `products`, `productRatings`, and `productRefunds` mappings associate a unique product index with its corresponding details, ratings, and refund information, respectively.

**Contract Events**

Now, let's define the events emitted by the contract.

```solidity
contract SkincareProduct {
    // ...

    event ProductOrdered (
        address _from,
        uint productId
    );
    event ProductReviewed (
        uint productId,
        uint8 rating
    );
    event ProductRefunded (
        uint productId,
        address refundAddress
    );

    // Contract functions
    // ...
}

```

#### Explanation

- The `ProductOrdered` event is emitted when a user successfully places an order for a skincare product. It contains the address of the user and the product ID.
- The `ProductReviewed` event is emitted when a user submits a review for a purchased product. It includes the product ID and the rating given by the user.
- The `ProductRefunded` event is emitted when a user requests a refund for a purchased product. It includes the product ID and the address of the user who made the refund request.

**Adding Products**

In this step, we'll implement the function to add skincare products to the marketplace.

```solidity
contract SkincareProduct {
    // ...
    
    function addProduct(
        string calldata _brand,
        string calldata _image,
        string calldata _category, 
        string calldata _deliveredWithin,
        uint _numberOfStock,
        uint _amount
    ) public {
        // Input validation
        // ...
        
        // Add the product to the marketplace
        // ...
    }

    // ...
}

```

#### Explanation

- The `addProduct` function allows a user to add a new skincare product to the marketplace.
- The function takes various parameters such as brand, image URL, category, delivery time, stock count, and price.
- Before adding the product, the function performs input validation to ensure all required information is provided.
- If the validation passes, the function creates a new `Product` struct with the provided details and adds it to the `products` mapping.

**Retrieving Product Details**

Let's implement a function to retrieve details of a specific product.

```solidity
contract SkincareProduct {
    // ...
    
    function getProduct(uint _index) public view returns (
        address payable,
        string memory, 
        string memory, 
        string memory, 
        string memory,
        uint, 
        uint,
        uint
    ) {
        // Retrieve product details
        // ...
    }

    // ...
}

```

#### Explanation

- The `getProduct` function takes an index parameter and returns the details of the product at that index.
- It retrieves the corresponding `Product` struct from the `products` mapping and returns its owner, brand, image URL, category, delivery time, stock count, price, and sales information.

**Ordering a Product**

Let's implement the function for users to order a skincare product from the marketplace.

```solidity
contract SkincareProduct {
    // ...
    
    function orderProduct(uint _index) public payable {
        // Input validation and checks
        // ...
        
        // Decrease product stock count
        // ...
        
        // Transfer funds from buyer to seller
        // ...
        
        // Emit event
        // ...
    }

    // ...
}

```

#### Explanation

- The `orderProduct` function allows a user to order a skincare product by specifying the product index.
- Before placing the order, the function performs various validations and checks, such as ensuring sufficient stock and preventing users from purchasing their own products.
- If the checks pass, the function decreases the stock count of the product, transfers the required funds from the buyer to the seller (using the `transferFrom` function of the `cUSD` token), and emits the `ProductOrdered` event.

**Product Reviews and Refunds**

We'll now implement functions for users to review purchased products and request refunds.

```solidity
contract SkincareProduct {
    // ...
    
    function reviewProduct(uint _index, uint8 _rating) public {
        // Input validation and checks
        // ...
        
        // Add product rating
        // ...
        
        // Emit event
        // ...
    }
    
    function refundProduct(uint _index) public {
        // Input validation and checks
        // ...
        
        // Mark product as refunded
        // ...
        
        // Emit event
        // ...
    }

    // ...
}

```

#### Explanation

- The `reviewProduct` function allows a user to submit a review for a purchased product. It takes the product index and the rating as parameters, performs validations, adds the rating to the `productRatings` mapping, and emits the `ProductReviewed` event.
- The `refundProduct` function enables users to request refunds for purchased products. It takes the product index as a parameter, performs validations, marks the product as refunded in the `productRefunds` mapping, and emits the `ProductRefunded` event.

**Additional Helper Functions**

Let's implement some additional helper functions to retrieve product ratings and refund statuses.

```solidity
contract SkincareProduct {
    // ...
    
    function getProductRating(uint _index, address _user) public view returns (uint8) {
        // Retrieve product rating for a specific user
        // ...
    }
    
    function hasRefunded(uint _index, address _user) public view returns (bool) {
        // Check if a specific user has refunded a product
        // ...
    }
    
    function getProductLength() public view returns (uint) {
        // Get the total number of products in the marketplace
        // ...
    }

    // ...
}

```

#### Explanation

- The `getProductRating` function retrieves the rating given by a specific user for a particular product.
- The `hasRefunded` function checks whether a specific user has requested a refund for a product.
- The `getProductLength` function returns the total number of products available in the marketplace.

**Refund Feature**

The refund feature allows the vendor to refund a product to the buyer. When a refund is initiated, the product is returned to the vendor's inventory, and the buyer is reimbursed with the appropriate amount of cUSD tokens.

```solidity
function refundProduct(uint256 _index) public {
  require(_index < products.length, "Invalid product index");
  Product storage product = products[_index];

  require(product.owner == msg.sender, "You are not the owner of this product");
  require(product.refunds > 0, "There are no refunds available for this product");

  product.numberOfStock += 1;
  product.refunds -= 1;

  uint256 refundAmount = product.amount;

  require(cUSDTContract.transfer(msg.sender, refundAmount), "Failed to transfer cUSD tokens");

  emit ProductRefunded(_index, msg.sender, refundAmount);
}

```

#### Explanation

In this function:

- We check if the provided product index is valid and if the caller is the owner of the product.
- We ensure that there are available refunds for the product.
- If the conditions are met, we increase the stock of the product and decrease the number of refunds.
- The refund amount is calculated based on the original product amount.
- We transfer the refund amount in cUSD tokens to the buyer's address using the `transfer` function of the cUSD token contract.
- Finally, we emit an event `ProductRefunded` to notify the frontend or other parties about the product refund.


## Frontend

### App.js

Let's get started writing out our React Code in VS Code

This is the complete code.

```solidity
import "./App.css";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import SKINCARE from "./contracts/Skincare.abi.json";
import IERC from "./contracts/IERC.abi.json";
import ProductCard from "./components/productCard";
import Carousel from "./components/carousel";
import Form from "./components/form";

const ERC20_DECIMALS = 18;

const contractAddress = "0xC628cAd55cD31650014259C7B811A6B2483a8De6";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [Loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [products, setProducts] = useState([]);
  const [productLoading, setProductsLoading] = useState(true);
  const [tab, setTab] = useState("1");

  const connectToWallet = async () => {
    setLoading(true);
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];

        kit.defaultAccount = user_address;

        setAddress(user_address);
        setKit(kit);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    } else {
      setLoading(false);
      alert("Error Occurred");
    }
  };

  const getBalance = useCallback(async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const contract = new kit.web3.eth.Contract(SKINCARE, contractAddress);
      setContract(contract);
      setcUSDBalance(USDBalance);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, [address, kit]);

  useEffect(() => {
    connectToWallet();
  }, []);

  useEffect(() => {
    if (kit && address) {
      getBalance();
    }
  }, [kit, address, getBalance]);

  const getProducts = useCallback(async () => {
    const productsLength = await contract.methods.getProductLength().call();
    console.log(productsLength);
    const products = [];
    for (let index = 0; index < productsLength; index++) {
      let _products = new Promise(async (resolve, reject) => {
        let product = await contract.methods.getProduct(index).call();
        let rating = await contract.methods.getProductRating(index).call();
        let refunds = await contract.methods.getProductRefunds(index).call();

        resolve({
          index: index,
          owner: product[0],
          brand: product[1],
          image: product[2],
          category: product[3],
          deliveredWithin: product[4],
          numberOfStock: product[5],
          amount: product[6],
          sales: product[7],
          rating: rating,
          refunds: refunds,
        });
      });
      products.push(_products);
    }

    const _products = await Promise.all(products);
    console.log(_products);
    setProducts(_products);
    setProductsLoading(false);
  }, [contract]);

  useEffect(() => {
    if (contract) {
      getProducts();
    }
  }, [contract, getProducts]);

  const orderProduct = async (_index) => {
    const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);
    try {
      await cUSDContract.methods
        .approve(contractAddress, products[_index].amount)
        .send({ from: address });
      await contract.methods.orderProduct(_index).send({ from: address });
      getProducts();
      getBalance();
      alert(
        `You have successfully ordered ${products[_index].brand}. The product will be delivered in ${products[_index].deliveredWithin}.`
      );
    } catch (error) {
      alert(error);
    }
  };

  const refundProduct = async (_index) => {
    try {
      await contract.methods.refundProduct(_index).send({ from: address });
      getProducts();
      getBalance();
      alert(`You have successfully refunded the product.`);
    } catch (error) {
      alert(error);
    }
  };

  const addProduct = async (
    _brand,
    _image,
    _category,
    _deliveredWithin,
    _numberOfStock,
    _amount
  ) => {
    try {
      console.log(
        _brand,
        _image,
        _category,
        _deliveredWithin,
        _numberOfStock,
        _amount
      );
      let amount = new BigNumber(_amount)
        .shiftedBy(ERC20_DECIMALS)
        .toString();
      await contract.methods
        .addProduct(
          _brand,
          _image,
          _category,
          _deliveredWithin,
          _numberOfStock,
          amount
        )
        .send({ from: address });
      getProducts();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-dark   space">
        <div className="container">
          <a className="navbar-brand">
            SKIN<span className="logo">CARE</span> STORE
          </a>
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapsibleNavId"
            aria-controls="collapsibleNavId"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="collapsibleNavId">
            <ul className="navbar-nav me-auto mt-2 mt-lg-0 w-100">
              <li className="nav-item">
                <a className="nav-link active" href="#" aria-current="page">
                  Home <span className="visually-hidden">(current)</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#product-form">
                  Add Product
                </a>
              </li>
              <li className="nav-item ms-auto">
                {contract !== null && cUSDBalance !== null ? (
                  <div className="mt-1 text-white">
                    <b>{cUSDBalance} cUSD</b>
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={() => connectToWallet()}
                    disabled={Loading}
                  >
                    {Loading ? "Connecting..." : "Connect Wallet"}
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center">Skin Care Store</h1>
          </div>
          <div className="col-md-12">
            <div className="tabs">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item">
                  <a
                    className={`nav-link ${tab === "1" ? "active" : ""}`}
                    onClick={() => setTab("1")}
                  >
                    All Products
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${tab === "2" ? "active" : ""}`}
                    onClick={() => setTab("2")}
                  >
                    My Products
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-12">
            <div className="content">
              {tab === "1" ? (
                <>
                  <h2>All Products</h2>
                  {productLoading ? (
                    <p>Loading products...</p>
                  ) : (
                    <>
                      <div className="row">
                        {products.map((product) => (
                          <div className="col-md-3" key={product.index}>
                            <ProductCard
                              product={product}
                              orderProduct={orderProduct}
                              refundProduct={refundProduct}
                            />
                          </div>
                        ))}
                      </div>
                      {products.length === 0 && (
                        <p>No products available.</p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <h2>My Products</h2>
                  {productLoading ? (
                    <p>Loading products...</p>
                  ) : (
                    <>
                      <div className="row">
                        {products
                          .filter((product) => product.owner === address)
                          .map((product) => (
                            <div className="col-md-3" key={product.index}>
                              <ProductCard
                                product={product}
                                refundProduct={refundProduct}
                              />
                            </div>
                          ))}
                      </div>
                      {products.filter((product) => product.owner === address).length ===
                        0 && <p>No products available.</p>}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div id="product-form">
        <Form addProduct={addProduct} />
      </div>

      <Carousel />
    </>
  );
}

export default App;

```
Let's go through the code step by step and explain its functionality.

**Setting up the Environment**

First, import the necessary dependencies and styles for the application.

```solidity
import "./App.css";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import SKINCARE from "./contracts/Skincare.abi.json";
import IERC from "./contracts/IERC.abi.json";
import ProductCard from "./components/productCard";
import Carousel from "./components/carousel";
import Form from "./components/form";

```

#### Explanation

- The code imports required dependencies such as React, Web3, Celo ContractKit, BigNumber, and JSON files containing the ABIs (Application Binary Interface) of the smart contracts.
- It also imports custom components for displaying product cards, carousels, and a form

**Initializing State Variables**

Next, initialize the state variables that will store data in the application.

```solidity
const ERC20_DECIMALS = 18;

const contractAddress = "0xC628cAd55cD31650014259C7B811A6B2483a8De6";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [Loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [products, setProducts] = useState([]);
  const [productLoading, setProductsLoading] = useState(true);
  const [tab, setTab] = useState("1");
  
  // ...
}

```

#### Explanation

- The `ERC20_DECIMALS` constant represents the decimal places for the cUSD token, which is 18 in this case.
- The `contractAddress` variable holds the address of the Skincare smart contract deployed on the Celo blockchain.
- The `cUSDContractAddress` variable contains the address of the cUSD token contract on the Celo blockchain.
- Several state variables are initialized using the `useState` hook, including `Loading` to track loading status, `contract` to store the instance of the Skincare contract, `address` to hold the user's wallet address, `kit` to store the instance of the Celo ContractKit, `cUSDBalance` to track the user's cUSD balance, `products` to store the skincare products fetched from the contract, `productLoading` to track the loading status of products, and `tab` to keep track of the currently active tab in the UI.

**Connecting to the Wallet**

Implement the `connectToWallet` function to connect to the user's Celo wallet.

```solidity
const connectToWallet = async () => {
  setLoading(true);
  if (window.celo) {
    try {
      await window.celo.enable();
      const web3 = new Web3(window.celo);
      let kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      const user_address = accounts[0];

      kit.defaultAccount = user_address;

      setAddress(user_address);
      setKit(kit);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  } else {
    setLoading(false);
    alert("Error Occurred");
  }
};

```

#### Explanation

- The `connectToWallet` function is an asynchronous function that handles connecting to the user's Celo wallet.
- When the function is called, it first enables access to the Celo wallet using `window.celo.enable()`.
- It then creates a new instance of Web3 using the Celo provider `(window.celo)` and creates a new Celo ContractKit instance from the Web3 instance.
- The user's wallet address is retrieved using `kit.web3.eth.getAccounts()`, and the default account in the ContractKit instance is set to the user's address.
- Finally, the user's address and the ContractKit instance are set in the state variables `address` and `kit`, respectively.

**Retrieving User's Balance**

Implement the `getBalance` function to fetch the user's cUSD balance.

```solidity
const getBalance = useCallback(async () => {
  try {
    const balance = await kit.getTotalBalance(address);
    const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

    const contract = new kit.web3.eth.Contract(SKINCARE, contractAddress);
    setContract(contract);
    setcUSDBalance(USDBalance);
    setLoading(false);
  } catch (error) {
    console.log(error);
  }
}, [address, kit]);

```

#### Explanation

- The `getBalance` function is defined as an asynchronous function wrapped in the `useCallback` hook to memoize its reference.
- Inside the function, the `kit.getTotalBalance` method is used to fetch the total balance of the user's wallet address, including the cUSD token.
- The cUSD balance is then converted from the big number representation to a human-readable format with the decimal places shifted by `-ERC20_DECIMALS` and fixed to 2 decimal places.
- A new instance of the Skincare contract is created using `new kit.web3.eth.Contract(SKINCARE, contractAddress)`.
- The contract instance, cUSD balance, and loading status are updated in the state variables `contract`, `cUSDBalance`, and `Loading`, respectively.

**Connect to Wallet and Get Balance on Component Mount**

Initialize the connection to the wallet and fetch the user's balance when the component mounts.

```solidity
useEffect(() => {
  connectToWallet();
}, []);

useEffect(() => {
  if (kit && address) {
    getBalance();
  }
}, [kit, address, getBalance]);

```

#### Explanation

- The `useEffect` hook with an empty dependency array `[]` is used to call the `connectToWallet` function once when the component mounts.
- Another `useEffect` hook is used to fetch the user's balance whenever the `kit`, `address`, or `getBalance` functions change. This ensures that the balance is updated if the wallet or address changes.

**Fetching Products from the Skincare Contract**

Implement the `getProducts` function to retrieve skincare products from the Skincare contract.

```solidity
const getProducts = useCallback(async () => {
  const productsLength = await contract.methods.getProductLength().call();
  console.log(productsLength);
  const products = [];
  for (let index = 0; index < productsLength; index++) {
    let _products = new Promise(async (resolve, reject) => {
      let product = await contract.methods.getProduct(index).call();
      let rating = await contract.methods.getProductRating(index).call();
      let refunds = await contract.methods.getProductRefunds(index).call();

      resolve({
        index: index,
        owner: product[0],
        brand: product[1],
        image: product[2],
        category: product[3],
        deliveredWithin: product[4],
        numberOfStock: product[5],
        amount: product[6],
        sales: product[7],
        rating: rating,
        refunds: refunds,
      });
    });
    products.push(_products);
  }

  const _products = await Promise.all(products);
  console.log(_products);
  setProducts(_products);
  setProductsLoading(false);
}, [contract]);

```

#### Explanation

- The `getProducts` function is defined as an asynchronous function wrapped in the `useCallback` hook to memoize its reference.
- Inside the function, `productsLength` is obtained by calling the `getProductLength` method of the Skincare contract.
- An empty array `products` is initialized to store the individual product promises.
- A loop is executed from `index = 0` to `index < productsLength` to fetch each product's details.
- For each index, a new promise `_products` is created to asynchronously fetch the product, rating, and refunds details using `contract.methods.getProduct(index).call()`, `contract.methods.getProductRating(index).call()`, and `contract.methods.getProductRefunds(index).call()`.
- The promise resolves to an object containing the product details, including the index, owner, brand, image, category, deliveredWithin, numberOfStock, amount, sales, rating, and refunds.
- The resolved promises are pushed into the `products` array.
- The array of promises is then resolved using `Promise.all` to obtain an array of product objects `_products`.
- The `_products` array is logged to the console and set in the state variable `products`.
- The `productsLoading` state variable is set to `false` to indicate that the products have finished loading.

**Fetch Products on Contract Initialization**

Use the `useEffect` hook to fetch the products from the Skincare contract when the `contract` variable is set.

```solidity
useEffect(() => {
  if (contract) {
    getProducts();
  }
}, [contract, getProducts]);

```

#### Explanation

- The `useEffect` hook is used to fetch the products whenever the `contract` or `getProducts` function changes.
- When the `contract` variable is set, the `getProducts` function is called to retrieve the skincare products from the Skincare contract.

**Order Product**

Implement the `orderProduct` function to handle ordering a product from the Skincare contract.

```solidity
const orderProduct = async (_index) => {
  const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);
  try {
    await cUSDContract.methods
      .approve(contractAddress, products[_index].amount)
      .send({ from: address });
    await contract.methods.orderProduct(_index).send({ from: address });
    getProducts();
    getBalance();
    alert(
      `You have successfully ordered ${
        products[_index].brand
      }. The product will be delivered in ${
        products[_index].deliveredWithin
      }.`
    );
  } catch (error) {
    alert(error);
  }
};

```

#### Explanation

- The `orderProduct` function takes an index `_index` as a parameter to specify the product to order.
- A new instance of the cUSD contract is created using `new kit.web3.eth.Contract(IERC, cUSDContractAddress)`.
- The `cUSDContract` instance is used to approve the transfer of the product amount from the user's wallet to the Skincare contract using the `approve` method.
- The `approve` method is called with the `contractAddress` and the product amount (`products[_index].amount`).
- The transaction is sent using `.send({ from: address })`, specifying the user's wallet address.
- Once the approval is successful, the `contract.methods.orderProduct(_index).send({ from: address })` method is called to order the product from the Skincare contract.
- After the order is completed, the `getProducts` and `getBalance` functions are called to update the product list and the user's balance.
- Finally, an alert is shown to notify the user about the successful order and provide information about the product and delivery time.

**Render UI Components**

Render the UI components to display the products, user's balance, and a form for ordering a product.

```solidity
return (
  <div className="App">
    <header className="App-header">
      <h1>Skincare Shop</h1>
      {Loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Connected Account: {address}</p>
          <p>Balance: {cUSDBalance} cUSD</p>
        </>
      )}
      <div className="tabs">
        <button className={tab === "1" ? "active" : ""} onClick={() => setTab("1")}>
          Products
        </button>
        <button className={tab === "2" ? "active" : ""} onClick={() => setTab("2")}>
          Order
        </button>
      </div>
      {tab === "1" ? (
        <>
          {productLoading ? (
            <p>Loading products...</p>
          ) : (
            <Carousel>
              {products.map((product, index) => (
                <ProductCard
                  key={index}
                  index={product.index}
                  brand={product.brand}
                  image={product.image}
                  category={product.category}
                  deliveredWithin={product.deliveredWithin}
                  numberOfStock={product.numberOfStock}
                  amount={product.amount}
                  sales={product.sales}
                  rating={product.rating}
                  refunds={product.refunds}
                  orderProduct={orderProduct}
                />
              ))}
            </Carousel>
          )}
        </>
      ) : (
        <Form orderProduct={orderProduct} />
      )}
    </header>
  </div>
);

```

#### Explanation

- The UI components are rendered inside the `return` statement of the `App` component.
- The `header` section contains the title, connected account address, and cUSD balance. If `Loading` is `true`, a loading message is displayed; otherwise, the account address and balance are shown.
- The tab buttons are rendered as part of the `tabs` div. The active tab is highlighted based on the `tab` state variable. Clicking on a tab updates the `tab` state.
- The content inside each tab is conditionally rendered based on the `tab` state variable. If `tab` is `"1"`, the products carousel is rendered. If `tab` is `"2"`, the order form is rendered.
- Inside the products carousel, the `ProductCard` component is mapped over the `products` array to display each product's details.
- The `Form` component is rendered when the order tab is active, and the `orderProduct` function is passed as a prop to handle the ordering process.

**Refund Users**

This function is responsible for initiating the refund process when invoked.

```solidity
const refundProduct = async (_index) => {
  try {
    await contract.methods.refundProduct(_index).send({ from: address });
    getProducts();
    getBalance();
    alert(`You have successfully refunded the product.`);
  } catch (error) {
    alert(error);
  }
};

```

#### Explanation

- The `refundProduct` function is an asynchronous function that takes the `_index` parameter, representing the index of the product to be refunded.
- Inside the function, we use a try-catch block to handle any potential errors that may occur during the refund process.
- We call the `refundProduct` function of the smart contract by using `contract.methods.refundProduct(_index).send({ from: address })`. This sends a transaction to the smart contract, requesting the refund of the product at the specified index.
- After successfully initiating the refund transaction, we call the `getProducts` and `getBalance` functions. These functions are responsible for fetching the updated list of products and the current balance after the refund.
- Finally, we display an alert message to notify the user that the refund process was successful.

By updating the React frontend with the refundProduct function, you enable vendors to initiate refunds for products they own directly from the user interface.

### Carousel.jsx

**Importing React**

```solidity
import React from "react";

```
This line imports the React library, which is necessary for creating React components.

**Define the Carousel Component**

```solidity
function Carousel() {
  return (
    // JSX code representing the Carousel component
  );
}

```

The code defines a functional component called `Carousel`. Functional components are a way to define reusable UI components in React. The `Carousel` component returns JSX code that represents the structure and content of the component.

**Define theJSX Structure of the Carousel Component**

```solidity
<div className="container containercom">
  {/* ... */}
</div>

```

The Carousel component consists of a `<div>` element with the classes "container" and "containercom". This `<div>` acts as the main container for the carousel.

**Create the Carousel Header**

```solidity
<div className="row">
  <div className="col-6">
    <h3 className="mb-3 text-secondary">Just For You</h3>
  </div>
  <div className="col-6 text-right">
    {/* ... */}
  </div>
</div>

```

Inside the main container, there is a `<div>` element with the class "row". It contains two columns created using Bootstrap's grid system (`col-6 class`). In the first column, there is an `<h3>` element with the text "Just For You" and some additional classes for styling.

**Create Carousel Navigation Buttons**

```solidity
<div className="col-6 text-right">
  <a
    className="btn btn-secondary mb-3 mr-1"
    href="#carouselExampleIndicators2"
    role="button"
    data-slide="prev"
  >
    <i className="fa fa-arrow-left"></i>
  </a>
  <a
    className="btn btn-secondary mb-3"
    href="#carouselExampleIndicators2"
    role="button"
    data-slide="next"
  >
    <i className="fa fa-arrow-right"></i>
  </a>
</div>

```

In the second column of the header, there are two navigation buttons created as `<a>` elements. They have Bootstrap classes for styling (`btn, btn-secondary`) and Font Awesome icons (`fa fa-arrow-left` and `fa fa-arrow-right`). These buttons are used to navigate to the previous and next carousel items.

**Create the carousel Content**

```solidity
<div className="col-12">
  <div id="carouselExampleIndicators2" className="carousel slide" data-ride="carousel">
    <div className="carousel-inner">
      {/* Carousel items */}
    </div>
  </div>
</div>

```

Inside the main container, there is another `<div>` element with the class "col-12". It contains the carousel structure defined by the Bootstrap carousel component. The carousel items will be added inside the `<div>` with the class "carousel-inner".

**Create Carousel Items**

```solidity
<div className="carousel-item active">
  <div className="row">
    {/* ... */}
  </div>
</div>
<div className="carousel-item">
  <div className="row">
    {/* ... */}
  </div>
</div>
<div className="carousel-item">
  <div className="row">
    {/* ... */}
  </div>
</div>

```

Inside the carousel's inner container, there are multiple carousel items defined as `<div>` elements with the class "carousel-item". Each carousel item contains a `<div>` with the class "row".

**Create Cards within Carousel Items**

```solidity
<div className="col-md-4 mb-3">
  <div className="card card-size">
    <img className="img-fluid card-img" alt="100%x280" />
    <div className="card-body">
      <h4 className="card-title">Nivea Cream</h4>
      <p className="card-text">Gentle Care for Skin</p>
      <a href="#order_product" className="btn btn-primary">
        Order Product
      </a>
    </div>
  </div>
</div>

```

Within each carousel item, there is a `<div>` element with the class "col-md-4 mb-3". This creates a column within the row that displays a card. The card is defined using the `<div>` with the class "card card-size".

Inside the card, there is an `<img>` element with the class "img-fluid card-img" that represents the image of the product. The `alt` attribute is empty in this code snippet and should be filled with the appropriate image source for each product.

The card's body contains a `<h4>` element with the class "card-title" for the product name, a `<p>` element with the class "card-text" for the product description, and an `<a>` element with the classes "btn btn-primary" for the "Order Product" button.

**Repeat the Steps for Other Products**

The same structure as in Step 8 is repeated for other products within different carousel items. Each product card has a unique image, name, description, and "Order Product" button.

**Complete the Component**

```solidity
return (
  <div className="container containercom">
    <div className="row">
      <div className="col-6">
        <h3 className="mb-3 text-secondary">Just For You</h3>
      </div>
      <div className="col-6 text-right">
        {/* Navigation Buttons */}
      </div>
      <div className="col-12">
        <div id="carouselExampleIndicators2" className="carousel slide" data-ride="carousel">
          <div className="carousel-inner">
            {/* Carousel items */}
          </div>
        </div>
      </div>
    </div>
  </div>
);

```

Finally, the complete JSX structure of the `Carousel` component is returned. It includes the main container, header, navigation buttons, and the carousel structure with its inner container and items.

**Export the Carousel Component**

```solidity
export default Carousel;

```

The `Carousel` component is exported as the default export, making it available for use in other files.

### Form.jsx

**Import React and useState**

```solidity
import React, { useState } from "react";

```

The `React` object is imported from the "react" package, and the `useState` hook is imported from the "react" package as well. This hook allows us to add state to functional components.

**Define the Form component**

```solidity
export default function Form({ addProduct }) {
  // Component code goes here
}

```

The `Form` component is defined as a default export. It takes a prop called `addProduct` which is a function that will be called when the form is submitted.

**Define state and handle Change function**

```solidity
const [editProfileFormData, setEditProfileFormDate] = useState({
  brand: "",
  image: "",
  category: "",
  deliveredWithin: "",
  numberOfStock: "",
  amount: "",
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setEditProfileFormDate({ ...editProfileFormData, [name]: value });
};

```

The `useState` hook is used to define the `editProfileFormData` state object. It contains properties for the brand, image, category, deliveredWithin, numberOfStock, and amount of the product, all initially set to an empty string.

The `handleChange` function is defined to update the state values whenever the user types into the input fields. It uses object destructuring to extract the `name` and `value` from the event target (input field) and then calls `setEditProfileFormDate` to update the corresponding property in the state object.

**Define hand Submit function**

```solidity
function handSubmit(e) {
  e.preventDefault();

  addProduct(
    editProfileFormData.brand,
    editProfileFormData.image,
    editProfileFormData.category,
    editProfileFormData.deliveredWithin,
    editProfileFormData.numberOfStock,
    editProfileFormData.amount
  );
}

```

The `handSubmit` function is called when the form is submitted. It prevents the default form submission behavior to avoid page refresh.

The `addProduct` function (passed as a prop) is called with the values from the `editProfileFormData` state object as arguments. This allows the parent component to handle the submission and process the product data.

**Render the Form component**

```solidity
return (
  <div className="form" onSubmit={(e) => handSubmit(e)}>
    {/* Form JSX goes here */}
  </div>
);

```

The component returns JSX representing the form. It wraps the form content in a `<div>` with the class "form" and sets the `onSubmit` event to call the `handSubmit` function.

**Render the form content**

The JSX code within the `return` statement represents the form content. It includes a container `<div>`, a `<form>` element, and various form fields for the product information.

Each input field is associated with a corresponding property in the `editProfileFormData` state object. The `value` attribute is set to the corresponding state value, and the `onChange` event is set to call the `handleChange` function.

The last `<div>` contains a submit button that triggers the form submission.

That's the breakdown of the provided code. The `Form` component can be used within a React application to render a form for adding a product, and the entered data can be captured and processed using the `addProduct` prop function.

**Assign unique IDs to input fields**

```solidity
<label htmlFor="inputName" className="col-4 col-form-label">
  Name
</label>
<div className="col-8">
  <input
    type="text"
    className="form-control"
    value={editProfileFormData.brand}
    name="brand"
    onChange={(e) => handleChange(e)}
    id="inputName"
    placeholder=" Name"
  />
</div>

```

Each input field in the form has a unique `id` attribute associated with the `label` element. This is done to improve accessibility. The `htmlFor` attribute of the `label` element references the corresponding `id` of the input field.

**Implement form submission**

```solidity
<form>
  {/* Form fields */}
  <div className="mb-3 row">
    <div className="offset-sm-4 col-sm-8">
      <button
        type="submit"
        className="btn btn-primary long-btn btn-secondary"
      >
        ADD PRODUCT
      </button>
    </div>
  </div>
</form>

```

The form is wrapped within a `<form>` element. Inside the form, there are several `<div>` elements containing the form fields.

The last `<div>` contains the submit button, which triggers the form submission when clicked. The button has a type of "submit" and a class of "btn btn-primary long-btn btn-secondary" for styling purposes.

**Handle form submission**

```solidity
<div className="form" onSubmit={(e) => handSubmit(e)}>
  {/* Form content */}
</div>

```

The `onSubmit` event is attached to the outermost `<div>` wrapping the form content. The `handSubmit` function is passed as the event handler and will be called when the form is submitted.

**Export the Form component**

```solidity
export default function Form({ addProduct }) {
  // Component code
}

```

Finally, the `Form` component is exported as the default export of the module, allowing it to be imported and used in other parts of the application.

To use this component in your application, you would import it and pass the `addProduct` function as a prop. The `addProduct` function should handle the logic for adding the product to your data store or performing any other necessary actions.

That's the breakdown of the provided code. It demonstrates a basic form component in React that captures user input for a product and allows the data to be submitted.

**Define the `handleChange` function**

```solidity
const handleChange = (e) => {
  const { name, value } = e.target;
  setEditProfileFormDate({ ...editProfileFormData, [name]: value });
};

```

The `handleChange` function is called whenever the value of an input field changes. It takes an event object `e` as an argument and extracts the `name` and `value` properties from the target input element.

Using destructuring assignment, the `name` and `value` are extracted from `e.target`. The `name` corresponds to the `name` attribute of the input field, and the `value` is the new value entered by the user.

The `setEditProfileFormDate` function is then called with the spread syntax (`...editProfileFormData`) to create a copy of the current `editProfileFormData` state object. The `[name]: value` syntax is used to update the specific field identified by `name` with the new `value`.

**Define the `handSubmit` function**

```solidity
function handSubmit(e) {
  e.preventDefault();

  addProduct(
    editProfileFormData.brand,
    editProfileFormData.image,
    editProfileFormData.category,
    editProfileFormData.deliveredWithin,
    editProfileFormData.numberOfStock,
    editProfileFormData.amount
  );
}

```

The `handSubmit` function is called when the form is submitted. It takes an event object `e` as an argument.

The first line `e.preventDefault()` prevents the default form submission behavior, which would cause a page refresh.

The `addProduct` function, passed as a prop to the `Form` component, is then called with the values from the `editProfileFormData` state object as arguments. These values represent the input fields' values entered by the user.

**Render the form**

```solidity
return (
  <div className="form" onSubmit={(e) => handSubmit(e)}>
    <div className="container conti">
      <form>
        {/* Form fields */}
        {/* Submit button */}
      </form>
    </div>
  </div>
);

```

In the `return` statement, the form is rendered inside a containing `<div>` with the class name "form". The `onSubmit` event is attached to this `<div>`, and it calls the `handSubmit` function when the form is submitted.

The form itself is wrapped in a `<form>` element, and the form fields and submit button are rendered inside it.

**Export the `Form` component**

```solidity
export default function Form({ addProduct }) {
  // Component code
}

```

Finally, the `Form` component is exported as the default export of the module, allowing it to be imported and used in other parts of the application.

To use this `Form` component in your application, you would import it and include it in your parent component, passing the `addProduct` function as a prop. The `addProduct` function should handle the logic for adding the product to your data store or performing any other necessary actions.

### productCard.jsx

**Import React**

```solidity
import React from "react";

```

We start by importing the `React` module, which is required to define and use React components.

**Define the ProductCard component**

```solidity
export default function ProductCard({
  orderProduct,
  id,
  brand,
  image,
  category,
  deliveredWithin,
  numberOfStock,
  amount,
}) {
  // Component code
}

```

The `ProductCard` component is defined as a functional component using the `function` syntax. It takes an object as its argument, which contains the props passed to the component. These props represent the data for a specific product.

**Render the product card**

```solidity
return (
  <div className="card m-3" style={{ width: " 350px" }} key={id}>
    {/* Product image */}
    {/* Product details */}
    {/* Order button */}
  </div>
);

```

The `return` statement defines the JSX code to be rendered by the component. In this case, a `<div>` element with the class name "card" is created. It has some styling applied to set its width to 350 pixels. The `key` attribute is set to the `id` prop value to help React efficiently update and re-render the component when needed.

**Render the product image**

```solidity
<div className="image-div">
  <img src={image} className="card-img-top" alt="..." />
</div>

```

Inside the `<div>` element, an `<img>` element is rendered with the `src` attribute set to the value of the `image` prop. The `className` is set to "card-img-top" to apply appropriate styling, and the `alt` attribute is set to "..." to provide alternative text for the image.

**Render the product details**

```solidity
<div className="card-body">
  <h5 className="card-title d-flex">
    {/* Product brand and category */}
    {/* Product price */}
  </h5>
  <ul className="nav flex-column">
    {/* Delivery time */}
    {/* Stock count */}
  </ul>
</div>

```

Within the `<div>` element with the class name "card-body", the product details are rendered. The product brand and category are displayed inside an `<h5>` element with the class name "card-title". The `d-flex` class is added to make the content flexible and align it properly.

The product price is rendered inside a `<div>` element with the class name "price". The `ms-auto` class is added to push it to the right edge of the card.

The delivery time and stock count are rendered as list items (`<li>`) within a `<ul>` element with the class name "nav flex-column". Each detail is wrapped in a `<b>` element for bold styling.

**Render the order button**

```solidity
<button className="btn btn-primary" onClick={() => orderProduct(id)}>
  Order
</button>

```

A `<button>` element is rendered with the class name "btn btn-primary". When clicked, it triggers the `onClick` event and calls the `orderProduct` function passed as a prop, passing the `id` prop value as an argument.

**Export the ProductCard component**

```solidity
export default ProductCard;

```

The `ProductCard` component is exported as the default export of the module so that it can be imported and used in other parts of the application.

That's it! You have now created a reusable `ProductCard` component that can render product information in a card format. This component can be used in a larger application to display multiple product cards dynamically.

Here's an example of how you can use the `ProductCard` component in a parent component:

```solidity
import React from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products, orderProduct }) {
  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          orderProduct={orderProduct}
          {...product}
        />
      ))}
    </div>
  );
}

```

In the example above, the `ProductList` component receives an array of `products` as a prop. It iterates over each product and renders a `ProductCard` component for each one. The `orderProduct` function is passed as a prop to the `ProductCard` component, allowing interaction with the order button.

By encapsulating the product card rendering logic in the `ProductCard` component, you can reuse it throughout your application, ensuring consistency and reducing code duplication.

## Deployment

To deploy our smart contract successfully, we need the celo extention wallet which can be downloaded from [here](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en)

Next, we need to fund our newly created wallet which can done using the celo alfojares faucet [Here](https://celo.org/developers/faucet)

Now, click on the plugin logo at the bottom left corner and search for celo plugin.

Install the plugin and click on the celo logo which will show in the side tab after the plugin is installed.

Next connect your celo wallet, select the contract you want to deploy and finally click on deploy to deploy your contract.

## Conclusion

In this tutorial, we've built a decentralized skincare product marketplace on Ethereum using Solidity and for the Frontend using React. We covered key functions such as adding products, ordering products, reviewing them, and requesting refunds. By understanding this code, you now have the foundation to expand upon this marketplace and add more advanced features to meet your specific requirements.

## Next Steps

Here are some relevant links that would aid your learning further.

- [Official Celo Docs](https://docs.celo.org/)
- [Official Solidity Docs](https://docs.soliditylang.org/en/v0.8.17/)