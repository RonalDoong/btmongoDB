
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Sinhvien = require('./model/sinhvien');

const methodOverride = require('method-override');

const app = express();

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));



// Thiết lập lưu trữ file ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Kết nối tới MongoDB
mongoose.connect('mongodb://localhost:27017/sinhvien', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// API để lưu sản phẩm vào MongoDB
app.post('/add_sv', upload.single('image'), async function (req, res) {
    const sv = new Sinhvien({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        color: req.body.color,
        image: req.file.filename
    });
    try {
        await sv.save();
        console.log('Product saved to MongoDB');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

// Route để hiển thị danh sách sản phẩm
app.get('/', function (req, res) {
    Sinhvien.find({})
        .then(sinhvien => {
            res.render('index', { sinhvien: sinhvien });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal server error');
        });
});

// Xóa sản phẩm bằng phương thức DELETE
app.delete('/sv/:id', function (req, res) {
    const id = req.params.id;
    Sinhvien.findByIdAndRemove(id)
        .then(() => {
            console.log(`sv ${id} deleted`);
            res.sendStatus(204);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal server error');
        });
});

// Định tuyến để cập nhật thông tin sinh viên
app.put('/update_sv/:id',upload.single('image'), async function (req, res) {
    const id = req.params.id;
    try {
      let sv = await Sinhvien.findById(id);
      if (!sv) {
        res.status(404).send('Không tìm thấy sinh viên');
        return;
      }
      sv.name = req.body.name;
      sv.price = req.body.price;
      sv.quantity = req.body.quantity;
      sv.color = req.body.color;
      if (req.file) {
        sv.image = req.file.filename;
      }
      await sv.save();
      console.log(`Sinh viên ${id} đã được cập nhật`);
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi khi cập nhật sinh viên');
    }
  });


app.listen(3000, function () {
    console.log('Server đang chạy trên cổng 3000');
});