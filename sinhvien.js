const mongoose = require('mongoose');

const sinhvien = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String, required: true },
    image: { type: String, required: true }
});

const SV = mongoose.model('Sinhvien', sinhvien);

module.exports = SV;