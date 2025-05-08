let searchBtn = document.querySelector(".search-btn")
let suggestions = document.querySelector(".suggestions");
let navSearch = document.querySelector(".nav-search");


const debounce = (func,delay)=>{
  let timerId;
  return(...args) =>{
    clearTimeout(timerId);
    timerId = setTimeout(()=>{
      func(...args);
    },delay);
  }
}

const fetchData = async () => {
  suggestions.innerHTML = "";
  let inputValue = navSearch.value;

  if (inputValue === "") {
      suggestions.style.display = "none";
      return;
  } else {
      suggestions.style.display = "block";

      // Add loader
      const loader = document.querySelector("[data-loading-template]").content.cloneNode(true).children[0];
      suggestions.id = "suggestion-redesign";
      suggestions.appendChild(loader);
  }

  // Add artificial delay (e.g., 500ms)
  const minimumDelay = new Promise((resolve) => setTimeout(resolve, 500));

  // Fetch data from the backend
  const fetchData = fetch(`/search?q=${encodeURIComponent(inputValue)}`).then((response) =>
      response.json()
  );

  // Wait for both the fetch and the artificial delay to complete
  const data = await Promise.all([minimumDelay, fetchData]).then((results) => results[1]);

  // Clear the loader
  suggestions.innerHTML = "";

  if (data.length > 0) {
      suggestions.id = "";
      data.forEach((obj) => {
          const suggestionTemplate = document.querySelector("[data-suggestion-template]");
          const suggestionCart = suggestionTemplate.content.cloneNode(true).children[0];
          let para = suggestionCart.querySelector("[data-cart-p]");
          para.innerText = obj.title;
          suggestions.appendChild(suggestionCart);
      });
  } else {
      let p = document.createElement("p");
      p.innerText = "no listings found...";
      p.id = "list-not-found";
      suggestions.append(p);
  }
};
navSearch.addEventListener("input",debounce(fetchData,400));

suggestions.addEventListener("click", async(e) => {
  let suggestionCart = e.target.closest(".suggestions-cart");
  if (suggestionCart) {
      let value = suggestionCart.querySelector("[data-cart-p]").innerText;
     let response = await fetch(`/find?q=${encodeURIComponent(value)}`);
     let data = await response.json();
     window.location.href = `/listings/${data._id}`;
  }
});


searchBtn.addEventListener("click",()=>{
  let value = navSearch.value;
  console.log(value);
  if(value!=" "){
    window.location.href = `/listings/search?q=${value}`; 
  }
})

// used to hide and unhide the suggestion box
document.addEventListener("click",(e)=>{
  if(!suggestions.contains(e.target) && e.target !== navSearch){
    suggestions.style.display = "none";   
  }
})