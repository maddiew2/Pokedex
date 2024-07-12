// This program fetches data from the PokeAPI and displays it in the window.
console.log("Hello World!");

let pokemonList = [];

// Fetch list of Pokemon list from PokeAPI
async function fetchPokemonList() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=9');
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

// Sorting functions
function sortByName() {
    pokemonList.sort((a, b) => a.name.localeCompare(b.name));
    displayPokemon(pokemonList);
}

function sortByNumber() {
    pokemonList.sort((a, b) => a.id - b.id);
    displayPokemon(pokemonList);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchPokemonList();

    const sortButton = document.getElementById('sort-button');
    sortButton.addEventListener('click', () => {
        console.log('Sort button clicked!');
        // Toggle dropdown or perform default sorting
        // For simplicity, you can directly call sort functions here
        sortByName(); // Default sorting
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            // Perform search logic
            const searchString = searchInput.value.trim().toLowerCase();
            const filteredList = pokemonList.filter(pokemon => pokemon.name.includes(searchString));
            displayPokemon(filteredList);
        }
    });
});

