const { Router } = require('express');
const router = Router();


const userController = require('../controllers/userController');

const multer = require("multer");




router.post('/register', userController.register);
router.post('/auth', userController.auth);

router.get('/emailExists/:email', userController.emailExist);
router.get('/useremail/:id_property', userController.getEmail);

router.post('/update/:id_user', userController.updateProfile);
router.post('/updatePassword/:id_user', userController.updatePassword);
router.post('/delete', userController.delete);
router.post('/deleteTenant/:id_property', userController.deleteTenant)


const storage = multer.diskStorage({
    destination: "public/owners",
    filename: (_req, file, cb) => {
        const ext = file.originalname.slice(
            file.originalname.lastIndexOf('.')
        );
        cb(null, new Date().valueOf() + ext); // cb stands for call back
    }
})

const upload = multer({ storage }).single('photo_profile');

router.post('/uploadPhotoProfile', upload, userController.uploadPhotoProfile);




module.exports = router;