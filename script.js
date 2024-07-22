// This program fetches data from the PokeAPI and displays it in the window.

let pokemonList = [];
let searchByNumber = true;

const typeColors = {
    normal: '#AAA67F',
    fire: '#F57D31',
    water: '#6493EB',
    electric: '#F9CF30',
    grass: '#74CB48',
    ice: '#9AD6DF',
    fighting: '#C12239',
    poison: '#A43E9E',
    ground: '#DEC16B',
    flying: '#A891EC',
    psychic: '#FB5584',
    bug: '#A7B723',
    rock: '#B69E31',
    ghost: '#70559B',
    dragon: '#7037FF',
    dark: '#75574C',
    steel: '#B7B9D0',
    fairy: '#E69EAC'
};

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
            pokemon.types = data.types.map(typeInfo => typeInfo.type.name);
            pokemon.weight = data.weight / 10;  // Correct weight
            pokemon.height = data.height / 10;  // Correct height
            pokemon.moves = data.moves.slice(0, 2).map(moveInfo => moveInfo.move.name);
            pokemon.baseStats = data.stats.map(statInfo => ({ stat: statInfo.stat.name, value: statInfo.base_stat }));
            
            // Fetch description from species endpoint
            const speciesResponse = await fetch(data.species.url);
            if (!speciesResponse.ok) {
                throw new Error('Error fetching Pokemon species details.');
            }
            const speciesData = await speciesResponse.json();
            const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
            pokemon.description = flavorTextEntry ? flavorTextEntry.flavor_text : 'No description available.';
            
            // Print details to console
            // console.log(`ID: ${pokemon.id}`);
            // console.log(`Name: ${pokemon.name}`);
            // console.log(`Image: ${pokemon.image}`);
            // console.log(`Types: ${pokemon.types}`);
            // console.log(`Weight: ${pokemon.weight}`);
            // console.log(`Height: ${pokemon.height}`);
            // console.log(`Moves: ${pokemon.moves}`);
            // console.log(`Base Stats: ${pokemon.baseStats.map(stat => `${stat.stat}: ${stat.value}`).join(', ')}`);
            // console.log(`Description: ${pokemon.description}`);
            
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
    if (window.location.pathname.includes('index.html')) {    
        fetchPokemonList();

        // If pokemon-card, open card.html with the id of the pokemon
        document.body.addEventListener('click', (event) => {
            if (event.target.closest('.pokemon-card')) {
                const pokemonName = event.target.closest('.pokemon-card').querySelector('.pokemon-card-name').textContent.toLowerCase();
                const selectedPokemon = pokemonList.find(pokemon => pokemon.name === pokemonName);
                localStorage.setItem('selectedPokemon', JSON.stringify(selectedPokemon));
                window.location.href = `card.html?name=${pokemonName}`;
            }
        });

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
    }
});



document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('card.html')) {
        console.log('card.html');

        const urlParams = new URLSearchParams(window.location.search);
        const pokemonName = urlParams.get('name');
        console.log(pokemonName);

        // Fetch and display the pokemon details
        const selectedPokemon = JSON.parse(localStorage.getItem('selectedPokemon'));
        if (selectedPokemon && selectedPokemon.name === pokemonName) {
            // Display the pokemon card
            displayPokemonDetails(selectedPokemon);
        } else {
            console.error('No Pokemon data found or name mismatch.');
        }

        // When the back button is clicked, go back to the previous page
        document.querySelector('.back-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});


function displayPokemonDetails(pokemon) {
    document.querySelector('.pokemon-info').textContent = pokemon.name;
    
    // Set the pokemon image
    const pokemonImgContainer = document.querySelector('.pokemon-img');
    pokemonImgContainer.innerHTML = ''; // Clear any existing content
    const pokemonImg = document.createElement('img');
    pokemonImg.src = pokemon.image;
    pokemonImg.alt = pokemon.name;
    pokemonImgContainer.appendChild(pokemonImg);
    
    // Set the types
    const typeContainer = document.querySelector('.type');
    typeContainer.innerHTML = ''; // Clear any existing content
    pokemon.types.forEach(type => {
        const typeDiv = document.createElement('div');
        typeDiv.classList.add('type-div');
        typeDiv.textContent = type;
        typeDiv.style.backgroundColor = typeColors[type]; // Apply type color
        typeContainer.appendChild(typeDiv);
    });

    // Set background color based on the first type
    const mainContainer = document.querySelector('.container');
    mainContainer.style.backgroundColor = typeColors[pokemon.types[0]]; // Apply background color
    
    // Create attributes
    const frameContainer = document.querySelector('.attribute .frame');
    frameContainer.innerHTML = ''; // Clear any existing content
    const weightDiv = document.createElement('div');
    weightDiv.textContent = `${pokemon.weight} kg`;
    frameContainer.appendChild(weightDiv);

    const heightDiv = document.createElement('div');
    heightDiv.textContent = `${pokemon.height} m`;
    frameContainer.appendChild(heightDiv);

    pokemon.moves.forEach(move => {
        const movesDiv = document.createElement('div');
        movesDiv.textContent = `${move}`;
        frameContainer.appendChild(movesDiv);
    });

    // Set description
    const descriptionContainer = document.querySelector('.description');
    descriptionContainer.textContent = pokemon.description;
    
    // Set base stats
    const baseStatsContainer = document.querySelector('.base-stats .data');
    baseStatsContainer.innerHTML = ''; // Clear any existing content
    pokemon.baseStats.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.classList.add('stat-div');

        const statValueDiv = document.createElement('div');
        statValueDiv.textContent = stat.value;
        statDiv.appendChild(statValueDiv);

        const statBarDiv = document.createElement('div');
        statBarDiv.classList.add('stat-bar');
        
        const statBarValueDiv = document.createElement('div');
        statBarValueDiv.classList.add('stat-bar-value');
        statBarValueDiv.style.width = `${stat.value}%`;
        statBarValueDiv.style.height = '4px';
        statBarValueDiv.style.backgroundColor = typeColors[pokemon.types[0]];
        statBarDiv.appendChild(statBarValueDiv);

        statDiv.appendChild(statBarDiv);
        baseStatsContainer.appendChild(statDiv);
    });

    // Set color of text
    const textContainers = document.querySelectorAll('h4, h6');
    textContainers.forEach(container => {
        container.style.color = typeColors[pokemon.types[0]]; // Assuming typeColors is a predefined object and pokemon.types[0].type.name is the correct path to the type name.
    });
}


