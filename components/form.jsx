import React, { useState } from "react";

export default function Form({ addProduct }) {
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
  // brand,
  // image,
  // category,
  // deliveredWithin,
  // numberOfStock,
  // amount
  return (
    <div className="form" onSubmit={(e) => handSubmit(e)}>
      <div className="container conti">
        <form>
          <div className="mb-3 row">
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
          </div>
          <div className="mb-3 row">
            <label htmlFor="inputName" className="col-4 col-form-label">
              Image
            </label>
            <div className="col-8">
              <input
                type="text"
                className="form-control"
                id="inputName"
                placeholder=" image urls"
                value={editProfileFormData.image}
                name="image"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="inputName" className="col-4 col-form-label">
              Catergory
            </label>
            <div className="col-8">
              <input
                type="text"
                className="form-control"
                id="inputName"
                placeholder="Catergory"
                value={editProfileFormData.category}
                name="category"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="inputName" className="col-4 col-form-label">
              Delivered Within
            </label>
            <div className="col-8">
              <input
                type="text"
                className="form-control"
                id="inputName"
                placeholder="Delivered Within"
                value={editProfileFormData.deliveredWithin}
                name="deliveredWithin"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="inputName" className="col-4 col-form-label">
              Number of Stock
            </label>
            <div className="col-8">
              <input
                type="number"
                className="form-control"
                id="inputName"
                placeholder="Number of Stock"
                value={editProfileFormData.numberOfStock}
                name="numberOfStock"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="inputName" className="col-4 col-form-label">
              Amount
            </label>
            <div className="col-8">
              <input
                type="number"
                className="form-control"
                id="inputName"
                placeholder="Amount"
                value={editProfileFormData.amount}
                name="amount"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
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
      </div>
    </div>
  );
}
