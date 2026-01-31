function openInquiry(id) {
  fetch(`/admin/inquiry/${id}`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("modalContent").innerHTML = html;
      document.getElementById("inquiryModal").style.display = "block";
    });
}

function closeModal() {
  document.getElementById("inquiryModal").style.display = "none";
}

function toggleContacted(id) {
  fetch(`/admin/inquiry/${id}/toggle`, { method: "POST" })
    .then(() => location.reload());
}


document.addEventListener("click", function (e) {

    if (e.target.classList.contains("view-btn")) {
        const id = e.target.dataset.id;
        openInquiry(id);
    }

    if (e.target.classList.contains("toggle-btn")) {
        const id = e.target.dataset.id;
        toggleContacted(id);
    }

});

function openInquiry(id) {
    console.log("Open inquiry", id);
    // fetch(`/admin/inquiries/${id}`)
}

function toggleContacted(id) {
    console.log("Toggle contacted", id);
    // fetch(`/admin/inquiries/${id}/toggle`, { method: "POST" })
}
