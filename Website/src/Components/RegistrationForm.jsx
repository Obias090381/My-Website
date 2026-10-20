import { useState } from "react";

export default function Registration() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");

const handleSubmit = async (event) => {
event.preventDefault();

const user = {
    name,
    email,
    password
};

console.log("Sending:", user);

try {
const response = await fetch("http://localhost:5000/api/register", {
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

alert(result.message || "Registration successful");

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
value={name}
onChange={(event) => setName(event.target.value)}
required
/>

<input
type="email"
value={email}
onChange={(event) => setEmail(event.target.value)}
required
/>

<input
type="password"
value={password}
onChange={(event) => setPassword(event.target.value)}
required
/>

<button type="submit">Register</button>

<p>{message}</p>
</form>
);
}
