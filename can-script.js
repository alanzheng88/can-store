
windowLoaded().then(fetchProducts, errorHandler)
              .then(initialize, errorHandler);

function errorHandler(error) {
  if (error.breakChain) {
    console.log('errorHandler: skip handling');
    return Promise.reject(error);
  }
  console.error(error);
}

function windowLoaded() {
  return new Promise(function (resolve, reject) {
    window.onload = resolve;
    window.onerror = function () {
      reject('Error loading window');
    };
  });
}

function fetchProducts() {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'products.json');
    xhr.responseType = 'json';
    xhr.onload = function() {
      resolve(xhr.response);
    }
    xhr.onerror = function() {
      reject('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
    xhr.send();
  });
}

function initialize(products) { 
  updateDisplay(products);
  var lastFilter = createInitialFilter();
  attachSearchBtnClickListener(products, lastFilter)
}

function createInitialFilter() {
  var category = document.querySelector('#category').value;
  var searchTerm = document.querySelector('#searchTerm').value;
  return {category, searchTerm};
}

function selectProducts({categoryGroup}) {
  console.log('selecting products');
  // group after category filter and search term filter applied
  var finalGroup;
  return new Promise(function(resolve, reject) {
    var searchTerm = document.querySelector('#searchTerm');
    if (searchTerm.value.trim() === '') {
      finalGroup = categoryGroup;
    } else {
      finalGroup = [];
      var lowerCaseSearchTerm = searchTerm.value.trim().toLowerCase();
      for (let product of categoryGroup) {
        var isLowerCaseProductName = product.name.indexOf(lowerCaseSearchTerm) != -1;
        if (isLowerCaseProductName) {
          finalGroup.push(product);
        }
      }
    } 
    resolve(finalGroup);
  });
}

function attachSearchBtnClickListener(products, lastFilter) {
  var searchBtn = document.querySelector('button');
  return new Promise(function(resolve, reject) {
    searchBtn.onclick = function(e) {
      e.preventDefault();
      console.log('searchBtn clicked!'); 
      //resolve({category, products});
      selectCategory({products, lastFilter})
        .then(selectProducts, errorHandler)
        .then(updateDisplay, errorHandler)
        .catch(function() {});
    }
  });
}

function selectCategory({products, lastFilter}) { 
  return new Promise(function(resolve, reject) { 
    var lastCategory = lastFilter.category;
    var lastSearchTerm = lastFilter.searchTerm;
    var category = document.querySelector('#category').value;
    var searchTerm = document.querySelector('#searchTerm').value;
    var hasSameCategory = lastCategory === category;
    var hasSameSearchTerm = lastSearchTerm === searchTerm; 
    if (hasSameCategory && hasSameSearchTerm) {
      reject({breakChain: true});   
    } else {
      // update record of last category and search term
      lastFilter.category = category;
      lastFilter.searchTerm = searchTerm;
      var categoryGroup = []; 
      if (category === 'All') {
        categoryGroup = products;
      } else { 
        var lowerCaseType = category.toLowerCase(); 
        for (let product of products) {
          // filtering by category
          if (product.type === lowerCaseType) {
            categoryGroup.push(product);
          }
        }
      }
      resolve({categoryGroup}); 
    }
  });
}

function fetchBlob(product) {
  var url = 'images/' + product.image;
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      var blob = xhr.response;
      resolve({product, blob});
    };
    xhr.onerror = function() {
      reject('Error fetching image from ' + url);
    }
    xhr.send();
  });
}

function updateDisplay(finalGroup) {
  var mainContainer = document.querySelector('main');
  // remove previous content of <main> element
  while (mainContainer.firstChild) {
    mainContainer.removeChild(mainContainer.firstChild);
  }

  // no products match search term so display message
  if (finalGroup.length === 0) {
    var para = document.createElement('p');
    para.textContent = 'No results to display!';
    mainContainer.appendChild(para);
  // display products
  } else {
    for (let product of finalGroup) {
      var productElement = fetchBlob(product).then(createProductElement, errorHandler);
      productElement.then(function (element) {
        mainContainer.appendChild(element);
      });
    }
  }
}

function createProductElement({product, blob}) {
  // convert blob to object URL - temporary internal URL that points to object stored in browser
  objectURL = URL.createObjectURL(blob);
  var section = document.createElement('section');
  var heading = document.createElement('h2');
  var para = document.createElement('p');
  var image = document.createElement('img');

  section.setAttribute('class', product.type);
  heading.textContent = product.name.replace(
                          product.name.charAt(0),
                          product.name.charAt(0).toUpperCase());
  para.textContent = '$' + product.price.toFixed(2);
  image.src = objectURL;
  image.alt = product.name;

  section.appendChild(heading);
  section.appendChild(para);
  section.appendChild(image);

  return new Promise(function(resolve, reject) {
    resolve(section);   
  });
}
