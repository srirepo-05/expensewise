processButton.addEventListener ('click', async () => {
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