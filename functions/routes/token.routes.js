const { Router } = require("express");
const router = Router();

const admin = require("firebase-admin");
const db = admin.firestore();

const fcmTokens = 'fcmTokens';

router.post('/api2/new_token', async (req, res) => {
    const token = req.body.token;
    try {
        await db.collection(fcmTokens)
            .doc(token)
            .create({
                active: true
            })
        return res.status(200).json({status: true})
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router
