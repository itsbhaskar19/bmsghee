const CART_STORAGE_KEY = "bms-cart";

function readCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
        console.error("Unable to read the shopping cart.", error);
        return {};
    }
}

let cartItems = readCart();

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
        console.error("Unable to save the shopping cart.", error);
    }
}

function formatPrice(amount) {
    return `₹${amount.toFixed(2)}`;
}

function getProductDetails(button) {
    const product = button.closest(".featured-product, .product-card");
    const nameElement = product.querySelector(
        ".name, .milk, .curd, .paneer, .junnu, h3, .featured-details h2:not(.price)"
    );
    const image = product.querySelector(".featured-image img, .small-product-image img");
    const priceElement = product.querySelector(".price, .small-price");
    const name = nameElement.textContent.trim();

    return {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        image: image.src,
        price: Number(button.dataset.price),
        priceLabel: priceElement.textContent.trim()
    };
}

function renderProductControls() {
    document.querySelectorAll(".add-cart, .product-quantity-control").forEach((control) => {
        const product = control.classList.contains("add-cart")
            ? getProductDetails(control)
            : {
                id: control.dataset.productId,
                name: control.dataset.productName,
                price: Number(control.dataset.productPrice),
                priceLabel: control.dataset.priceLabel
            };
        const quantity = cartItems[product.id]?.quantity || 0;

        if (quantity === 0) {
            if (!control.classList.contains("add-cart")) {
                const addButton = document.createElement("button");
                addButton.type = "button";
                addButton.className = "add-cart";
                addButton.dataset.name = product.name;
                addButton.dataset.price = String(product.price);
                addButton.textContent = "Add to Cart";
                control.replaceWith(addButton);
            }
            return;
        }

        const quantityControl = document.createElement("div");
        quantityControl.className = "product-quantity-control";
        quantityControl.dataset.productId = product.id;
        quantityControl.dataset.productName = product.name;
        quantityControl.dataset.productPrice = String(product.price);
        quantityControl.dataset.priceLabel = product.priceLabel;
        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.dataset.quantityChange = "-1";
        decreaseButton.setAttribute("aria-label", `Decrease ${product.name} quantity`);
        decreaseButton.textContent = "−";
        const quantityLabel = document.createElement("span");
        quantityLabel.setAttribute("aria-live", "polite");
        quantityLabel.textContent = String(quantity);
        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.dataset.quantityChange = "1";
        increaseButton.setAttribute("aria-label", `Increase ${product.name} quantity`);
        increaseButton.textContent = "+";
        quantityControl.append(decreaseButton, quantityLabel, increaseButton);

        control.replaceWith(quantityControl);
    });
}

function updateCartCount() {
    const count = Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll("#cart-count").forEach((badge) => {
        badge.textContent = String(count);
    });
}

function renderCartItems() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    container.replaceChildren();
    const items = Object.entries(cartItems);

    if (items.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent = "Your cart is empty. Add a product to get started.";
        container.appendChild(emptyMessage);
    }

    let subtotal = 0;
    items.forEach(([id, item]) => {
        subtotal += item.price * item.quantity;

        const row = document.createElement("article");
        row.className = "cart-item";
        row.dataset.productId = id;

        const imageContainer = document.createElement("div");
        imageContainer.className = "cart-product-image";
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;
        imageContainer.appendChild(image);

        const details = document.createElement("div");
        details.className = "cart-product-details";
        const name = document.createElement("h3");
        name.textContent = item.name;
        const price = document.createElement("p");
        price.textContent = item.priceLabel;
        const quantityControl = document.createElement("div");
        quantityControl.className = "quantity-control";
        const decreaseButton = document.createElement("button");
        decreaseButton.className = "quantity-btn";
        decreaseButton.type = "button";
        decreaseButton.dataset.quantityChange = "-1";
        decreaseButton.setAttribute("aria-label", `Decrease ${item.name} quantity`);
        decreaseButton.textContent = "−";
        const quantityLabel = document.createElement("span");
        quantityLabel.textContent = String(item.quantity);
        const increaseButton = document.createElement("button");
        increaseButton.className = "quantity-btn";
        increaseButton.type = "button";
        increaseButton.dataset.quantityChange = "1";
        increaseButton.setAttribute("aria-label", `Increase ${item.name} quantity`);
        increaseButton.textContent = "+";
        quantityControl.append(decreaseButton, quantityLabel, increaseButton);
        details.append(name, price, quantityControl);

        const itemTotal = document.createElement("div");
        itemTotal.className = "cart-item-right";
        const itemTotalLabel = document.createElement("h3");
        itemTotalLabel.textContent = formatPrice(item.price * item.quantity);
        itemTotal.appendChild(itemTotalLabel);

        row.append(imageContainer, details, itemTotal);
        container.appendChild(row);
    });

    const subtotalLabel = document.getElementById("cart-subtotal");
    const totalLabel = document.getElementById("cart-total");
    if (subtotalLabel) subtotalLabel.textContent = formatPrice(subtotal);
    if (totalLabel) totalLabel.textContent = formatPrice(subtotal);
}

function updateQuantity(id, amount) {
    const item = cartItems[id];
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
        delete cartItems[id];
    }

    saveCart();
    renderProductControls();
    renderCartItems();
    updateCartCount();
}

function checkoutWhatsApp() {
    const items = Object.values(cartItems);
    if (items.length === 0) {
        window.alert("Your cart is empty. Add a product before placing an order.");
        return;
    }

    const orderLines = items.map((item) =>
        `${item.name} — ${item.quantity} × ${item.priceLabel} = ${formatPrice(item.price * item.quantity)}`
    );
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const message = [
        "Hello, I would like to place this order:",
        "",
        ...orderLines,
        "",
        `Subtotal: ${formatPrice(subtotal)}`,
        "Please confirm availability and delivery charges."
    ].join("\n");
    const whatsappUrl = `https://wa.me/919392704153?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener");
}

document.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-quantity-change]");
    if (quantityButton) {
        const productControl = quantityButton.closest(".product-quantity-control");
        const cartRow = quantityButton.closest(".cart-item");
        const id = productControl?.dataset.productId || cartRow?.dataset.productId;
        if (id) updateQuantity(id, Number(quantityButton.dataset.quantityChange));
        return;
    }

    const addButton = event.target.closest(".add-cart");
    if (!addButton) return;

    const product = getProductDetails(addButton);
    if (!cartItems[product.id]) {
        cartItems[product.id] = { ...product, quantity: 1 };
        saveCart();
        renderProductControls();
        renderCartItems();
        updateCartCount();
    }
});

renderProductControls();
renderCartItems();
updateCartCount();
