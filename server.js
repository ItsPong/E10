const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Koneksi ke MongoDB
mongoose.connect('mongodb://user-g:g-for-goodluck@db.nafkhanzam.com/pweb-g', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Connection error", error));

// Schema dan Model MongoDB
const linkSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    link: { type: String, required: true },
    clicks: { type: Number, default: 0 }
});

const Link = mongoose.model('Link', linkSchema);

// Endpoint untuk membuat short URL baru
app.post('/', async (req, res) => {
    const { slug, link } = req.body;
    try {
        await Link.create({ slug, link });
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ error: 'Slug already exists or bad request' });
    }
});

// Endpoint untuk mengubah link dari slug yang sudah ada
app.put('/:slug', async (req, res) => {
    const { slug } = req.params;
    const { link } = req.body;
    try {
        await Link.findOneAndUpdate({ slug }, { link });
        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: 'Slug not found' });
    }
});

// Endpoint untuk mengakses short URL link
app.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    const linkDoc = await Link.findOne({ slug });
    if (linkDoc) {
        linkDoc.clicks += 1;
        await linkDoc.save();
        res.redirect(302, linkDoc.link);
    } else {
        res.status(404).send('<h1>Not Found</h1>');
    }
});

// Endpoint untuk menghapus short URL link
app.delete('/:slug', async (req, res) => {
    const { slug } = req.params;
    await Link.findOneAndDelete({ slug });
    res.status(204).end();
});

// Endpoint untuk melihat top 10 links berdasarkan jumlah clicks
app.get('/', async (req, res) => {
    const topLinks = await Link.find().sort({ clicks: -1 }).limit(10);
    res.status(200).json(topLinks);
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
