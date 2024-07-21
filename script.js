// This program fetches data from the PokeAPI and displays it in the window.
console.log("Hello World!");

let pokemonList = [];
let searchByNumber = true;

// Fetch list of Pokemon from PokeAPI
async function fetchPokemonList() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
        if (!response.ok) {
            throw new Error('Error fetching list of Pokemon.');
        }
        const data = await response.json();
        pokemonList = data.results;
        await fetchPokemonDetails();
        displayPokemon(pokemonList);
    } catch (error) {
        console.log('Could not fetch list of Pokemon: ', error);
    }
}




// Fetch detailed Pokémon information
async function fetchPokemonDetails() {
    try {
        for (const pokemon of pokemonList) {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + pokemon.name);
            if (!response.ok) {
                throw new Error('Error fetching Pokemon details.');
            }
            const data = await response.json();
            pokemon.id = data.id;
            pokemon.image = data.sprites.other['official-artwork'].front_default;
            
        }
    } catch (error) {
        console.error('Could not fetch Pokemon details: ', error);
    }
}

// Display Pokémon list
function displayPokemon(list) {
    const pokedexContainer = document.getElementById('pokedex');
    pokedexContainer.innerHTML = '';
    
    for (const pokemon of list) {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');

        // Create ID element
        const id = document.createElement('p');
        id.classList.add('pokemon-card-id');
        if (pokemon.id < 10) id.textContent = `#00${pokemon.id}`;
        else if (pokemon.id < 100) id.textContent = `#0${pokemon.id}`;
        else id.textContent = `#${pokemon.id}`;

        // Create image element
        const image = document.createElement('img');
        image.classList.add('pokemon-card-img');
        image.src = pokemon.image;
        image.alt = pokemon.name;

        // Create title element
        const name = document.createElement('h4');
        name.classList.add('pokemon-card-name');
        let temp = pokemon.name;
        temp = temp.charAt(0).toUpperCase() + temp.slice(1);
        name.textContent = temp;

        // Append elements
        pokemonCard.appendChild(id);
        pokemonCard.appendChild(image);
        pokemonCard.appendChild(name);
        pokedexContainer.appendChild(pokemonCard);
    }
}

function sortByName() {
    pokemonList.sort((a, b) => a.name.localeCompare(b.name));
    displayPokemon(pokemonList);
    searchByNumber = false;
}

function sortByNumber() {
    pokemonList.sort((a, b) => a.id - b.id);
    displayPokemon(pokemonList);
    searchByNumber = true;
}

function searchPokemon(list) {

}

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemonList();

    // Event delagation cause buttons are created dynamically
    document.body.addEventListener('click', (event) => {
        // Check if the clicked element has the class 'pop-btn num'
        if (event.target.closest('.pop-btn.num')) {
            sortByNumber();
        }
        // Check if the clicked element has the class 'pop-btn name'
        else if (event.target.closest('.pop-btn.name')) {
            sortByName();
        }
    });
    
    const searchInput = document.getElementById('form1');
    const searchClear = document.querySelector('.search-clear');

    searchInput.addEventListener('focus', () => {
        searchClear.style.display = 'block';
    })

    searchInput.addEventListener('blur', () => {
        if (searchInput.value.trim() === '') {
            searchClear.style.display = 'none';
        }
    })

    searchInput.addEventListener('input', () => {
        let searchQuery = searchInput.value.toLowerCase();
        if (searchQuery === '') {
            displayPokemon(pokemonList);
        }
        else { 
            if (searchQuery.startsWith('#')) {
                searchQuery = searchQuery.substring(1);
            } 

            if (/^\d+$/.test(searchQuery)) {
                const filteredList = pokemonList.filter(pokemon => pokemon.id == parseInt(searchQuery, 10));
                displayPokemon(filteredList);
            }
            else {
                const filteredList = pokemonList.filter(pokemon => pokemon.name.includes(searchQuery));
                displayPokemon(filteredList);
            }
        }
    });
    
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        displayPokemon(pokemonList);
        searchClear.style.display = 'none';
    });

    const popover = new bootstrap.Popover('.popover-dismiss', {
        trigger: 'focus'
    })
});

