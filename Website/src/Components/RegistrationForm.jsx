import { useState } from "react";

function RegistrationForm() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");

const handleSubmit = async (event) => {
event.preventDefault();
setMessage("");

try {
const response = await fetch("http://localhost:5173/api/register", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
name,
email
})
});

const result = await response.json();

if (!response.ok) {
throw new Error(result.message || "Failed to save information.");
}

setMessage("Information saved successfully.");
setName("");
setEmail("");
} catch (error) {
console.error("Registration error:", error);
setMessage(`Error: ${error.message}`);
}
};

return (
<form onSubmit={handleSubmit}>
<h2>Register</h2>

<label htmlFor="name">Name</label>
<input
id="name"
name="name"
type="text"
value={name}
onChange={(event) => setName(event.target.value)}
required
/>

<label htmlFor="email">Email</label>
<input
id="email"
name="email"
type="email"
value={email}
onChange={(event) => setEmail(event.target.value)}
required
/>

<button type="submit">Submit</button>

{message && <p>{message}</p>}
</form>
);
}

export default RegistrationForm;