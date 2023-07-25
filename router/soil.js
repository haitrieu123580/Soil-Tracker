const route = require("express").Router();
const db = require('../firebase/db')
const admin = require("firebase-admin");
const phThresHold = 6, moistureThresHold = 6;
const soilRef = db.collection("soil");
const solutionRef = db.collection("solution")
route.get('/fake-data', async (req, res) => {
  try {
    // Loop to create 10 documents
    for (let i = 1; i <= 10; i++) {
      // Replace the following properties with the actual data you want to add to each document
      const data = {
        PH: 7.0 + Math.random() * 3.0, // Example: random PH value between 7.0 and 10.0
        moisture: 7.0 + Math.random() * 3.0, // Example: random moisture value between 0 and 100
        time: admin.firestore.Timestamp.now(), // Current timestamp
      };
      await soilRef.doc().set(data);
    }

    return res.json({ message: "10 documents created successfully." });
  } catch (error) {
    console.log(error);
  }
})

// Get PH values of the current week (Monday to the current day)
route.get("/week", async (req, res) => {
  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfCurrentWeek = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - daysSinceMonday,
    0, 0, 0, 0
  );
  const startOfCurrentWeekTimestamp = admin.firestore.Timestamp.fromDate(startOfCurrentWeek);

  try {
    const response = await soilRef
      .where("time", ">=", startOfCurrentWeekTimestamp)
      .orderBy("time", "desc")
      .get();

    const latestData = {};

    response.forEach((doc) => {
      const data = doc.data();
      const dateKey = new Date(data.time._seconds * 1000).toDateString();

      if (!latestData[dateKey] || data.time._seconds > latestData[dateKey].time._seconds) {
        latestData[dateKey] = {
          id: doc.id,
          PH: data.PH,
          moisture: data.moisture,
          time: new Date(data.time._seconds * 1000),
          deviceId: data.deviceId,
        };
      }
    });

    const dateData = Object.values(latestData);

    return res.status(200).json({ data: dateData });
  } catch (error) {
    console.error("Error getting data:", error);
    return res.status(500).json({ error: "Error retrieving data." });
  }
});

// Get PH and moisture values of the current month
route.get("/month", async (req, res) => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfCurrentMonthTimestamp = admin.firestore.Timestamp.fromDate(firstDayOfMonth);
  const endOfCurrentMonthTimestamp = admin.firestore.Timestamp.fromDate(lastDayOfMonth);

  try {
    const response = await soilRef
      .where("time", ">=", startOfCurrentMonthTimestamp)
      .where("time", "<=", endOfCurrentMonthTimestamp)
      .orderBy("time", "desc")
      .get();

    const latestData = {};

    response.forEach((doc) => {
      const data = doc.data();
      const dateKey = new Date(data.time._seconds * 1000).toDateString();

      if (!latestData[dateKey] || data.time._seconds > latestData[dateKey].time._seconds) {
        latestData[dateKey] = {
          id: doc.id,
          PH: data.PH,
          moisture: data.moisture,
          time: new Date(data.time._seconds * 1000),
          deviceId: data.deviceId,
        };
      }
    });

    const dateData = Object.values(latestData);

    return res.status(200).json({ data: dateData });
  } catch (error) {
    console.error("Error getting data:", error);
    return res.status(500).json({ error: "Error retrieving data." });
  }
});


route.get('/:id', async (req, res) => {
  try {
    // Use the document ID to get a reference to the specific document
    const docRef = soilRef.doc(req.params.id);
    const docSnapshot = await docRef.get();

    // Check if the document exists
    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Document not found." });
    }

    // Access the data within the document snapshot using the .data() method
    const documentData = docSnapshot.data();
    const ph = documentData.PH;
    const moisture = documentData.moisture;
    let phStatus;
    let moistureStatus;

    if (ph > phThresHold) {
      await docRef.update({ phStatus: "danger" });
      phStatus = "danger";
    } else if (ph === phThresHold) {
      await docRef.update({ phStatus: "normal" });
      phStatus = "normal";
    } else {
      await docRef.update({ phStatus: "weak" });
      phStatus = "weak";
    }

    if (moisture > moistureThresHold) {
      await docRef.update({ moistureStatus: "danger" });
      moistureStatus = "danger";
    } else if (moisture === moistureThresHold) {
      await docRef.update({ moistureStatus: "normal" });
      moistureStatus = "normal";
    } else {
      await docRef.update({ moistureStatus: "weak" });
      moistureStatus = "weak";
    }

    // Get solution
    const phSolutionSnapshot = await solutionRef
      .where('type', '==', 'ph')
      .where("status", '==', phStatus)
      .get();
    const phSolution = phSolutionSnapshot.docs.map(doc => doc.data());

    const moistureSolutionSnapshot = await solutionRef
      .where('type', '==', 'moisture')
      .where("status", '==', moistureStatus)
      .get();
    const moistureSolution = moistureSolutionSnapshot.docs.map(doc => doc.data());
    //     // Get product IDs for phSolution
    // const phProductRefs = phSolution[0]?.products || []; // Get the product references from the first solution (if it exists)
    // const phProductIDs = phProductRefs.map(productRef => productRef.id);
     return res.status(200).json({
      data: {
        soil: {
          PH: ph,
          moisture: moisture,
          phStatus: phStatus,
          moistureStatus: moistureStatus
        },
        solution: {
          phSolution: phSolution,
          moistureSolution: moistureSolution
        }
      }
    });
  } catch (error) {
    console.error("Error getting document:", error);
    return res.status(500).json({ error: "Error getting document." });
  }
});

module.exports = route;