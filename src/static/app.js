document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Générer la liste des participants
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants&nbsp;:</strong>
              <ul class="participants-list">
                ${details.participants.map((email, idx) => `<li>${email} <span class='delete-icon' title='Supprimer' onclick='unregisterParticipant("${name}", ${idx})'>&#128465;</span></li>`).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants&nbsp;:</strong>
              <span class="no-participants">Aucun inscrit pour le moment</span>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

// Fonction globale pour supprimer un participant côté client
window.unregisterParticipant = function(activityName, idx) {
  // Récupère l'activité et l'email du participant à supprimer
  fetch('/activities')
    .then(response => response.json())
    .then(activities => {
      if (activities[activityName]) {
        const email = activities[activityName].participants[idx];
        if (confirm(`Voulez-vous vraiment supprimer ${email} de l'activité ${activityName} ?`)) {
          // Animation de suppression
          const activityCards = document.querySelectorAll('.activity-card');
          activityCards.forEach(card => {
            if (card.querySelector('h4').textContent === activityName) {
              const participantItems = card.querySelectorAll('.participants-list li');
              if (participantItems[idx]) {
                participantItems[idx].style.transition = 'opacity 0.5s';
                participantItems[idx].style.opacity = '0.3';
              }
            }
          });
          setTimeout(() => {
            fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
              method: 'DELETE'
            })
            .then(response => response.json())
            .then(result => {
              // Affiche le message de confirmation
              const messageDiv = document.getElementById('message');
              messageDiv.textContent = result.message || 'Participant supprimé.';
              messageDiv.className = 'success';
              messageDiv.classList.remove('hidden');
              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 3000);
              // Recharge la liste des activités pour afficher la mise à jour
              fetchActivities();
            });
          }, 500);
        }
      }
    });
};

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Recharge la liste des activités pour afficher le nouveau participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
