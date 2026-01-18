const axios = require('axios');

async function testRegister() {
    try {
        console.log("Testing POST http://localhost:5000/api/v1/auth/register");
        const payload = {
            username: "testuser_" + Date.now(),
            email: "test_" + Date.now() + "@example.com",
            password: "password123"
        };
        console.log("Payload:", payload);

        const response = await axios.post('http://localhost:5000/api/v1/auth/register', payload);
        console.log("SUCCESS:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("FAILURE:", error.response.status, error.response.data);
        } else {
            console.error("FAILURE:", error.message);
        }
    }
}

testRegister();
