
windowLoaded().then(fetchProducts, errorHandler)
              .then(initialize, errorHandler);

function errorHandler(errorMsg) {
  console.error(errorMsg);
}

function windowLoaded() {
  return new Promise(function (resolve, reject) {
    window.onload = resolve;
    window.onerror = reject;
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
  var category = document.querySelector('#category');

  var lastCategory = category.value;
  var lastSearch = '';

  // categoryGroup is the group to search by
  var categoryGroup = [];
  // finalGroup contains products after searching is done
  var finalGroup = [];

  finalGroup = products;
  updateDisplay(finalGroup);

  searchBtnClick(category, lastCategory, lastSearch)
      .then(selectCategory)
      .then(function(categoryValue) { 
        lastCategory = category.value;
        lastSearch = searchTerm.value.trim();
        return new Promise(function(resolve, reject) {
          if (categoryValue === 'All') {
            categoryGroup = products;
            resolve({finalGroup, categoryGroup});
          } else { 
            var lowerCaseType = category.value.toLowerCase();
            for (let product of products) {
              if (product.type === lowerCaseType) {
                categoryGroup.push(product);
              }
            }
          } 
          resolve({finalGroup, categoryGroup});
        });
      }, doNothing)
      .then(selectProducts)
      .then(updateDisplay);

  function doNothing() {
    console.log('Doing nothing...');
    return null;
  }
}

function selectProducts({finalGroup, categoryGroup}) {
  console.log('selecting products');
  return new Promise(function(resolve, reject) {
    var searchTerm = document.querySelector('#searchTerm');
    if (searchTerm.value.trim() === '') {
      finalGroup = categoryGroup;
    } else {
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

function searchBtnClick(category, lastCategory, lastSearch) {
  var searchBtn = document.querySelector('button');
  return new Promise(function(resolve, reject) {
    searchBtn.onclick = function(e) {
      e.preventDefault();
      console.log('searchBtn clicked!');
      resolve(category, lastCategory, lastSearch);
    }
  });
}

function selectCategory(category, lastCategory, lastSearch) { 
  return new Promise(function(resolve, reject) {
    console.log('selecting category');
    var sameCategoryAsLastSearch = category.value === lastCategory;
    var searchTermSameAsLastSearch = searchTerm.value.trim() === lastSearch;
    if (sameCategoryAsLastSearch && searchTermSameAsLastSearch) {
      reject();   
    } else {
      // update record of last category and search term
      resolve(category.value);
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
