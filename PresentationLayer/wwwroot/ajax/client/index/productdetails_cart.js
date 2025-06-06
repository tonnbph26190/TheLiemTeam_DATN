﻿var currentUrl = window.location.href.split('#')[0];
var urlParts = currentUrl.split('/');
var ID = urlParts[urlParts.length - 1];
let selectedIdOptions = null;
let quantityInput;
let totalQuantity = 10;
let cartDataList = [];
let options_only = [];
let maxQuantity = 1; // default, sẽ cập nhật sau khi load từ API
function getJwtFromCookie() {
    return getCookieValue('jwt');
}
function getCookieValue(cookieName) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=').map(c => c.trim());
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    return null;
}
function getUserIdFromJwt(jwt) {
    try {
        const tokenPayload = JSON.parse(atob(jwt.split('.')[1]));
        return tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}
const jwt = getJwtFromCookie();
const userId = getUserIdFromJwt(jwt);
getProductDetailsById(ID);
function getProductDetailsById(ID) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://localhost:7241/api/ProductDetails/GetByID/${ID}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            document.getElementById('retal_price').innerText = `${data.smallestPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} - ${data.biggestPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} `;
            document.getElementById('quantity').innerText = `Số lượng: ${data.totalQuantity}`;
            document.getElementById('product_name').innerText = data.productName;
            document.getElementById('keycode').innerText = data.keyCode;
            document.getElementById('category').innerText = data.categoryName;
            document.getElementById('brandName').innerText = `Thương hiệu: ${data.brandName}`;
            document.getElementById('origin').innerText = `Xuất xứ: ${data.origin}`;
            document.getElementById('style').innerText = `Phong cách:${data.style}`;
            document.getElementById('manufacturersName').innerText = `Nhà sản xuất:${data.manufacturersName}`;
            document.getElementById('materialName').innerText = `Chất liệu:${data.materialName}`;
            document.getElementById('description').innerText = `Mô tả: ${data.description}`;
            if (data.isActive) {
                document.getElementById('isActive').innerText = " ( Đang bán )";
                document.getElementById('isActive').style.color = "green";
            } else {
                document.getElementById('isActive').innerText = " ( Đã ngừng bán )";
                document.getElementById('isActive').style.color = "red";
            }
            const sizeContainer = document.querySelector('.product__details__option__size');
            data.size.forEach(size => {
                const sizeItem = document.createElement('label');
                sizeItem.htmlFor = size;
                sizeItem.innerHTML = `
                  ${size}
                  <input type="radio" id="${size}" name="size">
                `;
                console.log('size', size);

                sizeContainer.appendChild(sizeItem);
            });

            const colorContainer = document.querySelector('.color-options');
            data.color.forEach((color) => {
                const colorItem = document.createElement('label');
                colorItem.htmlFor = color;
                colorItem.innerHTML = `
                    <input type="radio" id="${color}" name="color">
                    ${color}
                `;
                console.log('color', color);

                colorContainer.appendChild(colorItem);
            });
            updateProductImages(data.productDetails_ImagePaths);
            addOptionListeners();
        } else if (xhr.readyState === 4) {
            console.error('Error fetching product details by ID:', xhr.responseText);
            alert('Đã xảy ra lỗi khi lấy dữ liệu sản phẩm. Vui lòng thử lại sau.');
        }
    };
    xhr.send();
}
function updateProductImages(imagePaths) {
    const navTabs = document.querySelector('.nav.nav-tabs');
    const tabContent = document.querySelector('.tab-content');

    navTabs.innerHTML = '';
    tabContent.innerHTML = '';

    imagePaths.forEach((imagePath, index) => {
        const isActive = index === 0 ? 'active' : '';

        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        navItem.innerHTML = `
            <a class="nav-link ${isActive}" data-toggle="tab" href="#tabs-${index + 1}" role="tab">
                <div class="product__thumb__pic set-bg" data-setbg="${imagePath}">               
                    <img src="${imagePath}" alt="">
                </div>
            </a>
        `;
        navTabs.appendChild(navItem);

        const tabPane = document.createElement('div');
        tabPane.className = `tab-pane ${isActive}`;
        tabPane.id = `tabs-${index + 1}`;
        tabPane.role = 'tabpanel';
        tabPane.innerHTML = `
            <div class="product__details__pic__item">
                <img src="${imagePath}" alt="">
            </div>
        `;
        tabContent.appendChild(tabPane);
    });
}
function addOptionListeners() {
    document.querySelectorAll('.product__details__option__size input[type="radio"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            document.querySelectorAll('.product__details__option__size label').forEach(function (label) {
                label.classList.remove('active');
            });
            if (radio.checked) {
                radio.parentElement.classList.add('active');
                fetchProductDetails()
            }
        });
    });

    document.querySelectorAll('.color-options input[type="radio"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            document.querySelectorAll('.color-options label').forEach(function (label) {
                label.classList.remove('active');
            });
            if (radio.checked) {
                radio.parentElement.classList.add('active');
                fetchProductDetails()
            }
        });
    });
}
function fetchProductDetails() {
    const sizeRadio = document.querySelector('.product__details__option__size input[type="radio"]:checked');
    const colorRadio = document.querySelector('.color-options input[type="radio"]:checked');

    if (sizeRadio && colorRadio) {
        const size = encodeURIComponent(sizeRadio.id);
        const color = encodeURIComponent(colorRadio.id);
        const url = `https://localhost:7241/api/ProductDetails/GetProductDetailInfo/${ID}/?size=${size}&color=${color}`;

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log('data:', data);

                // Cập nhật thông tin sản phẩm
                document.getElementById('retal_price').innerText = data.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                document.getElementById('quantity').innerText = `Số lượng: ${data.stockQuantity}`;

                // Gán số lượng tối đa để kiểm soát tăng/giảm
                maxQuantity = data.stockQuantity;
                document.getElementById('quantityInput').value = 1;


                selectedIdOptions = data.idOptions;
                const quantityInput = document.getElementById('quantityInput');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                const product = {
                    idOptions: selectedIdOptions,
                    quantity: quantity,
                };
                console.log('selectedIdOptions:', selectedIdOptions);

                if (!product.idOptions || product.quantity < 1) {
                    Swal.fire({
                        title: 'Lỗi',
                        text: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                const optionUrl = `https://localhost:7241/api/Options/GetByID/${selectedIdOptions}`;
                const optionXhr = new XMLHttpRequest();
                optionXhr.open('GET', optionUrl, true);
                optionXhr.onload = function () {
                    if (optionXhr.status === 200) {
                        const optionData = JSON.parse(optionXhr.responseText);

                        product.colorName = optionData.colorName;
                        product.productName = optionData.productName;
                        product.sizeName = optionData.sizesName;
                        product.imageURL = optionData.imageURL;
                        product.retailPrice = optionData.retailPrice;
                        console.log('data.isActive:', optionData.isActive);

                        if (optionData.isActive) {
                            document.getElementById('isActive').innerText = " ( Đang bán )";
                            document.getElementById('isActive').style.color = "green";
                        } else {
                            document.getElementById('isActive').innerText = " ( Đã ngừng bán )";
                            document.getElementById('isActive').style.color = "red";
                        }

                        console.log('optionData:', optionData);
                        console.log('Product added:', product);
                    } else {
                        console.error('Có lỗi xảy ra khi gọi API.', optionXhr.responseText);
                    }
                };

                optionXhr.onerror = function () {
                    console.error('Có lỗi xảy ra khi gọi API.');
                };

                optionXhr.send();
            } else if (xhr.status === 404) {
                toastr.error("Phân loại không tồn tại. Vui lòng chọn tùy chọn khác.", 'Lỗi');
                clearActiveSize();
                clearActiveColor();
                console.log('Phân loại không tồn tại.');
            } else {
                console.error('Có lỗi xảy ra khi gọi API.', xhr.responseText);
            }
        };

        xhr.onerror = function () {
            console.error('Có lỗi xảy ra khi gọi API.');
        };

        xhr.send();
    } else {
        console.log('Vui lòng chọn cả size và màu.');
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const quantityInput = document.getElementById('quantityInput');

    // Chặn nhập ký tự không phải số
    quantityInput.addEventListener('keydown', function (e) {
        if (
            [46, 8, 9, 27, 13].includes(e.keyCode) || // delete, backspace, tab, escape, enter
            (e.keyCode >= 35 && e.keyCode <= 40)      // home, end, arrows
        ) {
            return;
        }

        // Chặn nếu không phải số
        if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    // Giới hạn giá trị khi người dùng nhập
    quantityInput.addEventListener('input', function () {
        quantityInput.value = quantityInput.value.replace(/\D/g, ''); // chỉ giữ số

        let val = parseInt(quantityInput.value) || 1;

        if (val > maxQuantity) val = maxQuantity;
        if (val < 1) val = 1;

        quantityInput.value = val;
    });


    // Cập nhật sau mỗi click (plugin đã xử lý click)
    const proQty = document.querySelector('.pro-qty');
    proQty.addEventListener('click', function (e) {
        if (e.target.classList.contains('qtybtn')) {
            setTimeout(() => {
                let val = parseInt(quantityInput.value) || 1;
                if (val > maxQuantity) val = maxQuantity;
                if (val < 1) val = 1;
                quantityInput.value = val;
            }, 0); // đợi plugin xử lý xong rồi mới giới hạn
        }
    });
});

// Hàm hủy chọn và xóa lớp active của size
function clearActiveSize() {
    const activeSizeLabel = document.querySelector('.product__details__option__size label.active');
    if (activeSizeLabel) {
        activeSizeLabel.classList.remove('active');
    }
    const selectedSizeRadio = document.querySelector('.product__details__option__size input[type="radio"]:checked');
    if (selectedSizeRadio) {
        selectedSizeRadio.checked = false;
    }
}

// Hàm hủy chọn và xóa lớp active của color
function clearActiveColor() {
    const activeColorLabel = document.querySelector('.color-options label.active');
    if (activeColorLabel) {
        activeColorLabel.classList.remove('active');
    }
    const selectedColorRadio = document.querySelector('.color-options input[type="radio"]:checked');
    if (selectedColorRadio) {
        selectedColorRadio.checked = false;
    }
}
document.getElementById('PayImmediately').addEventListener('click', function (event) {
    event.preventDefault();

    const sizeRadio = document.querySelector('.product__details__option__size input[type="radio"]:checked');
    const colorRadio = document.querySelector('.color-options input[type="radio"]:checked');

    if (!sizeRadio || !colorRadio) {
        Swal.fire({
            title: 'Lỗi',
            text: "Vui lòng chọn kích thước và màu sắc trước khi thanh toán!",
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
        return;
    }

    const quantityInput = document.getElementById('quantityInput');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    if (isNaN(quantity) || quantity <= 0) {
        Swal.fire({
            title: 'Lỗi',
            text: 'Số lượng không hợp lệ.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const xhrGetProduct = new XMLHttpRequest();
    xhrGetProduct.open('GET', `https://localhost:7241/api/Options/GetByID/${selectedIdOptions}`, true);

    xhrGetProduct.onload = function () {
        if (xhrGetProduct.status === 200) {
            const productData = JSON.parse(xhrGetProduct.responseText);
            const availableQuantity = productData.stockQuantity;
            console.log('productData', productData);

            if (productData.isActive === false) {
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Phân loại này đã ngừng bán! Vui lòng chọn phân loại khác!.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (quantity > availableQuantity) {
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Số lượng sản phẩm bạn muốn thêm lớn hơn số lượng có sẵn.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }

            Swal.fire({
                title: 'Xác nhận mua hàng',
                text: "Bạn có chắc chắn muốn mua sản phẩm này không?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    const product = {
                        idOptions: selectedIdOptions,
                        quantity: quantity,
                        colorName: productData.colorName,
                        productName: productData.productName,
                        sizeName: productData.sizesName,
                        imageURL: productData.imageURL,
                        retailPrice: productData.unitPrice
                    };

                    options_only.push(product);
                    console.log('Product added:', product);

                    const encodedCartData = encodeURIComponent(JSON.stringify(options_only));
                    const checkoutUrl = `${window.location.origin}/checkout_user?data=${encodedCartData}`;

                    window.location.href = checkoutUrl;
                }
            });
        } else {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    xhrGetProduct.onerror = function () {
        Swal.fire({
            title: 'Lỗi!',
            text: 'Có lỗi xảy ra khi lấy thông tin sản phẩm.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    };

    xhrGetProduct.send();
});

function addProductToCart() {
    const sizeRadio = document.querySelector('.product__details__option__size input[type="radio"]:checked');
    const colorRadio = document.querySelector('.color-options input[type="radio"]:checked');

    if (!sizeRadio || !colorRadio) {
        Swal.fire({
            title: 'Lỗi!',
            text: 'Vui lòng chọn kích thước và màu sắc trước khi thêm vào giỏ hàng.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const quantityInput = document.getElementById('quantityInput');
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

    if (isNaN(quantity) || quantity <= 0) {
        Swal.fire({
            title: 'Lỗi!',
            text: 'Số lượng không hợp lệ.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const xhrGetProduct = new XMLHttpRequest();
    xhrGetProduct.open('GET', `https://localhost:7241/api/Options/GetByID/${selectedIdOptions}`, true);

    xhrGetProduct.onload = function () {
        if (xhrGetProduct.status !== 200) {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể lấy thông tin sản phẩm. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const productData = JSON.parse(xhrGetProduct.responseText);
        const stockQuantity = productData.stockQuantity;

        if (!productData.isActive) {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Phân loại này đã ngừng bán! Vui lòng chọn phân loại khác.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (userId) {
            // Người dùng đã đăng nhập: lấy giỏ hàng server
            const xhrGetCart = new XMLHttpRequest();
            xhrGetCart.open('GET', `https://localhost:7241/api/Cart/cart/user/${userId}`, true);

            xhrGetCart.onload = function () {
                if (xhrGetCart.status !== 200) {
                    Swal.fire({
                        title: 'Lỗi!',
                        text: 'Đã xảy ra lỗi khi lấy dữ liệu giỏ hàng. Vui lòng thử lại.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                const cartData = JSON.parse(xhrGetCart.responseText);
                const idCart = cartData[0]?.id;
                const cartItems = cartData[0]?.cartOptions || [];
                console.log('Selected ID Option:', selectedIdOptions, typeof selectedIdOptions);
                console.log('Cart Items:', cartItems);

                //const existing = cartItems.find(item => item.idOptions === selectedIdOptions);
                const existing = cartItems.find(item => {
                    console.log('Compare', item.idOptions, typeof item.idOptions, 'with', selectedIdOptions, typeof selectedIdOptions);
                    return String(item.idOptions) === String(selectedIdOptions);
                });

                console.log('Existing item:', existing);
                const currentQty = existing ? parseInt(existing.quantity, 10) : 0;
                console.log('Current quantity:', currentQty);
                // Kiểm tra số lượng tồn kho
                if (currentQty >= stockQuantity) {
                    Swal.fire({
                        title: 'Thông báo!',
                        text: `Bạn đã thêm tối đa ${stockQuantity} sản phẩm vào giỏ hàng.`,
                        icon: 'info',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                if (currentQty + quantity > stockQuantity) {
                    const maxCanAdd = stockQuantity - currentQty;
                    Swal.fire({
                        title: 'Lỗi!',
                        text: `Bạn chỉ có thể thêm tối đa ${maxCanAdd} sản phẩm nữa.`,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                // Nếu kiểm tra OK mới gửi request thêm
                const data = {
                    idOptions: selectedIdOptions,
                    quantity: quantity,
                    idCart: idCart,
                    createBy: userId
                };

                const xhrAddToCart = new XMLHttpRequest();
                xhrAddToCart.open('POST', 'https://localhost:7241/api/CartOptions/AddToCart', true);
                xhrAddToCart.setRequestHeader('Content-Type', 'application/json');

                xhrAddToCart.onreadystatechange = function () {
                    if (xhrAddToCart.readyState === XMLHttpRequest.DONE) {
                        if (xhrAddToCart.status === 200) {
                            Swal.fire({
                                title: 'Thành công!',
                                text: 'Sản phẩm đã được thêm vào giỏ hàng.',
                                icon: 'success',
                                showCancelButton: true,
                                confirmButtonText: 'Đến giỏ hàng',
                                cancelButtonText: 'Tiếp tục mua sắm'
                            }).then(result => {
                                if (result.isConfirmed) {
                                    window.location.href = '/cart_index';
                                }
                            });
                        } else {
                            // Lỗi server trả về (ví dụ concurrency hoặc lỗi khác)
                            let errorMessage = 'Số lượng sản phẩm không thể vượt quá tồn kho.';
                            try {
                                const res = JSON.parse(xhrAddToCart.responseText);
                                if (res && res.message) errorMessage = res.message;
                            } catch { }

                            Swal.fire({
                                title: 'Lỗi!',
                                text: errorMessage,
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                };

                xhrAddToCart.send(JSON.stringify(data));
            };

            xhrGetCart.send();

        } else {
            // Người dùng chưa đăng nhập: dùng cookie
            const cartCookie = getCookieValue('cart');
            let cartDataList = cartCookie ? JSON.parse(cartCookie) : [];

            const existingIndex = cartDataList.findIndex(item => item.idOptions === selectedIdOptions);
            const currentQty = existingIndex !== -1 ? cartDataList[existingIndex].quantity : 0;

            if (currentQty >= stockQuantity) {
                Swal.fire({
                    title: 'Thông báo!',
                    text: `Bạn đã thêm tối đa ${stockQuantity} sản phẩm vào giỏ hàng.`,
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (currentQty + quantity > stockQuantity) {
                const maxCanAdd = stockQuantity - currentQty;
                Swal.fire({
                    title: 'Lỗi!',
                    text: `Bạn chỉ có thể thêm tối đa ${maxCanAdd} sản phẩm nữa.`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const product = {
                idOptions: selectedIdOptions,
                quantity: quantity
            };

            if (existingIndex !== -1) {
                cartDataList[existingIndex].quantity += quantity;
            } else {
                cartDataList.push(product);
            }

            document.cookie = `cart=${encodeURIComponent(JSON.stringify(cartDataList))}; path=/; max-age=${60 * 60 * 24 * 7}`;

            Swal.fire({
                title: 'Thành công!',
                text: 'Sản phẩm đã được thêm vào giỏ hàng.',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Đến giỏ hàng',
                cancelButtonText: 'Tiếp tục mua sắm'
            }).then(result => {
                if (result.isConfirmed) {
                    window.location.href = '/cart_index';
                }
            });
        }
    };

    xhrGetProduct.send();
}
document.getElementById('addToCartButton').addEventListener('click', function () {
    addProductToCart();
});
