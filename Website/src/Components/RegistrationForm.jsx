import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Registration() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");

const handleSubmit = async (event) => {
event.preventDefault();
setMessage("Sending...");

try {
const response = await fetch(`${API_URL}/api/register`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
name: name,
email: email,
password: password
})
});

const result = await response.json();

if (!response.ok) {
throw new Error(result.message || "Registration failed");
}

setMessage("Saved successfully!");
setName("");
setEmail("");
setPassword("");

console.log("Server response:", result);
} catch (error) {
console.error("Error:", error);
setMessage(`Error: ${error.message}`);
}
};

return (
<form onSubmit={handleSubmit}>
<h2>Registration</h2>

<input
type="text"
placeholder="Enter your name"
value={name}
onChange={(event) => setName(event.target.value)}
required
/>

<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(event) => setEmail(event.target.value)}
required
/>

<input
type="password"
placeholder="Create a password (at least 8 characters)"
value={password}
onChange={(event) => setPassword(event.target.value)}
autoComplete="new-password"
minLength={8}
required
/>

<button type="submit">Register</button>

<p>{message}</p>
</form>
);
}