
import axios from 'axios';
const form = document.querySelector('.form-data');
const region = document.querySelector('.region-name');
const apiKey = document.querySelector('.api-key');
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const usage = document.querySelector('.carbon-usage');
const fossilfuel = document.querySelector('.fossil-fuel');
const myregion = document.querySelector('.my-region');
const clearBtn = document.querySelector('.clear-btn');

form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', (e) => reset(e));
init();

function reset(e) {
    e.preventDefault();
    localStorage.removeItem('regionName');
    init();
}

function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegion = localStorage.getItem('regionName');
    
    if (storedApiKey === null || storedRegion === null) {
    form.style.display = 'block';
    results.style.display = 'none';
    loading.style.display = 'none';
    clearBtn.style.display = 'none';
    errors.textContent = '';
    } else {
    displayCarbonUsage(storedApiKey, storedRegion);
    results.style.display = 'none';
    form.style.display = 'none';
    clearBtn.style.display = 'block';
    }
};

function handleSubmit(e) {
    e.preventDefault();
    setUpUser(apiKey.value, region.value);
}

function setUpUser(apiKey, regionName) {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('regionName', regionName);
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';
    displayCarbonUsage(apiKey, regionName);
}
async function displayCarbonUsage(apiKey, regionName) {
    const API_URL = `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${regionName}`;

    const headers = {
        'auth-token': apiKey,
    };

    try {
        const response = await axios.get(API_URL, { headers });

        loading.style.display = 'none';
        results.style.display = 'block';
        clearBtn.style.display = 'block';
        form.style.display = 'none';

        const data = response.data;
        const carbonIntensity = data.carbonIntensity;
        const fossilFuelPercentage = data.fossilFuelPercentage; 

        myregion.textContent = regionName;
        usage.textContent = Math.round(carbonIntensity);
        fossilfuel.textContent = Math.round(fossilFuelPercentage) || 'N/A';
        
    } catch (error) {
        console.error(error); 
        loading.style.display = 'none';
        results.style.display = 'none';
        errors.textContent = 'Failed to fetch data. Please check your API key or region name.';
        
        clearBtn.style.display = 'none'; 
        form.style.display = 'block';  
        
        localStorage.removeItem('apiKey');
        localStorage.removeItem('regionName');
    }
}