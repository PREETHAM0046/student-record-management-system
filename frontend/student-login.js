// ==========================================
// STUDENT LOGIN
// ==========================================

const studentLoginForm =
    document.getElementById("studentLoginForm");

const studentLoginMessage =
    document.getElementById("studentLoginMessage");


// ==========================================
// LOGIN FORM
// ==========================================

studentLoginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const usn =
            document
                .getElementById("studentUSN")
                .value
                .trim();

        const name =
            document
                .getElementById("studentName")
                .value
                .trim();


        // ==================================
        // BASIC VALIDATION
        // ==================================

        if (!usn || !name) {

            showMessage(
                "⚠️ Please enter your USN and name.",
                "error"
            );

            return;

        }


        // ==================================
        // SHOW LOADING
        // ==================================

        showMessage(
            "⏳ Logging you in...",
            "loading"
        );


        try {

            const response =
                await fetch(
                    "/api/students/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            usn: usn,

                            name: name

                        })

                    }
                );


            const data =
                await response.json();


            // ==================================
            // LOGIN FAILED
            // ==================================

            if (!response.ok) {

                showMessage(
                    "❌ " +
                    (
                        data.message ||
                        "Invalid USN or Student Name"
                    ),
                    "error"
                );

                return;

            }


            // ==================================
            // SAVE STUDENT LOGIN
            // ==================================

            localStorage.setItem(
                "student",
                JSON.stringify(data.student)
            );


            // ==================================
            // SUCCESS
            // ==================================

            showMessage(
                "✅ Login successful! Opening dashboard...",
                "success"
            );


            // ==================================
            // OPEN DASHBOARD
            // ==================================

            setTimeout(
                function () {

                    window.location.href =
                        "student-dashboard.html";

                },
                800
            );


        } catch (error) {

            console.error(
                "Student login error:",
                error
            );


            showMessage(
                "❌ Cannot connect to server. Make sure the backend is running.",
                "error"
            );

        }

    }
);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    studentLoginMessage.textContent =
        message;

    studentLoginMessage.className =
        "student-login-message " +
        type;

}


// ==========================================
// TEACHER LOGIN
// ==========================================

function goToTeacherLogin() {

    window.location.href =
        "teacher-login.html";

}