const { Axios } = require("axios");

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

btnTransfer.addEventListener("click", openModal());
btnCancelTransfer.addEventListener("click", closeModal());

makeTransfer = async (userFrom, userTo, amount) => {
    console.log(userFrom, userTo, amount);
    const formData = new FormData();

    formData.append("username", username);
    formData.append("audio", audioBlob);
    //Needs to call the /transfer API and send the params to proceed with transfer
    try {
        const response = await fetch(`http://localhost:3000/transferFunds/`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const responseData = await response.json();
            return responseData;
        } else if (response.status === 404) {
            return null;
        } else {
            throw new Error(
                `Failed to check transfer. Status: ${response.status}`
            );
        }
    } catch (error) {
        console.error("Error transfering", error);
        return null;
    } finally {
        closeModal();
    }
}