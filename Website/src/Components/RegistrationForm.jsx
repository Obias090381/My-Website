import { useState } from "react";

function RegistrationForm() {
const [formData, setFormData] = useState({
name: "",
email: "",
});

const [message, setMessage] = useState("");
const [error, setError] = useState("");

function handleChange(event) {
setFormData({
...formData,
[event.target.name]: event.target.value
});
}

async function handleSubmit(event) {
event.preventDefault();

setMessage("");
setError("");

try {
const response = await fetch("http://localhost:5000/api/register", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
 body: JSON.stringify({
    name: formData.name,
    email: formData.email
})
});

const data = await response.json();

if (!response.ok) {
setError(data.error || "Registration failed");
return;
}

setMessage(data.message);

setFormData({
name: "",
email: ""
});
} catch (error) {
setError("Could not connect to the server");
}
}

return (
<div>
<h2>Registration</h2>

<form onSubmit={handleSubmit}>
<div>
<label>Name</label>
<br />
<input
type="text"
name="name"
value={formData.name}
onChange={handleChange}
required
/>
</div>

<br />

<div>
<label>Email</label>
<br />
<input
type="email"
name="email"
value={formData.email}
onChange={handleChange}
required
/>
</div>

<br />

<button type="submit">Register</button>
</form>

{message && <p style={{ color: "green" }}>{message}</p>}
{error && <p style={{ color: "red" }}>{error}</p>}
</div>
);
}

export default RegistrationForm;