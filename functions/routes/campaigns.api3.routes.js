const { Router } = require('express');
const router = Router();

const admin = require('firebase-admin');

const db = admin.firestore();

const campaigns = 'campaigns';
const tokens = 'tokens';

const fcmTokens = 'fcmTokens-3';

router.get('/api3/campaigns/:tracker_id/tokens', async(req, res) => {

    try {

        var versionTokens = 0
        var version_tokens = req.query.version_tokens
        if (version_tokens !== '') {
            versionTokens = parseInt(req.query.version_tokens)
            if (Number.isNaN(version_tokens)) {
                return res.status(200).json({status: false})
            }
        }

        const trackerId = req.params.tracker_id

        const queryCampaign = db.collection(campaigns)
            .doc(trackerId)
        const snapshotCampaign = await queryCampaign.get()
        
        var updateSwaps = false
        
        if (snapshotCampaign.exists) {
            const data = snapshotCampaign.data()
            versionTokens = data.versionTokens

            updateSwaps = versionTokens > version_tokens
        } else {
            updateSwaps = false
        }

        if (updateSwaps) {

            const query = db.collection(campaigns)
                .doc(trackerId)
                .collection(tokens)
                .orderBy('tokenNumber', 'desc')
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

            return res.status(200).json({
                status: true,
                versionTokens: versionTokens,
                array: array
            })
        } else {
            return res.status(200).json({
                status: false
            })
        }
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router;
