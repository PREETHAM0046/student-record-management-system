// =====================================
// TEACHER LOGIN CHECK
// =====================================

const teacher = JSON.parse(
    localStorage.getItem("teacher")
);

if (!teacher) {
    window.location.href = "teacher-login.html";
}


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    loadAnnouncements();

    document
        .getElementById("announcementForm")
        .addEventListener(
            "submit",
            createAnnouncement
        );
});


// =====================================
// CREATE ANNOUNCEMENT
// =====================================

async function createAnnouncement(event) {

    event.preventDefault();

    const title =
        document
            .getElementById("announcementTitle")
            .value
            .trim();

    const message =
        document
            .getElementById("announcementMessage")
            .value
            .trim();

    const messageBox =
        document.getElementById(
            "announcementMessageBox"
        );


    if (!title || !message) {

        showMessage(
            "Please enter both title and message.",
            "error"
        );

        return;
    }


    try {

        const response = await fetch(
            "http://localhost:5000/api/announcements",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    teacherId:
                        teacher.teacherId,

                    title: title,

                    message: message
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.message ||
                "Failed to publish announcement.",
                "error"
            );

            return;
        }


        showMessage(
            "Announcement published successfully! 📢",
            "success"
        );


        clearAnnouncementForm();


        await loadAnnouncements();


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "error"
        );
    }
}


// =====================================
// LOAD ANNOUNCEMENTS
// =====================================

async function loadAnnouncements() {

    const container =
        document.getElementById(
            "announcementsList"
        );


    try {

        const response = await fetch(
            "http://localhost:5000/api/announcements"
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load announcements"
            );
        }


        const announcements =
            await response.json();


        displayAnnouncements(
            announcements
        );


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="announcement-empty">
                <div class="announcement-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load announcements
                </h3>

                <p>
                    Please make sure the backend server is running.
                </p>
            </div>
        `;
    }
}


// =====================================
// DISPLAY ANNOUNCEMENTS
// =====================================

function displayAnnouncements(
    announcements
) {

    const container =
        document.getElementById(
            "announcementsList"
        );


    container.innerHTML = "";


    if (
        !announcements ||
        announcements.length === 0
    ) {

        container.innerHTML = `
            <div class="announcement-empty">

                <div class="announcement-empty-icon">
                    📭
                </div>

                <h3>
                    No announcements yet
                </h3>

                <p>
                    Create your first announcement for students.
                </p>

            </div>
        `;

        return;
    }


    announcements.forEach(
        announcement => {

            const card =
                document.createElement("div");

            card.className =
                "announcement-item";


            card.innerHTML = `

                <div class="announcement-item-top">

                    <div class="announcement-item-icon">
                        📢
                    </div>

                    <div class="announcement-item-content">

                        <h3>
                            ${escapeHTML(
                                announcement.title
                            )}
                        </h3>

                        <span class="announcement-date">
                            ${formatDate(
                                announcement.createdAt
                            )}
                        </span>

                    </div>

                    <button
                        class="announcement-delete-button"
                        onclick="deleteAnnouncement(
                            ${announcement.id}
                        )">

                        🗑️ Delete

                    </button>

                </div>


                <div class="announcement-item-message">

                    ${escapeHTML(
                        announcement.message
                    ).replace(/\n/g, "<br>")}

                </div>

            `;


            container.appendChild(card);
        }
    );
}


// =====================================
// DELETE ANNOUNCEMENT
// =====================================

async function deleteAnnouncement(
    announcementId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this announcement?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/announcements/${announcementId}`,
            {
                method: "DELETE"
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete announcement."
            );

            return;
        }


        await loadAnnouncements();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );
    }
}


// =====================================
// CLEAR FORM
// =====================================

function clearAnnouncementForm() {

    document
        .getElementById(
            "announcementForm"
        )
        .reset();

}


// =====================================
// MESSAGE
// =====================================

function showMessage(
    message,
    type
) {

    const box =
        document.getElementById(
            "announcementMessageBox"
        );


    box.textContent =
        message;


    box.className =
        `announcement-message-box ${type}`;


    setTimeout(() => {

        box.textContent = "";

        box.className =
            "announcement-message-box";

    }, 4000);
}


// =====================================
// DATE FORMAT
// =====================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =====================================
// SECURITY
// =====================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// =====================================
// NAVIGATION
// =====================================

function goToTeacherDashboard() {

    window.location.href =
        "teacher-dashboard.html";
}