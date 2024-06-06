const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { generateKeyPair, createSign } = require('crypto');
const mongoose = require('mongoose');
const path = require('path');

// MongoDB connection
const cloudDB = 'mongodb+srv://vigocharlesmc:qIwYJ5V0lpKVutlz@cluster0.5esntvv.mongodb.net/Application?retryWrites=true&w=majority&appName=Cluster0';
mongoose
    .connect(cloudDB)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB', error));

const app = express();
const upload = multer();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the schema
const applicationSchema = new mongoose.Schema({
    full_name: String,
    gender: String,
    age: String,
    year: String,
    course: String,
    id_number: String,
    signature: String,
    publicKey: String,
    privateKey: String,  // Consider removing this for security reasons
    rsaSignature: String
});

// Create the model
const Application = mongoose.model('Application', applicationSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/register', upload.none(), async (req, res) => {
    try {
        const formData = req.body;

        // Parse form data
        const { public_key, private_key, rsa_signature, ...applicationData } = formData;

        // Create a new application document
        const application = new Application({
            ...applicationData,
            publicKey: public_key,
            privateKey: private_key,
            rsaSignature: rsa_signature
        });

        // Save the document to MongoDB
        await application.save();

        res.status(200).send('Application registered successfully!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

app.get('/api/applications', async (req, res) => {
    try {
        const applications = await Application.find();
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).send('An error occurred while fetching application data.');
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
