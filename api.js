const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const multer = require('multer');
const formData = require('form-data');

app.use(express.json());
app.use(cors());

// Create a multer instance with a storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/processImage', upload.fields([{ name: 'image_file' }, { name: 'mask_file' }]), async (req, res) => {
  try {
    console.log('Received POST request with data:');

    // Check if both image and mask files are provided
    if (!req.files.image_file || !req.files.mask_file) {
      return res.status(400).json({ error: 'Missing image or mask file' });
    }

    // Extract image and mask data from the request
    const imageFileData = req.files.image_file[0].buffer;
    const maskFileData = req.files.mask_file[0].buffer;

    const formDataToSend = new formData();
    formDataToSend.append('sync', '1');
    formDataToSend.append('image_file', imageFileData, { filename: 'image.jpg' });
    formDataToSend.append('mask_file', maskFileData, { filename: 'mask.jpg' });

    const apiUrl = 'https://techhk.aoscdn.com/api/tasks/visual/inpaint';
    const apiKey = 'wxcsa64drefid605j';

    // Send the FormData to the API
    const response = await axios.post(apiUrl, formDataToSend, {
      headers: {
        ...formDataToSend.getHeaders(),
        'X-API-KEY': apiKey,
      },
    });

    if (response.status === 200) {
      const responseData = response.data;

      res.json(responseData);
    } else {
      res.status(response.status).send('API request failed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
