// Add authentication check at the top
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!authManager.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Display user info in header
    const user = authManager.getCurrentUser();
    if (user) {
        // Update header with user info
        const userAvatar = document.querySelector('.bg-center.bg-no-repeat.aspect-square.bg-cover.rounded-full.size-10');
        if (userAvatar) {
            userAvatar.innerHTML = `
                <div class="w-full h-full bg-[#19e6c7] rounded-full flex items-center justify-center text-[#11221f] font-bold text-sm">
                    ${user.username.charAt(0).toUpperCase()}
                </div>
            `;
            userAvatar.style.backgroundImage = 'none';
            userAvatar.title = user.username;
            userAvatar.addEventListener('click', () => {
                authManager.logout();
            });
        }
    }

    // ...existing code...

    // Update the fetch request to include auth headers
    async function makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            ...authManager.getAuthHeaders(),
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Check if token is expired
        if (response.status === 401 || response.status === 403) {
            authManager.logout();
            return null;
        }

        return response;
    }

    // Update the process receipts function
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

                // Use authenticated request
                const response = await makeAuthenticatedRequest('/api/process-receipt', {
                    method: 'POST',
                    body: JSON.stringify({
                        image: base64Image,
                        mimeType: file.type
                    }),
                });

                if (!response) {
                    // User was logged out due to expired token
                    return;
                }

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

    // ...rest of existing code...
});