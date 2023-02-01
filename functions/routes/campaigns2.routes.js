const { Router } = require('express');
const router = Router();

const admin = require('firebase-admin');

const db = admin.firestore();

// const campaigns = 'campaigns';
const campaigns = 'campaigns-Dev';
// const tokens = 'tokens';
const tokens = 'tokens-Dev';

router.get('/api2/campaigns/:tracker_id/tokens', async(req, res) => {

    const apikey = req.header('Authorization')
    const query = db.collection(tokens)
    const querySnapshot = await query.get()
    const docs = querySnapshot.docs
    const fcmDocument = docs[0]
    const fcmServer = fcmDocument.data().fcm

    if (apikey != fcmServer) {
        return res.status(500).json({title: 'Bad credentials'})
    }

    try {

        const trackerId = req.params.tracker_id

        const query = db.collection(campaigns)
            .doc(trackerId)
            .collection(tokens)
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs

        const array = docs.map(doc => {

            const data = doc.data()
            return {
                id: doc.id,
                dateToken: data.dateToken,
                descriptionToken: data.descriptionToken,
                image: data.image,
                tokenName: data.tokenName,
                tokenNumber: data.tokenNumber
            }
        })

        return res.status(200).json(array)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get('/api2/campaigns', async (req, res) => {
    const apikey = req.header('Authorization')
    const query = db.collection('tokens')
        .doc(apikey)
    const querySnapshot = await query.get()

    if (!querySnapshot.exists) {
        return res.status(500).json({
            fcmReceived: apikey,
            status: 'Not found'
        })
    }
    
    try {

        const query = db.collection(campaigns)
        const queryImage = db.collection('campaignsImage')
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs

        const array = await Promise.all(

            docs.map(async doc => {

                var docId = doc.id
                var docData = doc.data()

                var imageDoc = queryImage.doc(docId)
                var querySnapshotImage = await imageDoc.get()
                var imageData = querySnapshotImage.data()

                return {
                    id: doc.id,
                    nameCampaign: docData.nameCampaign,
                    versionImage: docData.versionImage,
                    versionTokens: docData.versionTokens,
                    image: imageData.image
                }
            })
        )

        return res.status(200).json(array)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get('/api2/campaigns/:tracker_version_ids', async (req, res) => {

    const apikey = req.header('Authorization')
    const query = db.collection('tokens')
    const querySnapshot = await query.get()
    const docs = querySnapshot.docs
    const fcmDocument = docs[0]
    const fcmServer = fcmDocument.data().fcm

    if (apikey != fcmServer) {
        return res.status(500).json({title: 'Bad credentials'})
    }

    try {

        const tracker_version_ids = req.params.tracker_version_ids

        const trackerVersionIdList = tracker_version_ids.split('_')
        const trackerVersionMap = {}

        trackerVersionIdList.forEach(trackerVersion => {

            const trackerVersionPair = trackerVersion.split(':')
            trackerVersionMap[trackerVersionPair[0]] = trackerVersionPair[1]
        })

        const query = db.collection(campaigns)
        const queryImage = db.collection('campaignsImage')
        const querySnapshot = await query.get()
        const docs = querySnapshot.docs

        const array = await Promise.all(

            docs.map(async doc => {

                var docId = doc.id
                var docData = doc.data()

                if (docId in trackerVersionMap) {

                    const versionTokens = docData.versionTokens
                    const requestVersionToken = trackerVersionMap[docId]

                    if (versionTokens > parseInt(requestVersionToken)) {

                        var imageDoc = queryImage.doc(docId)
                        var querySnapshotImage = await imageDoc.get()
                        var imageData = querySnapshotImage.data()

                        return {
                            id: doc.id,
                            nameCampaign: docData.nameCampaign,
                            versionImage: docData.versionImage,
                            versionTokens: versionTokens,
                            image: imageData.image,
                            needUpdate: true
                        }
                    } else {

                        return {
                            id: doc.id,
                            nameCampaign: docData.nameCampaign,
                            versionImage: docData.versionImage,
                            versionTokens: versionTokens
                        }
                    }
                } else {

                    return {
                        id: doc.id,
                        nameCampaign: docData.nameCampaign,
                        versionImage: docData.versionImage,
                        versionTokens: docData.versionTokens
                    }
                }
            })
        )

        return res.status(200).json(array)
    } catch (error) {
        return res.status(500).send(error)
    }
});

module.exports = router;