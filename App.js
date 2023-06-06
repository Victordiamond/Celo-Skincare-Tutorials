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
                    onClick={() => {
                      setLoading(true);
                      connectToWallet();
                    }}
                  >
                    {Loading ? "Loading..." : "Connect"}
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section className="pt-5 pb-5">
        <Carousel />
      </section>
      <section id="order_product">
        <h2 className="text-center my-4">Buy Products</h2>
        <div className="d-flex justify-content-around flex-wrap">
          {productLoading ? (
            <div
              className="w-100 fs-2"
              style={{
                height: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Loading products...
            </div>
          ) : (
            <>
              {products.map((product) => {
                const {
                  index,
                  brand,
                  image,
                  category,
                  deliveredWithin,
                  numberOfStock,
                  amount,
                } = product;

                return (
                  <ProductCard
                    key={index}
                    id={index}
                    brand={brand}
                    image={image}
                    category={category}
                    deliveredWithin={deliveredWithin}
                    numberOfStock={numberOfStock}
                    amount={amount}
                    orderProduct={orderProduct}
                  />
                );
              })}
            </>
          )}
        </div>
      </section>

      <div className="container  form-div   cont" id="product-form">
        <h1 className="h1 text-center">ADD PRODUCT</h1>
        <Form addProduct={addProduct} />
      </div>
    </>
  );
}

export default App;
