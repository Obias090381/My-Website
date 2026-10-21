import { useState } from "react";
import { readApiResponse } from "../utils/api";

export default function Registration() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");

const handleSubmit = async (event) => {
event.preventDefault();
setMessage("Sending...");

try {
const response = await fetch("/api/register", {
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

const result = await readApiResponse(response);

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