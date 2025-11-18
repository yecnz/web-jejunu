const apiKeyInput = document.getElementById('api-key');
const dataTypeSelect = document.getElementById('data-type');
const searchWordInput = document.getElementById('search-word');

const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');
const errorsDiv = document.getElementById('errors');

searchBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    const dataType = dataTypeSelect.value;
    const searchWord = searchWordInput.value;

    if (!apiKey || !dataType || !searchWord) {
        errorsDiv.textContent = 'API 키, 데이터 종류, 검색어를 모두 입력해야 합니다.';
        return;
    }

    const API_URL = 'http://www.museum.go.kr/uigwe/openapi/getData';
    const queryParams = new URLSearchParams({
        id: apiKey,
        datatype: dataType,
        keyword: searchWord,
        start: 1,
        end: 10 
    });

    const fullUrl = `${API_URL}?${queryParams.toString()}`;

    try {
        errorsDiv.textContent = ''; 
        resultsContainer.innerHTML = '<h2>검색 중...</h2>';

        const response = await fetch(fullUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }


        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const items = xmlDoc.querySelectorAll("item");

        if (items.length === 0) {
            resultsContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';
            return;
        }

        resultsContainer.innerHTML = ''; 

        items.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const title = item.querySelector("knamestring")?.textContent || "제목 없음";
            const content = item.querySelector("contentstring")?.textContent || "내용 요약 없음";

            resultItem.innerHTML = `
                <h3>${title}</h3>
                <p>${content.substring(0, 100)}...</p> 
            `;
            
            resultsContainer.appendChild(resultItem);
        });
        
    } catch (error) {
        console.error('Fetch 오류:', error);
        errorsDiv.textContent = '네트워크 오류 또는 API 호출에 실패했습니다.';
        resultsContainer.innerHTML = '';
    }
});