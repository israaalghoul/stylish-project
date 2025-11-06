const API_URL = "https://dummyjson.com/products";

const productList = document.getElementById("productList");
const categoryList = document.getElementById("categoryList");
const searchInput = document.querySelector("#searchInput");
const currentPage = window.location.pathname;
//Pagination
const pagination = document.getElementById("pagination");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const pageNumbers = document.getElementById("page-numbers");
const pageLinksContainer = document.getElementById("page-links");
let currentPageProducts = 1;
const cardsPerPage = 8;

let allProducts = [];
let allCategories = [];
if (productList) {
  async function fetchProducts() {
    try {
      if (currentPage == "/index.html") {
        const res = await fetch(`${API_URL}?limit=8`);
        const data = await res.json();
        allProducts = data.products;
        renderProducts(currentPage);
      } else {
        const res = await fetch(`${API_URL}?limit=100`);
        const data = await res.json();
        allProducts = data.products;
        renderProducts(currentPageProducts);
        updatePagination();
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      productList.innerHTML = "<p>Failed to load products.</p>";
    }
  }

  let timeoutId;
  function debounce(cb, delay = 5_00) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      cb();
    }, delay);
  }

  function renderProducts(page) {
    productList.innerHTML = "";
    const startIndex = (page - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    let productsToShow = allProducts;
    if (currentPage == "/allProducts.html") {
      productsToShow = allProducts.slice(startIndex, endIndex);
    }
    productsToShow.forEach((product) => {
      const card = document.createElement("div");
      card.className = "col-sm-6 col-lg-4 col-xl-3 p-2";

      card.innerHTML = `
        <div class="card tot__products-card border-0 p-2">
          <div class="position-relative">
            <a href="#!">
              <div class="tot__products-fav-icon"><i class="fas fa-heart"></i></div>
            </a>
            <a href="product.html?id=${product.id}">
              <img src="${product.thumbnail}" alt="${product.title}" class="w-100" />
            </a>
            <h5 class="tot__products-ratings"><i class="fas fa-star me-1"></i>${product.rating}</h5>
          </div>
          <div class="card-body text-start px-1">
            <a href="product.html?id=${product.id}">
              <h5 class="tot__products-title">${product.title}</h5>
            </a>
            <div class="tot__products-details d-flex justify-content-between align-items-center px-1">
              <h5 class="tot__products-price my-2">$${product.price}</h5>
              <a href="#!">
                <h5 class="tot__products-cart"><i class="fas fa-shopping-cart"></i></h5>
              </a>
            </div>
          </div>
        </div>
      `;
      productList.appendChild(card);
    });
  }
  //Pagination
  if (currentPage == "/allProducts.html") {
    function generatePageLinks(totalPages) {
      pageLinksContainer.innerHTML = "";

      for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement("a");
        link.href = "#";
        link.classList.add("page-link");
        link.dataset.page = i;
        link.textContent = i;

        if (i === currentPageProducts) {
          link.classList.add("active");
        }

        link.addEventListener("click", (e) => {
          e.preventDefault();
          currentPageProducts = i;
          renderProducts(currentPageProducts);
          updatePagination();
        });

        pageLinksContainer.appendChild(link);
      }
    }
    function updatePagination() {
      const totalPages = Math.ceil(allProducts.length / cardsPerPage);
      pageNumbers.textContent = `Page ${currentPageProducts} of ${totalPages}`;
      prevButton.disabled = currentPageProducts === 1;
      nextButton.disabled = currentPageProducts === totalPages;
      generatePageLinks(totalPages);
    }

    prevButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPageProducts > 1) {
        currentPageProducts--;
        renderProducts(currentPageProducts);
        updatePagination();
      }
    });

    nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      const totalPages = Math.ceil(allProducts.length / cardsPerPage);
      if (currentPageProducts < totalPages) {
        currentPageProducts++;
        renderProducts(currentPageProducts);
        updatePagination();
      }
    });
  }
  // Search
  function getInputValue() {
    return searchInput.value.trim().toLowerCase();
  }

  function searchProducts() {
    debounce(() => {
      const inputValue = getInputValue();
      const matchedProducts = allProducts.filter((product) =>
        product.title.toLowerCase().includes(inputValue)
      );
      renderProducts(matchedProducts);
    });
  }
  if (currentPage == "/index.html") {
    searchInput.addEventListener("input", searchProducts);
  }
  fetchProducts();
}
// Details product
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
if (!!productId) {
  fetch(`${API_URL}/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      document.getElementById("detail-heading").textContent = product.title;
      document.getElementById("detail-rating").textContent = product.rating;
      document.getElementById(
        "detail-stock"
      ).textContent = `${product.stock} in stock`;
      document.getElementById("detail-content").textContent =
        product.description;
      document.getElementById("detail-price").textContent = `$${product.price}`;
      document.getElementById("detail-main-img").src = product.thumbnail;

      const gallery = document.getElementById("detail-gallery");
      gallery.innerHTML = product.images
        .slice(1, 3)
        .map(
          (img) => `  
            <a href="#!">
              <li><img src="${img}" alt="${product.title}" class="img-fluid"/></li>
            </a>  
          `
        )
        .join("");
    })
    .catch((error) => {
      console.error("Error fetching product:", error);
      document.getElementById("tot__detail").innerHTML =
        "<p>Failed to load product details.</p>";
    });
}
// Category
if (currentPage == "/index.html") {
  async function fetchCategory() {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      allCategories = data.slice(0, 5);
      const categoryData = await Promise.all(
        allCategories.map(async (i) => {
          const cat = i.name;
          const res = await fetch(`${API_URL}/category/${cat}?limit=1`);
          const data = await res.json();
          const firstProduct = data.products[0];
          return {
            name: cat,
            image:
              firstProduct?.thumbnail ||
              "https://cdn.easyfrontend.com/pictures/ecommerce/product27.jpg",
          };
        })
      );
      renderCategory(categoryData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      categoryList.innerHTML = "<p>Failed to load categories.</p>";
    }
  }

  function renderCategory(categories) {
    categoryList.innerHTML = "";
    categories.forEach((category) => {
      const cardCategory = document.createElement("div");
      cardCategory.className = "col-sm-6 col-md-4 col-lg-3 col-xl-2 p-2";
      cardCategory.innerHTML = `
       <a href="">
            <div class="card tot__category-card">
                    <img src="${category.image}"
                            class="card-img-top" alt="${category.name}" />
                    <div class="card-body text-start pb-0">
                            <h5 class="tot__category-card-title m-0">${category.name}</h5>
                            <p class="tot__category-card-text">209 Products</p>                               
                    </div>
            </div>
        </a>`;
      categoryList.appendChild(cardCategory);
    });
  }
  fetchCategory();
}
