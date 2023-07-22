const route = require("express").Router();
const db = require('../firebase/db')
const admin = require("firebase-admin");
const phThresHold = 6, moistureThresHold = 6;

route.get("/week", async (req, res) => {
    const soilRef = db.collection("soil");

    // Calculate the start of the week (Monday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so adjust to 6
    const startOfCurrentWeek = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - daysSinceMonday,
        0, // Set the time to midnight
        0,
        0,
        0
    );
    const startOfCurrentWeekTimestamp = admin.firestore.Timestamp.fromDate(startOfCurrentWeek);

    // Perform the query for data within the week
    const response = await soilRef
        .where("time", ">=", startOfCurrentWeekTimestamp)
        .where("time", "<=", admin.firestore.Timestamp.now())
        .orderBy("time", "desc")
        .get();

    // Create an object to store the latest documents for each date
    const latestData = {};

    response.forEach((doc) => {
        const data = doc.data();
        const dateKey = new Date(data.time._seconds * 1000).toDateString();

        // Check if we have a document for this date already
        // If not, or if the current document has a more recent time, update the latestData object
        if (!latestData[dateKey] || data.time._seconds > latestData[dateKey].time._seconds) {
            latestData[dateKey] = {
                id: doc.id,
                PH: data.PH,
                moisture: data.moisture,
                time: new Date(data.time._seconds * 1000), // Convert to JavaScript Date object
                deviceId: data.deviceId,
            };
        }
    });

    // Convert the latestData object into an array of the latest documents
    const dateData = Object.values(latestData);

    return res.status(200).json({ data: dateData });
});

route.get('/ph/:id', async (req, res) => {
    try {
        // Use the document ID to get a reference to the specific document
        const soilRef = db.collection("soil");
        const docRef = soilRef.doc(req.params.id);
        const docSnapshot = await docRef.get();

        // Check if the document exists
        if (!docSnapshot.exists) {
            return res.status(404).json({ error: "Document not found." });
        }

        // Access the data within the document snapshot using the .data() method
        const documentData = docSnapshot.data();
        const ph = documentData.PH, moisture = documentData.moisture;
        let phStatus
        let moistureStatus
        if (ph > phThresHold) {
            await docRef.update({ phStatus: "danger" });
            phStatus = 'danger'
        }
        else if (ph === phThresHold) {
            await docRef.update({ phStatus: "normal" });
            phStatus = 'normal'
        }
        else {
            await docRef.update({ phStatus: "weak" });
            phStatus = 'weak'
        }
        if (moisture > moistureThresHold) {
            await docRef.update({ moistureStatus: "danger" });
            moistureStatus = "danger"
        }
        else if (moisture === phThresHold) {
            await docRef.update({ moistureStatus: "normal" });
            moistureStatus = "normal"
        }
        else {
            await docRef.update({ moistureStatus: "weak" });
            moistureStatus = "weak"
        }

        return res.status(200).json({
            data: {
                PH: ph,
                moisture: moisture,
                phStatus: phStatus,
                moistureStatus: moistureStatus
            }
        });
    } catch (error) {
        console.error("Error getting document:", error);
        return res.status(500).json({ error: "Error getting document." });
    }

})
module.exports = route;