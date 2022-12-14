'use strict';

const getData = async (request) => {
    const url = `https://api.github.com/search/repositories?q=${request}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Could not fetch ${url}, status: ${response.status}`);
        }
        let data = await response.json();
       
        return data;
    } catch(e) {
        throw e;
    }
};

const dataMapper = (obj) => {
    return {
        name: obj.name,
        owner: obj.owner.login,
        stars: obj.stargazers_count
    }
}

const cleareResults = (wrapper, selector) => {
    const resultItems = wrapper.querySelectorAll(selector);

    if(resultItems.length !== 0) {
        resultItems.forEach((item) => {
            item.remove();
        })
    }
};

const getSearchResults = (data, wrapper, maxItems = 50) => {

    cleareResults(wrapper, '.search__result');

    let transformedData = data.items.slice(0, maxItems).map(dataMapper);

    transformedData.forEach((item, i) => {
        searchResults[i] = item;
        const resultItem = document.createElement('div');

        resultItem.classList.add('search__result');
        resultItem.setAttribute(`id`, i);
        resultItem.tabIndex = 0;
        resultItem.textContent = item.name;
        wrapper.append(resultItem);
    })
};

const debounce = (fn, debounceTime) => {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, debounceTime);
    }
};

class itemTab {
    constructor(item, parent) {
        this.name = item.name;
        this.owner = item.owner;
        this.stars = item.stars;
        this.parent = parent;
    }
    render() {
        const listItem = document.createElement('li');
        listItem.classList.add('list__item');
        listItem.insertAdjacentHTML('afterbegin',  
                                                    `<div class="list__description-wrapper">
                                                        <span class="list__description-text">Name: ${this.name}</span>
                                                        <span class="list__description-text">Owner: ${this.owner}</span>
                                                        <span class="list__description-text">Stars: ${this.stars}</span>
                                                    </div>
                                                    <button class="list__close-btn"></button>`
                                    );
        this.parent.append(listItem);
    }
}


const list = document.querySelector('.list');
const searchWrapper = document.querySelector('.search__wrapper');
const input = document.querySelector('.search__input');

const maxItemsPerShow = 5;

let searchResults = [];

input.addEventListener('input', () => {
    debounce(() => {
        if(input.value !== '') {
            getData(input.value)
                .then((data) => getSearchResults(data, searchWrapper, maxItemsPerShow))
                .catch((e) => console.log(e));
        } else {
            cleareResults(searchWrapper, '.search__result');
        }
    }, 500)();
    
});

searchWrapper.addEventListener('click', (e) => {
    if(e.target.classList.contains('search__result')) {
        const id = e.target.getAttribute('id')

        new itemTab(searchResults[id], list).render();
        cleareResults(searchWrapper, '.search__result');
        input.value = '';
    }
    
});

list.addEventListener('click', (e) => {
    if(e.target.classList.contains('list__close-btn')){
        const listItem = e.target.parentNode
        listItem.remove();
    }
});