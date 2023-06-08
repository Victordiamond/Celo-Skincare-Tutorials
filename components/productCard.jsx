import React from "react";

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
  return (
    <div className="card m-3" style={{ width: " 350px" }} key={id}>
      <div className="image-div">
        <img src={image} className="card-img-top" alt="..." />
      </div>
      <div className="card-body">
        <h5 className="card-title d-flex">
          <div>
            {" "}
            {brand} <br />
            <sup>{category}</sup>
          </div>
          <div className="price ms-auto">
            {amount / 1000000000000000000} cUSD
          </div>
        </h5>
        <ul className="nav flex-column">
          <li className="my-2">
            <b>Delivery time:</b> {deliveredWithin}
          </li>
          <li className="my-2">
            <b>Stock Count:</b> {numberOfStock} left
          </li>
        </ul>
        <button className="btn btn-primary" onClick={() => orderProduct(id)}>
          Order
        </button>
      </div>
    </div>
  );
}
