document.addEventListener('DOMContentLoaded', () => {
    const uploader = document.getElementById('receiptUploader');
    const browseButton = document.getElementById('browseButton');
    const processButton = document.getElementById('processButton');
    const dropZone = document.getElementById('dropZone');
    const selectedFilesDiv = document.getElementById('selectedFiles');
    const filesListDiv = document.getElementById('filesList');
    const statusDiv = document.getElementById('status');
    const resultsSection = document.getElementById('resultsSection');
    const toggleResults = document.getElementById('toggleResults');
    const resultsDiv = document.getElementById('results');
    const analyzedCache = new Map();

    function getFileKey(file) {
        return `${file.name}_${file.size}_${file.lastModified}`;
    }


    if (toggleResults) {
        toggleResults.addEventListener('change', function () {
            if (this.checked) {
                resultsDiv.classList.remove('hidden');
            } else {
                resultsDiv.classList.add('hidden');
            }
        });
    }
    
    let selectedFiles = [];
    let expenseData = {
        monthly: {},
        categories: {}
    };

    // Currency conversion rates (approximate)
    const currencyRates = {
        'USD': 1,
        'EUR': 1.09,
        'GBP': 1.27,
        'INR': 0.012,
        'CAD': 0.74,
        'AUD': 0.66,
        'JPY': 0.007,
        'CNY': 0.14
    };

    // Initialize empty charts
    updateMonthlyChart();
    updateCategoryChart();

    // Browse button click handler
    browseButton.addEventListener('click', () => {
        uploader.click();
    });

    // File input change handler
    uploader.addEventListener('change', (event) => {
        handleFiles(Array.from(event.target.files));
    });

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-[#19e6c7]');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-[#19e6c7]');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-[#19e6c7]');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleFiles(files);
    });

    // Handle selected files
    function handleFiles(files) {
        selectedFiles = [...selectedFiles, ...files];
        updateFilesList();
        
        if (selectedFiles.length > 0) {
            selectedFilesDiv.classList.remove('hidden');
            processButton.disabled = false;
        }
    }

    // Update files list display
    function updateFilesList() {
        filesListDiv.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between bg-[#244742] rounded-lg p-3';
            fileItem.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 bg-[#19e6c7] rounded-full"></div>
                    <span class="text-white text-sm">${file.name}</span>
                    <span class="text-[#93c8c0] text-xs">(${(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onclick="removeFile(${index})" class="text-[#fa5838] hover:text-red-400 text-sm font-medium">Remove</button>
            `;
            filesListDiv.appendChild(fileItem);
        });
    }

    // Remove file function (global scope)
    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        updateFilesList();
        
        if (selectedFiles.length === 0) {
            selectedFilesDiv.classList.add('hidden');
            processButton.disabled = true;
        }
    };

    // Convert currency to USD
    function convertToUSD(amount, currency) {
        const rate = currencyRates[currency?.toUpperCase()] || 1;
        return amount * rate;
    }

    // Get month-year key from date
    function getMonthKey(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    // Update expense data with new receipt
    function updateExpenseData(receiptData) {
        const { total, currency, category, transactionDate } = receiptData;
        
        if (!total || !transactionDate) return;

        const usdAmount = convertToUSD(total, currency);
        const monthKey = getMonthKey(transactionDate);
        
        // Update monthly data
        if (monthKey) {
            expenseData.monthly[monthKey] = (expenseData.monthly[monthKey] || 0) + usdAmount;
        }
        
        // Update category data
        const cat = category || 'Other';
        expenseData.categories[cat] = (expenseData.categories[cat] || 0) + usdAmount;
    }

    // Update monthly spending chart
    function updateMonthlyChart() {
        const monthlyChartContainer = document.getElementById('monthlyChart');
        const monthlyTotal = document.getElementById('monthlyTotal');
        
        const sortedMonths = Object.keys(expenseData.monthly).sort();
        const totalSpending = Object.values(expenseData.monthly).reduce((sum, val) => sum + val, 0);
        
        monthlyTotal.textContent = `$${totalSpending.toFixed(0)}`;
        
        if (sortedMonths.length === 0) {
            monthlyChartContainer.innerHTML = `
                <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 149H472V149" stroke="#93c8c0" stroke-width="3" stroke-linecap="round"></path>
                    <defs>
                        <linearGradient id="paint0_linear_empty" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#244742"></stop>
                            <stop offset="1" stop-color="#244742" stop-opacity="0"></stop>
                        </linearGradient>
                    </defs>
                </svg>
                <div class="flex justify-around">
                    <p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">Jan</p>
                    <p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">Feb</p>
                    <p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">Mar</p>
                    <p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">Apr</p>
                    <p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">May</p>
                    <p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">Jun</p>
                    <p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">Jul</p>
                </div>
            `;
            return;
        }

        // Generate path for chart
        const maxAmount = Math.max(...Object.values(expenseData.monthly));
        const points = [];
        const labels = [];
        
        for (let i = 0; i < sortedMonths.length; i++) {
            const month = sortedMonths[i];
            const amount = expenseData.monthly[month];
            const x = (i / Math.max(sortedMonths.length - 1, 1)) * 472;
            const y = 149 - (amount / maxAmount) * 120;
            points.push(`${x} ${y}`);
            
            const date = new Date(month + '-01');
            labels.push(date.toLocaleDateString('en', { month: 'short' }));
        }
        
        const pathData = `M${points.join('L')}`;
        const areaData = `${pathData}V149H0V149Z`;
        
        monthlyChartContainer.innerHTML = `
            <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="${areaData}" fill="url(#paint0_linear_monthly)"></path>
                <path d="${pathData}" stroke="#93c8c0" stroke-width="3" stroke-linecap="round"></path>
                <defs>
                    <linearGradient id="paint0_linear_monthly" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#244742"></stop>
                        <stop offset="1" stop-color="#244742" stop-opacity="0"></stop>
                    </linearGradient>
                </defs>
            </svg>
            <div class="flex justify-around">
                ${labels.slice(0, 7).map(label => 
                    `<p class="text-[#93c8c0] text-[13px] font-bold leading-normal tracking-[0.015em]">${label}</p>`
                ).join('')}
            </div>
        `;
    }

    // Update category spending chart
   function updateCategoryChart() {
    const categoryChartContainer = document.getElementById('categoryChart');
    const categoryTotal = document.getElementById('categoryTotal');
    
    const categories = Object.keys(expenseData.categories);
    const totalSpending = Object.values(expenseData.categories).reduce((sum, val) => sum + val, 0);
    
    categoryTotal.textContent = `$${totalSpending.toFixed(0)}`;
    
    if (categories.length === 0) {
        categoryChartContainer.innerHTML = `
            <div class="flex items-center justify-center min-h-[180px]">
                <div class="text-center">
                    <div class="w-32 h-32 rounded-full border-4 border-[#244742] mx-auto mb-4"></div>
                    <p class="text-[#93c8c0] text-sm">No data available</p>
                </div>
            </div>
        `;
        return;
    }

    // Color palette for different categories
    const colors = [
        '#19e6c7', // Teal
        '#93c8c0', // Light teal
        '#4ade80', // Green
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#f97316', // Orange
        '#ec4899', // Pink
        '#84cc16'  // Lime
    ];

    const sortedCategories = categories.sort((a, b) => expenseData.categories[b] - expenseData.categories[a]);
    
    // Calculate angles for pie chart
    let currentAngle = 0;
    const pieData = sortedCategories.map((category, index) => {
        const amount = expenseData.categories[category];
        const percentage = (amount / totalSpending) * 100;
        const angle = (amount / totalSpending) * 360;
        const color = colors[index % colors.length];
        
        const data = {
            category,
            amount,
            percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            color
        };
        
        currentAngle += angle;
        return data;
    });

    // Generate SVG pie chart
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    let pathElements = '';
    
    pieData.forEach(slice => {
        const startAngleRad = (slice.startAngle - 90) * (Math.PI / 180);
        const endAngleRad = (slice.endAngle - 90) * (Math.PI / 180);
        
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');
        
        pathElements += `
            <path d="${pathData}" 
                  fill="${slice.color}" 
                  stroke="#11221f" 
                  stroke-width="2"
                  class="hover:opacity-80 transition-opacity cursor-pointer"
                  title="${slice.category}: $${slice.amount.toFixed(2)} (${slice.percentage.toFixed(1)}%)">
            </path>
        `;
    });

    // Generate legend
    const legendItems = pieData.map(slice => `
        <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 rounded-full" style="background-color: ${slice.color}"></div>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <span class="text-white text-xs font-medium">${slice.category}</span>
                    <span class="text-[#93c8c0] text-xs">$${slice.amount.toFixed(0)}</span>
                </div>
                <div class="text-[#93c8c0] text-xs">${slice.percentage.toFixed(1)}%</div>
            </div>
        </div>
    `).join('');

    categoryChartContainer.innerHTML = `
        <div class="flex items-center justify-between min-h-[180px] gap-4">
            <div class="flex-shrink-0">
                <svg width="200" height="200" viewBox="0 0 200 200" class="drop-shadow-lg">
                    ${pathElements}
                </svg>
            </div>
            <div class="flex-1 max-h-[180px] overflow-y-auto pr-2">
                ${legendItems}
            </div>
        </div>
    `;
}


    // Process receipts
    processButton.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            statusDiv.textContent = '⚠️ Please select at least one receipt image!';
            return;
        }

        processButton.disabled = true;
        processButton.innerHTML = '<span class="truncate">Processing...</span>';
        statusDiv.textContent = `🧠 Analyzing ${selectedFiles.length} receipt(s)...`;
        resultsDiv.innerHTML = '';
        resultsSection.classList.add('hidden');

        try {
            const results = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const fileKey = getFileKey(file);

                // Use cached result if available
                if (analyzedCache.has(fileKey)) {
                    results.push(analyzedCache.get(fileKey));
                    continue;
                }

                statusDiv.textContent = `🧠 Processing receipt ${i + 1} of ${selectedFiles.length}: ${file.name}`;
                const base64Image = await toBase64(file);

                const response = await fetch('/api/process-receipt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: base64Image,
                        mimeType: file.type
                    }),
                });

                const result = await response.json();
                let resultObj;

                if (result.success) {
                    try {
                        const jsonData = JSON.parse(result.data);
                        resultObj = {
                            filename: file.name,
                            success: true,
                            data: jsonData
                        };
                        // Update expense data
                        updateExpenseData(jsonData);
                    } catch (parseError) {
                        resultObj = {
                            filename: file.name,
                            success: false,
                            error: 'Failed to parse JSON response',
                            rawData: result.data
                        };
                    }
                } else {
                    resultObj = {
                        filename: file.name,
                        success: false,
                        error: result.error
                    };
                }

                // Cache the result
                analyzedCache.set(fileKey, resultObj);
                results.push(resultObj);
            }

            // Update charts
            updateMonthlyChart();
            updateCategoryChart();

            // Display results
            displayResults(results);
            statusDiv.textContent = `✅ Completed processing ${selectedFiles.length} receipt(s)`;

        } catch (error) {
            console.error('Error:', error);
            statusDiv.textContent = `❌ Failed to process receipts: ${error.message}`;
        } finally {
            processButton.disabled = false;
            processButton.innerHTML = '<span class="truncate">Analyze Receipts</span>';
        }
    });

    // Display results function
    function displayResults(results) {
        resultsDiv.innerHTML = '';
        resultsSection.classList.remove('hidden');

        results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'bg-[#244742] rounded-lg border border-[#34655e] p-6 break-words';
            
            if (result.success) {
                const usdAmount = convertToUSD(result.data.total, result.data.currency);
                resultCard.innerHTML = `
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-3 h-3 bg-[#19e6c7] rounded-full"></div>
                        <h3 class="text-white text-lg font-semibold">${result.filename}</h3>
                        <span class="text-[#19e6c7] text-sm">✅ Success</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-[#93c8c0] text-sm">Vendor</p>
                            <p class="text-white font-medium">${result.data.vendorName || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-[#93c8c0] text-sm">Date</p>
                            <p class="text-white font-medium">${result.data.transactionDate || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-[#93c8c0] text-sm">Total</p>
                            <p class="text-white font-medium text-lg">${result.data.currency || ''} ${result.data.total || 'N/A'} <span class="text-sm text-[#93c8c0]">(~$${usdAmount.toFixed(2)})</span></p>
                        </div>
                        <div>
                            <p class="text-[#93c8c0] text-sm">Category</p>
                            <p class="text-white font-medium">${result.data.category || 'N/A'}</p>
                        </div>
                    </div>
                    <details class="cursor-pointer">
                        <summary class="text-[#19e6c7] text-sm hover:text-[#93c8c0]">View Full JSON</summary>
                        <pre class="text-[#93c8c0] text-xs mt-2 p-3 bg-[#11221f] rounded overflow-auto max-h-40">${JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                `;
            } else {
                resultCard.innerHTML = `
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-3 h-3 bg-[#fa5838] rounded-full"></div>
                        <h3 class="text-white text-lg font-semibold">${result.filename}</h3>
                        <span class="text-[#fa5838] text-sm">❌ Failed</span>
                    </div>
                    <p class="text-[#fa5838] mb-2">Error: ${result.error}</p>
                    ${result.rawData ? `
                        <details class="cursor-pointer">
                            <summary class="text-[#19e6c7] text-sm hover:text-[#93c8c0]">View Raw Response</summary>
                            <pre class="text-[#93c8c0] text-xs mt-2 p-3 bg-[#11221f] rounded overflow-auto max-h-40">${result.rawData}</pre>
                        </details>
                    ` : ''}
                `;
            }
            
            resultsDiv.appendChild(resultCard);
        });
    }

    /**
     * Converts an image file to a Base64 string.
     * @param {File} file The file to convert.
     * @returns {Promise<string>} A promise that resolves with the Base64 string.
     */
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
});