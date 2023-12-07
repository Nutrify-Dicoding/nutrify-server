const { tokenReturned } = require('../middleware/token');
const Tracking = require('../models/tracking');
const { findByDate, totalNutri } = require('../service');
const Food = require('../models/food');

const addTracking = async (request, response) => {
  const { data } = tokenReturned(request, response);
  const userId = data._id;
  let { food } = request.body;
  try {
    const trackExist = await Tracking.findOne({ user: userId });
    const tanggal = new Date();
    let today = tanggal.toLocaleDateString('fr-CA');
    let time = new Date().toLocaleTimeString();

    const dataFood = await Food.findById({ _id: food.foodId });
    const tracking = {
      date: today,
      food: { ...food, dataFood },
    };

    console.log(dataFood);

    if (trackExist) {
      const trackingIndex = findByDate(trackExist.tracking, today);

      if (trackingIndex > -1) {
        // trackExist.tracking[trackingIndex].totCal += totCal
        // trackExist.tracking[trackingIndex].totCarbon += totCarbon
        // trackExist.food.push({ ...food, dataFood });

        await trackExist.save();
      } else {
        trackExist.tracking.push(tracking);
        await trackExist.save();
      }

      response.send({
        message: 'tracking added successfully',
        tracking,
      });
    } else {
      const newTrack = {
        user: userId,
        tracking: [tracking],
      };
      const dataSaved = new Tracking(newTrack);
      await dataSaved.save();
      response.send({
        message: 'tracking added successfully',
        newTrack,
      });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
};

const getTrackingToday = async (request, response) => {
  const { data } = tokenReturned(request, response);
  const userId = data._id;
  let today = new Date();
  today = today.toLocaleDateString('fr-CA');
  let todayTrack = null;
  try {
    const tracking = await Tracking.findOne({
      user: userId,
    }).populate({
      path: 'tracking',
      populate: {
        path: 'food',
        model: 'foodId',
      },
    });
    if (tracking) {
      const todayTracking = findByDate(tracking.tracking, today);

      if (todayTracking > -1) {
        todayTrack = tracking.tracking[todayTracking];
      }

      const { totCarb, totProtein, totFat, totCal, totCarbon } =
        totalNutri(todayTrack);

      return response.send({
        _id: tracking._id,
        user: tracking.user,
        tracking: todayTrack,
        totCarb: totCarb,
        totProtein: totProtein,
        totFat: totFat,
        totCal: totCal,
        totCarbon: totCarbon,
      });
    } else {
      return response.send(null);
    }
  } catch (error) {
    return response.status(500).send({ error: error.message });
  }
};

const getTrackingByDate = async (req, res) => {
  const { data } = tokenReturned(req, res);
  const userId = data._id;

  let { date } = req.body;
  let dateTrack = null;
  try {
    // throw err when date not found
    if (!date) {
      return res
        .status(400)
        .send({ message: 'please choose the date !' });
    }
    // get data tracking by user
    const tracking = await Tracking.findOne({
      user: userId,
    }).populate({
      path: 'tracking',
      populate: {
        path: 'food',
        populate: 'foodId',
      },
    });

    // handle res when tracking null
    if (tracking === null) {
      return res.status(500).json({ message: 'tracking not found' });
    }

    // find data tracking by date

    const dateTracking = findByDate(tracking.tracking, date);
    if (dateTracking < 0) {
      return res.status(500).json({ message: 'tracking not found' });
    }

    if (dateTracking > -1) {
      dateTrack = tracking.tracking[dateTracking];
    }
    const result = totalNutri(dateTrack);

    return res.status(200).json({
      message: 'success',
      body: {
        _id: tracking._id,
        user: tracking.user,
        tracking: dateTrack,
        result,
      },
    });

    //
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = { addTracking, getTrackingToday, getTrackingByDate };
