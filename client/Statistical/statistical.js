document.addEventListener("DOMContentLoaded", function () {
  // Get token from cookie
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  const Token = token ? token.split("=")[1] : "";

  const yearSelector = document.getElementById("year");
  const barChart = document.querySelector(".bar-chart");

  // Get the current year
  const currentYear = new Date().getFullYear();
  yearSelector.value = currentYear; // Set the default value of the select to the current year

  // Call fetchStatisticalData with the current year when the page is loaded
  fetchStatisticalData(currentYear);

  // Listen for the event when the user selects a year
  yearSelector.addEventListener("change", function () {
    const selectedYear = yearSelector.value;
    fetchStatisticalData(selectedYear);
  });

  // Function to call API to get statistical data by year
  function fetchStatisticalData(year) {
    fetch(`http://localhost:3010/api/statistical`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
      body: JSON.stringify({ year: year }), // Send the selected year to the server
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Statistical data:", data);
        updateBarChart(data); // Function to update the chart with new data
      })
      .catch((error) => {
        console.error("Error calling API:", error);
      });
  }

  function updateBarChart(data) {
    // Remove old bars
    barChart.innerHTML = "";

    // Find the highest monthly revenue
    const maxTotal = Math.max(...data.map((item) => item.total_amount));

    // Create and update bars for each month
    data.forEach((item) => {
      const bar = document.createElement("div");
      const barHeight = Math.round((item.total_amount / maxTotal) * 400); // Calculate column height
      bar.classList.add("bar");
      bar.style.height = `${barHeight}px`; // Adjust height to fit the chart frame

      // Create month label
      const monthLabel = document.createElement("div");
      monthLabel.textContent = `Month ${item.month}`;
      monthLabel.classList.add("bar-label");

      // Create revenue value label
      const amountLabel = document.createElement("div");
      amountLabel.textContent = item.total_amount.toLocaleString(); // Format revenue
      amountLabel.classList.add("amount-label");

      // Add month label to the bar
      bar.appendChild(monthLabel);
      // Add revenue label to the top of the column
      bar.appendChild(amountLabel); // Add revenue label to the column

      // Position the amountLabel at the top of the column
      amountLabel.style.position = "absolute";
      amountLabel.style.bottom = "100%"; // Place at the top of the column
      amountLabel.style.transform = "translateX(-50%)"; // Center align

      // Add column to the chart
      barChart.appendChild(bar);
    });
  }
});
