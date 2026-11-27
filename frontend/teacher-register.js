document.getElementById("teacherRegisterForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("teacherName").value;
    const teacherId = document.getElementById("newTeacherUserId").value;
    const password = document.getElementById("newTeacherPassword").value;
    const confirmPassword = document.getElementById("confirmTeacherPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("/api/teachers/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                teacherId: teacherId,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Teacher account created successfully!");

            window.location.href = "teacher-login.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        alert("Cannot connect to server!");
        console.error(error);
    }
});