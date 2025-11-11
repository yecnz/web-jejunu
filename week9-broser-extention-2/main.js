const apiKeyInput = document.getElementById('api-key');
const searchWordInput = document.getElementById('search-word');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');
const errorsDiv = document.getElementById('errors');

searchBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    const searchWord = searchWordInput.value;

    if (!apiKey || !searchWord) {
        errorsDiv.textContent = 'API 키와 검색어를 모두 입력해야 합니다.';
        return;
    }

    const API_URL = 'https://dialect.korean.go.kr/dialect/openAPI/data';
    const queryParams = new URLSearchParams({
        apiKey: apiKey,
        searchWord: searchWord
    });

    const fullUrl = `${API_URL}?${queryParams.toString()}`;

    try {
        errorsDiv.textContent = '';
        resultsContainer.innerHTML = '<h2>검색 중...</h2>';

        const response = await fetch(fullUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }

        const data = await response.json();

        if (data.returnCode === 60000) {
            resultsContainer.innerHTML = ''; 
            
            if (data.totalCount === 0) {
                resultsContainer.textContent = '검색 결과가 없습니다.';
                return;
            }

            data.resultList.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                const dialect = document.createElement('h3');
                dialect.textContent = `[${item.dltTp}] (지역어)`;
                
                const standard = document.createElement('p');
                standard.textContent = `→ [${item.stdTp}] (표준어)`;

                const origin = document.createElement('p');
                origin.className = 'origin';
                origin.textContent = `(출처: ${item.source}, ${item.basisYear}년, ${item.sidoCd} 지역)`;
                
                resultItem.appendChild(dialect);
                resultItem.appendChild(standard);
                resultItem.appendChild(origin);
                resultsContainer.appendChild(resultItem);
            });

        } else if (data.returnCode === 60002) {
            errorsDiv.textContent = 'API 키가 유효하지 않습니다. (오류 60002)';
            resultsContainer.innerHTML = '';
        } else {
            errorsDiv.textContent = `알 수 없는 오류가 발생했습니다. (코드: ${data.returnCode})`;
            resultsContainer.innerHTML = '';
        }

    } catch (error) {
        console.error('Fetch 오류:', error);
        errorsDiv.textContent = '네트워크 오류 또는 API 호출에 실패했습니다.';
        resultsContainer.innerHTML = '';
    }
});