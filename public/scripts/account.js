const btnTransfer = document.getElementById("transferOption");
const btnCancelTransfer = document.getElementById("cancelTranferBtn");
const modalContainer = document.getElementById("modalContainer");
const modal = document.getElementById("modal");

openModal = () => {
    modalContainer.style.display = "block";
    modal.style.display = "block";
};

closeModal = () => {
    modalContainer.style.display = "none";
    modal.style.display = "none";
};

btnCancelTransfer.addEventListener("click", closeModal());

makeTransfer = async () => {
  const userTo = document.getElementById("userTo").value;
  const amount = document.getElementById("amountTransfer").value;

  console.log(userTo, amount);
  const formData = new FormData();

  formData.append("userTo", userTo);
  formData.append("amount", amount);

  // Fix: Set headers to indicate form data is being sent
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  try {
    const response = await fetch(`http://localhost:3000/transferFunds/`, {
      method: "POST",
      // Pass form data and headers
      body: new URLSearchParams(formData),
      headers: headers,
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error(`Failed to check transfer. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error transfering", error);
    return null;
  } finally {
    closeModal();
  }
};