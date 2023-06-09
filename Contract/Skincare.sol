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
