const { Router } = require('express');
const router = Router();

const admin = require('firebase-admin');

const db = admin.firestore();

const campaigns = 'campaigns';
const tokens = 'tokens';

const fcmTokens = 'fcmTokens-dev';

router.get('/apidev/campaigns/:tracker_id/tokens', async(req, res) => {

    const apikey = req.header('Authorization')
    const query = db.collection(fcmTokens)
        .doc(apikey)
    const querySnapshot = await query.get()

    if (!querySnapshot.exists) {
        return res.status(500).json({
            fcmReceived: apikey,
            status: 'Not found'
        })
    }

    try {

        const trackerId = req.params.tracker_id

        const query = db.collection(campaigns)
            .doc(trackerId)
            .collection(tokens)
            .orderBy('tokenNumber', 'desc')
            .limit(4)
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs

        const array = docs.map(doc => {

            const data = doc.data()
            const objetives = data.objetives
            
            return {
                id: doc.id,
                dateToken: data.dateToken,
                descriptionToken: data.descriptionToken,
                image: data.image,
                tokenName: data.tokenName,
                tokenNumber: data.tokenNumber,
                objetives: objetives !== undefined ? objetives : []
            }
        })

        return res.status(200).json(array)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router;